const express = require("express");
const {
  getSystemSupportTypes,
  createSupport,
} = require("../controllers/systemSupportController");
const route = express.Router();

route.post("/supportType/view", getSystemSupportTypes);
route.post("/create", createSupport);

module.exports = route;
