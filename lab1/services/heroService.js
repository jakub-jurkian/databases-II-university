const heroRepository = require("../repositories/heroRepository");
const AppError = require("../utils/AppError");

const toDTO = (row) => ({
  id: row.id,
  name: row.name,
  power: row.power,
  status: row.status,
});

const findAll = async (filters) => {
  const rows = await heroRepository.findAll(filters);
  return rows.map(toDTO);
};

const create = async (data) => {
  if (!data.name || !data.power) {
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

  const row = await heroRepository.create(data);
  return toDTO(row);
};

module.exports = { findAll, create };
