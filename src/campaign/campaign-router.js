const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const CampaignService = require("./campaign-service");
const CharacterService = require("../character/charcter-service");
const { getCampaignValidationError } = require("./campaign-validator");
const knex = require("knex");

const { requireAuth } = require("../middleware/jwt-auth");

const CampaignRouter = express.Router();
const bodyParser = express.json();

const SerializeCampaign = (campaign) => ({
  name: xss(campaign.name),
});

CampaignRouter.route("/")

  .get(requireAuth, (req, res, next) => {
    CampaignService.getCampaignById(req.app.get("db"), req.user.id)
      .then((campaign) => {
        res.json({ campaign });
      })
      .catch(next);
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newCampaign = { name };

    for (const field of ["name"]) {
      if (!newCampaign[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    const error = getCampaignValidationError(newCampaign);

    if (error) return res.status(400).send(error);

    CampaignService.insertCampaign(req.app.get("db"), newCampaign)
      .then((campaign) => {
        logger.info(`campaign with id ${campaign.id} created.`);
        createTempCharacter(req.user, campaign, req, res, next);
        /* res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${campaign.id}`))
          .json(SerializeCampaign(campaign));*/
      })
      .catch(next);
  });

function createTempCharacter(user, campaign, req, res, next) {
  // this is where we would call CharacterService.createCharacter(req.app.get('db'),req.user.id,campaign.id)
  const tempCharacter = { user_id: user.id, campaign_id: campaign.id };
  CharacterService.insertCharacter(req.app.get("db"), tempCharacter)
    .then((character) => {
      logger.info(`character with id ${character.id} created.`);
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `${character.id}`))
        .json({ character, campaign });
    })
    .catch(next);
}

CampaignRouter.route("/:campaign_id")
  .get(requireAuth, (req, res, next) => {
    CampaignService.getCampaignById(req.app.get("db"), req.params.campaign_id)
      .then((campaign) => {
        res.json({ campaign });
      })
      .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    CampaignService.getCampaignById(req.app.get("db"), req.params.campaign_id)
      .then((campaign) => {
        //res.json(campaign);
        createTempCharacter(req.user, campaign, req, res, next);
      })
      .catch(next);
  });

module.exports = CampaignRouter;
