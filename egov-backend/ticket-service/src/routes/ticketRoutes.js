const express = require("express");
const route = express.Router();
const {
    createTicket,
    updateTicket,
    getTickets,
    updateStatus,
    updatePriority,
    updateAssignTo,
    sendMessage,
    getTicketChat,
    getTicketLogs,
    exportAllTickets,
    getTicketCountStatusWise,
    getAllTickets,
    removeTicketsExcel,
    lastActivity,
    deleteCustomerData,
    reopenTicket,
} = require("../controllers/ticketController");

route.post("/create", createTicket);
route.put("/update", updateTicket);
route.post("/view", getTickets);
route.put("/status/:id", updateStatus);
route.put("/priority/:id", updatePriority);
route.put("/assignTo/:id", updateAssignTo);
route.post("/send", sendMessage);
route.post("/chatList", getTicketChat);
route.post("/logs", getTicketLogs);
route.post("/exports", exportAllTickets);
route.post("/removeExcel", removeTicketsExcel);
route.post("/statusCount", getTicketCountStatusWise);
route.post("/getAllTickets", getAllTickets);
route.post("/last-activity", lastActivity);
route.post("/deleteCustomerAlldata", deleteCustomerData);
route.post("/reopen", reopenTicket);

module.exports = route;
