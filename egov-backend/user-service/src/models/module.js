const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class modulesModel extends Model {}

modulesModel = sequelize.define(
  "modules",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    moduleName: {
      type: Sequelize.STRING,
    },
    slug: {
      type: Sequelize.STRING,
    },
    moduleDescription: {
      type: Sequelize.TEXT,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updateDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["id"],
      },
    ],
    timestamps:false
  }
);

module.exports = modulesModel;
