const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class departmentsModel extends Model {}

departmentsModel = sequelize.define(
  "department",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    departmentName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    contactNumber: {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    },
    contactNumberExt: { type: Sequelize.STRING, allowNull: true },
    logo: { type: Sequelize.INTEGER, allowNull: true },
    shortDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    locationTitle: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    location: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    keyword:{
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
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
      {
        unique: true,
        using: "BTREE",
        fields: ["departmentName"],
      },
    ],
    timestamps: false,
  }
);

module.exports = departmentsModel;
