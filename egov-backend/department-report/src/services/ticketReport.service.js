const { default: axios } = require("axios");
const { ticketReportModel } = require("../models");
const { Op, where } = require("sequelize");

const createTicketReport = async (reqBody) => {
  try {
    const result = await ticketReportModel.create(reqBody);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const updateTicketReport = async (updatedData) => {
  try {
    const { oldUserId, ticketId } = updatedData;
    const result = await ticketReportModel.update(updatedData, {
      where: {
        ticketId: ticketId,
      },
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createTicketReport,
  updateTicketReport,
};
