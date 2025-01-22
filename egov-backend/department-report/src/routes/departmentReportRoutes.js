const express = require("express");
const route = express.Router();
const {
    getDepartmentPerformanceData,
    getTeamPerformanceData,
    exportDepartmentReport,
    generateReportPdf,
    removeReportPdf,
    removeReportExcel,
    activeApplicationList,
    exportDepartmentPerformanceExcel,
    removeDepartmentPerformanceExcel,
    removeDepartmentPerformancePdf,
    exportDepartmentPerformanceInPDF,
    getServicePerformanceDataByUser,
    getServiceTicketPerformanceDataByUser,
    exportAgenetPerformanceExcel,
    removeAgenetPerformanceExcel,
    exportAgenetPerformanceInPDF,
    removeAgenetPerformancePdf,
    exportAgenetTicketPerformanceExcel,
    removeAgenetTicketPerformanceExcel,
    exportAgenetTicketPerformanceInPDF,
    removeAgenetTicketPerformancePdf,
} = require("../controllers/departmentReportController");

route.post("/deptperformance/list", getDepartmentPerformanceData);
route.post("/agentPerformance/list", getServicePerformanceDataByUser);
route.post("/ticketagentPerformance/list",getServiceTicketPerformanceDataByUser)
route.post("/deptperformance/export", exportDepartmentReport);
route.post("/deptperformance/generatePdf", generateReportPdf);
route.post("/deptperformance/removePdf", removeReportPdf);
route.post("/deptperformance/removeExcel", removeReportExcel);
route.post("/teamperformance/list", getTeamPerformanceData);
route.post("/activeApplication/list", activeApplicationList);

route.post("/deptperformance/exportToExcel", exportDepartmentPerformanceExcel);
route.post("/deptperformance/removeExcel", removeDepartmentPerformanceExcel);
route.post("/deptperformance/generateDeptPdf", exportDepartmentPerformanceInPDF);
route.post("/deptperformance/removeDeptPdf", removeDepartmentPerformancePdf);

route.post("/agentPerformance/exportToExcel", exportAgenetPerformanceExcel);
route.post("/agentPerformance/removeExcel", removeAgenetPerformanceExcel);
route.post("/agentPerformance/generateDeptPdf", exportAgenetPerformanceInPDF);
route.post("/agentPerformance/removeDeptPdf", removeAgenetPerformancePdf);

route.post("/agentTicketPerformance/exportToExcel", exportAgenetTicketPerformanceExcel);
route.post("/agentTicketPerformance/removeExcel", removeAgenetTicketPerformanceExcel);
route.post("/agentTicketPerformance/generateDeptPdf", exportAgenetTicketPerformanceInPDF);
route.post("/agentTicketPerformance/removeDeptPdf", removeAgenetTicketPerformancePdf);

module.exports = route;
