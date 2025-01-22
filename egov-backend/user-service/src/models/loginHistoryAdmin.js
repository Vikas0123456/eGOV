const { Model } = require("sequelize");
const { sequelize, Sequelize } = require("../config/db.connection");
const usersModel = require("./users");

class logiHistoryAdminModel extends Model {}

logiHistoryAdminModel.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  userEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  browserInfo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  ipAddress: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  os: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isLoginSuccess: {
    type: Sequelize.ENUM,
    values: ["0", "1"],
  },
  logoutTime: {
    type: Sequelize.DATE,
  },
  createdDate: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updateDate: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  sequelize,
  modelName: "login_history_admin",
  indexes: [
    {
      unique: true,
      using: "BTREE",
      fields: ["id"],
    },
  ],
  timestamps: false,
});

module.exports = logiHistoryAdminModel;
