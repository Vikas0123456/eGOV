const {
  updateEmailTemplateData,
  getEmailTemplateList,
  getEmailTemplateSlug,
} = require("../services/emailtemplate.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const updateEmailTemplate = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { id } = req.body.data;

    let updateEventData = await updateEmailTemplateData(id, reqBody, req);
    if (updateEventData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.EMAIL_TEMPLATE.UPDATE_SUCCESS,
        success: true,
        data: updateEventData,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
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

const getEmailTemplate = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy } =
      req.body.data;

    let templateData = await getEmailTemplateList(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy
    );
    if (templateData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.EMAIL_TEMPLATE.FETCH_SUCCESS,
        success: true,
        data: { ...templateData },
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
const getEmailTemplatebySlug = async (req, res) => {
  try {
    const { slug } = req.body.data;

    let templateData = await getEmailTemplateSlug(slug);
    if (templateData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.EMAIL_TEMPLATE.FETCH_SUCCESS,
        success: true,
        data: { ...templateData },
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
  updateEmailTemplate,
  getEmailTemplate,
  getEmailTemplatebySlug,
};
