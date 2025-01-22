const express = require("express");
const router = express();

router.use("/application", require("./applicationRoutes"));
router.use("/ticket", require("./ticketRoutes"));
router.use("/", require("./departmentReportRoutes"));
router.use("/web",require('./webhookRoutes'))
module.exports = router;
