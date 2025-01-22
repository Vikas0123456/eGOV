const { faqModel } = require("../models");
const { Op } = require("sequelize");
const { generateAuditLog, extractDataFromRequest } = require("./auditLog.service");

const createNewFaq = async (requestBody, req) => {
  try {
    let createdFaq = await faqModel.create(requestBody);

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "FAQ",
        requestBody,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
    return createdFaq;
  } catch (error) {
    throw new Error(error);
  }
};

const updateFaqsData = async (id, data, req) => {
  try {

    const currentRecord = await faqModel.findOne({
      where: {
        id,
      },
    });

    if (!currentRecord) {
      return { success: false, message: 'FAQ record not found' };
    }

    const faqUpdate = await faqModel.update(data, {
      where: {
        id,
      },
    });

    try {
      const action = data.isDeleted === '1' ? "Delete" : "Update";
      const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
      const finalUserId = extractedUserId;
      await generateAuditLog(
        id,
        action,
        "FAQ",
        data,
        currentRecord.dataValues,
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
    return faqUpdate;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getFaqList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id",
  isCoreteam
) => {
  try {
    if (id) {
      return await faqModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;

      let whereClause = {
        isDeleted: "0",
      };

      if (isCoreteam == 0) {
        whereClause = { ...whereClause, status: "1" };
      }

      if (searchFilter) {
        whereClause[Op.or] = [
          {
            question: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
          {
            answer: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }

      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      const result = await faqModel.findAndCountAll({
        where: whereClause,
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true,
      });
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNewFaq,
  updateFaqsData,
  getFaqList,
};
