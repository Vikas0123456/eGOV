const { Op } = require("sequelize");
const {
  rolesModulesPermissionsModel,
  modulesModel,
  rolesModel,
  modulesPermissionModel,
} = require("../models");
const { sequelize } = require("../config/db.connection");
const { default: axios } = require("axios");

const getRoleModulePermissionsData = async (searchByRoleId) => {
  try {
    let departmentsData;
    try {
      const documentResponse = await axios.post(
        `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
      );
      departmentsData = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    function getDepartmentNameById(departmentId, departmentsData) {
      if (!departmentId || !departmentsData) return null;
      const department = departmentsData.find(
        (dept) => dept.id == departmentId
      );
      return department ? department.departmentName : null;
    }

    if (searchByRoleId) {
      const result = await rolesModulesPermissionsModel.findAndCountAll({
        where: {
          roleId: searchByRoleId,
        },
        include: [
          {
            model: modulesModel,
            required: false,
            attributes: [],
          },
          {
            model: rolesModel,
            required: false,
            attributes: [],
          },
        ],
        attributes: [
          "roleId",
          [sequelize.col("role.roleName"), "roleName"],
          [sequelize.col("role.departmentId"), "departmentId"],
          [sequelize.col("role.isCoreTeam"), "isCoreTeam"],
          [sequelize.col("role.isSupportTeam"), "isSupportTeam"],
          [sequelize.col("role.isAdmin"), "isAdmin"],
          [sequelize.col("module.id"), "moduleId"],
          [sequelize.col("module.moduleName"), "moduleName"],
          "modulesPermissionsId",
        ],
        raw: true,
      });

      const restructuredData = [];

      result?.rows?.forEach((item) => {
        let roleIndex = restructuredData.findIndex(
          (role) => role.role.roleId === item.roleId
        );

        if (roleIndex === -1) {
          restructuredData.push({
            role: {
              roleId: item.roleId,
              roleName: item.roleName,
              departmentId: [item.departmentId],
              departmentName: getDepartmentNameById(item.departmentId, departmentsData),
              isCoreTeam: item.isCoreTeam === "1" ? "1" : "0",
              isSupportTeam: item.isSupportTeam === "1" ? "1" : "0",
              isAdmin: item.isAdmin === "1" ? "1" : "0",
            },
            modules: [
              {
                moduleId: item.moduleId,
                moduleName: item.moduleName,
                modulePermissions: [item.modulesPermissionsId],
              },
            ],
          });
        } else {
          let moduleIndex = restructuredData[roleIndex].modules.findIndex(
            (module) => module.moduleId === item.moduleId
          );

          if (moduleIndex === -1) {
            restructuredData[roleIndex].modules.push({
              moduleId: item.moduleId,
              moduleName: item.moduleName,
              modulePermissions: [item.modulesPermissionsId],
            });
          } else {
            restructuredData[roleIndex].modules[moduleIndex].modulePermissions.push(
              item.modulesPermissionsId
            );
          }

          if (!restructuredData[roleIndex].role.departmentId.includes(item.departmentId)) {
            restructuredData[roleIndex].role.departmentId.push(item.departmentId);
          }
        }
      });

      return restructuredData;
    } else {
      const result = await rolesModulesPermissionsModel.findAndCountAll({
        include: [
          {
            model: modulesModel,
            required: false,
            attributes: [],
          },
          {
            model: rolesModel,
            required: false,
            attributes: [],
          },
        ],
        attributes: [
          "roleId",
          [sequelize.col("role.roleName"), "roleName"],
          [sequelize.col("role.departmentId"), "departmentId"],
          [sequelize.col("role.isCoreTeam"), "isCoreTeam"],
          [sequelize.col("role.isSupportTeam"), "isSupportTeam"],
          [sequelize.col("role.isAdmin"), "isAdmin"],
          [sequelize.col("module.id"), "moduleId"],
          [sequelize.col("module.moduleName"), "moduleName"],
          "modulesPermissionsId",
        ],
        raw: true,
      });

      const restructuredData = [];

      result?.rows?.forEach((item) => {
        let roleIndex = restructuredData.findIndex(
          (role) => role.role.roleId === item.roleId
        );

        if (roleIndex === -1) {
          restructuredData.push({
            role: {
              roleId: item.roleId,
              roleName: item.roleName,
              departmentId: [item.departmentId],
              departmentName: getDepartmentNameById(item.departmentId, departmentsData),
              isCoreTeam: item.isCoreTeam === "1" ? "1" : "0",
              isSupportTeam: item.isSupportTeam === "1" ? "1" : "0",
              isAdmin: item.isAdmin === "1" ? "1" : "0",
            },
            modules: [
              {
                moduleId: item.moduleId,
                moduleName: item.moduleName,
                modulePermissions: [item.modulesPermissionsId],
              },
            ],
          });
        } else {
          let moduleIndex = restructuredData[roleIndex].modules.findIndex(
            (module) => module.moduleId === item.moduleId
          );

          if (moduleIndex === -1) {
            restructuredData[roleIndex].modules.push({
              moduleId: item.moduleId,
              moduleName: item.moduleName,
              modulePermissions: [item.modulesPermissionsId],
            });
          } else {
            restructuredData[roleIndex].modules[moduleIndex].modulePermissions.push(
              item.modulesPermissionsId
            );
          }

          if (!restructuredData[roleIndex].role.departmentId.includes(item.departmentId)) {
            restructuredData[roleIndex].role.departmentId.push(item.departmentId);
          }
        }
      });

      return restructuredData;
    }
  } catch (error) {
    console.log("error", error);
    throw new Error(error);
  }
};

module.exports = {
  getRoleModulePermissionsData,
};
