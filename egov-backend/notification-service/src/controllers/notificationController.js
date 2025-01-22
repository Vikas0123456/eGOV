const { notificationModel } = require("../models");
const { storeNotification, userNotificationFetch, customerNotificationFetch, storeMultipleNotifications, updateCustomerNotificationData, updateUserNotificationData } = require("../services/notification.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const { default: axios } = require("axios");


// const createNotification = async (req, res) => {
//   try {
//     const reqBody = req.body.data;
//     let notification = await storeNotification(reqBody);
//     return res.status(STATUS_CODES.SUCCESS).json({
//       message: MESSAGES.NOTIFICATION_ADDED,
//       success: true,
//       data: notification,
//     });
//   } catch (error) {
//     return res.status(STATUS_CODES.SERVER_ERROR).json({
//       message: MESSAGES.SERVER_ERROR,
//       success: false,
//       data: {},
//     });
//   }
// };

const createNotification = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let notifications;

    if (Array.isArray(reqBody)) {
      notifications = await storeMultipleNotifications(reqBody);
    } else {
      notifications = await storeNotification(reqBody);
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.NOTIFICATION_ADDED,
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getUserNotification = async (req, res) => {
  try {
    const { userId, page, perPage, orderBy} = req.body.data;

    const notificationList = await userNotificationFetch(userId, page, perPage, orderBy);

    if (notificationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.NOTIFICATION_FETCHED,
        success: true,
        data: notificationList,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getCustomerNotification = async (req, res) => {
  try {
    const { customerId, page, perPage, } = req.body.data;

    const notificationList = await customerNotificationFetch(customerId, page, perPage,);

    if (notificationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.NOTIFICATION_FETCHED,
        success: true,
        data: notificationList,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const updateCustomerNotification = async (req, res) => {
  try {
    const { customerId, isRead } = req.body.data;

    let updateKnowledgeBase = await updateCustomerNotificationData(customerId, isRead);
    if (updateKnowledgeBase) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.UPDATE_SUCCESS,
        success: true,
        data: updateKnowledgeBase,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
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

const updateUserNotification = async (req, res) => {
  try {
    const { userId, isRead } = req.body.data;

    let updateKnowledgeBase = await updateUserNotificationData(userId, isRead);
    if (updateKnowledgeBase) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.UPDATE_SUCCESS,
        success: true,
        data: updateKnowledgeBase,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
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

const deleteCustomerData = async (req, res) => {
    const { customerId, name, email, ipAddress } = req.body.data;
    try {
        await notificationModel.destroy({ where: { customerId } });

        const auditLogBody = {
            recordId: customerId,
            action: `Customer ( ${name} - ${email} ) notification data deleted successfully`,
            moduleName: "Notification Service",
            newValue: JSON.stringify({
              customerId: customerId,
              name: name,
              email: email
            }),
            oldValue: "N/A",
            type: "2",
            userId: null,
            customerId,
            ipAddress,
        };
        try {
            await axios.post(
                `${process.env.USERSERVICE}/auditLog/create`,
                {
                    data: auditLogBody,
                }
            );
        } catch (error) {
            console.error(error);
        }

        return res.status(STATUS_CODES.SUCCESS).json({
            message: "Data deleted successfully",
            success: true,
            data: {},
        });
    } catch (error) {
        const auditLogBody = {
            recordId: customerId,
            action: `Customer ( ${name} - ${email} ) notification data delete failed`,
            moduleName: "Notification Service",
            newValue: JSON.stringify({
              customerId: customerId,
              name: name,
              email: email
            }),
            oldValue: "N/A",
            type: "2",
            userId: null,
            customerId,
            ipAddress,
        };
        try {
            await axios.post(
                `${process.env.USERSERVICE}/auditLog/create`,
                {
                    data: auditLogBody,
                }
            );
        } catch (error) {
            console.error(error);
        }
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

module.exports = {
    createNotification,
    getUserNotification,
    getCustomerNotification,
    updateCustomerNotification,
    updateUserNotification,
    deleteCustomerData,
};
