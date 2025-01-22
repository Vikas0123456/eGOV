const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class documentRequiredModel extends Model {}

documentRequiredModel = sequelize.define(
    "document_required",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        applicationId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
        },
        documentName: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        slug: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        documentFileType: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        uploadedDocumentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        isRequired: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            allowNull: false,
            defaultValue: "0",
            comment: "0 = Not Required | 1 = Required",
        },
        canApply: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            allowNull: false,
            defaultValue: "0",
            comment: "0 = Can not Apply | 1 = Can Apply",
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
            {
                unique: true,
                using: "BTREE",
                fields: ["applicationId"],
            },
        ],
        timestamps: false,
    }
);

module.exports = documentRequiredModel;
