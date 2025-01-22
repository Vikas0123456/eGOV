const {
  createApplicationReport,
  updateApplicationReport,
} = require("../services/applicationReport.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fs = require("fs");

const createApplicationDepartmentReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await createApplicationReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_ADDED,
        success: true,
        data: { ...result },
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
const updateApplicationDepartmentReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await updateApplicationReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_UPDATE,
        success: true,
        data: { ...result },
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
module.exports = {
  createApplicationDepartmentReport,
  updateApplicationDepartmentReport,
};
