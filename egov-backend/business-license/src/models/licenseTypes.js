const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class licenseTypeModel extends Model {}

licenseTypeModel = sequelize.define(
    "license_type",
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

module.exports = licenseTypeModel;
