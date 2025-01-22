const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class generalsettingModal extends Model {}

generalsettingModal = sequelize.define(
    "general_setting",
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        settingKey:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        settingKeyName:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        settingValue:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        description:{
            type: Sequelize.STRING,
            allowNull: true,
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
)

module.exports = generalsettingModal;