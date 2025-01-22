const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class ticketReportModel extends Model {}

ticketReportModel = sequelize.define(
  "ticket_report",
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
    ticketId: {
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
      type: Sequelize.ENUM("0", "1", "2", "3", "4"),
      allowNull: false,
      defaultValue: "0",
      values: ["0", "1", "2", "3", "4"],
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

module.exports = ticketReportModel;
