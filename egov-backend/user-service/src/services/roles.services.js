const { Op } = require("sequelize");
const {
  rolesModel,
  rolesModulesPermissionsModel,
  usersModel,
  permissionModel,
  modulesModel,
} = require("../models");
const { sequelize } = require("../config/db.connection");
const { extractDataFromRequest, generateAuditLog } = require("./auditLog.service");
const { default: axios } = require("axios");

const rolesFindByName = async (roleName) => {
  try {
    return rolesModel.findCountCountAll({
      where: {
        roleName: roleName,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};

const getRolesData = async (
  id,
  page,
  perPage,
  departmentId,
  isCoreTeam,
  isSupportTeam,
  roleName,
  sortOrder,
  orderBy = "roleName"
) => {
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

    if (id) {
      // If ID is provided, fetch a single department by ID
      const result = await rolesModel.findAndCountAll({
        where: {
          id: id,
          isDeleted: "0",
        },
        attributes: [
          "id",
          "roleName",
          "departmentId",
          "isCoreTeam",
          "isAdmin",
          "isSupportTeam",
          "createdDate",
          "updateDate",
        ],
        raw: true,
      });

      result.rows = result.rows.map((row) => ({
        ...row,
        departmentName: getDepartmentNameById(row.departmentId, departmentsData),
      }));

      return result;
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;
      const whereClause = {
        isDeleted: "0",
      };

      if (departmentId && roleName) {
        // Apply search filter by both departmentId and roleName using AND operator
        whereClause[Op.and] = [
          {
            departmentId: departmentId,
          },
          {
            roleName: {
              [Op.like]: `%${roleName}%`,
            },
          },
        ];
      } else if (departmentId) {
        // Apply search filter by departmentId only
        whereClause.departmentId = departmentId;
      } else if (roleName) {
        // Apply search filter by roleName only
        whereClause.roleName = {
          [Op.like]: `%${roleName}%`,
        };
      } else if (isCoreTeam) {
        // Apply search filter by isCoreTeam only
        whereClause.isCoreTeam = isCoreTeam;
      } else if (isSupportTeam){
        whereClause.isSupportTeam = isSupportTeam;

      }
      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      const result = await rolesModel.findAndCountAll({
        where: whereClause,
        attributes: [
          "id",
          "roleName",
          "departmentId",
          "isCoreTeam",
          "isAdmin",
          "isSupportTeam",
          "createdDate",
          "updateDate",
        ],
        raw: true,
        limit: actualPerPage,
        order: order,
        offset: offset,
      });

      result.rows = result.rows.map((row) => ({
        ...row,
        departmentName: getDepartmentNameById(row.departmentId, departmentsData),
      }));

      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const createNewRoles = async (requestBody, req) => {
  try {
    const { roleName, departmentId, isCoreTeam,isSupportTeam,isAdmin } = requestBody.role;

    if (!Array.isArray(departmentId)) {
      throw new Error("Department ID should be an array.");
    }

    const createdRoles = [];

    if (departmentId.length > 0) {
      for (const deptId of departmentId) {
        const roleData = {
          roleName: roleName,
          departmentId: deptId,
          isCoreTeam: isCoreTeam,
          isAdmin:isAdmin,
          isSupportTeam:isSupportTeam,
        };
        const role = await rolesModel.create(roleData);
        createdRoles.push(role);

        // Iterate over modules
        for (const module of requestBody.modules) {
          const moduleId = module.moduleId;
          const modulePermissions = module.modulePermissions;

          // Create a record in roleModulePermission table for each modulePermission
          for (const permissionId of modulePermissions) {
            const roleModulePermissionData = {
              roleId: role.id,
              modulesId: moduleId,
              modulesPermissionsId: permissionId,
            };
            await rolesModulesPermissionsModel.create(roleModulePermissionData);
          }
        }
      }
    } else {
      const roleData = {
        roleName: roleName,
        departmentId: isCoreTeam === "1" || isSupportTeam === "1" ? null : departmentId,
        isCoreTeam: isCoreTeam,
        isAdmin:isAdmin,
        isSupportTeam:isSupportTeam,
      };
      const role = await rolesModel.create(roleData);
      createdRoles.push(role);

      // Iterate over modules
      for (const module of requestBody.modules) {
        const moduleId = module.moduleId;
        const modulePermissions = module.modulePermissions;

        // Create a record in roleModulePermission table for each modulePermission
        for (const permissionId of modulePermissions) {
          const roleModulePermissionData = {
            roleId: role.id,
            modulesId: moduleId,
            modulesPermissionsId: permissionId,
          };
          await rolesModulesPermissionsModel.create(roleModulePermissionData);
        }
      }
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Roles",
        requestBody,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return createdRoles;
  } catch (error) {
    throw new Error(error);
  }
};

const updateRolesData = async (roleId, updatedData, req) => {
  try {
    const { roleName, departmentId, isCoreTeam,isSupportTeam,isAdmin} = updatedData.role;
    const updatedDepartmentId = isCoreTeam === "1" || isSupportTeam === "1" ? null : departmentId;
    // Update role details
    const [roleUpdate] = await rolesModel.update(
      {
        roleName: roleName,
        departmentId: updatedDepartmentId,
        isCoreTeam: isCoreTeam,
        isSupportTeam :isSupportTeam,
        isAdmin:isAdmin,
      },
      {
        where: {
          id: roleId,
        },
      }
    );
    // if (updatedRowCount === 0) {
    //     throw new Error("Role not found.");
    // }

    const updatedModules = updatedData.modules;

    // Loop through updated modules
    for (const updatedModule of updatedModules) {
      const moduleId = updatedModule.moduleId;
      const modulePermissions = updatedModule.modulePermissions;
      // Find existing module permissions for the given module and role
      const existingPermissions = await rolesModulesPermissionsModel.findAll({
        where: { roleId: roleId, modulesId: moduleId },
      });

      // Extract existing permission ids
      const existingPermissionIds = existingPermissions.map(
        (permission) => permission.modulesPermissionsId
      );

      // Remove permissions not present in the updated list
      const permissionsToRemove = existingPermissionIds.filter(
        (permissionId) => !modulePermissions.includes(permissionId)
      );
      await rolesModulesPermissionsModel.destroy({
        where: {
          roleId: roleId,
          modulesId: moduleId,
          modulesPermissionsId: permissionsToRemove,
        },
      });

      // Add new permissions
      const permissionsToAdd = modulePermissions.filter(
        (permissionId) => !existingPermissionIds.includes(permissionId)
      );
      for (const permissionId of permissionsToAdd) {
        const roleModulePermissionData = {
          roleId: roleId,
          modulesId: moduleId,
          modulesPermissionsId: permissionId,
        };
        await rolesModulesPermissionsModel.create(roleModulePermissionData);
      }
    }

    const currentRecord = await rolesModel.findOne({
      where: {
        id: roleId,
      },
    });

    if (!currentRecord) {
      return { success: false, message: "Roles record not found" };
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;

    try {
      await generateAuditLog(
        roleId,
        "Update",
        "Roles",
        updatedData,
        currentRecord.dataValues,
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return { role: updatedData.role, modules: updatedModules };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const checkRoleAssign = async (roleId) => {
  try {
    // Search for users with the specified roleId
    const userCount = await usersModel.count({
      where: {
        roleId: roleId,
      },
    });
    // If userCount is greater than 0, roleId is assigned to some user
    if (userCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const deleteRolesById = async (roleId, req) => {
  try {
    if (roleId) {
      const [roleDeleted] = await rolesModel.update(
        { isDeleted: "1" },
        {
          where: {
            id: roleId,
          },
        }
      );
      const { userId: extractedUserId, ipAddress } =
      extractDataFromRequest(req);
    const finalUserId = extractedUserId;

    try {
      await generateAuditLog(
        roleId,
        "Delete",
        "Roles",
        roleId,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

      return roleDeleted;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const getModulePermissions = async (roleId) => {
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

    const permissions = await permissionModel.findAndCountAll({
      raw: true,
    });
    const modules = await modulesModel.findAndCountAll({
      raw: true,
    });

    const result = await rolesModulesPermissionsModel.findAndCountAll({
      where: {
        roleId: roleId,
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
        "role.departmentId",
        [sequelize.col("role.isCoreTeam"), "isCoreTeam"],
        [sequelize.col("role.isSupportTeam"), "isSupportTeam"],
        [sequelize.col("role.isAdmin"), "isAdmin"],
        [sequelize.col("module.id"), "moduleId"],
        [sequelize.col("module.moduleName"), "moduleName"],
        "modulesPermissionsId",
      ],
      raw: true,
    });
    const permissionsMap = Object.fromEntries(
      permissions.rows.map((permission) => [permission.id, permission])
    );

    // Initialize allModules with an empty Permissions array if it doesn't exist
    modules.rows.forEach((module) => (module.permissions = []));

    // Iterate through RoleP and update allModules
    result.rows.forEach((role) => {
      const moduleIndex = modules.rows.findIndex(
        (module) => module.id === role.moduleId
      );
      if (moduleIndex !== -1) {
        // Find the permission object using modulesPermissionsId
        const permission = permissionsMap[role.modulesPermissionsId];
        if (permission) {
          // Push the permission to the Permissions array of the module
          modules.rows[moduleIndex].permissions.push(permission);
        }
        modules.rows[moduleIndex].roleId = role.roleId;
        modules.rows[moduleIndex].roleName = role.roleName;
        modules.rows[moduleIndex].isCoreTeam = role.isCoreTeam;
        modules.rows[moduleIndex].isSupportTeam = role.isSupportTeam;
        modules.rows[moduleIndex].isAdmin = role.isAdmin;
        modules.rows[moduleIndex].departmentName = getDepartmentNameById(
          role.departmentId,
          departmentsData
        );
      }
    });
    // Modify the structure to include {} for modules with no permissions
    modules.rows.forEach((module) => {
      if (module.permissions.length === 0) {
        module.permissions = [{}];
      }
    });

    return modules

  } catch (error) {
    throw new Error(error);
  }
};

const roleUserList = async () => {
  try {
    const rolesData = await rolesModel.findAll({
      where: {
        isAdmin: "1",
      },
      raw: true
    });

    const roleIds = rolesData.map(role => role.id);

    const rolesMap = rolesData.reduce((acc, role) => {
      acc[role.id] = role.isAdmin;
      return acc;
    }, {});

    const usersData = await usersModel.findAll({
      where: {
        roleId: {
          [Op.in]: roleIds
        }
      },
      raw: true
    });

    const usersWithAdminStatus = usersData.map(user => ({
      ...user,
      isAdmin: rolesMap[user.roleId]
    }));

    const userIdsWithCondition = usersWithAdminStatus
      .filter(user => user.isCoreTeam === "1" && user.isAdmin === "1")
      .map(user => user.id);

    const allUserIds = usersData.map(user => user.id);

    return {
      userIdsWithCondition: userIdsWithCondition,
      allUserIds: allUserIds
    };

  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNewRoles,
  rolesFindByName,
  getRolesData,
  updateRolesData,
  deleteRolesById,
  checkRoleAssign,
  getModulePermissions,
  roleUserList
};
