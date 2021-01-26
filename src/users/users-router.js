const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const UsersService = require("./users-service");
const { getUsersValidationError } = require("./users-validator");
const Knex = require("knex");
const bcrypt = require("bcryptjs");
const { requireAuth } = require("../middleware/jwt-auth");

const usersRouter = express.Router();
const bodyParser = express.json();

const SerializeUser = (user) => ({
  id: user.id,
  email: xss(user.email),
  datecreated: user.datecreated,
});

usersRouter
  .route("/")

  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .get(requireAuth, (req, res) => {
    res.json(req.user);
  })
  .post(bodyParser, (req, res) => {
    const { password, email, confirmPassword } = req.body;
    const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@\$&\^&])[\S]+/;

    for (const field of ["email", "password", "confirmPassword"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    if (password.length <= 3) {
      res.status(400).json({
        error: "Password must be 4 or more characters",
      });
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      res.status(400).json({
        error:
          "Password must contain one upper case character, one lower case character, one special character and one number ",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: `Passwords do not match`,
      });
    }

    UsersService.hasUserWithEmail(knexInstance, email).then((hasUser) => {
      if (hasUser) {
        return res.status(400).json({
          error: "Email already used.",
        });
      }

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          password: hashedPassword,
        };

        return UsersService.insertUser(knexInstance, newUser).then((user) => {
          res.status(201).json(SerializeUser(user));
        });
      });
    });
  });

module.exports = usersRouter;
