const puppeteer = require("puppeteer");

async function generatePDF(data, qrCodeDataURL) {
    try {
        if (!process.env.API_URL) {
            throw new Error("API_URL environment variable is not set.");
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        const processHtmlContent = (html) => {
            let keyValuePairs = [];
            const rowRegex = /<tr>(.*?)<\/tr>/g;
            const thRegex = /<th.*?>(.*?)<\/th>/;
            const tdRegex = /<td.*?>(.*?)<\/td>/;
            const rows = html.match(rowRegex);

            if (rows) {
                rows.forEach((row) => {
                    const thMatch = row.match(thRegex);
                    const tdMatch = row.match(tdRegex);
                    if (thMatch && tdMatch) {
                        const key = thMatch[1].replace(/<.*?>/g, "").trim();
                        const value = tdMatch[1].replace(/<.*?>/g, "").trim();
                        keyValuePairs.push({ key, value });
                    }
                });
            }

            return keyValuePairs;
        };

        const keyValuePairs = processHtmlContent(data?.formData);

        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data?.serviceName} Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            
            body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                background: #ffffff;
                color: #333;
                font-size: 16pt; /* Increased base font size */
            }

            .certificate {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 15mm;
                box-sizing: border-box;
                position: relative;
                background: #ffffff;
                border: 2px solid #3498db;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2mm;
                border-bottom: 2px solid #3498db;
                padding-bottom: 5mm;
            }

            .logo, .qr-code {
                width: 25mm;
                height: 25mm;
                object-fit: contain;
            }

            .title-container {
                text-align: center;
                flex-grow: 1;
            }

            h1 {
                font-size: 25pt; /* Increased font size */
                color: #2c3e50;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            h2 {
                font-size: 20pt; /* Increased font size */
                color: #34495e;
                margin: 3mm 0 0 0;
            }

            .main-content-header{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5mm;
            }

            .content {
                margin-top: 10mm;
                background-color: #f8f9fa;
                padding: 8mm;
                border-radius: 3mm;
            }

            .field {
                margin-bottom: 5mm;
                display: flex;
                align-items: baseline;
            }

            .field-name {
                font-weight: 500;
                color: #2c3e50;
                width: 40%;
                text-align: right;
                padding-right: 4mm;
                font-size: 18pt; /* Increased font size */
            }

            .field-value {
                font-weight: 400;
                color: #34495e;
                width: 60%;
                word-break: break-word;
                font-size: 18pt; /* Increased font size */
            }

            .footer {
                position: absolute;
                bottom: 10mm;
                left: 15mm;
                right: 15mm;
                text-align: center;
                font-size: 14pt; /* Increased font size */
                color: #2c3e50;
                background-color: #ecf0f1;
                padding: 4mm;
                border-radius: 2mm;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .footer p {
                margin: 2mm 0;
            }

            @media print {
                body {
                    background: white;
                }
                .certificate {
                    border: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <img src="${
                    data?.departmentLogo
                }" alt="Department Logo" class="logo">
                <div class="title-container">
                    <h2>${data?.departmentName}</h2>
                    <h1>${data?.serviceName}</h1>
                </div>
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
            </div>
            <div class="main-content-header">
                  <div><strong> Certificate No: <span>${data.certificateNumber || "-"}</span></strong></div>
                  <div><strong>Date: <span>${data.certificateGenerateDate || "-"}</span></strong></div>
            </div>
            <div class="content">
                ${keyValuePairs
                    .map(
                        (pair) => `
                    <div class="field">
                        <span class="field-name">${pair.key}:</span>
                        <span class="field-value">${pair.value}</span>
                    </div>
                `
                    )
                    .join("")}
            </div>
            <div class="footer">
                <p>This certificate is electronically generated and does not require a physical signature.</p>
                <p>Powered by Netclues</p>
            </div>
        </div>
    </body>
    </html>
    `;

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
        });

        await page.pdf({
            path: data.filePath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "0",
                right: "0",
                bottom: "0",
                left: "0",
            },
        });

        await browser.close();
        return data.filePath;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

async function generateDynamicPDF(data) {
    try {
        if (!process.env.API_URL) {
            throw new Error("API_URL environment variable is not set.");
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        await page.setContent(data.formData, {
            waitUntil: "networkidle0",
        });

        await page.pdf({
            path: data.filePath,
            format: "A4",
            printBackground: true,
        });

        await browser.close();
        return data.filePath;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

module.exports = {
    generatePDF,
    generateDynamicPDF,
};