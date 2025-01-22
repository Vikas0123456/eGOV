const { default: axios } = require("axios");
const { applicationReportModel } = require("../models");
const { Op, where } = require("sequelize");

const createApplicationReport = async (reqBody) => {
  try {
    const result = await applicationReportModel.create(reqBody);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateApplicationReport = async (reqBody) => {
  try {
    const { oldUserId, userId, applicationId, serviceSlug } = reqBody;
    const result = await applicationReportModel.update(reqBody, {
      where: {
        userId: oldUserId,
        applicationId: applicationId,
      },
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createApplicationReport,
  updateApplicationReport,
};
