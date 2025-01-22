const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const customerModel = require("./customer");

class feedbackModel extends Model {}

feedbackModel = sequelize.define(
  "feedback",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: Sequelize.INTEGER,
    },
    rating: {
      type: Sequelize.INTEGER,
    },
    note: {
      type: Sequelize.TEXT,
    },
    type: {
      type: Sequelize.ENUM,
      values: ["0", "1", "2"],
    },
    departmentId: {
        type: Sequelize.INTEGER,
      },
    createdDate: {
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


feedbackModel.belongsTo(customerModel, { foreignKey: 'customerId' });
customerModel.hasMany(feedbackModel, { foreignKey: 'customerId' });


module.exports = feedbackModel;
