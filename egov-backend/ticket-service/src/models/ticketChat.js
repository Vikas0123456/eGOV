const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const ticketsModel = require("./tickets");

class ticketChatModel extends Model {}

ticketChatModel = sequelize.define(
  "ticketChat",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticketId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    parentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    message: {
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
    ],
    timestamps: false,
  }
);

ticketChatModel.belongsTo(ticketsModel, { foreignKey: "ticketId" });

module.exports = ticketChatModel;
