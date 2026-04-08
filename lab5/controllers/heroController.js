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

const getProfileByHeroId = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const profile = await heroService.findProfileByHeroId(heroId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

const getProfiles = async (req, res, next) => {
  try {
    const filters = {
      powers: req.query.powers,
      minMissions: req.query.minMissions,
      withBio: req.query.withBio,
      specialization: req.query.specialization,
      page: req.query.page,
      limit: req.query.limit,
    };

    const profiles = await heroService.findAllProfiles(filters);
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

const patchProfileBio = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const updatedProfile = await heroService.patchProfileBio(heroId, req.body.bio);
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

const addProfileSpecialization = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const updatedProfile = await heroService.addProfileSpecialization(
      heroId,
      req.body.specialization,
    );
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

const removeProfileSpecialization = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const updatedProfile = await heroService.removeProfileSpecialization(
      heroId,
      req.params.name,
    );
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

const softDeleteProfile = async (req, res, next) => {
  try {
    const heroId = parseInt(req.params.id, 10);
    const result = await heroService.softDeleteProfile(
      heroId,
      req.body?.reason,
      req.body?.forcedAuditId ?? req.body?.auditEntryId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  getIncidents,
  getProfileByHeroId,
  getProfiles,
  patchProfileBio,
  addProfileSpecialization,
  removeProfileSpecialization,
  softDeleteProfile,
};
