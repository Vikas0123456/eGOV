const express = require("express");
const { createFeedback, getFeedback } = require("../controllers/feedbackController");
const route = express.Router();

route.post("/create", createFeedback);
route.post("/view", getFeedback);

module.exports = route;
