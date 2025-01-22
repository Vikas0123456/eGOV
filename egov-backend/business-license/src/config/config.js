const { Sequelize } = require("sequelize");
const applicationModel = require("../models/application");
const generalSettingModel = require("../models/generalSetting");
const applicationLogModel = require("../models/applicationLog")

const createSequelizeInstance = async (databaseName) => {
  const sequelize = new Sequelize(
    databaseName,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      define: {
        timestamps: true,
        freezeTableName: true,
      },
      logging: false,
    }
  );
  // Return the sequelize instance
  return sequelize;
};

const allModelAndAssociate = async (req) => {
  req.applicationModel = await applicationModel(req.sequelize);
  req.generalSettingModel = await generalSettingModel(req.sequelize);
  req.applicationLogModel = await applicationLogModel(req.sequelize);

  req.applicationModel.belongsTo(req.applicationLogModel, {
    foreignKey: "applicationId",
  });
  req.applicationLogModel.hasMany(req.applicationModel, {
    foreignKey: "applicationId",
  });
};

module.exports = { createSequelizeInstance, allModelAndAssociate };
