const express = require("express");
const {
    createNewAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncement,
} = require("../controllers/announcementsController");
const route = express.Router();

route.post("/create", createNewAnnouncement);
route.put("/delete", deleteAnnouncement);
route.put("/update", updateAnnouncement);
route.post("/view", getAnnouncement);

module.exports = route;
