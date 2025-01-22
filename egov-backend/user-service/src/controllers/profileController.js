const { customerModel, auditLogModel, emailtemplatesModel } = require("../models");
const {
  findCustomerByEmail,
  isNIBnumberExist,
} = require("../services/customer.service");
const {
  getCustomerProfile,
  createCustomerProfileService,
  updateCustomerProfileByIdService,
} = require("../services/profile.service");
const { delinkMailToParentCustomer } = require("../utils/mail/sendMailCustomer");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getCustomerProfileList = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, keyword } = req.body.data;
    let customerData = await getCustomerProfile(
      id,
      page,
      perPage,
      searchFilter,
      keyword
    );
    if (customerData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PROFILE.FETCH_SUCCESS,
        success: true,
        data: { ...customerData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.CUSTOMER_PROFILE.FETCH_FAILED,
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

const createCustomerProfile = async (req, res) => {
  try {
    const reqBody = req.body.data;

    const { email, firstName, nibNumber } = reqBody;

    if (email) {
      const existingCustomer = await findCustomerByEmail(email);
      if (existingCustomer) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER_PROFILE.ALREADY_EXIST,
          success: false,
          data: {},
        });
      }
    }

    if (!firstName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER_PROFILE.NAME_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER_PROFILE.EMAIL_NOT_ENTER,
        success: false,
        data: {},
      });
    }
    if (nibNumber) {
      const isNibNumberExist = await isNIBnumberExist(nibNumber);

      if (isNibNumberExist) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.CUSTOMER_PROFILE.NIB_NUMBER_EXIST,
          success: false,
          data: {},
        });
      }
    }
    let newCustomer = await createCustomerProfileService(reqBody, req);

    if (newCustomer) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PROFILE.CUSTOMER_ADDED,
        success: true,
        data: newCustomer,
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

const updateCustomerProfileById = async (req, res) => {
  try {
    const { id } = req.body.data;
    const reqBody = req.body.data;

    let updateCustomerProfile = await updateCustomerProfileByIdService(
      id,
      reqBody,
      req
    );

    if (updateCustomerProfile) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PROFILE.UPDATE_SUCCESS,
        success: true,
        data: updateCustomerProfile,
      });
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.CUSTOMER_PROFILE.UPDATE_FAILED,
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
const getEmailsFromCustomerModel = async (customerIds) => {
  const customers = await customerModel.findAll({
    where: {
      id: customerIds,
    },
    attributes: ["email"],
  });

  return customers.map((customer) => customer.email).join(", ");
};

const transferCustomer = async (req, res) => {
  const { linkedCustomerIds, newParentDetails, oldParentDetails, ipAddress } =
    req.body.data;
  try {
    if (newParentDetails?.customerId) {
      const [customer] = await customerModel.update(
        { linkToCustomerId: newParentDetails?.customerId },
        { where: { id: linkedCustomerIds } }
      );
      if (customer) {
        const linkedEmails = await getEmailsFromCustomerModel(
          linkedCustomerIds
        );
        const successAuditLog = {
          recordId: JSON.stringify(linkedCustomerIds),
          action: `Customer (${linkedEmails}) has been successfully transferred under (${newParentDetails?.email}).`,
          moduleName: "Customer Service",
          newValue: JSON.stringify(newParentDetails),
          oldValue: JSON.stringify(oldParentDetails),
          type: "2",
          userId: null,
          customerId: oldParentDetails?.customerId,
          ipAddress,
        };
        await auditLogModel.create(successAuditLog);

        const parentfullName = oldParentDetails?.name;
  
        const getParentEmailTemplate = await emailtemplatesModel.findOne({
          where: {
            slug: "delink_transfer_customer_email_success",
          },
        });
        
        let htmlParentTemplate = getParentEmailTemplate.content
          .replace(/@@parent_customer@@/g, parentfullName)
          // .replace(/@@customer_name@@/g, fullName)
          .replace(/@@customer_email@@/g, linkedEmails)
          .replace(/@@new_parent_email@@/g,newParentDetails?.email)
          
        //  delinkMailToParentCustomer("v1.netclues@gmail.com", htmlParentTemplate,true)
         delinkMailToParentCustomer(oldParentDetails?.email, htmlParentTemplate,true)
      }
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PROFILE.UPDATE_SUCCESS,
        success: true,
        data: { customer },
      });
    } else {
      const linkedEmails = await getEmailsFromCustomerModel(linkedCustomerIds);
      const successAuditLog = {
        recordId: JSON.stringify(linkedCustomerIds),
        action: `Failed to transfer customer (${linkedEmails}) under (${newParentDetails?.email}).`,
        moduleName: "Customer Service",
        newValue: JSON.stringify(newParentDetails),
        oldValue: JSON.stringify(oldParentDetails),
        type: "2",
        userId: null,
        customerId: oldParentDetails?.customerId,
        ipAddress,
      };
      await auditLogModel.create(successAuditLog);
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.CUSTOMER_PROFILE.UPDATE_SUCCESS,
        success: true,
        data: {},
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

module.exports = {
  getCustomerProfileList,
  createCustomerProfile,
  updateCustomerProfileById,
  transferCustomer,
};
