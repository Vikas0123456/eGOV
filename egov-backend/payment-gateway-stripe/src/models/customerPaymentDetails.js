const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class customerPaymentDetailsModel extends Model {}

customerPaymentDetailsModel = sequelize.define(
  "customer_payment_details",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    stripeCustomerId: {
      type: Sequelize.STRING(255),
      allowNull: true,
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
        fields: ["customerId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["stripeCustomerId"],
      },
    ],
    timestamps: false,
  }
);

module.exports = customerPaymentDetailsModel;
