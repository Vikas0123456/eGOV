const { Op, fn, col, literal } = require("sequelize");
const {
  createApplicationService,
  getRequiredDocumentServices,
  createApplicationLogService,
  getApplicationListServices,
  sendNotificationServices,
  assignedUserUpdate,
  genratePdfServices,
  updateStatusService,
  getlogListServices,
  getReqDocUploadedFileService,
  createRequestDocumentService,
  bookAppoitmentRequestService,
  bookingCancelService,
  getBookingConfirmationService,
  updateRequiredDocumentService,
  geGeneralSettingListServices,
  getDataForCombineList,
  getOptionsData,
  getDataforRevenueReportStatus,
  addRatingService,
  TicketCountStatusWise,
  getRatingsList,
  getApplicationByApplicationId,
  getAdminApplicationListServices,
  sendBookAndMeetDataService,
  appoitmentDetailsService,
  revenueApplicationStatusService,
  updateRenewApplicationService,
  deleteApplicationByApplicationId,
  updateTransactionStatusService,
  updateRenewFailedApplicationService,
} = require("../services/application.service");
const { generatePDF } = require("../utils/generatepdf");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fetchDataFromTables = require("../config/getAllServiceList");
const { default: axios } = require("axios");
const moment = require("moment");
const { Sequelize } = require("../config/db.connection");
const setting = require("../../setting");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const {
  createSequelizeInstance,
  allModelAndAssociate,
} = require("../config/config");
const stripe = require("stripe")(
  "sk_test_51P96mOSJzlKiyJL0HbZ80dUDsEQXAG7UNEtE1fonYxFRZIkRsgfkv9dUttAhunw2YYkRkT66NhCRlEPhE0MGd5r500X6JWOa4P"
);
const os = require("os");

