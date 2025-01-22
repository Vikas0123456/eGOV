const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const modulesModel = require("./module");
const modulesPermissionModel = require("./modulePermissions");
const rolesModel = require("./roles");

class rolesModulesPermissionsModel extends Model {}

rolesModulesPermissionsModel = sequelize.define(
  "roles_modules_permissions",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: Sequelize.INTEGER,
    },
    modulesId: {
      type: Sequelize.INTEGER,
    },
    modulesPermissionsId: {
      type: Sequelize.INTEGER,
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
        using: "BTREE",
        fields: ["id"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["roleId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["modulesId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["modulesPermissionsId"],
      },
    ],
    timestamps: false,
  }
);

rolesModulesPermissionsModel.belongsTo(rolesModel, { foreignKey: "roleId" });
rolesModulesPermissionsModel.belongsTo(modulesModel, {
  foreignKey: "modulesId",
});
rolesModulesPermissionsModel.belongsTo(modulesPermissionModel, {
  foreignKey: "modulesPermissionsId",
});

rolesModel.hasMany(rolesModulesPermissionsModel, { foreignKey: "roleId" });
modulesModel.hasMany(rolesModulesPermissionsModel, { foreignKey: "modulesId" });
modulesPermissionModel.hasMany(rolesModulesPermissionsModel, {
  foreignKey: "modulesPermissionsId",
});

module.exports = rolesModulesPermissionsModel;
