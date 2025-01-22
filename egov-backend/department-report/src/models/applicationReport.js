const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class applicationReportModel extends Model {}

applicationReportModel = sequelize.define(
  "application_report",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    applicationId: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    serviceSlug: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    assignedDate: {
      type: Sequelize.DATE,
    },
    completedDate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    turnAroundTime: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    approvedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("0", "1", "2", "3", "4", "5", "6", "7"),
      allowNull: false,
      defaultValue: "0",
      values: ["0", "1", "2", "3", "4", "5", "6", "7"],
    },
    createdDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updateDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW,
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

module.exports = applicationReportModel;