const getLocalIPv4Address = () => {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    const iface = interfaces[ifaceName];
    for (const { address, family, internal } of iface) {
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
  return null;
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

const getAssociatedModels = async (slug) => {
  try {
    // Fetch service data using slug
    const getService = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/getById`,
      {
        data: {
          slug,
        },
      }
    );

    if (!getService?.data?.data) {
      throw new Error("Invalid service slug");
    }

    // Create a Sequelize instance for the service database
    const sequelizeInstance = await createSequelizeInstance(
      getService.data.data.databaseName
    );

    // Get all models and their associations
    const req = {
      sequelize: sequelizeInstance,
      service: getService.data.data,
    };
    await allModelAndAssociate(req);

    // Return the associated models and other details
    return {
      sequelize: sequelizeInstance,
      service: req.service,
      models: req.models, // Assuming `allModelAndAssociate` populates `req.models`
    };
  } catch (error) {
    console.error("Error in getAssociatedModels:", error.message);
    throw error; // Let the controller handle the error
  }
};

function calculateRemainingTimeTAT(targetDate) {
  if (targetDate) {
    const currentDate = new Date();
    const timeDifference = new Date(targetDate) - currentDate;
    if (timeDifference <= 0) {
      return "Completed";
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    let remainingTime = "";
    if (days > 1) {
      remainingTime += days + " days ";
    } else if (days === 1) {
      remainingTime += "1 day ";
    }

    if (days < 1) {
      remainingTime += hours + ":";
    }

    if (days < 1 || (days === 1 && hours > 0)) {
      remainingTime += minutes + ":";
    }

    if (days < 1) {
      remainingTime += seconds;
    }

    return remainingTime;
  } else {
    return "";
  }
}

function combineData(data) {
  const combineResult = [];
  Object.keys(data).forEach((key) => {
    combineResult.push(...data[key]);
  });
  return combineResult;
}

const calculateDateRange = (option) => {
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
const findApplicationForDocUpdate = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, documentSlug } = reqBody;
    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );
    const baseApplicationId = applicationId?.split("-")[0]; // Extract the base (e.g., 'nbl22' from 'nbl22-1')
    const whereCondition = {
      applicationId: {
        [Op.regexp]: `^${baseApplicationId}(-\\d+)?$`,
      },
    };

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        raw: true,
        attributes: [
          "id",
          "applicationId",
          "applicationData",
          "serviceData",
          "status",
          "createdDate",
          "updateDate",
        ],
      }
    );

    const combinedData = combineData(data);
    const matchedData = combinedData?.filter((data) => {
      const parseData = JSON.parse(data?.applicationData);
      const documents = parseData?.requiredDocumentList?.data;
      // Check if any document in the list matches the specified documentName
      return documents?.some((doc) => doc?.slug == documentSlug);
    });

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: matchedData },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const dynamicCustomerServiceList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      page = 1,
      perPage,
      customerId = "",
      searchFilter,
      departmentId,
      serviceSlug,
      status,
      dateRange,
      trackApplication = false,
    } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];
    if (departmentId) {
      if (!Array.isArray(departmentId)) {
        departmentId = [departmentId];
      }
      let departmentIdNumbers = departmentId.map(Number);
      serviceAllList = serviceAllList.filter((service) => 
        departmentIdNumbers.includes(service?.departmentId)
      );
    }

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    if (serviceSlug) {
      serviceListArrayWithSlug = [serviceSlug];
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    if (customerId) whereCondition.customerId = customerId;
    if (status) whereCondition.status = status;
    if (searchFilter)
      whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Fetch total count of matching records
    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "count",
      {
        where: whereCondition,
      }
    );

    const total = Object.values(totalRecords).reduce(
      (acc, value) => acc + value,
      0
    );

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        raw: true,
        attributes: trackApplication
          ? [
              "id",
              "applicationId",
              "serviceData",
              "status",
              "createdDate",
              "updateDate",
            ]
          : undefined,
      }
    );

    const combinedData = combineData(data);

    const sortedData = combinedData
      .filter((item) => item.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const offset = (page - 1) * perPage;
    let paginatedData;
    if (perPage) {
      paginatedData = sortedData.slice(offset, offset + perPage);
    } else {
      paginatedData = sortedData;
    }

    const [customerResponse, documentResponse, getAlluserList] =
      await Promise.all([
        axios.post(`${process.env.USERMICROSERVICE}/customer/customerList`, {
          data: {},
        }),
        axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
          data: {},
        }),
        axios.post(`${process.env.USERMICROSERVICE}/user/getAlluser`, {
          data: {},
        }),
      ]);

    const customerLists = customerResponse?.data?.data?.rows || [];
    const documentList = documentResponse?.data?.data?.rows || [];
    const getAdminuserList = getAlluserList?.data?.data?.rows || [];
    let enhancedData;
    if (trackApplication) {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );

          return {
            ...application,
            serviceName: {
              id: serviceInfo?.id,
              serviceName: serviceInfo?.serviceName,
              slug: serviceInfo?.slug,
              departmentName: serviceInfo?.departmentName,
              version: serviceInfo?.currentVersion,
            },
          };
        })
        .filter(Boolean);
    } else {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const customerData = customerLists.find(
            (customer) => customer && customer.id == application.customerId
          );
          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );
          const assignUserInfo =
            application?.userId &&
            getAdminuserList.find((user) => user?.id == application?.userId);
          const signatureData = application?.signatureImageId
            ? documentList.find(
                (doc) => doc && doc.id === application.signatureImageId
              )
            : null;
          const imageData = customerData?.nibImageId
            ? documentList.find(
                (doc) => doc && doc.id == customerData.nibImageId
              )
            : null;
          
          return {
            ...application,
            serviceName: serviceInfo,
            signatureImage: signatureData
              ? {
                  id: signatureData.id,
                  documentPath: signatureData.documentPath,
                }
              : {},
            customerInfo: customerData
              ? {
                  id: customerData.id,
                  firstName: customerData.firstName,
                  middleName: customerData.middleName,
                  lastName: customerData.lastName,
                  nibNumber: customerData.nibNumber,
                  email: customerData.email,
                  imageData: imageData
                    ? {
                        id: imageData.id,
                        customerId: imageData.customerId,
                        documentName: imageData.documentName,
                        documentPath: imageData.documentPath,
                        documentType: imageData.documentType,
                      }
                    : null,
                }
              : null,
            assignUserInfo: assignUserInfo
              ? {
                  id: assignUserInfo?.id,
                  name: assignUserInfo?.name,
                  email: assignUserInfo?.email,
                  phone: assignUserInfo?.phone,
                }
              : null,
          };
        })
        .filter(Boolean);
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: enhancedData, count: total },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const dynamicTrackCountServiceList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    if (customerId) {
      whereCondition.customerId = customerId;
    }
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: { customerId: customerId },
        raw: true,
        attributes: [
          "id",
          "applicationId",
          "serviceData",
          "status",
          "createdDate",
          "updateDate",
        ],
      }
    );

    function combineData(data) {
      const combineResult = [];
      Object.keys(data).forEach((key) => {
        combineResult.push(...data[key]);
      });
      return combineResult;
    }

    const combinedData = combineData(data);

    function countApplications(combinedData) {
      let newApply = 0;
      let inProgress = 0;
      let approved = 0;
      let failed = 0;

      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

      combinedData.forEach((application) => {
        const applicationDate = new Date(application.createdDate)
          .toISOString()
          .split("T")[0];

        // Check if the application is new (created today)
        if (applicationDate === today) {
          newApply += 1;
        }

        // Check for application statuses
        if (application.status === "3") {
          inProgress += 1;
        } else if (application.status === "4") {
          approved += 1;
        } else if (application.status === "6") {
          failed += 1;
        }
      });

      return {
        newApply,
        inProgress,
        approved,
        failed,
      };
    }

    const applicationStatusCounts = countApplications(combinedData);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: applicationStatusCounts },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getApplication = async (req, res) => {
  try {
    const { applicationId } = req.body.data;
    const result = await getApplicationByApplicationId(applicationId, req);
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const dynamicAdminServiceList = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const {
      page = 1,
      perPage,
      searchFilter,
      departmentId,
      serviceSlug,
      status,
      dateRange,
      trackApplication = false,
    } = reqBody;
    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];
    if (departmentId) {
      serviceAllList = serviceAllList.filter(
        (service) => service?.departmentId == departmentId
      );
    }

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    if (serviceSlug) {
      serviceListArrayWithSlug = serviceSlug;
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    if (status) whereCondition.status = status;
    if (searchFilter)
      whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Fetch total count of matching records
    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "count",
      {
        where: whereCondition,
      }
    );

    const total = Object.values(totalRecords).reduce(
      (acc, value) => acc + value,
      0
    );

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        raw: true,
      }
    );

    const combinedData = combineData(data);

    const sortedData = combinedData
      .filter((item) => item.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const offset = (page - 1) * perPage;
    let paginatedData;
    if (perPage) {
      paginatedData = sortedData.slice(offset, offset + perPage);
    } else {
      paginatedData = sortedData;
    }

    const [customerResponse, documentResponse, getAlluserList] =
      await Promise.all([
        axios.post(`${process.env.USERMICROSERVICE}/customer/customerList`, {
          data: {},
        }),
        axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
          data: {},
        }),
        axios.post(`${process.env.USERMICROSERVICE}/user/getAlluser`, {
          data: {},
        }),
      ]);

    const customerLists = customerResponse?.data?.data?.rows || [];
    const documentList = documentResponse?.data?.data?.rows || [];
    const getAdminuserList = getAlluserList?.data?.data?.rows || [];

    let enhancedData = paginatedData
      ?.map((application) => {
        if (!application) return null;

        const customerData = customerLists.find(
          (customer) => customer && customer.id == application.customerId
        );
        const serviceInfo = serviceAllList.find(
          (service) => service?.slug == application?.serviceData?.slug
        );
        const assignUserList = serviceInfo
          ? getAdminuserList.filter((adminUser) => {
            if (!adminUser || !adminUser.departmentId || adminUser.isSupportTeam === '1') return false;
          
            const departmentIds = adminUser.departmentId.includes(',')
              ? adminUser.departmentId.split(',').map((id) => id.trim())
              : [adminUser.departmentId.trim()];
          
            return departmentIds.includes(String(serviceInfo?.departmentId));
          })
          : [];
        const signatureData = application?.signatureImageId
          ? documentList.find(
              (doc) => doc && doc.id === application.signatureImageId
            )
          : null;
        const imageData = customerData?.nibImageId
          ? documentList.find((doc) => doc && doc.id == customerData.nibImageId)
          : null;

        return {
          ...application,
          serviceName: serviceInfo,
          signatureImage: signatureData
            ? {
                id: signatureData.id,
                documentPath: signatureData.documentPath,
              }
            : {},
          customerInfo: customerData
            ? {
                id: customerData.id,
                firstName: customerData.firstName,
                middleName: customerData.middleName,
                lastName: customerData.lastName,
                nibNumber: customerData.nibNumber,
                email: customerData.email,
                imageData: imageData
                  ? {
                      id: imageData.id,
                      customerId: imageData.customerId,
                      documentName: imageData.documentName,
                      documentPath: imageData.documentPath,
                      documentType: imageData.documentType,
                    }
                  : null,
              }
            : null,
          assignUserList: assignUserList,
        };
      })
      .filter(Boolean);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: enhancedData, count: total },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
// const dynamicAdminServiceList = async (req, res) => {
//   try {
//     const reqBody = req.body.data;
//     const {
//       page = 1, // Default value assignment
//       perPage,
//       customerId = "",
//       applicationId,
//       searchFilter,
//       departmentId,
//       serviceSlug,
//       status,
//       userId,
//       dateRange,
//       duration,
//     } = reqBody;

//     // Call the service without reassigning the parameters
//     let applicationList = await getAdminApplicationListServices(
//       page, // No reassignment here
//       perPage,
//       customerId,
//       applicationId,
//       searchFilter,
//       departmentId,
//       serviceSlug,
//       status,
//       userId,
//       dateRange,
//       duration,
//       req
//     );

//     if (applicationList) {
//       return res.status(STATUS_CODES.SUCCESS).json({
//         message: MESSAGES.APPLICATION.FETCH_SUCCESS,
//         success: true,
//         data: applicationList,
//       });
//     }
//   } catch (error) {
//     return res.status(STATUS_CODES.SERVER_ERROR).json({
//       message: MESSAGES.SERVER_ERROR,
//       success: false,
//       data: {},
//     });
//   }
// };

const dynamicLogdata = async (req, res) => {
  try {
    // Access the models attached by the middleware
    const { applicationModel, generalSettingModel, applicationLogModel } = req;
    const { applicationId, searchFilter, dateRange, duration, Order } =
      req.body?.data;

    if (!applicationModel || !generalSettingModel || !applicationLogModel) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
    let whereCondition = {
      applicationId: applicationId,
    };

    // Handle search filter
    if (searchFilter) {
      whereCondition.description = { [Op.like]: `%${searchFilter}%` };
    }

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      // Adjust endDate to include the entire day
      endDate.setHours(23, 59, 59, 999);

      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const now = new Date(); // Gets the current date and time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Resets hours, minutes, seconds, and milliseconds to 0

    switch (duration) {
      case "today":
        whereCondition.createdDate = {
          [Op.gte]: today,
        };
        break;
      case "weekly":
        let oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        whereCondition.createdDate = {
          [Op.gte]: oneWeekAgo,
        };
        break;
      case "monthly":
        let oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        whereCondition.createdDate = {
          [Op.gte]: oneMonthAgo,
        };
        break;
      default:
        break;
    }

    const applicationLog = await applicationLogModel.findAndCountAll({
      where: whereCondition,
      order: [["createdDate", "DESC"]], // Example order
    });
    if (applicationLog) {
      let customerResponse;
      let documentResponse;
      let getAlluserList;
      let serviceList;

      try {
        customerResponse = await axios.post(
          `${process.env.USERMICROSERVICE}/customer/customerList`,
          { data: {} }
        );
      } catch (error) {
        console.log(error);
      }

      try {
        documentResponse = await axios.post(
          `${process.env.DOCUMENT_URL}document/list/upload`,
          { data: {} }
        );
      } catch (error) {
        console.log(error);
      }

      try {
        getAlluserList = await axios.post(
          `${process.env.USERMICROSERVICE}/user/getAlluser`,
          { data: {} }
        );
      } catch (error) {
        console.log(error);
      }

      try {
        serviceList = await axios.post(
          `${process.env.SERVICEMANAGEMENT}/service/list`,
         { data: {} }
        );
      } catch (error) {
        console.log(error);
      }
      const customerLists = customerResponse?.data?.data?.rows;
      const documentList = documentResponse?.data?.data?.rows;
      const getAdminuserList = getAlluserList?.data?.data?.rows;
      const getServiceList = serviceList?.data?.data?.rows;

      const parsedApplicationsLog = applicationLog.rows.map((application) => {
        const findcustomerData = customerLists.find(
          (data) => data.id === application?.customerId
        );
        const findUserData = getAdminuserList.find(
          (data) => data.id === application?.userId
        );
        let customerInfo;
        if (findcustomerData) {
          customerInfo = documentList.find(
            (doc) => doc.id === findcustomerData?.nibImageId
          );
        }

        let userInfo;
        if (findUserData) {
          userInfo = documentList.find(
            (doc) => doc.id === findUserData?.profileImageId
          );
        }

        let departmentInfo;
        if(findUserData?.isCoreTeam =="0"){
          departmentInfo= getServiceList?.find((service) => service.departmentId == findUserData?.departmentId)
        }
         
        let department;
        if(departmentInfo){
          department = documentList.find(
            (doc) => doc.id == departmentInfo?.departmentLogo
          );
        }

        let docInfo;
        if (application?.documentId) {
          docInfo = documentList.find(
            (doc) => doc.id === application?.documentId
          );
        }
        return {
          ...application.toJSON(),
          customerInfo: {
            id: findcustomerData?.id,
            firstName: findcustomerData?.firstName,
            middleName: findcustomerData?.middleName,
            lastName: findcustomerData?.lastName,
            documentId: customerInfo?.id,
            documentName: customerInfo?.documentName,
            documentPath: customerInfo?.documentPath,
            fileSize: customerInfo?.fileSize,
          },
          userInfo: {
            id: findUserData?.id,
            name: findUserData?.name,
            isCoreTeam:findUserData?.isCoreTeam,
            documentId: userInfo?.id,
            documentName: userInfo?.documentName,
            documentPath: userInfo?.documentPath,
            fileSize: userInfo?.fileSize,
          },
          department:{logo:department?.documentPath,departmentName:departmentInfo?.departmentName},
          attachedDoc: {
            id: docInfo?.id,
            documentName: docInfo?.documentName,
            documentType: docInfo?.documentType,
            documentPath: docInfo?.documentPath,
            fileSize: docInfo?.fileSize,
          },
        };
      });
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.LOG_FETCH_SUCCESS,
        success: true,
        data: {
          count: applicationLog.count,
          rows: parsedApplicationsLog,
        },
      });
    }
    // Return the fetched data
  } catch (error) {
    console.error(
      "Error in dynamicLogdatadynamicLogdatadynamicLogdata:",
      error
    );
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const createApplication = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const {
      applicationData,
      customerId,
      associatedCustomerId,
      customerEmail,
      applicationId,
      uploadedDocuments,
      applicantName,
      signatureImageId,
      status,
      transactionId,
      transactionStatus,
      flag,
      slugApplicationId,
      serviceData,
      applicationStep,
      slug,
      paymentToken,
    } = reqBody;

    const stringifiedApplicationData = JSON.stringify(applicationData);

    let newApplication = await createApplicationService(
      {
        customerId,
        associatedCustomerId,
        customerEmail,
        applicationData: stringifiedApplicationData,
        applicantName,
        signatureImageId,
        status,
        transactionId,
        transactionStatus,
        serviceData,
        uploadedDocuments,
        applicationStep,
        paymentToken,
      },
      applicationId,
      flag,
      slugApplicationId,
      slug,
      req
    );

    if (newApplication) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.ADDED_SUCCESS,
        success: true,
        data: newApplication,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const createApplicationLog = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId } = reqBody;

    if (!applicationId) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.APPLICATION.APPLICATION_ID_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    let newLog = await createApplicationLogService(reqBody, req);

    if (newLog) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.ADDED_LOG_SUCCESS,
        success: true,
        data: newLog,
      });
    }
    // } else {
    //   return res.status(500).json({
    //     message: MESSAGES.SERVER_ERROR,
    //     success: false,
    //     data: {},
    //   });
    // }
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: { error },
      success: false,
      data: {},
    });
  }
};
const getRequiredDocuments = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId } = reqBody;
    if (!applicationId) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.APPLICATION.APPLICATION_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    let ReqDoc = await getRequiredDocumentServices(applicationId);
    if (ReqDoc) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DOCUMENT_FETCH_SUCCESS,
        success: true,
        data: ReqDoc,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getApplicationList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, slug } = reqBody;
    let applicationList = await getApplicationListServices(
      applicationId,
      slug,
      req
    );
    if (applicationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DOCUMENT_FETCH_SUCCESS,
        success: true,
        data: applicationList,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const genratePDFAplication = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      applicationId,
      userId,
      serviceData,
      departmentData,
      slug,
      fromAdmin,
    } = reqBody;

    const applicationUpdate = await genratePdfServices(
      fromAdmin,
      applicationId,
      userId,
      serviceData,
      departmentData,
      slug,
      req
    );

    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
      error: error.message,
    });
  }
};

const sendNotification = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, userId, pdfUrl, serviceData } = reqBody;

    const result = await sendNotificationServices(
      applicationId,
      userId,
      pdfUrl,
      serviceData,
      req
    );

    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: result || {},
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
      error: error.message,
    });
  }
};

const updateAssignedUser = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      applicationId,
      userId,
      assignedUserId,
      applicationIdSlug,
      departmentNameData,
      customerId,
      customerEmail,
      userEmail,
      slug,
      serviceData,
    } = reqBody;

    let applicationUpdate = await assignedUserUpdate(
      applicationId,
      userId,
      assignedUserId,
      applicationIdSlug,
      departmentNameData,
      customerId,
      customerEmail,
      userEmail,
      slug,
      serviceData,
      req
    );
    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const updateStatusApplication = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      applicationId,
      status,
      documentId,
      description,
      customerEmail,
      userId,
      serviceData,
    } = reqBody;

    let applicationUpdate = await updateStatusService(
      applicationId,
      status,
      documentId,
      description,
      userId,
      customerEmail,
      serviceData,
      req
    );
    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const updateTransactionStatus = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      applicationId,
      transactionStatus,
      paymentToken,
      description,
      transactionId,
      userId,
      serviceData,
    } = reqBody;

    let applicationUpdate = await updateTransactionStatusService(
      applicationId,
      transactionStatus,
      paymentToken,
      description,
      transactionId,
      userId,
      serviceData,
      req
    );
    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const autoRenewUpdate = async (req, res) => {
  try {
    const reqBody = req.body?.data || {};
    const {
      applicationId,
      autoRenew,
      paymentDetailUpdate = false,
      paymentDetails,
    } = reqBody;

    if (!applicationId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.APPLICATION.APPLICATION_ID_NOT_FOUND,
        success: false,
      });
    }

    let updateCount = 0;

    if (!paymentDetailUpdate) {
      [updateCount] = await req.applicationModel.update(
        { autoRenew: autoRenew },
        { where: { id: applicationId } }
      );
    } else {
      [updateCount] = await req.applicationModel.update(
        { defaultPaymentDetails: paymentDetails },
        { where: { id: applicationId } }
      );
    }

    if (updateCount > 0) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: { affectedRows: updateCount },
      });
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.APPLICATION.UPDATE_FAILED,
        success: false,
      });
    }
  } catch (error) {
    console.error("AutoRenew Update Error:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getLogByapplicationId = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, searchFilter, dateRange, duration, Order } = reqBody;

    let logData = await getlogListServices(
      applicationId,
      searchFilter,
      dateRange,
      duration,
      Order
    );
    if (logData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.LOG_FETCH_SUCCESS,
        success: true,
        data: logData,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getreqDocUploadedFile = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId } = reqBody;

    let logData = await getReqDocUploadedFileService(applicationId);
    if (logData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DOCUMENT_FETCH_SUCCESS,
        success: true,
        data: logData,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getAppotmentApplicationList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      page = 1,
      perPage,
      customerId = "",
      searchFilter,
      departmentId,
      serviceSlug,
      status,
      dateRange,
      trackApplication = false,
    } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    if (departmentId) {
      serviceAllList = serviceAllList.filter(
        (service) => service?.departmentId == departmentId
      );
    }

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    if (serviceSlug) {
      serviceListArrayWithSlug = [serviceSlug];
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
      [Op.or]: [
        {
          bookingDetails: {
            [Op.not]: "",
          },
        },
        {
          isBooking: "1",
        },
      ],
    };
    if (customerId) whereCondition.customerId = customerId;
    if (status) whereCondition.status = status;
    if (searchFilter)
      whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Fetch total count of matching records
    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "count",
      {
        where: whereCondition,
      }
    );

    const total = Object.values(totalRecords).reduce(
      (acc, value) => acc + value,
      0
    );

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        isBooking: "1",
        order: [["createdDate", "DESC"]],
        raw: true,
        attributes: trackApplication
          ? [
              "id",
              "applicationId",
              "serviceData",
              "status",
              "createdDate",
              "updateDate",
            ]
          : undefined,
      }
    );

    const combinedData = combineData(data);

    const sortedData = combinedData
      .filter((item) => item.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const offset = (page - 1) * perPage;
    let paginatedData;
    if (perPage) {
      paginatedData = sortedData.slice(offset, offset + perPage);
    } else {
      paginatedData = sortedData;
    }

    const [customerResponse, documentResponse, getAlluserList] =
      await Promise.all([
        axios.post(`${process.env.USERMICROSERVICE}/customer/customerList`, {
          data: {},
        }),
        axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
          data: {},
        }),
        axios.post(`${process.env.USERMICROSERVICE}/user/getAlluser`, {
          data: {},
        }),
      ]);

    const customerLists = customerResponse?.data?.data?.rows || [];
    const documentList = documentResponse?.data?.data?.rows || [];
    const getAdminuserList = getAlluserList?.data?.data?.rows || [];
    let enhancedData;
    if (trackApplication) {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );

          return {
            ...application,
            serviceName: {
              id: serviceInfo?.id,
              serviceName: serviceInfo?.serviceName,
              slug: serviceInfo?.slug,
              departmentName: serviceInfo?.departmentName,
              version: serviceInfo?.currentVersion,
            },
          };
        })
        .filter(Boolean);
    } else {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const customerData = customerLists.find(
            (customer) => customer && customer.id == application.customerId
          );
          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );
          const assignUserInfo =
            application?.userId &&
            getAdminuserList.find((user) => user?.id == application?.userId);
          const signatureData = application?.signatureImageId
            ? documentList.find(
                (doc) => doc && doc.id === application.signatureImageId
              )
            : null;
          const imageData = customerData?.nibImageId
            ? documentList.find(
                (doc) => doc && doc.id == customerData.nibImageId
              )
            : null;

          return {
            ...application,
            serviceName: serviceInfo,
            signatureImage: signatureData
              ? {
                  id: signatureData.id,
                  documentPath: signatureData.documentPath,
                }
              : {},
            customerInfo: customerData
              ? {
                  id: customerData.id,
                  firstName: customerData.firstName,
                  middleName: customerData.middleName,
                  lastName: customerData.lastName,
                  nibNumber: customerData.nibNumber,
                  email: customerData.email,
                  imageData: imageData
                    ? {
                        id: imageData.id,
                        customerId: imageData.customerId,
                        documentName: imageData.documentName,
                        documentPath: imageData.documentPath,
                        documentType: imageData.documentType,
                      }
                    : null,
                }
              : null,
            assignUserInfo: assignUserInfo
              ? {
                  id: assignUserInfo?.id,
                  name: assignUserInfo?.name,
                  email: assignUserInfo?.email,
                  phone: assignUserInfo?.phone,
                }
              : null,
          };
        })
        .filter(Boolean);
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: enhancedData, count: total },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const bookAppoitmentRequest = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId ,userId, departmentId,description} = reqBody;

    const response = await bookAppoitmentRequestService(applicationId,userId, departmentId,description, req);
    if (response) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.MEETING_LINK,
        success: true,
        data: response,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getBookingConfirmation = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, departmentId } = reqBody;

    const response = await getBookingConfirmationService(
      applicationId,
      departmentId,
      req
    );
    if (response) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.LOG_FETCH_SUCCESS,
        success: true,
        data: response,
      });
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Application not found",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.error("Error in getBookingConfirmation:", error.message);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const cancelBookingApi = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, departmentId } = reqBody;

    const response = await bookingCancelService(
      applicationId,
      departmentId,
      req
    );
    if (response) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.LOG_FETCH_SUCCESS,
        success: true,
        data: response,
      });
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Application not found",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const appoitmentDetails = async (req, res) => {
  try {
    const reqBody = req.body;
    const { eData, visitorId, bookingDetails, checksum } = reqBody;

    if (!bookingDetails || !visitorId || !checksum) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: DETAILS_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    const response = await appoitmentDetailsService(
      eData,
      visitorId,
      bookingDetails,
      checksum,
      req
    );

    if (response) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.SUCCESS,
        success: true,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const sendBookAndMeetData = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, customerId } = reqBody;
    const response = await sendBookAndMeetDataService(
      applicationId,
      customerId,
      req
    );
    if (response) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.LOG_FETCH_SUCCESS,
        success: true,
        data: response,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const createRequestDocument = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, documentData, logData } = reqBody;

    let applicationDoc = await createRequestDocumentService(
      applicationId,
      documentData,
      logData,
      req
    );
    if (applicationDoc) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.ADDED_REQUESTED_DOC_SUCCESS,
        success: true,
        data: applicationDoc,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const updateRequiredDocument = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const { applicationId, documentSlug, uploadedDocumentId } = reqBody;

    if (!applicationId && !documentSlug) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.APPLICATION.REQUESTED_DOC_ID_NOT_FOUND,
        success: true,
        data: applicationUpdate,
      });
    }

    let applicationUpdate = await updateRequiredDocumentService(
      applicationId,
      documentSlug,
      uploadedDocumentId,
      req
    );

    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_REQUESTED_DOC_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getGeneralSetting = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { settingKey } = reqBody;

    let settingData = await geGeneralSettingListServices(settingKey);
    if (settingData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.SETTING_FETCH_SUCCESS,
        success: true,
        data: settingData,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getApplicationListForCombineList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let applicationList = await getDataForCombineList(reqBody);
    if (applicationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DOCUMENT_FETCH_SUCCESS,
        success: true,
        data: applicationList,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getDropdownOptions = async (req, res) => {
  try {
    let applicationList = await getOptionsData();
    if (applicationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DOCUMENT_FETCH_SUCCESS,
        success: true,
        data: applicationList,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getRevenueReportapplicationStatus = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let application = await getDataforRevenueReportStatus(reqBody);
    if (application) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.APPLICATION_STATUS,
        success: true,
        data: application,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const addRating = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { applicationId, rating, ratingFeedback } = reqBody;
    if (!applicationId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.APPLICATION.APPLICATION_ID_NOT_FOUND,
        success: true,
        data: {},
      });
    }

    let applicationUpdate = await addRatingService(
      applicationId,
      rating,
      ratingFeedback,
      req
    );

    if (applicationUpdate) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.UPDATE_SUCCESS,
        success: true,
        data: applicationUpdate,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getTicketCountStatusWise = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { dateRangeOption } = reqBody;
    const application = await TicketCountStatusWise(dateRangeOption);
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: application,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const totalRatingCountList = async (req, res) => {
  try {
    let ratingsData = await getRatingsList();
    if (ratingsData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.FETCH_SUCCESS,
        success: true,
        data: { ...ratingsData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.APPLICATION.FETCH_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.body.data;
    const result = await deleteApplicationByApplicationId(applicationId, req);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.DELETE_APPLICATION_SUCCESS,
        success: true,
        data: result,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.APPLICATION.DELETE_APPLICATION_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const revenueApplicationStatus = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { slug, applicationIds, status } = reqBody;

    let applicationList = await revenueApplicationStatusService(
      slug,
      applicationIds,
      status,
      req
    );

    if (applicationList) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.FETCH_SUCCESS,
        success: true,
        data: applicationList,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const updateRenewApplication = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      customerId,
      applicationId,
      transactionId,
      newtransactionStatus,
      autoPay,
      serviceData,
      slug,
    } = reqBody;

    let renewApplication = await updateRenewApplicationService(
      customerId,
      applicationId,
      transactionId,
      newtransactionStatus,
      autoPay,
      serviceData,
      slug,
      req
    );

    if (renewApplication) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.APPLICATION.RENEW_CERTIFICATE,
        success: true,
        data: renewApplication,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const applicationRatingList = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { serviceSlug, dateRange } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    let serviceNameMap = serviceAllList.reduce((acc, service) => {
      acc[service.slug] = service.serviceName;
      return acc;
    }, {});

    if (serviceSlug) {
      serviceListArrayWithSlug = [serviceSlug];
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        attributes: [
          [fn("AVG", col("rating")), "averageRating"],
          [fn("COUNT", col("rating")), "totalRatings"],
          "serviceData",
        ],
        where: whereCondition,
        group: ["serviceData"],
      }
    );
    const flattenedRecords = Object.values(totalRecords).flat();

    const combinedData = flattenedRecords.map((record) => {
      const dataValues = record.dataValues;
      const { serviceData, averageRating, totalRatings } = dataValues;
      const serviceSlug = serviceData?.slug;

      return {
        serviceName: serviceNameMap[serviceSlug] || "Unknown",
        slug: serviceSlug,
        averageRating: parseFloat(averageRating) || 0,
        totalRatings: parseInt(totalRatings) || 0,
      };
    });

    const aggregatedData = combinedData.reduce((acc, curr) => {
      if (curr.serviceName === "Unknown") return acc;
      const existing = acc.get(curr.serviceName);
      if (existing) {
        existing.totalRatings += curr.totalRatings;
        existing.averageRating =
          (existing.averageRating + curr.averageRating) / 2;
      } else {
        acc.set(curr.serviceName, { ...curr });
      }
      return acc;
    }, new Map());

    const sortedData = Array.from(aggregatedData.values())
      .sort((a, b) => b.totalRatings - a.totalRatings)
      .slice(0, 10);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: sortedData },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getAllApplicationServiceRequest = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { departmentId, serviceSlug, dateRangeOption, dateRange } = reqBody;

    const mergeApiResponses = (apiResponses) => {
      const mergedData = {
        new: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
      };

      apiResponses.forEach((response) => {
        mergedData.new += response.new || 0;
        mergedData.pending += response.pending || 0;
        mergedData.inProgress += response.inProgress || 0;
        mergedData.completed += response.completed || 0;
      });

      mergedData.total =
        mergedData.new +
        mergedData.pending +
        mergedData.inProgress +
        mergedData.completed;

      return mergedData;
    };

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    if (departmentId && Array.isArray(departmentId)) {
      serviceAllList = serviceAllList.filter(
        (service) => departmentId.includes(String(service?.departmentId))
      );
    }
    
    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );
    
    if (serviceSlug) {
      serviceListArrayWithSlug = [serviceSlug];
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };

    if (dateRangeOption) {
      const { startDate, endDate } = calculateDateRange(dateRangeOption);
      if (startDate && endDate) {
        whereCondition.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }

    if (!dateRangeOption && dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        attributes: [
          [fn("COUNT", Sequelize.col("id")), "count"],
          [
            literal(
              `COUNT(CASE WHEN DATE(createdDate) = '${today}' THEN 1 END)`
            ),
            "new",
          ],
          [literal("COUNT(CASE WHEN status = '1' THEN 1 END)"),"pending"],
          [literal("COUNT(CASE WHEN status = '2' THEN 1 END)"), "inProgress"],
          [
            literal("COUNT(CASE WHEN status IN ('5') THEN 1 END)"),
            "completed",
          ],
        ],
        where: whereCondition,
      }
    );

    const applicationDataValues = Object.values(totalRecords)
      .flat()
      .map((app) => app.dataValues);

    const data = mergeApiResponses(applicationDataValues);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: data },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const getExpiredApplication = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      page = 1,
      perPage,
      customerId = "",
      searchFilter,
      departmentId,
      serviceSlug,
      status,
      dateRange,
      trackApplication = false,
      autoRenewPage = false,
    } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];
    let getAlluserList;

    try {
      getAlluserList = await axios.post(
        `${process.env.USERMICROSERVICE}/user/getAlluser`,
        { data: {} }
      );
    } catch (error) {
      console.log(error);
    }

    const getAdminuserList = getAlluserList?.data?.data?.rows;

    if (departmentId) {
      serviceAllList = serviceAllList.filter(
        (service) => service?.departmentId == departmentId
      );
    }

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    if (serviceSlug) {
      serviceListArrayWithSlug = [serviceSlug];
    }

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    if (customerId) whereCondition.customerId = customerId;
    if (status) whereCondition.status = status;
    if (searchFilter)
      whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
    if (autoRenewPage) {
      whereCondition.expiryDate = { [Op.ne]: null };
    }
    if (!autoRenewPage) {
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        whereCondition.createdDate = {
          [Op.between]: [startDate, endDate],
        };
      }
      // Add condition for expiryDate within 30 days
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set to the start of the current day
      const next30Days = new Date();
      next30Days.setDate(currentDate.getDate() + 30);

      // Update whereCondition for expiryDate
      whereCondition.expiryDate = {
        [Op.or]: [
          { [Op.lte]: currentDate }, // Include expired records (expiryDate <= currentDate)
          {
            [Op.and]: [
              { [Op.gt]: currentDate }, // expiryDate is strictly after the current date (upcoming expiry)
              { [Op.lte]: next30Days }, // expiryDate is within the next 30 days
            ],
          },
        ],
      };
    }

    // Fetch total count of matching records
    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "count",
      {
        where: whereCondition,
      }
    );

    const total = Object.values(totalRecords).reduce(
      (acc, value) => acc + value,
      0
    );

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        attributes: [
          "id",
          "applicationId",
          "customerId",
          "userId",
          "applicantName",
          "signatureImageId",
          "expiryDate",
          "renewDate",
          "createdDate",
          "updateDate",
          "autoRenew",
          "serviceData",
          "defaultPaymentDetails",
        ],
        raw: true,
      }
    );

    const combinedData = combineData(data);
    const sortedData = combinedData
      .filter((item) => item.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const offset = (page - 1) * perPage;
    let paginatedData;
    if (perPage) {
      paginatedData = sortedData.slice(offset, offset + perPage);
    } else {
      paginatedData = sortedData;
    }

    let enhancedData = paginatedData
      .map((application) => {
        if (!application) return null;

        const serviceInfo = serviceAllList.find(
          (service) => service?.slug == application?.serviceData?.slug
        );

        const findAssignUserData = getAdminuserList.find(
          (data) => data.id == application?.userId
        );

        return {
          ...application,
          serviceName: serviceInfo,
          applicationAssignedToUser: findAssignUserData
            ? {
                id: findAssignUserData?.id,
                name: findAssignUserData?.name,
                email: findAssignUserData?.email,
                phone: findAssignUserData?.phone,
              }
            : null,
        };
      })
      .filter(Boolean);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { rows: enhancedData, count: total },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const exportCustomerApplicationData = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      page = 1,
      perPage,
      customerId = "",
      dateRange,
      status,
      fileName,
      trackApplication = false,
    } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];
    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };

    if (customerId) whereCondition.customerId = customerId;
    if (status) whereCondition.status = status;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const totalRecords = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "count",
      { where: whereCondition }
    );

    const total = Object.values(totalRecords).reduce(
      (acc, value) => acc + value,
      0
    );

    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        raw: true,
        attributes: trackApplication
          ? [
              "id",
              "applicationId",
              "serviceData",
              "status",
              "createdDate",
              "updateDate",
            ]
          : undefined,
      }
    );

    const combinedData = combineData(data);
    const sortedData = combinedData
      .filter((item) => item.createdDate)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    const offset = (page - 1) * perPage;
    let paginatedData;
    if (perPage) {
      paginatedData = sortedData.slice(offset, offset + perPage);
    } else {
      paginatedData = sortedData;
    }

    const [customerResponse, documentResponse, getAlluserList] =
      await Promise.all([
        axios.post(`${process.env.USERMICROSERVICE}/customer/customerList`, {
          data: {},
        }),
        axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
          data: {},
        }),
        axios.post(`${process.env.USERMICROSERVICE}/user/getAlluser`, {
          data: {},
        }),
      ]);

    const customerLists = customerResponse?.data?.data?.rows || [];
    const documentList = documentResponse?.data?.data?.rows || [];
    const getAdminuserList = getAlluserList?.data?.data?.rows || [];

    let enhancedData; // Initialize enhancedData as an array

    if (trackApplication) {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );

          return {
            ...application,
            serviceName: {
              id: serviceInfo?.id,
              serviceName: serviceInfo?.serviceName,
              slug: serviceInfo?.slug,
              departmentName: serviceInfo?.departmentName,
              version: serviceInfo?.currentVersion,
            },
          };
        })
        .filter(Boolean);
    } else {
      enhancedData = paginatedData
        .map((application) => {
          if (!application) return null;

          const customerData = customerLists.find(
            (customer) => customer && customer.id == application.customerId
          );
          const serviceInfo = serviceAllList.find(
            (service) => service?.slug == application?.serviceData?.slug
          );
          const assignUserInfo =
            application?.userId &&
            getAdminuserList.find((user) => user?.id == application?.userId);
          const signatureData = application?.signatureImageId
            ? documentList.find(
                (doc) => doc && doc.id === application.signatureImageId
              )
            : null;
          const imageData = customerData?.nibImageId
            ? documentList.find(
                (doc) => doc && doc.id == customerData.nibImageId
              )
            : null;

          return {
            ...application,
            serviceName: serviceInfo,
            signatureImage: signatureData
              ? {
                  id: signatureData.id,
                  documentPath: signatureData.documentPath,
                }
              : {},
            customerInfo: customerData
              ? {
                  id: customerData.id,
                  firstName: customerData.firstName,
                  middleName: customerData.middleName,
                  lastName: customerData.lastName,
                  nibNumber: customerData.nibNumber,
                  email: customerData.email,
                  imageData: imageData
                    ? {
                        id: imageData.id,
                        customerId: imageData.customerId,
                        documentName: imageData.documentName,
                        documentPath: imageData.documentPath,
                        documentType: imageData.documentType,
                      }
                    : null,
                }
              : null,
            assignUserInfo: assignUserInfo
              ? {
                  id: assignUserInfo?.id,
                  name: assignUserInfo?.name,
                  email: assignUserInfo?.email,
                  phone: assignUserInfo?.phone,
                }
              : null,
          };
        })
        .filter(Boolean);
    }

    if (!enhancedData || enhancedData.length === 0) {
      return res.json({ message: "No data found to export." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customer Application Report");

    worksheet.addRow([
      "Application ID",
      "Date / Time",
      "Services Name",
      "Applicant Name",
      "Department Name",
      "TAT",
      "Transaction Status",
      "Status",
      "Payment Method",
      "Payment Option",
    ]);

    const transactionStatusMap = {
      0: "Pending",
      1: "Success",
      2: "Failed",
      3: "Refund",
    };

    const statusMap = {
      0: "Incomplete",
      1: "Pending",
      2: "In Progress",
      3: "Checked & Verified",
      4: "Auto Pay",
      5: "Approved",
      6: "Rejected",
      7: "Shipped",
    };

    const paymentMethodMap = {
      0: "Gov Pay",
      1: "Other",
    };

    const paymentOptionMap = {
      0: "Pay now",
      1: "Pay later",
    };

    enhancedData.forEach((row) => {
      const transactionStatus =
        transactionStatusMap[row.transactionStatus] || "-";
      const status = statusMap[row.status] || "-";
      const paymentMethod =
        paymentMethodMap[row.serviceName?.paymentMethod] || "-";
      const paymentOption =
        paymentOptionMap[row.serviceName?.paymentOption] || "-";

      worksheet.addRow([
        row.applicationId || "-",
        row.updateDate
          ? new Date(row.updateDate).toISOString().slice(0, 10)
          : "-",
        row.serviceName?.serviceName || "-",
        row.applicantName || "-",
        row.serviceName?.departmentName || "-",
        calculateRemainingTimeTAT(row.turnAroundTime) || "-",
        transactionStatus,
        status,
        paymentMethod,
        paymentOption,
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

    const filePath = process.env.EXPORT_CUSTOMER_APPLICATION_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { filePath },
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const removeCustomerApplicationDataExcel = async (req, res) => {
  try {
    const { fileName } = req.body.data;

    const desirePath = path.join(setting.PROJECT_DIR, "public");
    const filePath = path.join(desirePath, fileName);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error("Error finding file:", err);
        return res.status(404).json({
          message: "File not found",
          success: false,
          data: {},
        });
      }

      if (stats.isFile()) {
        fs.unlink(filePath, (error) => {
          if (error) {
            console.error("Error deleting file:", error);
            return res.status(500).json({
              message: "Could not delete file",
              success: false,
              data: {},
            });
          }

          return res.status(200).json({
            message: "File deleted successfully",
            success: true,
            data: {},
          });
        });
      } else {
        console.error("Path is not a file");
        return res.status(400).json({
          message: "Path is not a file",
          success: false,
          data: {},
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
      data: {},
    });
  }
};
const getApplicationDetailForQrScan = async (req, res) => {
  try {
    // Access the models attached by the middleware
    const { applicationModel } = req;
    const { applicationId } = req.body?.data;

    if (!applicationModel) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }

    const result = await req.applicationModel.findOne({
      where: {
        applicationId: applicationId,
      },
      raw: true,
    });
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.APPLICATION.FETCH_SUCCESS,
      success: true,
      data: { ...result },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const autoPayFindApplication = async (req, res) => {
  try {
    const { results, failedLogs } = await processAutoPayApplications();
    res.status(200).json({
      message: "Processing completed",
      success: true,
      processedCount: results.length,
      failedCount: failedLogs.length,
      results,
      failedLogs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during processing",
      success: false,
      error: error.message,
    });
  }
};

const processAutoPayApplications = async () => {
  try {
    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    let whereCondition = {
      [Op.or]: [
        {
          applicationId: {
            // [Op.regexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
          },
          transactionStatus: "1", // Only include if transactionStatus is "1"
        },
        {
          applicationId: {
            // [Op.notRegexp]: "^[A-Z]{3}[0-9]+-[0-9]$",
            [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
          },
        },
        {
          transactionStatus: {
            [Op.ne]: "1", // Transaction status is not "1"
          },
          paymentToken: {
            [Op.not]: null, // paymentoken is present
          },
        },
      ],
    };
    // Add condition for expiryDate within 30 days
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Start of the current day

    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1); // 1 day from the current date

    // Update whereCondition for expiryDate
    whereCondition.expiryDate = {
      [Op.or]: [
        // { [Op.lte]: currentDate }, // Include expired records (expiryDate <= currentDate)
        {
          [Op.and]: [
            { [Op.gt]: currentDate }, // expiryDate is strictly after the current date (upcoming expiry)
            { [Op.lte]: nextDay }, // expiryDate is within the next 1 days
          ],
        },
      ],
    };

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        attributes: [
          "id",
          "applicationId",
          "customerId",
          "userId",
          "applicantName",
          "signatureImageId",
          "expiryDate",
          "renewDate",
          "createdDate",
          "updateDate",
          "autoRenew",
          "serviceData",
          "paymentToken",
          "defaultPaymentDetails",
        ],
        raw: true,
      }
    );

    const combinedData = combineData(data);

    const results = [];
    const failedLogs = [];

    for (const data of combinedData) {
      if (data?.defaultPaymentDetails) {
        try {
          const getService = await axios.post(
            `${process.env.SERVICEMANAGEMENT}/service/getById`,
            {
              data: { slug: data?.serviceData?.slug },
            }
          );

          if (!getService.data || !getService.data.data) {
            failedLogs.push({ error: "Invalid service request", data });
            continue;
          }

          const databaseName = getService?.data?.data?.databaseName;
          const dataService = getService?.data?.data;

          const serviceObject = {
            serviceId: dataService?.id,
            serviceName: dataService?.serviceName,
            departmentId: dataService?.departmentId,
            slug: dataService?.slug,
            departmentName: dataService?.departmentName,
            departmentLogo: dataService?.departmentLogo,
            price: dataService?.price,
            TAT: dataService?.TAT,
            step: dataService?.step,
            certificateExpiryTime: dataService?.certificateExpiryTime,
            certificateTemplate: dataService?.certificateTemplate,
            serviceInstructions: dataService?.serviceInstructionsData,
          };

          let req = {};

          let sequelizeInstance;
          try {
            sequelizeInstance = await createSequelizeInstance(databaseName);
          } catch (error) {
            failedLogs.push({
              error: "Database connection failed",
              data,
              details: error.message,
            });
            continue;
          }

          try {
            req.service = getService?.data?.data;
            req.sequelize = sequelizeInstance;
            await allModelAndAssociate(req);
          } catch (error) {
            failedLogs.push({
              error: "Error initializing models for the database",
              data,
              details: error.message,
            });
            continue;
          }

          try {
            const paymentData = decrypt({ data: data?.defaultPaymentDetails });

            let paymentIntent = await stripe.paymentIntents.create({
              amount: dataService?.price,
              currency: "usd",
              payment_method: paymentData?.data?.id,
              customer: paymentData?.data?.stripeCustomerId,
              confirm: true,
              off_session: true,
              description: `Server-side Payment Confirmation: ${data?.applicationId}`,
              shipping: {
                name: "Jenny Rosen",
                address: {
                  line1: "510 Townsend St",
                  postal_code: "98140",
                  city: "San Francisco",
                  state: "CA",
                  country: "US",
                },
              },
            });

            const { status, id } = paymentIntent;

            if (status === "succeeded") {
              const { applicationModel, applicationLogModel } = req;

              const renewApplication = updateRenewApplicationService(
                data?.customerId,
                data?.id,
                paymentIntent?.id,
                "1",
                true,
                serviceObject,
                data?.serviceData?.slug,
                req
              );

              const settleResults = await Promise.allSettled([
                renewApplication,
              ]);

              try {
                const ipAddress = getLocalIPv4Address();
                const auditLogBody = {
                  recordId: data?.applicationId,
                  action: `${serviceObject?.serviceName} (${data?.applicationId}) autoPay payment completed`,
                  moduleName: "Application",
                  newValue: data?.status,
                  oldValue: data?.status,
                  type: "2",
                  userId: null,
                  customerId: data?.customerId,
                  ipAddress: ipAddress,
                };

                await axios.post(
                  `${process.env.USERMICROSERVICE}/auditLog/create`,
                  {
                    data: auditLogBody,
                  }
                );
              } catch (error) {
                console.error("Error generating audit log:", error);
              }

              const failed = settleResults.filter(
                (res) => res.status === "rejected"
              );
              if (failed.length > 0) {
                failedLogs.push({ error: "Partial failure", data, failed });
                await stripe.refunds.create({
                  payment_intent: id,
                  reason: "requested_by_customer",
                });
                await updateRenewFailedApplicationService(
                  data?.customerId,
                  data?.id,
                  null,
                  "2",
                  serviceObject,
                  dataService?.slug,
                  req
                );
                try {
                  const ipAddress = getLocalIPv4Address();
                  const auditLogBody = {
                    recordId: data?.applicationId,
                    action: `${serviceObject?.serviceName} (${data?.applicationId}) autoPay payment failed`,
                    moduleName: "Application",
                    newValue: data?.status,
                    oldValue: data?.status,
                    type: "2",
                    userId: null,
                    customerId: data?.customerId,
                    ipAddress: ipAddress,
                  };

                  await axios.post(
                    `${process.env.USERMICROSERVICE}/auditLog/create`,
                    {
                      data: auditLogBody,
                    }
                  );
                } catch (error) {
                  console.error("Error generating audit log:", error);
                }
              } else {
                results.push({ success: true, data: data.applicationId });
              }
            } else {
              await updateRenewFailedApplicationService(
                data?.customerId,
                data?.id,
                null,
                "2",
                serviceObject,
                dataService?.slug,
                req
              );
              failedLogs.push({ error: "Payment failed", data });
              try {
                const ipAddress = getLocalIPv4Address();
                const auditLogBody = {
                  recordId: data?.applicationId,
                  action: `${serviceObject?.serviceName} (${data?.applicationId}) autoPay payment failed`,
                  moduleName: "Application",
                  newValue: data?.status,
                  oldValue: data?.status,
                  type: "2",
                  userId: null,
                  customerId: data?.customerId,
                  ipAddress: ipAddress,
                };

                await axios.post(
                  `${process.env.USERMICROSERVICE}/auditLog/create`,
                  {
                    data: auditLogBody,
                  }
                );
              } catch (error) {
                console.error("Error generating audit log:", error);
              }
            }
          } catch (error) {
            failedLogs.push({
              error: "Error during payment processing",
              data,
              details: error.message,
            });
            try {
              const ipAddress = getLocalIPv4Address();
              const auditLogBody = {
                recordId: data?.applicationId,
                action: `${serviceObject?.serviceName} (${data?.applicationId}) autoPay payment failed`,
                moduleName: "Application",
                newValue: data?.status,
                oldValue: data?.status,
                type: "0",
                userId: null,
                customerId: data?.customerId,
                ipAddress: ipAddress,
              };

              await axios.post(
                `${process.env.USERMICROSERVICE}/auditLog/create`,
                {
                  data: auditLogBody,
                }
              );
            } catch (error) {
              console.error("Error generating audit log:", error);
            }
          }
        } catch (error) {
          failedLogs.push({
            error: "Service fetch error",
            data,
            details: error.message,
          });
        }
      }
    }

    return { results, failedLogs };
  } catch (error) {
    console.error("Error in processApplications:", error.message);
    throw error;
  }
};

const deleteCustomerApplicationData = async (req, res) => {
  const { customerId, name, email, ipAddress } = req.body.data;
  try {
    const failedLogs = [];
    const results = [];

    const getAllServiceList = await axios
      .post(`${process.env.SERVICEMANAGEMENT}/service/list`, { data: {} })
      .catch((error) => ({ data: { data: { rows: [] } } }));

    const serviceAllList = getAllServiceList?.data?.data?.rows || [];

    const connectionPromises = serviceAllList.map(async (data) => {
      try {
        //connect to db
        const sequelizeInstance = await createSequelizeInstance(
          data.databaseName
        );
        const req = { sequelize: sequelizeInstance };
        await allModelAndAssociate(req);

        const { applicationModel, applicationLogModel } = req;
        //start transaction
        const transaction = await applicationModel.sequelize.transaction();

        try {
          await applicationModel.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {
            transaction,
          });

          const deleteOperations = [
            applicationModel.destroy({ where: { customerId }, transaction }),
            applicationLogModel.destroy({ where: { customerId }, transaction }),
          ];

          await Promise.all(deleteOperations);

          await applicationModel.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {
            transaction,
          });
          await transaction.commit();

          return { serviceName: data.serviceName, status: "Success" };
        } catch (deleteError) {
          //rollback from all process if error
          await transaction.rollback();
          throw {
            error: "Delete operation failed",
            serviceName: data.serviceName,
            details: deleteError.message,
          };
        }
      } catch (error) {
        throw {
          error: "Database connection or model initialization failed",
          serviceName: data.serviceName,
          details: error.message,
        };
      }
    });

    const connectionResults = await Promise.allSettled(connectionPromises);

    connectionResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        failedLogs.push(result.reason);
      }
    });

    const auditLogBody = {
      recordId: customerId,
      action: `Customer ( ${name} - ${email} ) application data deleted successfully`,
      moduleName: "Application Service",
      newValue: JSON.stringify({
        customerId: customerId,
        name: name,
        email: email,
      }),
      oldValue: "N/A",
      type: "2",
      userId: null,
      customerId,
      ipAddress,
    };
    try {
      await axios.post(`${process.env.USERMICROSERVICE}/auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error(error);
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Applications deletion process completed",
      success: true,
      data: { results, failedLogs },
    });
  } catch (error) {
    const auditLogBody = {
      recordId: customerId,
      action: `Customer ( ${name} - ${email} ) application data delete failed`,
      moduleName: "Application Service",
      newValue: JSON.stringify({
        customerId: customerId,
        name: name,
        email: email,
      }),
      oldValue: "N/A",
      type: "2",
      userId: null,
      customerId,
      ipAddress,
    };
    try {
      await axios.post(`${process.env.USERMICROSERVICE}/auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error(error);
    }

    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const transferCustomerApplicationData = async (req, res) => {
  const {currentCustomerDetails, transferCustomerDetails, ipAddress, customerId } = req.body.data;

  try {
    if (customerId) {
      // Fetch all services
      const getAllServiceListResponse = await axios.post(
        `${process.env.SERVICEMANAGEMENT}/service/list`,
        { data: {} }
      );
      const serviceAllList = getAllServiceListResponse?.data?.data?.rows || [];
      const serviceSlugs = serviceAllList.map((service) => service.slug);

      // Define query conditions
      const whereCondition = {};
      if (customerId) whereCondition.associatedCustomerId = customerId;

      // // Fetch application data from all services
      const applicationData = await fetchDataFromTables(
        serviceSlugs,
        "application",
        "findAll",
        {
          where: whereCondition,
          order: [["createdDate", "DESC"]],
          raw: true,
          attributes: [
            "id",
            "applicationId",
            "serviceData",
            "status",
            "transactionStatus",
            "createdDate",
            "updateDate",
          ],
        }
      );

      const combinedData = combineData(applicationData);
      const applicationList = combinedData.map((data) => ({
        slug: data?.serviceData?.slug,
        applicationId: data?.id,
      }));

      if (!applicationList || applicationList.length === 0) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: "No applications found for transfer",
          success: true,
        });
      }
      for (const application of applicationList) {
        const { slug, applicationId } = application;
        let getService;

        try {
          getService = await axios.post(
            `${process.env.SERVICEMANAGEMENT}/service/getById`,
            {
              data: { slug },
            }
          );
        } catch (error) {
          console.error(`Failed to fetch service for slug: ${slug}`, error);
          continue; // Skip to the next application in case of an error
        }


        let applicationData;
        try {
          const sequelizeInstance = await createSequelizeInstance(
            getService.data.data.databaseName
          );
          const req = { sequelize: sequelizeInstance };
          await allModelAndAssociate(req);

          const { applicationModel, applicationLogModel } = req;
          const transaction = await applicationModel.sequelize.transaction();
          applicationData = await applicationModel.findOne({ where: { id: applicationId }, raw: true });
          try {
            await applicationModel.sequelize.query(
              "SET FOREIGN_KEY_CHECKS = 0",
              {
                transaction,
              }
            );

            // Update applicationModel
            await applicationModel.update(
              { customerId: transferCustomerDetails?.customerId },
              {
                where: {
                  customerId: currentCustomerDetails?.customerId,
                  id: applicationId,
                },
                transaction,
              }
            );

            // Update applicationLogModel
            await applicationLogModel.update(
              { customerId: transferCustomerDetails?.customerId },
              {
                where: {
                  customerId: currentCustomerDetails?.customerId,
                  applicationId,
                },
                transaction,
              }
            );

            await applicationModel.sequelize.query(
              "SET FOREIGN_KEY_CHECKS = 1",
              {
                transaction,
              }
            );
            await transaction.commit();

            // Audit log for success
            const auditLogBody = {
              recordId: JSON.stringify(applicationId),
              action: `Customer (${currentCustomerDetails?.name} - ${currentCustomerDetails?.email}) application ${applicationData?.applicationId} transferred to customer (${transferCustomerDetails?.name} - ${transferCustomerDetails?.email}) successfully`,
              moduleName: "Application Service",
              newValue: JSON.stringify({
                customerId: transferCustomerDetails?.customerId,
                name: transferCustomerDetails?.name,
                email: transferCustomerDetails?.email,
              }),
              oldValue: JSON.stringify({
                customerId: currentCustomerDetails?.customerId,
                name: currentCustomerDetails?.name,
                email: currentCustomerDetails?.email,
              }),
              type: "2",
              userId: null,
              customerId: currentCustomerDetails?.customerId,
              ipAddress,
            };

            await axios.post(
              `${process.env.USERMICROSERVICE}/auditLog/create`,
              { data: auditLogBody }
            );
          } catch (transactionError) {
            await transaction.rollback();
            console.error(
              `Transaction failed for applicationId: ${applicationId}`,
              transactionError
            );
          }
        } catch (error) {
          console.error(
            `Transfer process failed for applicationId: ${applicationId}`,
            error
          );

          // Audit log for failure
          const auditLogBody = {
            recordId: JSON.stringify(applicationId),
            action: `Customer (${currentCustomerDetails?.name} - ${currentCustomerDetails?.email}) application ${applicationData?.applicationId} data transfer failed`,
            moduleName: "Application Service",
            newValue: JSON.stringify({
              customerId: transferCustomerDetails?.customerId,
              name: transferCustomerDetails?.name,
              email: transferCustomerDetails?.email,
            }),
            oldValue: JSON.stringify({
              customerId: currentCustomerDetails?.customerId,
              name: currentCustomerDetails?.name,
              email: currentCustomerDetails?.email,
            }),
            type: "2",
            userId: null,
            customerId: currentCustomerDetails?.customerId,
            ipAddress,
          };

          try {
            await axios.post(
              `${process.env.USERMICROSERVICE}/auditLog/create`,
              { data: auditLogBody }
            );
          } catch (logError) {
            console.error("Audit log creation failed:", logError);
          }
        }
      }

      return res.status(STATUS_CODES.SUCCESS).json({
        message: "Applications transfer process completed",
        success: true,
      });
    }else{
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
      });
    }
  } catch (error) {
    console.error("Overall transfer process failed:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
    });
  }
};

const transferListCustomerApplicationData = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId = "" } = reqBody;

    let getAllServiceList = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/list`,
      { data: {} }
    );
    let serviceAllList = getAllServiceList?.data?.data?.rows || [];

    let serviceListArrayWithSlug = serviceAllList.map(
      (service) => service.slug
    );

    let whereCondition = {
      transactionStatus: "1", // Only include if transactionStatus is "1"
    };
    if (customerId) whereCondition.associatedCustomerId = customerId;

    // Fetch data from all services
    const data = await fetchDataFromTables(
      serviceListArrayWithSlug,
      "application",
      "findAll",
      {
        where: whereCondition,
        order: [["createdDate", "DESC"]],
        raw: true,
        attributes: [
          "id",
          "applicationId",
          "serviceData",
          "status",
          "transactionStatus",
          "createdDate",
          "updateDate",
        ],
      }
    );

    const combinedData = combineData(data);

    let sortedData = combinedData
    .filter((item) => item?.createdDate) // Ensure createdDate exists
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)); // Sort by createdDate in descending order
  
  sortedData = sortedData.map((application) => {
    if (!application) return null; 
    const serviceInfo = serviceAllList.find(
      (service) => service?.slug === application?.serviceData?.slug
    );  
    return {
      ...application,
      serviceName: serviceInfo ? {serviceName:serviceInfo?.serviceName,slug:serviceInfo?.slug } : null
    };
  }).filter(Boolean); // Remove any null/undefined applications from the map
  
  return res.status(STATUS_CODES.SUCCESS).json({
    message: MESSAGES.APPLICATION.FETCH_SUCCESS,
    success: true,
    data: sortedData,
  });
  
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};


