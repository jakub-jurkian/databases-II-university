const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

class Incident extends Model {}

Incident.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM("low", "medium", "critical"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("open", "assigned", "resolved"),
      defaultValue: "open",
    },
    hero_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    assigned_at: DataTypes.DATE,
    resolved_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "Incident",
    tableName: "incidents",
    underscored: true,
    timestamps: true,
    hooks: {
      afterUpdate: async (incident, options) => {
        const { transaction } = options;

        if (
          incident.changed("status") &&
          incident.previous("status") === "assigned" &&
          incident.status === "resolved" &&
          incident.hero_id
        ) {
          const Hero = sequelize.models.Hero;
          const hero = await Hero.findByPk(incident.hero_id, { transaction });

          if (hero) {
            await hero.increment("missions_count", { by: 1, transaction });
          }
        }
      },
    },
  },
);
module.exports = Incident;
