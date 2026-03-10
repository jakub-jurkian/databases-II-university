/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clean up the data
  await knex("incidents").del();
  await knex("heroes").del();

  // Create 5 heroes
  const heroes = [
    {
      id: 1,
      name: "Skyshield",
      power: "flight",
      status: "available",
      missions_count: 10,
    },
    {
      id: 2,
      name: "Titan",
      power: "strength",
      status: "busy",
      missions_count: 5,
    },
    {
      id: 3,
      name: "Mindwave",
      power: "telepathy",
      status: "retired",
      missions_count: 50,
    },
    {
      id: 4,
      name: "Veil",
      power: "invisibility",
      status: "available",
      missions_count: 0,
    },
    {
      id: 5,
      name: "Blur",
      power: "speed",
      status: "available",
      missions_count: 3,
    },
  ];
  await knex("heroes").insert(heroes);

  // Create 8 incidents
  const incidents = [
    {
      id: 1,
      location: "ul. Długa 5",
      district: "Śródmieście",
      level: "low",
      status: "open",
      hero_id: null,
      created_at: "2026-01-01 10:00:00",
    },
    {
      id: 2,
      location: "Al. Grunwaldzka 100",
      district: "Oliwa",
      level: "medium",
      status: "assigned",
      hero_id: 2,
      created_at: "2026-01-02 12:00:00",
      assigned_at: "2026-01-02 12:30:00",
    },
    {
      id: 3,
      location: "ul. Piotrkowska 10",
      district: "Centrum",
      level: "critical",
      status: "resolved",
      hero_id: 1,
      created_at: "2026-01-03 08:00:00",
      assigned_at: "2026-01-03 08:05:00",
      resolved_at: "2026-01-03 08:15:00",
    },
    {
      id: 4,
      location: "ul. Morska 20",
      district: "Gdynia",
      level: "critical",
      status: "open",
      hero_id: null,
      created_at: "2026-01-04 15:00:00",
    },
    {
      id: 5,
      location: "ul. Wiejska 4",
      district: "Śródmieście",
      level: "medium",
      status: "open",
      hero_id: null,
      created_at: "2026-01-05 09:00:00",
    },
    {
      id: 6,
      location: "ul. Szeroka 1",
      district: "Stare Miasto",
      level: "low",
      status: "resolved",
      hero_id: 5,
      created_at: "2026-01-06 20:00:00",
      assigned_at: "2026-01-06 20:30:00",
      resolved_at: "2026-01-07 02:00:00",
    },
    {
      id: 7,
      location: "ul. Polna 15",
      district: "Wola",
      level: "critical",
      status: "assigned",
      hero_id: 1,
      created_at: "2026-01-07 11:00:00",
      assigned_at: "2026-01-07 11:08:00",
    },
    {
      id: 8,
      location: "ul. Jasna 8",
      district: "Centrum",
      level: "medium",
      status: "open",
      hero_id: null,
      created_at: "2026-01-08 14:00:00",
    },
  ];
  await knex("incidents").insert(incidents);

  await knex.raw(
    "SELECT setval('heroes_id_seq', (SELECT MAX(id) FROM heroes))",
  );
  await knex.raw(
    "SELECT setval('incidents_id_seq', (SELECT MAX(id) FROM incidents))",
  );

  // setval (set value) sets the value of the hidden counter (sequence).
  // The name 'heroes_id_seq' is the default name Postgres assigns
  // to the sequence for the 'heroes' table and the 'id' column.
};
