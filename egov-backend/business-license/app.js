const express = require("express");
const cors = require("cors");
const cron = require("node-cron"); // Import cron
const axios = require("axios"); // Import axios for testing API calls
require("dotenv").config();
const { sequelize } = require("./src/config/db.connection");
const {processAutoPayApplications } = require("./src/controllers/applicationController");
const app = express();
const port = process.env.PORT || 3003;
app.use(cors());
app.use(express.json()); //application/json
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("public"));

// Middleware for headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Method",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use("/", require("./src/routes/index"));

// Cron Job
// cron.schedule('0 0 * * *', async () => {
//   try {
//     console.log("Running autoPayFindApplication at midnight...");
//      await processAutoPayApplications()
//     console.log("Cron job executed successfully");
//   } catch (error) {
//     console.error("Error executing cron job:");
//   }
// });

// For testing (runs every 5 minutes, comment out in production)

// cron.schedule('*/1 * * * *', async () => {
//   try {
//     console.log("Testing cron job every 1 minutes...");
//     await processAutoPayApplications()
//     console.log("Test cron job executed successfully");
//   } catch (error) {
//     console.error("Error in test cron job:", error.message);
//   }
// });

// Database connection and server start
sequelize
  .authenticate()
  .then(() => {
    app.listen(port);
    console.log(`Connection established on 🏃 Port http://localhost:${port}`);
  })
  .catch((err) => {
    console.log("error in app.js file", err.message);
  });
