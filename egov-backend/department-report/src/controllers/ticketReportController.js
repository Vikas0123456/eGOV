const { getTeamRequestTicketgraphdata } = require("../services/departmentReport.service");
const { createTicketReport,updateTicketReport} = require("../services/ticketReport.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fs = require("fs");

const createTicketDepartmentReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await createTicketReport(reqBody);
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
const updateTicketDepartmentReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await updateTicketReport(reqBody);
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

const teamReuestTicketgraphdata = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await getTeamRequestTicketgraphdata(reqBody)
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.DEPARTMENT.APPLICATION_REPORT_FETCH,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
}
module.exports = {
  createTicketDepartmentReport,
  updateTicketDepartmentReport,
  teamReuestTicketgraphdata
};
