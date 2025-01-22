const express = require("express");
const router = express();

router.use("/", require("./combineApplicationRoutes"));

module.exports = router;
