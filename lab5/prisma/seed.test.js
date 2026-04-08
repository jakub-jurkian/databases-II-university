const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data for a clean test state
  await prisma.incidentCategory.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.category.deleteMany();

  // Create a test category
  await prisma.category.create({ data: { id: 1, name: "test-category" } });

  // Create 5 Heroes with explicit IDs and varied powers/statuses
  await prisma.hero.createMany({
    data: [
      {
        id: 1,
        name: "Hero-Flight-Avail",
        power: "flight",
        status: "available",
      },
      { id: 2, name: "Hero-Strength-Busy", power: "strength", status: "busy" },
      { id: 3, name: "Hero-Speed-Retired", power: "speed", status: "retired" },
      {
        id: 4,
        name: "Hero-Telepathy-Avail",
        power: "telepathy",
        status: "available",
      },
      {
        id: 5,
        name: "Hero-Invis-Avail",
        power: "invisibility",
        status: "available",
      },
    ],
  });

  // Create 8 Incidents with explicit IDs
  for (let i = 1; i <= 8; i++) {
    await prisma.incident.create({
      data: {
        id: i,
        location: `Test Location ${i}`,
        level: i % 2 === 0 ? "critical" : "low",
        status: i > 4 ? "assigned" : "open",
        heroId: i > 4 ? i - 4 : null, // Assign heroes 1-4 to incidents 5-8
        categories: {
          create: [{ categoryId: 1 }],
        },
      },
    });
  }
  console.log("Test seed finished successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
