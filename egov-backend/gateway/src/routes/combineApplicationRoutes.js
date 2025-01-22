const express = require("express");
const route = express.Router();
const {
    getCertificateUsingQrcode,
} = require("../controllers/applicationController");

route.get("/certificate/:data", getCertificateUsingQrcode);

module.exports = route;
