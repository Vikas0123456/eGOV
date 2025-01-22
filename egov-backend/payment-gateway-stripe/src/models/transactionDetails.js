const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class transactionDetailsModel extends Model {}

transactionDetailsModel = sequelize.define(
  "transaction_details",
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
    applicationId: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    serviceSlug: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    transactionId: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    transactionAmount: {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: false,
    },
    transactionStatus: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2", "3"],
      defaultValue: "0",
      allowNull: false,
      comment: "0 = Pending | 1 = Success | 2 = Failed | 3 = Refund",
    },
    transactionReceipt: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    seenStatus: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
      allowNull: false,
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
        fields: ["applicationId"],
      },
    ],
    timestamps: false,
  }
);

module.exports = transactionDetailsModel;
