const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
// const customerModel = require("./customer");

class ticketsModel extends Model {}

ticketsModel = sequelize.define(
  "tickets",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticketId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    departmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    serviceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    serviceSlug: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    assignTo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    assignUsersData:{
      type: Sequelize.TEXT("long"),
      allowNull: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    discription: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    priority: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2"],
      defaultValue: "0",
    },
    documentId: { type: Sequelize.INTEGER, allowNull: false },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2", "3"],
      defaultValue: "0",
    },
    workflowData: {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    },
    workflowIndex: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    documentId: { type: Sequelize.INTEGER, allowNull: true },
    turnAroundTime: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "TAT",
    },
    respondedOn: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
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

// ticketsModel.belongsTo(customerModel, { foreignKey: "customerId" });

module.exports = ticketsModel;
