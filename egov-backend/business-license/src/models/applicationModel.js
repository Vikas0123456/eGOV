const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class applicationModel extends Model {}

applicationModel = sequelize.define(
    "application",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        applicationId: {
            type: Sequelize.STRING(255),
            allowNull: true,
            unique: true,
            comment: "For display BSBS546861",
        },
        customerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        applicationData: {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        },
        applicantName: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        signatureImageId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        turnAroundTime: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "TAT",
        },
        issuedDocumentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            values: ["0", "1", "2", "3", "4", "5", "6"],
            defaultValue: "0",
            allowNull: false,
            comment:
                "0 = Incomplete | 1 = Checked & Verified | 2 = Pending | 3 = In Progress | 4 = Approved | 5 = Shipped | 6 = Rejected",
        },
        transactionId: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        transactionStatus: {
            type: Sequelize.ENUM,
            values: ["0", "1", "2", "3"],
            defaultValue: "0",
            allowNull: false,
            comment: "0 = Pending | 1 = Success | 2 = Failed | 3 = Refund",
        },
        isBooking: {
            type: Sequelize.ENUM,
            values: ["0", "1"],
            defaultValue: "0",
            allowNull: false,
            comment: "0 = Not Booking | 1 = Booking",
        },
        bookingDetails: {
            type: Sequelize.TEXT("long"),
            allowNull: true,
            comment: "Booking Details",
        },
        visitorId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: "visitor Id",
        },
        rating: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        ratingFeedback: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        workflowData: {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        },
        workflowIndex: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        // serviceVersion: {
        //     type: Sequelize.INTEGER,
        // },
        expiryDate: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "365 days default expiry days for expire application",
        },
        renewDate: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "application renew date",
        },
        createdDate: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            comment: "Date of application",
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
            {
                unique: true,
                using: "BTREE",
                fields: ["customerId"],
            },
            {
                unique: true,
                using: "BTREE",
                fields: ["status"],
            },
            {
                unique: true,
                using: "BTREE",
                fields: ["transactionStatus"],
            },
            {
                unique: true,
                using: "BTREE",
                fields: ["issuedDocumentId"],
            },
            {
                unique: true,
                using: "BTREE",
                fields: ["userId"],
            },
        ],
        timestamps: false,
    }
);

module.exports = applicationModel;
