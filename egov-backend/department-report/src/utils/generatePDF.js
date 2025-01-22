const puppeteer = require("puppeteer");

async function generatePDF(data, filePath) {
    // Launch a new browser session with optimized settings.
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });

    try {
        // Open a new page.
        const page = await browser.newPage();

        let htmlContent;

        if (data.sheet === "Revenue") {
            const departmentHeaders = data.headers
                .map((header) => `<th>${header}</th>`)
                .join("");
            const serviceHeaders = `
              <tr>
                  <th>Service Name</th>
                  <th>Total Revenue</th>
              </tr>
          `;

            const tables = data.revenue
                .map((row) => {
                    const services = row.serviceList
                        .map(
                            (service) => `
                  <tr>
                      <td style="padding-left: 20px;">${service.serviceName}</td>
                      <td>$ ${service.totalRevenueService}</td>
                  </tr>
              `
                        )
                        .join("");

                    return `
                  <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                      <thead>
                          <tr>
                              ${departmentHeaders}
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>${row.departmentName}</td>
                              <td>$ ${row.totalRevenueDepartment}</td>
                          </tr>
                          ${serviceHeaders}
                          ${services}
                      </tbody>
                  </table>
                  
                  
                  
              `;
                })
                .join("");

            htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>PDF Example</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          margin: 40px;
                      }
                      h1 {
                          color: #333;
                      }
                      table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      th, td {
                          border: 1px solid #000;
                          padding: 8px;
                          text-align: left;
                      }
                      th {
                          background-color: #f2f2f2;
                      }
                  </style>
              </head>
              <body>
                  <h1>${data.sheet}</h1>
                  ${tables}
              </body>
              </html>
          `;
        } else {
            const applicationHeaders = data.application.headers
                .map((header) => `<th>${header}</th>`)
                .join("");
            const applicationRows = data.application.data
                .map(
                    (row) => `
              <tr>
                  <td>${row.departmentName || row.userName}</td>
                  <td>${row.RequestAssigned}</td>
                  <td>${row.RequestCompleted}</td>
                  <td>${row.averageTime}</td>
              </tr>
          `
                )
                .join("");

            const ticketHeaders = data.ticket.headers
                .map((header) => `<th>${header}</th>`)
                .join("");
            const ticketRows = data.ticket.data
                .map(
                    (row) => `
              <tr>
                  <td>${row.departmentName || row.userName}</td>
                  <td>${row.RequestAssigned}</td>
                  <td>${row.RequestCompleted}</td>
                  <td>${row.averageTime}</td>
                  <td>${row.tatTime}</td>
              </tr>
          `
                )
                .join("");

            htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Revenue PDF</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          margin: 40px;
                      }
                      h1 {
                          color: #333;
                      }
                      table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      th, td {
                          border: 1px solid #000;
                          padding: 8px;
                          text-align: left;
                      }
                      th {
                          background-color: #f2f2f2;
                      }
                  </style>
              </head>
              <body>
                  <h1>${data.application.label}</h1>
                  <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                      <thead>
                          <tr>
                              ${applicationHeaders}
                          </tr>
                      </thead>
                      <tbody>
                          ${applicationRows}
                      </tbody>
                  </table>

                  <h1>${data.ticket.label}</h1>
                  <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                      <thead>
                          <tr>
                              ${ticketHeaders}
                          </tr>
                      </thead>
                      <tbody>
                          ${ticketRows}
                      </tbody>
                  </table>
              </body>
              </html>
          `;
        }

        // Set the content of the page with increased timeout.
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 60000, // 60 seconds
        });

        // Generate PDF with margin
        await page.pdf({
            path: filePath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "10px",
                right: "20px",
                bottom: "10px",
                left: "20px",
            },
            scale: 1.2, // Adjust scale to fit content on one page
        });
    } catch (error) {
        console.error("Error occurred while generating PDF:", error);
    } finally {
        await browser.close();
    }
}

module.exports = {
    generatePDF,
};
