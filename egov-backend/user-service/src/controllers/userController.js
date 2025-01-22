const {
  usersModel,
  blockedIpsModel,
  emailtemplatesModel,
  rolesModel,
} = require("../models");
const {
  createUser,
  findUserByEmail,
  setUserPassword,
  isValidEmail,
  updateOTP,
  validateEmail,
  deleteUserById,
  updateUserById,
  getUserInfo,
  getUserForDirectoryData,
  updateOTPByEmail,
  getAllusers,
  getUsersforWorkflowService,
  updateUserInfoById,
  findUserById,
  changeUserPassword,
  generateLoginSession,
  getLoginSessionList,
  deleteSessionById,
  generateAdminLoginHistory,
  adminLogHistoryData,
  userLogoutById,
  fetchSearchAllusers,
  userLinkExpireTime,
} = require("../services/users.services");
const {
  generateHashPassword,
  decryptPassword,
} = require("../utils/commonFunctions/common");
const { generateToken } = require("../utils/jwt/jsonWebToken");
const {
  forgotPassword,
  sendOTPmail,
  emailConfirmationmail,
  setPasswordwelcomemail,
} = require("../utils/mail/sendMail");
const { generateOTP } = require("../utils/optgenerator/otpGenerator");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const os = require("os");
const moment = require("moment");
const useragent = require("useragent");

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

