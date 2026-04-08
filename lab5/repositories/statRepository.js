const prisma = require("../dbClient");

/**
 * Helper to convert raw DB rows to a clean Map object
 * Prisma's $queryRaw returns an array of objects like [{ status: 'available', count: 5 }]
 */
const toCountMap = (rows, keyField) =>
  rows.reduce((acc, row) => {
    // We use BigInt conversion or Number depending on DB driver result
    acc[row[keyField]] = Number(row.count);
    return acc;
  }, {});

const getGroupedCount = (tableName, fieldName) =>
  prisma.$queryRawUnsafe(
    `SELECT ${fieldName}, COUNT(*)::int as count FROM ${tableName} GROUP BY ${fieldName}`,
  );

const getStats = async () => {
  const [
    heroesTotal,
    incidentsTotal,
    heroesByStatus,
    heroesByPower,
    incidentsByStatus,
    incidentsByLevel,
    resolvedIncidents,
  ] = await Promise.all([
    prisma.hero.count(),
    prisma.incident.count(),

    getGroupedCount("heroes", "status"),
    getGroupedCount("heroes", "power"),
    getGroupedCount("incidents", "status"),
    getGroupedCount("incidents", "level"),

    // Fetching data for average calculation
    prisma.incident.findMany({
      where: {
        status: "resolved",
        assignedAt: { not: null },
        resolvedAt: { not: null },
      },
      select: {
        assignedAt: true,
        resolvedAt: true,
      },
    }),
  ]);

  const avgResolutionMinutes =
    resolvedIncidents.length === 0
      ? 0
      : resolvedIncidents.reduce((sum, incident) => {
          const assignedAt = new Date(incident.assignedAt);
          const resolvedAt = new Date(incident.resolvedAt);

          return sum + (resolvedAt - assignedAt) / 60000;
        }, 0) / resolvedIncidents.length;

  return {
    totals: {
      heroes: Number(heroesTotal),
      incidents: Number(incidentsTotal),
    },
    heroes: {
      byStatus: toCountMap(heroesByStatus, "status"),
      byPower: toCountMap(heroesByPower, "power"),
    },
    incidents: {
      byStatus: toCountMap(incidentsByStatus, "status"),
      byLevel: toCountMap(incidentsByLevel, "level"),
      averageResolutionMinutes: Number(avgResolutionMinutes.toFixed(2)),
    },
  };
};

module.exports = { getStats };
