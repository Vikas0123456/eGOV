const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class formBuilderModel extends Model {}

formBuilderModel = sequelize.define(
  "forms",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    formName: {
      type: Sequelize.STRING(255),
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    version: {
      type: Sequelize.INTEGER,
    },
    formSlug: {
      type: Sequelize.STRING(255),
    },
    formData: {
      type: Sequelize.TEXT('long'),
    },
    status: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "1",
    },
    isDeleted: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    createdDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updateDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW,
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

module.exports = formBuilderModel;
