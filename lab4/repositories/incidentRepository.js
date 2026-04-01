const prisma = require("../dbClient");

const findAll = async ({
  level,
  status,
  district,
  categoryId,
  exclude,
  page = 1,
  pageSize = 10,
} = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const skip = (parsedPage - 1) * limit;

  const where = {};
  if (level) where.level = level;
  if (status) where.status = status;

  if (district) {
    where.district = {
      contains: district,
      mode: "insensitive",
    };
  }

  const categoryFilters = [];
  if (categoryId) {
    categoryFilters.push({
      categories: {
        some: { categoryId: Number(categoryId) },
      },
    });
  }
  if (exclude) {
    categoryFilters.push({
      categories: {
        none: { categoryId: Number(exclude) },
      },
    });
  }
  if (categoryFilters.length > 0) {
    where.AND = categoryFilters;
  }

  const [rows, count] = await Promise.all([
    prisma.incident.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        hero: {
          select: {
            id: true,
            name: true,
            power: true,
            status: true,
            missionsCount: true,
          },
        },
        categories: {
          include: { category: true },
        },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    data: rows,
    pagination: {
      page: parsedPage,
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * @param {number} id
 * @param {object} tx
 */

const findById = async (id, tx = prisma) => {
  return await tx.incident.findUnique({
    where: { id: Number(id) },
    include: {
      hero: {
        select: {
          id: true,
          name: true,
          power: true,
          status: true,
          missionsCount: true,
        },
      },
      categories: {
        include: { category: true },
      },
    },
  });
};

const create = async (data, tx = prisma) => {
  const { categoryIds, ...incidentData } = data;

  return await tx.incident.create({
    data: {
      ...incidentData,
      status: "open",
      categories: {
        create: (categoryIds || []).map((id) => ({
          categoryId: Number(id),
        })),
      },
    },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });
};

const updateHeroId = async (incidentId, heroId, tx = prisma) => {
  try {
    return await tx.incident.update({
      where: { id: Number(incidentId) },
      data: {
        heroId: Number(heroId),
        status: "assigned",
        assignedAt: new Date(),
      },
    });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

const updateStatus = async (incidentId, status, tx = prisma) => {
  try {
    return await tx.incident.update({
      where: { id: Number(incidentId) },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

const findByHeroId = async (
  heroId,
  { page = 1, pageSize = 10 } = {},
  tx = prisma,
) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const skip = (parsedPage - 1) * limit;

  const where = { heroId: Number(heroId) };

  const [rows, count] = await Promise.all([
    tx.incident.findMany({
      where,
      take: limit,
      skip,
      orderBy: [{ assignedAt: "desc" }, { id: "desc" }],
    }),
    tx.incident.count({ where }),
  ]);

  return {
    data: rows,
    pagination: {
      page: parsedPage,
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = {
  findAll,
  findById,
  create,
  updateHeroId,
  updateStatus,
  findByHeroId,
};
