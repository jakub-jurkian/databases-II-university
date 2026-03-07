/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("heroes", (table) => {
      table.integer("missions_count").defaultTo(0);
    })
    .alterTable("incidents", (table) => {
      table.string("district").nullable();
      table.timestamp("assigned_at").nullable();
      table.timestamp("resolved_at").nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("heroes", (table) => {
      table.dropColumn("missions_count");
    })
    .alterTable("incidents", (table) => {
      table.dropColumns("district", "assigned_at", "resolved_at");
    });
};
