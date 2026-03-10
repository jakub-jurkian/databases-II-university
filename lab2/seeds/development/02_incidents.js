const { faker } = require("@faker-js/faker");

exports.seed = async function (knex) {
  faker.seed(8);

  const heroes = await knex("heroes").select("id");
  const heroIds = heroes.map((h) => h.id);

  const incidents = [];

  for (let i = 0; i < 60; i++) {
    const status = faker.helpers.arrayElement(["open", "assigned", "resolved"]);
    const createdAt = faker.date.between({
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-31T23:59:59.999Z",
    });

    const heroId =
      status === "assigned" || status === "resolved"
        ? faker.helpers.arrayElement(heroIds)
        : null;

    const assignedAt =
      status === "assigned" || status === "resolved"
        ? faker.date.soon({ days: 2, refDate: createdAt })
        : null;

    const resolvedAt =
      status === "resolved"
        ? faker.date.soon({ days: 2, refDate: assignedAt })
        : null;
    incidents.push({
      location: faker.location.streetAddress(),
      district: faker.location.county(),
      level: faker.helpers.arrayElement(["low", "medium", "critical"]),
      status: status,
      hero_id: heroId,
      created_at: createdAt,
      updated_at: createdAt,
      assigned_at: assignedAt,
      resolved_at: resolvedAt,
    });
  }

  await knex("incidents").insert(incidents);
};
