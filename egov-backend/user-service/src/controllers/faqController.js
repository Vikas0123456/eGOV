const {
  createNewFaq,
  updateFaqsData,
  getFaqList,
} = require("../services/faq.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createFaq = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let newFaq = await createNewFaq(reqBody, req);

    if (newFaq) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.FAQ.ADDED_SUCCESS,
        success: true,
        data: newFaq,
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
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const updateFaq = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { id } = req.body.data;

    let updateFaq = await updateFaqsData(id, reqBody, req);
    if (updateFaq) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.FAQ.UPDATE_SUCCESS,
        success: true,
        data: updateFaq,
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

const getFaq = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy,isCoreteam } = req.body.data;
    
    let faqData = await getFaqList(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy,
      isCoreteam
    );
    if (faqData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.FAQ.FETCH_SUCCESS,
        success: true,
        data: { ...faqData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.FAQ.FETCH_FAILED,
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
  createFaq,
  updateFaq,
  getFaq,
};
