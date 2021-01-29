const knex = require("knex");

const PostService = {
  getAllPosts(knex) {
    return knex.select("*").from("posts");
  },

  getPostById(knex, id) {
    return knex.from("posts").select("*").where({ id }).first();
  },

  getPostsByCharacter(knex, character_id) {
    return knex
      .from("posts")
      .select("*")
      .where({ character_id })
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

module.exports = PostService;
