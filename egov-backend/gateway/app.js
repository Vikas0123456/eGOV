const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const http = require("http");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const port = process.env.PORT || 3000;
const tokenAuthentication = require("./src/middleware/authenticateJWT").authenticateJWT;
const app = express();
const server = http.createServer(app);

const {
    reqDecrypt,
    resDecorator,
    resEncrypt,
} = require("./src/middleware/responseHandler");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Method",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});

app.use(
    "/userService",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.USERMICROSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.post(
    "/documentService/uploading",
    tokenAuthentication,
    (req, res, next) => {
        var httpProxy = require("http-proxy");
        var proxy = httpProxy.createProxyServer();
        proxy.on("proxyRes", resEncrypt);
        proxy.web(req, res, {
            target: process.env.DOCUMENTSERVICE,
            selfHandleResponse: true,
        });
    }
);

app.use(
    "/documentService",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.DOCUMENTSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use("/bookAndMeet", proxy(process.env.BUSINESSLICENSESERVICE));
app.use("/document", proxy(process.env.DOCUMENTSERVICE));
app.use("/export", proxy(process.env.TICKETSERVICE));
app.use("/deptReportExport", proxy(process.env.DEPARTMENTREPORT));
app.use("/deptReportPdf", proxy(process.env.DEPARTMENTREPORT));
app.use("/txnReportExcel", proxy(process.env.PAYMENTSERVICE));
app.use("/txnReportPdf", proxy(process.env.PAYMENTSERVICE));
app.use("/txnDetailExport", proxy(process.env.PAYMENTSERVICE));
app.use("/deptPdf", proxy(process.env.PAYMENTSERVICE));
app.use("/deptReportExcel", proxy(process.env.PAYMENTSERVICE));
app.use("/teamPerfReportExport", proxy(process.env.DEPARTMENTREPORT));
app.use("/teamPerfReportPdf", proxy(process.env.DEPARTMENTREPORT));
app.use("/transactionDetailExport", proxy(process.env.PAYMENTSERVICE));
app.use("/agentReportExport", proxy(process.env.DEPARTMENTREPORT));
app.use("/agentReportPdf", proxy(process.env.DEPARTMENTREPORT));
app.use("/agentTicketReportExport", proxy(process.env.DEPARTMENTREPORT));
app.use("/agentTicketReportPdf", proxy(process.env.DEPARTMENTREPORT));
app.use("/exportCustomerApplicationData", proxy(process.env.BUSINESSLICENSESERVICE));

app.use(
    "/paymentService",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.PAYMENTSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use(
    "/ticketService",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.TICKETSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use(
    "/notificationtService",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.NOTIFICATIONSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use(
    "/businessLicense",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.BUSINESSLICENSESERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use(
    "/applications",
    reqDecrypt,
    tokenAuthentication,
    require("./src/routes/index")
);
app.use(
    "/departmentReport",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.DEPARTMENTREPORT, {
        userResDecorator: resDecorator,
    })
);
app.use(
    "/serviceManagement",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.SERVICEMANAGEMENT, {
        userResDecorator: resDecorator,
    })
);
app.use(
    "/chatservice",
    reqDecrypt,
    tokenAuthentication,
    proxy(process.env.CHATSERVICE, {
        userResDecorator: resDecorator,
    })
);

app.use("/applicationsInternalCommunication", require("./src/routes/index"));

app.use("/workflow", require("./src/routes/index"));

app.use("/scanQRcode", require("./src/routes/index"));

const socketIOProxy = createProxyMiddleware({
    target: process.env.CHATSERVICE,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/socket.io': '/socket.io',
    },
});


app.use('/socket.io', socketIOProxy);

server.on('upgrade', (req, socket, head) => {
    socketIOProxy.upgrade(req, socket, head, (err) => {
        if (err) {
            socket.destroy();
        }
    });
});

server.listen(port, (err) => {
    if (err) {
        console.log({ err: "error while connecting in server" });
    } else {
        console.log(`Connection established on 🏃 Port ${port}`);
    }
});