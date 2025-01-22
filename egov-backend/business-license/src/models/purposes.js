const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class purposeModel extends Model {}

purposeModel = sequelize.define(
    "purposes",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = purposeModel;
