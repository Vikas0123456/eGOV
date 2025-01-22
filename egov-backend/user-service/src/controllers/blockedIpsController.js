const {
  createBlockedIpsService,
  updateBlockedIpsService,
  getBlockedIpsService,
  findIpExist,
  deleteBlockedIpsService,
} = require("../services/blockedIps.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createBlockedIps = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { ipAddress } = reqBody;
    const IpFound = await findIpExist(ipAddress);
    if (IpFound) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.BLOCKED_IP.BLOCKED_IP_EXIST,
        success: false,
        data: {},
      });
    }
    let newBlockedIp = await createBlockedIpsService(reqBody, req);

    if (newBlockedIp) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.BLOCKED_IP.ADDED_SUCCESS,
        success: true,
        data: newBlockedIp,
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

const updateBlockedIps = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { id } = req.body.data;

    let updateBlockedIp = await updateBlockedIpsService(id, reqBody, req);
    if (updateBlockedIp) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.BLOCKED_IP.UPDATE_SUCCESS,
        success: true,
        data: updateBlockedIp,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.BLOCKED_IP.UPDATE_FAILED,
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

const deleteBlockedIps = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { id } = reqBody;

    let deleteBlockedIp = await deleteBlockedIpsService(id, req);
    if (deleteBlockedIp) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.BLOCKED_IP.DELETE_SUCCESS,
        success: true,
        data: deleteBlockedIp,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.BLOCKED_IP.DELETE_FAILED,
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
const getBlockedIps = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy } =
      req.body.data;

    let blockedIpsData = await getBlockedIpsService(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy
    );
    if (blockedIpsData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.BLOCKED_IP.FETCH_SUCCESS,
        success: true,
        data: { ...blockedIpsData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.BLOCKED_IP.FETCH_FAILED,
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

module.exports = {
  createBlockedIps,
  updateBlockedIps,
  getBlockedIps,
  deleteBlockedIps,
};
