const express = require("express");
const router = express();

router.use("/chat",require("./chatRoutes"));
router.use("/web",require('./webhookRoutes'))
module.exports = router;
