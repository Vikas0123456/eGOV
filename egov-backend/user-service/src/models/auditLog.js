const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const usersModel = require("./users");
const customerModel = require("./customer");

class auditLogModel extends Model {}

auditLogModel = sequelize.define(
    "audit_log",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        customerId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        action: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        moduleName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        recordId: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        ipAddress: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        newValue: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        oldValue: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        type: {
            type: Sequelize.ENUM,
            values: ["0", "1", "2"],
            // defaultValue: "0",
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

auditLogModel.belongsTo(usersModel, { foreignKey: "userId", as: "user" });
auditLogModel.belongsTo(customerModel, { foreignKey: "customerId", as: "customer" });

module.exports = auditLogModel;