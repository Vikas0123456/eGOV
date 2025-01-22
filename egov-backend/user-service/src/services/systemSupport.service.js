const { systemSupportTypeModel, systemSupportModel } = require("../models");
const { Op } = require("sequelize");

const getSystemSupportTypeList = async () => {
  try {
    return await systemSupportTypeModel.findAndCountAll();
  } catch (error) {
    throw new Error(error);
  }
};

const generateSupport = async (body) => {
  try {
    return await systemSupportModel.create(body);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getSystemSupportTypeList,
  generateSupport,
};
