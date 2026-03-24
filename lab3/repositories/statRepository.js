const { Op } = require("sequelize");
const { sequelize, Hero, Incident } = require("../models");

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
    Hero.count(),
    Incident.count(),
    Hero.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
    Hero.findAll({
      attributes: [
        "power",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["power"],
      raw: true,
    }),
    Incident.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
    Incident.findAll({
      attributes: [
        "level",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["level"],
      raw: true,
    }),
    Incident.findAll({
      attributes: ["assigned_at", "resolved_at"],
      where: {
        status: "resolved",
        assigned_at: { [Op.ne]: null },
        resolved_at: { [Op.ne]: null },
      },
      raw: true,
    }),
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
