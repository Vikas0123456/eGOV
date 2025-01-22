const express = require("express");
const { createAddress, updateAddress, getAddress } = require("../controllers/addressController");
const route = express.Router();

route.post("/create",createAddress)
route.put("/update",updateAddress)
route.post("/view",getAddress)

module.exports = route;