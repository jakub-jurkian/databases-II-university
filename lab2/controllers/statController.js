const statService = require("../services/statService");

const getStats = async (req, res, next) => {
  try {
    const stats = await statService.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
