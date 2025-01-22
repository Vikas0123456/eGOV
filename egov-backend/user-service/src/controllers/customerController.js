const {
  findCustomerByEmail,
  createCustomerService,
  updateCustomerById,
  setCustomerPassword,
  deleteCustomerById,
  isValidEmailCustomer,
  customerOtpUpdate,
  validateCustomerEmail,
  getCustomerInfo,
  isNIBnumberExist,
  getExistingUserandNIB,
  findCustomerByEmailAndNibnumber,
  customerupdateOTPByEmail,
  findCustomerById,
  getCustomerList,
  changeCustomerPassword,
  generateLoginSession,
  findCustomerProfileById,
  updateCustomerInfoById,
  getLoginSessionList,
  deleteSessionById,
  logoutById,
  generateCustomerLoginHistory,
  customerLogHistoryData,
  customerAndGenderData,
  getRevenueCustomerList,
  getCustomerListForAdmin,
  delinkCustomerProfileService,
  customerLinkExpireTime,
} = require("../services/customer.service");
const {
  generateHashPassword,
  decryptPassword,
} = require("../utils/commonFunctions/common");
const { generateToken } = require("../utils/jwt/jsonWebToken");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateOTP } = require("../utils/optgenerator/otpGenerator");
const {
  forgotPasswordCustomer,
  sendOTPmailCustomer,
  emailConfirmationmailCustomer,
  setPasswordwelcomemailCustomer,
  deleteAccountConfirmationCustomer,
  afterDeleteConfirmationCustomer,
  delinkMailToParentCustomer,
} = require("../utils/mail/sendMailCustomer");
const useragent = require("useragent");
const { default: axios } = require("axios");
const {
  blockedIpsModel,
  customerModel,
  emailtemplatesModel,
  addressModel,
  customerLoginSessionModel,
  feedbackModel,
  likeDislikeModel,
  logiHistoryCustomerModel,
  supportModel,
  auditLogModel,
} = require("../models");
const { Op } = require("sequelize");
const os = require("os");
const accountSid = process.env.TWILIOACCOUNTSID
const authToken =  process.env.TWILIOAUTHTOKEN
const client = require('twilio')(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIOPHONENUMBER

// Function to format and validate phone number
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber.startsWith('+')) {
    return `+91${phoneNumber}`; // Prepend +91 for Indian numbers
  }
  return phoneNumber;
};

// Function to send OTP
const sendOtp = async (phoneNumber) => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const otp = generateOTP();
  const message = `OTP for profile access is ${otp}`;

  try {
    // Send SMS
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber,
    });
    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

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
const createCustomer = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { email, firstName, nibNumber } = reqBody;

    if (email) {
      const existingCustomer = await findCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.ALREADY_EXIST,
          success: false,
          data: {},
        });
      }
    }

    if (!firstName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.NAME_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.EMAIL_NOT_ENTER,
        success: false,
        data: {},
      });
    }
    if (nibNumber) {
      const isNibNumberExist = await isNIBnumberExist(nibNumber);
      if (isNibNumberExist) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.NIB_NUMBER_EXIST,
          success: false,
          data: {},
        });
      }
    }

    let newCustomer = await createCustomerService(reqBody);

    if (newCustomer) {
      const linkExpireDateTime = new Date();
      linkExpireDateTime.setMinutes(linkExpireDateTime.getMinutes() + 15);
      await customerLinkExpireTime(newCustomer.id, linkExpireDateTime);
      const encryptCustomerId = encrypt(newCustomer.id);
      const encryptId = encryptCustomerId?.data;
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "setpassword",
        },
      });
      const fullName = `${newCustomer.firstName} ${newCustomer.middleName} ${newCustomer.lastName}`;

      let htmlTemplate = getTemplate.content
        .replace(/@@USERNAME@@/g, fullName)
        .replace(
          /@@URL@@/g,
          `<a href="${process.env.NMAIL_RESET_LINK_BASE_URL_FRONT_PORTAL}auth-password-reset-cover/${encryptId}">click here</a>`
        );
      // setPasswordwelcomemailCustomer("v1.netclues@gmail.com", htmlTemplate);
      // setPasswordwelcomemailCustomer(newCustomer?.email, htmlTemplate);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.CUSTOMER_ADDED,
        success: true,
        data: newCustomer,
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
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.body.data;
    const reqBody = req.body.data;

    if (id) {
      let updateCustomer = await updateCustomerById(id, reqBody);
      if (updateCustomer) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER.UPDATE_SUCCESS,
          success: true,
          data: updateCustomer,
        });
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.UPDATE_FAILED,
          success: false,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.NOT_FOUND,
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

