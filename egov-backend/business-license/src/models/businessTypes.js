const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class businessTypesModel extends Model {}

businessTypesModel = sequelize.define(
    "business_types",
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

module.exports = businessTypesModel;
