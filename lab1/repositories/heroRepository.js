const pool = require("../db");

const findAll = async ({ power, status } = {}, client = pool) => {
  let queryStr = `SELECT id, name, power, status FROM heroes`;
  const values = [];
  const conditions = [];

  if (power) {
    values.push(power);
    conditions.push(`power = $${values.length}`);
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
    `SELECT id, name, power, status FROM heroes WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
};

const create = async ({ name, power }, client = pool) => {
  const { rows } = await client.query(
    `INSERT INTO heroes (name, power)
     VALUES ($1, $2)
     RETURNING id, name, power, status`,
    [name, power],
  );
  return rows[0];
};

const updateStatus = async (id, status, client = pool) => {
  const { rows } = await client.query(
    `UPDATE heroes 
     SET status = $1 
     WHERE id = $2 
     RETURNING id, name, power, status`,
    [status, id],
  );
  return rows[0];
};

module.exports = { findAll, findById, create, updateStatus };
