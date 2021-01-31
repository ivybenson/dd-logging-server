const knex = require("knex");

const CharacterService = {
  getCharacterById(knex, id) {
    return knex.from("characters").select("*").where({ id }).first();
  },
  getAllCharacterIDsByCampaignId(knex, campaign_id) {
    return knex.from("characters").select("id").where({ campaign_id });
  },
  getCharacterByUser(knex, user_id) {
    return knex.from("characters").select("*").where({ user_id }).first();
  },

  insertCharacter(knex, newCharacter) {
    return knex
      .insert(newCharacter)
      .into("characters")
      .returning("*")
      .then((rows) => rows[0]);
  },

  updateCharacter(knex, id, newCharacterFields) {
    return knex("characters")
      .where({ id })
      .update(newCharacterFields)
      .returning("*")
      .then((rows) => rows[0]);
  },

  //   deleteCharacter(knex, id) {
  //     return knex("characters").where({ id }).delete();
  //   },
};

module.exports = CharacterService;
