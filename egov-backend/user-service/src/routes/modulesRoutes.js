const express = require("express");
const { getModules, getPermissions, getModulePermissions } = require("../controllers/modulesController");
const route = express.Router();

route.post("/view",getModules)
route.post("/permissionsView",getPermissions)
route.post('/modulePermissionsView',getModulePermissions)

module.exports = route;