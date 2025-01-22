const { default: axios } = require("axios");
const {
  ticketsModel,
  ticketsLogModel,
  generalSettingModel,
} = require("../models");
const { Op, where } = require("sequelize");
const crypto = require("crypto");
const moment = require("moment");
const ticketChatModel = require("../models/ticketChat");
const { sequelize, Sequelize } = require("../config/db.connection");
const {
  fetchDocumentData,
  fetchDepartmentData,
  fetchServiceData,
  fetchUserData,
  fetchCustomerData,
  fetchDocumentViewData,
  fetchAuditLogData,
} = require("./cacheUtility");
const ExcelJS = require("exceljs");
const path = require("path");
const setting = require("../../setting");
const fs = require("fs");

const encrypt = (data) => {
  if (process.env.ENCRYPTION == "true") {
    const cipher = crypto.createCipheriv(
      process.env.CIPHERALGORITHM,
      process.env.CIPHERSKEY,
      process.env.CIPHERVIKEY
    );
    let encryptedData = cipher.update(JSON.stringify(data), "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return { data: encryptedData };
  } else {
    return { data };
  }
};

const decrypt = (encryptedData) => {
  if (process.env.DECEYPTION == "true") {
    const decipher = crypto.createDecipheriv(
      process.env.CIPHERALGORITHM,
      process.env.CIPHERSKEY,
      process.env.CIPHERVIKEY
    );
    let decryptedData = decipher.update(encryptedData.data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return { data: JSON.parse(decryptedData) };
  } else {
    return encryptedData;
  }
};
const getTicketsForUser = async (userId) => {
  try {
    const tickets = await ticketsModel.findAll({
      where: {
        assignTo: userId,
        status: "1",
      },
      attributes: ["id", "status", "assignTo"],
      raw: true,
    });

    return tickets;
  } catch (error) {
    throw new Error("Failed to fetch tickets for user.");
  }
};
const workflowAssignedTicket = async (
  workflowAllData,
  index,
  excludedUserIds = []
) => {
  const workflow =
    workflowAllData?.workflowData &&
    JSON.parse(workflowAllData?.workflowData)?.workflowData;

  // Step 1: Get the first action's value
  const firstAction = workflow.actions[index];
  if (!firstAction) {
    throw new Error("No actions available");
  }

  const actionValue = JSON.parse(firstAction.value);

  // Step 2: Find the matching actionsData
  const matchingActionData = workflow?.actionsData[actionValue];
  if (!matchingActionData) {
    throw new Error(`No actionsData found for value: ${actionValue}`);
  }

  const { serviceMethod, users, rolesWiseUsers, maxPriorityLimit, TAT } =
    matchingActionData;

  // Step 3: Prepare usersInFlow while excluding specified userIds
  let usersInFlow = serviceMethod == "1" ? users : rolesWiseUsers;
  usersInFlow = usersInFlow.filter(
    (userId) => !excludedUserIds.includes(userId)
  );

  // Step 4: Calculate in-progress tickets for each user
  const inProgressTicketsPerUser = await Promise.all(
    usersInFlow.map(async (userId) => {
      const userTickets = await getTicketsForUser(userId); // Replace with actual logic
      const inProgressCount =
        userTickets && Array.isArray(userTickets)
          ? userTickets.filter((ticket) => ticket.status == "1").length
          : 0; // Ensure 0 if no tickets or empty array
      return { userId, inProgressCount };
    })
  );

  // Step 5: Attempt to assign the ticket
  const max = JSON.parse(maxPriorityLimit);
  const priorityBase = checkPriorityBase(
    usersInFlow,
    max,
    inProgressTicketsPerUser
  );

  // Step 6: Return the result
  return {
    assignedUserId: priorityBase.assignedUserId,
    usersInFlow,
    inProgressTicketsPerUser,
    methodOnPriorityBase: priorityBase.methodOnPriorityBase,
    TAT: TAT,
  };

  // Helper function to check assignment by priority
  function checkPriorityBase(userList, maxPriorityLimit, inProgressTickets) {
    for (const userId of userList) {
      const user = inProgressTickets.find((user) => user?.userId == userId);
      const inProgressCount = user?.inProgressCount;

      if (inProgressCount < maxPriorityLimit) {
        return { assignedUserId: userId, methodOnPriorityBase: true };
      }
    }

    // If all users exceed maxPriorityLimit, find user with the fewest tickets
    const userWithFewestTickets = userList.reduce(
      (lowest, userId) => {
        const user = inProgressTickets.find((user) => user?.userId == userId);
        const inProgressCount = user?.inProgressCount;

        return inProgressCount < lowest.count
          ? { userId, count: inProgressCount }
          : lowest;
      },
      { userId: null, count: Infinity }
    );

    if (userWithFewestTickets.userId != null) {
      return {
        assignedUserId: userWithFewestTickets.userId,
        methodOnPriorityBase: false,
        TAT: TAT,
      };
    }

    // If no user is suitable, return fallback
    return { assignedUserId: null, methodOnPriorityBase: false, TAT: null };
  }
};

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
// const getNumberofTicketAsignedToUser = async (
//   workflow,
//   departmentId,
//   excludeUserId
// ) => {
//   try {
//     let userId = [];
//     let allFindUsers = [];

//     if (workflow?.workflowMethod === "role") {
//       const getAlluserList = await axios.post(
//         `${process.env.USERSERVICE}internalCommunicationUser/workflowUser`,
//         {
//           data: {
//             roleId: workflow?.roleId,
//           },
//         }
//       );
//       userId = getAlluserList.data.data.map((item) => item.id);
//       allFindUsers = getAlluserList.data.data.map((item) => ({
//         id: item.id,
//         email: item.email,
//         name: item.name,
//       }));
//     }
//     if (workflow?.workflowMethod === "agent") {
//       const getAlluserList = await axios.post(
//         `${process.env.USERSERVICE}internalCommunicationUser/workflowUser`,
//         {
//           data: {
//             userId: JSON.parse(workflow?.userId),
//           },
//         }
//       );
//       userId = getAlluserList.data.data.map((item) => item.id);
//       allFindUsers = getAlluserList.data.data.map((item) => ({
//         id: item.id,
//         email: item.email,
//         name: item.name,
//       }));
//     }

//     return { allFindUsers, userId };
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const generateTicketId = async (latestTicketId) => {
  try {
    let newTicketId = "T000001"; // Default starting ticketId
    if (latestTicketId) {
      // Extract the numeric part after the "T" prefix, increment it and pad with leading zeros
      const latestId = parseInt(latestTicketId.slice(1), 10); // Slice to remove the "T" prefix
      newTicketId = "T" + String(latestId + 1).padStart(6, "0");
    }
    return newTicketId;
  } catch (error) {
    throw new Error("Error generating ticket ID");
  }
};

const createNewTicket = async (requestBody, req) => {
  try {
    const latestTicket = await ticketsModel.findOne({
      order: [["createdDate", "DESC"]], // Assuming you have a createdDate field
    });
    const newTicketId = await generateTicketId(latestTicket?.ticketId);
    requestBody.ticketId = newTicketId;
    requestBody.respondedOn = null;

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    if (requestBody.userId) {
      const hasAssignPermission =
        requestBody.ticketPermissions?.permissions?.some(
          (permission) => permission.permissionName == "AssignTo"
        );

      if (!hasAssignPermission) {
        requestBody.assignTo = finalUserId;
      }
    }
    if (requestBody?.customerId) {
      try {
        const response = await axios.post(
          `${process.env.USERSERVICE}internalCommuncationWorkflow/applicationNewWorkflow`,
          {
            data: {
              departmentId: requestBody?.departmentId,
              serviceslug: requestBody?.serviceSlug,
              workflowFor: "1",
            },
          }
        );
        if (response?.data?.data) {
          const workflow = response?.data?.data?.[0];
          const dbStoreworkflow = response?.data?.data?.[0];
          let excludeUserId = [];
          const assignedData = await workflowAssignedTicket(workflow, 0);
          if (workflow) {
            try {
              const parseData = JSON.stringify(dbStoreworkflow);
              let tatInDays = assignedData?.TAT;
              // If TAT is not a number, parse it
              if (typeof tatInDays !== "number") {
                tatInDays = Number(tatInDays);
              }

              const turnAroundTime = tatInDays * 24 * 60 * 60 * 1000;
              // Calculate target date by adding turnaround time to the current date
              let targetDate = new Date(Date.now() + turnAroundTime);
              try {
                await axios.post(
                  `${process.env.DEPARTMENTREPORT}/ticket/create`,
                  {
                    data: {
                      userId: assignedData?.assignedUserId,
                      ticketId: requestBody?.ticketId,
                      serviceSlug: requestBody?.serviceSlug,
                      assignedDate: new Date(),
                      turnAroundTime: tatInDays,
                    },
                  }
                );
              } catch (error) {
                console.error(error);
              }
              if (assignedData?.assignedUserId) {
                requestBody.assignUsersData = JSON.stringify([
                  {
                    userId: assignedData?.assignedUserId,
                    approvalDate: null,
                  },
                ]);
                requestBody.assignTo = assignedData?.assignedUserId;
                requestBody.workflowData = parseData;
                requestBody.workflowIndex = 0;
                requestBody.turnAroundTime = targetDate;
                requestBody.status = "1";
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    if (!requestBody?.customerId && requestBody?.assignTo) {
      const generalSettingsTAT = await generalSettingModel.findOne({
        where: { settingKey: "TAT" },
        raw: true,
      });

      let tatInDays = generalSettingsTAT?.settingValue;
      const parsedTatInDays = parseInt(tatInDays);
      try {
        await axios.post(`${process.env.DEPARTMENTREPORT}/ticket/create`, {
          data: {
            userId: requestBody.assignTo,
            ticketId: requestBody?.ticketId,
            serviceSlug: requestBody?.serviceSlug,
            assignedDate: new Date(),
            turnAroundTime: parsedTatInDays,
          },
        });
      } catch (error) {
        console.error(error);
      }
      const turnAroundTime = parsedTatInDays * 24 * 60 * 60 * 1000;
      let targetDate = new Date(Date.now() + turnAroundTime);
      requestBody.turnAroundTime = targetDate;
    }
    if (requestBody?.customerId && requestBody?.assignTo) {
      const notificationBodyCommon = {
        serviceSlug: requestBody?.serviceSlug || "Ticket",
        departmentId: requestBody?.departmentId,
        title: "Ticket Create.",
        type: "0",
        applicationId: null,
        addedBy: "0",
      };
      let notifications = [];
      notifications.push(
        {
          ...notificationBodyCommon,
          customerId: requestBody?.customerId,
          message: `Your ticket ${requestBody?.ticketId} is currently being processed.`,
        },
        {
          ...notificationBodyCommon,
          userId: requestBody?.assignTo,
          message: `Ticket ${requestBody?.ticketId} has been assigned to you for review.`,
        }
      );
      try {
        await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
          data: notifications,
        });
      } catch (error) {
        console.error(error);
      }
    }

    const ticket = await ticketsModel.create(requestBody);

    let departmentAdmin;
    if (requestBody?.departmentId) {
      try {
        let result = await axios.post(
          `${process.env.USERSERVICE}internalCommunicationUser/findAdmin`,
          {
            data: {
              departmentId: requestBody?.departmentId,
            },
          }
        );
        if (result) {
          departmentAdmin = result?.data?.data;
        }
      } catch (error) {
        console.error(error);
      }
      try {
        const notificationBody = {
          serviceSlug: requestBody?.serviceSlug || "",
          departmentId: requestBody?.departmentId,
          title: "Ticket Create",
          type: "0",
          applicationId: null,
          addedBy: "0",
          userId: departmentAdmin?.id,
          message: `New ticket ${requestBody?.ticketId} - ${requestBody?.title} has been raised.`,
        };
        await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
          data: notificationBody,
        });
      } catch (error) {
        console.error(error);
      }
    }

    let auditLogBody = {
      recordId: "-",
      action: "Create",
      moduleName: "Tickets",
      newValue: requestBody,
      oldValue: "N/A",
      type: "0",
      userId: null,
      customerId: null,
      ipAddress: ipAddress,
    };

    if (requestBody.customerId) {
      auditLogBody.type = "1";
      auditLogBody.customerId = requestBody.customerId;
    } else if (finalUserId) {
      auditLogBody.type = "0";
      auditLogBody.userId = finalUserId;
    }

    try {
      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return ticket;
  } catch (error) {
    console.error("Error creating new ticket:", error);
    throw new Error("Error creating new ticket");
  }
};

const createNewTicketLog = async (requestBody) => {
  try {
    const ticketLog = await ticketsLogModel.create(requestBody);
    return ticketLog;
  } catch (error) {
    throw new Error(error);
  }
};

const updateTicketData = async (id, data, req) => {
  try {
    const currentRecord = await ticketsModel.findOne({
      attributes: ["customerId"],
      where: {
        id,
      },
    });

    if (!currentRecord) {
      return { success: false, message: "Ticket record not found" };
    }

    const ticketUpdate = await ticketsModel.update(data, {
      where: {
        id,
      },
    });

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    const action = data.isDeleted == "1" ? "Delete" : "Update";

    let auditLogBody = {
      recordId: id,
      action: action,
      moduleName: "Tickets",
      newValue: data,
      oldValue: currentRecord.dataValues,
      type: "0",
      userId: null,
      customerId: null,
      ipAddress: ipAddress,
    };

    if (currentRecord.customerId) {
      auditLogBody.type = "1";
      auditLogBody.customerId = currentRecord?.customerId;
    } else if (finalUserId) {
      auditLogBody.type = "0";
      auditLogBody.userId = finalUserId;
    }
    try {
      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return ticketUpdate;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const exportTickets = async (reqBody) => {
  try {
    const { customerId, dateRange, fileName } = reqBody;
    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    const { count, rows } = await getTicketList(
      null,
      null,
      null,
      null,
      null,
      null,
      "asc",
      "createdDate",
      null,
      customerId,
      dateRange,
      null
    );

    if (!rows || rows.length == 0) {
      return { message: "No data found to export." };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets Report");

    worksheet.addRow([
      "Ticket ID",
      "Department Name",
      "Title",
      "Created Date",
      "Status",
    ]);

    rows.forEach((row) => {
      const statusMap = {
        0: "Pending",
        1: "In Progress",
        2: "Escalated",
        3: "Closed",
        4: "Reopened",
      };
      const status = statusMap[row.status] || "";

      worksheet.addRow([
        row.ticketId,
        row.departmentData.departmentName,
        row.title,
        row.createdDate,
        status,
      ]);
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const assertFolderPath = path.join(setting.PROJECT_DIR, "public");

    if (!fs.existsSync(assertFolderPath)) {
      fs.mkdirSync(assertFolderPath, { recursive: true });
    }

    const filePathInsert = path.join(assertFolderPath, fileName);
    const filePath = process.env.EXPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const getTicketList = async (
  id,
  page,
  perPage,
  searchFilter,
  status,
  priority,
  sortOrder,
  orderBy = "id",
  userId,
  customerId,
  dateRange,
  duration,
  ticketPermission,
  departmentId,
  slug
) => {
  try {
    let ticketList;

    if (id) {
      const result = await ticketsModel.findAndCountAll({
        where: {
          id: id,
        },
        raw: true,
      });

      const [departmentData] = await Promise.all([
        axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
        // fetchDepartmentData()
      ]);

      const [serviceData] = await Promise.all([
        axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
        // fetchServiceData()
      ]);

      const newResponseData = result?.rows.map((support) => {
        const findDocumentData = departmentData.data.data.rows.find(
          (department) => department.id == support.departmentId
        );

        // const findDocumentData = departmentData.find(
        //     (department) => department.id == support.departmentId
        // );

        const findServiceData = serviceData.data.data.rows.find(
          (service) => service.slug == support.serviceSlug
        );

        // const findServiceData = serviceData.find(
        //     (service) => service.id == support.serviceId
        // );

        return {
          ...support,
          departmentData: {
            departmentId: findDocumentData?.id,
            departmentName: findDocumentData?.departmentName,
            departmentLogo: findDocumentData?.logo,
          },
          serviceData: {
            serviceId: findServiceData?.id,
            serviceSlug: findServiceData?.slug,
            serviceName: findServiceData?.serviceName,
          },
        };
      });

      ticketList = { count: result.count, rows: newResponseData };
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 10;
      const offset = (actualPage - 1) * actualPerPage;

      let whereClause = {
        isDeleted: "0",
      };

      if (status) {
        whereClause = { ...whereClause, status: status };
      }

      if (slug) {
        whereClause = { ...whereClause, serviceSlug: slug };
      }

      if (priority) {
        whereClause = { ...whereClause, priority: priority };
      }

      if (departmentId) {
        whereClause = { ...whereClause, departmentId: departmentId };
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (duration) {
        case "today":
          whereClause.createdDate = {
            [Op.gte]: today,
          };
          break;
        case "weekly":
          let oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          whereClause.createdDate = {
            [Op.gte]: oneWeekAgo,
          };
          break;
        case "monthly":
          let oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(today.getMonth() - 1);
          whereClause.createdDate = {
            [Op.gte]: oneMonthAgo,
          };
          break;
        default:
          break;
      }

      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        endDate.setHours(23, 59, 59, 999);

        whereClause = {
          ...whereClause,
          createdDate: { [Op.between]: [startDate, endDate] },
        };
      }

      if (userId) {
        const userData = await axios.post(
          `${process.env.USERSERVICE}internalCommunicationUser/view`,
          { data: { id: userId } }
        );
        const viewPermission = ticketPermission?.permissions?.some(
          (permission) => permission.permissionName === "View"
        );
        const editPermission = ticketPermission?.permissions?.some(
          (permission) => permission.permissionName === "Edit"
        );
        const assignPermission = ticketPermission?.permissions?.some(
          (permission) => permission.permissionName === "AssignTo"
        );

        if (userData.data.data.rows[0].isCoreTeam == "1") {
          if (assignPermission) {
            // A user is on core team
          } else {
            if (viewPermission || editPermission) {
              whereClause[Op.or] = [
                { assignTo: userId },
                { userId: userId },
                {
                  [Op.and]: Sequelize.where(
                    Sequelize.fn(
                      "JSON_CONTAINS",
                      Sequelize.col("assignUsersData"),
                      JSON.stringify([{ userId }])
                    ),
                    true
                  ),
                },
              ];
            }
          }
        } else if (userData.data.data.rows[0].isAdmin == "1") {
          // User is not on core team
          const departmentId = userData.data.data.rows[0].departmentId;
          if (departmentId) {
            if (departmentId.includes(",")) {
              whereClause = {
                ...whereClause,
                departmentId: departmentId.split(",").map((id) => id.trim()),
              };
            } else {
              whereClause = {
                ...whereClause,
                departmentId: departmentId.trim(),
              };
            }
          }
        } else {
          // User is not on core team
          const departmentId = userData.data.data.rows[0].departmentId;
          if (departmentId) {
            if (departmentId.includes(",")) {
              whereClause = {
                ...whereClause,
                departmentId: departmentId.split(",").map((id) => id.trim()),
              };
            } else {
              whereClause = {
                ...whereClause,
                departmentId: departmentId.trim(),
              };
            }
          }
          if (assignPermission) {
          } else {
            if (viewPermission || editPermission) {
              whereClause[Op.or] = [
                { assignTo: userId },
                { userId: userId },
                {
                  [Op.and]: Sequelize.where(
                    Sequelize.fn(
                      "JSON_CONTAINS",
                      Sequelize.col("assignUsersData"),
                      JSON.stringify([{ userId }])
                    ),
                    true
                  ),
                },
              ];
            }
          }
        }
      }

      if (customerId) {
        whereClause = { ...whereClause, customerId: customerId };
      }

      if (searchFilter) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${searchFilter}%` } },
          { discription: { [Op.like]: `%${searchFilter}%` } },
          { ticketId: { [Op.like]: `%${searchFilter}%` } },
        ];
      }

      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      const result = await ticketsModel.findAndCountAll({
        where: whereClause,
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true,
      });

      const [departmentData, serviceData, userData, customerData] =
        await Promise.all([
          axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
          // fetchDepartmentData(),
          axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
          // fetchServiceData(),
          axios.post(
            `${process.env.USERSERVICE}internalCommunicationUser/getAlluser`
          ),
          // fetchUserData(),

          axios.post(
            `${process.env.USERSERVICE}internalCommunicationCustomer/customerList`
          ),

          // fetchCustomerData()
        ]);

      const newResponseData = result?.rows.map((support) => {
        let findAssignUser;
        let findUserId;
        let assignUserDropDown;
        let findCustomer;
        let assignUserDepartment;
        const findDocumentData = departmentData.data.data.rows.find(
          (department) => department.id == support.departmentId
        );

        const findService = serviceData.data.data.rows.find(
          (service) => service.slug == support.serviceSlug
        );

        if (support.assignTo) {
          findAssignUser = userData?.data.data.rows.find(
            (user) => user.id == support.assignTo
          );
        }
        if (support.userId) {
          findUserId = userData?.data.data.rows.find(
            (user) => user.id == support?.userId
          );

          assignUserDropDown = userData?.data.data.rows
            .filter((user) => {
              if (!user.departmentId) return false;

              const departmentIds = user.departmentId.includes(",")
                ? user.departmentId.split(",").map((id) => id.trim())
                : [user.departmentId.trim()];

              return departmentIds.includes(String(support.departmentId));
            })
            .map((user) => ({
              userId: user.id,
              userName: user?.name,
              profileImageId: user?.profileImageId,
              isSupportTeam: user?.isSupportTeam,
            }));
        }
        if (support?.customerId) {
          findCustomer = customerData?.data.data.rows.find(
            (customer) => customer.id == support?.customerId
          );
          assignUserDepartment = userData?.data.data.rows.filter((user) => {
            if (!user.departmentId) return false;

            const departmentIds = user.departmentId.includes(",")
              ? user.departmentId.split(",").map((id) => id.trim())
              : [user.departmentId.trim()];

            return departmentIds.includes(String(support.departmentId));
          });
        }

        return {
          ...support,
          departmentData: {
            departmentId: findDocumentData?.id,
            departmentName: findDocumentData?.departmentName,
            departmentLogo: findDocumentData?.logo,
          },
          serviceData: {
            serviceId: findService?.id,
            serviceSlug: findService?.slug,
            serviceName: findService?.serviceName,
          },
          userData: findAssignUser
            ? {
                userId: findAssignUser?.id,
                userName: findAssignUser?.name,
                documentId: findAssignUser?.profileImageId,
              }
            : null,
          user: findUserId
            ? {
                userId: findUserId?.id,
                userName: findUserId?.name,
                documentId: findAssignUser?.profileImageId,
              }
            : null,
          customerData: findCustomer
            ? {
                customerId: findCustomer?.id,
                customerName: `${findCustomer?.firstName} ${findCustomer.lastName}`,
              }
            : null,
          assignDepartmentUser: assignUserDepartment || [],
          assignUserDropDown: assignUserDropDown || [],
        };
      });

      ticketList = { count: result.count, rows: newResponseData };
    }

    let imageData = [];
    try {
      const documentResponse = await //  fetchDocumentData();
      axios.post(`${process.env.DOCUMENTSERVICE}document/list/upload`, {
        data: {},
      });
      imageData = documentResponse?.data?.data?.rows || [];
      // imageData = documentResponse || [];
    } catch (error) {
      console.log("Document API call failed", error);
    }

    const dataWithDocumentsAndImages = ticketList?.rows?.map((ticket) => {
      const matchingDocData = imageData?.find(
        (image) => image.id == ticket.documentId
      );
      const matchingDepartmentImageData = imageData?.find(
        (image) => image.id == ticket?.departmentData?.departmentLogo
      );

      const matchingUserImageData = imageData?.find(
        (image) => image.id == ticket?.userData?.documentId
      );

      return {
        ...ticket,
        documentData: matchingDocData
          ? {
              id: matchingDocData?.id,
              userId: matchingDocData?.userId,
              viewDocumentName: matchingDocData?.viewDocumentName,
              documentPath: matchingDocData?.documentPath,
              fileSize: matchingDocData?.fileSize,
            }
          : null,
        ...ticket,
        departmentImageData: matchingDepartmentImageData
          ? {
              id: matchingDepartmentImageData?.id,
              userId: matchingDepartmentImageData?.userId,
              documentName: matchingDepartmentImageData?.documentName,
              documentPath: matchingDepartmentImageData?.documentPath,
              fileSize: matchingDepartmentImageData?.fileSize,
            }
          : null,
        userData: {
          ...ticket?.userData,
          documentData: matchingUserImageData
            ? {
                id: matchingUserImageData?.id,
                userId: matchingUserImageData?.userId,
                documentName: matchingUserImageData?.documentName,
                documentPath: matchingUserImageData?.documentPath,
                fileSize: matchingUserImageData?.fileSize,
              }
            : null,
        },
      };
    });

    return {
      ...ticketList,
      rows: dataWithDocumentsAndImages,
    };

    // return ticketList
  } catch (error) {
    throw new Error(error);
  }
};

const updateStatusById = async (id, status, req) => {
  try {
    const findTicket = await ticketsModel.findOne({
      where: {
        id: id,
      },
    });
    let updateData = { status: status };

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      const auditLogBody = {
        recordId: "-",
        action: "Status Update",
        moduleName: "Tickets",
        newValue: status,
        oldValue: "N/A",
        type: "0",
        userId: finalUserId,
        customerId: null,
        ipAddress: ipAddress,
      };

      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
    if (status == "2" && findTicket?.workflowData) {
      const workflow =
        findTicket?.workflowData && JSON.parse(findTicket?.workflowData);
      let excludeUserId = [];
      const assignedData = await workflowAssignedTicket(workflow, 1);
      if (workflow) {
        try {
          let tatInDays = assignedData?.TAT;
          // If TAT is not a number, parse it
          if (typeof tatInDays !== "number") {
            tatInDays = Number(tatInDays);
          }

          const turnAroundTime = tatInDays * 24 * 60 * 60 * 1000;
          // Calculate target date by adding turnaround time to the current date
          let targetDate = new Date(Date.now() + turnAroundTime);
          try {
            await axios.post(`${process.env.DEPARTMENTREPORT}/ticket/create`, {
              data: {
                userId: assignedData?.assignedUserId,
                ticketId: findTicket?.ticketId,
                serviceSlug: findTicket?.serviceSlug,
                assignedDate: new Date(),
                turnAroundTime: tatInDays,
              },
            });
          } catch (error) {
            console.error(error);
          }
          if (assignedData?.assignedUserId) {
            const previousAssignUsersData = findTicket?.assignUsersData
              ? JSON.parse(findTicket.assignUsersData)
              : [];
            // Check if the user is already assigned
            const alreadyAssigned = previousAssignUsersData.find(
              (user) => user.userId == assignedData?.assignedUserId
            );
            const updateAssigned = previousAssignUsersData.find(
              (user) => user.userId == findTicket?.assignTo
            );
            if (updateAssigned) {
              updateAssigned.approvalDate = new Date();
            }
            if (alreadyAssigned) {
              alreadyAssigned.approvalDate = null;
            } else {
              // Add the user to the list
              previousAssignUsersData.push({
                userId: assignedData?.assignedUserId,
                approvalDate: null,
              });
            }
            updateData.assignUsersData = JSON.stringify(
              previousAssignUsersData
            );
            updateData.assignTo = assignedData?.assignedUserId;
            updateData.workflowIndex = 1;
            updateData.turnAroundTime = targetDate;
            updateData.status = status;

            if (findTicket?.customerId && updateData?.assignTo) {
              const notificationBodyCommon = {
                serviceSlug: findTicket?.serviceSlug || "Ticket",
                departmentId: findTicket?.departmentId,
                title: "Ticket Status Update.",
                type: "0",
                applicationId: null,
                addedBy: "0",
              };
              let notifications = [];

              notifications.push(
                {
                  ...notificationBodyCommon,
                  customerId: findTicket?.customerId,
                  message: `Your ticket ${findTicket?.ticketId} has been escalated for further attention.`,
                },
                {
                  ...notificationBodyCommon,
                  userId: updateData?.assignTo,
                  message: `Ticket ${findTicket?.ticketId} has been assigned to you for review.`,
                }
              );
              try {
                await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                  data: notifications,
                });
              } catch (error) {
                console.error(error);
              }
            }

            try {
              const logData = {
                description: "Ticket has been escalated",
                ticketsId: id,
                userId: updateData?.assignTo,
                oldStatus: findTicket?.status,
                newStatus: status,
              };
              await ticketsLogModel.create(logData);
           } catch (error) {
            console.error(error);
           }
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (findTicket && status == "3") {
      const previousAssignUsersData = findTicket?.assignUsersData
        ? JSON.parse(findTicket.assignUsersData)
        : [];

      const updateAssigned = previousAssignUsersData.find(
        (user) => user.userId == findTicket?.assignTo
      );
      if (updateAssigned) {
        updateAssigned.approvalDate = new Date();
      }
      updateData.assignUsersData = JSON.stringify(previousAssignUsersData);
      try {
        await axios.put(`${process.env.DEPARTMENTREPORT}/ticket/update`, {
          data: {
            oldUserId: findTicket?.assignTo,
            ticketId: findTicket?.ticketId,
            status: "3",
            completedDate: new Date(),
            approvedBy: finalUserId,
          },
        });
      } catch (error) {
        console.error(error);
      }

      if(findTicket?.customerId) {
          try {
            const notificationBody = {
              serviceSlug: findTicket?.serviceSlug || "",
              departmentId: findTicket?.departmentId,
              title: "Ticket Closed",
              type: "0",
              applicationId: null,
              addedBy: "0",
              customerId: findTicket?.customerId,
              message: `Your ticket ${findTicket?.ticketId} has been successfully closed.`,
            };
            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
              data: notificationBody,
            });
          } catch (error) {
            console.error(error);
          }

          const logData = {
            description: "Ticket has been closed",
            ticketsId: id,
            userId: finalUserId,
            oldStatus: findTicket?.status,
            newStatus: status,
          };
          await ticketsLogModel.create(logData);
      }
    }
    const result = await ticketsModel.update(updateData, {
      where: {
        id: id,
      },
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateTicketLogStatus = async (id, status) => {
  try {
    const getTicketLog = await ticketsLogModel.findOne({
      where: {
        ticketsId: id,
      },
    });
    let updateData;
    if (getTicketLog) {
      if (getTicketLog?.newStatus == null) {
        updateData = {
          newStatus: status,
        };
      } else {
        updateData = {
          newStatus: status,
          oldStatus: getTicketLog?.newStatus,
        };
      }
    }
    const result = await ticketsLogModel.update(updateData, {
      where: {
        ticketsId: id,
      },
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updatePriorityById = async (id, priority) => {
  try {
    return await ticketsModel.update(
      { priority },
      {
        where: {
          id: id,
        },
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};

const updateAssignUserId = async (id, assignToUserId, req) => {
  const reqBody = req.body.data;
  try {
    const findOneTicket = await ticketsModel.findOne({
      where: {
        id,
      },
    });
    const generalSettingsTAT = await generalSettingModel.findOne({
      where: { settingKey: "TAT" },
    });
    if (findOneTicket && findOneTicket?.assignTo) {
      let updateData = { assignTo: assignToUserId };
      const oldAssignTo = findOneTicket.assignTo;
      const previousAssignUsersData = findOneTicket?.assignUsersData
        ? JSON.parse(findOneTicket.assignUsersData)
        : [];
      // Check if the user is already assigned
      const alreadyAssigned = previousAssignUsersData.find(
        (user) => user.userId == assignToUserId
      );
      const updateAssigned = previousAssignUsersData.find(
        (user) => user.userId == oldAssignTo
      );
      if (updateAssigned) {
        updateAssigned.approvalDate = new Date();
      }
      if (alreadyAssigned) {
        alreadyAssigned.approvalDate = null;
      } else {
        // Add the user to the list
        previousAssignUsersData.push({
          userId: assignToUserId,
          approvalDate: null,
        });
      }
      updateData.assignUsersData = JSON.stringify(previousAssignUsersData);
      const ticketUpdate = await ticketsModel.update(updateData, {
        where: {
          id: id,
        },
      });

      try {
        const { userId: extractedUserId, ipAddress } =
          extractDataFromRequest(req);
        const finalUserId = extractedUserId;
        const auditLogBody = {
          recordId: id,
          action: "Ticket Assigned User Update",
          moduleName: "Tickets",
          newValue: assignToUserId,
          oldValue: oldAssignTo,
          type: "0",
          userId: finalUserId,
          customerId: null,
          ipAddress: ipAddress,
        };

        await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
          data: auditLogBody,
        });

        // Notification code
        try {
          const notificationBodyCommon = {
            serviceSlug: "Ticket",
            departmentId: reqBody?.ticketData?.departmentId,
            title: "Assigned User.",
            type: "0",
            applicationId: reqBody?.ticketData?.id,
            addedBy: "1",
          };
          let notifications = [];
          notifications.push(
            // {
            //   ...notificationBodyCommon,
            //   customerId: reqBody?.ticketData?.customerId,
            //   message: `Your raised ticket ${reqBody?.ticketData?.ticketId} is under process.`,
            // },
            {
              ...notificationBodyCommon,
              userId: assignToUserId,
              message: `You have asssigned Ticket ${reqBody?.ticketData?.ticketId} for ${reqBody?.ticketData?.serviceData?.serviceName} for review.`,
            }
          );
          if (notifications.length > 0) {
            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
              data: notifications,
            });
          }
          // adminAssignMail("v1.netclues@gmail.com", {
          //   applicationIdSlug: findOne.applicationId,
          // });
          // statusUpdateMail("v1.netclues@gmail.com");
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error("Error generating audit log:", error);
      }

      if (oldAssignTo) {
        try {
          await axios.put(`${process.env.DEPARTMENTREPORT}/ticket/update`, {
            data: {
              oldUserId: oldAssignTo,
              userId: assignToUserId,
              ticketId: findOneTicket?.ticketId,
            },
          });
        } catch (error) {
          console.error(error);
        }
      }

      return ticketUpdate;
    } else {
      const generalSettingsTAT = await generalSettingModel.findOne({
        where: { settingKey: "TAT" },
      });

      if (generalSettingsTAT) {
        const parseTAT = JSON.parse(generalSettingsTAT.settingValue);

        if (typeof parseTAT === "number") {
          // Calculate turnaround time in milliseconds (assuming parseTAT is in days)
          const turnAroundTime = parseTAT * 24 * 60 * 60 * 1000;

          // Calculate target date by adding turnaround time to current date
          const targetDate = new Date(Date.now() + turnAroundTime);

          let updateData = {
            assignTo: assignToUserId,
            turnAroundTime: targetDate,
          };
          const oldAssignTo = findOneTicket.assignTo;
          const previousAssignUsersData = findOneTicket?.assignUsersData
            ? JSON.parse(findOneTicket.assignUsersData)
            : [];
          // Check if the user is already assigned
          const alreadyAssigned = previousAssignUsersData.find(
            (user) => user.userId == assignToUserId
          );
          const updateAssigned = previousAssignUsersData.find(
            (user) => user.userId == oldAssignTo
          );
          if (updateAssigned) {
            updateAssigned.approvalDate = new Date();
          }
          if (alreadyAssigned) {
            alreadyAssigned.approvalDate = null;
          } else {
            // Add the user to the list
            previousAssignUsersData.push({
              userId: assignToUserId,
              approvalDate: null,
            });
          }
          updateData.assignUsersData = JSON.stringify(previousAssignUsersData);
          const ticketUpdate = await ticketsModel.update(updateData, {
            where: {
              id: id,
            },
          });
        }

        // IF not assigned to then create report
        try {
          await axios.post(`${process.env.DEPARTMENTREPORT}/ticket/create`, {
            data: {
              userId: assignToUserId,
              ticketId: findOneTicket?.ticketId,
              serviceSlug: findOneTicket?.serviceSlug,
              assignedDate: new Date(),
              turnAroundTime: parseTAT,
            },
          });
        } catch (error) {
          console.error(error);
        }

        try {
          const { userId: extractedUserId, ipAddress } =
            extractDataFromRequest(req);
          const finalUserId = extractedUserId;
          const oldAssignTo = findOneTicket?.assignTo || null;
          const auditLogBody = {
            recordId: id,
            action: "Ticket Assigned User Update",
            moduleName: "Tickets",
            newValue: assignToUserId,
            oldValue: oldAssignTo,
            type: "0",
            userId: finalUserId,
            customerId: null,
            ipAddress: ipAddress,
          };

          await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
            data: auditLogBody,
          });
        } catch (error) {
          console.error("Error generating audit log:", error);
        }

        if(reqBody?.ticketData?.customerId){
          try {
            const logData = {
              description: "The ticket is currently being processed.",
              ticketsId: id,
              userId: assignToUserId,
              oldStatus: "0",
              newStatus: "1",
            };
            await ticketsLogModel.create(logData);
          } catch (error) {
            console.error(error);
          }
        }

        try {
          const notificationBodyCommon = {
            serviceSlug: "Ticket",
            departmentId: reqBody?.ticketData?.departmentId,
            title: "Assigned User.",
            type: "0",
            applicationId: reqBody?.ticketData?.id,
            addedBy: "1",
          };
          let notifications = [];
          notifications.push(
            {
              ...notificationBodyCommon,
              customerId: reqBody?.ticketData?.customerId,
              message: `Your ticket ${reqBody?.ticketData?.ticketId} is currently being processed.`,
            },
            {
              ...notificationBodyCommon,
              userId: assignToUserId,
              message: `Ticket ${reqBody?.ticketData?.ticketId} has been assigned to you for review.`,
            }
          );
          if (notifications.length > 0) {
            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
              data: notifications,
            });
          }
          // adminAssignMail("v1.netclues@gmail.com", {
          //   applicationIdSlug: findOne.applicationId,
          // });
          // statusUpdateMail("v1.netclues@gmail.com");
        } catch (error) {
          console.error(error);
        }

        return findOneTicket;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const sendNewMessage = async (bodyData, req) => {
  try {
    const result = await ticketChatModel.create(bodyData);

    const ticket = await ticketsModel.findOne({
      where: { id: bodyData?.ticketId },
      raw: true,
    });

    if (ticket && bodyData?.customerId) {
      const notificationBody = {
        serviceSlug: ticket?.serviceSlug || "Ticket",
        departmentId: parseInt(ticket?.departmentId),
        title: "Ticket Chat Update",
        type: "0",
        applicationId: null,
        addedBy: "0",
        userId: parseInt(ticket?.assignTo),
        message: `You have received a new message in Ticket ${ticket?.ticketId}.`,
      };
      await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
        data: notificationBody,
      });
    }
    if (ticket && bodyData?.userId) {
      const notificationBody = {
        serviceSlug: ticket?.serviceSlug || "Ticket",
        departmentId: parseInt(ticket?.departmentId),
        title: "Ticket Chat Update",
        type: "0",
        applicationId: null,
        addedBy: "0",
        customerId: parseInt(ticket?.customerId),
        message: `You have received a new message in Ticket ${ticket?.ticketId}.`,
      };
      await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
        data: notificationBody,
      });
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    let auditLogBody = {
      recordId: "-",
      action: "New message",
      moduleName: "Tickets",
      newValue: bodyData,
      oldValue: "N/A",
      type: "0",
      userId: null,
      customerId: null,
      ipAddress: ipAddress,
    };

    if (bodyData.customerId) {
      auditLogBody.type = "1";
      auditLogBody.customerId = bodyData.customerId;
    } else if (finalUserId) {
      auditLogBody.type = "0";
      auditLogBody.userId = finalUserId;
    }

    try {
      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getTicketChatData = async (ticketId, customerId) => {
  try {
    let whereClause = { ticketId: ticketId };

    // whereClause = { ...whereClause, customerId: customerId };

    const result = await ticketChatModel.findAndCountAll({
      where: whereClause,
      order: [["createdDate", "ASC"]],
    });

    const [customerData, userData, documentData] = await Promise.all([
      axios.post(
        `${process.env.USERSERVICE}internalCommunicationCustomer/customerList`
      ),
      // fetchCustomerData(),
      axios.post(
        `${process.env.USERSERVICE}internalCommunicationUser/getAlluser`
      ),
      // fetchUserData(),
      axios.post(`${process.env.DOCUMENTSERVICE}view`, {
        data: {},
      }),
      // fetchDocumentViewData()
    ]);

    const newResponseData = result?.rows.map((ticket) => {
      if (ticket.customerId) {
        const customerDetails = customerData?.data?.data.rows.find(
          (user) => user.id == ticket.customerId
        );

        // const customerDetails = customerData.find(
        //     (user) => user.id === ticket.customerId
        // );

        const documentList = documentData?.data?.data.rows?.find(
          (document) => document.id == customerDetails.nibImageId
        );

        // const documentList = documentData.find(
        //     (document) => document.id === customerDetails.nibImageId
        // );
        return {
          ...ticket,
          customer: {
            customerId: customerDetails?.id,
            customerName:
              customerDetails?.firstName + " " + customerDetails?.lastName,
          },
          documentData: {
            documentId: documentList?.id,
            documentPath: documentList?.documentPath,
          },
        };
      }

      if (ticket.userId) {
        const userDetails = userData?.data?.data.rows.find(
          (user) => user.id == ticket.userId
        );

        // const userDetails = userData.find(
        //     (user) => user.id === ticket.userId
        // );

        const documentList = documentData?.data?.data.rows?.find(
          (document) => document.id == userDetails.profileImageId
        );

        // const documentList = documentData.find(
        //     (document) => document.id === userDetails.profileImageId
        // );
        return {
          ...ticket,
          userDetails: {
            userId: userDetails?.id,
            userName: userDetails?.name,
          },
          documentData: {
            documentId: documentList?.id,
            documentPath: documentList?.documentPath,
          },
        };
      }
    });
    return { count: result.count, rows: newResponseData };
  } catch (error) {
    throw new Error(error);
  }
};

const getTicketLogsData = async (ticketId, customerId) => {
  if (!ticketId) throw new Error("ticketId is required.");

  // Fetch ticket data
  const ticketData = await ticketsLogModel
    .findAndCountAll({
      where: { ticketsId: ticketId },
      raw: true,
      order: [["createdDate", "DESC"]],
    })
    .catch((error) => {
      console.error("Error fetching ticket logs:", error);
      throw new Error("Failed to fetch ticket logs");
    });

  const apiResults = await Promise.allSettled([
    axios.post(
      `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
      {
        data: { userId: [] },
      }
    ),
    axios.post(`${process.env.DOCUMENTSERVICE}list/uploadAdmin`, {
      data: {
        documentIds: [],
      },
    }),
    ...(customerId
      ? [
          axios.post(
            `${process.env.USERSERVICE}internalCommunicationCustomer/customerListAdmin`,
            {
              data: { customerIds: [customerId] },
            }
          ),
        ]
      : []),
  ]);

  const documentMap = new Map(
    (apiResults[1]?.status === "fulfilled"
      ? apiResults[1].value?.data?.data?.rows
      : []
    )?.map((doc) => [doc.id, doc.documentPath]) || []
  );

  const userMap = new Map(
    (apiResults[0]?.status === "fulfilled"
      ? apiResults[0].value?.data?.data?.rows
      : []
    )?.map((user) => [user.id, user]) || []
  );

  const customerMap = new Map(
    (customerId && apiResults[2]?.status === "fulfilled"
      ? apiResults[2].value?.data?.data?.rows
      : []
    )?.map((customer) => [customer.id, customer]) || []
  );

  const enhancedLogs = ticketData.rows.map((ticket) => {
    if (ticket.customerId) {
      const customer = customerMap.get(ticket.customerId);
      return {
        ...ticket,
        customer: customer && {
          id: customer.id,
          name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
          image: documentMap.get(customer.nibImageId),
        },
      };
    }

    if (ticket.userId) {
      const user = userMap.get(ticket.userId);
      return {
        ...ticket,
        userDetails: user && {
          id: user.id,
          name: user.name || "",
          image: documentMap.get(user.profileImageId),
        },
      };
    }

    return ticket;
  });

  return { count: ticketData.count, rows: enhancedLogs };
};

const updateTicketById = async (ticketId) => {
  try {
    var test = new Date();
    var formattedDate = moment(test).toISOString();
    return await ticketsModel.update(
      {
        respondedOn: formattedDate,
      },
      {
        where: {
          id: ticketId,
        },
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};
const TicketCountStatusWise = async (departmentId = null) => {
  try {
    const whereClause = departmentId ? { departmentId } : {};

    const result = await ticketsModel.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: whereClause,
      group: ["status"],
    });

    // Get the count of tickets created today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const newTickets = await ticketsModel.count({
      where: {
        createdDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
        ...whereClause,
      },
    });

    // Transform the result into a more readable format
    const counts = result.reduce(
      (acc, curr) => {
        const status = curr.status;
        const count = curr.dataValues.count;

        switch (status) {
          case "1":
            acc.inProgress = count;
            break;
          case "2":
            acc.escalated = count;
            break;
          case "3":
            acc.closed = count;
            break;
          case "4":
            acc.reopened = count;
            break;
          default:
            break;
        }

        return acc;
      },
      { new: newTickets, inProgress: 0, escalated: 0, closed: 0, reopened: 0 }
    );

    return counts;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTicketAllList = async () => {
  try {
    const result = await ticketsModel.findAndCountAll({
      where: {
        status: {
          [Op.ne]: "3",
        },
      },
      raw: true,
    });

    const ticketCount = result.count;

    return { ticketCount: ticketCount };
  } catch (error) {
    throw new Error(error);
  }
};

const getLatestActivityDate = async (ticketId) => {
  try {
    const ticketData = await ticketsModel.findOne({
      where: { id: ticketId },
      attributes: ["updateDate"],
    });

    if (!ticketData) {
      return null;
    }

    const ticketChats = await ticketChatModel.findAll({
      where: { ticketId },
      attributes: ["updateDate"],
    });

    const chatUpdateDates = ticketChats.map((chat) => chat.updateDate);

    const latestChatUpdateDate = chatUpdateDates.length
      ? new Date(Math.max(...chatUpdateDates.map((date) => new Date(date))))
      : null;

    const ticketLogData = await ticketsLogModel.findOne({
      where: { ticketsId: ticketId },
      attributes: ["createdDate"],
    });

    const ticketLogCreatedDate = ticketLogData
      ? new Date(ticketLogData.createdDate)
      : null;

    const latestActivityDate = new Date(
      Math.max(
        new Date(ticketData.updateDate),
        latestChatUpdateDate || 0,
        ticketLogCreatedDate || 0
      )
    );

    return latestActivityDate;
  } catch (error) {
    console.error("Error in getLatestActivityDate:", error);
    throw new Error(error);
  }
};

const reOpenTicketService = async (
  id,
  customerId,
  status,
  description,
  req
) => {
  try {
    const findTicket = await ticketsModel.findOne({
      where: {
        id: id,
      },
    });
    let updateData = { status: status };

    const { ipAddress } = extractDataFromRequest(req);
    try {
      const auditLogBody = {
        recordId: "-",
        action: "Reopen Ticket",
        moduleName: "Tickets",
        newValue: status,
        oldValue: "N/A",
        type: "0",
        userId: null,
        customerId: customerId,
        ipAddress: ipAddress,
      };

      // await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
      //   data: auditLogBody,
      // });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
    if (status == "1" && findTicket?.workflowData) {
      const workflow =
        findTicket?.workflowData && JSON.parse(findTicket?.workflowData);
      let excludeUserId = [];
      const assignedData = await workflowAssignedTicket(workflow, 0);
      if (workflow) {
        try {
          let tatInDays = assignedData?.TAT;
          // If TAT is not a number, parse it
          if (typeof tatInDays !== "number") {
            tatInDays = Number(tatInDays);
          }

          const turnAroundTime = tatInDays * 24 * 60 * 60 * 1000;
          // Calculate target date by adding turnaround time to the current date
          let targetDate = new Date(Date.now() + turnAroundTime);
          try {
            await axios.post(`${process.env.DEPARTMENTREPORT}/ticket/create`, {
              data: {
                userId: assignedData?.assignedUserId,
                ticketId: findTicket?.ticketId,
                serviceSlug: findTicket?.serviceSlug,
                assignedDate: new Date(),
                turnAroundTime: tatInDays,
              },
            });
          } catch (error) {
            console.error(error);
          }
          if (assignedData?.assignedUserId) {
            const previousAssignUsersData = findTicket?.assignUsersData
              ? JSON.parse(findTicket.assignUsersData)
              : [];
            // Check if the user is already assigned
            const alreadyAssigned = previousAssignUsersData.find(
              (user) => user.userId == assignedData?.assignedUserId
            );
            const updateAssigned = previousAssignUsersData.find(
              (user) => user.userId == findTicket?.assignTo
            );
            if (updateAssigned) {
              updateAssigned.approvalDate = new Date();
            }

            if (alreadyAssigned) {
              alreadyAssigned.approvalDate = new Date();
            } else {
              // Add the user to the list
              previousAssignUsersData.push({
                userId: assignedData?.assignedUserId,
                approvalDate: null,
              });
            }
            updateData.assignUsersData = JSON.stringify(
              previousAssignUsersData
            );
            updateData.assignTo = assignedData?.assignedUserId;
            updateData.workflowIndex = 1;
            updateData.turnAroundTime = targetDate;
            updateData.status = status;

            if (findTicket?.customerId && updateData?.assignTo) {
              const notificationBodyCommon = {
                serviceSlug: findTicket?.serviceSlug || "Ticket",
                departmentId: findTicket?.departmentId,
                title: "Ticket Status Update.",
                type: "0",
                applicationId: null,
                addedBy: "0",
              };
              let notifications = [];

              notifications.push(
                {
                  ...notificationBodyCommon,
                  customerId: findTicket?.customerId,
                  message: `Your ticket ${findTicket?.ticketId} has been reopened and is being reviewed.`,
                },
                {
                  ...notificationBodyCommon,
                  userId: updateData?.assignTo,
                  message: `Ticket ${findTicket?.ticketId} has been reassigned to you for review after being reopened.`,
                }
              );
              try {
                await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                  data: notifications,
                });
              } catch (error) {
                console.error(error);
              }
            }

            let departmentAdmin;
            if (findTicket?.departmentId) {
              try {
                let result = await axios.post(
                  `${process.env.USERSERVICE}internalCommunicationUser/findAdmin`,
                  {
                    data: {
                      departmentId: findTicket?.departmentId,
                    },
                  }
                );
                if (result) {
                  departmentAdmin = result?.data?.data;
                }
              } catch (error) {
                console.error(error);
              }
              try {
                const notificationBody = {
                  serviceSlug: findTicket?.serviceSlug || "",
                  departmentId: findTicket?.departmentId,
                  title: "Ticket Reopen",
                  type: "0",
                  applicationId: null,
                  addedBy: "0",
                  userId: departmentAdmin?.id,
                  message: `Ticket ${findTicket?.ticketId} - ${findTicket?.title} has been reopened.`,
                };
                await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                  data: notificationBody,
                });
              } catch (error) {
                console.error(error);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      const prevAssignedUsers= findTicket?.assignUsersData ? JSON.parse(findTicket?.assignUsersData) : [];
      if(prevAssignedUsers && prevAssignedUsers?.length > 0){
        const findUser= prevAssignedUsers && prevAssignedUsers?.map((user)=>user.userId)
        const findUsers = await axios.post(
          `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
          {
            data: { userId: findUser },
          }
        )
        const findUserResult = findUsers?.data?.data?.rows || []
        const findSupportTeam = findUserResult?.find(user => user.isSupportTeam == "1") || findUserResult?.[0];
        if (findSupportTeam && findSupportTeam?.id) {
          try {
            const generalSettingsTAT = await generalSettingModel.findOne({
              where: { settingKey: "TAT" },
              raw: true,
            });
      
            let tatInDays = generalSettingsTAT?.settingValue;
            const parsedTatInDays = parseInt(tatInDays);
            try {
              await axios.post(`${process.env.DEPARTMENTREPORT}/ticket/create`, {
                data: {
                  userId: findSupportTeam?.id,
                  ticketId: findTicket?.ticketId,
                  serviceSlug: findTicket?.serviceSlug,
                  assignedDate: new Date(),
                  turnAroundTime: parsedTatInDays,
                },
              });
            } catch (error) {
              console.error(error);
            }
            const turnAroundTime = parsedTatInDays * 24 * 60 * 60 * 1000;
            let targetDate = new Date(Date.now() + turnAroundTime);      
           
            if (findSupportTeam?.id) {
              const previousAssignUsersData = findTicket?.assignUsersData
                ? JSON.parse(findTicket.assignUsersData)
                : [];
              // Check if the user is already assigned
              const alreadyAssigned = previousAssignUsersData.find(
                (user) => user.userId == findSupportTeam?.id
              );
              const updateAssigned = previousAssignUsersData.find(
                (user) => user.userId == findTicket?.assignTo
              );
              if (updateAssigned) {
                updateAssigned.approvalDate = new Date();
              }
  
              if (alreadyAssigned) {
                alreadyAssigned.approvalDate = new Date();
              } else {
                // Add the user to the list
                previousAssignUsersData.push({
                  userId: findSupportTeam?.id,
                  approvalDate: null,
                });
              }
              updateData.assignUsersData = JSON.stringify(
                previousAssignUsersData
              );
              updateData.assignTo = findSupportTeam?.id;
              updateData.workflowIndex = 0;
              updateData.turnAroundTime = targetDate;
              updateData.status = status;
  
              if (findTicket?.customerId && updateData?.assignTo) {
                const notificationBodyCommon = {
                  serviceSlug: findTicket?.serviceSlug || "Ticket",
                  departmentId: findTicket?.departmentId,
                  title: "Ticket Status Update.",
                  type: "0",
                  applicationId: null,
                  addedBy: "0",
                };
                let notifications = [];
  
                notifications.push(
                  {
                    ...notificationBodyCommon,
                    customerId: findTicket?.customerId,
                    message: `Your ticket ${findTicket?.ticketId} has been reopened and is being reviewed.`,
                  },
                  {
                    ...notificationBodyCommon,
                    userId: updateData?.assignTo,
                    message: `Ticket ${findTicket?.ticketId} has been reassigned to you for review after being reopened.`,
                  }
                );
                try {
                  await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                    data: notifications,
                  });
                } catch (error) {
                  console.error(error);
                }
              }
  
              let departmentAdmin;
              if (findTicket?.departmentId) {
                try {
                  let result = await axios.post(
                    `${process.env.USERSERVICE}internalCommunicationUser/findAdmin`,
                    {
                      data: {
                        departmentId: findTicket?.departmentId,
                      },
                    }
                  );
                  if (result) {
                    departmentAdmin = result?.data?.data;
                  }
                } catch (error) {
                  console.error(error);
                }
                try {
                  const notificationBody = {
                    serviceSlug: findTicket?.serviceSlug || "",
                    departmentId: findTicket?.departmentId,
                    title: "Ticket Reopen",
                    type: "0",
                    applicationId: null,
                    addedBy: "0",
                    userId: departmentAdmin?.id,
                    message: `Ticket ${findTicket?.ticketId} - ${findTicket?.title} has been reopened.`,
                  };
                  await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                    data: notificationBody,
                  });
                } catch (error) {
                  console.error(error);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
    const logData = {
      description: description,
      ticketsId: id,
      customerId: customerId,
      oldStatus: "3",
      newStatus: "4",
    };
    await ticketsLogModel.create(logData);
    const result = await ticketsModel.update(updateData, {
      where: {
        id: id,
      },
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
module.exports = {
  createNewTicket,
  updateTicketData,
  getTicketList,
  createNewTicketLog,
  updateStatusById,
  updatePriorityById,
  updateAssignUserId,
  sendNewMessage,
  getTicketChatData,
  getTicketLogsData,
  updateTicketById,
  updateTicketLogStatus,
  exportTickets,
  TicketCountStatusWise,
  getTicketAllList,
  getLatestActivityDate,
  workflowAssignedTicket,
  reOpenTicketService,
};
