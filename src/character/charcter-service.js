const characterService = {
  getCharacternById(knex, id) {
    return knex.from("characters").select("*").where({ id }).first();
  },

  getCharacterByUser(knex, user_id) {
    return knex
      .from("characters")
      .select("*")
      .where({ user_id })
      .orderBy("created", "desc");
  },

  insertCharacter(knex, newCampaign) {
    return knex
      .insert(newCampaign)
      .into("characters")
      .returning("*")
      .then((rows) => rows[0]);
  },

  //   deleteCampaign(knex, id) {
  //     return knex("campaigns").where({ id }).delete();
  //   },
  //   updateCampaign(knex, id, newCampaignFields) {
  //     return knex("campaigns").where({ id }).update(newCampaignFields);
  //   },
};

module.exports = characterService;
