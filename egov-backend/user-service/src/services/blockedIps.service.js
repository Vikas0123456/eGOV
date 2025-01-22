const { Op } = require("sequelize");
const { blockedIpsModel } = require("../models");
const { extractDataFromRequest, generateAuditLog } = require("./auditLog.service");

const findIpExist = async (ipAddress) => {
  try {
    let findIp = await blockedIpsModel.findOne({
      where: { ipAddress: ipAddress },
    });
    return findIp;
  } catch (error) {
    throw new Error(error);
  }
};

const createBlockedIpsService = async (requestBody, req) => {
  try {
    let createdBlockedIp = await blockedIpsModel.create(requestBody);

    const createdBlockedIps = await blockedIpsModel.findOne({
      where: {id: createdBlockedIp?.id}
  })

  const { userId, ipAddress } = extractDataFromRequest(req);

  try {
      await generateAuditLog(
          null,
          "Create",
          "BlockedIps",
          "N/A",
          createdBlockedIps.dataValues,
          "0",
          userId,
          null,
          ipAddress
      );
  } catch (error) {
      console.error("Error generating audit log:", error);
  }

    return createdBlockedIp;
  } catch (error) {
    throw new Error(error);
  }
};

const updateBlockedIpsService = async (id, data, req) => {
  try {

    const existingBlockedIps = await blockedIpsModel.findOne({
      where: {
          id: id,
      },
  });

  if (!existingBlockedIps) {
      throw new Error('BlockedIps not found');
  }

    const blockedIpsDataUpdate = await blockedIpsModel.update(data, {
      where: {
        id,
      },
    });

    const { userId, ipAddress } = extractDataFromRequest(req);

    try {
        const oldValue = existingBlockedIps ? existingBlockedIps.get({ plain: true }) : null;
        await generateAuditLog(
            id,
            "Update",
            "BlockedIps",
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

    return blockedIpsDataUpdate;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteBlockedIpsService = async (id, req) => {
  try {
    const deleted = await blockedIpsModel.destroy({
      where: { id: id },
    });

    const { userId, ipAddress } = extractDataFromRequest(req);

    try {
      await generateAuditLog(
          id,
          "Delete",
          "BlockedIps",
          id,
          "N/A",
          "0",
          userId,
          null,
          ipAddress
      );
  } catch (error) {
      console.error("Error generating audit log:", error);
  }

    return deleted;
  } catch (error) {
    throw new Error(error);
  }
};

const getBlockedIpsService = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id"
) => {
  try {
    if (id) {
      return await blockedIpsModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;

      let whereClause = {};

      if (searchFilter) {
        whereClause[Op.or] = [
          {
            ipAddress: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }

      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      const result = await blockedIpsModel.findAndCountAll({
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
  createBlockedIpsService,
  updateBlockedIpsService,
  getBlockedIpsService,
  findIpExist,
  deleteBlockedIpsService,
};
