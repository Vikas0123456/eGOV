const { Model } = require("sequelize");

class ApplicationLogModel extends Model {}

const createApplicationLogModel = (db) => {
    ApplicationLogModel.init(
        {
            id: {
                type: db.Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            applicationId: {
                type: db.Sequelize.INTEGER,
                allowNull: false,
            },
            customerId: {
                type: db.Sequelize.INTEGER,
                allowNull: false,
            },
            userId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            documentId: {
                type: db.Sequelize.INTEGER,
                allowNull: true,
            },
            description: {
                type: db.Sequelize.TEXT('long'),
                allowNull: true,
            },
            logBy: {
                type: db.Sequelize.ENUM,
                values: ["0", "1"],
                allowNull: false,
                defaultValue: '0',
                comment: '0 = userId | 1 = customerId',
            },
            oldStatus: {
                type: db.Sequelize.ENUM,
                values: ["0", "1", "2", "3", "4", "5", "6"],
                allowNull: true,
                comment: '0 = Incomplete | 1 = Checked & Verified | 2 = Pending | 3 = In Progress | 4 = Approved | 5 = Shipped | 6 = Rejected',
            },
            newStatus: {
                type: db.Sequelize.ENUM,
                values: ["0", "1", "2", "3", "4", "5", "6"],
                allowNull: true,
                comment: '0 = Incomplete | 1 = Checked & Verified | 2 = Pending | 3 = In Progress | 4 = Approved | 5 = Shipped | 6 = Rejected',
            },
            createdDate: {
                type: db.Sequelize.DATE,
                defaultValue: db.Sequelize.NOW,
            },
        },
        {
            sequelize: db.sequelize,
            modelName: "application_log",
            timestamps: false,
        }
    );

    return ApplicationLogModel;
};

module.exports = createApplicationLogModel;
