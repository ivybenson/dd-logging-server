const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const CharacterService = require("./charcter-service");
const { getCharacterValidationError } = require("./character-validator");
const knex = require("knex");

const { requireAuth } = require("../middleware/jwt-auth");

const CharacterRouter = express.Router();
const bodyParser = express.json();

const SerializeCharacter = (character) => ({
  campaign_id: character.campaign_id,
  user_id: character.user_id,
  name: xss(character.name),
  race: xss(character.race),
  characterClass: xss(character.characterClass),
  level: character.level,
  additionalInfo: xss(character.additionalInfo),
});

CharacterRouter.route("/")

  .get(requireAuth, (req, res, next) => {
    CharacterService.getCharacterByUser(req.app.get("db"), req.user.id)
      .then((character) => {
        res.json({ character });
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

CharacterRouter.route("/:character_id")

  .all((req, res, next) => {
    const { character_id } = req.params;
    CharacterService.getCharacterById(req.app.get("db"), character_id)
      .then((character) => {
        if (!character) {
          logger.error(`Character with id ${character_id} not found.`);
          return res.status(404).json({
            error: { message: `Character Not Found` },
          });
        }

        res.character = character;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(SerializeCharacter(res.character));
  })

  .put(bodyParser, (req, res, next) => {
    const {
      campaign_id,
      user_id,
      name,
      race,
      characterClass,
      level,
      additionalInfo,
    } = req.body;
    const characterToUpdate = {
      campaign_id,
      user_id,
      name,
      race,
      characterClass,
      level,
      additionalInfo,
    };

    const numberOfValues = Object.values(characterToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must content either 'character_id', 'title' or 'content'`,
        },
      });
    }

    const error = getCharacterValidationError(characterToUpdate);

    if (error) return res.status(400).send(error);

    CharacterService.updateCharacter(
      req.app.get("db"),
      req.params.character_id,
      characterToUpdate
    )
      .then((updatedCharacter) => {
        res.status(200).json(updatedCharacter);
      })
      .catch(next);
  });

module.exports = CharacterRouter;
