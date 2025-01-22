const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class systemSupportTypeModel extends Model {}

systemSupportTypeModel = sequelize.define(
  "system_support_type",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = systemSupportTypeModel;
