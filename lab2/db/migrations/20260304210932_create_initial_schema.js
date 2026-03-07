/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) { // exectues when npx knex migrate:latest - build/change db
  return knex.schema
    .createTable("heroes", (table) => {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
      table
        .enum("power", [
          "flight",
          "strength",
          "telepathy",
          "speed",
          "invisibility",
        ])
        .notNullable();
      table.enum("status", ["available", "busy", "retired"]).notNullable();
      // created_at & updated_at (Knex do it autom.)
      table.timestamps(true, true);
    })
    .createTable("incidents", (table) => {
      table.increments("id").primary();
      table.string("location").notNullable();
      table.enum("level", ["low", "medium", "critical"]).notNullable();
      table.enum("status", ["open", "assigned", "resolved"]).notNullable();

      table
        .integer("hero_id")
        .unsigned()
        .references("id")
        .inTable("heroes")
        .onDelete("SET NULL");

      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) { // rollsback what up did - npx knex migrate:rollback
  return knex.schema.dropTableIfExists("incidents").dropTableIfExists("heroes");
};
