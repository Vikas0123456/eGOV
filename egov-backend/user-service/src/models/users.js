const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const rolesModel = require("./roles");

class usersModel extends Model {}

usersModel = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    profileImageId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    otp: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    isValidEmail: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isSupportTeam:{
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isCoreTeam: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    otpExpireDateTime: {
      type: Sequelize.DATE,
    },
    linkExpireDateTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    meetingLink: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    },
    isDeleted: {
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
        fields: ["roleId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["departmentId"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["isCoreTeam"],
      },
      {
        unique: true,
        using: "BTREE",
        fields: ["status"],
      },
    ],
    timestamps: false,
  }
);

usersModel.belongsTo(rolesModel, { foreignKey: "roleId" });
rolesModel.hasMany(usersModel, { foreignKey: "roleId" });

module.exports = usersModel;