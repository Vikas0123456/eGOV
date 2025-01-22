const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sequelize } = require("./src/config/db.connection");
const app = express();
const port = process.env.PORT || 3007;
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

sequelize
  .authenticate()
  .then(() => {
    app.listen(port);
    console.log(`Connection established on 🏃 Port http://localhost:${port}`);
  })
  .catch((err) => {
    console.log("error in app.js file", err.message);
  });
