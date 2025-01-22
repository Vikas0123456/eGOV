const { tableColumnConfigModel } = require("../models");
const { Op } = require("sequelize");

const createtableConfigService = async (requestBody) => {
  try {
      const { userId, tableName, tableConfig } = requestBody;

      let tableConfigToSave = tableConfig;
      if (Array.isArray(tableConfig)) {
          tableConfigToSave = JSON.stringify(tableConfig);
      }

      const updatedRequestBody = { ...requestBody, tableConfig: tableConfigToSave };

      const existingConfig = await tableColumnConfigModel.findOne({
          where: { userId: userId, tableName: tableName },
      });

      let result;
      if (existingConfig) {
          result = await existingConfig.update(updatedRequestBody);
      } else {
          result = await tableColumnConfigModel.create(updatedRequestBody);
      }

      return result;
  } catch (error) {
      console.error("Error in createtableConfigService:", error);  // Add more detailed error logging
      throw new Error(error.message || error);
  }
};

const getTableConfigService = async (requestBody) => {
  try {
      const { userId } = requestBody;
      const result = await tableColumnConfigModel.findAll({
          where: { userId: userId },
          raw: true,
      });

      const parsedTableConfig = result.map(item => ({
          id: item.id,
          userId: item.userId,
          tableName: item.tableName,
          tableConfig: JSON.parse(item.tableConfig),  // Ensure this is valid JSON
      }));

      return parsedTableConfig;
  } catch (error) {
      console.error("Error in getTableConfigService:", error);  // Add more detailed error logging
      throw new Error(error.message || error);
  }
};


module.exports = {
    createtableConfigService,
    getTableConfigService
};
