const pool = require("../db");

const findAll = async ({ level, status } = {}, client = pool) => {
  let queryStr = `SELECT id, location, level, status, hero_id FROM incidents`;
  const values = [];
  const conditions = [];

  if (level) {
    values.push(level);
    conditions.push(`level = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    queryStr += ` WHERE ` + conditions.join(" AND ");
  }
  queryStr += ` ORDER BY id ASC`;

  const { rows } = await client.query(queryStr, values);
  return rows;
};

const findById = async (id, client = pool) => {
  const { rows } = await client.query(
    `SELECT id, location, level, status, hero_id FROM incidents WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ location, level }, client = pool) => {
  const { rows } = await client.query(
    `INSERT INTO incidents (location, level)
     VALUES ($1, $2)
     RETURNING id, location, level, status, hero_id`,
    [location, level]
  );
  return rows[0];
};

const updateHeroId = async (incidentId, heroId, client = pool) => {
  const { rows } = await client.query(
    `UPDATE incidents 
     SET hero_id = $1 
     WHERE id = $2 
     RETURNING id, location, level, status, hero_id`,
    [heroId, incidentId]
  );
  return rows[0];
};

const updateStatus = async (incidentId, status, client = pool) => {
  const { rows } = await client.query(
    `UPDATE incidents 
     SET status = $1 
     WHERE id = $2 
     RETURNING id, location, level, status, hero_id`,
    [status, incidentId]
  );
  return rows[0];
};

module.exports = { findAll, findById, create, updateHeroId, updateStatus };