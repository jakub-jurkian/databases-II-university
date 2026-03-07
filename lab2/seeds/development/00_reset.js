/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex("incidents").del();
  await knex("heroes").del();
};
