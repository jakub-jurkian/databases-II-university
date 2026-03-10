const db = require("../db/knex");

const toCountMap = (rows, keyField) =>
  rows.reduce((acc, row) => {
    acc[row[keyField]] = Number(row.count);
    return acc;
  }, {});

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
    db("heroes").count("* as total").first(),
    db("incidents").count("* as total").first(),
    db("heroes").select("status").count("* as count").groupBy("status"),
    db("heroes").select("power").count("* as count").groupBy("power"),
    db("incidents").select("status").count("* as count").groupBy("status"),
    db("incidents").select("level").count("* as count").groupBy("level"),
    db("incidents")
      .select("assigned_at", "resolved_at")
      .where("status", "resolved")
      .whereNotNull("assigned_at")
      .whereNotNull("resolved_at"),
  ]);

  const avgResolutionMinutes =
    resolvedIncidents.length === 0
      ? 0
      : resolvedIncidents.reduce((sum, incident) => {
          const assignedAt = new Date(incident.assigned_at);
          const resolvedAt = new Date(incident.resolved_at);

          return sum + (resolvedAt - assignedAt) / 60000;
        }, 0) / resolvedIncidents.length;

  return {
    totals: {
      heroes: Number(heroesTotal.total),
      incidents: Number(incidentsTotal.total),
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
