const { emailtemplatesModel, customerModel } = require("../models");
const {
  createNewFeedback,
  getFeedbackList,
} = require("../services/feedback.service");
const { feedbackMail } = require("../utils/mail/feedbackMail");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createFeedback = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let customer = await customerModel.findOne({
      where: { id: reqBody.customerId },
    });
    if (customer) {
      let newFeedback = await createNewFeedback(reqBody, req);
      if (newFeedback) {
        const getTemplate = await emailtemplatesModel.findOne({
          where: {
            slug: "feedback",
          },
        });
        const fullName = `${customer.firstName} ${customer.middleName} ${customer.lastName}`;
        let htmlTemplate = getTemplate.content
          .replace(/@@REVIEW@@/g, reqBody.note)
          .replace(/@@RATING@@/g, reqBody.rating)
          .replace(/@@EMAIL@@/g, customer.email)
          .replace(/@@USERNAME@@/g, fullName);

        // await feedbackMail("v1.netclues@gmail.com", htmlTemplate);
        // await feedbackMail(customer.email, htmlTemplate);

        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.FEEDBACK.ADDED_SUCCESS,
          success: true,
          data: newFeedback,
        });
      }
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy, dateRange } =
      req.body.data;

    let faqData = await getFeedbackList(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy,
      dateRange
    );
    if (faqData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.FEEDBACK.FETCH_SUCCESS,
        success: true,
        data: { ...faqData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.FEEDBACK.FETCH_FAILED,
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

module.exports = {
  createFeedback,
  getFeedback,
};
