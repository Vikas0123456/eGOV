const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sequelize } = require("./src/config/db.connection");
const cron = require("node-cron");  // Import node-cron
const { getUsersWithExceededDeleteTime } = require("./src/controllers/customerController");
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json()); //application/json
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Method",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/", require("./src/routes/index"));

// Example cron job: Runs every minute
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     console.log("Testing cron job every 1 minutes...");
//     await getUsersWithExceededDeleteTime();
//     console.log("Test cron job executed successfully");
//   } catch (error) {
//     console.error("Error in test cron job:", error.message);
//   }
// });

// // Example cron job: Runs every hour
// cron.schedule('0 * * * *', async () => {
//   try {
//     console.log("Testing cron job every hour...");
//     await getUsersWithExceededDeleteTime();
//     console.log("Test cron job executed successfully");
//   } catch (error) {
//     console.error("Error in test cron job:", error.message);
//   }
// });

sequelize
  .authenticate()
  .then(() => {
    app.listen(port, () => {
      console.log(`Connection established on 🏃 Port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("error in app.js file", err.message);
  });
