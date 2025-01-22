const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class countriesModel extends Model {}

countriesModel = sequelize.define(
  "countries",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shortname: {
      type: Sequelize.STRING(3),
    },
    name: {
      type: Sequelize.STRING(150),
    },
    phonecode: {
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

module.exports = countriesModel;
