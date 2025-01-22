const express = require("express");
const router = express();
const { verifyTokenAndSetData } = require("../middleware");

router.use("/user", require("./userRoutes"));
router.use("/banner", verifyTokenAndSetData, require("./bannerRoutes"));
router.use(
  "/modulePermission",
  verifyTokenAndSetData,
  require("./modulePermissionsRoutes")
);
router.use("/modules", verifyTokenAndSetData, require("./modulesRoutes"));
router.use("/roles", verifyTokenAndSetData, require("./rolesRoutes"));
router.use(
  "/roleModulePermissions",
  verifyTokenAndSetData,
  require("./roleModulePermissionsRoutes")
);
router.use("/customer", require("./customerRoutes"));
router.use(
  "/profileCustomer",
  verifyTokenAndSetData,
  require("./customerprofileRoutes")
);
router.use("/address", verifyTokenAndSetData, require("./addressRoutes"));
router.use("/country", verifyTokenAndSetData, require("./countriesRoutes"));
router.use(
  "/announcement",
  verifyTokenAndSetData,
  require("./announcementRoutes")
);
router.use("/faq", verifyTokenAndSetData, require("./faqRoutes"));
router.use(
  "/systemSupport",
  verifyTokenAndSetData,
  require("./systemSupportRoutes")
);
router.use(
  "/upcomingEvents",
  verifyTokenAndSetData,
  require("./upcomingEventsRoutes")
);
router.use("/feedback", verifyTokenAndSetData, require("./feedbackRoutes"));
router.use(
  "/knowledgebase",
  verifyTokenAndSetData,
  require("./knowledgebaseRoutes")
);
router.use(
  "/likeDislike",
  verifyTokenAndSetData,
  require("./likeDislikeRoutes")
);
router.use("/blockedIps", require("./blockedIpsRoutes"));
router.use("/emailtemplate", require("./emailtemplateRoute"));
router.use("/support", verifyTokenAndSetData, require("./supportRoutes"));
router.use("/workflow", verifyTokenAndSetData, require("./workflowRoutes"));
router.use("/internalCommuncationWorkflow", require("./workflowRoutes"));
router.use("/internalCommunicationUser", require("./userRoutes"));
router.use("/internalCommunicationCustomer", require("./customerRoutes"));
router.use("/auditLog", require("./auditLogRoutes"));
router.use("/emailLog", require("./emailLogsRoutes"));
router.use("/setting", verifyTokenAndSetData, require('./generalSettingRoutes'));
router.use('/web',require('./webhookRoutes'));
router.use('/table',require('./tableConfigRoutes'));

module.exports = router;
