const { default: axios } = require("axios");
const { applicationReportModel, ticketReportModel } = require("../models");
const { Op, where } = require("sequelize");
const Sequelize = require("sequelize");
const moment = require("moment");
const { fetchDepartmentData, fetchServiceData, fetchUserData } = require("./cacheUtility");
const ExcelJS = require('exceljs');
const path = require('path');
const puppeteer = require("puppeteer");
const setting = require("../../setting");
const fs = require("fs");

const calculateDateRange = (option) => {
  let startDate, endDate;

  switch (option) {
    case "This Week":
      startDate = moment().startOf("week");
      endDate = moment().endOf("week");
      break;
    case "Last Week":
      startDate = moment().subtract(1, "weeks").startOf("week");
      endDate = moment().subtract(1, "weeks").endOf("week");
      break;
    case "Previous Week":
      startDate = moment().subtract(2, "weeks").startOf("week");
      endDate = moment().subtract(2, "weeks").endOf("week");
      break;
    case "This Month":
      startDate = moment().startOf("month");
      endDate = moment().endOf("month");
      break;
    case "Last Month":
      startDate = moment().subtract(1, "months").startOf("month");
      endDate = moment().subtract(1, "months").endOf("month");
      break;
    case "Previous Month":
      startDate = moment().subtract(2, "months").startOf("month");
      endDate = moment().subtract(2, "months").endOf("month");
      break;
    case "This Year":
      startDate = moment().startOf("year");
      endDate = moment().endOf("year");
      break;
    case "Last Year":
      startDate = moment().subtract(1, "years").startOf("year");
      endDate = moment().subtract(1, "years").endOf("year");
      break;
    case "Previous Year":
      startDate = moment().subtract(2, "years").startOf("year");
      endDate = moment().subtract(2, "years").endOf("year");
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};
const calculateDateRangeMonthwise = (option) => {
  let startDate, endDate;

  switch (option) {
    case "All":
      startDate = moment().subtract(100, "years"); // Arbitrarily large range for 'All'
      endDate = moment();
      break;
    case "1w": // One Week
      startDate = moment().subtract(1, "weeks").startOf("day");
      endDate = moment().endOf("day");
      break;
    case "1m": // One Month
      startDate = moment().subtract(1, "months").startOf("day");
      endDate = moment().endOf("day");
      break;
    case "3m": // Three Months
      startDate = moment().subtract(3, "months").startOf("day");
      endDate = moment().endOf("day");
      break;
    case "6m": // Six Months
      startDate = moment().subtract(6, "months").startOf("day");
      endDate = moment().endOf("day");
      break;
    case "1y": // One Year
      startDate = moment().subtract(1, "years").startOf("day");
      endDate = moment().endOf("day");
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};

const getDepartmentPerformance = async (reqBody) => {
    try {
      const { dateRangeOption, departmentId, searchQuery, dateRange } = reqBody;
      const whereConditions = {};
  
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        whereConditions.createdDate = {
          [Op.between]: [startDate, endDate],
        };
      }
  
      if (dateRangeOption) {
        const { startDate, endDate } = calculateDateRangeMonthwise(dateRangeOption);
        if (startDate && endDate) {
          whereConditions.createdDate = {
            [Op.between]: [startDate.toDate(), endDate.toDate()],
          };
        }
      }
  
      let serviceList = [];
      let departmentList = [];
      try {
        const [departmentData, serviceData] = await Promise.all([
          axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
          axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
        ]);
        serviceList = serviceData?.data?.data?.rows;
        departmentList = departmentData?.data?.data?.rows;
      } catch (error) {
        console.error(error);
      }
  
      const applications = await applicationReportModel.findAll({ where: whereConditions });
      const tickets = await ticketReportModel.findAll({ where: whereConditions });
  
      const filterByDepartmentId = (items, serviceList) => {
        if (!departmentId) return items;
        return items.filter(item => {
          const service = serviceList.find(service => service.slug === item.serviceSlug);
          return service && service.departmentId == departmentId;
        });
      };
  
      const processItems = (items, statusCondition) => {
        const result = {};
      
        items.forEach(({ serviceSlug, status, assignedDate, completedDate, turnAroundTime }) => {
          if (!result[serviceSlug]) {
            result[serviceSlug] = {
              Request_Assigned: 0,
              Request_Completed: 0,
              totalCompletedTime: 0,
              totalTATDays: 0,
            };
          }
      
          result[serviceSlug].Request_Assigned += 1;
      
          if (statusCondition(status)) {
            result[serviceSlug].Request_Completed += 1;
      
            if (assignedDate && completedDate) {
              const minutesDiff = moment(completedDate).diff(moment(assignedDate), 'minutes');
              result[serviceSlug].totalCompletedTime += minutesDiff;
      
              if (turnAroundTime) {
                result[serviceSlug].totalTATDays += turnAroundTime;
              }
            }
          }
        });
      
        return result;
      };
      
  
      const formatData = (result, serviceList, departmentList) => {
        return Object.keys(result).map((serviceSlug, index) => {
          const data = result[serviceSlug];
          const service = serviceList?.find(service => service.slug === serviceSlug);
          const department = departmentList?.find(department => department.id === service?.departmentId);
  
          return {
            serviceSlug,
            serviceName: service?.serviceName,  // Include service name
            RequestAssigned: data.Request_Assigned,
            RequestCompleted: data.Request_Completed,
            TotalTATDays: Math.round(data.totalTATDays),
            completedDays: data.totalCompletedTime,
            departmentName: department ? department.departmentName : `${index}`,
          };
        });
      };
  
      const filterBySearchQuery = (data, searchQuery) => {
        if (!searchQuery) return data;
        const regex = new RegExp(searchQuery, 'i');
        return data.filter(item => regex.test(item.departmentName));
      };
  
      const aggregateByDepartment = (data) => {
        const departmentAggregation = {};
  
        data.forEach(({ departmentName, RequestAssigned, RequestCompleted, TotalTATDays, completedDays, serviceSlug, serviceName }) => {
          if (!departmentAggregation[departmentName]) {
            departmentAggregation[departmentName] = {
              departmentName,
              RequestAssigned: 0,
              RequestCompleted: 0,
              TotalTATDays: 0,
              completedDays: 0,
              services: [],  // New array to hold services under each department
            };
          }
  
          // Update department-level data
          departmentAggregation[departmentName].RequestAssigned += RequestAssigned;
          departmentAggregation[departmentName].RequestCompleted += RequestCompleted;
          departmentAggregation[departmentName].TotalTATDays += TotalTATDays;
          departmentAggregation[departmentName].completedDays += completedDays;
  
          // Add service-level data under each department
          departmentAggregation[departmentName].services.push({
            serviceSlug,
            serviceName,  // Include service name
            RequestAssigned,
            RequestCompleted,
            TotalTATDays,
            completedDays,
          });
        });
  
        return Object.values(departmentAggregation);
      };
  
      const filteredApplications = filterByDepartmentId(applications, serviceList);
      const applicationResult = processItems(filteredApplications, status => status === '1' || status === '4');
      const formattedApplicationData = formatData(applicationResult, serviceList, departmentList);
      const filteredApplicationData = filterBySearchQuery(formattedApplicationData, searchQuery);
      const aggregatedApplicationData = aggregateByDepartment(filteredApplicationData);
  
      const filteredTickets = filterByDepartmentId(tickets, serviceList);
      const ticketResult = processItems(filteredTickets, status => status === '3');
      const formattedTicketData = formatData(ticketResult, serviceList, departmentList);
      const filteredTicketData = filterBySearchQuery(formattedTicketData, searchQuery);
      const aggregatedTicketData = aggregateByDepartment(filteredTicketData);
  
      return { application: aggregatedApplicationData, ticket: aggregatedTicketData };
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
};

const getServicePerformanceUser = async (reqBody) => {
    try {
        const {
            serviceSlug,
            dateRangeOption,
            searchQuery,
            dateRange,
            page,
            perPage,
        } = reqBody;
        
        const whereConditions = { serviceSlug: serviceSlug };

        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            whereConditions.createdDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        if (dateRangeOption) {
            const { startDate, endDate } = calculateDateRange(dateRangeOption);
            if (startDate && endDate) {
                whereConditions.createdDate = {
                    [Op.between]: [startDate.toDate(), endDate.toDate()],
                };
            }
        }

        // Handle search query for filtering user IDs
        let usersList = [];
        if (searchQuery) {
            try {
                const usersData = await axios.post(
                    `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
                    {
                        data: { searchQuery: searchQuery },
                    }
                );
                usersList = usersData?.data?.data?.rows || [];
            } catch (error) {
                console.error(error);
            }

            if (usersList.length > 0) {
                whereConditions.userId = {
                    [Op.in]: usersList.map((user) => user.id),
                };
            } else {
                return { rows: [], count: 0 };
            }
        }

        // Define attributes for application performance
        const queryOptions = {
            attributes: [
                "userId",
                "serviceSlug",
                [Sequelize.fn("COUNT", Sequelize.col("*")), "RequestAssigned"],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.literal(
                            `CASE WHEN status = '4' THEN 1 ELSE 0 END`
                        )
                    ),
                    "RequestCompleted",
                ],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.literal(
                            `CASE WHEN status = '4' THEN COALESCE(turnAroundTime, 0) ELSE 0 END`
                        )
                    ),
                    "TotalTATDays",
                ],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.literal(
                            `CASE WHEN status = '4' THEN TIMESTAMPDIFF(MINUTE, assignedDate, completedDate) ELSE 0 END`
                        )
                    ),
                    "completedHours",
                ],
            ],
            where: whereConditions,
            group: ["userId", "serviceSlug"],
            raw: true,
        };

        // Implement pagination
        if (page && perPage) {
            const offset = (page - 1) * perPage;
            queryOptions.limit = perPage;
            queryOptions.offset = offset;
        }

        // Fetch application performance data
        const applications = await applicationReportModel.findAndCountAll(queryOptions);

        // Fetch user details for the resulting application data
        const userIds = applications.rows.map((application) => application.userId);
        let usersListForApplications = [];
        if (userIds.length > 0) {
            try {
                const usersData = await axios.post(
                    `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
                    {
                        data: { userIds: userIds },
                    }
                );
                usersListForApplications = usersData?.data?.data?.rows || [];
            } catch (error) {
                console.error(error);
            }
        }

        // Merge user info with application performance data
        const applicationWithUser = applications.rows.map((application) => {
            const user = usersListForApplications.find(
                (user) => user.id === application.userId
            );
            return {
                ...application,
                userInfo: user
                    ? {
                          userId: user.id,
                          userName: user.name,
                          userEmail: user.email,
                      }
                    : null,
            };
        });

        return {
            rows: applicationWithUser,
            count: applications.count.length,
        };
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
const getServiceTicketPerformanceUser = async (reqBody) => {
  try {
    const { serviceSlug, dateRangeOption, searchQuery, dateRange, page, perPage } = reqBody;

    const whereConditions = { serviceSlug: serviceSlug };

    // Date range filtering
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereConditions.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (dateRangeOption) {
      const { startDate, endDate } = calculateDateRange(dateRangeOption);
      if (startDate && endDate) {
        whereConditions.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }

    // Handle search query for filtering user IDs
    let usersList = [];
    if (searchQuery) {
      try {
        const usersData = await axios.post(
          `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
          {
            data: { searchQuery: searchQuery },
          }
        );
        usersList = usersData?.data?.data?.rows || [];
      } catch (error) {
        console.error(error);
      }

      if (usersList.length > 0) {
        whereConditions.userId = {
          [Op.in]: usersList.map(user => user.id),
        };
      } else {
        return { rows: [], count: 0 };
      }
    }

    // Define attributes for ticket performance
    const queryOptions = {
      attributes: [
        'userId',
        'serviceSlug',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'RequestAssigned'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = '3' THEN 1 ELSE 0 END`)), 'RequestCompleted'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = '3' THEN COALESCE(turnAroundTime, 0) ELSE 0 END`)), 'TotalTATDays'],
        [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN status = '3' THEN TIMESTAMPDIFF(MINUTE, assignedDate, completedDate) ELSE 0 END`)), 'completedHours'],
      ],
      where: whereConditions,
      group: ['userId', 'serviceSlug'],
      raw: true,
    };

    // Implement pagination
    if (page && perPage) {
      const offset = (page - 1) * perPage;
      queryOptions.limit = perPage;
      queryOptions.offset = offset;
    }

    // Fetch ticket performance data
    const tickets = await ticketReportModel.findAndCountAll(queryOptions);

    // Fetch user details for the resulting ticket data
    const userIds = tickets.rows.map(ticket => ticket.userId);
    let usersListForTickets = [];
    if (userIds.length > 0) {
      try {
        const usersData = await axios.post(
          `${process.env.USERSERVICE}internalCommunicationUser/getAlluserSearch`,
          {
            data: { userIds: userIds },
          }
        );
        usersListForTickets = usersData?.data?.data?.rows || [];
      } catch (error) {
        console.error(error);
      }
    }

    // Merge user info with ticket performance data
    const ticketWithUser = tickets.rows.map((ticket) => {
      const user = usersListForTickets.find(user => user.id === ticket.userId);
      return {
        ...ticket,
        userInfo: user ? {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        } : null,
      };
    });

    return {
      rows: ticketWithUser,
      count: tickets.count.length, // Use length of grouped results
    };

  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};


const getTeamPerformance = async (reqBody) => {
  try {
    const { dateRangeOption, departmentId, searchQuery, dateRange } = reqBody;
    const whereConditions = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereConditions.createdDate = {
          [Op.between]: [startDate, endDate],
      };
  }

    if (dateRangeOption) {
      const { startDate, endDate } = calculateDateRangeMonthwise(dateRangeOption);
      if (startDate && endDate) {
        whereConditions.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }

    let userList = [];
    try {
      const [userData] = await Promise.all([
        axios.post(`${process.env.USERSERVICE}internalCommunicationUser/getAlluser`),
        // fetchUserData()
      ]);
      userList = userData?.data?.data?.rows;
      // userList = userData;

    } catch (error) {
      console.error(error);
    }
    const applications = await applicationReportModel.findAll({ where: whereConditions })
    const tickets = await ticketReportModel.findAll({ where: whereConditions })
    // Combine processing for applications and tickets
    const processReport = (report) => {
      const result = {};
      report.forEach((item) => {
        const { serviceSlug, status, assignedDate, completedDate, turnAroundTime, userId } = item;
    
        if (!result[userId]) {
          result[userId] = {
            Request_Assigned: 0,
            Request_Completed: 0,
            totalCompletedTime: 0,
            totalTATDays: 0
          };
        }
    
        result[userId].Request_Assigned += 1;
    
        // Update status condition for both applications and tickets
        if ((report === applications && (status === '1' || status === '4')) ||
          (report === tickets && status === '3')) {
          result[userId].Request_Completed += 1;
    
          if (assignedDate && completedDate) {
            const minutesDiff = moment(completedDate).diff(moment(assignedDate), "minutes");
            result[userId].totalCompletedTime += minutesDiff;
    
            if (turnAroundTime) {
              result[userId].totalTATDays += turnAroundTime;
            }
          }
        }
      });
    
      return result;
    };
    

    const result = processReport(applications);
    const resultTicket = processReport(tickets);

    // Format data with total TAT days and add department name
    const formatData = (result, reportType) => {
      return Object.keys(result).map((userId, index) => {
        const data = result[userId];
        const user = userList.find(user => user.id == userId);

        return {
          userId,
          RequestAssigned: data.Request_Assigned,
          RequestCompleted: data.Request_Completed,
          TotalTATDays: Math.round(data.totalTATDays),
          completedDays: data.totalCompletedTime,
          userName: user ? user.name : `${index}`,
          departmentId: user?.departmentId,
          reportType // add reportType to distinguish application/ticket data
        };
      });
    };

    let formattedData = formatData(result, 'application');
    let formattedTicketData = formatData(resultTicket, 'ticket');

    // Apply searchQuery and departmentId filters on formattedData
    formattedData = formattedData.filter(item =>
      (!searchQuery || item.userName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!departmentId || item.departmentId == departmentId)
    );

    formattedTicketData = formattedTicketData.filter(item =>
      (!searchQuery || item.userName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!departmentId || item.departmentId == departmentId)
    );

    return { application: formattedData, ticket: formattedTicketData };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const getAllActiveApplicationList = async () => {
  try {
    const count = await applicationReportModel.count({
      where: {
        status: {
          [Op.notIn]: ['5', '6', '7'],
        }
      }
    });

    return { count };
  } catch (error) {
    throw new Error(error);
  }
};

const getTeamRequestTicketgraphdata = async (reqBody) => {
  try {
    const { departmentId, dateRangeOption, dateRange } = reqBody;
    const whereConditions = {};

    if (dateRangeOption) {
      const { startDate, endDate } = calculateDateRangeMonthwise(dateRangeOption);
      if (startDate && endDate) {
        whereConditions.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }
    if (!dateRangeOption && dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      endDate.setHours(23, 59, 59, 999);

      whereConditions.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    let userList = [];
    try {
      const [userData] = await Promise.all([
        axios.post(`${process.env.USERSERVICE}internalCommunicationUser/getAlluser`),
        // fetchUserData()
      ]);
      userList = userData?.data?.data?.rows;
      // userList = userData;
    } catch (error) {
      console.error(error);
    }

    const tickets = await ticketReportModel.findAll({ where: whereConditions });

    const processReport = (report) => {
      const result = {};
      report.forEach((item) => {
        const { status, assignedDate, completedDate, turnAroundTime, userId } = item;

        if (!result[userId]) {
          result[userId] = {
            Request_Assigned: 0,
            Request_Completed: 0,
            totalCompletedTime: 0,
            totalTATDays: 0,
          };
        }

        result[userId].Request_Assigned += 1;

        if (status === '3') {
          result[userId].Request_Completed += 1;

          if (assignedDate && completedDate) {
            const daysDiff = moment(completedDate).diff(moment(assignedDate), "days");
            result[userId].totalCompletedTime += daysDiff;

            if (turnAroundTime) {
              result[userId].totalTATDays += turnAroundTime;
            }
          }
        }
      });

      return result;
    };

    const resultTicket = processReport(tickets);

    const formatData = (result) => {
      return Object.keys(result).map((userId, index) => {
        const data = result[userId];
        const user = userList.find(user => user.id == userId);

        return {
          userId,
          RequestAssigned: data.Request_Assigned,
          // RequestCompleted: data.Request_Completed,
          // TotalTATDays: Math.round(data.totalTATDays),
          completedDays: data.totalCompletedTime,
          userName: user ? user.name : `${index}`,
          departmentId: user?.departmentId,
        };
      });
    };

    let formattedTicketData = formatData(resultTicket);

    formattedTicketData = formattedTicketData.filter(item => (!departmentId || item.departmentId == departmentId));

    return formattedTicketData
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const exportDepartmentPerformanceToExcel = async (reqBody) => {
  try {
    const { departmentId, dateRange, fileName } = reqBody;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const rows = await getDepartmentPerformance(reqBody);

    if (!rows || (rows.application.length === 0 && rows.ticket.length === 0)) {
      return { message: "No data found to export." };
    }   

    const processedData = manageData(rows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Department Performance Report");

    worksheet.addRow([processedData.application.label]);
    worksheet.addRow(processedData.application.headers);

    processedData.application.data.forEach((item) => {
      worksheet.addRow([
        item.departmentName,
        item.RequestAssigned,
        item.RequestCompleted,
        item.averageTime,
      ]);
    });

    worksheet.addRow([]);

    worksheet.addRow([processedData.ticket.label]);
    worksheet.addRow(processedData.ticket.headers);

    processedData.ticket.data.forEach((item) => {
      worksheet.addRow([
        item.departmentName,
        item.RequestAssigned,
        item.RequestCompleted,
        item.averageTime
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
    const filePath = process.env.EXPORT_DEPTREPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export department performance to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const manageData = (data) => {
  let result = {};

  result["sheet"] = "Department Performance";
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result[key] = {};

      switch (key) {
        case "application":
          result[key]["label"] = "Request Details";
          result[key]["headers"] = [
            "Department",
            "Request Assigned",
            "Request Completed",
            "Avg. Time",
          ];
          result[key]["data"] = [];

          data[key].forEach((department) => {
            result[key]["data"].push({
              departmentName: department.departmentName,
              RequestAssigned: department.RequestAssigned,
              RequestCompleted: department.RequestCompleted,
              averageTime: department.completedDays > 0
                ? calculateAverageTimePerRequest(department.RequestCompleted, department.completedDays)
                : "-",
            });

            result[key]["data"].push({
              departmentName: "Service",
              RequestAssigned: "Request Assigned",
              RequestCompleted: "Request Completed",
              averageTime: "Avg. Time",
            });

            department.services.forEach((service) => {
              result[key]["data"].push({
                departmentName: service.serviceName,
                RequestAssigned: service.RequestAssigned,
                RequestCompleted: service.RequestCompleted,
                averageTime: service.completedDays > 0
                  ? calculateAverageTimePerRequest(service.RequestCompleted, service.completedDays)
                  : "-",
              });
            });
          });
          break;
        case "ticket":
          result[key]["label"] = "Ticket Details";
          result[key]["headers"] = [
            "Department",
            "Tickets Assigned",
            "Closed",
            "Avg. Time"
          ];
          result[key]["data"] = [];

          data[key].forEach((department) => {
            result[key]["data"].push({
              departmentName: department.departmentName,
              RequestAssigned: department.RequestAssigned,
              RequestCompleted: department.RequestCompleted,
              averageTime: department.completedDays > 0
                ? calculateAverageTimePerRequest(department.RequestCompleted, department.completedDays)
                : "-",
            });

            result[key]["data"].push({
              departmentName: "Service",
              RequestAssigned: "Tickets assigned",
              RequestCompleted: "Closed",
              averageTime: "Avg. Time",
            });

            department.services.forEach((service) => {
              result[key]["data"].push({
                departmentName: service.serviceName,
                RequestAssigned: service.RequestAssigned,
                RequestCompleted: service.RequestCompleted,
                averageTime: service.completedDays > 0
                  ? calculateAverageTimePerRequest(service.RequestCompleted, service.completedDays)
                  : "-",
              });
            });
          });
          break;

        default:
          result[key] = {};
          break;
      }
    }
  }

  return result;
};

const generateDepartmentReportHTMLContent = (data) => {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; font-weight: bold; }
      .section-title { margin-top: 30px; font-weight: bold; }
    </style>
  `;

  let htmlContent = `
    <html>
    <head>
      ${styles}
    </head>
    <body>
      <h2>Department Performance Report</h2>
  `;

  if (data.application && data.application.length > 0) {
    htmlContent += `
      <div class="section-title">Request Details</div>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Request Assigned</th>
            <th>Request Completed</th>
            <th>Avg. Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.application.forEach((item) => {
      const avgTime = calculateAverageTimePerRequest(item?.RequestCompleted, item?.completedDays);
      htmlContent += `
       <tr>
            <td colspan="4" style="font-weight: bold;"></td>
          </tr>
        <tr>
          <td>${item.departmentName}</td>
          <td>${item.RequestAssigned}</td>
          <td>${item.RequestCompleted}</td>
          <td>${avgTime}</td>
        </tr>
      `;

      if (item.services && item.services.length > 0) {
        htmlContent += `
         
          <tr>
            <th>Service</th>
            <th>Request Assigned</th>
            <th>Request Completed</th>
            <th>Avg. Time</th>
          </tr>
        `;
        item.services.forEach((service) => {
          const serviceAvgTime = calculateAverageTimePerRequest(service?.RequestCompleted, service?.completedDays);
          htmlContent += `
            <tr>
              <td>${service.serviceName}</td>
              <td>${service.RequestAssigned}</td>
              <td>${service.RequestCompleted}</td>
              <td>${serviceAvgTime}</td>
            </tr>
          `;
        });
      }
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  }

  if (data.ticket && data.ticket.length > 0) {
    htmlContent += `
      <div class="section-title">Ticket Details</div>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Tickets Assigned</th>
            <th>Closed</th>
            <th>Avg. Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.ticket.forEach((item) => {
      const avgTime = calculateAverageTimePerRequest(item?.RequestCompleted, item?.completedDays);
      htmlContent += `
        <tr>
          <td colspan="4" style="font-weight: bold;"></td>
        </tr>
        <tr>
          <td>${item.departmentName}</td>
          <td>${item.RequestAssigned}</td>
          <td>${item.RequestCompleted}</td>
          <td>${avgTime}</td>
        </tr>
      `;

      if (item.services && item.services.length > 0) {
        htmlContent += `
          <tr>
            <th>Service</th>
            <th>Tickets Assigned</th>
            <th>Closed</th>
            <th>Avg. Time</th>
          </tr>
        `;
        item.services.forEach((service) => {
          const serviceAvgTime = calculateAverageTimePerRequest(service?.RequestCompleted, service?.completedDays);
          htmlContent += `
            <tr>
              <td>${service.serviceName}</td>
              <td>${service.RequestAssigned}</td>
              <td>${service.RequestCompleted}</td>
              <td>${serviceAvgTime}</td>
            </tr>
          `;
        });
      }
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  return htmlContent;
};

const exportDepartmentPerformanceToPDF = async (reqBody, req) => {
  try {
      const { departmentId, dateRange, fileName } = reqBody;

      let whereClause = {};

      if (dateRange && dateRange.startDate && dateRange.endDate) {
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          whereClause.createdDate = {
              [Op.between]: [startDate, endDate],
          };
      }

      if (departmentId) {
          whereClause.departmentId = departmentId;
      }

      const rows = await getDepartmentPerformance(reqBody);

      if (!rows || (rows.application.length === 0 && rows.ticket.length === 0)) {
        return { message: "No data found to export." };
      }   

      const htmlContent = generateDepartmentReportHTMLContent(rows);

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", '--disable-setuid-sandbox'],
          timeout: 60000,
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      const insertPath = path.join(setting.PROJECT_DIR, "public");

      if (!fs.existsSync(insertPath)) {
          fs.mkdirSync(insertPath, { recursive: true });
      }

      const filePathInsert = path.join(insertPath, fileName);
      const filePath = process.env.DEPTREPORT_PDF + fileName;

      fs.writeFileSync(filePathInsert, pdfBuffer);

      return filePath;
  } catch (error) {
      console.error("Failed to export transaction report to PDF:", error);
      throw new Error("Export to PDF failed");
  }
};

const manageTeamData = (data) => {
  let result = {};

  result["sheet"] = "Team Performance";
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result[key] = {};

      switch (key) {
        case "application":
          result[key]["label"] = "Request Details";
          result[key]["headers"] = [
            "Users",
            "Request Assigned",
            "Request Completed",
            "Avg. Time",
          ];
          result[key]["data"] = data[key];
          break;
        case "ticket":
          result[key]["label"] = "Ticket Details";
          result[key]["headers"] = [
            "Users",
            "Tickets Assigned",
            "Closed",
            "Avg. Time",
          ];
          result[key]["data"] = data[key];
          break;

        default:
          result[key] = {};
          break;
      }
    }
  }
  return result;
};

const calculateAverageTimePerRequest = (
  RequestCompleted,
  completedHours
) => {
  const totalMinutes = parseInt(completedHours, 10);

  // Check if RequestCompleted is not zero to avoid division by zero
  if (RequestCompleted > 0) {
    const averageTimeInMinutes = totalMinutes / RequestCompleted;

    // Calculate days, hours, and minutes from the total minutes
    const days = Math.floor(averageTimeInMinutes / (60 * 24)); // 1 day = 24 hours
    const hours = Math.floor((averageTimeInMinutes % (60 * 24)) / 60); // remaining hours
    const minutes = Math.floor(averageTimeInMinutes % 60); // remaining minutes

    // Build the result string based on the calculated values
    let result = "";

    // Show only days if more than 24 hours
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""}`;
    } else {
      // Show hours and minutes when it's less than 24 hours
      if (hours > 0) {
        result += `${hours} hour${hours > 1 ? "s" : ""} `;
      }
      if (minutes > 0) {
        result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
      }
    }

    if (result.trim() === "") {
      return "_"; // Return '_' if no time was calculated
    }

    return result.trim(); // Remove any trailing spaces
  }

  return "_"; // Return '_' if no requests were completed
};

const exportTeamPerformanceToExcel = async (reqBody) => {
  try {
    const { departmentId, dateRange, fileName } = reqBody;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const rows = await getTeamPerformance(reqBody);

    if (!rows || (rows.application.length === 0 && rows.ticket.length === 0)) {
      return { message: "No data found to export." };
    }   

    const processedData = manageTeamData(rows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Team Performance Report");

    worksheet.addRow([processedData.application.label]);
    worksheet.addRow(processedData.application.headers);

    processedData.application.data.forEach((item) => {
      worksheet.addRow([
        item.userName,
        item.RequestAssigned,
        item.RequestCompleted,
        calculateAverageTimePerRequest(item?.RequestCompleted,item?.completedDays)
      ]);
    });

    worksheet.addRow([]);

    worksheet.addRow([processedData.ticket.label]);
    worksheet.addRow(processedData.ticket.headers);

    processedData.ticket.data.forEach((item) => {
      worksheet.addRow([
        item.userName,
        item.RequestAssigned,
        item.RequestCompleted,
        calculateAverageTimePerRequest(item?.RequestCompleted,item?.completedDays)
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
    const filePath = process.env.EXPORT_TEAMPERFREPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export department performance to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const generateTeamPerformanceHTMLContent = (data) => {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; }
      .section-title { margin-top: 30px; font-weight: bold; }
    </style>
  `;

  let htmlContent = `
    <html>
    <head>
      ${styles}
    </head>
    <body>
      <h2>Team Performance Report</h2>
  `;

  if (data.application && data.application.length > 0) {
    htmlContent += `
      <div class="section-title">Request Details</div>
      <table>
        <thead>
          <tr>
            <th>Users</th>
            <th>Request Assigned</th>
            <th>Request Completed</th>
            <th>Avg. Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.application.forEach((item) => {
      const avgTime = calculateAverageTimePerRequest(item?.RequestCompleted,item?.completedDays);
      htmlContent += `
        <tr>
          <td>${item.userName}</td>
          <td>${item.RequestAssigned}</td>
          <td>${item.RequestCompleted}</td>
          <td>${avgTime}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  }

  if (data.ticket && data.ticket.length > 0) {
    htmlContent += `
      <div class="section-title">Ticket Details</div>
      <table>
        <thead>
          <tr>
            <th>Users</th>
            <th>Tickets Assigned</th>
            <th>Closed</th>
            <th>Avg. Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.ticket.forEach((item) => {
      const avgTime = calculateAverageTimePerRequest(item?.RequestCompleted,item?.completedDays);
      htmlContent += `
        <tr>
          <td>${item.userName}</td>
          <td>${item.RequestAssigned}</td>
          <td>${item.RequestCompleted}</td>
          <td>${avgTime}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  return htmlContent;
};

const exportTeamPerformanceToPDF = async (reqBody, req) => {
  try {
      const { departmentId, dateRange, fileName } = reqBody;

      let whereClause = {};

      if (dateRange && dateRange.startDate && dateRange.endDate) {
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          whereClause.createdDate = {
              [Op.between]: [startDate, endDate],
          };
      }

      if (departmentId) {
          whereClause.departmentId = departmentId;
      }

      const rows = await getTeamPerformance(reqBody);

      if (!rows || (rows.application.length === 0 && rows.ticket.length === 0)) {
        return { message: "No data found to export." };
      }      

      const htmlContent = generateTeamPerformanceHTMLContent(rows);

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", '--disable-setuid-sandbox'],
          timeout: 60000,
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      const insertPath = path.join(setting.PROJECT_DIR, "public");

      if (!fs.existsSync(insertPath)) {
          fs.mkdirSync(insertPath, { recursive: true });
      }

      const filePathInsert = path.join(insertPath, fileName);
      const filePath = process.env.TEAMPERFREPORT_PDF + fileName;

      fs.writeFileSync(filePathInsert, pdfBuffer);

      return filePath;
  } catch (error) {
      console.error("Failed to export transaction report to PDF:", error);
      throw new Error("Export to PDF failed");
  }
};

const manageDataForAgentPerformance = (data, serviceName, departmentName) => {
  let result = {};

  result["sheet"] = "Agent Performance Report";
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result[key] = {};

      switch (key) {
        case "application":
          result[key]["label"] = "Agent Performance Report";
          result[key]["headers"] = [
            "Agent",
            "Email",
            "Service",
            "Department",
            "Request Assigned",
            "Request Completed",
            "Avg. Time",
          ];
          result[key]["data"] = [];

          data[key].forEach((agentPerf) => {
            result[key]["data"].push({
              Agent: agentPerf?.userInfo?.userName,
              Email: agentPerf?.userInfo?.userEmail,
              Service: serviceName,
              Department: departmentName,
              RequestAssigned: agentPerf.RequestAssigned,
              RequestCompleted: agentPerf.RequestCompleted,
              averageTime: agentPerf.completedHours > 0
                ? calculateAverageTimePerRequest(agentPerf.RequestCompleted, agentPerf.completedHours)
                : "-",
            });
          });
          break;
        default:
          result[key] = {};
          break;
      }
    }
  }

  return result;
};

const exportAgentPerformanceToExcel = async (reqBody) => {
  try {
    const { serviceSlug, dateRange, fileName, serviceName, departmentName } = reqBody;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (serviceSlug) {
      whereClause.serviceSlug = serviceSlug;
    }

    const rows = await getServicePerformanceUser(reqBody);

    if (!rows || (rows.rows.length === 0)) {
      return { message: "No data found to export." };
    }

    const processedData = manageDataForAgentPerformance({ application: rows?.rows, serviceName, departmentName });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Agent Performance Report");

    worksheet.addRow([processedData.application.label]);
    worksheet.addRow(processedData.application.headers);

    processedData.application.data.forEach((item) => {
      worksheet.addRow([
        item.Agent,
        item.Email,
        serviceName,
        departmentName,
        item.RequestAssigned,
        item.RequestCompleted,
        item.averageTime,
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
    const filePath = process.env.EXPORT_AGENTREPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export department performance to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const generateAgentReportHTMLContent = (data) => {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; font-weight: bold; }
      .section-title { margin-top: 30px; font-weight: bold; }
    </style>
  `;

  let htmlContent = `
    <html>
    <head>
      ${styles}
    </head>
    <body>
      <h2>Agent Performance Report</h2>
  `;

  if (data.application && data.application.length > 0) {
    htmlContent += `
      <div class="section-title">Request Details</div>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Email</th>
            <th>Service</th>
            <th>Department</th>
            <th>Request Assigned</th>
            <th>Request Completed</th>
            <th>Avg. Time</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.application.forEach((item) => {
      const avgTime = calculateAverageTimePerRequest(item?.RequestCompleted, item?.completedHours);
      htmlContent += `
        <tr>
          <td>${item.userInfo?.userName}</td>
          <td>${item.userInfo?.userEmail}</td>
          <td>${data.serviceName}</td>
          <td>${data.departmentName}</td>
          <td>${item.RequestAssigned}</td>
          <td>${item.RequestCompleted}</td>
          <td>${avgTime}</td>
        </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  }

  htmlContent += `
    </body>
    </html>
  `;

  return htmlContent;
};

const exportAgentPerformanceToPDF = async (reqBody, req) => {
  try {
      const { serviceSlug, dateRange, fileName, serviceName, departmentName } = reqBody;

      let whereClause = {};

      if (dateRange && dateRange.startDate && dateRange.endDate) {
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          whereClause.createdDate = {
              [Op.between]: [startDate, endDate],
          };
      }

      if (serviceSlug) {
          whereClause.serviceSlug = serviceSlug;
      }

      const rows = await getServicePerformanceUser(reqBody);

      if (!rows || (rows.rows.length === 0)) {
        return { message: "No data found to export." };
      }   

      const htmlContent = generateAgentReportHTMLContent({application: rows?.rows, serviceName, departmentName});

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", '--disable-setuid-sandbox'],
          timeout: 60000,
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      const insertPath = path.join(setting.PROJECT_DIR, "public");

      if (!fs.existsSync(insertPath)) {
          fs.mkdirSync(insertPath, { recursive: true });
      }

      const filePathInsert = path.join(insertPath, fileName);
      const filePath = process.env.AGENTREPORT_PDF + fileName;

      fs.writeFileSync(filePathInsert, pdfBuffer);

      return filePath;
  } catch (error) {
      console.error("Failed to export transaction report to PDF:", error);
      throw new Error("Export to PDF failed");
  }
};

const exportAgentTicketPerformanceToExcel = async (reqBody) => {
  try {
    const { serviceSlug, dateRange, fileName, serviceName, departmentName } = reqBody;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (serviceSlug) {
      whereClause.serviceSlug = serviceSlug;
    }

    const rows = await getServiceTicketPerformanceUser(reqBody);

    if (!rows || (rows.rows.length === 0)) {
      return { message: "No data found to export." };
    }

    const processedData = manageDataForAgentPerformance({ application: rows?.rows, serviceName, departmentName });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Agent Performance Report");

    worksheet.addRow([processedData.application.label]);
    worksheet.addRow(processedData.application.headers);

    processedData.application.data.forEach((item) => {
      worksheet.addRow([
        item.Agent,
        item.Email,
        serviceName,
        departmentName,
        item.RequestAssigned,
        item.RequestCompleted,
        item.averageTime,
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
    const filePath = process.env.EXPORT_AGENTTICKETREPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export department performance to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const exportAgentTicketPerformanceToPDF = async (reqBody, req) => {
  try {
      const { serviceSlug, dateRange, fileName, serviceName, departmentName } = reqBody;

      let whereClause = {};

      if (dateRange && dateRange.startDate && dateRange.endDate) {
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          whereClause.createdDate = {
              [Op.between]: [startDate, endDate],
          };
      }

      if (serviceSlug) {
          whereClause.serviceSlug = serviceSlug;
      }

      const rows = await getServiceTicketPerformanceUser(reqBody);

      if (!rows || (rows.rows.length === 0)) {
        return { message: "No data found to export." };
      }   

      const htmlContent = generateAgentReportHTMLContent({application: rows?.rows, serviceName, departmentName});

      const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", '--disable-setuid-sandbox'],
          timeout: 60000,
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      const insertPath = path.join(setting.PROJECT_DIR, "public");

      if (!fs.existsSync(insertPath)) {
          fs.mkdirSync(insertPath, { recursive: true });
      }

      const filePathInsert = path.join(insertPath, fileName);
      const filePath = process.env.AGENTTICKETREPORT_PDF + fileName;

      fs.writeFileSync(filePathInsert, pdfBuffer);

      return filePath;
  } catch (error) {
      console.error("Failed to export transaction report to PDF:", error);
      throw new Error("Export to PDF failed");
  }
};

module.exports = {
  getDepartmentPerformance,
  getServicePerformanceUser,
  getServiceTicketPerformanceUser,
  getTeamPerformance,
  getAllActiveApplicationList,
  getTeamRequestTicketgraphdata,
  exportDepartmentPerformanceToExcel,
  exportDepartmentPerformanceToPDF,
  exportTeamPerformanceToExcel,
  exportTeamPerformanceToPDF,
  exportAgentPerformanceToExcel,
  exportAgentPerformanceToPDF,
  exportAgentTicketPerformanceToExcel,
  exportAgentTicketPerformanceToPDF
};
