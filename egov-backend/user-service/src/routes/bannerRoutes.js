const express = require("express");
const route = express.Router();
const { createNewBanner, deleteBanner, updateBanner, getBanner, getBannerKeyword } = require("../controllers/bannerController");

route.post("/create",createNewBanner)
route.put("/delete",deleteBanner)
route.put("/update",updateBanner)
route.post("/view",getBanner)
// route.post("/deptkeyword",getBannerKeyword)

module.exports = route;