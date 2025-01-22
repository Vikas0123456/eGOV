const express = require("express");
const {
  createEmailLogs,
  getEmailLogs,
  getAllModules,
} = require("../controllers/emailLogsController");
const route = express.Router();

route.post("/create", createEmailLogs);
route.post("/get", getEmailLogs);
route.post("/list", getAllModules);

module.exports = route;
