const { Op } = require("sequelize");
const { default: axios } = require("axios");
const {
  customerPaymentDetailsModel,
  transactionDetailsModel,
} = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { applicationPaymentMail } = require("../utils/mail/notificationMail");
const os = require("os");
const moment = require("moment");

// genrate pdf
const { generatePDF } = require("../utils/generatepdf");
const FormData = require("form-data");
const fs = require("fs");
const { Sequelize } = require("../config/db.connection");
const {
  fetchServiceData,
  fetchDepartmentData,
  fetchBirthData,
  fetchCustomerData,
  fetchRevenueApplicationStatusData,
  fetchAuditLogData,
} = require("./cacheUtility");
const ExcelJS = require("exceljs");
const path = require("path");
const puppeteer = require("puppeteer");
const setting = require("../../setting");
const { paymentInvoice } = require("../utils/PaymentInvoice");

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
const createCustomerPaymentDetailsService = async (
  customerId,
  stripeCustomerId
) => {
  try {
    const paymentDetails = await customerPaymentDetailsModel.create({
      customerId: customerId,
      stripeCustomerId: stripeCustomerId,
    });
    return paymentDetails;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
const getCustomerPaymentDetailsService = async (customerId) => {
  try {
    if (customerId) {
      const paymentDetails = await customerPaymentDetailsModel.findAndCountAll({
        where: {
          customerId: customerId,
        },
      });
      return paymentDetails;
    } else {
      const paymentDetails = await customerPaymentDetailsModel.findAndCountAll(
        {}
      );
      return paymentDetails;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const fetchServicesAndDepartments = async () => {
  try {
    const [servicesResponse, departmentsResponse] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
      // fetchServiceData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      // fetchDepartmentData(),
    ]);

    return {
      servicesList: servicesResponse?.data?.data?.rows || [],
      // servicesList: servicesResponse || [],

      departmentList: departmentsResponse?.data?.data?.rows || [],
      // departmentList: departmentsResponse || [],
    };
  } catch (error) {
    console.error("Error fetching services or departments:", error);
    return { servicesList: [], departmentList: [] };
  }
};

const getTransactionDetailsService = async (reqBody) => {
  try {

    if (reqBody?.transactionDetail) {
      let applicationDetail;
      try {
          applicationDetail = await axios.post(
            `${process.env.BUSINESSLICENSESERVICE}/application/adminApplicationList`,
            { data: { slug:reqBody?.slug,applicationId: reqBody?.applicationId } }
          );
        } catch (error) {
        }
     const transactionDetails = await transactionDetailsModel.findAndCountAll({
      where: {
        applicationId: reqBody?.applicationId,
      },
    });

    if (transactionDetails) {
      const transactionApplications = transactionDetails?.rows?.map(
        (transaction) => {
          const findApplication = applicationDetail?.data?.data?.rows?.find(
            (data) => data.id == transaction?.applicationId
          );
          return {
            transaction: transaction,
            applicationDetail: findApplication,
          };
        }
      );
      transactionApplications.sort((a, b) => new Date(b.transaction.createdDate) - new Date(a.transaction.createdDate));

      return {
        count: transactionDetails.count,
        rows: transactionApplications,
      };
    }
    }else {
      const page = reqBody.page;
      const limit = reqBody.limit;
      const transactionStatus = reqBody.transactionStatus;
      // const transactionId = reqBody.transactionId; // Get transactionId from request body
      const applicationId = reqBody.applicationId;
      const searchQuery = reqBody.searchQuery;
      const startDate = reqBody.startDate; // Get startDate from request body
      const endDate = reqBody.endDate; // Get endDate from request body

      let whereClause = {};

      if (transactionStatus !== undefined && transactionStatus !== "") {
        whereClause.transactionStatus = transactionStatus;
      }
      if(reqBody?.customerId){
        whereClause.customerId = reqBody?.customerId;
      }
      if (reqBody?.dateRangeOption) {
        const { startDate, endDate } = calculateDateRangeMonthwise(reqBody?.dateRangeOption);
        if (startDate && endDate) {
          whereClause.createdDate = {
            [Op.between]: [startDate.toDate(), endDate.toDate()],
          };
        }
      }

      if (searchQuery) {
        whereClause[Op.or] = [
          {
            applicationId: { [Op.like]: `%${searchQuery}%` },
          },
          {
            transactionId: { [Op.like]: `%${searchQuery}%` },
          },
        ];
      }
      if(applicationId){
        whereClause.applicationId = applicationId;
      }
      if (startDate !== undefined && endDate !== undefined) {
        const endDateWithTime = new Date(
          new Date(endDate).setHours(23, 59, 59, 999)
        );
        whereClause.createdDate = {
          [Op.between]: [new Date(startDate), endDateWithTime],
        };
      }

      const now = new Date(); // Gets the current date and time
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Resets hours, minutes, seconds, and milliseconds to 0

      switch (reqBody.duration) {
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

      let orderClause = [];
      if (reqBody.sortBy !== undefined && reqBody.sortBy !== "") {
        orderClause.push([reqBody.sortBy, reqBody.sortOrder]);
      } else {
        orderClause.push(["createdDate", "DESC"]);
      }

      let transactionDetails;

      if (!page || !limit) {
        transactionDetails = await transactionDetailsModel.findAndCountAll({
          where: whereClause,
          order: orderClause,
        });
      } else {
        const offset = (page - 1) * limit; // Offset calculation
        transactionDetails = await transactionDetailsModel.findAndCountAll({
          where: whereClause,
          limit: limit,
          offset: offset,
          order: orderClause,
        });
      }

      // Fetch documents
      const getDocument = await axios.post(
        `${process.env.DOCUMENTSERVICE}/document/list/upload`,
        {
          data: {
            customerId: reqBody.customerId,
            isShowInDocument: "0",
          },
        }
      );

      const documentList = getDocument.data;

      // Fetch services and departments
      const { servicesList, departmentList } =
        await fetchServicesAndDepartments();

      if (transactionDetails) {
        const transactionApplications = transactionDetails.rows.map(
          (transaction) => {

            // Find services by slug
            const findServicesBySlug = servicesList.find(
              (data) => data.slug == transaction.serviceSlug
            );

            // Find department name
            const findDepartmentName = findServicesBySlug
              ? departmentList.find(
                  (data) => data.id == findServicesBySlug.departmentId
                )
              : null;

            // Find document path and ID
            let documentPath;
            let documentId;

            if (
              documentList &&
              documentList.success &&
              documentList.data &&
              documentList.data.rows
            ) {
              const foundDocument = documentList.data.rows.find(
                (document) => document.id == transaction.transactionReceipt
              );
              if (foundDocument) {
                documentId = foundDocument.id;
                documentPath = foundDocument.documentPath;
              }
            } else {
            }

            return {
              transaction: transaction,
              findServicesBySlug,
              findDepartmentName,
              documentPath: documentPath,
            };
          }
        );

        return {
          count: transactionDetails.count,
          rows: transactionApplications,
          // rows: transactionDetails.rows,
          currentPage: page,
          totalPages: Math.ceil(transactionDetails.count / limit),
        };
      } else {
        return { count: 0, rows: [] }; // Return empty or appropriate response if no transactions found
      }
    } 
  } catch (error) {
    throw new Error(error);
  }
};

const getCardInfoStripe = async (customerId) => {
  try {
    if (customerId) {
      // Fetch the customer to get the default payment method
      const customer = await stripe.customers.retrieve(customerId);
      const defaultPaymentMethodId =
        customer.invoice_settings.default_payment_method;

      // List all card payment methods for the customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      if (
        paymentMethods &&
        paymentMethods.data &&
        paymentMethods.data.length > 0
      ) {
        const cardDetails = paymentMethods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
          name: pm?.billing_details?.name,
          isDefault: pm.id === defaultPaymentMethodId, // Check if the payment method is the default
        }));

        return cardDetails;
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const addCardInfo = async (customerId, paymentMethodId) => {
  try {
    if (customerId) {
      const paymentMethodAttached = await stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        }
      );
      return paymentMethodAttached;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const deleteCardInfo = async (cardId) => {
  try {
    if (cardId) {
      const detachedCard = await stripe.paymentMethods.detach(cardId);
      return detachedCard;
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
};

const deleteFile = async (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

const uploadPDF = async (filePath, customerId) => {
  const formData = new FormData();
  formData.append("viewDocumentName", "Payment Invoice");
  formData.append("documentFile", fs.createReadStream(filePath));
  formData.append("customerId", customerId);
  formData.append("isGenerated", "0");
  formData.append("isShowInDocument", "0");

  try {
    const fileResponse = await axios.post(
      `${process.env.DOCUMENTSERVICE}/documentService/uploading`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    await deleteFile(filePath);
    return fileResponse.data; // Returning response data from server
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error; // Rethrow or handle error appropriately
  }
};

const createTransactionDetails = async (
  customerId,
  applicationId,
  serviceSlug,
  departmentId,
  transactionId,
  transactionAmount,
  transactionStatus,
  transactionReceipt,
  allApplicationPriceData,
  renew,
  ipAddress,
  reqBody
) => {
  try {
    const transactionDetails = await transactionDetailsModel.create({
      customerId,
      applicationId,
      transactionId,
      serviceSlug,
      transactionAmount,
      transactionStatus,
      transactionReceipt,
    });

    const amount = parseInt(transactionAmount)

    let getAllServiceList;
    try {
      getAllServiceList = await axios.post(
        `${process.env.SERVICEMANAGEMENT}/service/list`,
        { data: {} }
      );
    } catch (error) {
    }

    const serviceAllList = getAllServiceList?.data?.data?.rows;
    let serviceData;
    if (serviceSlug) {
      serviceData = serviceAllList.find(
        (service) => service?.slug == serviceSlug
      );
    }

    const getCustomerName = await axios.post(
      `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/view`,
      {
        data: {
          id: reqBody?.customerId,
        },
      }
    );

    const getCustomerNameList = getCustomerName.data;

    let fullName = "";
    let customer ;

    if (
      getCustomerNameList.data &&
      getCustomerNameList.data.rows &&
      getCustomerNameList.data.rows.length > 0
    ) {
       customer = getCustomerNameList.data.rows[0];
      fullName = `${customer.firstName || ""} ${customer.middleName || ""} ${customer.lastName || ""}`;
    } else {
    }

    if (transactionStatus === "1") {
      const pdfData = {
        customerId: fullName,
        applicationId: applicationId,
        serviceSlug: serviceSlug,
        serviceName:serviceData?.serviceName,
        transactionId: transactionId,
        transactionAmount: transactionAmount,
        transactionStatus: transactionStatus,
        allApplicationPriceData: allApplicationPriceData,
        filePath: `src/file/dynamic-output${Date.now()}.pdf`,
      };

      let transformedTransactionStatus;
      if (pdfData.transactionStatus === "1") {
        transformedTransactionStatus = "Success";
      }

      pdfData.transactionStatus = transformedTransactionStatus;
      
      const filePath = await paymentInvoice(pdfData, pdfData?.filePath);
      const uploadResult = await uploadPDF(filePath, customerId);
      uploadResult;
      const updatereceiptId = uploadResult?.data[0].id;

      const updatereceiptnumber = await transactionDetailsModel.update(
        { transactionReceipt: updatereceiptId },
        {
          where: {
            transactionId: transactionId,
          },
        }
      );
    }

    let statusTitle;
    try {
      switch (transactionStatus) {
        case "0":
          statusTitle = `pending`;
          break;
        case "1":
          statusTitle = `successful`;
          break;
        case "2":
          statusTitle = `failed`;
          break;
        case "3":
          statusTitle = `refunded`;
          break;
        default:
          statusTitle = `status unknown`;
      }
      const notificationBody = {
        customerId: customerId,
        serviceSlug: serviceSlug,
        departmentId: departmentId,
        title: `${serviceData?.serviceName} payment ${statusTitle}.`,
        message: renew ? `Your payment for renew ${serviceData?.serviceName} application ${applicationId} is ${statusTitle}.` :`Your payment for the ${serviceData?.serviceName} application ${applicationId} is ${statusTitle}.`,
        type: "1",
        addedBy: "1",
        applicationId: applicationId,
      };

      await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
        data: notificationBody,
      });
    } catch (error) {
      console.error("Error sending notification =>", error);
    }

    // let emailSettingData;
    // try {
    //   const headers = {
    //     jwttoken: "",
    //     jwtpayload: JSON.stringify({}),
    //   };

    //   emailSettingData = await axios.post(
    //     `${process.env.USERMICROSERVICE}/setting/get`,
    //     { data: {} },
    //     { headers }
    //   );
    // } catch (error) {
    //   console.error(error);
    // }

    // const result = emailSettingData?.data?.data;
    // const settingMap = result.reduce((acc, setting) => {
    //   acc[setting.settingKey] = setting.settingValue;
    //   return acc;
    // }, {});

    const emailSubject = renew ? `Your payment for renewing ${serviceData?.serviceName} (ID: ${applicationId}) is ${statusTitle}.` :`Your payment for ${serviceData?.serviceName} (ID: ${applicationId}) is ${statusTitle}.`

    try {
      const template = await axios.post(
        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
        { data: { slug: "payment_email" } }
      );
      
      const getTemplate = template.data.data;
      let htmlTemplate = getTemplate.content
        .replace(/@@SERVICENAME@@/g, serviceData?.serviceName)
        .replace(/@@APPLICATIONID@@/g, applicationId)
        .replace(/@@RENEWAL@@/g, renew ? "renewal" : "")
        .replace(/@@TRANSACTIONID@@/g, transactionId ? transactionId : "N/A")
        .replace(/@@TRANSACTIONAMOUNT@@/g, `$${amount}`);

        await applicationPaymentMail(customer?.email, emailSubject,htmlTemplate, serviceData?.serviceName);
        // await applicationPaymentMail("v1.netclues@gmail.com", emailSubject, htmlTemplate, serviceData?.serviceName);
    } catch (error) {
      console.error(error);
    }

    const auditLogBody = {
      recordId: applicationId,
      action: `${serviceData?.serviceName} Payment.`,
      moduleName: "Application",
      newValue: transactionReceipt,
      oldValue: "N/A",
      type: "1",
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

    return transactionDetails;
  } catch (error) {
    console.error("error", error);
    throw new Error(error);
  }
};

const fetchPaymentDetails = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  try {
    if (searchQuery) {
      serviceList = serviceList.filter((service) =>
        service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const whereConditions = {
      transactionStatus: "1",
      serviceSlug: {
        [Op.in]: serviceList.map((service) => service.slug),
      },
    };

    if (departmentId) {
      const filteredServices = serviceList.filter(
        (service) => service.departmentId == departmentId
      );
      whereConditions.serviceSlug = {
        [Op.in]: filteredServices.map((service) => service.slug),
      };
    }

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

    const results = await transactionDetailsModel.findAll({
      where: whereConditions,
      attributes: [
        "customerId",
        "applicationId",
        "serviceSlug",
        "transactionId",
        "transactionAmount",
        "transactionReceipt",
        "createdDate",
        "updateDate",
      ],
    });
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchDeptAndRvnData = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  try {
    if (searchQuery) {
      serviceList = serviceList.filter((service) =>
        service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const whereConditions = {
      transactionStatus: "1",
      serviceSlug: {
        [Op.in]: serviceList.map((service) => service.slug),
      },
    };

    if (departmentId) {
      const filteredServices = serviceList.filter(
        (service) => service.departmentId == departmentId
      );
      whereConditions.serviceSlug = {
        [Op.in]: filteredServices.map((service) => service.slug),
      };
    }

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

    const results = await transactionDetailsModel.findAll({
      where: whereConditions,
      attributes: [
        "customerId",
        "applicationId",
        "serviceSlug",
        "transactionId",
        "transactionAmount",
        "transactionReceipt",
        "createdDate",
        "updateDate",
      ],
    });
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

const structureRevenueData = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  const paymentDetails = await fetchPaymentDetails(
    serviceList,
    departmentList,
    departmentId,
    dateRangeOption,
    searchQuery,
    dateRange
  );

  let whereClause = {
    isDeleted: "0",
  };

  // Initialize a structure to hold department-wise data
  const departmentWiseData = {};

  // Process payment details to structure data as required
  paymentDetails.forEach((payment) => {
    const { serviceSlug, transactionAmount } = payment;
    const service = serviceList.find((service) => service.slug === serviceSlug);

    if (service) {
      const { departmentId, serviceName } = service;

      // Initialize department if not already present
      if (!departmentWiseData[departmentId]) {
        departmentWiseData[departmentId] = {
          departmentId: departmentId,
          totalRevenueDepartment: 0,
          serviceList: [],
        };
      }

      // Check if the service already exists under the department
      const existingService = departmentWiseData[departmentId].serviceList.find(
        (serv) => serv.serviceName == serviceName
      );
      if (existingService) {
        // Add to existing service's revenue
        existingService.totalRevenueService += parseFloat(transactionAmount);
      } else {
        // Add new service to the department
        departmentWiseData[departmentId].serviceList.push({
          serviceName: serviceName,
          serviceSlug: serviceSlug,
          totalRevenueService: parseFloat(transactionAmount),
        });
      }

      // Update department's total revenue
      departmentWiseData[departmentId].totalRevenueDepartment +=
        parseFloat(transactionAmount);
    }
  });

  // Convert serviceList to combined structure and add departmentName
  const combinedData = Object.values(departmentWiseData).map((department) => {
    const combinedServices = {};
    department.serviceList.forEach((service) => {
      if (!combinedServices[service.serviceName]) {
        combinedServices[service.serviceName] = {
          serviceName: service.serviceName,
          serviceSlug: service.serviceSlug,
          totalRevenueService: 0,
        };
      }
      combinedServices[service.serviceName].totalRevenueService +=
        service.totalRevenueService;
    });

    // Find department name from departmentList
    const departmentInfo = departmentList.find(
      (dept) => dept.id == department.departmentId
    );
    return {
      departmentId: department.departmentId,
      departmentName: departmentInfo
        ? departmentInfo.departmentName
        : "Unknown",
      totalRevenueDepartment: department.totalRevenueDepartment,
      serviceList: Object.values(combinedServices),
    };
  });

  return combinedData;
};

const structureDeptAndRvnData = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  const paymentDetails = await fetchDeptAndRvnData(
    serviceList,
    departmentList,
    departmentId,
    dateRangeOption,
    searchQuery,
    dateRange
  );

  let whereClause = {
    isDeleted: "0",
  };

  // Initialize a structure to hold department-wise data
  const departmentWiseData = {};

  // Process payment details to structure data as required
  paymentDetails.forEach((payment) => {
    const { serviceSlug, transactionAmount } = payment;
    const service = serviceList.find((service) => service.slug === serviceSlug);

    if (service) {
      const { departmentId, serviceName } = service;

      // Initialize department if not already present
      if (!departmentWiseData[departmentId]) {
        departmentWiseData[departmentId] = {
          departmentId: departmentId,
          totalRevenueDepartment: 0,
          serviceList: [],
        };
      }

      // Check if the service already exists under the department
      const existingService = departmentWiseData[departmentId].serviceList.find(
        (serv) => serv.serviceName === serviceName
      );
      if (existingService) {
        // Add to existing service's revenue
        existingService.totalRevenueService += parseFloat(transactionAmount);
      } else {
        // Add new service to the department
        departmentWiseData[departmentId].serviceList.push({
          serviceName: serviceName,
          serviceSlug: serviceSlug,
          totalRevenueService: parseFloat(transactionAmount),
        });
      }

      // Update department's total revenue
      departmentWiseData[departmentId].totalRevenueDepartment +=
        parseFloat(transactionAmount);
    }
  });

  // Convert serviceList to combined structure and add departmentName
  const combinedData = Object.values(departmentWiseData).map((department) => {
    const combinedServices = {};
    department.serviceList.forEach((service) => {
      if (!combinedServices[service.serviceName]) {
        combinedServices[service.serviceName] = {
          serviceName: service.serviceName,
          serviceSlug: service.serviceSlug,
          totalRevenueService: 0,
        };
      }
      combinedServices[service.serviceName].totalRevenueService +=
        service.totalRevenueService;
    });

    // Find department name from departmentList
    const departmentInfo = departmentList.find(
      (dept) => dept.id == department.departmentId
    );
    return {
      departmentId: department.departmentId,
      departmentName: departmentInfo
        ? departmentInfo.departmentName
        : "Unknown",
      totalRevenueDepartment: department.totalRevenueDepartment,
      serviceList: Object.values(combinedServices),
    };
  });

  return combinedData;
};

const departmentWiseRevenueReport = async (reqBody) => {
  const { departmentId, dateRangeOption, searchQuery, dateRange } = reqBody;

  try {
    const [departmentData, serviceData, customerData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      // fetchDepartmentData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
      // fetchServiceData(),
      axios.post(
        `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/customerList`
      ),
      // fetchCustomerData(),
    ]);

    const serviceList = serviceData.data.data.rows;
    // const serviceList = serviceData;

    const departmentList = departmentData.data.data.rows;
    // const departmentList = departmentData;

    const finalData = await structureRevenueData(
      serviceList,
      departmentList,
      departmentId,
      dateRangeOption,
      searchQuery,
      dateRange
    );
    return finalData;
  } catch (error) {
    throw new Error(error);
  }
};

const transactionReport = async (reqBody) => {
  const { serviceSlug, searchQuery, dateRange, page = 1, perPage = 25, status } = reqBody;
 
  try {
    const actualPage = parseInt(page, 10);
    const actualPerPage = parseInt(perPage, 10);
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {
      transactionStatus: "1",
      serviceSlug,
    };

    // Handle date range filter
    if (dateRange?.startDate && dateRange?.endDate) {
      whereClause.createdDate = { 
        [Op.between]: [
          new Date(dateRange.startDate), 
          new Date(dateRange.endDate).setHours(23, 59, 59, 999)
        ] 
      };
    }

    // Handle status filter
    if (status) {
      try {
        const response = await axios.post(
          `${process.env.BUSINESSLICENSESERVICE}/application/revenueApplicationStatus`,
          { data: { slug: serviceSlug, status } }
        );
        const applicationIds = (response?.data?.data?.rows || []).map(app => app.applicationId);
        if (!applicationIds.length) return { rows: [], count: 0 };
        whereClause.applicationId = { [Op.in]: applicationIds };
      } catch (error) {
        console.error("Error fetching applications by status:", error.message);
        throw new Error("Failed to fetch application data");
      }
    }

    // Handle search query
    if (searchQuery) {
      if (searchQuery.startsWith('pi_')) {
        whereClause.transactionId = searchQuery;
      } else {
        try {
          const customerResponse = await axios.post(
            `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/revenueCustomerList`,
            { data: { searchQuery } }
          );
          const customerIds = (customerResponse?.data?.data?.rows || []).map(customer => customer.id);
          if (!customerIds.length) return { rows: [], count: 0 };
          whereClause.customerId = { [Op.in]: customerIds };
        } catch (error) {
          console.error("Error fetching customer data:", error.message);
          throw new Error("Failed to fetch customer data");
        }
      }
    }

    // Get total count and fetch paginated transactions simultaneously
    const [totalCount, transactions] = await Promise.all([
      transactionDetailsModel.count({ where: whereClause }),
      transactionDetailsModel.findAll({
        where: whereClause,
        attributes: [
          "customerId", "applicationId", "serviceSlug", "transactionId",
          "transactionStatus", "transactionAmount", "transactionReceipt",
          "createdDate", "updateDate"
        ],
        order: [["createdDate", "DESC"]],
        limit: actualPerPage,
        offset: offset,
      })
    ]);

    // Prepare unique IDs for bulk fetching
    const customerIds = [...new Set(transactions.map(t => t.customerId))];
    const applicationIds = [...new Set(transactions.map(t => t.applicationId))];

    // Fetch customer and application data simultaneously
    const [customerList, applicationData] = await Promise.all([
      customerIds.length ? axios.post(
        `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/revenueCustomerList`,
        { data: { customerIds } }
      ).then(response => response?.data?.data?.rows || [])
        .catch(error => {
          console.error("Error fetching customer data:", error.message);
          return [];
        }) : [],
      applicationIds.length ? axios.post(
        `${process.env.BUSINESSLICENSESERVICE}/application/revenueApplicationStatus`,
        { data: { slug: serviceSlug, applicationIds } }
      ).then(response => response?.data?.data?.rows || [])
        .catch(error => {
          console.error("Error fetching applications:", error.message);
          return [];
        }) : []
    ]);

    // Combine all data
    const result = transactions.map(transaction => {
      const application = applicationData.find(app => app.applicationId === transaction.applicationId);
      const customer = customerList.find(cust => cust.id === transaction.customerId);

      return {
        ...transaction.toJSON(),
        status: application?.status,
        customer: customer ? {
          id: customer.id,
          firstName: customer.firstName,
          middleName: customer.middleName,
          lastName: customer.lastName,
          nibNumber: customer.nibNumber,
        } : null,
      };
    });

    return { rows: result, count: totalCount };

  } catch (error) {
    console.error("Error in transactionReport:", error.message);
    throw new Error("Failed to generate transaction report");
  }
};

const serviceRevenue = async (departmentId, dateRangeOption, dateRange) => {
  try {
    // Fetch services list
    let serviceList = [];
    try {
      const serviceData = await //  fetchServiceData();
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`);
      serviceList = serviceData.data.data.rows;
      // serviceList = serviceData;
    } catch (error) {
      console.error("Error fetching service list:", error);
      return;
    }

    // Filter services based on departmentId and remove duplicates based on slug
    const uniqueServices = serviceList
      .filter((service) => service.departmentId == departmentId)
      .reduce((acc, current) => {
        const x = acc.find((item) => item.slug === current.slug);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

    // Prepare the list of service slugs
    const serviceSlugs = uniqueServices.map((service) => service.slug);

    // Fetch transactions for the filtered service slugs
    let whereClause = {
      transactionStatus: "1",
      serviceSlug: {
        [Sequelize.Op.in]: serviceSlugs,
      },
    };
    if (dateRangeOption) {
      const { startDate, endDate } =
        calculateDateRangeMonthwise(dateRangeOption);
      if (startDate && endDate) {
        whereClause.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }
    if (!dateRangeOption && dateRange?.startDate && dateRange?.endDate) {
      whereClause.createdDate = {
        [Op.between]: [
          new Date(dateRange.startDate), 
          new Date(dateRange.endDate).setHours(23, 59, 59, 999)
        ] 
      };
    }
    const allResults = await transactionDetailsModel.findAll({
      where: whereClause,
    });

    // Initialize revenue by month
    const revenueByMonth = Array.from({ length: 12 }, () => ({
      serviceCount: 0,
      revenue: 0,
    }));

    // Calculate monthly revenue
    allResults.forEach((transaction) => {
      const date = new Date(transaction.createdDate);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", transaction.createdDate);
        return;
      }
      const month = date.getMonth(); // 0-11 for Jan-Dec
      const amount = parseFloat(transaction.transactionAmount) || 0; // Convert to number
      revenueByMonth[month].serviceCount += 1;
      revenueByMonth[month].revenue += amount; // Sum up revenue
    });

    // Format the result
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = revenueByMonth.map((data, index) => ({
      month: monthNames[index],
      serviceCount: data.serviceCount,
      revenue: parseFloat(data.revenue.toFixed(2)) || 0, // Ensure revenue is a number and formatted to 2 decimal places
    }));

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const maximumRevenueReport = async (reqBody) => {
  const { departmentId, dateRangeOption, dateRange } = reqBody;

  try {
    const [departmentData, serviceData, customerData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      // fetchDepartmentData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
      // fetchServiceData(),
      axios.post(
        `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/customerList`
      ),
      // fetchCustomerData(),
    ]);

    const serviceList = serviceData.data.data.rows;
    // const serviceList = serviceData;

    const departmentList = departmentData.data.data.rows;
    // const departmentList = departmentData;

    const finalData = await structureDeptAndRvnData(
      serviceList,
      departmentList,
      departmentId,
      dateRangeOption,
      "",
      dateRange
    );

    let maxRevenueService = { totalRevenueService: 0 };
    let departmentWithMaxService;

    finalData.forEach((department) => {
      // Find the service with the maximum revenue in the current department
      let maxRevenueInDepartment = { totalRevenueService: 0 };
      let serviceWithMaxRevenue;

      department.serviceList.forEach((service) => {
        if (
          service.totalRevenueService >
          maxRevenueInDepartment.totalRevenueService
        ) {
          maxRevenueInDepartment = service;
          serviceWithMaxRevenue = service;
        }
      });

      // Update department with the overall maximum revenue service
      if (
        serviceWithMaxRevenue &&
        serviceWithMaxRevenue.totalRevenueService >
          maxRevenueService.totalRevenueService
      ) {
        maxRevenueService = serviceWithMaxRevenue;
        departmentWithMaxService = {
          ...department,
          serviceWithMaxRevenue,
        };
      }
    });

    return departmentWithMaxService ? [departmentWithMaxService] : [];
  } catch (error) {
    throw new Error(error);
  }
};

const totalRevenueReport = async (reqBody) => {
  const { departmentId, dateRangeOption, searchQuery, dateRange } = reqBody;

  try {
    const [departmentData, serviceData, customerData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      // fetchDepartmentData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
      // fetchServiceData(),
      axios.post(
        `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/customerList`
      ),
      // fetchCustomerData(),
    ]);

    const serviceList = serviceData.data.data.rows;
    // const serviceList = serviceData;

    const departmentList = departmentData.data.data.rows;
    // const departmentList = departmentData;

    const finalData = await structureDeptAndRvnData(
      serviceList,
      departmentList,
      departmentId,
      dateRangeOption,
      searchQuery,
      dateRange
    );

    const totalRevenue = finalData.reduce(
      (sum, department) => sum + department.totalRevenueDepartment,
      0
    );

    return { totalRevenue, data: finalData };
  } catch (error) {
    throw new Error(error);
  }
};

const serviceVSRevenueData = async (reqBody) => {
  try {
    const { dateRangeOption, dateRange } = reqBody.data;

    let whereClause = {
      transactionStatus: "1",
    };

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    } else if (dateRangeOption) {
      const { startDate, endDate } =
        calculateDateRangeMonthwise(dateRangeOption);
      if (startDate && endDate) {
        whereClause.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }

    const allResults = await transactionDetailsModel.findAll({
      where: whereClause,
      attributes: [
        "applicationId",
        "serviceSlug",
        "transactionStatus",
        "transactionAmount",
        "createdDate",
        "updateDate",
      ],
    });

    const [serviceData] = await Promise.all([
      // fetchServiceData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
    ]);

    function summarizeData(serviceVSRevenueList, allResult) {
      const summary = {};

      function getKey(slug) {
        return `${slug}`;
      }

      serviceVSRevenueList.forEach((item) => {
        const key = getKey(item.slug);
        if (!summary[key]) {
          summary[key] = {
            departmentId: item.departmentId,
            departmentName: item.departmentName,
            serviceName: item.serviceName,
            totalRevenueService: 0,
            applicationCount: 0,
          };
        }
      });

      allResult.forEach((item) => {
        const key = getKey(item.serviceSlug);
        if (summary[key]) {
          summary[key].applicationCount++;
          summary[key].totalRevenueService += parseFloat(
            item.transactionAmount
          );
        } else {
          summary[key] = {
            departmentId: null,
            departmentName: null,
            serviceName: item.serviceName,
            totalRevenueService: parseFloat(item.transactionAmount),
            applicationCount: 1,
          };
        }
      });

      return Object.values(summary).filter(
        (entry) =>
          entry.departmentId !== null && entry.totalRevenueService !== null
      );
    }

    const result = summarizeData(serviceData.data.data.rows, allResults);
    // const result = summarizeData(serviceData, allResults);

    const filteredResult = result.filter((item) => item.applicationCount > 0);

    return filteredResult;
  } catch (error) {
    throw new Error(error);
  }
};

const ApplicationtransactionReport = async (reqBody) => {
  const {
    serviceSlug,
    searchQuery,
    dateRange,
    page,
    perPage,
    status,
  } = reqBody;
  try {
    const actualPage = parseInt(page, 10);
    const actualPerPage = parseInt(perPage, 10);
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {
      transactionStatus: "1",
      serviceSlug,
    };

    // Handle date range filter
    if (dateRange?.startDate && dateRange?.endDate) {
      whereClause.createdDate = { 
        [Op.between]: [
          new Date(dateRange.startDate), 
          new Date(dateRange.endDate).setHours(23, 59, 59, 999)
        ] 
      };
    }

    // Handle status filter
    if (status) {
      try {
        const response = await axios.post(
          `${process.env.BUSINESSLICENSESERVICE}/application/revenueApplicationStatus`,
          { data: { slug: serviceSlug, status } }
        );
        const applicationIds = (response?.data?.data?.rows || []).map(app => app.applicationId);
        if (!applicationIds.length) return { rows: [], count: 0 };
        whereClause.applicationId = { [Op.in]: applicationIds };
      } catch (error) {
        console.error("Error fetching applications by status:", error.message);
        throw new Error("Failed to fetch application data");
      }
    }

    // Handle search query
    if (searchQuery) {
      if (searchQuery.startsWith('pi_')) {
        whereClause.transactionId = searchQuery;
      } else {
        try {
          const customerResponse = await axios.post(
            `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/revenueCustomerList`,
            { data: { searchQuery } }
          );
          const customerIds = (customerResponse?.data?.data?.rows || []).map(customer => customer.id);
          if (!customerIds.length) return { rows: [], count: 0 };
          whereClause.customerId = { [Op.in]: customerIds };
        } catch (error) {
          console.error("Error fetching customer data:", error.message);
          throw new Error("Failed to fetch customer data");
        }
      }
    }

    // Get total count and fetch paginated transactions simultaneously
    const [totalCount, transactions] = await Promise.all([
      transactionDetailsModel.count({ where: whereClause }),
      transactionDetailsModel.findAll({
        where: whereClause,
        attributes: [
          "customerId", "applicationId", "serviceSlug", "transactionId",
          "transactionStatus", "transactionAmount", "transactionReceipt",
          "createdDate", "updateDate"
        ],
        order: [["createdDate", "DESC"]],
        limit: actualPerPage,
        offset: offset,
      })
    ]);

    // Prepare unique IDs for bulk fetching
    const customerIds = [...new Set(transactions.map(t => t.customerId))];
    const applicationIds = [...new Set(transactions.map(t => t.applicationId))];

    // Fetch customer and application data simultaneously
    const [serviceData, customerList, applicationData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/getById`, {data: {slug: serviceSlug}}).then(response => response?.data?.data || {})
      .catch(error => {
        console.error("Error fetching service data:", error.message);
        return [];
      }),
      customerIds.length ? axios.post(
        `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/revenueCustomerList`,
        { data: { customerIds } }
      ).then(response => response?.data?.data?.rows || [])
        .catch(error => {
          console.error("Error fetching customer data:", error.message);
          return [];
        }) : [],
      applicationIds.length ? axios.post(
        `${process.env.BUSINESSLICENSESERVICE}/application/revenueApplicationStatus`,
        { data: { slug: serviceSlug, applicationIds } }
      ).then(response => response?.data?.data?.rows || [])
        .catch(error => {
          console.error("Error fetching applications:", error.message);
          return [];
        }) : []
    ]);
    
    // Combine all data
    const result = transactions.map(transaction => {
      const application = applicationData.find(app => app.applicationId === transaction.applicationId);
      const customer = customerList.find(cust => cust.id === transaction.customerId);

      return {
        ...transaction.toJSON(),
        customer: customer ? {
          id: customer.id,
          firstName: customer.firstName,
          middleName: customer.middleName,
          lastName: customer.lastName,
          nibNumber: customer.nibNumber,
        } : null,
        serviceName: serviceData ? serviceData?.serviceName : null,
        departmentName: serviceData ? serviceData?.departmentName : null,
        applicationStatus: application ? application?.status : null,
      };
    });

    return { rows: result, count: totalCount };

  } catch (error) {
    console.error("Error in transactionReport:", error.message);
    throw new Error("Failed to generate transaction report");
  }
};

const exportTransactionDetailToExcel = async (reqBody) => {
  try {
    const { customerId, startDate, endDate, fileName, page, limit } = reqBody;

    const { count, rows } = await getTransactionDetailsService({
      customerId,
      startDate,
      endDate,
      page,
      limit
    });

    if (!rows || rows.length === 0) {
      return { message: "No data found to export." };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payment Details");

    worksheet.columns = [
      { header: "Application ID", key: "ApplicationID", width: 20 },
      { header: "Transaction ID", key: "transactionId", width: 25 },
      { header: "Date / Time", key: "createdDate", width: 20 },
      { header: "Application Name", key: "serviceName", width: 30 },
      { header: "Department", key: "departmentName", width: 30 },
      {
        header: "Transaction Status",
        key: "transactionStatus",
        width: 20,
      },
      {
        header: "Transaction Amount",
        key: "transactionAmount",
        width: 20,
      },
    ];

    const transactionStatusMap = {
      0: "Pending",
      1: "Success",
      2: "Failed",
      3: "Refund",
    };

    rows.forEach((row) => {
      worksheet.addRow({
        ApplicationID: row.transaction?.applicationId || "-",
        transactionId: row.transaction?.transactionId || "-",
        createdDate: row.transaction?.createdDate || "-",
        serviceName: row.findServicesBySlug?.serviceName || "-",
        departmentName: row.findDepartmentName?.departmentName || "-",
        transactionStatus:
          transactionStatusMap[row.transaction?.transactionStatus] || "-",
        transactionAmount: row.transaction?.transactionAmount || "-",
      });
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
    const filePath = process.env.EXPORT_TRANSACTIONDETAIL_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);
    return filePath;
  } catch (error) {
    console.error("Failed to export transaction report to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const exportTransactionReportToExcel = async (reqBody) => {
  try {
    const { fileName } = reqBody;

    const { rows } = await ApplicationtransactionReport(reqBody);

    if (!rows || rows.length === 0) {
      return { message: "No data found to export." };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transaction Report");

    const transactionStatusMap = {
      0: "Pending",
      1: "Success",
      2: "Failed",
      3: "Refund",
    };

    const applicationStatusMap = {
      0: "Incomplete",
      1: "Pending",
      2: "Inprogress",
      3: "Check & Verified",
      4: "Auto Pay",
      5: "Approve",
      6: "Reject",
      7: "Shipped",
    };

    worksheet.addRow([
      "Application ID",
      "Transaction Amount",
      "Transaction Receipt",
      "Service Name",
      "Customer Name",
      "Department Name",
      "Transaction Id",
      "Transaction Status",
      "Application Status",
      "Transaction Date",
    ]);
    worksheet.addRow([]);

    rows.forEach((row) => {
      const transactionStatus =
        transactionStatusMap[row.transactionStatus] || "";
      const applicationStatus = row.applicationStatus
        ? applicationStatusMap[row.applicationStatus]
        : "";

      worksheet.addRow([
        row.applicationId || "",
        row.transactionAmount || "",
        row.transactionReceipt || "",
        row.serviceName || "",
        row.customer
          ? `${row.customer.firstName || ""} ${row.customer.middleName || ""} ${
              row.customer.lastName || ""
            }`
          : "",
        row.departmentName || "",
        row.transactionId || "",
        transactionStatus,
        applicationStatus,
        row.createdDate ? row.createdDate.toISOString().split("T")[0] : "",
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
    const filePath = process.env.EXPORT_TXN_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export transaction report to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const generateHTMLContent = (rows) => {
  const rowsHtml = rows
    .map((row) => {
      const transactionStatusMap = {
        0: "Pending",
        1: "Success",
        2: "Failed",
        3: "Refund",
      };
      const transactionStatus =
        transactionStatusMap[row.transactionStatus] || "";

      const applicationStatusMap = {
          0: "Incomplete",
          1: "Pending",
          2: "Inprogress",
          3: "Check & Verified",
          4: "Auto Pay",
          5: "Approve",
          6: "Reject",
          7: "Shipped",
      };
      
      const applicationStatus = row.applicationStatus
        ? applicationStatusMap[row.applicationStatus]
        : "";

      return `
            <tr>
                <td>${row.applicationId || ""}</td>
                <td>${row.transactionAmount || ""}</td>
                <td>${row.transactionReceipt || ""}</td>
                <td>${row.serviceName || ""}</td>
                <td>${
                  row.customer
                    ? `${row.customer.firstName || ""} ${
                        row.customer.middleName || ""
                      } ${row.customer.lastName || ""}`
                    : ""
                }</td>
                <td>${row.departmentName || ""}</td>
                <td>${row.transactionId}</td>
                <td>${transactionStatus}</td>
                <td>${applicationStatus}</td>
                <td>${
                  row.createdDate
                    ? row.createdDate.toISOString().split("T")[0]
                    : ""
                }</td>
            </tr>
        `;
    })
    .join("");

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>Application Transaction Report</h2>
            <table>
                <tr>
                    <th>Application ID</th>
                    <th>Transaction Amount</th>
                    <th>Transaction Receipt</th>
                    <th>Service Name</th>
                    <th>Customer Name</th>
                    <th>Department Name</th>
                    <th>Transaction Id</th>
                    <th>Transaction Status</th>
                    <th>Application Status</th>
                    <th>Transaction Date</th>
                </tr>
                ${rowsHtml}
            </table>
        </body>
        </html>
    `;
};

const exportTransactionReportToPDF = async (reqBody, req) => {
  try {
    const { fileName } = reqBody;

    const { rows } = await ApplicationtransactionReport(reqBody);

    if (!rows || rows.length === 0) {
      return { message: "No data found to export." };
    }

    const htmlContent = generateHTMLContent(rows);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: "tabloid" });
    await browser.close();

    const insertPath = path.join(setting.PROJECT_DIR, "public");

    if (!fs.existsSync(insertPath)) {
      fs.mkdirSync(insertPath, { recursive: true });
    }

    const filePathInsert = path.join(insertPath, fileName);
    const filePath = process.env.TXN_PDF + fileName;

    fs.writeFileSync(filePathInsert, pdfBuffer);

    return filePath;
  } catch (error) {
    console.error("Failed to export transaction report to PDF:", error);
    throw new Error("Export to PDF failed");
  }
};

const exportDepartmentReportToExcel = async (reqBody) => {
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

    const rows = await departmentWiseRevenueReport(reqBody);

    if (!rows || rows.length === 0) {
      return { message: "No data found to export." };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transaction Report");

    worksheet.addRow(["Department", "Total Revenue"]);
    worksheet.addRow([]);

    rows.forEach((row) => {
      worksheet.addRow([row.departmentName, row.totalRevenueDepartment]);

      worksheet.addRow(["Services", "Total Revenue"]);

      row.serviceList.forEach((service) => {
        worksheet.addRow([service.serviceName, service.totalRevenueService]);
      });

      worksheet.addRow([]);
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
    const filePath = process.env.EXPORT_DEPT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
  } catch (error) {
    console.error("Failed to export transaction report to Excel:", error);
    throw new Error("Export to Excel failed");
  }
};

const generateDepartmentReportHTMLContent = (rows) => {
  const rowsHtml = rows
    .map((row) => {
      let departmentHtml = `
            <tr>
                <td colspan="3"><strong>${
                  row.departmentName || ""
                }</strong></td>
                <td colspan="6"><strong>Total Revenue: ${
                  row.totalRevenueDepartment || ""
                }</strong></td>
            </tr>
        `;

      const servicesHtml = row.serviceList
        .map(
          (service) => `
            <tr>
                <td colspan="3"></td>
                <td>${service.serviceName || ""}</td>
                <td colspan="2">${service.totalRevenueService || ""}</td>
                <td colspan="3"></td>
            </tr>
        `
        )
        .join("");

      return departmentHtml + servicesHtml;
    })
    .join("");

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>Department and Service Revenue Report</h2>
            <table>
                <tr>
                    <th colspan="3">Department</th>
                    <th>Service Name</th>
                    <th colspan="2">Total Revenue</th>
                    <th colspan="3"></th>
                </tr>
                ${rowsHtml}
            </table>
        </body>
        </html>
    `;
};

const exportDepartmentReportToPDF = async (reqBody, req) => {
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

    const rows = await departmentWiseRevenueReport(reqBody);

    if (!rows || rows.length === 0) {
      return { message: "No data found to export." };
    }

    const htmlContent = generateDepartmentReportHTMLContent(rows);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    const insertPath = path.join(setting.PROJECT_DIR, "public");

    if (!fs.existsSync(insertPath)) {
      fs.mkdirSync(insertPath, { recursive: true });
    }

    const filePathInsert = path.join(insertPath, fileName);
    const filePath = process.env.EXPORT_DEPT_PDF + fileName;

    fs.writeFileSync(filePathInsert, pdfBuffer);

    return filePath;
  } catch (error) {
    console.error("Failed to export transaction report to PDF:", error);
    throw new Error("Export to PDF failed");
  }
};

const fetchPaymentDetailsForDashBoard = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  try {
    if (searchQuery) {
      serviceList = serviceList.filter((service) =>
        service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const whereConditions = {
      transactionStatus: "1",
      serviceSlug: {
        [Op.in]: serviceList.map((service) => service.slug),
      },
    };

    if (departmentId) {
      const filteredServices = serviceList.filter(
        (service) => service.departmentId == departmentId
      );
      whereConditions.serviceSlug = {
        [Op.in]: filteredServices.map((service) => service.slug),
      };
    }

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereConditions.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (dateRangeOption) {
      const { startDate, endDate } =
        calculateDateRangeMonthwise(dateRangeOption);
      if (startDate && endDate) {
        whereConditions.createdDate = {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        };
      }
    }

    const results = await transactionDetailsModel.findAll({
      where: whereConditions,
      attributes: [
        "customerId",
        "applicationId",
        "serviceSlug",
        "transactionId",
        "transactionAmount",
        "transactionReceipt",
        "createdDate",
        "updateDate",
      ],
    });
    return results;
  } catch (error) {
    throw new Error(error);
  }
};

const structuredRevenueDataForDashBoard = async (
  serviceList,
  departmentList,
  departmentId,
  dateRangeOption,
  searchQuery,
  dateRange
) => {
  const paymentDetails = await fetchPaymentDetailsForDashBoard(
    serviceList,
    departmentList,
    departmentId,
    dateRangeOption,
    searchQuery,
    dateRange
  );

  let whereClause = {
    isDeleted: "0",
  };

  const departmentWiseData = {};

  paymentDetails.forEach((payment) => {
    const { serviceSlug, transactionAmount } = payment;
    const service = serviceList.find((service) => service.slug === serviceSlug);

    if (service) {
      const { departmentId, serviceName } = service;

      if (!departmentWiseData[departmentId]) {
        departmentWiseData[departmentId] = {
          departmentId: departmentId,
          totalRevenueDepartment: 0,
          serviceList: [],
        };
      }

      const existingService = departmentWiseData[departmentId].serviceList.find(
        (serv) => serv.serviceName === serviceName
      );
      if (existingService) {
        existingService.totalRevenueService += parseFloat(transactionAmount);
      } else {
        departmentWiseData[departmentId].serviceList.push({
          serviceName: serviceName,
          serviceSlug: serviceSlug,
          totalRevenueService: parseFloat(transactionAmount),
        });
      }

      departmentWiseData[departmentId].totalRevenueDepartment +=
        parseFloat(transactionAmount);
    }
  });

  const combinedData = Object.values(departmentWiseData).map((department) => {
    const combinedServices = {};
    department.serviceList.forEach((service) => {
      if (!combinedServices[service.serviceName]) {
        combinedServices[service.serviceName] = {
          serviceName: service.serviceName,
          serviceSlug: service.serviceSlug,
          totalRevenueService: 0,
        };
      }
      combinedServices[service.serviceName].totalRevenueService +=
        service.totalRevenueService;
    });

    const departmentInfo = departmentList.find(
      (dept) => dept.id == department.departmentId
    );

    return {
      departmentId: department.departmentId,
      departmentName: departmentInfo
        ? departmentInfo.departmentName
        : "Unknown",
      totalRevenueDepartment: department.totalRevenueDepartment,
      serviceList: Object.values(combinedServices),
    };
  });

  return combinedData;
};

const revenueReportForDashboard = async (reqBody) => {
  const { departmentId, dateRangeOption, searchQuery, dateRange } = reqBody;

  try {
    const [departmentData, serviceData, customerData] = await Promise.all([
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/department/list`),
      // fetchDepartmentData(),

      // fetchServiceData(),
      axios.post(`${process.env.SERVICE_MANAGEMENT_URL}/service/list`),
      // fetchCustomerData(),
    ]);

    // const serviceList = serviceData;
    const serviceList = serviceData.data.data.rows;
    // const departmentList = departmentData;

    const departmentList = departmentData.data.data.rows;

    const finalData = await structuredRevenueDataForDashBoard(
      serviceList,
      departmentList,
      departmentId,
      dateRangeOption,
      searchQuery,
      dateRange
    );
    return finalData;
  } catch (error) {
    throw new Error(error);
  }
};

const seenStatusUpdate = async (recordIds,customerId) => {
  try {
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      throw new Error('Invalid or empty recordIds array provided.');
    }
    // Update the seenStatus for the provided IDs
    const [result] = await transactionDetailsModel.update(
      { seenStatus: "1" },
      {
        where: {
          id: recordIds,
          customerId:customerId,
        },
      }
    );

    return result
  } catch (error) {
    console.error('Error updating seen status:', error);
    throw new Error(error.message);
  }
};


module.exports = {
  createCustomerPaymentDetailsService,
  getCustomerPaymentDetailsService,
  getCardInfoStripe,
  addCardInfo,
  deleteCardInfo,
  setDefaultPaymentMethod,
  createTransactionDetails,
  getTransactionDetailsService,
  departmentWiseRevenueReport,
  transactionReport,
  serviceRevenue,
  maximumRevenueReport,
  totalRevenueReport,
  serviceVSRevenueData,
  ApplicationtransactionReport,
  exportTransactionReportToExcel,
  exportTransactionReportToPDF,
  exportDepartmentReportToExcel,
  exportDepartmentReportToPDF,
  revenueReportForDashboard,
  exportTransactionDetailToExcel,
  fetchDeptAndRvnData,
  structureDeptAndRvnData,
  seenStatusUpdate
};
