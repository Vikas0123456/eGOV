const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const ticketsModel = require("./tickets");

class ticketsLogModel extends Model {}

ticketsLogModel = sequelize.define(
  "tickets_log",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticketsId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    oldStatus: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2", "3", "4"],
      allowNull: true,
    },
    newStatus: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2", "3", "4"],
      allowNull: true,
    },
    createdDate: {
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

ticketsLogModel.belongsTo(ticketsModel, { foreignKey: "ticketsId" });

module.exports = ticketsLogModel;
