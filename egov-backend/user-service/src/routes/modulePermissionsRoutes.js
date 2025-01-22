const express = require("express");
const { getModulePermission } = require("../controllers/modulesPermissionsController");
const route = express.Router();

route.post("/view",getModulePermission)

module.exports = route;