const express = require("express");
const AuthService = require("./auth-service");
const Knex = require("knex");

const authRouter = express.Router();
const bodyParser = express.json();

authRouter
  .route("/login")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .post(bodyParser, (req, res, next) => {
    const { password, email } = req.body;
    const user = { password, email };
    for (const field of ["email", "password"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    AuthService.getUserWithEmail(knexInstance, email).then((dbUser) => {
      if (!dbUser) {
        return res.status(400).json({
          error: "Incorrect email or password",
        });
      }
      AuthService.comparePasswords(password, dbUser.password).then(
        (isMatch) => {
          if (!isMatch) {
            return res.status(400).json({
              error: "Incorrect email or password",
            });
          }
          const subject = dbUser.email;
          const payload = { user_is: dbUser.id };
          res.send({
            authToken: AuthService.createJwt(subject, payload),
          });
        }
      );
    });
  });

module.exports = authRouter;
