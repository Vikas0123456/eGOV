const { findLoginSession } = require("../services/customer.service");
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
      next();
    }
  } catch (error) {
    return null;
  }
};

module.exports = {
  verifyTokenAndSetData,
};
