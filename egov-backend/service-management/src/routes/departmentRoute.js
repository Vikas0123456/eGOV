const express = require("express");
const route = express.Router();
const { createNewDepartment, deleteDepartment, updateDepartment, getDepartment, getDepartmentKeyword, listDepartment, getDepartmentById, getServiceDepartmentwise } = require("../controllers/departmentController");

route.post("/create",createNewDepartment)
route.put("/delete",deleteDepartment)
route.put("/update",updateDepartment)
route.post("/view",getDepartment)
route.post("/deptkeyword",getDepartmentKeyword)
route.post("/list",listDepartment)
route.post('/departmentById', getDepartmentById);
route.post("/departmentServices",getServiceDepartmentwise)


module.exports = route;