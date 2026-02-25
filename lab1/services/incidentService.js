const pool = require("../db");
const incidentRepository = require("../repositories/incidentRepository");
const heroRepository = require("../repositories/heroRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  location: row.location,
  level: row.level,
  status: row.status,
  heroId: row.hero_id,
});

const findAll = async (filters) => {
  const rows = await incidentRepository.findAll(filters);
  return rows.map(toDTO);
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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if incident exists (pass the client to stay in transaction)
    const incident = await incidentRepository.findById(incidentId, client);
    if (!incident) {
      throw new AppError(
        404,
        "not-found",
        "Incident Not Found",
        `No incident with ID ${incidentId}`,
      );
    }

    // Business Rule: Incident must be open
    if (incident.status !== "open") {
      throw new AppError(
        409,
        "conflict",
        "Incident Closed",
        "Cannot assign a hero to a resolved incident.",
      );
    }

    // Check if hero exists
    const hero = await heroRepository.findById(heroId, client);
    if (!hero) {
      throw new AppError(
        404,
        "not-found",
        "Hero Not Found",
        `No hero with ID ${heroId}`,
      );
    }

    // Business Rule: Hero must be available
    if (hero.status !== "available") {
      throw new AppError(
        409,
        "conflict",
        "Hero Unavailable",
        "This hero is currently busy.",
      );
    }

    // Business Rule: Critical incidents require specific powers
    if (incident.level === "critical") {
      if (hero.power !== "flight" && hero.power !== "strength") {
        throw new AppError(
          403,
          "forbidden",
          "Insufficient Power",
          "Critical incidents require flight or strength.",
        );
      }
    }

    // Execute updates
    await incidentRepository.updateHeroId(incidentId, heroId, client);
    await heroRepository.updateStatus(heroId, "busy", client);

    await client.query("COMMIT");

    // Return the updated incident
    const updatedIncident = await incidentRepository.findById(
      incidentId,
      client,
    );
    return toDTO(updatedIncident);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const resolve = async (incidentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const incident = await incidentRepository.findById(incidentId, client);
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

    // Update incident to resolved
    await incidentRepository.updateStatus(incidentId, "resolved", client);

    // Free up the hero if one was assigned
    if (incident.hero_id) {
      await heroRepository.updateStatus(incident.hero_id, "available", client);
    }

    await client.query("COMMIT");

    const updatedIncident = await incidentRepository.findById(
      incidentId,
      client,
    );
    return toDTO(updatedIncident);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { findAll, create, assign, resolve };
