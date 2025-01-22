const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class emailtemplatesModel extends Model {}

emailtemplatesModel = sequelize.define(
  "email_templates",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      unique: true,
    },
    title: {
      type: Sequelize.STRING,
    },
    slug: {
      type: Sequelize.STRING,
    },
    subject: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT("long"),
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
    timestamps: false,
  }
);

module.exports = emailtemplatesModel;
