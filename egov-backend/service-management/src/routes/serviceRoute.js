const express = require("express");
const {
    createNewService,
    updateService,
    getService,
    listService,
    applicationServicelistForApi,
    serviceDepartmentCountList,
    getServiceById,
    getLatestUniqueSlug
} = require("../controllers/serviceController");
const route = express.Router();

route.post("/create", createNewService);
route.put("/update", updateService);
route.post("/view", getService);
route.post("/list", listService);
route.post("/applicationServicelist", applicationServicelistForApi);
route.post("/serviceDepartment/count", serviceDepartmentCountList);
route.post("/getById", getServiceById)
route.post("/getLatestUniqueSlug", getLatestUniqueSlug)

module.exports = route;
