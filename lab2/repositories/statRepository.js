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
    resolvedRows,
  ] = await Promise.all([
    db("heroes").count("* as total").first(),
    db("incidents").count("* as total").first(),
    db("heroes").select("status").count("* as count").groupBy("status"),
    db("heroes").select("power").count("* as count").groupBy("power"),
    db("incidents").select("status").count("* as count").groupBy("status"),
    db("incidents").select("level").count("* as count").groupBy("level"),
    db("incidents")
      .where("status", "resolved")
      .whereNotNull("assigned_at")
      .whereNotNull("resolved_at")
      .avg(
        db.raw(
          "EXTRACT(EPOCH FROM (resolved_at - assigned_at)) / 60 as avg_minutes",
        ),
      )
      .first(),
  ]);

  const avgResolutionMinutes =
    resolvedRows.length === 0
      ? 0
      : resolvedRows.reduce((sum, row) => {
          const assignedAt = new Date(row.assigned_at);
          const resolvedAt = new Date(row.resolved_at);
          return sum + (resolvedAt - assignedAt) / 60000;
        }, 0) / resolvedRows.length;

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
