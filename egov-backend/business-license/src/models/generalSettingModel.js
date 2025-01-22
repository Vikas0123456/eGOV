const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class generalSettingModel extends Model { }

generalSettingModel = sequelize.define(
  "general_setting",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    settingKey: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    settingValue: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "You can put the note about key value",
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

module.exports = generalSettingModel;
