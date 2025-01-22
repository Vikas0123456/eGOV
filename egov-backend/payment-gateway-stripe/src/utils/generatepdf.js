const puppeteer = require("puppeteer");

async function generatePDF(data, file) {
    // Launch a new browser session with optimized settings.
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        // Open a new page.
        const page = await browser.newPage();

        // Template for HTML content with dynamic data.
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
 
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Details</title>
    <style>
        :root {
            --primary-color: #0056b3;
            --secondary-color: #6c757d;
            --success-color: #28a745;
            --light-color: #f8f9fa;
        }
 
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: var(--light-color);
            color: var(--secondary-color);
        }
 
        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
 
        .invoice-header {
            background: var(--primary-color);
            color: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
 
        .invoice-header h2 {
            margin: 0;
            font-size: 24px;
        }
 
        .invoice-body {
            padding: 20px;
        }
 
        .logo {
            text-align: center;
            margin: 20px 0;
        }
 
        .logo img {
            max-width: 100px;
        }
 
        .title {
            text-align: center;
            font-size: 24px;
            margin: 20px 0;
            position: relative;
        }
 
        .title::before,
        .title::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 40%;
            height: 1px;
            background: #ddd;
        }
 
        .title::before {
            left: 0;
        }
 
        .title::after {
            right: 0;
        }
 
        .title span {
            background: #fff;
            padding: 0 10px;
            position: relative;
            z-index: 1;
        }
 
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
 
        table th,
        table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
 
        table th {
            background-color: var(--primary-color);
            color: #fff;
        }
 
        .invoice-total {
            text-align: right;
            margin-top: 20px;
            font-size: 18px;
            padding: 0 20px;
        }
 
        .success {
            color: var(--success-color);
        }
 
        .center {
            text-align: center;
        }
 
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: var(--secondary-color);
            background: #f1f1f1;
            border-radius: 0 0 8px 8px;
        }
    </style>
</head>
 
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <h2>Payment Invoice</h2>
        </div>
 
        <div class="invoice-body">
            <div class="logo">
                <img src="${process.env.API_URL}document/assets/documentFile-1715162311085.png" alt="Logo">
            </div>
            <div class="title">
                <span>Transaction Details</span>
            </div>
 
            <table>
                <tr>
                    <th>Details</th>
                    <th>Information</th>
                </tr>
                <tr>
                    <td>Customer Name:</td>
                    <td>${data.customerId}</td>
                </tr>
                <tr>
                    <td>Application ID:</td>
                    <td>${data.applicationId}</td>
                </tr>
                <tr>
                    <td>Service:</td>
                    <td>${data.serviceSlug}</td>
                </tr>
                <tr>
                    <td>Transaction ID:</td>
                    <td>${data.transactionId}</td>
                </tr>
                <tr>
                    <td>Transaction Amount:</td>
                    <td>$${data.transactionAmount}</td>
                </tr>
                <tr>
                    <td>Transaction Status:</td>
                    <td class="success">${data.transactionStatus}</td>
                </tr>
            </table>
        </div>
 
        <div class="invoice-total">
            <strong>Total Amount: $${data.transactionAmount}</strong>
        </div>
 
        <div class="center">
            <p>Thank you!</p>
        </div>
 
        <div class="footer">
            <p>EGov Services Department</p>
            <p>Government of Bahamas</p>
        </div>
    </div>
</body>
 
</html>
`;

        // Set the content of the page with increased timeout.
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 60000, // 60 seconds
        });

        // return await page.pdf({
        //     format: "A4",
        //     printBackground: true,
        //     margin: {
        //         top: "10px",
        //         right: "20px",
        //         bottom: "10px",
        //         left: "20px",
        //     },
        //     scale: 1.2,
        // });

        // Generate PDF with margin
        await page.pdf({
            path: file,
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

    return file;
}

module.exports = {
    generatePDF,
};
