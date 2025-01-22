const express = require("express");
const router = express();
// const { verifyTokenAndSetData } = require("../middleware");

router.use("/ticket", require("./ticketRoutes"));
// router.use("/", require("./ticketRoutes"));
router.use("/web",require('./webhookRoutes'))
module.exports = router;
