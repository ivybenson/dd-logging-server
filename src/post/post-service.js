const postService = {
  getAllpost(knex) {
    return knex.select("*").from("post");
  },

  getpostaignById(knex, id) {
    return knex.from("post").select("*").where({ id }).first();
  },

  getpostByUser(knex, user_id) {
    return knex
      .from("post")
      .select("*")
      .where({ user_id })
      .orderBy("created", "desc");
  },

  insertpostaign(knex, newpostaign) {
    return knex
      .insert(newpostaign)
      .into("post")
      .returning("*")
      .then((rows) => rows[0]);
  },

  //   deletepostaign(knex, id) {
  //     return knex("post").where({ id }).delete();
  //   },
  //   updatepostaign(knex, id, newpostaignFields) {
  //     return knex("post").where({ id }).update(newpostaignFields);
  //   },
};

module.exports = postService;
