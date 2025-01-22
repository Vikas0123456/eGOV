const express = require("express");
const route = express.Router();
const {
  createTicketDepartmentReport,
  updateTicketDepartmentReport,
  teamReuestTicketgraphdata,
} = require("../controllers/ticketReportController");

route.post("/create", createTicketDepartmentReport);
route.put("/update", updateTicketDepartmentReport);
route.post("/teamvsticket", teamReuestTicketgraphdata)

module.exports = route;
