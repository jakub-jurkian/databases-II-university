const heroRepository = require("../repositories/heroRepository");
const incidentRepository = require("../repositories/incidentRepository");
const heroProfileRepository = require("../repositories/heroProfileRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status,
  missionsCount: row.missionsCount,
});

const toIncidentDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.heroId,
  assignedAt: row.assignedAt,
  resolvedAt: row.resolvedAt,
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
    throw new AppError(
      404,
      "not-found",
      "Hero Not Found",
      `No hero with ID ${id}`,
    );
  }

  return toDTO(row);
};

const create = async (data) => {
  const normalizedName = typeof data.name === "string" ? data.name.trim() : "";

  if (!normalizedName || !data.power) {
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

  try {
    const row = await heroRepository.create({
      ...data,
      name: normalizedName,
    });
    return toDTO(row);
  } catch (error) {
    if (error && error.code === "P2002") {
      throw new AppError(
        409,
        "conflict",
        "Hero Already Exists",
        "A hero with this name already exists.",
      );
    }
    throw error;
  }
};

const update = async (id, data) => {
  const payload = {};
  if (data.name !== undefined) {
    payload.name = typeof data.name === "string" ? data.name.trim() : data.name;
  }
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

  if (
    payload.name !== undefined &&
    (typeof payload.name !== "string" || payload.name.length === 0)
  ) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Name",
      "Name must be a non-empty string.",
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

  let row;
  try {
    row = await heroRepository.update(id, payload);
  } catch (error) {
    if (error && error.code === "P2002") {
      throw new AppError(
        409,
        "conflict",
        "Hero Already Exists",
        "A hero with this name already exists.",
      );
    }
    throw error;
  }

  if (!row) {
    throw new AppError(
      404,
      "not-found",
      "Hero Not Found",
      `No hero with ID ${id}`,
    );
  }

  return toDTO(row);
};

const findIncidents = async (heroId, pagination) => {
  const hero = await heroRepository.findById(heroId);

  if (!hero) {
    throw new AppError(
      404,
      "not-found",
      "Hero Not Found",
      `No hero with ID ${heroId}`,
    );
  }

  const result = await incidentRepository.findByHeroId(heroId, pagination);

  return {
    data: result.data.map(toIncidentDTO),
    pagination: result.pagination,
  };
};

const findProfileByHeroId = async (heroId) => {
  const parsedHeroId = Number(heroId);

  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "Hero ID must be a positive integer.",
    );
  }

  const profile = await heroProfileRepository.findByHeroId(parsedHeroId);
  if (!profile) {
    throw new AppError(
      404,
      "not-found",
      "Hero Profile Not Found",
      `No active profile for hero with ID ${parsedHeroId}`,
    );
  }

  return profile;
};

const findAllProfiles = async (filters) => {
  return heroProfileRepository.findAllProfiles(filters);
};

const patchProfileBio = async (heroId, bio) => {
  const parsedHeroId = Number(heroId);

  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "Hero ID must be a positive integer.",
    );
  }

  if (typeof bio !== "string") {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Bio",
      "bio must be a string.",
    );
  }

  const updated = await heroProfileRepository.updateBio(parsedHeroId, bio);
  if (!updated) {
    throw new AppError(
      404,
      "not-found",
      "Hero Profile Not Found",
      `No active profile for hero with ID ${parsedHeroId}`,
    );
  }

  return updated;
};

const addProfileSpecialization = async (heroId, specialization) => {
  const parsedHeroId = Number(heroId);

  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "Hero ID must be a positive integer.",
    );
  }

  if (typeof specialization !== "string" || !specialization.trim()) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Specialization",
      "specialization must be a non-empty string.",
    );
  }

  const updated = await heroProfileRepository.addSpecialization(
    parsedHeroId,
    specialization.trim(),
  );

  if (!updated) {
    throw new AppError(
      404,
      "not-found",
      "Hero Profile Not Found",
      `No active profile for hero with ID ${parsedHeroId}`,
    );
  }

  return updated;
};

const removeProfileSpecialization = async (heroId, specialization) => {
  const parsedHeroId = Number(heroId);

  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "Hero ID must be a positive integer.",
    );
  }

  if (typeof specialization !== "string" || !specialization.trim()) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Specialization",
      "specialization must be a non-empty string.",
    );
  }

  const updated = await heroProfileRepository.removeSpecialization(
    parsedHeroId,
    specialization.trim(),
  );

  if (!updated) {
    throw new AppError(
      404,
      "not-found",
      "Hero Profile Not Found",
      `No active profile for hero with ID ${parsedHeroId}`,
    );
  }

  return updated;
};

const softDeleteProfile = async (heroId, reason, forcedAuditId) => {
  const parsedHeroId = Number(heroId);

  if (!Number.isInteger(parsedHeroId) || parsedHeroId <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "Hero ID must be a positive integer.",
    );
  }

  try {
    await heroProfileRepository.softDeleteWithAudit(parsedHeroId, {
      reason,
      forcedAuditId,
    });
  } catch (error) {
    if (error.code === "PROFILE_NOT_FOUND") {
      throw new AppError(
        404,
        "not-found",
        "Hero Profile Not Found",
        `No active profile for hero with ID ${parsedHeroId}`,
      );
    }

    if (error?.code === 11000) {
      throw new AppError(
        409,
        "conflict",
        "Duplicate Audit Log Entry",
        "Audit entry with the provided ID already exists.",
      );
    }

    throw error;
  }

  return { message: "Profile soft-deleted successfully." };
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  findIncidents,
  findProfileByHeroId,
  findAllProfiles,
  patchProfileBio,
  addProfileSpecialization,
  removeProfileSpecialization,
  softDeleteProfile,
};
