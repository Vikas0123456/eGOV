const express = require("express");
const {
  createApplication,
  getRequiredDocuments,
  createApplicationLog,
  getApplicationList,
  updateAssignedUser,
  genratePDFAplication,
  sendNotification,
  updateStatusApplication,
  getLogByapplicationId,
  getreqDocUploadedFile,
  createRequestDocument,
  getAppotmentApplicationList,
  bookAppoitmentRequest,
  updateRequiredDocument,
  getGeneralSetting,
  getApplicationListForCombineList,
  getDropdownOptions,
  getRevenueReportapplicationStatus,
  addRating,
  getTicketCountStatusWise,
  totalRatingCountList,
  dynamicLogdata,
  sendBookAndMeetData,
  appoitmentDetails,
  getBookingConfirmation,
  cancelBookingApi,
  dynamicCustomerServiceList,
  dynamicAdminServiceList,
  getApplication,
  dynamicTrackCountServiceList,
  deleteApplication,
  revenueApplicationStatus,
  applicationRatingList,
  getAllApplicationServiceRequest,
  getExpiredApplication,
  updateRenewApplication,
  exportCustomerApplicationData,
  removeCustomerApplicationDataExcel,
  getApplicationDetailForQrScan,
  findApplicationForDocUpdate,
  updateTransactionStatus,
  autoRenewUpdate,
  autoPayFindApplication,
  deleteCustomerApplicationData,
  transferCustomerApplicationData,
  transferListCustomerApplicationData
} = require("../controllers/applicationController");
const { dbConnection } = require("../middleware/dbConnection");
const { findSlug,dbConnectionForBookAndMeet } = require("../middleware/decryptMiddleware");
const route = express.Router();


route.post("/applicationLog", getLogByapplicationId);
route.post("/reqDocList", getreqDocUploadedFile);
// route.post("/generalSetting", getGeneralSetting);
route.post("/serviceRequest", getTicketCountStatusWise);
// Backend use only for communicate b/w two projects
route.post("/CompleteList", getApplicationList);
route.post("/forCombineList", getApplicationListForCombineList);
route.get("/dropdownLists", getDropdownOptions);
route.post("/revenueReportStatus", getRevenueReportapplicationStatus);
route.post("/ratingCount/list", totalRatingCountList);
//  new dynamic route list
// route.post("/required/document", getRequiredDocuments); 
route.post("/create", dbConnection, createApplication); // done
route.post("/list", dbConnection,getApplicationList);
route.post("/log/create", dbConnection, createApplicationLog);
// route.post('/adminApplicationList',dbConnection,dynamicAdminServiceList)
route.post('/adminApplicationList',dynamicAdminServiceList)
route.post("/getTrackApplicationCount",dynamicTrackCountServiceList)
route.post('/customerApplicationList',dynamicCustomerServiceList)
route.post("/allApplictionLogList",dbConnection,dynamicLogdata);
route.put("/updateAssigneduser", dbConnection, updateAssignedUser);
route.put("/updateStatus", dbConnection, updateStatusApplication);
route.put("/updateTransactionStatus", dbConnection, updateTransactionStatus);
route.post("/rating", dbConnection,addRating);
route.post("/createRequestedDocument", dbConnection,createRequestDocument);
route.put("/update/reqDoc",dbConnection, updateRequiredDocument);
route.post("/getApplication", dbConnection, getApplication);
route.post("/genrateCertificateManually", dbConnection, genratePDFAplication);
route.post("/bookAppoitmentRequest", dbConnection, bookAppoitmentRequest);
route.post("/getAppotmentApplicationList", getAppotmentApplicationList);
route.post("/sendBookAndMeetData",dbConnection, sendBookAndMeetData);
route.post("/appoitmentDetails", findSlug, dbConnectionForBookAndMeet, appoitmentDetails);
route.post("/getBookingConfirmation", dbConnection, getBookingConfirmation);
route.post("/sendNotifications", dbConnection, sendNotification);
route.post("/deleteApplication", dbConnection, deleteApplication);
route.post("/revenueApplicationStatus", dbConnection, revenueApplicationStatus);
route.post("/topRatedServices", applicationRatingList);
route.post("/serviceRequests", getAllApplicationServiceRequest);
route.post("/expiredRenewApplicationList",getExpiredApplication)
route.post("/renew",dbConnection,updateRenewApplication)
route.post("/cancelBookingApi", dbConnection, cancelBookingApi);
route.post("/autoRenewUpdate", dbConnection, autoRenewUpdate);
route.post("/exports", exportCustomerApplicationData)
route.post("/removeExcel", removeCustomerApplicationDataExcel)
route.post("/applicationDetailForQrScan",dbConnection,getApplicationDetailForQrScan)
// Auto update document on Approve
route.post('/findApplicationForDocUpdate',findApplicationForDocUpdate)
route.post('/autoPayFindApplication',autoPayFindApplication)

//delete all applications and logs of customer
route.post("/deleteCustomerAlldata", deleteCustomerApplicationData);
route.post("/transferListApplication", transferListCustomerApplicationData);
route.post("/transferCustomerAlldata", transferCustomerApplicationData);

module.exports = route;
