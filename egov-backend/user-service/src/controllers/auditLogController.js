const {
  generateAuditLog,
  getAuditLogData,
  getAllModulesData,
} = require("../services/auditLog.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createAuditLog = async (req, res) => {
  try {
    const { recordId, action, moduleName, newValue, oldValue, type, userId, customerId, ipAddress } =
      req.body.data;
    if (!action || !moduleName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.AUDIT_LOG.MISSING_REQUIRED_FIELDS,
        success: false,
        data: {},
      });
    }

    const newFeedback = await generateAuditLog(
      recordId,
      action,
      moduleName,
      newValue,
      oldValue,
      type,
      userId,
      customerId,
      ipAddress
    );

    if (newFeedback) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.AUDIT_LOG.ADDED_SUCCESS,
        success: true,
        data: newFeedback,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.AUDIT_LOG.ADDED_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.error("Error creating audit log:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const {
      id,
      page,
      perPage,
      dateRange,
      searchFilter,
      sortOrder,
      orderBy,
      selectedModule,
      selectedType,
    } = req.body.data;

    let logData = await getAuditLogData(
      id,
      page,
      perPage,
      dateRange,
      searchFilter,
      sortOrder,
      orderBy,
      selectedModule,
      selectedType
    );

    if (logData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.AUDIT_LOG.FETCH_SUCCESS,
        success: true,
        data: { ...logData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.AUDIT_LOG.FETCH_FAILED,
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

const getAllModules = async (req, res) => {
  try {
    const { searchQuery } = req.body.data;
    const fetchAllModules = await getAllModulesData(searchQuery);
    if (fetchAllModules) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.AUDIT_LOG.FETCH_SUCCESS,
        success: true,
        data: { moduleName: fetchAllModules },
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
  createAuditLog,
  getAuditLog,
  getAllModules,
};
