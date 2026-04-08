const incidentService = require("../services/incidentService");

const getAll = async (req, res, next) => {
  try {
    const filters = {
      level: req.query.level,
      status: req.query.status,
      district: req.query.district,
      categoryId: req.query.categoryId,
      exclude: req.query.exclude,
      page: req.query.page,
      pageSize: req.query.pageSize,
    };
    const incidents = await incidentService.findAll(filters);
    res.status(200).json(incidents);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    const incident = await incidentService.findById(incidentId);
    res.status(200).json(incident);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = {
      location: req.body.location,
      level: req.body.level,
      district: req.body.district,
      categoryIds: req.body.categoryIds,
    };

    const newIncident = await incidentService.create(data);

    res
      .status(201)
      .location(`/api/v1/incidents/${newIncident.id}`)
      .json(newIncident);
  } catch (error) {
    next(error);
  }
};

const assign = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    const heroId = parseInt(req.body.heroId, 10);

    const updatedIncident = await incidentService.assign(incidentId, heroId);
    res.status(200).json(updatedIncident);
  } catch (error) {
    next(error);
  }
};

const resolve = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id, 10);

    const updatedIncident = await incidentService.resolve(incidentId);
    res.status(200).json(updatedIncident);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, assign, resolve };
