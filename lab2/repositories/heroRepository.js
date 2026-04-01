const db = require("../db/knex");

const findAll = async ({
  power,
  status,
  sortBy = "created_at",
  page = 1,
  pageSize = 10,
} = {}) => {
  const allowedSortFields = ["name", "missions_count", "created_at"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const offset = (parsedPage - 1) * limit;

  let query = db("heroes");

  if (power) query = query.where("power", power);
  if (status) query = query.where("status", status);

  const totalCountQuery = query.clone().count("* as total").first();

  const dataQuery = query
    .clone()
    .select("*")
    .orderBy(safeSortBy, "desc")
    .limit(limit)
    .offset(offset);

  const [data, countResult] = await Promise.all([dataQuery, totalCountQuery]);

  const total = parseInt(countResult.total);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page: parsedPage,
      pageSize: limit,
      total,
      totalPages,
    },
  };
};

/**
 * @param {number} id
 * @param {import("knex").Knex} trx
 */

const findById = async (id, trx) => {
  const hero = await (trx || db)("heroes")
    .select("id", "name", "power", "status", "missions_count")
    .where("id", id)
    .first();

  return hero || null;
};

const create = async ({ name, power }, trx) => {
  const [newHero] = await (trx || db)("heroes")
    .insert({
      name,
      power,
      status: "available",
      missions_count: 0,
    })
    .returning(["id", "name", "power", "status", "missions_count"]);

  return newHero;
};

const updateStatus = async (id, status, trx) => {
  const [updatedHero] = await (trx || db)("heroes")
    .where("id", id)
    .update({
      status,
      updated_at: db.fn.now(),
    })
    .returning(["id", "name", "power", "status", "missions_count"]);

  return updatedHero;
};

const update = async (id, data, trx) => {
  const payload = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.power !== undefined) payload.power = data.power;
  if (data.status !== undefined) payload.status = data.status;

  if (Object.keys(payload).length === 0) {
    return findById(id, trx);
  }

  payload.updated_at = db.fn.now();

  const [updatedHero] = await (trx || db)("heroes")
    .where("id", id)
    .update(payload)
    .returning(["id", "name", "power", "status", "missions_count"]);

  return updatedHero || null;
};

module.exports = { findAll, findById, create, updateStatus, update };
