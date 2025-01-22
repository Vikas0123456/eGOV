const express = require("express");
const {
  createFaq,
  updateFaq,
  getFaq,
} = require("../controllers/faqController");
const {
  createBlockedIps,
  updateBlockedIps,
  getBlockedIps,
  deleteBlockedIps,
} = require("../controllers/blockedIpsController");
const route = express.Router();

route.post("/create", createBlockedIps);
route.put("/update", updateBlockedIps);
route.post("/view", getBlockedIps);
route.put("/delete", deleteBlockedIps);

module.exports = route;
