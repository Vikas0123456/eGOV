const express = require("express");
const { createNotification, getUserNotification, getCustomerNotification, updateCustomerNotification, updateUserNotification, deleteCustomerData } = require("../controllers/notificationController");
const route = express.Router();

route.post("/create", createNotification);
route.post("/user-notification", getUserNotification);
route.post("/customer-notification", getCustomerNotification);
route.put('/update-customer', updateCustomerNotification);
route.put('/update-user', updateUserNotification);
route.use('/web',require('./webhookRoute'))

route.post("/deleteCustomerAlldata", deleteCustomerData);

module.exports = route;