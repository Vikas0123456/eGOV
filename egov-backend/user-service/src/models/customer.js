const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const addressModel = require("./address");

class customerModel extends Model {}

customerModel = sequelize.define(
  "customer",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    middleName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    nibNumber: {
      type: Sequelize.STRING(15),
    },
    nibImageId: {
      type: Sequelize.INTEGER,
    },
    linkToCustomerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    isResident: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    gender: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    dateOfBirth: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    countryOfBirth: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    countryOfCitizenship: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cityOfBirth: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    mobileNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    verificationImageId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    idValidation: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
    },
    homeAddressId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    mailingAddressId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2"],
      defaultValue: "1",
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    deleteReqTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    otp: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    otpExpireDateTime: {
      type: Sequelize.DATE,
    },
    otpVerification: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    otpVerificationExpireDateTime: {
      type: Sequelize.DATE,
    },
    linkExpireDateTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    isValidEmail: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    lastLoginAttempt: {
      type: Sequelize.DATE,
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
        fields: ["email"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["nibNumber"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["nibImageId"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["linkToCustomerId"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["verificationImageId"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["homeAddressId"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["mailingAddressId"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["status"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["isDeleted"],
      },
      {
        indexes: true,
        using: "BTREE",
        fields: ["otp"],
      },
    ],
    timestamps: false,
  }
);

// addressModel.belongsTo(customerModel, { foreignKey: "customerId" });
// customerModel.hasMany(addressModel, { foreignKey: "customerId" });

customerModel.belongsTo(addressModel, { foreignKey: "homeAddressId" });
addressModel.hasMany(customerModel, { foreignKey: "homeAddressId" });

customerModel.belongsTo(addressModel, { foreignKey: "mailingAddressId" });
addressModel.hasMany(customerModel, { foreignKey: "mailingAddressId" });

module.exports = customerModel;
