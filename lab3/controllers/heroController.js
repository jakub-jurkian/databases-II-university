const heroService = require("../services/heroService");

const getAll = async (req, res, next) => {
  try {
    const filters = {
      power: req.query.power,
      status: req.query.status,
      sortBy: req.query.sortBy,
      page: req.query.page,
      pageSize: req.query.pageSize,
    };

    const heroes = await heroService.findAll(filters);
    res.status(200).json(heroes);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const hero = await heroService.findById(heroId);
    res.status(200).json(hero);
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

    res.status(201).location(`/api/v1/heroes/${newHero.id}`).json(newHero);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const data = {
      name: req.body.name,
      power: req.body.power,
      status: req.body.status,
    };

    const updatedHero = await heroService.update(heroId, data);

    res.status(200).json(updatedHero);
  } catch (error) {
    next(error);
  }
};

const getIncidents = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const incidents = await heroService.findIncidents(heroId, {
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
    res.status(200).json(incidents);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, getIncidents };
