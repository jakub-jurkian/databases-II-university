const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  // Clean data
  // try/catch block to prevent the error 
  // if the tables don't exist yet during the first run.
  try {
    // Delete in order to satisfy Foreign Key constraints
    await prisma.incidentCategory.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.hero.deleteMany();
    await prisma.category.deleteMany();
    console.log("Cleanup finished.");
  } catch (error) {
    console.log("Cleanup skipped: Tables do not exist yet.");
  }

  // Create 5 Categories
  const categories = await Promise.all(
    ["flood", "fire", "robbery", "terrorism", "accident"].map((name) =>
      prisma.category.create({ data: { name } }),
    ),
  );

  // Create 20 Heroes (Faker seed: 7)
  faker.seed(7); // Ensuring deterministic data
  const heroes = [];
  for (let i = 0; i < 20; i++) {
    const hero = await prisma.hero.create({
      data: {
        name: faker.person.fullName(),
        power: faker.helpers.arrayElement([
          "flight",
          "strength",
          "telepathy",
          "speed",
          "invisibility",
        ]),
        status: "available",
      },
    });
    heroes.push(hero);
  }

  // Create 60 Incidents with 1-3 categories each
  for (let i = 0; i < 60; i++) {
    const selectedCategories = faker.helpers.arrayElements(categories, { min: 1, max: 3 });
    
    await prisma.incident.create({
      data: {
        location: faker.location.streetAddress(),
        level: faker.helpers.arrayElement(["low", "medium", "critical"]),
        // Nested write to IncidentCategory junction table
        categories: {
          create: selectedCategories.map(cat => ({
            categoryId: cat.id
          })),
        },
      },
    });
  }
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });