const express = require("express");
const { likeDislike, getLikeDislikeById } = require("../controllers/likeDislikeController");
const route = express.Router();

route.post("/create", likeDislike);
route.post("/get", getLikeDislikeById);

module.exports = route;
