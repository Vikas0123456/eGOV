const { createtableConfig, gettableConfig } = require("../controllers/tableColumnconfigController");
const express = require("express");
const route = express.Router();

route.post("/update-table-config",createtableConfig);
route.post("/get-table-config",gettableConfig);

module.exports = route;
