const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.connection");

class knowledgeBaseModel extends Model {}

knowledgeBaseModel = sequelize.define(
    "knowledge_base",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    block: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    authors: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    visibility: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0'
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0'
    },
    createdDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isDeleted: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0'
    },
    updateDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
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

module.exports = knowledgeBaseModel;
