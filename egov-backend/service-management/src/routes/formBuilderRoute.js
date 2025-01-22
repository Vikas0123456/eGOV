const express = require("express");
const {
    getDataById,
    createForm,
    getFormList,
    updateForm,
    deleteForm,
} = require("../controllers/formbuilderController");
const route = express.Router();

route.post("/create", createForm);
route.post("/list", getFormList);
route.post("/update", updateForm);
route.put("/delete", deleteForm);
route.post("/getById", getDataById);

module.exports = route;
