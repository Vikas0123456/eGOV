const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class upcomingEventsModel extends Model {}

upcomingEventsModel = sequelize.define(
    "upcoming_events",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: Sequelize.TEXT,
        },
        description: {
            type: Sequelize.TEXT,
        },
        imageId: { type: Sequelize.INTEGER, allowNull: true },
        eventDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "1",
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

module.exports = upcomingEventsModel;
