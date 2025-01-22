const { Op } = require("sequelize");
const knowledgeBase = require("../models/knowledgebase");
const { sequelize } = require("../config/db.connection");
const likeDislikeModel = require("../models/likeDislike");
const {
  generateAuditLog,
  extractDataFromRequest,
} = require("./auditLog.service");
const { default: axios } = require("axios");

const createNewKnowledgeBase = async (requestBody, req) => {
  try {
    let createdKnowledgeBase = await knowledgeBase.create(requestBody);
    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Knowledge Base",
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
    return createdKnowledgeBase;
  } catch (error) {
    throw new Error(error);
  }
};

const updateKnowledgeBaseData = async (knowledgebaseId, data, req) => {
  try {
    const currentRecord = await knowledgeBase.findOne({
      where: {
        id: knowledgebaseId,
      },
    });

    if (!currentRecord) {
      return { success: false, message: "Knowledge base record not found" };
    }

    const knowledgeBaseUpdate = await knowledgeBase.update(data, {
      where: {
        id: knowledgebaseId,
      },
    });
    
    try {
      const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
      const finalUserId = extractedUserId;
      await generateAuditLog(
        knowledgebaseId,
        "Update",
        "Knowledge Base",
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
    return knowledgeBaseUpdate;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getKnowledgeBaseList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder = "desc",
  orderBy = "id",
  departmentId,
  dateRange = null,
  isCoreteam,
  selectedAuthor,
  visibility,
  status
) => {
  try {
    const actualPage = parseInt(page, 10) || 1;
    const actualPerPage = parseInt(perPage, 10) || 25;
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {
      isDeleted: "0",
    };

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    if (isCoreteam == 0) {
      whereClause.status = "1";
    }

    if (selectedAuthor) {
      whereClause.authors = {
        [Op.like]: `%${selectedAuthor}%`,
      };
    }

    if (visibility) {
      whereClause.visibility = visibility;
    }

    if (status) {
      whereClause.status = status;
    }

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    let departmentsData;
    try {
      const documentResponse = await axios.post(
        `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
      );
      departmentsData = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    const totalCountsMap = await likeDislikeModel.findAll({
      attributes: [
        "knowledgeBaseId",
        [sequelize.fn("COUNT", sequelize.col("islike")), "totalCount"],
      ],
      group: ["knowledgeBaseId"],
      raw: true,
    });

    const likeCountsMap = await likeDislikeModel.findAll({
      attributes: [
        "knowledgeBaseId",
        [sequelize.fn("COUNT", sequelize.col("islike")), "likeCount"],
      ],
      where: {
        islike: "1",
      },
      group: ["knowledgeBaseId"],
      raw: true,
    });

    const result = await knowledgeBase.findAndCountAll({
      where: whereClause,
      raw: true,
    });

    const enhancedRows = result.rows.map((entry) => {
      const likeCountResult =
        likeCountsMap.find((row) => row.knowledgeBaseId === entry.id)
          ?.likeCount || 0;
      const totalCount =
        totalCountsMap.find((row) => row.knowledgeBaseId === entry.id)
          ?.totalCount || 0;
      const dislikeCount = totalCount - likeCountResult;
      const department = departmentsData.find(
        (dep) => dep.id == entry.departmentId
      );
      return {
        ...entry,
        departmentName: department ? department.departmentName : null,
        likeCountResult,
        totalCount,
        dislikeCount,
      };
    });

    function filterAndSortData(data, searchParam, orderBy, sortOrder) {
      const searchTerm = searchParam?.toLowerCase() || "";

      const filteredData = data.filter((item) => {
        const matchesTitle = item.title.toLowerCase().includes(searchTerm);
        const matchesDescription = item.description
          .toLowerCase()
          .includes(searchTerm);
        const matchesAuthors = item.authors.toLowerCase().includes(searchTerm);
        return matchesTitle || matchesDescription || matchesAuthors;
      });

      const sortedData = filteredData.sort((a, b) => {
        let comparison = 0;

        switch (orderBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "departmentName":
            comparison = (a.departmentName || "").localeCompare(
              b.departmentName || ""
            );
            break;
          case "likeCountResult":
            comparison = a.likeCountResult - b.likeCountResult;
            break;
          case "createdDate":
            const dateA = new Date(a.createdDate);
            const dateB = new Date(b.createdDate);
            comparison = dateA - dateB;
            break;
          default:
            if (a[orderBy] !== undefined && b[orderBy] !== undefined) {
              if (typeof a[orderBy] === "string") {
                comparison = a[orderBy].localeCompare(b[orderBy]);
              } else {
                comparison = a[orderBy] - b[orderBy];
              }
            }
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      return sortedData;
    }

    const finalResult = filterAndSortData(
      enhancedRows,
      searchFilter,
      orderBy,
      sortOrder
    );

    return {
      count: result.count,
      rows: finalResult.slice(offset, offset + actualPerPage),
    };
  } catch (error) {
    console.error("Error in getKnowledgeBaseList:", error);
    throw new Error("Failed to fetch knowledge base list");
  }
};

const knowledgeBaseDataById = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder = "desc",
  orderBy = "id",
  isCoreteam
) => {
  try {
    const actualPage = parseInt(page, 10) || 1;
    const actualPerPage = parseInt(perPage, 10) || 25;
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {
      isDeleted: "0",
      status: "0",
    };

    if (id) {
      whereClause.departmentId = id;
    }

    if (isCoreteam == 0) {
      whereClause.status = "1";
    }

    if (searchFilter) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${searchFilter}%` } },
        { description: { [Op.like]: `%${searchFilter}%` } },
        { authors: { [Op.like]: `%${searchFilter}%` } },
      ];
    }

    let order = [[orderBy === 'departmentName' || orderBy === 'likeCountResult' ? 'id' : orderBy, sortOrder.toUpperCase()]];

    const totalCountsMap = await likeDislikeModel.findAll({
      attributes: [
        "knowledgeBaseId",
        [sequelize.fn("COUNT", sequelize.col("islike")), "totalCount"],
      ],
      group: ["knowledgeBaseId"],
      raw: true,
    });

    const likeCountsMap = await likeDislikeModel.findAll({
      attributes: [
        "knowledgeBaseId",
        [sequelize.fn("COUNT", sequelize.col("islike")), "likeCount"],
      ],
      where: {
        islike: "1",
      },
      group: ["knowledgeBaseId"],
      raw: true,
    });

    const result = await knowledgeBase.findAndCountAll({
      where: whereClause,
      offset: offset,
      order: order,
      raw: true,
    });

    let departmentsData;
    try {
      const documentResponse = await axios.post(
        `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
      );
      departmentsData = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    const enhancedRows = result.rows.map((entry) => {
      const likeCountResult =
        likeCountsMap.find((row) => row.knowledgeBaseId === entry.id)
          ?.likeCount || 0;
      const totalCount =
        totalCountsMap.find((row) => row.knowledgeBaseId === entry.id)
          ?.totalCount || 0;
      const dislikeCount = totalCount - likeCountResult;
      const department = departmentsData.find(
        (dep) => dep.id == entry.departmentId
      );
      return {
        ...entry,
        departmentName: department ? department.departmentName : null,
        likeCountResult,
        totalCount,
        dislikeCount,
      };
    });

    function filterAndSortData(data, searchParam, orderBy, sortOrder) {
      const searchTerm = searchParam?.toLowerCase() || "";

      const filteredData = data.filter((item) => {
        const matchesTitle = item.title.toLowerCase().includes(searchTerm);
        const matchesDescription = item.description
          .toLowerCase()
          .includes(searchTerm);
        const matchesAuthors = item.authors.toLowerCase().includes(searchTerm);
        return matchesTitle || matchesDescription || matchesAuthors;
      });

      const sortedData = filteredData.sort((a, b) => {
        let comparison = 0;

        switch (orderBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "departmentName":
            comparison = (a.departmentName || "").localeCompare(
              b.departmentName || ""
            );
            break;
          case "likeCountResult":
            comparison = a.likeCountResult - b.likeCountResult;
            break;
          case "createdDate":
            const dateA = new Date(a.createdDate);
            const dateB = new Date(b.createdDate);
            comparison = dateA - dateB;
            break;
          default:
            if (a[orderBy] !== undefined && b[orderBy] !== undefined) {
              if (typeof a[orderBy] === "string") {
                comparison = a[orderBy].localeCompare(b[orderBy]);
              } else {
                comparison = a[orderBy] - b[orderBy];
              }
            }
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

      return sortedData;
    }

    const finalResult = filterAndSortData(
      enhancedRows,
      searchFilter,
      orderBy,
      sortOrder
    );

    return {
      count: finalResult.length,
      rows: finalResult.slice(offset, offset + actualPerPage),
    };
  } catch (error) {
    console.error("Error in knowledgeBaseDataById:", error);
    throw new Error("Failed to fetch knowledge base list");
  }
};


const deleteKnowledgeBaseById = async (knowledgebaseId, req) => {
  try {
    if (knowledgebaseId) {
      const [knowledgebase] = await knowledgeBase.update(
        { isDeleted: "1" },
        {
          where: {
            id: knowledgebaseId,
          },
        }
      );
      const { userId: extractedUserId, ipAddress } =
        extractDataFromRequest(req);
      const finalUserId = extractedUserId;
      try {
        await generateAuditLog(
          knowledgebaseId,
          "Delete",
          "Knowledge Base",
          knowledgebaseId,
          "N/A",
          "0",
          finalUserId,
          null,
          ipAddress
        );
      } catch (error) {
        console.error("Error generating audit log:", error);
      }
      return knowledgebase;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getKnowledgeBaseDetails = async (id) => {
  try {
    const knowledgeBaseData = await knowledgeBase.findOne({
      where: {
        id: id,
        isDeleted: "0",
      },
      raw: true,
    });

    return knowledgeBaseData;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const knowledgeBaseAllList = async (id, searchFilter) => {
  try {
    let whereClause = {
      isDeleted: "0",
    };

    if (id) {
      whereClause.id = id;
    } else if (searchFilter) {
      whereClause[Op.or] = [
        {
          departmentName: {
            [Op.like]: `%${searchFilter}%`,
          },
        },
      ];
    }

    const knowledgeBaseData = await knowledgeBase.findAndCountAll({
      where: whereClause,
      raw: true,
    });

    return knowledgeBaseData;
  } catch (error) {
    throw new Error(error);
  }
};

const authorsList = async (searchQuery) => {
  try {
    const whereOptions = {
      isDeleted: { [Op.ne]: "1" },
    };
    
    if (searchQuery) {
      whereOptions.authors = { [Op.like]: `%${searchQuery}%` };
    }

    const authors = await knowledgeBase.findAll({
      where: whereOptions,
      attributes: ["authors"],
      group: ["authors"],
    });

    return authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw new Error(error);
  }
};

const deleteKnowledgeBasesByIds = async (ids, req) => {
  try {
    if (Array.isArray(ids)) {
      const result = await knowledgeBase.update(
        { isDeleted: "1" },
        {
          where: {
            id: {
              [Op.in]: ids,
            },
          },
        }
      );
      const { userId: extractedUserId, ipAddress } =
        extractDataFromRequest(req);
      const finalUserId = extractedUserId;
      try {
        await generateAuditLog(
          ids,
          "Multiple Delete",
          "Knowledge Base",
          result,
          "N/A",
          "0",
          finalUserId,
          null,
          ipAddress
        );
      } catch (error) {
        console.error("Error generating audit log:", error);
      }
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const likeCount = async (req, res) => {
  try {
    const [departmentData, serviceData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`)
    ]);

    const departments = departmentData.data;
    const services = serviceData.data;

      return {
        department: departments,
        service: services
      };

    return responseData;
  } catch (error) {
    console.error('Error fetching likes count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createNewKnowledgeBase,
  updateKnowledgeBaseData,
  getKnowledgeBaseList,
  knowledgeBaseDataById,
  deleteKnowledgeBaseById,
  getKnowledgeBaseDetails,
  knowledgeBaseAllList,
  authorsList,
  deleteKnowledgeBasesByIds,
  likeCount
};
