const express = require("express");
const router = express();

router.use("/customerDetails", require("./customerPaymentDetailsRoutes"));
router.use("/web",require('./webhookRoutes'))
module.exports = router;
