"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("heroes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true,
      },
      power: {
        type: Sequelize.ENUM(
          "flight",
          "strength",
          "telepathy",
          "speed",
          "invisibility",
        ),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("available", "busy", "retired"),
        defaultValue: "available",
      },
      missions_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      // Timestamps (snake_case in DB, camelCase in Sequelize)
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the table
    await queryInterface.dropTable("heroes");

    // CRITICAL for Postgres: Drop the ENUM types
    // Otherwise, running migrate:undo and migrate again will fail
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_heroes_power";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_heroes_status";',
    );
  },
};
