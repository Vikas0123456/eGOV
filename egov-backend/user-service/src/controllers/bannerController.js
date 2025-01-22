const {
    createBanner,
    deleteBannerById,
    updateBannerById,
    getBannerList,
  } = require("../services/banner.service");
  const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
  
  const createNewBanner = async (req, res) => {
    try {
      const reqBody = req.body.data;
      const { title } = reqBody;
  
      if (!title) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.BANNER.TITLE_NOT_ENTER,
          success: false,
          data: {},
        });
      }

      let newDepartment = await createBanner(reqBody, req);
  
      if (newDepartment) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.BANNER.BANNER_ADDED,
          success: true,
          data: newDepartment,
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
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  };
  const deleteBanner = async (req, res) => {
    try {
      const { id } = req.body.data;
      if (id) {
        const result = await deleteBannerById(id, req);
        if (!result) {
          return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.BANNER.BANNER_DELETE_FAILED,
            success: false,
            data: {},
          });
        } else {
          return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.BANNER.BANNER_DELETE,
            success: true,
            data: {},
          });
        }
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.BANNER.BANNER_ID_NOT_FOUND,
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
  const updateBanner = async (req, res) => {
    try {
      const { id } = req.body.data;
      const reqBody = req.body.data;
  
      if (id) {
        let updateBanner = await updateBannerById(id, reqBody, req);
        
        if (updateBanner) {
          return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.BANNER.BANNER_UPDATE,
            success: true,
            data: updateBanner,
          });
        } else {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.BANNER.BANNER_UPDATE_FAILED,
            success: false,
            data: {},
          });
        }
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.BANNER.BANNER_ID_NOT_FOUND,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message:
          error.message === "SequelizeUniqueConstraintError: Validation error"
            ? MESSAGES.BANNER.BANNER_EXIST
            : error.message,
        success: false,
        data: {},
      });
    }
  };
  const getBanner = async (req, res) => {
    try {
      const { id, page, perPage, searchFilter, sortOrder,orderBy,isCoreteam } = req.body.data;
      let bannerData = await getBannerList(
        id,
        page,
        perPage,
        searchFilter,
        sortOrder,
        orderBy,
        isCoreteam
      );
      if (bannerData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.BANNER.BANNER_FETCH,
          success: true,
          data: { ...bannerData },
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.BANNER.BANNER_FETCH_FAILED,
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
  const getBannerKeyword = async (req, res) => {
    try {
      let deptkeyword = await getDeptKeywordList();
      if (deptkeyword) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.BANNER.FETCH_KEYWORD,
          success: true,
          data: { ...deptkeyword },
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.BANNER.FETCH_FAILED_KEYWORD,
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
  
  module.exports = {
    createNewBanner,
    deleteBanner,
    updateBanner,
    getBanner,
    getBannerKeyword,
  };
  