const updateCustomerPassword = async (req, res) => {
  try {
    const { password, confirmPassword, customerId } = req.body.data;
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.NOT_FOUND,
        success: false,
        data: {},
      });
    }
    if (customerId) {
      const customer = await findCustomerById(customerId);
      if (customer && customer?.linkToCustomerId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.PROFILE_NOT_AUTHORIZED,
          success: false,
          data: {},
        });
      }
    }
    const linkExpirationTime = new Date(customer?.linkExpireDateTime);
    const currentTime = new Date();

    // Check if the current time is greater than the link expiration time
    const isLinkExpired = currentTime > linkExpirationTime;

    if (isLinkExpired) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.INVALID_LINK,
        success: false,
        data: {},
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.PASS_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.PASSWORD_FORMATE_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Hash and update password
    const newPassword = await generateHashPassword(password);
    if (customerId) {
      await setCustomerPassword(newPassword, customerId);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.PASSWORD_UPDATE,
        success: true,
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

const resetCustomerPasswordByEmail = async (req, res) => {
  try {
    const { email, customerID } = req.body.data;
    let customer;
    if (email) {
      customer = await findCustomerByEmailAndNibnumber(email);
    } else {
      customer = await findCustomerById(customerID);
    }
    const customerId = customer?.id;
    if (!customer) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.EMAIL_NOT_REGISTER,
        success: false,
        data: {},
      });
    }
    if (customer && customer?.linkToCustomerId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.PROFILE_NOT_AUTHORIZED,
        success: false,
        data: {},
      });
    }
    const linkExpireDateTime = new Date();
    linkExpireDateTime.setMinutes(linkExpireDateTime.getMinutes() + 15);
    await customerLinkExpireTime(customerId, linkExpireDateTime);
    const encryptCustomerId = encrypt(customerId);
    const encryptId = encryptCustomerId?.data;
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "forgotpassword",
      },
    });
    const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

    let htmlTemplate = getTemplate.content
      .replace(/@@USERNAME@@/g, fullName)
      .replace(
        /@@URL@@/g,
        `<a href="${process.env.NMAIL_RESET_LINK_BASE_URL_FRONT_PORTAL}auth-password-reset-cover/${encryptId}">click here</a>`
      );

    // forgotPasswordCustomer("v1.netclues@gmail.com", htmlTemplate);
    // forgotPasswordCustomer(customer.email, htmlTemplate);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER.MAIL_SENT,
      success: true,
      data: { customerId },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const customerLogin = async (req, res) => {
  try {
    const { email, password, browserName, osName, ip } = req.body.data;

    const result = await findCustomerByEmailAndNibnumber(email);
    const customer = result?.dataValues;
    let ipRecord = await blockedIpsModel.findOne({ where: { ipAddress: ip } });

    if (!customer) {
      // If customer not found, handle failed login attempts based on IP
      if (!ipRecord) {
        // If IP doesn't exist, create a new record for the failed attempt
        ipRecord = await blockedIpsModel.create({
          ipAddress: ip,
          failedLoginAttempts: 1,
          isBlocked: "0",
          lastLoginAttempt: new Date(),
        });
      } else {
        // If IP exists, increment the failed attempts and check if the IP should be blocked
        const now = new Date();

        // Check if the IP is already blocked
        if (ipRecord.isBlocked === "1") {
          const blockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const blockTimeElapsed = now - new Date(ipRecord.lastLoginAttempt);

          if (blockTimeElapsed < blockDuration) {
            throw new Error(MESSAGES.CUSTOMER.IP_BLOCKED_LOGIN); // IP is still blocked
          } else {
            // Unblock the IP after 24 hours
            ipRecord.isBlocked = "0";
            ipRecord.failedLoginAttempts = 1; // Allow one retry and reset attempts
            ipRecord.lastLoginAttempt = now; // Update the last attempt time
          }
        } else {
          // If IP is not blocked, update failed attempts and last login attempt time
          ipRecord.failedLoginAttempts += 1;
          ipRecord.lastLoginAttempt = now;
        }

        // If failed attempts reach 5, block the IP
        if (ipRecord.failedLoginAttempts >= 5) {
          ipRecord.isBlocked = "1"; // Block the IP
        }

        await ipRecord.save(); // Save the updated record
      }

      // If customer is not found, throw a "Customer Not Found" error
      throw new Error(MESSAGES.CUSTOMER.NOT_FOUND);
    }
    const currentTime = new Date();
    const deleteRequestTime = new Date(customer.deleteReqTime);

    // Calculate the time difference in milliseconds (24 hours = 24 * 60 * 60 * 1000)
    let timeDiff = currentTime.getTime() - deleteRequestTime.getTime();
    if (
      customer.isDeleted === "1" &&
      customer.deleteReqTime &&
      timeDiff <= 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    ) {
      await customerModel.update(
        {
          isDeleted: "0",
          deleteReqTime: null,
        },
        { where: { email } }
      );
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "cancel_delete_customer_account_req",
        },
      });
      const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

      let htmlTemplate = getTemplate.content.replace(/@@customer@@/g, fullName);

      //   deleteAccountConfirmationCustomer("v1.netclues@gmail.com", htmlTemplate,true);
      // deleteAccountConfirmationCustomer(customer.email, htmlTemplate,true);
    }
    
    if (
      customer.isDeleted == "1" &&
      customer.deleteReqTime &&
      timeDiff > 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    ) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.CUSTOMER.ACCOUNT_DELETED,
        success: false,
        data: {},
      });
    }
    const ipMatched = await blockedIpsModel.findOne({
      where: { ipAddress: ip, isBlocked: "1" },
    });
    if (ipMatched && ipMatched.isBlocked === "1") {
      if (!ipMatched?.createdBy) {
        const now = new Date();
        const blockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const blockTimeElapsed = now - new Date(ipMatched.lastLoginAttempt);

        if (blockTimeElapsed > blockDuration) {
          // Reset the blocked IP record
          ipMatched.isBlocked = "0";
          ipMatched.failedLoginAttempts = 0;
          ipMatched.lastLoginAttempt = null;
          await ipMatched.save();
        } else {
          await generateCustomerLoginHistory(
            customer.id,
            customer.email,
            browserName,
            ip,
            osName,
            "0"
          );
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.CUSTOMER.IP_BLOCKED_LOGIN,
            success: false,
            data: {},
          });
        }
      } else {
        await generateCustomerLoginHistory(
          customer.id,
          customer.email,
          browserName,
          ip,
          osName,
          "0"
        );
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.IP_BLOCKED,
          success: false,
          data: {},
        });
      }
    }
    if (customer && customer?.linkToCustomerId) {
      await generateCustomerLoginHistory(
        customer.id,
        customer.email,
        browserName,
        ip,
        osName,
        "0"
      );
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.CUSTOMER.PROFILE_NOT_AUTHORIZED,
        success: false,
        data: {},
      });
    }
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      const loginAttempts = customer.loginAttempts;
      const lastLoginAttempt = customer.lastLoginAttempt;

      if (loginAttempts >= 10) {
        await generateCustomerLoginHistory(
          customer.id,
          customer.email,
          browserName,
          ip,
          osName,
          "0"
        );
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER.MAX_LOGIN_ATTEMPTS,
          success: false,
          data: {},
        });
      }

      await customerModel.update(
        {
          loginAttempts: loginAttempts + 1,
          lastLoginAttempt: new Date(),
        },
        { where: { email } }
      );

      const remainingAttempts = 10 - (loginAttempts + 1);
      const message =
        remainingAttempts > 0
          ? `Invalid credentials. You have ${remainingAttempts} attempt(s) left.`
          : MESSAGES.CUSTOMER.MAX_LOGIN_ATTEMPTS;
      await generateCustomerLoginHistory(
        customer.id,
        customer.email,
        browserName,
        ip,
        osName,
        "0"
      );
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: message,
        success: false,
        data: {},
      });
    }
    const loginAttempts = customer.loginAttempts;
    const lastLoginAttempt = customer.lastLoginAttempt;

    const now = new Date();

    // Difference in milliseconds
    const timeDifference = now - lastLoginAttempt;

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // Format the time difference as hh:mm:ss
    const formattedTimeDifference = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (loginAttempts >= 10 && hours < 24) {
      await generateCustomerLoginHistory(
        customer.id,
        customer.email,
        browserName,
        ip,
        osName,
        "0"
      );
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: `Your have reached login attempt limit. Please try again after 24 hours.`,
        //  Time until reset: ${formattedTimeDifference}`,
        success: false,
        data: {},
      });
    }
    const isValid = await isValidEmailCustomer(email);

    await customerModel.update({ loginAttempts: 0 }, { where: { email } });

    if (ipRecord) {
      await blockedIpsModel.update(
        { failedLoginAttempts: 0, isBlocked: "0", lastLoginAttempt: null },
        {
          where: {
            ipAddress: ip,
          },
        }
      );
    }

    if (!isValid) {
      const otp = generateOTP();
      const otpExpireDateTime = new Date();
      otpExpireDateTime.setMinutes(otpExpireDateTime.getMinutes() + 15);
      await customerOtpUpdate(customer.id, otp, otpExpireDateTime);
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "otp",
        },
      });
      const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

      let htmlTemplate = getTemplate.content
        .replace(/@@USERNAME@@/g, fullName)
        .replace(/@@OTP@@/g, otp);

      // sendOTPmailCustomer("v1.netclues@gmail.com", htmlTemplate);
      // sendOTPmailCustomer(customer.email, htmlTemplate);
      res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.OTP_SENT,
        success: true,
        data: { otp: true },
      });
    } else {
      const token = generateToken({ customerId: customer.id, ip: ip });

      const userAgentString = req.headers["user-agent"];
      const agent = useragent.parse(userAgentString);
      const browser = agent && agent.family;
      const os = agent && agent.os && agent.os.family;
      const device = agent && agent.device && agent.device.family;

      await generateLoginSession({
        customerId: customer.id,
        token,
        deviceName: `${browserName} ( ${osName} )`,
        ip: ip,
      });
      await generateCustomerLoginHistory(
        customer.id,
        customer.email,
        browserName,
        ip,
        osName,
        "1"
      );
      res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.LOGIN,
        success: true,
        data: { ...customer, token },
      });
    }
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const customerOtpVerify = async (req, res) => {
  let customer;
  let browser;
  let os;
  let ip;
  let operatingSystem;

  try {
    const { email, otp, ip: clientIp, osName: operatingSystem } = req.body.data;
    ip = clientIp;
    const isValid = await isValidEmailCustomer(email);
    if (isValid) {
      throw new Error(MESSAGES.CUSTOMER.MAIL_ALREADY_VALIDATE);
    }
    const result = await findCustomerByEmailAndNibnumber(email);
    customer = result?.dataValues;

    if (!customer) {
      throw new Error(MESSAGES.CUSTOMER.NOT_FOUND);
    }
    if (customer && customer?.linkToCustomerId) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.CUSTOMER.PROFILE_NOT_AUTHORIZED,
        success: false,
        data: {},
      });
    }

    const currentTime = new Date();
    if (
      !customer.otp ||
      customer.otpExpireDateTime < currentTime ||
      customer.otp !== otp
    ) {
      throw new Error(MESSAGES.CUSTOMER.INVALID_OTP);
    }
    // Generate JWT token
    const token = generateToken({ customerId: customer.id });

    const userAgentString = req.headers["user-agent"];
    const agent = useragent.parse(userAgentString);
    browser = agent && agent.family;
    os = agent && agent.os && agent.os.family;
    const device = agent && agent.device && agent.device.family;

    await generateLoginSession({
      customerId: customer.id,
      token,
      deviceName: `${browser} ( ${os} )`,
      ip: ip,
    });

    await validateCustomerEmail(customer.id);
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "userconfirmation",
      },
    });
    const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

    let htmlTemplate = getTemplate.content.replace(/@@USERNAME@@/g, fullName);

    // emailConfirmationmailCustomer(customer.email, htmlTemplate);
    // emailConfirmationmailCustomer("v1.netclues@gmail.com", htmlTemplate);
    await generateCustomerLoginHistory(
      customer.id,
      customer.email,
      browser,
      ip,
      operatingSystem,
      "1"
    );
    res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER.LOGIN,
      success: true,
      data: { ...customer, token },
    });
  } catch (error) {
    await generateCustomerLoginHistory(
      customer?.id,
      customer?.email,
      browser,
      ip,
      operatingSystem,
      "0"
    );
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.body.data;
    if (customerId) {
      const result = await deleteCustomerById(customerId);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.CUSTOMER.DELETE_FAILED,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER.DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.NOT_FOUND,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { id, page, perPage, sortBy, sortOrder, filter } = req.body.data;
    let customerData = await getCustomerInfo(
      id,
      page,
      perPage,
      sortBy,
      sortOrder,
      filter
    );
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const getCustomerProfileInfo = async (req, res) => {
  try {
    const { id } = req.body.data;
    let customerData = await findCustomerProfileById(id);

    if (Object.keys(customerData).length > 0) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const getCustomerProfileInfoUpdate = async (req, res) => {
  try {
    const { customerId } = req.body.data;
    const reqBody = req.body.data;

    if (customerId) {
      let updateCustomer = await updateCustomerInfoById(customerId, reqBody);
      if (updateCustomer) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER_PROFILE.UPDATE_SUCCESS,
          success: true,
          data: updateCustomer,
        });
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER_PROFILE.UPDATE_FAILED,
          success: false,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER_PROFILE.NOT_FOUND,
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

const getLoginSessionsList = async (req, res) => {
  try {
    const { customerId } = req.body.data;
    let sessionData = await getLoginSessionList(customerId);
    if (sessionData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.SESSION_FETCH_SUCCESS,
        success: true,
        data: { ...sessionData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.SESSION_FETCH_FAILED,
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

const checkExistingUserandNIB = async (req, res) => {
  try {
    const { nibNumber, email } = req.body.data;
    let customerData = await getExistingUserandNIB(nibNumber, email);
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { data: customerData },
      });
    } else {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
        success: false,
        data: { data: null },
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

const customerResendOtp = async (req, res) => {
  try {
    const { email } = req.body.data;
    const result = await findCustomerByEmailAndNibnumber(email);
    const customer = result?.dataValues;
    const otp = generateOTP();
    const otpExpireDateTime = new Date();
    otpExpireDateTime.setMinutes(otpExpireDateTime.getMinutes() + 15);
    await customerupdateOTPByEmail(email, otp, otpExpireDateTime);
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "otp",
      },
    });
    const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

    let htmlTemplate = getTemplate.content
      .replace(/@@USERNAME@@/g, fullName)
      .replace(/@@OTP@@/g, otp);
    // sendOTPmailCustomer("v1.netclues@gmail.com", htmlTemplate);
    // sendOTPmailCustomer(email, htmlTemplate);
    res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER.OTP_SENT,
      success: true,
      data: { otp: true },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getAllcustomerList = async (req, res) => {
  try {
    let customerData = await getCustomerList();
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const changePassword = async (req, res) => {
  try {
    const { newPassword, oldPassword, confirmPassword, customerId, ipAddress } =
      req.body.data;

    const existingCustomer = await findCustomerById(customerId);
    if (!existingCustomer) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.NOT_FOUND,
        success: false,
        data: {},
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.PASS_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.PASSWORD_FORMATE_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    const isPasswordValid = await decryptPassword(
      oldPassword,
      existingCustomer.password
    );

    if (!isPasswordValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.OLD_PASSWORD_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    if (oldPassword === newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.OLD_NEW_PASSWORD_SHOULD_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Hash and update password
    const newHashedPassword = await generateHashPassword(newPassword);
    if (customerId) {
      await changeCustomerPassword(newHashedPassword, customerId, ipAddress);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.PASSWORD_CHANGE,
        success: true,
        data: {},
      });
    } else {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.CUSTOMER.PASSWORD_NOT_CHANGED,
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
const deleteLoginSessions = async (req, res) => {
  try {
    const { ids } = req.body.data;

    if (ids.length > 0) {
      const result = await deleteSessionById(ids);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.CUSTOMER.SESSION_DELETE_SUCCESS,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER.SESSION_DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.SESSION_DELETE_NOT_FOUND,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const logoutCustomer = async (req, res) => {
  try {
    const { customerId, ip, browserName, token } = req.body.data;
    if (customerId) {
      const result = await logoutById(token, customerId, ip, browserName);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.CUSTOMER.SESSION_DELETE_SUCCESS,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER.SESSION_DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER.SESSION_DELETE_NOT_FOUND,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const getCustomerLogHistory = async (req, res) => {
  try {
    const {
      id,
      page,
      perPage,
      dateRange,
      searchFilter,
      sortOrder,
      orderBy,
      selectedType,
    } = req.body.data;

    let logData = await customerLogHistoryData(
      id,
      page,
      perPage,
      dateRange,
      searchFilter,
      sortOrder,
      orderBy,
      selectedType
    );

    if (logData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...logData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const customerAndGenderList = async (req, res) => {
  try {
    let result = await customerAndGenderData();
    if (result) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: result,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const getAllrevenueCustomerList = async (req, res) => {
  try {
    const { searchQuery, customerIds } = req.body?.data;
    let customerData = await getRevenueCustomerList(searchQuery, customerIds);
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const getAllcustomerListForAdmin = async (req, res) => {
  try {
    const { customerIds } = req.body.data;
    let customerData = await getCustomerListForAdmin(customerIds);
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const delinkCustomerProfileById = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const { email, deLink } = reqBody;

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER_PROFILE.EMAIL_NOT_ENTER,
        success: false,
        data: {},
      });
    }
    if (email && deLink) {
      const customer = await findCustomerByEmail(email);
      if (customer) {
        const customerId = customer?.id;
        const parentCustomerId = customer?.linkToCustomerId;
        // let updateDelink = await delinkCustomerProfileService(
        //   customerId,
        //   customer
        // );

        if (customerId) {
          const [result] = await customerModel.update(
            { linkToCustomerId: null },
            {
              where: {
                id: customerId,
              },
            }
          );
          if (result) {
            const data = {
              customerId: customer?.id,
              customerName: `${customer?.firstName} ${customer?.middleName} ${customer?.lastName}`,
              customerEmail: customer?.email,
            };

            try {
              await axios.post(
                `${process.env.PAYMENT_URL}customerDetails/create`,
                {
                  data,
                }
              );
            } catch (error) {
              console.log(error);
            }
          }
          if (result) {
            const linkExpireDateTime = new Date();
            linkExpireDateTime.setMinutes(linkExpireDateTime.getMinutes() + 15);
            await customerLinkExpireTime(customerId, linkExpireDateTime);
            const encryptCustomerId = encrypt(customerId);
            const encryptId = encryptCustomerId?.data;
            const getTemplate = await emailtemplatesModel.findOne({
              where: {
                slug: "setpassword",
              },
            });
            const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

            let htmlTemplate = getTemplate.content
              .replace(/@@USERNAME@@/g, fullName)
              .replace(
                /@@URL@@/g,
                `<a href="${process.env.NMAIL_RESET_LINK_BASE_URL_FRONT_PORTAL}auth-password-reset-cover/${encryptId}">click here</a>`
              );
            // setPasswordwelcomemailCustomer("v1.netclues@gmail.com", htmlTemplate);
            // setPasswordwelcomemailCustomer(customer?.email, htmlTemplate);

            // Email to parent customer
            const parentCustomerDetails = await findCustomerById(
              parentCustomerId
            );

            const parentfullName = `${parentCustomerDetails.firstName} ${parentCustomerDetails.middleName} ${parentCustomerDetails.lastName}`;

            const getParentEmailTemplate = await emailtemplatesModel.findOne({
              where: {
                slug: "delink_customer_email_success",
              },
            });

            let htmlParentTemplate = getParentEmailTemplate.content
              .replace(/@@parent_customer@@/g, parentfullName)
              .replace(/@@customer_name@@/g, fullName)
              .replace(/@@customer_email@@/g, email);

            //  delinkMailToParentCustomer("v1.netclues@gmail.com", htmlParentTemplate);
            // delinkMailToParentCustomer(parentCustomerDetails?.email, htmlParentTemplate);

            try {
              const ipAddress = getLocalIPv4Address();
              const auditLogBody = {
                recordId: customerId,
                action: `Customer account delinked from ${parentCustomerDetails?.email}`,
                moduleName: "Customer Service",
                newValue: JSON.stringify({
                  customerId: customerId,
                  name: fullName,
                  email: email,
                }),
                oldValue: JSON.stringify({
                  linkedToCustomerId: parentCustomerId,
                  linkedToCustomerEmail: parentCustomerDetails?.email || "",
                }),
                type: "1",
                userId: null,
                customerId: customerId,
                ipAddress,
              };
              await auditLogModel.create(auditLogBody);
            } catch (error) {
              console.log(error);
            }

            return res.status(STATUS_CODES.SUCCESS).json({
              message: MESSAGES.CUSTOMER.CUSTOMER_ADDED,
              success: true,
              data: customer,
            });
          } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
              message: error.message,
              success: false,
              data: {},
            });
          }
        }
      }
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const checkLinkvalid = async (req, res) => {
  try {
    const { customerId } = req.body.data;
    let customerData = await findCustomerById(customerId);

    if (customerData) {
      const linkExpirationTime = new Date(customerData?.linkExpireDateTime);
      const currentTime = new Date();

      // Check if the current time is greater than the link expiration time
      const isLinkExpired = currentTime > linkExpirationTime;

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: {
          linkExpired: isLinkExpired,
        },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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

const deleleAccountRequest = async (req, res) => {
  try {
    const { customerId } = req.body.data;
    let customerData = await findCustomerById(customerId);

    if (customerData) {
      const [result] = await customerModel.update(
        { deleteReqTime: new Date(), isDeleted: "1", isValidEmail: "0" },
        { where: { id: customerId } }
      );

      if (result) {
        const requestDate = new Date(); // Replace this with the actual request date if available
        const formattedRequestDate = requestDate.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const getTemplate = await emailtemplatesModel.findOne({
          where: {
            slug: "customer_account_delete_req",
          },
        });
        const fullName = `${customerData.firstName} ${customerData.middleName} ${customerData.lastName}`;

        let htmlTemplate = getTemplate.content
          .replace(/@@customer@@/g, fullName)
          .replace(/@@requestDate@@/g, formattedRequestDate);

        // deleteAccountConfirmationCustomer("v1.netclues@gmail.com", htmlTemplate);
        // deleteAccountConfirmationCustomer(customerData.email, htmlTemplate);
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
          success: true,
          data: { result },
        });
      }
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
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
const deleteCustomerData = async (data) => {
  const { customerId, name, email, ipAddress } = data;
  try {
    // Begin a transaction for atomicity
    const transaction = await customerModel.sequelize.transaction();

    try {
      // Disable foreign key checks
      await customerModel.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", {
        transaction,
      });

      // Delete related data from other models
      await addressModel.destroy({ where: { customerId }, transaction });
      await customerLoginSessionModel.destroy({
        where: { customerId },
        transaction,
      });
      await feedbackModel.destroy({ where: { customerId }, transaction });
      await likeDislikeModel.destroy({ where: { customerId }, transaction });
      await logiHistoryCustomerModel.destroy({
        where: { customerId },
        transaction,
      });
      await supportModel.destroy({ where: { customerId }, transaction });

      // delete the customers linked to the current customer
      await customerModel.destroy({
        where: { linkToCustomerId: customerId },
        transaction,
      });

      // Delete the customer record
      await customerModel.destroy({ where: { id: customerId }, transaction });

      // Re-enable foreign key checks
      await customerModel.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {
        transaction,
      });

      // Commit the transaction
      await transaction.commit();

      const auditLogBody = {
        recordId: customerId,
        action: `Customer ( ${name} - ${email} ) data deleted successfully`,
        moduleName: "Customer Service",
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
      await auditLogModel.create(auditLogBody);

      console.log(
        `All data for customerId ${customerId} deleted successfully.`
      );
      return { success: true };
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      const auditLogBody = {
        recordId: customerId,
        action: `Customer ( ${name} - ${email} ) data delete failed`,
        moduleName: "Customer Service",
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
      await auditLogModel.create(auditLogBody);
      console.error(`Error deleting data for customerId ${customerId}:`, error);
      return { success: false };
    }
  } catch (error) {
    console.error("Error initializing transaction:", error);
    return { success: false };
  }
};

// const getUsersWithExceededDeleteTime = async () => {
//   try {
//     // Get the current date and time
//     const currentTime = new Date();

//     // Calculate the threshold time (24 hours before the current time)
//     const thresholdTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

//     // Fetch users who meet the conditions
//     const users = await customerModel.findAll({
//       where: {
//         isDeleted: "1",
//         deleteReqTime: {
//           [Op.lte]: thresholdTime, // Users whose deleteReqTime is <= thresholdTime
//         }
//       }
//     });

//     // Iterate over users and delete their service data
//     for (const user of users) {
//       await deleteCustomerAllServiceData(user.id);
//     }
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw error;
//   }
// };

// const deleteCustomerAllServiceData = async (customerId) => {
//   try {
//     if (!customerId) {
//       throw new Error("Customer ID is required.");
//     }

//     const data = { customerId };

//     // Delete customer data (external function call)
//     try {
//       await deleteCustomerData(customerId);
//     } catch (error) {
//       console.error("Error deleting customer data:", error.message);
//     }

//     const serviceEndpoints = [
//       `${process.env.PAYMENT_URL}customerDetails/delete-stripe-customer`,
//       `${process.env.PAYMENT_URL}customerDetails/deleteCustomerAlldata`,
//       `${process.env.TICKETSERVICE}/ticket/deleteCustomerAlldata`,
//       `${process.env.NOTIFICATIONSERVICE}/deleteCustomerAlldata`,
//       `${process.env.DOCUMENT_URL}deleteCustomerAlldata`,
//       `${process.env.APPLICATIONSERVICES}/application/deleteCustomerAlldata`,
//     ];

//     // Perform the API requests in parallel
//     const results = await Promise.allSettled(
//       serviceEndpoints.map((url) =>
//         axios.post(url, { data }).catch((error) => {
//           console.error(`Error in ${url}:`, error.message);
//           throw error; // Ensure the promise is rejected for `allSettled`.
//         })
//       )
//     );

//     // Identify failed service calls
//     const failedServices = results
//       .filter((result) => result.status === "rejected")
//       .map((result, index) => serviceEndpoints[index]);

//     if (failedServices.length === 0) {
//       console.log("All customer data deletion services executed successfully.");
//     } else {
//       console.log("Some services failed during the customer data deletion process.", failedServices);
//     }

//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//   }
// };

const getUsersWithExceededDeleteTime = async () => {
  try {
    // Get the current date and time
    const currentTime = new Date();

    // Calculate the threshold time (24 hours before the current time)
    const thresholdTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

    // Fetch users who meet the conditions
    const users = await customerModel.findAll({
      where: {
        isDeleted: "1",
        deleteReqTime: {
          [Op.lte]: thresholdTime, // Users whose deleteReqTime is <= thresholdTime
        },
      },
    });

    // Iterate over users and delete their service data
    for (const user of users) {
      await deleteCustomerAllServiceData(user);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const deleteCustomerAllServiceData = async (user) => {
  if (!user) {
    throw new Error("Customer ID is required.");
  }

  const customerName = `${user?.firstName} ${user?.middleName} ${user?.lastName}`;

  const ipAddress = getLocalIPv4Address();

  const data = {
    customerId: user.id,
    name: customerName,
    email: user.email,
    ipAddress,
  };
  try {
    // Delete customer data (external function call)
    try {
      await deleteCustomerData(data);
    } catch (error) {
      console.error("Error deleting customer data:", error.message);
    }

    const serviceEndpoints = [
      `${process.env.PAYMENT_URL}customerDetails/delete-stripe-customer`,
      `${process.env.PAYMENT_URL}customerDetails/deleteCustomerAlldata`,
      `${process.env.TICKETSERVICE}/ticket/deleteCustomerAlldata`,
      `${process.env.NOTIFICATIONSERVICE}/deleteCustomerAlldata`,
      `${process.env.DOCUMENT_URL}deleteCustomerAlldata`,
      `${process.env.APPLICATIONSERVICES}/application/deleteCustomerAlldata`,
    ];

    // Perform the API requests in parallel
    const results = await Promise.allSettled(
      serviceEndpoints.map((url) =>
        axios.post(url, { data }).catch((error) => {
          console.error(`Error in ${url}:`, error.message);
          throw error; // Ensure the promise is rejected for `allSettled`.
        })
      )
    );

    // Identify failed service calls
    const failedServices = results
      .filter((result) => result.status === "rejected")
      .map((result, index) => serviceEndpoints[index]);

    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "delete_customer_account_success",
      },
    });

    let htmlTemplate = getTemplate.content.replace(/@@customer@@/g, data.name);

    // afterDeleteConfirmationCustomer("v1.netclues@gmail.com", htmlTemplate);
    // afterDeleteConfirmationCustomer(data.email, htmlTemplate);

    const auditLogBody = {
      recordId: data.customerId,
      action: `Customer's ( ${data.name} - ${data.email} ) all data deleted successfully`,
      moduleName: "Customer Service",
      newValue: JSON.stringify({
        customerId: data.customerId,
        name: data.name,
        email: data.email,
      }),
      oldValue: "N/A",
      type: "2",
      userId: null,
      customerId: data.customerId,
      ipAddress,
    };

    await auditLogModel.create(auditLogBody);
    if (failedServices.length === 0) {
      console.log("All customer data deletion services executed successfully.");
    } else {
      console.log(
        "Some services failed during the customer data deletion process.",
        failedServices
      );
    }
  } catch (error) {
    const auditLogBody = {
      recordId: data.customerId,
      action: `Customer ( ${data.name} - ${data.email} ) data delete failed`,
      moduleName: "Customer Service",
      newValue: JSON.stringify({
        customerId: data.customerId,
        name: data.name,
        email: data.email,
      }),
      oldValue: "N/A",
      type: "2",
      userId: null,
      customerId: data.customerId,
      ipAddress,
    };

    await auditLogModel.create(auditLogBody);
    console.error("Unexpected error:", error.message);
  }
};

const deleteCustomerAllServiceDataForDemo = async (req, res) => {
  try {
    const { email } = req.body.data;

    const user = await findCustomerByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
        data: {},
      });
    }
    if (!email) {
      return res.status(400).json({
        message: "Email ID is required.",
        success: false,
        data: {},
      });
    }

    const customerName = `${user?.firstName} ${user?.middleName} ${user?.lastName}`;

    const ipAddress = getLocalIPv4Address();

    const data = {
      customerId: user.id,
      name: customerName,
      email: user.email,
      ipAddress,
    };

    try {
      // Delete customer data (external function call)
      try {
        await deleteCustomerData(data);
      } catch (error) {
        console.error("Error deleting customer data:", error.message);
      }

      const serviceEndpoints = [
        `${process.env.PAYMENT_URL}customerDetails/delete-stripe-customer`,
        `${process.env.PAYMENT_URL}customerDetails/deleteCustomerAlldata`,
        `${process.env.TICKETSERVICE}/ticket/deleteCustomerAlldata`,
        `${process.env.NOTIFICATIONSERVICE}/deleteCustomerAlldata`,
        `${process.env.DOCUMENT_URL}deleteCustomerAlldata`,
        `${process.env.APPLICATIONSERVICES}/application/deleteCustomerAlldata`,
      ];

      // Perform the API requests in parallel
      const results = await Promise.allSettled(
        serviceEndpoints.map((url) =>
          axios.post(url, { data }).catch((error) => {
            console.error(`Error in ${url}:`, error.message);
            throw error; // Ensure the promise is rejected for `allSettled`.
          })
        )
      );

      // Identify failed service calls
      const failedServices = results
        .filter((result) => result.status === "rejected")
        .map((result, index) => serviceEndpoints[index]);

      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "delete_customer_account_success",
        },
      });

      let htmlTemplate = getTemplate.content.replace(
        /@@customer@@/g,
        data.name
      );

      // afterDeleteConfirmationCustomer("v1.netclues@gmail.com", htmlTemplate);
      // afterDeleteConfirmationCustomer(data.email, htmlTemplate);

      const auditLogBody = {
        recordId: data.customerId,
        action: `Customer's ( ${data.name} - ${data.email} ) all data deleted successfully`,
        moduleName: "Customer Service",
        newValue: JSON.stringify({
          customerId: data.customerId,
          name: data.name,
          email: data.email,
        }),
        oldValue: "N/A",
        type: "2",
        userId: null,
        customerId: data.customerId,
        ipAddress,
      };

      await auditLogModel.create(auditLogBody);
      if (failedServices.length === 0) {
        return res.status(200).json({
          message: "All customer data deletion services executed successfully.",
          success: false,
          data: {},
        });
      } else {
        return res.status(200).json({
          message:
            "Some services failed during the customer data deletion process.",
          success: false,
          data: {},
        });
      }
    } catch (error) {
      const auditLogBody = {
        recordId: data.customerId,
        action: `Customer ( ${data.name} - ${data.email} ) data delete failed`,
        moduleName: "Customer Service",
        newValue: JSON.stringify({
          customerId: data.customerId,
          name: data.name,
          email: data.email,
        }),
        oldValue: "N/A",
        type: "2",
        userId: null,
        customerId: data.customerId,
        ipAddress,
      };

      await auditLogModel.create(auditLogBody);
      return res.status(500).json({
        message: error.message || "Internal server error.",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error.",
      success: false,
      data: {},
    });
  }
};
const findCustomerEmail = async (req, res) => {
  try {
    const { email } = req.body.data;
    let customerData = await findCustomerByEmail(email);
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_SUCCESS,
        success: true,
        data: customerData,
      });
    } else {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.FETCH_FAILED,
        success: false,
        data: {},
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

const otpRequestForCustomerProfileByEmail = async (req, res) => {
  try {
    const { email,mobileNumber, userData, ipAddress } = req.body.data;
    let customer;
    if (email) {
      customer = await findCustomerByEmailAndNibnumber(email);
    }
    if(mobileNumber){
       customer = await customerModel.findOne({
        where: {
          mobileNumber: mobileNumber,
        },
      });
    }

    if (!customer) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.EMAIL_NOT_REGISTER,
        success: false,
        data: {},
      });
    }

    const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;

  if(email){
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "verification_otp",
      },
    });
    const otp = generateOTP();
    const otpExpireDateTime = new Date();
    otpExpireDateTime.setMinutes(otpExpireDateTime.getMinutes() + 15);

    let htmlTemplate = getTemplate.content
      .replace(/@@CUSTOMER_NAME@@/g, fullName)
      .replace(/@@OTP@@/g, otp);

    await customerModel.update(
      {
        otpVerificationExpireDateTime: otpExpireDateTime,
        otpVerification: otp,
      },
      {
        where: {
          email: email,
        },
      }
    );
    const subject = "OTP Verification for Profile Access";
    // sendOTPmailCustomer("v1.netclues@gmail.com", htmlTemplate,subject);
    sendOTPmailCustomer(customer.email, htmlTemplate,subject);
  }
  if(mobileNumber){
   
    let otp= await sendOtp(mobileNumber)
    const otpExpireDateTime = new Date();
    otpExpireDateTime.setMinutes(otpExpireDateTime.getMinutes() + 15);
    await customerModel.update(
      {
        otpVerificationExpireDateTime: otpExpireDateTime,
        otpVerification: otp,
      },
      {
        where: {
          email: customer?.email,
        },
      }
    );

  }
   
    try {
      const auditLogBody = {
        recordId: customer?.id,
        action: `Agent (${userData?.name} - ${userData?.email}) requested access to the profile of customer (${fullName} - ${customer?.email})`,
        moduleName: "Customer Service",
        newValue: JSON.stringify("otpRequest"),
        oldValue: JSON.stringify("otpRequest"),
        type: "2",
        userId: userData?.userId,
        customerId: customer?.id,
        ipAddress,
      };
      await auditLogModel.create(auditLogBody);
    } catch (error) {
      console.log(error);
    }
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER.MAIL_SENT,
      success: true,
      data: { otp: true },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: { otp: false },
    });
  }
};

const confirmOtpForProfileAccess = async (req, res) => {
  try {
    const { email,mobileNumber, otp, userData, ipAddress } = req.body.data;
    let customer;
    if(email){
      const result = await findCustomerByEmailAndNibnumber(email);
      customer = result?.dataValues;
    }
    if(mobileNumber){
      customer = await customerModel.findOne({
        where: {
          mobileNumber: mobileNumber,
        },
      });
    }
   
    if (!customer) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.EMAIL_NOT_REGISTER,
        success: false,
        data: {},
      });
    }

    const currentTime = new Date();
    if (
      !customer.otpVerification ||
      customer.otpVerificationExpireDateTime < currentTime ||
      customer.otpVerification != otp
    ) {
      try {
        const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;
        const auditLogBody = {
          recordId: customer?.id,
          action: `Agent (${userData?.name} - ${userData?.email}) failed to verify the OTP for accessing the profile of customer (${fullName} - ${customer?.email}) due to invalid OTP.`,
          moduleName: "Customer Service",
          newValue: JSON.stringify("otp"),
          oldValue: JSON.stringify("otp"),
          type: "2",
          userId: userData?.userId,
          customerId: customer?.id,
          ipAddress,
        };
        await auditLogModel.create(auditLogBody);
      } catch (error) {
        console.log(error);
      }
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER.INVALID_OTP,
        success: false,
        data: { otp: false },
      });
    }
    try {
      const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;
      const auditLogBody = {
        recordId: customer?.id,
        action: `Agent (${userData?.name} - ${userData?.email}) successfully verified the OTP and accessed the profile of customer (${fullName} - ${customer?.email}).`,
        moduleName: "Customer Service",
        newValue: JSON.stringify("otp"),
        oldValue: JSON.stringify("otp"),
        type: "2",
        userId: userData?.userId,
        customerId: customer?.id,
        ipAddress,
      };
      await auditLogModel.create(auditLogBody);
    } catch (error) {
      console.log(error);
    }
    await customerModel.update(
      {
        otpVerificationExpireDateTime: null,
        otpVerification: null,
      },
      {
        where: {
          email: customer?.email,
        },
      }
    );
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.CUSTOMER.LOGIN,
      success: true,
      data: { otp: true },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: { otp: false },
    });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  updateCustomerPassword,
  resetCustomerPasswordByEmail,
  deleteCustomer,
  customerLogin,
  customerOtpVerify,
  getCustomer,
  checkExistingUserandNIB,
  customerResendOtp,
  getAllcustomerList,
  changePassword,
  getCustomerProfileInfo,
  getCustomerProfileInfoUpdate,
  getLoginSessionsList,
  deleteLoginSessions,
  logoutCustomer,
  getCustomerLogHistory,
  customerAndGenderList,
  getAllrevenueCustomerList,
  getAllcustomerListForAdmin,
  delinkCustomerProfileById,
  checkLinkvalid,
  deleleAccountRequest,
  deleteCustomerData,
  getUsersWithExceededDeleteTime,
  deleteCustomerAllServiceDataForDemo,
  findCustomerEmail,
  otpRequestForCustomerProfileByEmail,
  confirmOtpForProfileAccess,
};
