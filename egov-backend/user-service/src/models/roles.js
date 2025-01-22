const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class rolesModel extends Model {}

rolesModel = sequelize.define(
  "roles",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleName: {
      type: Sequelize.STRING,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    isCoreTeam: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isAdmin: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isSupportTeam :{
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updateDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
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

module.exports = rolesModel;
