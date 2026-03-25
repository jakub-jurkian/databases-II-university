"use strict";
const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    faker.seed(7);
    // levels - low, medium, critical

    const incidents = [
      {
        id: 1,
        location: faker.location.city(),
        district: "Manhattan",
        level: "critical",
        status: "open",
        hero_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        location: faker.location.city(),
        district: "Queens",
        level: "medium",
        status: "assigned",
        hero_id: 1, // Linked to Hero 1
        assigned_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        location: faker.location.city(),
        district: "Brooklyn",
        level: "low",
        status: "resolved",
        hero_id: 2, // Linked to Hero 2
        assigned_at: new Date(Date.now() - 86400000),
        resolved_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("incidents", incidents);

    await queryInterface.sequelize.query(
      'SELECT setval(pg_get_serial_sequence(\'incidents\', \'id\'), COALESCE((SELECT MAX(id) FROM incidents), 1), true);',
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("incidents", null, {});
  },
};
