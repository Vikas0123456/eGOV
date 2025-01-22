const express = require("express");
const { getCountries, getStates } = require("../controllers/countriesController");
const route = express.Router();

route.post("/list",getCountries)
route.post("/state/list",getStates)

module.exports = route;