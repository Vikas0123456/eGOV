const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class emailLogsModel extends Model {}

emailLogsModel = sequelize.define(
  "email_logs",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    moduleName: {
      type: Sequelize.STRING,
    },
    sender_email: {
      type: Sequelize.STRING,
    },
    recipient_email: {
      type: Sequelize.STRING,
    },
    subject: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
    },
    sender_type: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2"],
    },
    isMailedSuccess: {
      type: Sequelize.ENUM,
      values: ["0", "1",],
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = emailLogsModel;
