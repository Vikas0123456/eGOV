const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class marritalStatusModel extends Model {}

marritalStatusModel = sequelize.define(
    "marrital_status",
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

module.exports = marritalStatusModel;
