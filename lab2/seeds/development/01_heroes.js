const { faker } = require("@faker-js/faker");

exports.seed = async function (knex) {
  faker.seed(7);

  const powers = ["flight", "strength", "telepathy", "speed", "invisibility"];
  const statuses = ["available", "busy", "retired"];

  const heroes = Array.from({ length: 20 }).map(() => ({
    name: faker.person.fullName(),
    power: faker.helpers.arrayElement(powers),
    status: faker.helpers.arrayElement(statuses),
    missions_count: faker.number.int({ min: 0, max: 100 }),
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await knex("heroes").insert(heroes);
};
