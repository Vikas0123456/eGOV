
const { getRoleModulePermissionsData } = require("../services/roleModulePermission.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getRoleModulePermission = async (req, res) => {
  try { 
    const { roleId} = req.body.data;
    let roleModulePermission = await getRoleModulePermissionsData(roleId );
    if (roleModulePermission) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ROLES_MODULE_PERMISSIONS.FETCH_SUCCESS,
        success: true,
        data: [...roleModulePermission ],
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.ROLES_MODULE_PERMISSIONS.FETCH_FAILED,
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
  getRoleModulePermission,
};
