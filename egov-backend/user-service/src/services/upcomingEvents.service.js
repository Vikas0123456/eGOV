const { upcomingEventsModel } = require("../models");
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const crypto = require("crypto");
const { generateAuditLog, extractDataFromRequest } = require("./auditLog.service");

const createNewUpcomingEvent = async (requestBody, req) => {
  try {
    let createdUpcomingEvent = await upcomingEventsModel.create(requestBody);
    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Upcoming Event",
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
    return createdUpcomingEvent;
  } catch (error) {
    throw new Error(error);
  }
};

const updateUpcomingEventData = async (id, data, req) => {
  try {

    const currentRecord = await upcomingEventsModel.findOne({
      where: {
        id,
      },
    });

    if (!currentRecord) {
      return { success: false, message: 'Upcoming event record not found' };
    }

    const eventUpdate = await upcomingEventsModel.update(data, {
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
        "Upcoming Event",
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
    return eventUpdate;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getUpcomingEventList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id",
  dateRange = null,
  isCoreteam
) => {
  try {
    if (id) {

      let documentList;
      try {
          const documentResponse = await axios.post(
              `${process.env.DOCUMENT_URL}document/list/upload`,
              {data: {}}
          );
          documentList = documentResponse?.data?.data?.rows;

      } catch (error) {
          console.log(error);
      }

      const result = await upcomingEventsModel.findAndCountAll({
        where: {
          id: id,
        },
      });


      const newResponseData = result.rows.map((event, idx) => {
        let findDocumentData;
        findDocumentData = documentList.find(
          (doc) => doc.id === event?.imageId
        );
        return {
          ...event.toJSON(),
          imageData: {
            id: findDocumentData?.id,
            documentName: findDocumentData?.documentName,
            documentType: findDocumentData?.documentType,
            documentPath: findDocumentData?.documentPath,
            fileSize: findDocumentData?.fileSize,
          },
        };
      });
      return { count: result.count, rows: newResponseData };

    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;

      let whereClause = {
        isDeleted: "0",
      };

      if (dateRange && dateRange.startDate && dateRange.endDate) {
        whereClause.createdDate = {
          [Op.between]: [
            new Date(dateRange.startDate),
            new Date(dateRange.endDate),
          ],
        };
      }

      if (isCoreteam == 0) {
        whereClause = {
          ...whereClause,
          status: "1",
          imageId: {
            [Op.not]: null, // Like: sellDate IS NOT NULL
          },
        };
      }

      if (searchFilter) {
        whereClause[Op.or] = [
          {
            title: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }

      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];

      let documentList;
      try {
          const documentResponse = await axios.post(
              `${process.env.DOCUMENT_URL}document/list/upload`,
              {data: {}}
          );
          documentList = documentResponse?.data?.data?.rows;

      } catch (error) {
          console.log(error);
      }

      const result = await upcomingEventsModel.findAndCountAll({
        where: whereClause,
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true,
      });

      const newResponseData = result.rows.map((event, idx) => {
        let findDocumentData;
        findDocumentData = documentList.find(
          (doc) => doc.id === event?.imageId
        );
        return {
          ...event,
          imageData: {
            id: findDocumentData?.id,
            documentName: findDocumentData?.documentName,
            documentType: findDocumentData?.documentType,
            documentPath: findDocumentData?.documentPath,
            fileSize: findDocumentData?.fileSize,
          },
        };
      });
      return { count: result.count, rows: newResponseData };
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNewUpcomingEvent,
  updateUpcomingEventData,
  getUpcomingEventList,
};
