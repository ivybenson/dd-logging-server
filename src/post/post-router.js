const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const PostService = require("./post-service");
const { getPostValidationError } = require("./post-validator");
const knex = require("knex");

const { requireAuth } = require("../middleware/jwt-auth");

const postRouter = express.Router();
const bodyParser = express.json();

const SerializePost = (post) => ({
  id: posts.id,
  character_id: posts.characters_id,
  title: xss(posts.title),
  content: xss(posts.content),
  completed: posts.completed,
});

postRouter
  .route("/")

  .get(requireAuth, (req, res, next) => {
    console.log({ user: req.user });
    PostService.getPostsByCharacter(req.app.get("db"), req.character.id)
      .then((posts) => {
        res.json(posts.map(SerializePost));
      })
      .catch(next);
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const { name } = req.body;
    const newPost = { name };

    for (const field of ["name"]) {
      if (!newPost[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    const error = getpostValidationError(newPost);

    if (error) return res.status(400).send(error);

    PostService.insertpost(req.app.get("db"), newPost)
      .then((post) => {
        logger.info(`post with id ${post.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${post.id}`))
          .json(SerializePost(post));
      })
      .catch(next);
  });

postRouter
  .route("/:post_id")

  .all((req, res, next) => {
    const { post_id } = req.params;
    PostService.getPostById(req.app.get("db"), post_id)
      .then((post) => {
        if (!post) {
          logger.error(`Post with id ${post_id} not found.`);
          return res.status(404).json({
            error: { message: `Post Not Found` },
          });
        }

        res.post = post;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(SerializePost(res.post));
  })

  .delete((req, res, next) => {
    const { post_id } = req.params;
    PostService.deletePost(req.app.get("db"), post_id)
      .then((numRowsAffected) => {
        logger.info(`Post with id ${post_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { character_id, title, content } = req.body;
    const postToUpdate = { character_id, title, content };

    const numberOfValues = Object.values(postToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must content either 'character_id', 'title' or 'content'`,
        },
      });
    }

    const error = getPostValidationError(postToUpdate);

    if (error) return res.status(400).send(error);

    PostService.updatePost(req.app.get("db"), req.params.post_id, postToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = postRouter;
