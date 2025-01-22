const express = require("express");
const { createSupport,getSupport } = require("../controllers/supportController");
const route = express.Router();

route.post("/create", createSupport);
route.post("/view", getSupport);

module.exports = route;
