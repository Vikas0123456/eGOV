const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class workflowActionModel extends Model {}

workflowActionModel = sequelize.define(
  "workflow_actions",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    actionFor: {
      type: Sequelize.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
    actionName: {
      type: Sequelize.STRING,
    },
    actionSlug: {
      type: Sequelize.STRING(255),
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updateDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
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

module.exports = workflowActionModel;
