const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const customerModel = require("./customer");

class logiHistoryCustomerModel extends Model {}

logiHistoryCustomerModel = sequelize.define(
  "login_history_customer",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    customerEmail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    browserInfo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    os: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isLoginSuccess: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
    },
    logoutTime: {
      type: Sequelize.DATE,
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

module.exports = logiHistoryCustomerModel;
