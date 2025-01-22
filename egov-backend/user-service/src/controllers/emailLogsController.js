const {
  sendEmailLogs,
  getEmailLogsList,
  getModulesData,
} = require("../services/emailLogs.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createEmailLogs = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const processLog = async (log) => {
      await sendEmailLogs(
        log.moduleName,
        log.sender_email,
        log.recipient_email,
        log.subject,
        log.content,
        log.sender_type,
        log.isMailedSuccess
      );
    };

    if (Array.isArray(reqBody)) {
      await Promise.all(reqBody.map(processLog));
    } else if (typeof reqBody === "object") {
      await processLog(reqBody);
    } else {
      return res.status(400).json({
        message: "Invalid data format",
        success: false,
        data: {},
      });
    }

    return res.status(200).json({
      message: "Email logs added successfully",
      success: true,
      data: reqBody,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      data: {},
    });
  }
};

const getEmailLogs = async (req, res) => {
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
      selectedSenderType,
      selectedType,
    } = req.body.data;

    let emailLogData = await getEmailLogsList(
      id,
      page,
      perPage,
      dateRange,
      searchFilter,
      sortOrder,
      orderBy,
      selectedModule,
      selectedSenderType,
      selectedType
    );
    if (emailLogData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.EMAIL_LOGS.FETCH_SUCCESS,
        success: true,
        data: { ...emailLogData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.EMAIL_LOGS.FETCH_FAILED,
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
    const fetchAllModules = await getModulesData(searchQuery);
    if (fetchAllModules) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.EMAIL_LOGS.FETCH_SUCCESS,
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
  createEmailLogs,
  getEmailLogs,
  getAllModules,
};
