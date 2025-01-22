const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const settings = require("../../setting");

const generateReportExcelData = async (expData, fileName) => {
    const workbook = new ExcelJS.Workbook();

    if (expData.sheet == "Revenue") {
        // Add Revenue sheet
        const revenueSheet = workbook.addWorksheet(expData.sheet || "Revenue");

        revenueSheet.addRow(expData.headers);
        revenueSheet.addRow([]);

        // Add revenue expData rows
        expData.revenue.forEach((department) => {
            revenueSheet.addRow([
                department.departmentName,
                department.totalRevenueDepartment,
            ]);
            revenueSheet.addRow([]);
            revenueSheet.addRow(["Services", "Total Revenue"]);
            department.serviceList.forEach((service) => {
                const rowData = [
                    service.serviceName,
                    service.totalRevenueService,
                ];
                revenueSheet.addRow(rowData);
            });
        });

        // Automatically adjust column widths based on content
        revenueSheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value
                    ? cell.value.toString().length
                    : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2; // Minimum width of 10
        });
    } else {
        const worksheet = workbook.addWorksheet(expData["sheet"]);

        for (const key in expData) {
            if (Array.isArray(expData[key].data)) {
                worksheet.addRow([expData[key].label]);

                worksheet.addRow([]);
                worksheet.addRow(expData[key].headers);

                expData[key].data.forEach((item) => {
                    let rowData = [];

                    if (key == "application") {
                        rowData = [
                            item.userName || item.departmentName,
                            item.RequestAssigned,
                            item.RequestCompleted,
                            item.averageTime,
                        ];
                    }

                    if (key == "ticket") {
                        rowData = [
                            item.userName || item.departmentName,
                            item.RequestAssigned,
                            item.RequestCompleted,
                            item.averageTime,
                            item.tatTime,
                        ];
                    }

                    worksheet.addRow(rowData);
                });
                worksheet.addRow([]);
            } else {
                continue;
            }
        }

        // Automatically adjust column widths based on content
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value
                    ? cell.value.toString().length
                    : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2; // Minimum width of 10
        });
    }

    const assertFolderPath = path.join(settings.PROJECT_DIR, "public");

    if (!fs.existsSync(assertFolderPath)) {
        fs.mkdirSync(assertFolderPath, { recursive: true });
    }

    //need to change project directory
    const filePathInsert = path.join(assertFolderPath, fileName);
    const filePath = process.env.EXPORT_DEPTREPORT_EXCEL + fileName;

    await workbook.xlsx.writeFile(filePathInsert);

    return filePath;
};

module.exports = {
    generateReportExcelData,
};
