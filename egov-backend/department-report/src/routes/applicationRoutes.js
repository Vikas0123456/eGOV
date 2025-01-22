const express = require("express");
const route = express.Router();
const {
  createDepartmentReport,
  createApplicationDepartmentReport,
  updateApplicationDepartmentReport,
} = require("../controllers/applicationReportController");

route.post("/create", createApplicationDepartmentReport);
route.put("/update", updateApplicationDepartmentReport);

module.exports = route;
