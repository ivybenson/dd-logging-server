const knex = require("knex");

const postService = {
  getAllPosts(knex) {
    return knex.select("*").from("posts");
  },

  getPostById(knex, id) {
    return knex.from("posts").select("*").where({ id }).first();
  },

  getPostByUser(knex, user_id) {
    return knex
      .from("posts")
      .select("*")
      .where({ user_id })
      .orderBy("created", "desc");
  },

  insertPost(knex, newPost) {
    return knex
      .insert(newPost)
      .into("posts")
      .returning("*")
      .then((rows) => rows[0]);
  },

  deletePost(knex, id) {
    return knex("posts").where({ id }).delete();
  },
  updatePost(knex, id, newPostFields) {
    return knex("posts").where({ id }).update(newPostFields);
  },
};

module.exports = postService;
