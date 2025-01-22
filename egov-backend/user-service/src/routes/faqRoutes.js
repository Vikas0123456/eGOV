const express = require("express");
const { createFaq, updateFaq, getFaq } = require("../controllers/faqController");
const route = express.Router();

route.post("/create", createFaq);
route.put("/update", updateFaq);
route.post("/view", getFaq);

module.exports = route;
