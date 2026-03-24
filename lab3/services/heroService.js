const heroRepository = require("../repositories/heroRepository");
const incidentRepository = require("../repositories/incidentRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status,
  missionsCount: row.missions_count,
});

const toIncidentDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.hero_id,
  assignedAt: row.assigned_at,
  resolvedAt: row.resolved_at,
});

const findAll = async (filters) => {
  const result = await heroRepository.findAll(filters);
  return {
    data: result.data.map(toDTO),
    pagination: result.pagination,
  };
};

const findById = async (id) => {
  const row = await heroRepository.findById(id);

  if (!row) {
    throw new AppError(404, "not-found", "Hero Not Found", `No hero with ID ${id}`);
  }

  return toDTO(row);
};

const create = async (data) => {
  if (!data.name || !data.power) {
    throw new AppError(
      400,
      "bad-request",
      "Missing Fields",
      "Name and power are required.",
    );
  }

  const validPowers = [
    "flight",
    "strength",
    "telepathy",
    "speed",
    "invisibility",
  ];

  if (!validPowers.includes(data.power)) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Power",
      `Power must be one of: ${validPowers.join(", ")}`,
    );
  }

  const row = await heroRepository.create(data);
  return toDTO(row);
};

const update = async (id, data) => {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.power !== undefined) payload.power = data.power;
  if (data.status !== undefined) payload.status = data.status;

  if (Object.keys(payload).length === 0) {
    throw new AppError(
      400,
      "bad-request",
      "No Fields To Update",
      "At least one field must be provided.",
    );
  }

  const validPowers = [
    "flight",
    "strength",
    "telepathy",
    "speed",
    "invisibility",
  ];

  if (payload.power !== undefined && !validPowers.includes(payload.power)) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Power",
      `Power must be one of: ${validPowers.join(", ")}`,
    );
  }

  const validStatuses = ["available", "busy", "retired"];
  if (payload.status !== undefined && !validStatuses.includes(payload.status)) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Status",
      `Status must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const row = await heroRepository.update(id, payload);

  if (!row) {
    throw new AppError(404, "not-found", "Hero Not Found", `No hero with ID ${id}`);
  }

  return toDTO(row);
};

const findIncidents = async (heroId, pagination) => {
  const hero = await heroRepository.findById(heroId);

  if (!hero) {
    throw new AppError(404, "not-found", "Hero Not Found", `No hero with ID ${heroId}`);
  }

  const result = await incidentRepository.findByHeroId(heroId, pagination);

  return {
    data: result.data.map(toIncidentDTO),
    pagination: result.pagination,
  };
};

module.exports = { findAll, findById, create, update, findIncidents };
