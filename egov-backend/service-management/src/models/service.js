const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const departmentsModel = require("./department");

class serviceModel extends Model { }

serviceModel = sequelize.define(
    "services",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        serviceName: {
            type: Sequelize.STRING,
        },
        slug: {
            type: Sequelize.STRING,
        },
        shortDescription: {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        },
        departmentId: {
            type: Sequelize.INTEGER,
        },
        configurationData: {
            type: Sequelize.TEXT("long"),
        },
        currentVersion: {
            type: Sequelize.BIGINT,
            defaultValue: 1,
        },
        priority: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "0",
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        TAT: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        databaseName: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "1",
        },
        step: {
            type: Sequelize.JSON,
        },
        certificateTemplate: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        servicePrerequisiteData: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        serviceInstructionsData: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        meetingInstructionData: {
            type: Sequelize.TEXT("long"),
            allowNull: true
        },
        pdfGenerator: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "1",
        },
        certificateExpiryTime: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        paymentMethod: {
            type: Sequelize.ENUM,
            values: ["0", "1", "2"],
            defaultValue: "0",
        },
        paymentOption: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "0",
        },
        createdDate: {
            type: Sequelize.DATE,
        },
        updateDate: {
            type: Sequelize.DATE,
        },
    },
    {
        indexes: [
            {
                unique: true,
                using: "BTREE",
                fields: ["id"],
            },
            {
                unique: true,
                using: "BTREE",
                fields: ["slug"],
            },
        ],
        timestamps: false,
    }
);

serviceModel.belongsTo(departmentsModel, { foreignKey: "departmentId" });
departmentsModel.hasMany(serviceModel, { foreignKey: "departmentId" });

module.exports = serviceModel;
