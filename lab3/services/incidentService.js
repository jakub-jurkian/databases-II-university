const { sequelize } = require("../models");
const incidentRepository = require("../repositories/incidentRepository");
const heroRepository = require("../repositories/heroRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.hero_id,
  hero: row.hero
    ? {
        id: row.hero.id,
        name: row.hero.name,
        power: row.hero.power,
        status: row.hero.status,
        missionsCount: row.hero.missions_count,
      }
    : null,
  assignedAt: row.assigned_at,
  resolvedAt: row.resolved_at,
});

const findAll = async (filters) => {
  const result = await incidentRepository.findAll(filters);
  return {
    data: result.data.map(toDTO),
    pagination: result.pagination,
  };
};

const findById = async (id) => {
  const row = await incidentRepository.findById(id);

  if (!row) {
    throw new AppError(
      404,
      "not-found",
      "Incident Not Found",
      `No incident with ID ${id}`,
    );
  }

  return toDTO(row);
};

const create = async (data) => {
  if (!data.location || !data.level) {
    throw new AppError(
      400,
      "bad-request",
      "Missing Fields",
      "Location and level are required.",
    );
  }

  const validLevels = ["low", "medium", "critical"];
  if (!validLevels.includes(data.level)) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Level",
      `Level must be one of: ${validLevels.join(", ")}`,
    );
  }

  const row = await incidentRepository.create(data);
  return toDTO(row);
};

const assign = async (incidentId, heroId) => {
  return await sequelize.transaction(async (trx) => {
    const hero = await heroRepository.findById(heroId, trx);
    if (!hero) {
      throw new AppError(404, "not-found", "Hero Not Found", `No hero with ID ${heroId}`);
    }
    if (hero.status !== "available") {
      throw new AppError(409, "conflict", "Hero Unavailable", "This hero is currently busy.");
    }

    const incident = await incidentRepository.findById(incidentId, trx);
    if (!incident) {
      throw new AppError(
        404,
        "not-found",
        "Incident Not Found",
        `No incident with ID ${incidentId}`,
      );
    }
    if (incident.status !== "open") {
      throw new AppError(
        409,
        "conflict",
        "Incident Closed",
        "Cannot assign hero to a non-open incident.",
      );
    }

    if (incident.level === "critical") {
      const allowedPowers = ["flight", "strength"];
      if (!allowedPowers.includes(hero.power)) {
        throw new AppError(
          403,
          "forbidden",
          "Insufficient Power",
          "Critical incidents require flight or strength.",
        );
      }
    }

    await heroRepository.updateStatus(heroId, "busy", trx);
    await incidentRepository.updateHeroId(incidentId, heroId, trx);
    await incidentRepository.updateStatus(incidentId, "assigned", trx);

    const updatedIncident = await incidentRepository.findById(incidentId, trx);
    return toDTO(updatedIncident);
  });
};

const resolve = async (incidentId) => {
  // const client = await pool.connect();

  // try {
  //   await client.query("BEGIN");

  //   const incident = await incidentRepository.findById(incidentId, client);
  //   if (!incident) {
  //     throw new AppError(
  //       404,
  //       "not-found",
  //       "Incident Not Found",
  //       `No incident with ID ${incidentId}`,
  //     );
  //   }

  //   if (incident.status === "resolved") {
  //     throw new AppError(
  //       409,
  //       "conflict",
  //       "Already Resolved",
  //       "This incident is already closed.",
  //     );
  //   }

  //   // Update incident to resolved
  //   await incidentRepository.updateStatus(incidentId, "resolved", client);

  //   // Free up the hero if one was assigned
  //   if (incident.hero_id) {
  //     await heroRepository.updateStatus(incident.hero_id, "available", client);
  //   }

  //   await client.query("COMMIT");

  //   const updatedIncident = await incidentRepository.findById(
  //     incidentId,
  //     client,
  //   );
  //   return toDTO(updatedIncident);
  // } catch (error) {
  //   await client.query("ROLLBACK");
  //   throw error;
  // } finally {
  //   client.release();
  // }

  return sequelize.transaction(async (trx) => {
    const incident = await incidentRepository.findById(incidentId, trx);
    if (!incident) {
      throw new AppError(
        404,
        "not-found",
        "Incident Not Found",
        `No incident with ID ${incidentId}`,
      );
    }

    if (incident.status === "resolved") {
      throw new AppError(
        409,
        "conflict",
        "Already Resolved",
        "This incident is already closed.",
      );
    }

    await incidentRepository.updateStatus(incidentId, "resolved", trx);
    if (incident.hero_id) {
      await heroRepository.updateStatus(incident.hero_id, "available", trx);
    }

    const updatedIncident = await incidentRepository.findById(incidentId, trx);
    return toDTO(updatedIncident);
  });
};

module.exports = { findAll, findById, create, assign, resolve };
