const { Sequelize } = require("../config/db.connection");

const applicationLogModel = (sequelize) => {
  return sequelize.define(
    "application_log",
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
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      logBy: {
        type: Sequelize.ENUM,
        values: ["0", "1"],
        allowNull: false,
        defaultValue: "0",
        comment: "0 = userId | 1 = customerId",
      },
      oldStatus: {
        type: Sequelize.ENUM,
        values: ["0", "1", "2", "3", "4", "5", "6"],
        allowNull: true,
        comment:
          "0 = Incomplete | 1 = Checked & Verified | 2 = Pending | 3 = In Progress | 4 = Approved | 5 = Shipped | 6 = Rejected",
      },
      newStatus: {
        type: Sequelize.ENUM,
        values: ["0", "1", "2", "3", "4", "5", "6"],
        allowNull: true,
        comment:
          "0 = Incomplete | 1 = Checked & Verified | 2 = Pending | 3 = In Progress | 4 = Approved | 5 = Shipped | 6 = Rejected",
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
          fields: ["logBy"],
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
};

module.exports = applicationLogModel;
