const express = require("express");
const {
    createCustomerPaymentDetails,
    getCustomerPaymentDetails,
    getCustomerCardInfoStripe,
    addCustomerCardInfo,
    deleteCustomerCardInfo,
    setDefaultPayment,
    PaymentwithCardMethod,
    transactiondetails,
    payNowWithCard,
    getTransactionDetails,
    getRevenueReport,
    getTransactionreport,
    getServiceRevenue,
    getMaximumRevenueReport,
    getTotalRevenueReport,
    serviceVSRevenueList,
    getApplicationtransactionReport,
    exportTransactionReportInExcel,
    removeReportExcel,
    exportTransactionReportInPDF,
    removeReportPdf,
    exportDepartmentReportExcel,
    removeDepartmentReportExcel,
    exportDepartmentReportInPDF,
    removeDepartmentReportPdf,
    getRevenueReportForDashboard,
    exportTransactionDetailExcel,
    removeTransactionReportExcel,
    deleteStripeCustomer,
    deleteCustomerData,
    seenStatusUpdateController,
} = require("../controllers/customerPaymentDetailsController");
const route = express.Router();

route.post("/create", createCustomerPaymentDetails);
route.post("/delete-stripe-customer",deleteStripeCustomer)
route.post("/get", getCustomerPaymentDetails);
route.post("/gettransactionDetails", getTransactionDetails);
route.post("/updateSeenStatus",seenStatusUpdateController)
route.post("/get/payment-cards", getCustomerCardInfoStripe);
route.post("/add/payment-cards", addCustomerCardInfo);
route.post("/delete/payment-cards", deleteCustomerCardInfo);
route.post("/default/payment-cards", setDefaultPayment);
route.post("/payAmount/payment-cards", PaymentwithCardMethod);
route.post("/create/transactionDetails", transactiondetails);
route.post("/revenueReport", getRevenueReport);
route.post("/revenueReport/transactions", getTransactionreport);
route.post("/application/transactions", getApplicationtransactionReport);
route.post("/payNowWithCard", payNowWithCard);
route.post("/serviceRevenue", getServiceRevenue);
route.post("/maximumRevenue", getMaximumRevenueReport);
route.post("/totalRevenue", getTotalRevenueReport);
route.post("/revenue/data", serviceVSRevenueList);
route.post(
    "/application/transactions/exportToExcel",
    exportTransactionReportInExcel
);
route.post("/application/transactions/removeExcel", removeReportExcel);
route.post(
    "/application/transactions/exportToPDF",
    exportTransactionReportInPDF
);
route.post("/application/transactions/removePdf", removeReportPdf);
route.post(
    "/application/transactions/transactionDetailsExport",
    exportTransactionDetailExcel
);
route.post(
    "/application/transactions/transactionDetailsRemoveExcel",
    removeTransactionReportExcel
);

route.post("/revenueReport/exportToExcel", exportDepartmentReportExcel);
route.post("/revenueReport/removeExcel", removeDepartmentReportExcel);
route.post("/revenueReport/generatePdf", exportDepartmentReportInPDF);
route.post("/revenueReport/removePdf", removeDepartmentReportPdf);

route.post("/dashboardRevenueReport", getRevenueReportForDashboard);

route.post("/deleteCustomerAlldata", deleteCustomerData);

module.exports = route;
