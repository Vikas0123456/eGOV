const { sequelize } = require("../config/db.connection");
const { Op } = require("sequelize");
const {
  workflowModel,
  workflowDetailsModel,
  usersModel,
} = require("../models");
const {
  generateAuditLog,
  extractDataFromRequest,
} = require("./auditLog.service");
const { default: axios } = require("axios");
const workflowActionModel = require("../models/workflowActions");

const createWorkflowService = async (requestBody, req) => {
  try {
    const { workflowName, userId, workflow, workflowFor } = requestBody;

    const workflowDepartmentId = workflow[0]?.departmentId;

    // Step 1: Create a new workflow entry
    const newWorkflow = await workflowModel.create({
      workflowName: workflowName,
      userId: userId,
      workflowDepartmentId: workflowDepartmentId,
      workflowFor: workflowFor,
    });
    // Step 2: Use the obtained workflowId to associate each detail entry
    const workflowId = newWorkflow?.id;
    let createdDetails = [];

    if (workflowId) {
      for (const workflowDetail of workflow) {
        const createdDetail = await workflowDetailsModel.create({
          workflowId,
          workflowMethod: workflowDetail.workflowMethod,
          departmentId: workflowDetail.departmentId,
          isDirectApproval: workflowDetail.isDirectApproval,
          TAT: workflowDetail.TAT,
          roleId: workflowDetail.roleId,
          serviceSlug: JSON.stringify(workflowDetail.serviceListApproval),
          userId: JSON.stringify(workflowDetail.selectedUser),
        });
        createdDetails.push(createdDetail);
      }
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Workflow",
        requestBody,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return { newWorkflow, createdDetails };
  } catch (error) {
    throw new Error(error);
  }
};
const updateWorkflowService = async (requestBody, req) => {
  const { workflowId, workflowName, userId, workflow, workflowFor } =
    requestBody;

  try {
    const workflowDepartmentId = workflow[0]?.departmentId;

    // Step 1: Update the workflow entry
    const [workflowUpdated] = await workflowModel.update(
      {
        workflowName,
        userId,
        workflowFor,
        workflowDepartmentId,
      },
      {
        where: { id: workflowId },
      }
    );

    // Step 2: Fetch existing workflow details from the database
    const existingDetails = await workflowDetailsModel.findAll({
      where: { workflowId: workflowId },
    });

    const existingDetailIds = existingDetails.map((detail) => detail.id);
    const incomingDetailIds = workflow
      .map((detail) => detail.id)
      .filter((id) => id);

    // Step 3: Determine which details to delete
    const detailsToDelete = existingDetailIds.filter(
      (id) => !incomingDetailIds.includes(id)
    );
    if (detailsToDelete.length > 0) {
      await workflowDetailsModel.destroy({
        where: { id: detailsToDelete },
      });
    }

    // Step 4: Update or create details based on the incoming data
    for (const workflowDetail of workflow) {
      if (workflowDetail.id) {
        // Update existing detail
        await workflowDetailsModel.update(
          {
            departmentId: workflowDetail.departmentId,
            workflowMethod: workflowDetail.workflowMethod,
            isDirectApproval: workflowDetail.isDirectApproval,
            TAT: workflowDetail.TAT,
            roleId: workflowDetail.roleId,
            serviceSlug: JSON.stringify(workflowDetail.serviceListApproval),
            userId: JSON.stringify(workflowDetail.selectedUser),
          },
          {
            where: { id: workflowDetail.id },
          }
        );
      } else {
        // Create new detail
        await workflowDetailsModel.create({
          workflowId,
          workflowMethod: workflowDetail.workflowMethod,
          departmentId: workflowDetail.departmentId,
          isDirectApproval: workflowDetail.isDirectApproval,
          TAT: workflowDetail.TAT,
          roleId: workflowDetail.roleId,
          serviceSlug: JSON.stringify(workflowDetail.serviceListApproval),
          userId: JSON.stringify(workflowDetail.selectedUser),
        });
      }
    }

    const currentRecord = await workflowModel.findOne({
      where: {
        id: workflowId,
      },
    });

    if (!currentRecord) {
      return { success: false, message: "Knowledge base record not found" };
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;

    try {
      await generateAuditLog(
        workflowId,
        "Update",
        "Workflow",
        requestBody,
        currentRecord.dataValues,
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return { message: "Workflow updated successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getWorkflowServiceById = async (workflowId) => {
  try {
    if (workflowId) {
      // Fetch the workflow
      const workflow = await workflowModel.findOne({
        where: { id: workflowId, isDeleted: "0" },
        attributes: [
          "id",
          "workflowName",
          "userId",
          "workflowFor",
          "workflowDepartmentId",
        ],
      });

      // Fetch workflow details
      const workflowDetails = await workflowDetailsModel.findAll({
        where: { workflowId },
        attributes: [
          "id",
          "departmentId",
          "workflowMethod",
          "workflowId",
          "isDirectApproval",
          "TAT",
          "roleId",
          "userId",
          "serviceSlug",
        ],
      });

      // Format the data
      const formattedDetails = workflowDetails.map((detail) => ({
        id: detail.id,
        departmentId: detail.departmentId,
        workflowId: detail.workflowId,
        workflowMethod: detail.workflowMethod,
        isDirectApproval: detail.isDirectApproval,
        TAT: detail.TAT,
        roleId: detail.roleId,
        selectedUser: JSON.parse(detail.userId || "[]"),
        serviceListApproval: JSON.parse(detail.serviceSlug || "[]"),
      }));

      return {
        id: workflow.id,
        workflowName: workflow.workflowName,
        userId: workflow.userId,
        workflowFor: workflow.workflowFor,
        workflowDepartmentId: workflow.workflowDepartmentId,
        workflow: formattedDetails,
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
const getWorkflowService = async (reqBody) => {
  try {
    const {
      page,
      perPage,
      searchFilter,
      workflowDepartmentId,
      sortOrder,
      orderBy,
    } = reqBody;

    // Fetch department data using API call
    let departmentsData;
    try {
      const departmentResponse = await axios.post(
        `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
      );
      departmentsData = departmentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    function getDepartmentNameById(departmentId, departmentsData) {
      if (!departmentId || !departmentsData) return null;
      const department = departmentsData.find(
        (dept) => dept.id == departmentId
      );
      return department ? department.departmentName : null;
    }

    // Define default values for pagination and sorting
    const pageNumber = page || 1;
    const pageSize = perPage || 25;
    const offset = (pageNumber - 1) * pageSize;
    const sortColumn = orderBy || "workflowName";
    const sortDirection = sortOrder || "ASC";

    // Define the search filter condition
    const searchCondition = searchFilter
      ? {
          workflowName: {
            [Op.like]: `%${searchFilter}%`,
          },
        }
      : {};
    // Define the department filter condition
    const departmentCondition = workflowDepartmentId
      ? { workflowDepartmentId: workflowDepartmentId }
      : {};

    // Fetch the workflows with pagination, search filter, sorting, and user info
    const workflows = await workflowModel.findAndCountAll({
      where: {
        isDeleted: "0",
        ...searchCondition,
        ...departmentCondition,
      },
      attributes: [
        "id",
        "workflowName",
        "workflowFor",
        "userId",
        "workflowDepartmentId",
        "workflowServiceSlug",
        "workflowData",
      ],
      include: [
        {
          model: usersModel,
          as: "user",
          attributes: ["id", "name", "isCoreTeam", "departmentId"],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: [[sortColumn, sortDirection]],
      raw: true,
    });

    // Map department names to workflows
    const workflowData = workflows.rows.map((workflow) => {
      const userDepartmentId = workflow["user"]
        ? workflow["user.departmentId"]
        : null;
      return {
        id: workflow?.id,
        workflowName: workflow?.workflowName,
        userId: workflow?.userId,
        workflowFor: workflow?.workflowFor,
        workflowDepartmentId: workflow?.workflowDepartmentId,
        workflowServiceSlug: workflow?.workflowServiceSlug,
        workflowData: workflow?.workflowData,
        user: {
          id: workflow["user.id"],
          name: workflow["user.name"],
          isCoreTeam: workflow["user.isCoreTeam"],
          departmentId: workflow["user.departmentId"],
          departmentName: getDepartmentNameById(
            userDepartmentId,
            departmentsData
          ),
        },
        department: {
          id: workflow.workflowDepartmentId,
          departmentName: getDepartmentNameById(
            workflow.workflowDepartmentId,
            departmentsData
          ),
        },
      };
    });

    return {
      count: workflows.count,
      rows: workflowData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
const deleteWorkflowByIdService = async (workflowId, req) => {
  try {
    const [affectedRows] = await workflowModel.update(
      { isDeleted: "1" },
      {
        where: {
          id: workflowId,
        },
      }
    );

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        workflowId,
        "Delete",
        "Workflow",
        workflowId,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return affectedRows;
  } catch (error) {
    throw new Error(error);
  }
};

const getAddedworkflowServiceBydepartment = async (reqBody) => {
  try {
    const { departmentId, workflowId, workflowFor } = reqBody;
    const workflows = await workflowModel.findAll({
      where: {
        workflowDepartmentId: departmentId,
        isDeleted: "0",
        workflowFor: workflowFor,
      },
      attributes: ["id"],
    });
    const workflowIds = workflows
      .map((workflow) => workflow.id)
      .filter((id) => id !== workflowId);
    // const workflowIds = workflows.map((workflow) => workflow.id);
    // Find workflow details by workflowIds
    const workflowDetails = await workflowDetailsModel.findAll({
      where: { workflowId: workflowIds },
    });

    const result = workflowIds
      .map((workflowId) => {
        const details = workflowDetails.filter(
          (detail) => detail.dataValues.workflowId == workflowId
        );
        if (details.length) {
          const serviceSlugArray = JSON.parse(
            details[0].dataValues.serviceSlug
          );
          return serviceSlugArray.length ? serviceSlugArray : null;
        }
        return null;
      })
      .filter((serviceslug) => serviceslug !== null)
      .flat();
    return { serviceIds: result };
  } catch (error) {
    throw new Error(error);
  }
};

const getWorkflowForApplicationService = async (reqBody) => {
  try {
    const { departmentId, serviceslug, workflowFor } = reqBody;

    if (departmentId && serviceslug) {
      // Fetch the workflows
      const workflows = await workflowModel.findAll({
        where: {
          workflowDepartmentId: departmentId,
          isDeleted: "0",
          workflowFor: workflowFor,
        },
        attributes: [
          "id",
          "workflowName",
          "workflowFor",
          "userId",
          "workflowDepartmentId",
        ],
      });

      // Extract workflow IDs
      const workflowIds = workflows.map((workflow) => workflow.id);

      // Fetch workflow details for the extracted workflow IDs
      const workflowDetails = await workflowDetailsModel.findAll({
        where: {
          workflowId: workflowIds,
        },
        attributes: [
          "id",
          "departmentId",
          "workflowMethod",
          "workflowId",
          "isDirectApproval",
          "TAT",
          "roleId",
          "userId",
          "serviceSlug",
        ],
      });

      // Filter workflows based on the 0th index detail's serviceSlug
      for (const workflowId of workflowIds) {
        const details = workflowDetails.filter(
          (detail) => detail.dataValues.workflowId == workflowId
        );

        if (details.length) {
          const serviceSlugArray = JSON.parse(
            details[0].dataValues.serviceSlug
          );

          if (serviceSlugArray.includes(serviceslug)) {
            const workflow = workflows.find((w) => w.id === workflowId);

            // Format the final data
            const formattedDetails = details.map((detail) => ({
              id: detail.id,
              departmentId: detail.departmentId,
              workflowMethod: detail.workflowMethod,
              workflowId: detail.workflowId,
              serviceSlug: detail.serviceSlug,
              isDirectApproval: detail.isDirectApproval,
              TAT: detail.TAT,
              roleId: detail.roleId,
              userId: detail.userId,
            }));

            return {
              id: workflow.id,
              workflowName: workflow.workflowName,
              workflowFor: workflow.workflowFor,
              userId: workflow.userId,
              workflowDepartmentId: workflow.workflowDepartmentId,
              workflow: formattedDetails,
            };
          }
        }
      }
      return {};
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const createNewWorkflowService = async (requestBody,req) => {
  try {
    const {
      workflowName,
      userId,
      workflowFor,
      workflowDepartmentId,
      workflowServiceSlug,
      workflowData,
      workflowId,
    } = requestBody;
    let workflowResult;

    if (workflowId) {
      // Update existing workflow
      workflowResult = await workflowModel.update(
        {
          workflowName: workflowName,
          userId: userId,
          workflowFor: workflowFor,
          workflowDepartmentId: workflowDepartmentId,
          workflowServiceSlug: workflowServiceSlug,
          workflowData: workflowData,
        },
        {
          where: { id: workflowId },
        }
      );
    } else {
      // Create a new workflow entry
      workflowResult = await workflowModel.create({
        workflowName: workflowName,
        userId: userId,
        workflowFor: workflowFor,
        workflowDepartmentId: workflowDepartmentId,
        workflowServiceSlug: workflowServiceSlug,
        workflowData: workflowData,
      });
    }

    const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
    const finalUserId = extractedUserId;
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Workflow",
        // requestBody,
        workflowName,
        "N/A",
        "0",
        finalUserId,
        null,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return { workflowResult };
  } catch (error) {
    throw new Error(error);
  }
};
const getPreviousAddedworkflowServiceBydepartment = async (reqBody) => {
  try {
    const { departmentId, workflowId, workflowFor } = reqBody;
    const workflows = await workflowModel.findAll({
      where: {
        workflowDepartmentId: departmentId,
        isDeleted: "0",
        workflowFor: workflowFor,
      },
      attributes: ["id", "workflowServiceSlug"],
    });

    const parsedSlugs = workflows
      .filter(
        (workflow) => workflow.id !== workflowId && workflow.workflowServiceSlug
      )
      .map((workflow) => {
        try {
          return JSON.parse(workflow.workflowServiceSlug);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);

    const combinedSlugs = parsedSlugs.flat();

    return { serviceIds: combinedSlugs };
  } catch (error) {
    throw new Error(error);
  }
};

const getWorkflowActionsService = async (reqBody) => {
  try {
    const { actionFor } = reqBody;
    const whereCondition = {};

    if (actionFor) {
      whereCondition.actionFor = actionFor;
    }

    const workflowActions = await workflowActionModel.findAndCountAll({
      where: whereCondition,
      raw: true,
    });

    return workflowActions;
  } catch (error) {
    throw new Error(error);
  }
}
const getNewWorkflowForApplicationService = async (reqBody) => {
  try {
    const { departmentId, serviceslug, workflowFor } = reqBody;
    if (departmentId && serviceslug) {
      // Fetch the workflows
      const workflows = await workflowModel.findAll({
        where: {
          workflowDepartmentId: departmentId,
          isDeleted: "0",
          workflowFor: workflowFor,
        },
        attributes: [
          "id",
          "workflowName",
          "workflowFor",
          "userId",
          "workflowDepartmentId",
          "workflowServiceSlug",
          "workflowData",
        ],
      });

      // Filter records where the serviceslug matches in workflowServiceSlug
      const filteredWorkflows = workflows.filter((workflow) => {
        try {
          const serviceSlugs = JSON.parse(workflow.workflowServiceSlug);
          return (
            Array.isArray(serviceSlugs) && serviceSlugs.includes(serviceslug)
          );
        } catch (error) {
          return {};
        }
      });

      return filteredWorkflows;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = {
  createWorkflowService,
  updateWorkflowService,
  getWorkflowService,
  getWorkflowServiceById,
  deleteWorkflowByIdService,
  getAddedworkflowServiceBydepartment,
  getWorkflowForApplicationService,
  createNewWorkflowService,
  getPreviousAddedworkflowServiceBydepartment,
  getWorkflowActionsService,
  getNewWorkflowForApplicationService,
};
