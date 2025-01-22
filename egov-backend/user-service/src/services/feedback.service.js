const { sequelize } = require("../config/db.connection");
const { feedbackModel, customerModel } = require("../models");
const { Op } = require("sequelize");
const {
  generateAuditLog,
  extractDataFromRequest,
} = require("./auditLog.service");
const axios = require("axios");
const { roleUserList } = require("./roles.services");

const createNewFeedback = async (requestBody, req) => {
  try {
    let createdFeedback = await feedbackModel.create(requestBody);
    const { ipAddress } = extractDataFromRequest(req);
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Feedback",
        requestBody,
        "N/A",
        "1",
        null,
        requestBody?.customerId,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    try {
      const userIdList = await roleUserList();
      const isAdminUser = userIdList?.userIdsWithCondition;
      const departmentwiseUser = userIdList?.allUserIds;

      let message;
      if(requestBody?.type === "0") {
        message = "eGOV feedback"
      } 
      else if (requestBody?.type === "1") {
        message = "Department feedback"
      }
      else {
        message = "General feedback"
      }

      const notificationBody = {
        serviceSlug: requestBody?.serviceSlug || "",
        departmentId: requestBody?.departmentId || null,
        title: "Feedback Create",
        message: `${message} - ${requestBody?.note}.`,
        type: "1",
        applicationId: null,
        addedBy: "2",
      };

      const userIdsToNotify = requestBody.departmentId ? departmentwiseUser : isAdminUser;

      const notifications = userIdsToNotify.map(userId => ({
        ...notificationBody,
        userId,
      }));

      await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
        data: notifications,
      });
    } catch (error) {
      console.error(error);
    }

    return createdFeedback;
  } catch (error) {
    throw new Error(error);
  }
};

const getFeedbackList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id",
  dateRange = null
) => {
  try {
    let whereClause = {};

    if (id) {
      whereClause.id = id;
    }

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      endDate.setHours(23, 59, 59, 999);

      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const allFeedbacks = await feedbackModel.findAll({
      where: whereClause,
      include: [
        {
          model: customerModel,
          attributes: ["firstName", "lastName"],
        },
      ],
    });

    let departments;
    try {
      const documentResponse = await axios.post(
        `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
      );
      departments = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    const feedbackWithDepartments = allFeedbacks.map((feedback) => {
      const department = departments.find(
        (dep) => dep.id == feedback.departmentId
      );
      return {
        ...feedback.get({ plain: true }),
        departmentName: department ? department.departmentName : null,
      };
    });

    function filterAndSortData(data, searchParam, orderBy, sortOrder) {
      const searchTerm = searchParam?.toLowerCase() || "";

      const filteredData = data.filter((item) => {
        const fullName = `${item?.customer?.firstName || ""} ${item?.customer?.lastName || ""}`.toLowerCase();
        const matchesFullName = fullName.includes(searchTerm);
        const matchesNote = item?.note?.toLowerCase().includes(searchTerm);
        const matchesDepartment = item?.departmentName?.toLowerCase().includes(searchTerm);
        return matchesFullName || matchesNote || matchesDepartment;
      });

      const sortedData = filteredData.sort((a, b) => {
        let comparison = 0;

        switch (orderBy) {
          case "firstName":
            comparison = a.customer.firstName.localeCompare(b.customer.firstName);
            break;
          case "lastName":
            comparison = a.customer.lastName.localeCompare(b.customer.lastName);
            break;
          case "departmentName":
            comparison = (a.departmentName || "").localeCompare(b.departmentName || "");
            break;
          case "rating":
            comparison = a.rating - b.rating;
            break;
          case "Dated":
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
      feedbackWithDepartments,
      searchFilter,
      orderBy,
      sortOrder
    );

    const actualPage = (page && parseInt(page, 10)) || 1;
    const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
    const offset = (actualPage - 1) * actualPerPage;
    const paginatedResult = finalResult.slice(offset, offset + actualPerPage);

    return {
      count: finalResult.length,
      rows: paginatedResult,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};


module.exports = {
  createNewFeedback,
  getFeedbackList,
};
