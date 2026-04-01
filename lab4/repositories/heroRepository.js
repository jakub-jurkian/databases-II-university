const prisma = require("../dbClient");

const HERO_WHERE = Object.freeze({
  AVAILABLE: Object.freeze({ status: "available" }),
});

const findAll = async ({
  power,
  status,
  sortBy = "createdAt", // Changed to camelCase
  page = 1,
  pageSize = 10,
} = {}) => {
  // Mapping allowed sort fields to Prisma schema names
  const allowedSortFields = ["name", "missionsCount", "createdAt"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const skip = (parsedPage - 1) * limit;

  // Building the where clause (replacing Sequelize scopes)
  const where = {};
  if (status) where.status = status;
  if (power) where.power = power;

  // Prisma handles count and rows separately, but Promise.all keeps it fast
  const [rows, count] = await Promise.all([
    prisma.hero.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [safeSortBy]: "desc",
      },
    }),
    prisma.hero.count({ where }),
  ]);

  const total = Number(count);

  return {
    data: rows,
    pagination: {
      page: parsedPage,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * @param {number} id
 * @param {object} tx - Prisma transaction client 
 */
const findById = async (id, tx = prisma) => {
  return await tx.hero.findUnique({
    where: { id: Number(id) },
  });
};

const findAvailableById = async (id, tx = prisma) => {
  return await tx.hero.findFirst({
    where: {
      id: Number(id),
      ...HERO_WHERE.AVAILABLE,
    },
  });
};

const create = async ({ name, power }, tx = prisma) => {
  return await tx.hero.create({
    data: {
      name, 
      power,
      status: "available",
      missionsCount: 0,
    },
  });
};

const updateStatus = async (id, status, tx = prisma) => {
  try {
    return await tx.hero.update({
      where: { id: Number(id) },
      data: {
        status,
      },
    });
  } catch (error) {
    // If P2025 error (Record not found), return null to keep service logic working
    if (error.code === "P2025") return null;
    throw error;
  }
};

const update = async (id, data, tx = prisma) => {
  const payload = {};

  // Mapping incoming data to camelCase fields
  if (data.name !== undefined) payload.name = data.name;
  if (data.power !== undefined) payload.power = data.power;
  if (data.status !== undefined) payload.status = data.status;

  if (Object.keys(payload).length === 0) {
    return findById(id, tx);
  }

  try {
    return await tx.hero.update({
      where: { id: Number(id) },
      data: payload,
    });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

module.exports = {
  HERO_WHERE,
  findAll,
  findById,
  findAvailableById,
  create,
  updateStatus,
  update,
};
