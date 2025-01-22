const express= require("express")
const { createRoles, getRoles, updateRoles, deleteRoles, getModulePermissionsForUser, roleBasedUserData } = require("../controllers/rolesController")
const route= express.Router()

route.post("/create",createRoles)
route.put('/update',updateRoles)
route.post("/view",getRoles)
route.put("/delete",deleteRoles)
route.post("/userPermissions",getModulePermissionsForUser)
route.post("/roleBased-userData",roleBasedUserData)

module.exports = route;
