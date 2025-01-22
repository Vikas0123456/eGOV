const {
    likeDislikeKnowledgeBase,
    getLikeDislikeDetails,
  } = require("../services/likeDislike.service");
  const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

  const likeDislike = async (req, res) => {
    try {
      const { id, islike, customerId } = req.body.data;
  
      const result = await likeDislikeKnowledgeBase(id, islike, customerId, req);
  
      if (result.success) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: result.message,
          success: true,
          data: result.data,
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: result.message,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  };

  const getLikeDislikeById = async (req, res) => {
    try {
      const { id, customerId } = req.body.data;
  
      if (!id) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.LIKE_DISLIKE.INVALID_LIKE_DISLIKE_ID,
          success: false,
          data: {},
        });
      }
  
      let knowledgeBaseData = await getLikeDislikeDetails(id, customerId);
  
      if (knowledgeBaseData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.LIKE_DISLIKE.FETCH_SUCCESS,
          success: true,
          data: knowledgeBaseData,
        });
      } else {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          message: MESSAGES.LIKE_DISLIKE.FETCH_FAILED,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  };
  

module.exports = {
    likeDislike,
    getLikeDislikeById
};
