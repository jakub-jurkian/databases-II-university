const db = require("../db/knex");

const findAll = async ({
  level,
  status,
  district,
  page = 1,
  pageSize = 10,
} = {}) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);

  let query = db("incidents");

  if (level) query = query.where("level", level);
  if (status) query = query.where("status", status);
  if (district) query = query.whereILike("district", `%${district}%`);

  const limit = Math.min(parsedPageSize, 50);
  const offset = (parsedPage - 1) * limit;

  const totalCountQuery = query.clone().count("* as total").first();

  let queryData = query
    .clone()
    .select("*")
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);

  const [data, countResult] = await Promise.all([queryData, totalCountQuery]);

  const total = parseInt(countResult.total);

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
 * @param {import("knex").Knex} trx
 */

const findById = async (id, trx) => {
  const res = await (trx || db)("incidents")
    .select(
      "id",
      "location",
      "district",
      "level",
      "status",
      "hero_id",
      "assigned_at",
      "resolved_at",
    )
    .where("id", id)
    .first();
  return res || null;
};

const create = async ({ location, level, district = null }, trx) => {
  const [res] = await (trx || db)("incidents")
    .insert({ location, level, district, status: "open" })
    .returning(["id", "location", "district", "level", "status", "hero_id"]);

  return res;
};

const updateHeroId = async (incidentId, heroId, trx) => {
  const [res] = await (trx || db)("incidents")
    .update({ hero_id: heroId, assigned_at: db.fn.now(), updated_at: db.fn.now() })
    .where("id", incidentId)
    .returning(["id", "location", "district", "level", "status", "hero_id"]);

  return res;
};

const updateStatus = async (incidentId, status, trx) => {
  const [res] = await (trx || db)("incidents")
    .update({
      status,
      resolved_at: status === "resolved" ? db.fn.now() : null,
      updated_at: db.fn.now(),
    })
    .where("id", incidentId)
    .returning(["id", "location", "district", "level", "status", "hero_id"]);

  return res;
};

const findByHeroId = async (heroId, { page = 1, pageSize = 10 } = {}, trx) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedPageSize = Math.max(parseInt(pageSize, 10) || 10, 1);
  const limit = Math.min(parsedPageSize, 50);
  const offset = (parsedPage - 1) * limit;

  const query = (trx || db)("incidents").where("hero_id", heroId);

  const [countResult, data] = await Promise.all([
    query.clone().count("* as total").first(),
    query
      .clone()
      .select(
        "id",
        "location",
        "district",
        "level",
        "status",
        "hero_id",
        "assigned_at",
        "resolved_at",
      )
      .orderBy("assigned_at", "desc", "last")
      .orderBy("id", "desc")
      .limit(limit)
      .offset(offset),
  ]);

  const total = parseInt(countResult.total, 10);

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
