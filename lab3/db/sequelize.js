const { Sequelize } = require("sequelize");
const config = require("../../config/config");

// Determine the current environment
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Connection Pool - now config is PREPARED for connection.
// Initialize the Sequelize instance using the configuration object
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: {
      underscored: true, // Maps camelCase in JS to snake_case in DB
      timestamps: true,
    },
  },
);

// Connection test
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect.", error);
  }
};
testConnection();

module.exports = sequelize;
