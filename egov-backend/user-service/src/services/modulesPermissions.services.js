const { Op } = require("sequelize");
const { modulesPermissionModel } = require("../models");

const getModulePermissionsData = async (id) => {
  try {
    if (id) {
      // If ID is provided, fetch a single department by ID
      return await modulesPermissionModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const result = await modulesPermissionModel.findAndCountAll();

      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
    getModulePermissionsData,
};
