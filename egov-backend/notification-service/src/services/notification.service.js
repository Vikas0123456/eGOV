const { Op } = require("sequelize");
const { notificationModel } = require("../models");
const { default: axios } = require("axios");
const { Sequelize } = require("../config/db.connection");
const { fetchUserData, fetchCustomerData } = require("./cacheUtility");

const storeNotification = async (reqBody) => {
  try {
    const result = await notificationModel.create(reqBody);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const storeMultipleNotifications = async (reqBodies) => {
  try {
    const result = await notificationModel.bulkCreate(reqBodies);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const userNotificationFetch = async (userId, page, perPage, orderBy = "id") => {
  try {
    const actualPage = (page && parseInt(page, 10)) || 1;
    const actualPerPage = (perPage && parseInt(perPage, 10)) || 10;
    const offset = (actualPage - 1) * actualPerPage;

    const where = {
      [Op.and]: [
        {
          [Op.or]: [{ userId },
          ],
        },
      ],
    };

    const notifications = await notificationModel.findAll({
      where,
      limit: actualPerPage,
      order: [[orderBy, "DESC"]],
      offset,
      raw: true,
    });

    let userData = null;
    try {
      userData = await
        axios.post(`${process.env.USERSERVICE}/user/getAlluser`);
    } catch (error) {
      console.error(error.message);
      userData = [];
    }

    const count = await notificationModel.count({ where });

    const userMap = new Map();
    if (
      userData &&
      userData.data &&
      userData.data.data &&
      userData.data.data.rows
    ) {
      userData.data.data.rows.forEach((user) => {
        userMap.set(user.id);
      });
    }

    const notificationsData = notifications.map((notification) => {
      return {
        ...notification,
      };
    });

    const isReadCount = await notificationModel.count({
      where: {
        isRead: "0",
        userId
      },
      raw: true,
    });

    return {
      notifications: notificationsData,
      count,
      page: actualPage,
      perPage: actualPerPage,
      isReadCount: isReadCount || 0,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const customerNotificationFetch = async (
  customerId,
  page,
  perPage,
  orderBy = "id"
) => {
  try {
    const actualPage = (page && parseInt(page, 10)) || 1;
    const actualPerPage = (perPage && parseInt(perPage, 10)) || 10;
    const offset = (actualPage - 1) * actualPerPage;

    const where = { customerId };

    const filters = [
      { [Op.or]: [{ status: "1" }, { status: { [Op.is]: null } }] },
    ];

    filters.forEach((filter) => {
      Object.assign(where, filter);
    });

    const notifications = await notificationModel.findAll({
      where,
      limit: actualPerPage,
      order: [[orderBy, "DESC"]],
      offset,
      raw: true,
    });

    let userData = null;
    try {
      userData = await
        axios.post(
          `${process.env.USERSERVICE}/customer/customerList`
        );
    } catch (error) {
      console.error(error.message);
      userData = [];
    }

    const count = await notificationModel.count({ where });

    const isReadCount = await notificationModel.count({
      where: {
        isRead: "0",
        customerId
      },
      raw: true,
    });

    return {
      notifications: notifications,
      count,
      page: actualPage,
      perPage: actualPerPage,
      isReadCount: isReadCount || 0,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateCustomerNotificationData = async (customerId, isRead) => {
  try {
    const notifications = await notificationModel.findAll({
      where: {
        customerId: customerId,
      },
    });

    if (notifications.length === 0) {
      return { success: false, message: "No notification records found" };
    }

    const updatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        return await notification.update({ isRead: isRead });
      })
    );

    return updatedNotifications;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateUserNotificationData = async (userId, isRead) => {
  try {
    const notifications = await notificationModel.findAll({
      where: {
        userId: userId,
      },
    });

    if (notifications.length === 0) {
      return { success: false, message: "No notification records found" };
    }

    const updatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        return await notification.update({ isRead: isRead });
      })
    );

    return updatedNotifications;
  } catch (error) {
    return { success: false, message: error.message };
  }
};


module.exports = {
  storeNotification,
  storeMultipleNotifications,
  userNotificationFetch,
  customerNotificationFetch,
  updateCustomerNotificationData,
  updateUserNotificationData
};
