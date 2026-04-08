require('dotenv').config();
const { client, heroProfiles } = require("./client");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedMango() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");

    const postgresHeroes = await prisma.hero.findMany();
    console.log(`Fetched ${postgresHeroes.length} heroes from PostgreSQL.`);

    await heroProfiles().deleteMany({});
    console.log("Cleared existing hero profiles.");

    const profilesToInsert = postgresHeroes.map((hero) => {
      const allSpecializations = [
        "Infiltration",
        "Hacking",
        "Heavy Lifting",
        "Diplomacy",
        "Medics",
      ];
      const randomSpecs =
        Math.random() > 0.3
          ? allSpecializations.sort(() => 0.5 - Math.random()).slice(0, 2)
          : []; // 30% szans na brak specjalizacji

      return {
        heroId: hero.id, // Klucz obcy do PG
        heroName: hero.name, // Denormalizacja
        power: hero.power, // Denormalizacja
        bio: `Legendary hero known as ${hero.name}. Expert in ${hero.power}.`,
        specializations: randomSpecs.length > 0 ? randomSpecs : undefined, // Może nie być pola
        recentIncidents: [], // Na starcie pusta tablica
        stats: {
          totalMissions: hero.missionsCount, // Spójność z PG!
          criticalMissions: 0,
          lastMissionAt: null,
        },
        deletedAt: null, // Soft-delete pattern
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    if (profilesToInsert.length > 0) {
      await heroProfiles().insertMany(profilesToInsert);
      console.log(
        `Successfully seeded ${profilesToInsert.length} profiles to MongoDB.`,
      );
    }
  } catch (error) {
    console.error("Error during MongoDB seeding:", error);
  } finally {
    // Zamknij połączenia
    await prisma.$disconnect();
    await client.close();
    process.exit();
  }
}

seedMango();
