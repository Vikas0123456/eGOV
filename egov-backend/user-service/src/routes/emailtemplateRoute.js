const express = require("express");
const {
  getEmailTemplate,
  updateEmailTemplate,
  getEmailTemplatebySlug,
} = require("../controllers/emailtemplateController");
const route = express.Router();

route.put("/update", updateEmailTemplate);
route.post("/view", getEmailTemplate);
route.post("/get", getEmailTemplatebySlug);

module.exports = route;
