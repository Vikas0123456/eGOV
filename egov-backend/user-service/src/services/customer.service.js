const { Op, literal, Sequelize } = require("sequelize");
const { default: axios } = require("axios");
const { sequelize } = require("../config/db.connection");
const {
  customerModel,
  addressModel,
  customerLoginSessionModel,
  logiHistoryCustomerModel,
} = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateAuditLog } = require("./auditLog.service");

const findCustomerByEmail = async (email) => {
  try {
    return await customerModel.findOne({
      where: {
        email: email,
      },
      raw: true,
    });
  } catch (error) {
    throw new Error(`Error finding customer by email: ${error.message}`);
  }
};

const changeCustomerPassword = async (password, id, ipAddress) => {
  try {
    const currentRecord = await customerModel.findOne({
      attributes: ["password"],
      where: {
        id,
      },
    });

    if (!currentRecord) {
      return { success: false, message: "Customer password not found" };
    }

    const result = await customerModel.update(
      { password: password },
      {
        where: {
          id: id,
        },
      }
    );

    const oldPassword = currentRecord.password;

    try {
      await generateAuditLog(
        id,
        "Password Change",
        "Customer",
        password,
        oldPassword,
        "1",
        null,
        id,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findCustomerById = async (id) => {
  try {
    return await customerModel.findOne({
      where: {
        id: id,
      },
    });
  } catch (error) {
    throw new Error(`Error finding customer by id: ${error.message}`);
  }
};

const findCustomerProfileById = async (id) => {
  try {
    let documentList;
    try {
      const documentResponse = await axios.post(
        `${process.env.DOCUMENT_URL}document/list/upload`,
        { data: {} }
      );
      documentList = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    const customer = await customerModel.findOne({
      where: {
        id: id,
      },
    });

    let findDocumentData = documentList.find(
      (doc) => doc.id === customer?.nibImageId
    );

    let data = {
      ...customer.toJSON(),
      imageData: findDocumentData ? { ...findDocumentData } : {},
    };

    return data;
  } catch (error) {
    throw new Error(`Error finding customer by id: ${error.message}`);
  }
};

const findCustomerByEmailAndNibnumber = async (loginpara) => {
  try {
    // Check if loginpara is an email
    const customerByEmail = await customerModel.findOne({
      where: {
        email: loginpara,
      },
    });

    // If customer found by email, return
    if (customerByEmail) {
      return customerByEmail;
    }

    // If not an email, assume it's nibNumber and search
    const customerByNibNumber = await customerModel.findOne({
      where: {
        nibNumber: loginpara,
      },
    });

    // If customer found by nibNumber, return
    if (customerByNibNumber) {
      return customerByNibNumber;
    }

    return null;
  } catch (error) {
    throw new Error(`Error finding customer: ${error.message}`);
  }
};

const getExistingUserandNIB = async (nibNumber, email) => {
  try {
    let existingUser = null;
    if (nibNumber) {
      existingUser = await customerModel.findOne({
        where: {
          nibNumber: nibNumber,
        },
      });

      // If user found by nibNumber, return nibNumber
      if (existingUser) {
        return "nibNumber";
      }
    }

    // If nibNumber doesn't exist or user not found, check by email
    if (!existingUser && email) {
      existingUser = await customerModel.findOne({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return "email";
      }
    }

    return null;
  } catch (error) {
    throw new Error(`Error finding customer: ${error.message}`);
  }
};

const isNIBnumberExist = async (nibNumber) => {
  try {
    return await customerModel.findOne({
      where: {
        nibNumber: nibNumber,
      },
    });
  } catch (error) {
    throw new Error(`Error finding customer by nibNumber: ${error.message}`);
  }
};

const createCustomerService = async (requestBody) => {
  let transaction;
  let customer;
  try {
    // Start a transaction to ensure data consistency
    transaction = await sequelize.transaction();

    const { nibNumber, ...rest } = requestBody;
    const filteredRequestBody = {
      ...rest,
      ...(nibNumber !== "" && nibNumber != null ? { nibNumber } : {}),
    };

    // Create a customer using the filtered request body
    customer = await customerModel.create(filteredRequestBody, {
      transaction,
    });

    // Check if customer creation was successful
    if (!customer) {
      throw new Error("Failed to create customer");
    }
    if (customer) {
      const data = {
        customerId: customer?.id,
        customerName: `${customer?.firstName} ${customer?.middleName} ${customer?.lastName}`,
        customerEmail: customer?.email,
      };

      try {
        await axios.post(`${process.env.PAYMENT_URL}customerDetails/create`, {
          data,
        });
      } catch (error) {
        console.log(error);
      }
    }
    // Create the home address
    const homeAddress = await addressModel.create(
      {
        ...requestBody?.homeAddress,
        customerId: customer?.id,
      },
      { transaction }
    );

    // Check if home address creation was successful
    if (!homeAddress) {
      throw new Error("Failed to create home address");
    }

    // Create the mailing address
    const mailingAddress = await addressModel.create(
      {
        ...requestBody?.mailingAddress,
        customerId: customer?.id,
      },
      { transaction }
    );

    // Check if mailing address creation was successful
    if (!mailingAddress) {
      throw new Error("Failed to create mailing address");
    }

    // Update customer record with the address IDs
    const updatedCustomer = await customerModel.update(
      {
        homeAddressId: homeAddress?.id,
        mailingAddressId: mailingAddress?.id,
      },
      {
        where: { id: customer?.id },
        transaction,
      }
    );

    // Check if customer record update was successful
    if (!updatedCustomer) {
      throw new Error("Failed to update customer record with address IDs");
    }
    // Add homeAddressId and mailingAddressId to the customer object
    customer.homeAddressId = homeAddress?.id;
    customer.mailingAddressId = mailingAddress?.id;

    // Commit the transaction
    await transaction.commit();

    // const customerUpdate = await customerModel.findOne({
    //   where: { id: customer?.id },
    // });

    // const ipAddress = getLocalIPv4Address();

    // try {
    //   await generateAuditLog(
    //     customer.id,
    //     "Create",
    //     "Customer",
    //     "N/A",
    //     customerUpdate.dataValues,
    //     "1",
    //     null,
    //     customer.id,
    //     ipAddress
    //   );
    // } catch (error) {
    //   console.error("Error generating audit log:", error);
    // }

    return customer;
  } catch (error) {
    // Rollback the transaction if an error occurs
    if (transaction) await transaction.rollback();

    // If customer was created before failure, delete the customer record
    if (customer) {
      await customer.destroy();
    }

    throw new Error(error);
  }
};

const updateCustomerById = async (customerId, requestBody) => {
  try {
    const { email, ...updatedFields } = requestBody;
    let customerUpdate;

    const updateResult = await customerModel.update(updatedFields, {
      where: {
        id: customerId,
        isDeleted: "0",
      },
    });
    if (updateResult) {
      // Checking if any rows were updated
      customerUpdate = await customerModel.findOne({
        where: {
          id: customerId,
          isDeleted: "0",
        },
      });
    }
    return customerUpdate;
  } catch (error) {
    throw new Error(error);
  }
};

const updateCustomerInfoById = async (customerId, requestBody) => {
  try {
    const { email, nibNumber, documentFile, ...updatedFields } = requestBody;
    let customerUpdate;

    const updateResult = await customerModel.update(updatedFields, {
      where: {
        id: customerId,
        isDeleted: "0",
      },
    });
    if (updateResult) {
      // Checking if any rows were updated
      customerUpdate = await customerModel.findOne({
        where: {
          id: customerId,
          isDeleted: "0",
        },
      });
    }

    try {
      await generateAuditLog(
        customerId,
        "Update",
        "Customer",
        requestBody,
        customerUpdate.dataValues,
        "1",
        null,
        customerId,
        requestBody?.ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return customerUpdate;
  } catch (error) {
    throw new Error(error);
  }
};

const setCustomerPassword = async (password, id) => {
  try {
    return await customerModel.update(
      { password: password },
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
const deleteCustomerById = async (customerId) => {
  try {
    if (customerId) {
      const [customer] = await customerModel.update(
        { isDeleted: "1" },
        {
          where: {
            id: customerId,
          },
        }
      );
      return customer;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const isValidEmailCustomer = async (email) => {
  try {
    const customer = await findCustomerByEmailAndNibnumber(email);
    // If customer is found and isValidEmail is '1', return true, otherwise return false
    return customer && customer?.dataValues.isValidEmail === "1";
  } catch (error) {
    throw new Error(error);
  }
};

const customerOtpUpdate = async (customerId, otp, otpExpireDateTime) => {
  try {
    return await customerModel.update(
      {
        otp: otp,
        otpExpireDateTime: otpExpireDateTime,
      },
      {
        where: {
          id: customerId,
        },
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};
const customerLinkExpireTime = async (customerId,linkExpireDateTime) => {
  try {
    return await customerModel.update(
      {
        linkExpireDateTime: linkExpireDateTime,
      },
      {
        where: {
          id: customerId,
        },
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};
const customerupdateOTPByEmail = async (userEmail, otp, otpExpireDateTime) => {
  try {
    return await customerModel.update(
      {
        otp: otp,
        otpExpireDateTime: otpExpireDateTime,
      },
      {
        where: {
          email: userEmail,
        },
      }
    );
  } catch (error) {
    throw new Error(error);
  }
};

const validateCustomerEmail = async (customerId) => {
  try {
    await customerModel.update(
      { isValidEmail: "1" },
      { where: { id: customerId } }
    );

    return { success: true };
  } catch (error) {
    throw new Error(error);
  }
};

const getCustomerInfo = async (
  customerId,
  page,
  perPage,
  sortBy,
  sortOrder,
  filter
) => {
  try {
    let getCustomer;

    if (customerId) {
      getCustomer = await customerModel.findAndCountAll({
        where: {
          id: customerId,
          isDeleted: "0",
          linkToCustomerId: null,
        },
        attributes: [
          "id",
          "firstName",
          "middleName",
          "lastName",
          "email",
          "nibNumber",
          "nibImageId",
          "linkToCustomerId",
          "isResident",
          "gender",
          "mobileNumber",
          "isValidEmail",
          "status",
        ],
        raw: true
      });
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;

      const whereClause = {
        isDeleted: "0",
        linkToCustomerId: null,
      };

      // Filter Conditions
      if (filter) {
        const nameParts = filter.split(" ").map((part) => `%${part}%`);
        whereClause[Op.or] = [
          { email: { [Op.like]: `%${filter}%` } },
          { mobileNumber: { [Op.like]: `%${filter}%` } },
          { firstName: { [Op.like]: `%${filter}%` } },
          { middleName: { [Op.like]: `%${filter}%` } },
          { lastName: { [Op.like]: `%${filter}%` } },
          {
            [Op.and]: [
              nameParts[0] ? { firstName: { [Op.like]: nameParts[0] } } : null,
              nameParts[1] ? { middleName: { [Op.like]: nameParts[1] } } : null,
              nameParts[2] ? { lastName: { [Op.like]: nameParts[2] } } : null,
            ].filter(Boolean),
          },
        ];
      }

      // Sorting
      let order = [];
      if (sortBy) {
        order.push([sortBy, sortOrder === "asc" ? "ASC" : "DESC"]);
      }

      getCustomer = await customerModel.findAndCountAll({
        where: whereClause,
        attributes: [
          "id",
          "firstName",
          "middleName",
          "lastName",
          "email",
          "nibNumber",
          "nibImageId",
          "linkToCustomerId",
          "isResident",
          "gender",
          "mobileNumber",
          "isValidEmail",
          "status",
        ],
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true, // Return raw data instead of Sequelize instances
      });
    }

    let imageData = [];
    try {
      const documentResponse = await axios.post(
        `${process.env.DOCUMENT_URL}document/list/upload`,
        { data: {} }
      );
      imageData = documentResponse?.data?.data?.rows || [];
    } catch (error) {
      console.log("Document API call failed", error);
    }

    const usersWithImages = getCustomer?.rows?.map((user) => {
      const matchingImageData = imageData?.find(
        (image) => image.id === user.nibImageId
      );

      if (matchingImageData) {
        return {
          ...user,
          imageData: {
            id: matchingImageData?.id,
            customerId: matchingImageData?.customerId,
            userId: matchingImageData?.userId,
            documentName: matchingImageData?.documentName,
            documentPath: matchingImageData?.documentPath,
            fileSize: matchingImageData?.fileSize,
          },
        };
      } else {
        return user;
      }
    });

    return {
      ...getCustomer,
      rows: usersWithImages,
    };
  } catch (error) {
    throw new Error(error);
  }
};
const getCustomerList = async () => {
  try {
    const result = await customerModel.findAndCountAll({});
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const generateLoginSession = async (data) => {
  let loginSession;
  try {
    // Create the login session
    loginSession = await customerLoginSessionModel.create(data);

    // Check if login session creation was successful
    if (!loginSession) {
      throw new Error("Failed to create login session");
    }
  } catch (error) {
    throw new Error(error);
  }
};

const findLoginSession = async (customerId, token) => {
  let loginSession;
  try {
    // Create the login session
    loginSession = await customerLoginSessionModel.findOne({
      where: {
        customerId,
        token,
      },
      raw: true,
    });
    return loginSession;
  } catch (error) {
    throw new Error(error);
  }
};

const getLoginSessionList = async (customerId) => {
  try {
    const result = await customerLoginSessionModel.findAndCountAll({
      where: {
        customerId: customerId,
      },
      raw: true,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// const deleteSessionById = async (ids) => {
//   try {
//     if (ids.length > 0) {
//       const session = await customerLoginSessionModel.destroy({
//         where: {
//           id: {
//             [Op.in]: ids,
//           },
//         },
//       });
//       return session;
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const deleteSessionById = async (ids) => {
  try {
    if (ids.length > 0) {
      const sessions = await customerLoginSessionModel.findAll({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
        attributes: ["id", "ip", "customerId"],
      });

      const ipAddresses = sessions.map((session) => session.ip);
      const customerIds = sessions.map((session) => session.customerId);

      const session = await customerLoginSessionModel.destroy({
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      });

      const findData = await logiHistoryCustomerModel.findAll({
        where: {
          customerId: {
            [Op.in]: customerIds,
          },
          ipAddress: {
            [Op.in]: ipAddresses,
          },
        },
        order: [["createdDate", "DESC"]],
      });

      if (session && findData.length > 0) {
        const currentUtcTime = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(currentUtcTime.getTime() + istOffset);
        const logoutTime = istTime.toISOString().slice(0, 19).replace("T", " ");

        await logiHistoryCustomerModel.update(
          { logoutTime: currentUtcTime },
          {
            where: {
              id: {
                [Op.in]: findData.map((data) => data.id),
              },
            },
          }
        );
      }

      return session;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const logoutById = async (token, customerId, ip, browserName) => {
  try {
    if (token && customerId) {
      const res = await customerLoginSessionModel.destroy({
        where: {
          customerId: customerId,
          token: token,
        },
      });

      let findData = await logiHistoryCustomerModel.findOne({
        where: {
          customerId: customerId,
          ipAddress: ip,
          browserInfo: browserName,
        },
        order: [["createdDate", "DESC"]],
      });

      if (res) {
        const currentUtcTime = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(currentUtcTime.getTime() + istOffset);
        const logoutTime = istTime.toISOString().slice(0, 19).replace("T", " ");

        await logiHistoryCustomerModel.update(
          { logoutTime: currentUtcTime },
          {
            where: {
              id: findData?.id,
            },
          }
        );
      }

      return res;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const generateCustomerLoginHistory = async (
  customerId,
  customerEmail,
  browserInfo,
  ipAddress,
  os,
  isLoginSuccess
) => {
  try {
    const newLog = await logiHistoryCustomerModel.create({
      customerId,
      customerEmail,
      browserInfo,
      ipAddress,
      os,
      isLoginSuccess,
    });

    return newLog;
  } catch (error) {
    console.error("Error generating log:", error);
    throw new Error("Failed to generate log");
  }
};

const customerLogHistoryData = async (
  id,
  page,
  perPage,
  dateRange,
  searchFilter,
  sortOrder = "desc",
  orderBy = "id",
  selectedType
) => {
  try {
    const actualPage = parseInt(page, 10) || 1;
    const actualPerPage = parseInt(perPage, 10) || 25;
    const offset = (actualPage - 1) * actualPerPage;

    let whereClause = {};

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      whereClause.createdDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (searchFilter) {
      const customerSubQuery = `(SELECT CONCAT(firstName, ' ', middleName, ' ', lastName) FROM customer WHERE customer.email COLLATE utf8mb4_general_ci = login_history_customer.customerEmail COLLATE utf8mb4_general_ci)`;

      whereClause[Op.or] = [
        { customerEmail: { [Op.like]: `%${searchFilter}%` } },
        { browserInfo: { [Op.like]: `%${searchFilter}%` } },
        { os: { [Op.like]: `%${searchFilter}%` } },
        { ipAddress: { [Op.like]: `%${searchFilter}%` } },
        sequelize.literal(`(${customerSubQuery}) LIKE '%${searchFilter}%'`),
      ];
    }

    if (selectedType) {
      whereClause.isLoginSuccess = {
        [Op.like]: `%${selectedType}%`,
      };
    }

    let order = [];
    if (orderBy === "customerFirstName") {
      order = [["customerFirstName", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "customerEmail") {
      order = [["customerEmail", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "os") {
      order = [["os", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "browserInfo") {
      order = [["browserInfo", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "ipAddress") {
      order = [["ipAddress", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "createdDate") {
      order = [["createdDate", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else if (orderBy === "isLoginSuccess") {
      order = [["isLoginSuccess", sortOrder === "asc" ? "ASC" : "DESC"]];
    } else {
      order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
    }

    const result = await logiHistoryCustomerModel.findAndCountAll({
      where: whereClause,
      limit: actualPerPage,
      offset: offset,
      order: order,
      attributes: {
        include: [
          [
            literal(`(
              SELECT firstName
              FROM customer
              WHERE customer.email COLLATE utf8mb4_general_ci = login_history_customer.customerEmail COLLATE utf8mb4_general_ci
            )`),
            "customerFirstName",
          ],
          [
            literal(`(
              SELECT middleName
              FROM customer
              WHERE customer.email COLLATE utf8mb4_general_ci = login_history_customer.customerEmail COLLATE utf8mb4_general_ci
            )`),
            "customerMiddleName",
          ],
          [
            literal(`(
              SELECT lastName
              FROM customer
              WHERE customer.email COLLATE utf8mb4_general_ci = login_history_customer.customerEmail COLLATE utf8mb4_general_ci
            )`),
            "customerLastName",
          ],
          [
            literal(`(
              SELECT email
              FROM customer
              WHERE customer.email COLLATE utf8mb4_general_ci = login_history_customer.customerEmail COLLATE utf8mb4_general_ci
            )`),
            "customerEmail",
          ],
        ],
      },
    });

    return {
      totalRecords: result.count,
      records: result.rows,
    };
  } catch (error) {
    console.error("Error fetching customer log history data:", error);
    throw new Error("Error fetching customer log history data.");
  }
};
const customerAndGenderData = async () => {
  try {
    const customerData = await customerModel.findAndCountAll({});
    const customers = customerData.rows;

    const activeCustomerCount = customers.filter(
      (customer) => customer.dataValues.isDeleted === "0"
    ).length;
    const maleCustomerCount = customers.filter(
      (customer) => customer.dataValues.gender === "0"
    ).length;
    const femaleCustomerCount = customers.filter(
      (customer) => customer.dataValues.gender === "1"
    ).length;
    const othersCustomerCount = customers.filter(
      (customer) => customer.dataValues.gender === "2"
    ).length;

    return {
      totalCustomers: customerData.count,
      activeCustomerCount: activeCustomerCount,
      gender: {
        maleCustomerCount: maleCustomerCount,
        femaleCustomerCount: femaleCustomerCount,
        othersCustomerCount: othersCustomerCount,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRevenueCustomerList = async (searchQuery, customerIds) => {
  try {
    let whereCondition = {};

    // If customerIds are provided, filter by them
    if (customerIds && customerIds.length > 0) {
      whereCondition.id = { [Op.in]: customerIds };
    }

    // If searchQuery is provided, search across name fields and nibImageId
    if (searchQuery) {
      const normalizedSearchQuery = searchQuery.toLowerCase().trim();
      whereCondition = {
        [Op.or]: [
          { firstName: { [Op.like]: `%${normalizedSearchQuery}%` } },
          { middleName: { [Op.like]: `%${normalizedSearchQuery}%` } },
          { lastName: { [Op.like]: `%${normalizedSearchQuery}%` } },
          { nibNumber: { [Op.like]: `%${normalizedSearchQuery}%` } },
        ],
      };
    }

    // Fetch the matching customers
    const result = await customerModel.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "firstName", "middleName", "lastName", "nibNumber"],
    });

    return result;
  } catch (error) {
    console.error("Error fetching customer list:", error);
    throw new Error(error);
  }
};

const getCustomerListForAdmin = async (customerIds) => {
  try {
    let whereCondition = {};

    if (customerIds && customerIds.length > 0) {
      whereCondition.id = { [Op.in]: customerIds };
    }

    // Fetch the matching customers
    const result = await customerModel.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "firstName",
        "middleName",
        "lastName",
        "nibNumber",
        "mobileNumber",
        "email",
        "nibImageId",
      ],
    });

    return result;
  } catch (error) {
    console.error("Error fetching customer list:", error);
    throw new Error(error);
  }
};
const delinkCustomerProfileService = async (customerId,customer) => {
  try {
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
          await axios.post(`${process.env.PAYMENT_URL}customerDetails/create`, {
            data,
          });
        } catch (error) {
          console.log(error);
        }
      }
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createCustomerService,
  findCustomerByEmail,
  findCustomerById,
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
  getCustomerList,
  changeCustomerPassword,
  generateLoginSession,
  findLoginSession,
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
  customerLinkExpireTime
};
