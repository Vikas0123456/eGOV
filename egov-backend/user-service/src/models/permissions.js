const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class permissionModel extends Model {}

permissionModel = sequelize.define(
  "permissions",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    permissionName: {
      type: Sequelize.STRING,
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

module.exports = permissionModel;
