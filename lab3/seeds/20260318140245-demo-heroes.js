"use strict";
const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Set seed for determinism (Requirement: faker.seed(7))
    faker.seed(7);

    const powers = ["flight", "strength", "telepathy", "speed", "invisibility"];
    const statuses = ["available", "busy", "retired"];

    const heroes = Array.from({ length: 5 }).map((_, i) => ({
      id: i + 1, // Explicit IDs for deterministic testing
      name: faker.person.fullName(),
      power: powers[i % powers.length],
      status: statuses[i % statuses.length],
      missions_count: faker.number.int({ min: 0, max: 50 }),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("heroes", heroes);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("heroes", null, {});
  },
};
