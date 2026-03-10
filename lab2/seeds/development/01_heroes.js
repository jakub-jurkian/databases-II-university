const { faker } = require("@faker-js/faker");

exports.seed = async function (knex) {
  faker.seed(7);

  const powers = ["flight", "strength", "telepathy", "speed", "invisibility"];
  const statuses = ["available", "busy", "retired"];

  const heroes = Array.from({ length: 20 }).map(() => {
    const createdAt = faker.date.between({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.999Z",
    });

    return {
      name: faker.person.fullName(),
      power: faker.helpers.arrayElement(powers),
      status: faker.helpers.arrayElement(statuses),
      missions_count: faker.number.int({ min: 0, max: 100 }),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });

  await knex("heroes").insert(heroes);
};
