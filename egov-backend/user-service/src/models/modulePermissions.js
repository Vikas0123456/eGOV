const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const modulesModel = require("./module");

class modulesPermissionModel extends Model {}

modulesPermissionModel = sequelize.define(
  "modules_permissions",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    modulesId: {
      type: Sequelize.INTEGER,
    },
    permissionsId:{
      type: Sequelize.INTEGER,
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

module.exports = modulesPermissionModel;

modulesPermissionModel.belongsTo(modulesModel, { foreignKey: "modulesId" });
modulesModel.hasMany(modulesPermissionModel, { foreignKey: "modulesId" });