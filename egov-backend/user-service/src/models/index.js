const usersModel = require("./users");
const modulesModel = require("./module");
const modulesPermissionModel = require("./modulePermissions");
const rolesModel = require("./roles");
const rolesModulesPermissionsModel = require("./rolesModulesPermissions");
const addressModel = require("./address");
const customerModel = require("./customer");
const countriesModel = require("./countries");
const statesModel = require("./states");
const announcementModel = require("./announcement");
const bannerModel = require("./banner");
const customerLoginSessionModel = require("./customerLoginSession");
const faqModel = require("./faq");
const permissionModel = require("./permissions");
const upcomingEventsModel = require("./upcomingEvents");
const feedbackModel = require("./feedback");
const knowledgeBaseModel = require("./knowledgebase");
const likeDislikeModel = require("./likeDislike");
const supportModel = require("./support");
const workflowModel = require("./workflow");
const workflowDetailsModel = require("./workflowDetails");
const blockedIpsModel = require("./blockedIps");
const auditLogModel = require("./auditLog");
const emailtemplatesModel = require("./emailTemplate");
const systemSupportTypeModel = require("./systemSupportType");
const systemSupportModel = require("./systemSupport");
const userLoginSessionModel = require("./userLoginSession");
const logiHistoryAdminModel = require("./loginHistoryAdmin");
const logiHistoryCustomerModel = require("./loginHistoryCustomer");
const emailLogsModel = require("./emailLogs");
const generalsettingModal = require("./generalsetting");
const tableColumnConfigModel=require("./tableColumnconfig")
module.exports = {
  usersModel,
  modulesModel,
  permissionModel,
  modulesPermissionModel,
  rolesModel,
  rolesModulesPermissionsModel,
  addressModel,
  customerModel,
  countriesModel,
  statesModel,
  announcementModel,
  bannerModel,
  customerLoginSessionModel,
  faqModel,
  upcomingEventsModel,
  feedbackModel,
  knowledgeBaseModel,
  likeDislikeModel,
  supportModel,
  workflowModel,
  workflowDetailsModel,
  blockedIpsModel,
  auditLogModel,
  emailtemplatesModel,
  systemSupportTypeModel,
  systemSupportModel,
  userLoginSessionModel,
  logiHistoryAdminModel,
  logiHistoryCustomerModel,
  emailLogsModel,
  generalsettingModal,
  tableColumnConfigModel
};
