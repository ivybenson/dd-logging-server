const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const postService = require("./post-service");
const { getPostValidationError } = require("./post-validator");

const { requireAuth } = require("../middleware/jwt-auth");

const postRouter = express.Router();
const bodyParser = express.json();

const Serializepost = (post) => ({
  name: xss(post.name),
});

postRouter
  .route("/")

  .get(requireAuth, (req, res, next) => {
    console.log({ user: req.user });
    postService
      .getpostById(req.app.get("db"), req.user.id)
      .then((post) => {
        res.json(post.map(Serializepost));
      })
      .catch(next);
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newpost = { name };

    for (const field of ["name"]) {
      if (!newpost[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    const error = getpostValidationError(newpost);

    if (error) return res.status(400).send(error);

    postService
      .insertpost(req.app.get("db"), newpost)
      .then((post) => {
        logger.info(`post with id ${post.id} created.`);
        // this is where we would call CharacterService.createCharacter(req.app.get('db'),req.user.id,post.id)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${post.id}`))
          .json(Serializepost(post));
      })
      .catch(next);
  });

module.exports = postRouter;
