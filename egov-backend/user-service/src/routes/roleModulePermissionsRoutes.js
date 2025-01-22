const express = require("express");
const { getRoleModulePermission } = require("../controllers/roleModulePermissionController");
const route = express.Router();

route.post("/view",getRoleModulePermission)

module.exports = route;