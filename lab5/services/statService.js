const statRepository = require("../repositories/statRepository");

const getStats = async () => {
  return statRepository.getStats();
};

module.exports = { getStats };
