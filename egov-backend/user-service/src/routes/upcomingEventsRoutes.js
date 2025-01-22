const express = require("express");
const { createUpcomingEvent,
    updateUpcomingEvent,
    getUpcomingEvent, } = require("../controllers/upcomingEventsController");
const route = express.Router();

route.post("/create", createUpcomingEvent);
route.put("/update", updateUpcomingEvent);
route.post("/view", getUpcomingEvent);

module.exports = route;
