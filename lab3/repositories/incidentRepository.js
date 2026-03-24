const { Op, literal } = require("sequelize");
const { Incident, Hero } = require("../models");

const findAll = async ({
  level,
  status,
  district,
  page = 1,
  pageSize = 10,
} = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const offset = (parsedPage - 1) * limit;

  const where = {};
  if (level) where.level = level;
  if (status) where.status = status;
  if (district) where.district = { [Op.iLike]: `%${district}%` };

  const { rows, count } = await Incident.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    attributes: [
      "id",
      "location",
      "district",
      "level",
      "status",
      "hero_id",
      "assigned_at",
      "resolved_at",
      "created_at",
    ],
  });

  const data = rows.map((row) => row.get({ plain: true }));
  const total = Number(count);

  return {
    data,
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
 * @param {import("sequelize").Transaction} trx
 */

const findById = async (id, trx) => {
  const options = {
    attributes: [
      "id",
      "location",
      "district",
      "level",
      "status",
      "hero_id",
      "assigned_at",
      "resolved_at",
    ],
  };

  if (!trx) {
    options.include = [
      {
        model: Hero,
        as: "hero",
        required: false,
        attributes: ["id", "name", "power", "status", "missions_count"],
      },
    ];
  }

  if (trx) {
    options.transaction = trx;
    options.lock = true;
  }

  const incident = await Incident.findByPk(id, options);
  return incident ? incident.get({ plain: true }) : null;
};

const create = async ({ location, level, district = null }, trx) => {
  const incident = await Incident.create(
    {
      location,
      level,
      district,
      status: "open",
    },
    {
      transaction: trx,
    },
  );

  return incident.get({ plain: true });
};

const updateHeroId = async (incidentId, heroId, trx) => {
  const [affectedRows, updatedRows] = await Incident.update(
    {
      hero_id: heroId,
      assigned_at: new Date(),
      updated_at: new Date(),
    },
    {
      where: { id: incidentId },
      returning: true,
      transaction: trx,
    },
  );

  if (affectedRows === 0) {
    return null;
  }

  return updatedRows[0].get({ plain: true });
};

const updateStatus = async (incidentId, status, trx) => {
  const [affectedRows, updatedRows] = await Incident.update(
    {
      status,
      resolved_at: status === "resolved" ? new Date() : null,
      updated_at: new Date(),
    },
    {
      where: { id: incidentId },
      returning: true,
      transaction: trx,
    },
  );

  if (affectedRows === 0) {
    return null;
  }

  return updatedRows[0].get({ plain: true });
};

const findByHeroId = async (heroId, { page = 1, pageSize = 10 } = {}, trx) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const offset = (parsedPage - 1) * limit;

  const options = {
    where: { hero_id: heroId },
    limit,
    offset,
    attributes: [
      "id",
      "location",
      "district",
      "level",
      "status",
      "hero_id",
      "assigned_at",
      "resolved_at",
    ],
    order: [literal('"assigned_at" DESC NULLS LAST'), ["id", "DESC"]],
  };

  if (trx) {
    options.transaction = trx;
  }

  const { rows, count } = await Incident.findAndCountAll(options);
  const data = rows.map((row) => row.get({ plain: true }));
  const total = Number(count);

  return {
    data,
    pagination: {
      page: parsedPage,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
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
