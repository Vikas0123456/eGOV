const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class chatListModel extends Model {}

chatListModel = sequelize.define(
  "chat_list",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatName: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    isGroup: {
      type: Sequelize.BOOLEAN(false),
      allowNull: false,
    },
    participants: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    archiveBy:{
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    favouriteBy:{
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedDate: {
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

module.exports = chatListModel;
