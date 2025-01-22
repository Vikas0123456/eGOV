const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const usersModel = require("./users");

class workflowModel extends Model {}

workflowModel = sequelize.define(
  "workflow",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workflowName: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    workflowDepartmentId: {
      type: Sequelize.INTEGER,
    },
    workflowServiceSlug:{
      type: Sequelize.TEXT("long"),
      allowNull: true,
    },
    workflowData:{
      type: Sequelize.TEXT("long"),
      allowNull: true,
    },
    workflowFor: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
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
    ],
    timestamps: false,
  }
);
workflowModel.belongsTo(usersModel, { foreignKey: "userId" });
usersModel.hasMany(workflowModel, { foreignKey: "userId" });

module.exports = workflowModel;