const findLocalIp = async (req, res) => {
  try {
    const localIp = getLocalIPv4Address();
    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.USER.IP_FETCHED,
      success: true,
      data: { localIp },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
const createNewUser = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { email, name } = reqBody;

    if (email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.USER.ALREADY_EXIST,
          success: false,
          data: {},
        });
      }
    }

    if (!name) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.NAME_NOT_ENTER,
        success: false,
        data: {},
      });
    }
    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.EMAIL_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    let newUser = await createUser(reqBody);

    if (newUser) {
      const linkExpireDateTime = new Date();
      linkExpireDateTime.setMinutes(linkExpireDateTime.getMinutes() + 15);
      await userLinkExpireTime(newUser.id, linkExpireDateTime);
      const encryptUserId = encrypt(newUser.id);
      const encryptId = encryptUserId?.data;
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "setpassword",
        },
      });
      let htmlTemplate = getTemplate.content
        .replace(/@@USERNAME@@/g, newUser.name)
        .replace(
          /@@URL@@/g,
          `<a href="${process.env.NMAIL_RESET_LINK_BASE_URL}auth-pass-reset-cover/${encryptId}">click here</a>`
        );
      // setPasswordwelcomemail("v1.netclues@gmail.com", htmlTemplate);
      // setPasswordwelcomemail(newUser?.email, htmlTemplate);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.USER_ADDED,
        success: true,
        data: newUser,
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
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword, userId } = req.body.data;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.NOT_FOUND,
        success: false,
        data: {},
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.PASS_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    const linkExpirationTime = new Date(user?.linkExpireDateTime);
    const currentTime = new Date();

    // Check if the current time is greater than the link expiration time
    const isLinkExpired = currentTime > linkExpirationTime;

    if (isLinkExpired) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.INVALID_LINK,
        success: false,
        data: {},
      });
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.PASSWORD_FORMATE_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Hash and update password
    const newPassword = await generateHashPassword(password);
    if (userId) {
      await setUserPassword(newPassword, userId);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.PASSWORD_UPDATE,
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

const resetPasswordByEmail = async (req, res) => {
  try {
    const { email, userID } = req.body.data;
    let user;
    if (email) {
      user = await findUserByEmail(email);
    } else {
      user = await findUserById(userID);
    }

    const userId = user.id;
    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.EMAIL_NOT_REGISTER,
        success: false,
        data: {},
      });
    }
    const linkExpireDateTime = new Date();
    linkExpireDateTime.setMinutes(linkExpireDateTime.getMinutes() + 15);
    await userLinkExpireTime(userId, linkExpireDateTime);
    const encryptUserId = encrypt(userId);
    const encryptId = encryptUserId?.data;
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "forgotpassword",
      },
    });
    let htmlTemplate = getTemplate.content
      .replace(/@@USERNAME@@/g, user.name)
      .replace(
        /@@URL@@/g,
        `<a href="${process.env.NMAIL_RESET_LINK_BASE_URL}auth-pass-reset-cover/${encryptId}">click here</a>`
      );
    // forgotPassword("v1.netclues@gmail.com", htmlTemplate);
    // forgotPassword(email, htmlTemplate);

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.USER.MAIL_SENT,
      success: true,
      data: { userId },
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password, ip, browserName, osName } = req.body.data;

    const result = await findUserByEmail(email);
    const user = result?.dataValues;
    let ipRecord = await blockedIpsModel.findOne({ where: { ipAddress: ip } });

    if (!user) {
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
            throw new Error(MESSAGES.USER.IP_BLOCKED_LOGIN); // IP is still blocked
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
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }
    // blocked Ip check
    const ipMatched = await blockedIpsModel.findOne({
      where: { ipAddress: ip,isBlocked : "1"},
    });
    if (ipMatched && ipMatched.isBlocked === "1" ) {
      if(!ipMatched?.createdBy){
        const now = new Date();
        const blockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const blockTimeElapsed = now - new Date(ipMatched.lastLoginAttempt);

        if (blockTimeElapsed > blockDuration) {
          // Reset the blocked IP record
          ipMatched.isBlocked = "0";
          ipMatched.failedLoginAttempts = 0;
          ipMatched.lastLoginAttempt = null;
          await ipMatched.save();
        }else{
          await generateAdminLoginHistory(
            user.id,
            user.email,
            browserName,
            ip,
            osName,
            "0"
          );
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.USER.IP_BLOCKED_LOGIN,
            success: false,
            data: {},
          });
        }
      }else{
        await generateAdminLoginHistory(
          user.id,
          user.email,
          browserName,
          ip,
          osName,
          "0"
        );
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.USER.IP_BLOCKED,
          success: false,
          data: {},
        })
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const loginAttempts = user.loginAttempts;
      const lastLoginAttempt = user.lastLoginAttempt;

      if (loginAttempts + 1 > 10) {
        await generateAdminLoginHistory(
          user.id,
          user.email,
          browserName,
          ip,
          osName,
          "0"
        );
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.USER.MAX_LOGIN_ATTEMPTS,
          success: false,
          data: {},
        });
      }

      await usersModel.update(
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
          : MESSAGES.USER.MAX_LOGIN_ATTEMPTS;
      await generateAdminLoginHistory(
        user.id,
        user.email,
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

    const loginAttempts = user.loginAttempts;
    const lastLoginAttempt = user.lastLoginAttempt;

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
      await generateAdminLoginHistory(
        user.id,
        user.email,
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
    const isValid = await isValidEmail(email);
    await usersModel.update({ loginAttempts: 0 }, { where: { email } });

     if(ipRecord){
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
      await updateOTP(user.id, otp, otpExpireDateTime);
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "otp",
        },
      });
      let htmlTemplate = getTemplate.content
        .replace(/@@USERNAME@@/g, user.name)
        .replace(/@@OTP@@/g, otp);

      // sendOTPmail("v1.netclues@gmail.com", htmlTemplate);
      // sendOTPmail(user.email, htmlTemplate);
      res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.OTP_SENT,
        success: true,
        data: { otp: true },
      });
    } else {
      const token = generateToken({ userId: user.id, ip: ip });

      await generateLoginSession({
        userId: user.id,
        token,
        deviceName: `${browserName} ( ${osName} )`,
        ip: ip,
      });

      await generateAdminLoginHistory(
        user.id,
        user.email,
        browserName,
        ip,
        osName,
        "1"
      );
      res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.LOGIN,
        success: true,
        data: { ...user, token },
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

const verifyOtp = async (req, res) => {
  let user;
  let browser;
  let os;
  let ip;
  let operatingSystem;

  try {
    const { email, otp, ip: clientIp, osName: operatingSystem } = req.body.data;
    ip = clientIp;
    const isValid = await isValidEmail(email);
    if (isValid) {
      throw new Error(MESSAGES.USER.MAIL_ALREADY_VALIDATE);
    }
    const result = await findUserByEmail(email);
    user = result?.dataValues;

    if (!user) {
      throw new Error(MESSAGES.USER.NOT_FOUND);
    }

    const otpExpirationTime = new Date(user.otpExpireDateTime);
    const currentTime = new Date();
    const otpExpirationThreshold = new Date(
      currentTime.getTime() - 15 * 60 * 1000
    );

    if (
      !user.otp ||
      otpExpirationTime < otpExpirationThreshold ||
      user.otp !== otp
    ) {
      throw new Error(MESSAGES.USER.INVALID_OTP);
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    const userAgentString = req.headers["user-agent"];
    const agent = useragent.parse(userAgentString);
    browser = agent && agent.family;
    os = agent && agent.os && agent.os.family;
    const device = agent && agent.device && agent.device.family;

    await generateLoginSession({
      userId: user.id,
      token,
      deviceName: `${browser} ( ${os} )`,
      ip: ip,
    });

    await validateEmail(user.id);
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "userconfirmation",
      },
    });
    let htmlTemplate = getTemplate.content.replace(/@@USERNAME@@/g, user.name);

    // emailConfirmationmail(user.email,htmlTemplate);
    // emailConfirmationmail("v1.netclues@gmail.com", htmlTemplate);
    await generateAdminLoginHistory(
      user.id,
      user.email,
      browser,
      ip,
      operatingSystem,
      "1"
    );
    res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.USER.LOGIN,
      success: true,
      data: { ...user, token },
    });
  } catch (error) {
    await generateAdminLoginHistory(
      user.id,
      user.email,
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

const deleteUser = async (req, res) => {
  try {
    const { userId, ipAddress } = req.body.data;
    if (userId) {
      const result = await deleteUserById(userId, ipAddress);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.USER.DELETE_FAILED,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.USER.DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.NOT_FOUND,
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.body.data;
    const reqBody = req.body.data;
    if (id) {
      let updateUser = await updateUserById(id, reqBody);
      if (updateUser) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.USER.UPDATE_SUCCESS,
          success: true,
          data: updateUser,
        });
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.USER.UPDATE_FAILED,
          success: false,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.NOT_FOUND,
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

const getUser = async (req, res) => {
  try {
    const {
      id,
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
      status,
      roleId,
      departmentId,
      isSupportTeam,
    } = req.body.data;
    let userData = await getUserInfo(
      id,
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
      status,
      roleId,
      departmentId,
      isSupportTeam
    );

    if (userData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: { ...userData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.USER.FETCH_FAILED,
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

const getUserForDirectoryList = async (req, res) => {
  try {
    const { searchFilter, departmentId, page, perPage,isSupportTeam} = req.body.data;
    let userData = await getUserForDirectoryData(
      searchFilter,
      departmentId,
      page,
      perPage,
      isSupportTeam
    );
    if (userData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: { ...userData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.USER.FETCH_FAILED,
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

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body.data;
    const otp = generateOTP();
    const result = await findUserByEmail(email);
    const user = result?.dataValues;
    const otpExpireDateTime = new Date();
    otpExpireDateTime.setMinutes(otpExpireDateTime.getMinutes() + 15);
    await updateOTPByEmail(email, otp, otpExpireDateTime);
    const getTemplate = await emailtemplatesModel.findOne({
      where: {
        slug: "otp",
      },
    });
    let htmlTemplate = getTemplate.content
      .replace(/@@USERNAME@@/g, user.name)
      .replace(/@@OTP@@/g, otp);

    // sendOTPmail("v1.netclues@gmail.com", htmlTemplate);
    // sendOTPmail(user.email, htmlTemplate);
    res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.USER.OTP_SENT,
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

const getAllUser = async (req, res) => {
  try {
    const fetchAlluser = await getAllusers();
    if (fetchAlluser) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: { ...fetchAlluser },
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

const getAllSearchUser = async (req, res) => {
  try {
    const { searchQuery, userId } = req.body.data;

    const fetchAlluser = await fetchSearchAllusers(userId, searchQuery);
    if (fetchAlluser) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: { ...fetchAlluser },
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
const getUserforWorkflow = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const fetchUser = await getUsersforWorkflowService(reqBody);
    if (fetchUser) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: fetchUser,
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

const getUserProfileUpdate = async (req, res) => {
  try {
    const { userId } = req.body.data;
    const reqBody = req.body.data;

    if (userId) {
      let updateuser = await updateUserInfoById(userId, reqBody);
      if (updateuser) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.USER.USER_PROFILE_UPDATE_SUCCESS,
          success: true,
          data: updateuser,
        });
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.USER.USER_PROFILE_UPDATE_FAILED,
          success: false,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.USER_NOT_EXIST,
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

const userChangePassword = async (req, res) => {
  try {
    const { newPassword, oldPassword, confirmPassword, userId } = req.body.data;

    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.NOT_FOUND,
        success: false,
        data: {},
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.PASS_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.PASSWORD_FORMATE_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    const isPasswordValid = await decryptPassword(
      oldPassword,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.OLD_PASSWORD_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    if (oldPassword === newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.OLD_NEW_PASSWORD_SHOULD_NOT_MATCH,
        success: false,
        data: {},
      });
    }

    // Hash and update password
    const newHashedPassword = await generateHashPassword(newPassword);
    if (userId) {
      await changeUserPassword(newHashedPassword, userId);

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.PASSWORD_CHANGE,
        success: true,
        data: {},
      });
    } else {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.USER.PASSWORD_NOT_CHANGED,
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
    const { userId } = req.body.data;
    let sessionData = await getLoginSessionList(userId, req);
    if (sessionData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.SESSION_FETCH_SUCCESS,
        success: true,
        data: { ...sessionData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.USER.SESSION_FETCH_FAILED,
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
          message: MESSAGES.USER.SESSION_DELETE_SUCCESS,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.USER.SESSION_DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.SESSION_DELETE_NOT_FOUND,
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

const getAdminLogHistory = async (req, res) => {
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

    let logData = await adminLogHistoryData(
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
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: { ...logData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.USER.FETCH_FAILED,
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

const logoutUser = async (req, res) => {
  try {
    const { userId, ip, browserName, token } = req.body.data;

    if (userId) {
      const result = await userLogoutById(token, userId, ip, browserName);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.USER.SESSION_DELETE_SUCCESS,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.USER.SESSION_DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.USER.SESSION_DELETE_NOT_FOUND,
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

const checkLinkvalid = async (req, res) => {
  try {
    const { userId } = req.body.data;
    let userData = await findUserById(userId);

    if (userData) {
      const linkExpirationTime = new Date(userData?.linkExpireDateTime);
      const currentTime = new Date();

      // Check if the current time is greater than the link expiration time
      const isLinkExpired = currentTime > linkExpirationTime;

      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.FETCH_SUCCESS,
        success: true,
        data: {
          linkExpired: isLinkExpired,
        },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.USER.FETCH_FAILED,
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

const fetchAdminData = async (req, res) => {
  try {
    const { departmentId } = req.body.data;
    // Step 1: Find the role with `isCoreTeam = "0"`, `isAdmin = "1"`, and `departmentId`
    const adminRole = await rolesModel.findOne({
      where: {
        isCoreTeam: "0",
        isAdmin: "1",
        departmentId: departmentId,
      },
      raw:true,
    });

    if (!adminRole) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.NOT_FOUND,
        success: false,
        data: {},
      });
    }

    // Step 2: Find the user with the role ID
    const adminUser = await usersModel.findOne({
      where: {
        roleId: adminRole.id,
      },
      raw:true,
    });

    if (!adminUser) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.USER.NOT_FOUND,
        success: false,
        data: {},
      });
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: MESSAGES.USER.FETCH_SUCCESS,
      success: true,
      data: adminUser,
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

module.exports = {
  createNewUser,
  updatePassword,
  resetPasswordByEmail,
  userLogin,
  verifyOtp,
  deleteUser,
  updateUser,
  getUser,
  getUserForDirectoryList,
  resendOtp,
  getAllUser,
  getUserforWorkflow,
  getUserProfileUpdate,
  userChangePassword,
  findLocalIp,
  getLoginSessionsList,
  deleteLoginSessions,
  getAdminLogHistory,
  logoutUser,
  getAllSearchUser,
  checkLinkvalid,
  fetchAdminData,
};
