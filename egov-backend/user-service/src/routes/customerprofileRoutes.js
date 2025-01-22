const express = require("express");
const { getCustomerProfileList, createCustomerProfile, updateCustomerProfileById ,transferCustomer} = require("../controllers/profileController");
const { delinkCustomerProfileById } = require("../controllers/customerController");
const route = express.Router();

route.post("/list",getCustomerProfileList)
route.post("/create",createCustomerProfile)
route.put("/update",updateCustomerProfileById)
route.put("/de-link",delinkCustomerProfileById)
route.post("/transferCustomer",transferCustomer)

module.exports = route;
