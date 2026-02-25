const heroService = require("../services/heroService");

const getAll = async (req, res, next) => {
  try {
    const filters = {
      power: req.query.power,
      status: req.query.status,
    };
    
    const heroes = await heroService.findAll(filters);
    res.status(200).json(heroes);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      power: req.body.power,
    };

    const newHero = await heroService.create(data);
    
    res.status(201)
       .location(`/api/v1/heroes/${newHero.id}`)
       .json(newHero);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create };