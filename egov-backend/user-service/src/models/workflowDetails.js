const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
// const departmentsModel = require("./department");
const rolesModel = require("./roles");
const workflowModel = require("./workflow");

class workflowDetailsModel extends Model {}

workflowDetailsModel = sequelize.define(
  "workflow_details",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workflowMethod: {
      type: Sequelize.STRING,
    },
    workflowId: {
      type: Sequelize.INTEGER,
    },
    departmentId: {
      type: Sequelize.INTEGER,
    },
    roleId: {
      type: Sequelize.INTEGER,
    },
    serviceSlug: {
      type: Sequelize.STRING,
    },
    TAT: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.STRING,
    },
    isDirectApproval: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updateDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
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
        fields: ["workflowId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["departmentId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["roleId"],
      },
    ],
    timestamps: false,
  }
);

// workflowDetailsModel.belongsTo(departmentsModel, {
//   foreignKey: "departmentId",
// });
// departmentsModel.hasMany(workflowDetailsModel, { foreignKey: "departmentId" });

workflowDetailsModel.belongsTo(rolesModel, { foreignKey: "roleId" });
rolesModel.hasMany(workflowDetailsModel, { foreignKey: "roleId" });

workflowDetailsModel.belongsTo(workflowModel, { foreignKey: "workflowId" });
workflowModel.hasMany(workflowDetailsModel, { foreignKey: "workflowId" });

module.exports = workflowDetailsModel;
