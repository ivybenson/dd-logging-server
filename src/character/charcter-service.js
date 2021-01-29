const knex = require("knex");

const CharacterService = {
  getCharacternById(knex, id) {
    return knex.from("characters").select("*").where({ id }).first();
  },

  getCharacterByUser(knex, user_id) {
    return knex.from("characters").select("*").where({ user_id });
  },

  insertCharacter(knex, newCharacter) {
    return knex
      .insert(newCharacter)
      .into("characters")
      .returning("*")
      .then((rows) => rows[0]);
  },

  updateCharacter(knex, id, newCharacterFields) {
    return knex("characters").where({ id }).update(newCharacterFields);
  },

  //   deleteCharacter(knex, id) {
  //     return knex("characters").where({ id }).delete();
  //   },
};

module.exports = CharacterService;
