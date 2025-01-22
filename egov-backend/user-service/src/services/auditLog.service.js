const { Op, Sequelize } = require("sequelize");
const auditLogModel = require("../models/auditLog");
const usersModel = require("../models/users");
const customerModel = require("../models/customer");

const extractDataFromRequest = (req) => {
  try {
    const jwtPayloadIndex = req.rawHeaders.indexOf("jwtPayload");
    if (jwtPayloadIndex !== -1) {
      const jwtPayloadString = req.rawHeaders[jwtPayloadIndex + 1];
      const jwtPayload = JSON.parse(jwtPayloadString);
      const userId = jwtPayload.userId;
      const ipAddress = jwtPayload.ip;

      return { userId, ipAddress };
    } else {
      throw new Error("jwtPayload header not found in rawHeaders.");
    }
  } catch (error) {
    console.error("Error extracting user info from request:", error);
    throw new Error("Failed to extract user info from request.");
  }
};

const generateAuditLog = async (
  recordId,
  action,
  moduleName,
  newValue,
  oldValue,
  type,
  userId,
  customerId,
  ipAddress
) => {
  try {
    const AUDITTRAIL = "true";
    if (AUDITTRAIL === "true") {
      newValue =
        typeof newValue === "object"
          ? JSON.stringify(newValue)
          : String(newValue);
      oldValue =
        typeof oldValue === "object"
          ? JSON.stringify(oldValue)
          : String(oldValue);
      recordId = Array.isArray(recordId)
        ? JSON.stringify(recordId)
        : String(recordId);

      const newLog = await auditLogModel.create({
        recordId,
        action,
        moduleName,
        newValue,
        oldValue,
        type,
        userId,
        customerId,
        ipAddress,
      });

      return newLog;
    }
  } catch (error) {
    console.error("Error generating audit log:", error);
    throw new Error("Failed to generate audit log");
  }
};

const getAuditLogData = async (
  id,
  page,
  perPage,
  dateRange,
  searchFilter,
  sortOrder = "desc",
  orderBy = "id",
  selectedModule,
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
        { action: { [Op.like]: `%${searchFilter}%` } },
        { moduleName: { [Op.like]: `%${searchFilter}%` } },
        { recordId: { [Op.like]: `%${searchFilter}%` } },
        { "$user.name$": { [Op.like]: `%${searchFilter}%` } },
        Sequelize.where(
          Sequelize.fn("CONCAT", Sequelize.col("customer.firstName"), " ", Sequelize.col("customer.lastName")),
          { [Op.like]: `%${searchFilter}%` }
        ),
        { "$user.email$": { [Op.like]: `%${searchFilter}%` } },
        { "$customer.email$": { [Op.like]: `%${searchFilter}%` } },
        { ipAddress: { [Op.like]: `%${searchFilter}%` } },
      ];
    }

    if (selectedModule) {
      whereClause.moduleName = {
        [Op.like]: `%${selectedModule}%`,
      };
    }

    if (selectedType) {
      whereClause.type = {
        [Op.like]: `%${selectedType}%`,
      };
    }

    let order = [];
    if (orderBy === "userName") {
        order = [
            [
                Sequelize.literal(
                    `COALESCE(user.name, CONCAT(customer.firstName, ' ', customer.lastName))`
                ),
                sortOrder === "asc" ? "ASC" : "DESC",
            ],
        ];
    } else if (orderBy === "email") {
        order = [
            [
                Sequelize.literal(`COALESCE(user.email, customer.email)`),
                sortOrder === "asc" ? "ASC" : "DESC",
            ],
        ];
    } else if (orderBy === "moduleName") {
        order = [["moduleName", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "action") {
        order = [["action", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "createdDate") {
        order = [["createdDate", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "type") {
        order = [["type", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else {
        order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
    }

    const result = await auditLogModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: usersModel,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: customerModel,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      limit: actualPerPage,
      offset: offset,
      order: order,
    });

    return {
      totalRecords: result.count,
      records: result.rows,
    };
  } catch (error) {
    console.error("Error fetching audit log data:", error);
    throw new Error("Error fetching audit log data.");
  }
};

const getAllModulesData = async (searchQuery) => {
  try {
    const whereOptions = {};
    if (searchQuery) {
      whereOptions.moduleName = { [Op.like]: `%${searchQuery}%` };
    }
    getModules = await auditLogModel.findAll({
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
  generateAuditLog,
  getAuditLogData,
  getAllModulesData,
  extractDataFromRequest
};
