const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class addressModel extends Model {}

addressModel = sequelize.define(
  "address",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
    },
    livingIn: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    houseNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    streetAddress: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    subDivision: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    zipCode: { type: Sequelize.STRING, allowNull: true },
    city: { type: Sequelize.STRING, allowNull: true },
    state: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    countryId : {
      type: Sequelize.INTEGER,
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
        fields: ["countryId"],
      },
    ],
    timestamps: false,
  }
);


module.exports = addressModel;
