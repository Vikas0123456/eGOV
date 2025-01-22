const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class businessStructuresModel extends Model {}

businessStructuresModel = sequelize.define(
    "business_structures",
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

module.exports = businessStructuresModel;
