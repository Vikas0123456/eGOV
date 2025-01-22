const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");

class tableColumnConfigModel extends Model {}

tableColumnConfigModel = sequelize.define(
  "table_column_config",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    tableName: {
        type: Sequelize.STRING(255),
    },
    tableConfig: {
        type: Sequelize.TEXT("long"),
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

module.exports = tableColumnConfigModel;
