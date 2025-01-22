const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const customerModel = require("./customer");

class supportModel extends Model {}

supportModel = sequelize.define(
  "support",
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
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
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
    ],
    timestamps: false,
  }
);

supportModel.belongsTo(customerModel, { foreignKey: "customerId" });

module.exports = supportModel;
