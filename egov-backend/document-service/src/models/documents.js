const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class documentsModel extends Model {}

documentsModel = sequelize.define(
  "documents",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    viewDocumentName:{
      type: Sequelize.STRING,
    },
    documentName: {
      type: Sequelize.STRING,
    },
    customerId: {
      type: Sequelize.INTEGER,
    },
    documentSlug: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    documentPath: {
      type: Sequelize.STRING,
    },
    documentType: {
      type: Sequelize.STRING,
    },
    isGenerated: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    isShowInDocument: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    fileSize:{
      type: Sequelize.INTEGER,
    },
    isVerified: {
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
      {
        unique: true,
        using: "BTREE",
        fields: ["customerId"],
      },
    ],
    timestamps: false,
  }
);

module.exports = documentsModel;
