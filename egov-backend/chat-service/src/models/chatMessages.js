const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class chatMessageModel extends Model {}

chatMessageModel = sequelize.define(
  "chat_message",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT(2000),
      allowNull: true,
    },
    attachmentType: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    attachmentId: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    seenBy: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    replyMessage: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    deletedBy:{
      type: Sequelize.STRING(255),
      allowNull: true,
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

module.exports = chatMessageModel;
