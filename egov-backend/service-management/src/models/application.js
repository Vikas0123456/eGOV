const { Model } = require("sequelize");

class ApplicationModel extends Model {}

const createApplicationModel = (db) => {
    ApplicationModel.init(
        {
            id: {
                type: db.Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            applicationId: {
                type: db.Sequelize.STRING(255),
                allowNull: true,
                unique: true,
                comment: "For display BSBS546861",
            },
            customerId: {
                type: db.Sequelize.INTEGER,
                allowNull: false,
            },
            associatedCustomerId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            userId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            assignUsersData:{
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
            },
            applicationData: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
            },
            applicantName: {
                type: db.Sequelize.STRING(255),
                allowNull: true,
            },
            signatureImageId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            turnAroundTime: {
                type: db.Sequelize.DATE,
                allowNull: true,
                comment: "TAT",
            },
            issuedDocumentId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            status: {
                type: db.Sequelize.ENUM,
                values: ["0", "1", "2", "3", "4", "5", "6", "7"],
                defaultValue: "0",
                allowNull: false,
                comment:
                    "0 = Incomplete | 1 = Pending | 2 = In Progress | 3 = Checked & Verified | 4 = Auto Pay | 5 = Approved | 6 = Rejected | 7 = Shipped",
            },
            transactionId: {
                type: db.Sequelize.STRING(255),
                allowNull: true,
            },
            transactionStatus: {
                type: db.Sequelize.ENUM,
                values: ["0", "1", "2", "3"],
                defaultValue: "0",
                allowNull: false,
                comment: "0 = Pending | 1 = Success | 2 = Failed | 3 = Refund",
            },
            isBooking: {
                type: db.Sequelize.ENUM,
                values: ["0", "1"],
                defaultValue: "0",
                allowNull: false,
                comment: "0 = Not Booking | 1 = Booking",
            },
            bookingDetails: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
                comment: "Booking Details",
            },
            visitorId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
                comment: "visitor Id",
            },
            rating: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            ratingFeedback: {
                type: db.Sequelize.STRING(255),
                allowNull: true,
            },
            workflowData: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
            },
            workflowIndex: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            serviceData: {
                type: db.Sequelize.JSON,
                allowNull: true,
            },
            applicationStep: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
            },
            paymentToken: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true
            },
            defaultPaymentDetails: {
                type: db.Sequelize.TEXT("long"),
                allowNull: true,
                comment: "payment details for renew application autopay"
            },
            certificateGenerateDate: {
                type: db.Sequelize.DATE,
                allowNull: true,
            },
            uploadedDocuments: {
                type: db.Sequelize.JSON,
                allowNull: true,
            },
            expiryDate: {
                type: db.Sequelize.DATE,
                allowNull: true,
                comment: "365 days default expiry days for expire application",
            },
            renewDate: {
                type: db.Sequelize.DATE,
                allowNull: true,
                comment: "application renew date",
            },
            autoRenew: {
                type: db.Sequelize.ENUM,
                values: ["0", "1"],
                defaultValue: "0",
                allowNull: false,
                comment: "0 = False | 1 = True",
            },
            createdDate: {
                type: db.Sequelize.DATE,
                defaultValue: db.Sequelize.NOW,
                comment: "Date of application",
            },
            updateDate: {
                type: db.Sequelize.DATE,
                defaultValue: db.Sequelize.NOW,
            },
        },
        {
            sequelize: db.sequelize,
            modelName: "application",
            timestamps: false,
        }
    );

    return ApplicationModel;
};

module.exports = createApplicationModel;