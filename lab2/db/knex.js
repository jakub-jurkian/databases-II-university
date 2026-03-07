const knex = require('knex');
const config = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

const configOptions = config[environment];

// Initialize Knex instance
const instance = knex(configOptions);

// Export instance to use it in whole app
module.exports = instance;