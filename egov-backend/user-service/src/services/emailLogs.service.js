const emailLogsModel = require("../models/emailLogs");
const { Op } = require("sequelize");

const sendEmailLogs = async (
  moduleName,
  sender_email,
  recipient_email,
  subject,
  content,
  sender_type,
  isMailedSuccess
) => {
  try {
    const emailRecord = await emailLogsModel.create({
      moduleName,
      sender_email,
      recipient_email,
      subject,
      content,
      sender_type,
      isMailedSuccess,
    });
    return emailRecord;
  } catch (error) {
    throw new Error(error);
  }
};

const getEmailLogsList = async (
  id,
  page,
  perPage,
  dateRange,
  searchFilter,
  sortOrder = "desc",
  orderBy = "id",
  selectedModule,
  selectedSenderType,
  selectedType
) => {
  try {
    const actualPage = parseInt(page, 10) || 1;
    const actualPerPage = parseInt(perPage, 10) || 25;
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (searchFilter) {
      whereClause[Op.or] = [
        { moduleName: { [Op.like]: `%${searchFilter}%` } },
        { sender_email: { [Op.like]: `%${searchFilter}%` } },
        { recipient_email: { [Op.like]: `%${searchFilter}%` } },
        { subject: { [Op.like]: `%${searchFilter}%` } },
        { sender_type: { [Op.like]: `%${searchFilter}%` } },
        { isMailedSuccess: { [Op.like]: `%${searchFilter}%` } },
      ];
    }

    if (selectedModule) {
      whereClause.moduleName = {
        [Op.like]: `%${selectedModule}%`,
      };
    }

    if (selectedSenderType) {
      whereClause.sender_type = {
        [Op.like]: `%${selectedSenderType}%`,
      };
    }

    if (selectedType) {
      whereClause.isMailedSuccess = {
        [Op.like]: `%${selectedType}%`,
      };
    }

    let order = [];
    if (orderBy === "moduleName") {
      order = [["moduleName", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "sender_email") {
      order = [["sender_email", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "recipient_email") {
      order = [["recipient_email", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "subject") {
      order = [["subject", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "sender_type") {
      order = [["sender_type", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "isMailedSuccess") {
      order = [["isMailedSuccess", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "createdDate") {
      order = [["createdDate", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else {
      order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
    }

    const result = await emailLogsModel.findAndCountAll({
      where: whereClause,
      limit: actualPerPage,
      offset: offset,
      order: order,
    });

    return {
      totalRecords: result.count,
      records: result.rows,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getModulesData = async (searchQuery) => {
  try {
    const whereOptions = {};
    if (searchQuery) {
      whereOptions.moduleName = { [Op.like]: `%${searchQuery}%` };
    }
    const getModules = await emailLogsModel.findAll({
      where: whereOptions,
      attributes: ["moduleName"],
      group: ["moduleName"],
    });
    return getModules;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  sendEmailLogs,
  getEmailLogsList,
  getModulesData,
};
