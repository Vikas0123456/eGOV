const {
  getModulesData,
  getPermissionsService,
  getModulePermissionsService,
} = require("../services/modules.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getModules = async (req, res) => {
  try {
    const { id } = req.body.data;
    let modulePermissions = await getModulesData(id);
    if (modulePermissions) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.MODULES.FETCH_SUCCESS,
        success: true,
        data: { ...modulePermissions },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.MODULES.FETCH_FAILED,
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

const getPermissions = async (req, res) => {
  try {
    const result = await getPermissionsService();
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.PERMISSIONS.FETCH_SUCCESS,
        success: true,
        data: result,
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
const getModulePermissions = async (req, res) => {
  try {
    const result = await getModulePermissionsService();
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.PERMISSIONS.FETCH_SUCCESS,
        success: true,
        data: result,
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
  getModules,
  getPermissions,
  getModulePermissions
};
