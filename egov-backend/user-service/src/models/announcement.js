const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class announcementsModel extends Model {}

announcementsModel = sequelize.define(
    "announcement",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isCoreTeam: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: null,
        },
        departmentId: {
            type: Sequelize.STRING,
            allowNull: null,
        },
        displayFrom: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        displayTo: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        announcementDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        tag:{
            type: Sequelize.STRING,
            allowNull: null,
        },
        isActive: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "1",
        },
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        updatedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
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
        createdDate: {
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

module.exports = announcementsModel;
