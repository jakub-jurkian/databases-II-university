const prisma = require("../dbClient");
const incidentRepository = require("../repositories/incidentRepository");
const heroRepository = require("../repositories/heroRepository");
const heroProfileRepository = require("../repositories/heroProfileRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  location: row.location,
  district: row.district,
  level: row.level,
  status: row.status,
  heroId: row.heroId,
  hero: row.hero
    ? {
        id: row.hero.id,
        name: row.hero.name,
        power: row.hero.power,
        status: row.hero.status,
        missionsCount: row.hero.missionsCount,
      }
    : null,
  assignedAt: row.assignedAt,
  resolvedAt: row.resolvedAt,
  categories: row.categories ? row.categories.map((c) => c.category.name) : [],
});

const findAll = async (filters) => {
  if (filters?.categoryId !== undefined) {
    const categoryId = Number(filters.categoryId);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw new AppError(
        422,
        "validation-error",
        "Invalid categoryId",
        "categoryId must be a positive integer.",
      );
    }
  }

  if (filters?.exclude !== undefined) {
    const exclude = Number(filters.exclude);
    if (!Number.isInteger(exclude) || exclude <= 0) {
      throw new AppError(
        422,
        "validation-error",
        "Invalid exclude",
        "exclude must be a positive integer.",
      );
    }
  }

  const result = await incidentRepository.findAll(filters);
  return {
    data: result.data.map(toDTO),
    pagination: result.pagination,
  };
};

const findById = async (id) => {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Incident ID",
      "Incident ID must be a positive integer.",
    );
  }

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
  const { location, level, categoryIds } = data;
  if (!location || !level) {
    throw new AppError(
      400,
      "bad-request",
      "Missing Fields",
      "Location and level are required.",
    );
  }

  const validLevels = ["low", "medium", "critical"];
  if (!validLevels.includes(level)) {
    throw new AppError(
      422,
      "validation-error",
      "Invalid Level",
      `Level must be one of: ${validLevels.join(", ")}`,
    );
  }

  if (categoryIds !== undefined) {
    const hasInvalidCategoryIds =
      !Array.isArray(categoryIds) ||
      categoryIds.some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0);

    if (hasInvalidCategoryIds) {
      throw new AppError(
        422,
        "validation-error",
        "Invalid Categories",
        "categoryIds must be an array of positive integer IDs.",
      );
    }
  }

  const row = await incidentRepository.create(data);
  return toDTO(row);
};

const assign = async (incidentId, heroId) => {
  if (!Number.isInteger(Number(incidentId)) || Number(incidentId) <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Incident ID",
      "Incident ID must be a positive integer.",
    );
  }

  if (!Number.isInteger(Number(heroId)) || Number(heroId) <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Hero ID",
      "heroId must be a positive integer.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const hero = await heroRepository.findById(heroId, tx);
    if (!hero) {
      throw new AppError(
        404,
        "not-found",
        "Hero Not Found",
        `No hero with ID ${heroId}`,
      );
    }

    const availableHero = await heroRepository.findAvailableById(heroId, tx);
    if (!availableHero) {
      throw new AppError(
        409,
        "conflict",
        "Hero Unavailable",
        "This hero is currently busy.",
      );
    }

    const incident = await incidentRepository.findById(incidentId, tx);
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
      if (!allowedPowers.includes(availableHero.power)) {
        throw new AppError(
          403,
          "forbidden",
          "Insufficient Power",
          "Critical incidents require flight or strength.",
        );
      }
    }

    await heroRepository.updateStatus(heroId, "busy", tx);

    const updatedIncident = await incidentRepository.updateHeroId(
      incidentId,
      heroId,
      tx,
    );
    return toDTO(updatedIncident);
  });
};

const resolve = async (incidentId) => {
  if (!Number.isInteger(Number(incidentId)) || Number(incidentId) <= 0) {
    throw new AppError(
      400,
      "bad-request",
      "Invalid Incident ID",
      "Incident ID must be a positive integer.",
    );
  }

  const resolvedIncident = await prisma.$transaction(async (tx) => {
    const incident = await incidentRepository.findById(incidentId, tx);
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

    const updatedIncident = await incidentRepository.updateStatus(
      incidentId,
      "resolved",
      tx,
    );

    if (incident.heroId) {
      await tx.hero.update({
        where: { id: Number(incident.heroId) },
        data: {
          status: "available",
          missionsCount: { increment: 1 },
        },
      });
    }

    return updatedIncident;
  });

  if (resolvedIncident.heroId) {
    await heroProfileRepository.appendResolvedIncident({
      heroId: resolvedIncident.heroId,
      incidentId: resolvedIncident.id,
      level: resolvedIncident.level,
      location: resolvedIncident.location,
      resolvedAt: resolvedIncident.resolvedAt,
    });
  }

  return toDTO(resolvedIncident);
};

module.exports = { findAll, findById, create, assign, resolve };
