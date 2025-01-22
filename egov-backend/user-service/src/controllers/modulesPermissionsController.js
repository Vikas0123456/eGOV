
const { getModulePermissionsData } = require("../services/modulesPermissions.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getModulePermission = async (req, res) => {
  try {
    const { id } = req.body.data;
    let modulePermissions = await getModulePermissionsData(id);
    if (modulePermissions) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.MODULES_PERMISSIONS.FETCH_SUCCESS,
        success: true,
        data: { ...modulePermissions },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.MODULES_PERMISSIONS.FETCH_FAILED,
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
  getModulePermission,
};
