const {
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
  countReport,
  serviceVSRevenueData,
  ApplicationtransactionReport,
  exportTransactionReportToExcel,
  exportTransactionReportToPDF,
  exportDepartmentReportToExcel,
  exportDepartmentReportToPDF,
  revenueReportForDashboard,
  exportTransactionDetailToExcel,
  seenStatusUpdate,
} = require("../services/customerDetails.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const {
  marriageCertificateApplicationMail,
  birthCertificateApplicationMail,
  deathCertificateApplicationMail,
} = require("../utils/mail/notificationMail");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { default: axios } = require("axios");
const os = require("os");
const fs = require("fs");
const path = require("path");
const setting = require("../../setting");
const {
  customerPaymentDetailsModel,
  transactionDetailsModel,
} = require("../models");

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

const createCustomerPaymentDetails = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId, customerName, customerEmail } = reqBody;
    if (!customerId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.CUSTOMER_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }
    const customerStripe = await stripe.customers.create({
      name: customerName,
      email: customerEmail,
    });

    const result = await createCustomerPaymentDetailsService(
      customerId,
      customerStripe?.id
    );

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.ADDED_SUCCESS,
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getCustomerPaymentDetails = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId } = reqBody;

    const result = await getCustomerPaymentDetailsService(customerId);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.FETCH_SUCCESS,
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getCustomerCardInfoStripe = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId } = reqBody;
    if (!customerId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_CUSTOMER_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }
    const result = await getCardInfoStripe(customerId);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_FETCH_SUCCESS,
        success: true,
        data: result,
      });
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "result not found",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const addCustomerCardInfo = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId, paymentMethodId } = reqBody;
    if (!customerId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_CUSTOMER_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }
    const result = await addCardInfo(customerId, paymentMethodId);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_ADDED_SUCCESS,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      error: error.message,
    });
  }
};
const deleteCustomerCardInfo = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { cardId } = reqBody;
    if (!cardId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message:
          MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_CUSTOMER_CARD_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }
    const result = await deleteCardInfo(cardId);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_DELETE_SUCCESS,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    console.error("Error fetching customer card info:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      error: error.message,
    });
  }
};
const setDefaultPayment = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId, paymentMethodId } = reqBody;

    const result = await setDefaultPaymentMethod(customerId, paymentMethodId);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.ADDED_SUCCESS,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      error: error.message,
    });
  }
};
const PaymentwithCardMethod = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
      customerId,
      paymentMethodId,
      amount,
      description,
      paymentIntentId,
    } = reqBody;

    let paymentIntent;
    if (paymentIntentId) {
      // Confirm an existing PaymentIntent (normally not needed if `confirm: true` was used during creation)
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
    } else {
      // Create and confirm a new PaymentIntent with a return_url for redirect-based payment methods
      paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: reqBody.amount,
        currency: "usd",
        payment_method: paymentMethodId,
        setup_future_usage: "off_session",
        description: description,
        confirm: true,
        confirmation_method: "automatic",
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
        return_url: `${process.env.FRONT_URL}service`, // This URL must be able to handle the customer returning
      });
    }

    if (paymentIntent.status === "requires_action") {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_ACTION_REQUIRED,
        success: true,
        requiresAction: true,
        intent: paymentIntent,
      });
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_PAYMENT_CONFIRM,
      success: true,
      intent: paymentIntent,
    });
  } catch (error) {
    return res.status(STATUS_CODES.NON_AUTHORITATIVE_INFORMATION).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_INTENT_FAILED,
      success: false,
      error: error.message,
    });
  }
};
const transactiondetails = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const {
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
    } = reqBody;

    const result = await createTransactionDetails(
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
    );

    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message:
          MESSAGES.CUSTOMER_PAYMENT_DETAILS
            .STRIPE_TRASACTION_DETAILS_ADD_SUCCESS,
        success: true,
        intent: result,
      });
    }
  } catch (error) {
    console.log("alpeshdkhgfksduhwrgb", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_INTENT_FAILED,
      success: false,
      error: error.message,
    });
  }
};

const payNowWithCard = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId, paymentMethodId, amount, paymentIntentId } = reqBody;

    let paymentIntent;
    if (paymentIntentId) {
      // Confirm an existing PaymentIntent (normally not needed if `confirm: true` was used during creation)
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
    } else {
      // Create and confirm a new PaymentIntent with a return_url for redirect-based payment methods
      paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: amount, // Amount in cents
        currency: "usd",
        payment_method: paymentMethodId,
        setup_future_usage: "off_session",
        description: "description for testing BC",
        confirm: true,
        confirmation_method: "automatic",
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
        return_url: `${process.env.FRONT_URL}service`,
      });
    }

    // Check if further action (like redirection) is needed
    if (paymentIntent.status === "requires_action") {
      // The client needs to handle the customer's next action
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_ACTION_REQUIRED,
        success: true,
        requiresAction: true,
        intent: paymentIntent,
      });
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_PAYMENT_CONFIRM,
      success: true,
      intent: paymentIntent,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_INTENT_FAILED,
      success: false,
      error: error.message,
    });
  }
};

