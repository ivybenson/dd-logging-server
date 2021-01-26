const knex = require("knex");

const campaignService = {
  getAllCampaigns(knex) {
    return knex.select("*").from("campaigns");
  },

  getCampaignById(knex, id) {
    return knex.from("campaigns").select("*").where({ id }).first();
  },

  getCampaignsByUser(knex, user_id) {
    return knex
      .from("campaigns")
      .select("*")
      .where({ user_id })
      .orderBy("created", "desc");
  },

  insertCampaign(knex, newCampaign) {
    return knex
      .insert(newCampaign)
      .into("campaigns")
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

module.exports = campaignService;
