const {
    createNewUpcomingEvent,
  updateUpcomingEventData,
  getUpcomingEventList,
  } = require("../services/upcomingEvents.service");
  const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
  
  const createUpcomingEvent = async (req, res) => {
    try {
      const reqBody = req.body.data;
      let newUpdateEventData = await createNewUpcomingEvent(reqBody, req);
  
      if (newUpdateEventData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.UPCOMING_EVENTS.ADDED_SUCCESS,
          success: true,
          data: newUpdateEventData,
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
  
  const updateUpcomingEvent = async (req, res) => {
    try {
      const reqBody = req.body.data;
      const { id } = req.body.data;
  
      let updateEventData = await updateUpcomingEventData(id, reqBody, req);
      if (updateEventData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.UPCOMING_EVENTS.UPDATE_SUCCESS,
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
  
  const getUpcomingEvent = async (req, res) => {
    try {
      const { id, page, perPage, searchFilter, sortOrder, orderBy,isCoreteam,dateRange } = req.body.data;
      
      let eventData = await getUpcomingEventList(
        id,
        page,
        perPage,
        searchFilter,
        sortOrder,
        orderBy,
        dateRange,
        isCoreteam
      );
      if (eventData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.UPCOMING_EVENTS.FETCH_SUCCESS,
          success: true,
          data: { ...eventData },
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
    createUpcomingEvent,
    updateUpcomingEvent,
    getUpcomingEvent,
  };
  