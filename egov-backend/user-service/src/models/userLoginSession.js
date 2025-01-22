const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class userLoginSessionModel extends Model {}

userLoginSessionModel = sequelize.define(
  "user_login_session",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    deviceName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    socketConnectionKey: {
      type: Sequelize.STRING,
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
        fields: ["userId"],
      },
    ],
    timestamps: false,
  }
);

module.exports = userLoginSessionModel;
