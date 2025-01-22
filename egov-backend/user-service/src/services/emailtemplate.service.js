const { emailtemplatesModel } = require("../models");
const { Op } = require("sequelize");
const {
  extractDataFromRequest,
  generateAuditLog,
} = require("./auditLog.service");

const updateEmailTemplateData = async (id, data, req) => {
  try {

    const oldTemplateData = await emailtemplatesModel.findOne({
      where: { id },
    });

    if (!oldTemplateData) {
      return { success: false, message: "Email template not found." };
    }

    const eventUpdate = await emailtemplatesModel.update(data, {
      where: {
        id,
      },
    });
    const { userId, ipAddress } = extractDataFromRequest(req);

    try {
      const oldValue = oldTemplateData ? oldTemplateData.get({ plain: true }) : null;
      await generateAuditLog(
        id,
        "Update Email Template",
        "Email Template",
        data,
        oldValue,
        "0",
        userId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return eventUpdate;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getEmailTemplateList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id"
) => {
  try {
    const actualPage = (page && parseInt(page, 10)) || 1;
    const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {};

    if (searchFilter) {
      whereClause[Op.or] = [
        {
          title: {
            [Op.like]: `%${searchFilter}%`,
          },
        },
      ];
    }

    let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];

    const result = await emailtemplatesModel.findAndCountAll({
      where: whereClause,
      limit: actualPerPage,
      offset: offset,
      order: order,
      raw: true,
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getEmailTemplateSlug = async (slug) => {
  try {
    const result = await emailtemplatesModel.findOne({
      where: { slug: slug },
      raw: true,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  updateEmailTemplateData,
  getEmailTemplateList,
  getEmailTemplateSlug,
};
