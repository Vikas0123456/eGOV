const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class companyTypeModel extends Model {}

companyTypeModel = sequelize.define(
    "company_type",
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

module.exports = companyTypeModel;
