const { emailtemplatesModel } = require("../models");
const {
  createNewSupport,
  getSupportList,
} = require("../services/support.services");
const { supportMail } = require("../utils/mail/sendMail");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createSupport = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let newSupportData = await createNewSupport(reqBody, req);

    if (newSupportData) {
      const getTemplate = await emailtemplatesModel.findOne({
        where: {
          slug: "support",
        },
      });
      const htmlTemplate = getTemplate.content
        .replace(/@@USERNAME@@/g, reqBody.name)
        .replace(/@@USEREMAIL@@/g, reqBody.email)
        .replace(/@@USERMESSAGE@@/g, reqBody.message);
      await supportMail("v1.netclues@gmail.com", htmlTemplate);

      // await supportMail(reqBody?.email, htmlTemplate);
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.SUPPORT.ADDED_SUCCESS,
        success: true,
        data: newSupportData,
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

const getSupport = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy, isCoreteam } =
      req.body.data;

    let supportData = await getSupportList(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy,
      isCoreteam
    );
    if (supportData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.SUPPORT.FETCH_SUCCESS,
        success: true,
        data: { ...supportData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SUPPORT.FETCH_FAILED,
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
  createSupport,
  getSupport,
};
