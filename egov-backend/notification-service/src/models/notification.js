const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class notificationModel extends Model {}

notificationModel = sequelize.define(
  "notifications",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    serviceSlug: {
      type: Sequelize.STRING(15),
      allowNull: true,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM,
      values: ["0", "1", "3"],
      defaultValue: "1",
    },
    addedBy: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2"],
      defaultValue: null,
    },
    isRead: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    applicationId: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
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

module.exports = notificationModel;
