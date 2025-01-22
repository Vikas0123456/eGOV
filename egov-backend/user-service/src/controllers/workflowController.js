const {
  createWorkflowService,
  getWorkflowService,
  getWorkflowServiceById,
  deleteWorkflowByIdService,
  updateWorkflowService,
  getAddedworkflowServiceBydepartment,
  getWorkflowForApplicationService,
  createNewWorkflowService,
  getPreviousAddedworkflowServiceBydepartment,
  getWorkflowActionsService,
  getNewWorkflowForApplicationService,
} = require("../services/workflow.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createWorkflow = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { workflowName, userId } = reqBody;
    if (!workflowName) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.WORKFLOW_NAME_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.USER_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    let newWorkflow = await createWorkflowService(reqBody, req);

    if (newWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.ADDED_SUCCESS,
        success: true,
        data: newWorkflow,
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
const getWorkflowById = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { workflowId } = reqBody;

    let getWorkflow = await getWorkflowServiceById(workflowId);

    if (getWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SUCCESS,
        success: true,
        data: getWorkflow,
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
const getWorkflow = async (req, res) => {
  try {
    const reqBody = req.body.data;

    let getWorkflow = await getWorkflowService(reqBody);

    if (getWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SUCCESS,
        success: true,
        data: getWorkflow,
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
const deleteWorkflowById = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { workflowId } = reqBody;
    if (!workflowId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.WORKFLOW_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    let getWorkflow = await deleteWorkflowByIdService(workflowId, req);

    if (getWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.DELETE_SUCCESS,
        success: true,
        data: getWorkflow,
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
const updateWorkflow = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { workflowId, userId } = reqBody;
    if (!workflowId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.WORKFLOW_ID_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.USER_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    let updateWorkflow = await updateWorkflowService(reqBody, req);

    if (updateWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.UPDATE_SUCCESS,
        success: true,
        data: updateWorkflow,
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

const getAddedworkflowService = async (req, res) => {
  try {
    const reqBody = req.body.data;

    let getWorkflowServices = await getAddedworkflowServiceBydepartment(
      reqBody
    );

    if (getWorkflowServices) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SERVICES_ID_SUCCESS,
        success: true,
        data: getWorkflowServices,
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
const getWorkflowForApplication = async (req, res) => {
  try {
    const reqBody = req.body.data;

    let getWorkflowServices = await getWorkflowForApplicationService(reqBody);

    if (getWorkflowServices) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SUCCESS,
        success: true,
        data: getWorkflowServices,
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
const getNewWorkflowForApplication= async(req,res) =>{
  try {
    const reqBody = req.body.data;

    let getWorkflowServices = await getNewWorkflowForApplicationService(reqBody);

    if (getWorkflowServices) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SUCCESS,
        success: true,
        data: getWorkflowServices,
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
}
const createNewWorkflow = async (req,res)=>{
  try {
    const reqBody = req.body.data;
    const {userId } = reqBody;
    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.WORKFLOW.USER_NOT_FOUND,
        success: false,
        data: {},
      });
    }

    let newWorkflow = await createNewWorkflowService(reqBody,req);

    if (newWorkflow) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.ADDED_SUCCESS,
        success: true,
        data: newWorkflow,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
}
const getAddedNeWworkflowService = async (req, res) => {
  try {
    const reqBody = req.body.data;

    let getWorkflowServices = await getPreviousAddedworkflowServiceBydepartment(
      reqBody
    );

    if (getWorkflowServices) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SERVICES_ID_SUCCESS,
        success: true,
        data: getWorkflowServices,
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

const getWorkflowActions = async (req, res) => {
  try {
    const reqBody = req.body.data;

    let getWorkflowAction = await getWorkflowActionsService(reqBody);

    if (getWorkflowAction) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.WORKFLOW.FETCH_SUCCESS,
        success: true,
        data: getWorkflowAction,
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

module.exports = {
  createWorkflow,
  getWorkflow,
  getWorkflowById,
  deleteWorkflowById,
  updateWorkflow,
  getAddedworkflowService,
  getWorkflowForApplication,
  createNewWorkflow,
  getAddedNeWworkflowService,
  getWorkflowActions,
  getNewWorkflowForApplication
};
