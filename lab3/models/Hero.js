const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

class Hero extends Model {}

Hero.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    power: {
      type: DataTypes.ENUM(
        "flight",
        "strength",
        "telepathy",
        "speed",
        "invisibility",
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "busy", "retired"),
      defaultValue: "available",
    },
    missions_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, // Validation criterium
      },
    },
  },
  {
    sequelize,
    modelName: "Hero",
    tableName: "heroes",
    underscored: true,
    timestamps: true,
    hooks: {
      beforeValidate: (hero) => {
        if (hero.name) {
          hero.name = hero.name.trim();
        }
      },
    },
    scopes: {
      available: {
        where: { status: "available" },
      },
      withPower: (power) => ({
        where: { power },
      }),
      withMissions: {
        order: [["missions_count", "DESC"]],
      },
    },
  },
);

module.exports = Hero;
