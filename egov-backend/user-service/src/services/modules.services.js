const { Op } = require("sequelize");
const {
  modulesModel,
  permissionModel,
  modulesPermissionModel,
} = require("../models");

const getModulesData = async (id) => {
  try {
    if (id) {
      // If ID is provided, fetch a single department by ID
      return await modulesModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const result = await modulesModel.findAndCountAll({
        where: {
          status: "1",
        },
      });

      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getModulePermissionsService = async () => {
  try {
    const modules = await modulesModel.findAndCountAll({
      where: { status: "1" },
      attributes: ["id", "moduleName", "status"],
      raw: true,
    });

    const modulesWithPermissions = await Promise.all(
      modules?.rows?.map(async (module) => {
        const permissions = await modulesPermissionModel.findAndCountAll({
          where: { modulesId: module.id },
          attributes: ["modulesId", "permissionsId"],
          raw: true,
        });

        // Map permissions to their permissionId
        const permissionIds = permissions.rows.map(
          (permission) => permission.permissionsId
        );
        // Return the new module format
        return {
          id: module.id,
          moduleName: module.moduleName,
          modulesPermissions: permissionIds,
        };
      })
    );
    return {
      count: modules?.count,
      rows: modulesWithPermissions,
    };
  } catch (error) {
    throw new Error(error);
  }
};
const getPermissionsService=async()=>{
  try {
    const permissions = await permissionModel.findAndCountAll({});

    return permissions
  } catch (error) {
    throw new Error(error);
  }
}
module.exports = {
  getModulesData,
  getPermissionsService,
  getModulePermissionsService,
};
