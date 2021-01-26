require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const knex = require("knex");
const { NODE_ENV } = require("./config");
const CampaignRouter = require("./campaign/campaign-router");
const UsersRouter = require("./users/users-router");
const CharacterRouter = require("./character/character-router");
const PostRouter = require("./post/post-router");
const AuthRouter = require("./auth/auth-router");

const app = express();

app.use(
  morgan(NODE_ENV === "production" ? "tiny" : "common", {
    skip: () => NODE_ENV === "test",
  })
);
app.use(cors());
app.use(helmet());

app.use("/api/users", UsersRouter);
app.use("/api/campaign", CampaignRouter);
app.use("/api/character", CharacterRouter);
app.use("/api/post", PostRouter);
app.use("/api/auth", AuthRouter);

app.get("/", (req, res) => {
  res.send("Hello, dnd logger!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    reponse = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
