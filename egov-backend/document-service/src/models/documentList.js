const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class documentListModel extends Model {}

documentListModel = sequelize.define(
    "document_list",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        documentName: {
            type: Sequelize.STRING,
        },
        slug: {
            type: Sequelize.STRING,
        },
        documentFileType: {
            type: Sequelize.STRING,
        },
        isRequired: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "0",
        },
        canApply: {
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

module.exports = documentListModel;
