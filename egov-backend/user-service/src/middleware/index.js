const { blockedIpsModel } = require("../models");
const { findLoginSession } = require("../services/customer.service");
const { findLoginSessionUser } = require("../services/users.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const verifyTokenAndSetData = async (req, res, next) => {
  try {
    const token = req.headers?.jwttoken;
    if (req.headers.jwtpayload) {
      const jwtPayload = JSON.parse(req.headers.jwtpayload);
      if (jwtPayload) {
        req.headers.jwtPayload = jwtPayload;
      }
      if (jwtPayload.customerId && jwtPayload.customerId != "" && token) {
        let auth = await findLoginSession(jwtPayload.customerId, token);
        if (!auth) {
          return res.status(STATUS_CODES.UNAUTHORIZED).json({
            message: MESSAGES.UNAUTHORIZED_REQUEST,
            success: false,
            data: {},
          });
        }
      }
      if (jwtPayload.userId && jwtPayload.userId != "" && token) {
        let auth = await findLoginSessionUser(jwtPayload.userId, token);
        if (!auth) {
          return res.status(STATUS_CODES.UNAUTHORIZED).json({
            message: MESSAGES.UNAUTHORIZED_REQUEST,
            success: false,
            data: {},
          });
        }
      }
      if (jwtPayload?.ip) {
        try {
          const clientIP = jwtPayload?.ip;
          if (clientIP) {
            const ipMatched = await blockedIpsModel.findOne({
              where: { ipAddress: clientIP ,isBlocked : "1"},
            });
            if (ipMatched) {
              return res.status(STATUS_CODES.UNAUTHORIZED).json({
                message: MESSAGES.UNAUTHORIZED_REQUEST,
                success: false,
                data: {},
              });
            }
          }
        } catch (error) {
          console.error("Failed to parse jwtpayload:", error);
        }
      }
      next();
    }
  } catch (error) {
    return null;
  }
};

module.exports = {
  verifyTokenAndSetData,
};
