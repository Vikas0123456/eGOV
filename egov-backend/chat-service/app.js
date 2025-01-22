const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sequelize } = require("./src/config/db.connection");
const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("public"));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use("/", require("./src/routes/index"));

const { Server } = require("socket.io");
const { createServer } = require("http");
const socketManager = require("./src/socket");

const httpServer = createServer(app);
const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

socketManager(io);

sequelize
    .authenticate()
    .then(() => {
        httpServer.listen(port, () => {
            console.log(
                `Connection established on 🏃 Port http://localhost:${port}`
            );
        });
    })
    .catch((err) => {
        console.log("Error in app.js file", err.message);
    });
