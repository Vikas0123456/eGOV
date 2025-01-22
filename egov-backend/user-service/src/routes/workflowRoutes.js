const express = require("express");
const {
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
  getNewWorkflowForApplication,
} = require("../controllers/workflowController");
const route = express.Router();

route.post("/create", createWorkflow); //old
route.post("/view", getWorkflowById); //old
route.post("/list", getWorkflow);
route.put("/delete", deleteWorkflowById);
route.put("/update", updateWorkflow);
route.post("/addedServices", getAddedworkflowService);
route.post("/applicationWorkfllow", getWorkflowForApplication);
//new
route.post("/getWorkflowActions", getWorkflowActions);
route.post("/create-workflow", createNewWorkflow); 
route.post("/prev-service",getAddedNeWworkflowService)
route.post("/applicationNewWorkflow", getNewWorkflowForApplication);

module.exports = route;
