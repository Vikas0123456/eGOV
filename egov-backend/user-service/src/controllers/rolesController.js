const {
  createNewRoles,
  getRolesData,
  updateRolesData,
  deleteRolesById,
  checkRoleAssign,
  getModulePermissions,
  roleUserList,
} = require("../services/roles.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createRoles = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { roleName } = reqBody.role;

    if (!roleName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ROLES.NAME_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    let newRole = await createNewRoles(reqBody, req);

    if (newRole && newRole.length > 0) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ROLES.ADDED_SUCCESS,
        success: true,
        data: newRole,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const updateRoles = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { roleId, roleName } = reqBody.role;

    if (!roleName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ROLES.NAME_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    let newRole = await updateRolesData(roleId, reqBody, req);

    if (newRole) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ROLES.UPDATE_SUCCESS,
        success: true,
        data: newRole,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};
const getRoles = async (req, res) => {
  try {
    const { id, page, perPage, departmentId, isCoreTeam,isSupportTeam, roleName, sortOrder, orderBy } =
      req.body.data;
    let roleData = await getRolesData(
      id,
      page,
      perPage,
      departmentId,
      isCoreTeam,
      isSupportTeam,
      roleName,
      sortOrder,
      orderBy
    );

    if (roleData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ROLES.FETCH_SUCCESS,
        success: true,
        data: { ...roleData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.ROLES.FETCH_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};
const deleteRoles = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { id } = reqBody;

    if (!id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ROLES.ENTER_ROLE_ID,
        success: false,
        data: {},
      });
    }
    if (id) {
      let checkRoleAssignOrNot = await checkRoleAssign(id);
      if(checkRoleAssignOrNot === true){
        return res.status(401).json({
          message: MESSAGES.ROLES.ROLE_ASSIGNED_ALREADY,
          success: false,
          data: {},
        });
      }
      if (checkRoleAssignOrNot === false) {
        let roleDeleted = await deleteRolesById(id, req);
        if (roleDeleted) {
          return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.ROLES.DELETE_SUCCESS,
            success: true,
            data: {},
          });
        } else {
          return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.ROLES.DELETE_FAILED,
            success: false,
            data: {},
          });
        }
      }
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getModulePermissionsForUser=async(req,res)=>{
try{
  const reqBody = req.body.data;
  const { roleId } = reqBody;
  
  if(!roleId){
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: MESSAGES.MODULES_PERMISSIONS_USER.ROLE_ID_NOT_FOUND,
      success: false,
      data: {},
    });
  }
  const result = await getModulePermissions(roleId)
  if (result) {
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.MODULES_PERMISSIONS_USER.FETCH_SUCCESS,
      success: true,
      data: result,
    });
  } 
}catch (error) {
  return res.status(STATUS_CODES.SERVER_ERROR).json({
    message: error.message,
    success: false,
    data: {},
  });
}
}

const roleBasedUserData = async (req, res) => {
  try {
    let rolesData = await roleUserList();
    if (rolesData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ROLES.FETCH_SUCCESS,
        success: true,
        data: { rolesData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.ROLES.FETCH_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

module.exports = {
  createRoles,
  getRoles,
  updateRoles,
  deleteRoles,
  getModulePermissionsForUser,
  roleBasedUserData
};
