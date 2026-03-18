const sequelize = require("../db/sequelize");
const Hero = require("./Hero");
const Incident = require("./Incident");

// Define Associations

// One Hero can have many Incidents
// This adds 'getIncidents', 'setIncidents', 'addIncident' methods to Hero instances
Hero.hasMany(Incident, {
  foreignKey: "hero_id",
  as: "incidents",
});

// Each Incident belongs to one Hero (or none if hero_id is NULL)
// This adds 'getHero', 'setHero' methods to Incident instances
Incident.belongsTo(Hero, {
  foreignKey: "hero_id",
  as: "hero", // when fetch incident, nested obj will be named hero, not Hero_Model
});

// Export
const db = {
  sequelize,
  Hero,
  Incident,
};

module.exports = db;
