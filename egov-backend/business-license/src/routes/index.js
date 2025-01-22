const express = require("express");
const router = express();

router.use("/application",require("./applicationRoutes"))

module.exports = router;
