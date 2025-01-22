const express = require("express");
const {
  createCustomer,
  updateCustomer,
  updateCustomerPassword,
  resetCustomerPasswordByEmail,
  deleteCustomer,
  customerLogin,
  customerOtpVerify,
  getCustomer,
  checkExistingUserandNIB,
  customerResendOtp,
  getAllcustomerList,
  changePassword,
  getCustomerProfileInfo,
  getCustomerProfileInfoUpdate,
  getLoginSessionsList,
  deleteLoginSessions,
  logoutCustomer,
  getCustomerLogHistory,
  customerAndGenderList,
  getAllrevenueCustomerList,
  getAllcustomerListForAdmin,
  checkLinkvalid,
  deleleAccountRequest,
  getUsersWithExceededDeleteTime,
  deleteCustomerAllServiceDataForDemo,
  findCustomerEmail,
  otpRequestForCustomerProfileByEmail,
  confirmOtpForProfileAccess
} = require("../controllers/customerController");
const {
  getCountries,
  getStates,
} = require("../controllers/countriesController");
const { findLocalIp } = require("../controllers/userController");
const route = express.Router();

route.post("/create", createCustomer);
route.put("/update", updateCustomer);
route.put("/create-password", updateCustomerPassword);
route.post("/forgot-password", resetCustomerPasswordByEmail);
route.put("/delete", deleteCustomer);
route.post("/login", customerLogin);
route.post("/get-Ip", findLocalIp);
route.post("/verify-otp", customerOtpVerify);
route.post("/view", getCustomer);
route.post("/customer-profile-info/view", getCustomerProfileInfo);
route.put("/customer-profile-info/update", getCustomerProfileInfoUpdate);
route.post("/login-session/view", getLoginSessionsList);
route.put("/login-session/delete", deleteLoginSessions);
route.post("/check-existing-user", checkExistingUserandNIB);
route.post("/resend-otp", customerResendOtp);
route.post("/country/list", getCountries);
route.post("/state/list", getStates);
route.put("/change-password", changePassword);
route.put("/logout", logoutCustomer);
route.post("/customer-login-history/view", getCustomerLogHistory);
route.post("/isvalidlink",checkLinkvalid)
route.post("/delete-request",deleleAccountRequest)
// Backend use only for communicate b/w two projects
route.post("/customerList", getAllcustomerList);
route.post("/customerListAdmin", getAllcustomerListForAdmin);
route.post("/revenueCustomerList", getAllrevenueCustomerList);
route.post("/customerAndGender/list", customerAndGenderList);
route.post("/deleteCustomerAllServiceData",deleteCustomerAllServiceDataForDemo)
route.post("/find-customer",findCustomerEmail)
route.post("/profile-access-otp",otpRequestForCustomerProfileByEmail)
route.post("/confirm-profile-access",confirmOtpForProfileAccess)

module.exports = route;
