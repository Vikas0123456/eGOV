const {
  createNewKnowledgeBase,
  updateKnowledgeBaseData,
  getKnowledgeBaseList,
  deleteKnowledgeBaseById,
  getKnowledgeBaseDetails,
  knowledgeBaseAllList,
  authorsList,
  deleteKnowledgeBasesByIds,
  knowledgeBaseDataById,
  likeCount,
} = require("../services/knowledgebase.services");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createKnowledgeBase = async (req, res) => {
  try {
    const reqBody = req.body.data;
    let newKnowledgeBase = await createNewKnowledgeBase(reqBody, req);

    if (newKnowledgeBase) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.ADDED_SUCCESS,
        success: true,
        data: newKnowledgeBase,
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

const updateKnowledgeBase = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { knowledgebaseId } = req.body.data;

    let updateKnowledgeBase = await updateKnowledgeBaseData(knowledgebaseId, reqBody, req);
    if (updateKnowledgeBase) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.UPDATE_SUCCESS,
        success: true,
        data: updateKnowledgeBase,
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

const getKnowledgeBase = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy, departmentId, dateRange, isCoreteam, selectedAuthor, visibility, status } = req.body.data;

    let knowledgeBaseData = await getKnowledgeBaseList(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy,
      departmentId,
      dateRange,
      isCoreteam,
      selectedAuthor,
      visibility,
      status
    );

    if (knowledgeBaseData) {
      return res.status(200).json({
        message: "Knowledge base fetched successfully.",
        success: true,
        data: knowledgeBaseData,
      });
    } else {
      return res.status(500).json({
        message: "Failed to fetch knowledge base.",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.error("Error fetching knowledge base:", error);
    return res.status(500).json({
      message: "Server error.",
      success: false,
      data: {},
    });
  }
};

const knowledgeBaseData = async (req, res) => {
  try {
    const { id, page, perPage, searchFilter, sortOrder, orderBy, departmentId, isCoreteam } = req.body.data;

    let knowledgeBaseData = await knowledgeBaseDataById(
      id,
      page,
      perPage,
      searchFilter,
      sortOrder,
      orderBy,
      departmentId,
      isCoreteam
    );

    if (knowledgeBaseData) {
      return res.status(200).json({
        message: "Knowledge base fetched successfully.",
        success: true,
        data: knowledgeBaseData,
      });
    } else {
      return res.status(500).json({
        message: "Failed to fetch knowledge base.",
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.error("Error fetching knowledge base:", error);
    return res.status(500).json({
      message: "Server error.",
      success: false,
      data: {},
    });
  }
};

const deleteKnowledgeBase = async (req, res) => {
  try {
    const { id } = req.body.data;
    if (id) {
      const result = await deleteKnowledgeBaseById(id, req);
      if (!result) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.KNOWLEDGE_BASE.DELETE_FAILED,
          success: false,
          data: {},
        });
      } else {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.KNOWLEDGE_BASE.DELETE_SUCCESS,
          success: true,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.KNOWLEDGE_BASE.KNOWLEDGE_BASE_ID_NOT_FOUND,
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

const getKnowledgeBaseById = async (req, res) => {
  try {
    const { id } = req.body.data;

    if (!id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.KNOWLEDGE_BASE.INVALID_KNOWLEDGE_BASE_ID,
        success: false,
        data: {},
      });
    }

    let knowledgeBaseData = await getKnowledgeBaseDetails(id);

    if (knowledgeBaseData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_SUCCESS,
        success: true,
        data: knowledgeBaseData,
      });
    } else {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_FAILED,
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

const listKnowledgeBase = async (req, res) => {
  try {
    const { id, searchFilter } = req.body;
    let knowledgeBaseData = await knowledgeBaseAllList(id, searchFilter);
    if (knowledgeBaseData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_SUCCESS,
        success: true,
        data: { ...knowledgeBaseData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_FAILED,
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

const listAuthors = async (req, res) => {
  try {
    const { searchQuery } = req.body.data;
    let knowledgeBaseData = await authorsList(searchQuery);
    if (knowledgeBaseData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_SUCCESS,
        success: true,
        data: { authors: knowledgeBaseData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_FAILED,
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

const deleteKnowledgeBases = async (req, res) => {
  try {
    const { ids } = req.body.data;
    if (!Array.isArray(ids)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "Invalid data format. IDs must be an array.",
        success: false,
        data: {},
      });
    }

    const result = await deleteKnowledgeBasesByIds(ids, req);
    if (!result) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.KNOWLEDGE_BASE.DELETE_FAILED,
        success: false,
        data: {},
      });
    } else {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.DELETE_SUCCESS,
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

const listLikeCount = async (req, res) => {
  try {
    let knowledgeBaseData = await likeCount();
    if (knowledgeBaseData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_SUCCESS,
        success: true,
        data: { knowledgeBaseData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.KNOWLEDGE_BASE.FETCH_FAILED,
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
  createKnowledgeBase,
  updateKnowledgeBase,
  getKnowledgeBase,
  knowledgeBaseData,
  deleteKnowledgeBase,
  getKnowledgeBaseById,
  listKnowledgeBase,
  listAuthors,
  deleteKnowledgeBases,
  listLikeCount
};
