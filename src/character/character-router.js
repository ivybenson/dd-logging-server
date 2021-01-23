const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const CampaignService = require("./campaign-service");
const { getCampaignValidationError } = require("./campaign-validator");

const { requireAuth } = require("../middleware/jwt-auth");

const CampaignRouter = express.Router();
const bodyParser = express.json();

const SerializeCharacter = (campaign) => ({
  name: xss(campaign.name),
});

CampaignRouter.route("/")

  .get(requireAuth, (req, res, next) => {
    console.log({ user: req.user });
    CampaignService.getCampaignById(req.app.get("db"), req.user.id)
      .then((campaign) => {
        res.json(campaign.map(SerializeCampaign));
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
        // this is where we would call CharacterService.createCharacter(req.app.get('db'),req.user.id,campaign.id)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${campaign.id}`))
          .json(SerializeCampaign(campaign));
      })
      .catch(next);
  });

module.exports = CampaignRouter;
