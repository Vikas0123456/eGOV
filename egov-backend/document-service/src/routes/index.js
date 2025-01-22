const express = require("express");
const route = express.Router();

route.use("/", require("./documentsRoutes"));
route.use("/", require("./documentListRoutes"));

module.exports = route;
