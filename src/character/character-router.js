const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const CharacterService = require("./charcter-service");
const { getCharacterValidationError } = require("./character-validator");

const { requireAuth } = require("../middleware/jwt-auth");

const CharacterRouter = express.Router();
const bodyParser = express.json();

const SerializeCharacter = (character) => ({
  name: xss(character.name),
});

CharacterRouter.route("/")

  .get(requireAuth, (req, res, next) => {
    console.log({ user: req.user });
    CharacterService.getCampaignById(req.app.get("db"), req.user.id)
      .then((character) => {
        res.json(character.map(SerializeCharacter));
      })
      .catch(next);
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const {
      campaign_id,
      user_id,
      name,
      race,
      characterClass,
      level,
      additionalInfo,
    } = req.body;
    const newCharacter = {
      campaign_id,
      user_id,
      name,
      race,
      characterClass,
      level,
      additionalInfo,
    };

    for (const field of ["name"]) {
      if (!newCharacter[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    const error = getCharacterValidationError(newCharacter);

    if (error) return res.status(400).send(error);

    CharacterService.insertCharacter(req.app.get("db"), newCharacter)
      .then((character) => {
        logger.info(`character with id ${character.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${character.id}`))
          .json(SerializeCharacter(character));
      })
      .catch(next);
  });

module.exports = CharacterRouter;
