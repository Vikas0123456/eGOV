const express = require("express");
const route = express.Router();
const {
  createNewUser,
  updatePassword,
  resetPasswordByEmail,
  userLogin,
  verifyOtp,
  deleteUser,
  updateUser,
  getUser,
  getUserForDirectoryList,
  resendOtp,
  getAllUser,
  getUserforWorkflow,
  getUserProfileUpdate,
  userChangePassword,
  findLocalIp,
  getLoginSessionsList,
  deleteLoginSessions,
  getAdminLogHistory,
  logoutUser,
  getAllSearchUser,
  checkLinkvalid,
  fetchAdminData
} = require("../controllers/userController");

route.post("/create", createNewUser);
route.put("/create-password", updatePassword);
route.post("/forgot-password", resetPasswordByEmail);
route.post("/login", userLogin);
route.post("/get-Ip", findLocalIp);
route.post("/verify-otp", verifyOtp);
route.put("/delete", deleteUser);
route.put("/update", updateUser);
route.post("/view", getUser);
route.put("/profile-update", getUserProfileUpdate);
route.put("/change-password", userChangePassword);
route.post("/directory/list", getUserForDirectoryList);
route.post("/resend-otp", resendOtp);
route.post("/login-session/view", getLoginSessionsList);
route.put("/login-session/delete", deleteLoginSessions);
route.post("/login-history/view", getAdminLogHistory);
route.put("/logout", logoutUser);
route.post("/isvalidlink",checkLinkvalid)
// Backend use only for communicate b/w two projects
route.post("/getAlluser", getAllUser);
route.post("/getAlluserSearch", getAllSearchUser);
route.post("/workflowUser", getUserforWorkflow);
route.post("/findAdmin",fetchAdminData)

module.exports = route;
