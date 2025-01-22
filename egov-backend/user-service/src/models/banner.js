const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class bannerModel extends Model {}

bannerModel = sequelize.define(
  "banner",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
    },
    url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    imageId: { type: Sequelize.INTEGER, allowNull: true },
    isActive: {
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

module.exports = bannerModel;