module.exports = {
  createApplication,
  getRequiredDocuments,
  createApplicationLog,
  getApplicationList,
  updateAssignedUser,
  genratePDFAplication,
  sendNotification,
  updateStatusApplication,
  getLogByapplicationId,
  getreqDocUploadedFile,
  getAppotmentApplicationList,
  bookAppoitmentRequest,
  getBookingConfirmation,
  cancelBookingApi,
  sendBookAndMeetData,
  appoitmentDetails,
  createRequestDocument,
  updateRequiredDocument,
  getGeneralSetting,
  getApplicationListForCombineList,
  getDropdownOptions,
  getRevenueReportapplicationStatus,
  addRating,
  getTicketCountStatusWise,
  totalRatingCountList,
  dynamicCustomerServiceList,
  dynamicAdminServiceList,
  dynamicLogdata,
  getApplication,
  dynamicTrackCountServiceList,
  deleteApplication,
  revenueApplicationStatus,
  applicationRatingList,
  getAllApplicationServiceRequest,
  getExpiredApplication,
  updateRenewApplication,
  exportCustomerApplicationData,
  removeCustomerApplicationDataExcel,
  getApplicationDetailForQrScan,
  findApplicationForDocUpdate,
  updateTransactionStatus,
  autoRenewUpdate,
  autoPayFindApplication,
  processAutoPayApplications,
  deleteCustomerApplicationData,
  transferCustomerApplicationData,
  transferListCustomerApplicationData,
};
