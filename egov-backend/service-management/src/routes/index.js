const express = require("express");
const router = express();

router.use("/form", require("./formBuilderRoute"));
router.use("/department", require("./departmentRoute"));
router.use("/service", require("./serviceRoute"));

module.exports = router;
