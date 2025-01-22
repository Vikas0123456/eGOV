const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const settings = require("../../setting");

const generateExcelData = async (data, title, fileName) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet(title);

  worksheet.mergeCells("A1:H1"); // Merge cells for the title
  worksheet.getCell("A1").value = title; // Set the title
  worksheet.getCell("A1").alignment = { horizontal: "center" };
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  let headers = [];
  if (data.length > 0) {
    headers = Object.keys(data[0]).map((key) => data[0][key].label);
  }
  worksheet.addRow(headers);

  data.forEach((values) => {
    const rowValues = [];
    Object.values(values).forEach((item) => {
      if (Array.isArray(item.value)) {
        const personalDetails = item.value
          .map((detail) => {
            const { title } = detail.value;
            return `Title: ${title}`;
          })
          .join("\n");
        rowValues.push(personalDetails);
      } else if (typeof item.value === "object") {
        rowValues.push(item.value);
      } else {
        rowValues.push(item.value); // Convert non-object values to string
      }
    });
    worksheet.addRow(rowValues);
  });

  const assertFolderPath = path.join(settings.PROJECT_DIR, "public");

  if (!fs.existsSync(assertFolderPath)) {
    fs.mkdirSync(assertFolderPath, { recursive: true });
  }

  //need to change project directory
  const filePathInsert = path.join(assertFolderPath,fileName);
  const filePath = process.env.EXPORT_EXCEL + fileName
  
  await workbook.xlsx.writeFile(filePathInsert);

  return filePath;
};

module.exports = {
  generateExcelData,
};
