const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const countriesModel = require("./countries");

class statesModel extends Model {}

statesModel = sequelize.define(
  "states",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING(30),
    },
    country_id: {
      type: Sequelize.INTEGER,
    },
  },
  {
    indexes: [
      {
        unique: true,
        using: "BTREE",
        fields: ["id"],
      },
    ],
    timestamps: false,
  }
);

statesModel.belongsTo(countriesModel, { foreignKey: "country_id" });
countriesModel.hasMany(statesModel, { foreignKey: "country_id" });

module.exports = statesModel;
