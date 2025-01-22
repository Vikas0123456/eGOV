const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class blockedIpsModel extends Model {}

blockedIpsModel = sequelize.define(
  "blockedIps",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    ipAddress: {
      type: Sequelize.STRING,
    },
    isBlocked: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
    },
    failedLoginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    lastLoginAttempt: {
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

module.exports = blockedIpsModel;
