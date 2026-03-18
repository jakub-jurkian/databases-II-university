"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("incidents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      level: {
        type: Sequelize.ENUM("low", "medium", "critical"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("open", "assigned", "resolved"),
        defaultValue: "open",
        allowNull: false,
      },
      // Foreign Key Definition
      hero_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Required for SET NULL to work
        references: {
          model: "heroes", // Name of the target table
          key: "id", // Key in the target table
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // CRITICAL: Requirement met
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
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
    // Drop the table first
    await queryInterface.dropTable('incidents');
    
    // Drop the custom ENUM types from Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incidents_status";');
  },
};
