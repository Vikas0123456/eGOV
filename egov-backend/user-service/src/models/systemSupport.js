const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class systemSupportTypeModel extends Model {}

systemSupportTypeModel = sequelize.define(
  "system_support",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    attachment: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    companyName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    link: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = systemSupportTypeModel;
