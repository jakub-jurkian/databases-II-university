
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTestIncidents(heroId) {
  const incidents = [
    { location: "Gdańsk", level: "low" },
    { location: "Gdynia", level: "critical" },
    { location: "Sopot", level: "medium" },
    { location: "Warszawa", level: "low" },
    { location: "Kraków", level: "critical" },
    { location: "Wrocław", level: "critical" },
  ];

  console.log(`Generowanie 6 incydentów dla HeroID: ${heroId}...`);

  for (const inc of incidents) {
    try {
      await prisma.incident.create({
        data: {
          location: inc.location,
          level: inc.level,
          status: "assigned",
          heroId: heroId,
          assignedAt: new Date(),
          district: "District " + inc.location[0],
        },
      });
    } catch (err) {
      console.error(`Błąd przy ID ${heroId}:`, err.message);
    }
  }
}

createTestIncidents(24)
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