const getTransactionDetails = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await getTransactionDetailsService(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.DETAILS_FETCH_SUCCESS,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};
const getRevenueReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await departmentWiseRevenueReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};
const getTransactionreport = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await transactionReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const getServiceRevenue = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { departmentId, dateRangeOption, dateRange } = reqBody;
    const result = await serviceRevenue(
      departmentId,
      dateRangeOption,
      dateRange
    );
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const getMaximumRevenueReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await maximumRevenueReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const getTotalRevenueReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await totalRevenueReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const getCountReport = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await countReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const serviceVSRevenueList = async (req, res) => {
  try {
    const reqBody = req.body;
    const result = await serviceVSRevenueData(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const getApplicationtransactionReport = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await ApplicationtransactionReport(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const exportTransactionReportInExcel = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await exportTransactionReportToExcel(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: { result },
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const removeReportExcel = async (req, res) => {
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

const exportTransactionReportInPDF = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await exportTransactionReportToPDF(reqBody, req);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: { result },
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const removeReportPdf = async (req, res) => {
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

//transaction detail controller
const exportTransactionDetailExcel = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await exportTransactionDetailToExcel(reqBody, req);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.TRANSACTION_DETAILS_FETCHED,
        success: true,
        data: { result },
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const exportDepartmentReportExcel = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await exportDepartmentReportToExcel(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: { result },
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const removeDepartmentReportExcel = async (req, res) => {
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

const exportDepartmentReportInPDF = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const result = await exportDepartmentReportToPDF(reqBody, req);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: { result },
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const removeDepartmentReportPdf = async (req, res) => {
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

const getRevenueReportForDashboard = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const result = await revenueReportForDashboard(reqBody);
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.REVENUE_DETAILS_FETCHED,
        success: true,
        data: result,
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: error.message,
    });
  }
};

const removeTransactionReportExcel = async (req, res) => {
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
const deleteStripeCustomer = async (req, res) => {
  try {
    const { customerStripeId, customerId } = req.body.data;

    // Validate input
    if (!customerStripeId && !customerId) {
      return res.status(400).json({
        message: "Customer Stripe ID or Customer ID is required.",
        success: false,
        data:{}
      });
    }

    // Get the stripeCustomerId if not provided
    const stripeCustomerId =
      customerStripeId ||
      (await customerPaymentDetailsModel
        .findOne({ where: { customerId } })
        .then(details => details?.stripeCustomerId));

    if (!stripeCustomerId) {
      return res.status(404).json({
        message: "Stripe customer not found.",
        success: false,
      });
    }

    // Delete the Stripe customer
    const result = await stripe.customers.del(stripeCustomerId);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.STRIPE_ACCOUNT_DELETE_SUCCESS,
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error deleting Stripe customer:", error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

const deleteCustomerData = async (req, res) => {
  const { customerId, name, email, ipAddress } = req.body.data;
  try {
    // Begin a transaction for atomicity
    const transaction =
      await customerPaymentDetailsModel.sequelize.transaction();

    try {

      // Disable foreign key checks
      await customerPaymentDetailsModel.sequelize.query(
        "SET FOREIGN_KEY_CHECKS = 0",
        { transaction }
      );

      // Delete related data from other models
      // await transactionDetailsModel.destroy({
      //   where: { customerId },
      //   transaction,
      // });

      // Delete the customer record
      await customerPaymentDetailsModel.destroy({
        where: { customerId },
        transaction,
      });

      // Re-enable foreign key checks
      await customerPaymentDetailsModel.sequelize.query(
        "SET FOREIGN_KEY_CHECKS = 1",
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      const auditLogBody = {
        recordId: customerId,
        action: `Customer ( ${name} - ${email} ) payment data deleted successfully`,
        moduleName: "Payment Service",
        newValue: JSON.stringify({
          customerId: customerId,
          name: name,
          email: email
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
        message: "Data deleted successfully",
        success: true,
        data: {},
      });
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      const auditLogBody = {
        recordId: customerId,
        action: `Customer ( ${name} - ${email} ) payment data delete failed`,
        moduleName: "Payment Service",
        newValue: JSON.stringify({
          customerId: customerId,
          name: name,
          email: email
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
        message: error.message,
        success: false,
        data: {},
      });
    }
  } catch (error) {
   
    console.error("Error initializing transaction:", error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};
const seenStatusUpdateController= async(req,res)=>{
  try {
    const reqBody = req.body.data;
    const { customerId, recordIds } = reqBody;
    if (!customerId) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.CUSTOMER_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }
    const result = await seenStatusUpdate(
      recordIds,
      customerId
    );
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER_PAYMENT_DETAILS.UPDATE_SUCCESS,
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
}

module.exports = {
  createCustomerPaymentDetails,
  getCustomerPaymentDetails,
  getCustomerCardInfoStripe,
  addCustomerCardInfo,
  deleteCustomerCardInfo,
  setDefaultPayment,
  PaymentwithCardMethod,
  transactiondetails,
  payNowWithCard,
  getTransactionDetails,
  getRevenueReport,
  getTransactionreport,
  getServiceRevenue,
  getMaximumRevenueReport,
  getTotalRevenueReport,
  getCountReport,
  serviceVSRevenueList,
  getApplicationtransactionReport,
  exportTransactionReportInExcel,
  removeReportExcel,
  exportTransactionReportInPDF,
  removeReportPdf,
  exportDepartmentReportExcel,
  removeDepartmentReportExcel,
  exportDepartmentReportInPDF,
  removeDepartmentReportPdf,
  getRevenueReportForDashboard,
  exportTransactionDetailExcel,
  removeTransactionReportExcel,
  deleteStripeCustomer,
  deleteCustomerData,
  seenStatusUpdateController
};
