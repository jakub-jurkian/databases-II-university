const { Hero } = require("../models");

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

  const scopes = [];
  if (status === "available") scopes.push("available");
  if (power) scopes.push({ method: ["withPower", power] });
  if (safeSortBy === "missions_count") scopes.push("withMissions");

  const heroModel = scopes.length > 0 ? Hero.scope(...scopes) : Hero;
  const queryOptions = {
    limit,
    offset,
    attributes: ["id", "name", "power", "status", "missions_count", "created_at"],
  };

  if (status && status !== "available") {
    queryOptions.where = { status };
  }

  if (safeSortBy !== "missions_count") {
    queryOptions.order = [[safeSortBy, "DESC"]];
  }

  const { rows, count } = await heroModel.findAndCountAll(queryOptions);
  const data = rows.map((row) => row.get({ plain: true }));
  const total = Number(count);
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
 * @param {import("sequelize").Transaction} trx
 */

const findById = async (id, trx) => {
  const options = {
    attributes: ["id", "name", "power", "status", "missions_count"],
  };

  if (trx) {
    options.transaction = trx;
    // pesymistyczna blokada (FOR UPDATE) - rezerwacja dla edycji
    options.lock = true;
  }

  const hero = await Hero.findByPk(id, options);

  return hero ? hero.get({ plain: true }) : null;
};

const create = async ({ name, power }, trx) => {
  const newHero = await Hero.create(
    {
      name,
      power,
      status: "available",
      missions_count: 0,
    },
    {
      transaction: trx,
    },
  );

  return newHero.get({ plain: true });
};

const updateStatus = async (id, status, trx) => {
  const [affectedRows, updatedRows] = await Hero.update(
    {
      status,
      updated_at: new Date(),
    },
    {
      where: { id },
      returning: true,
      transaction: trx,
    },
  );

  if (affectedRows === 0) {
    return null;
  }

  return updatedRows[0].get({ plain: true });
};

const update = async (id, data, trx) => {
  const payload = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.power !== undefined) payload.power = data.power;
  if (data.status !== undefined) payload.status = data.status;

  if (Object.keys(payload).length === 0) {
    return findById(id, trx);
  }

  payload.updated_at = new Date();

  const [affectedRows, updatedRows] = await Hero.update(payload, {
    where: { id },
    returning: true,
    transaction: trx,
  });

  if (affectedRows === 0) {
    return null;
  }

  return updatedRows[0].get({ plain: true });
};

module.exports = { findAll, findById, create, updateStatus, update };
