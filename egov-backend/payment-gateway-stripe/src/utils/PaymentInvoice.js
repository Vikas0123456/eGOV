const puppeteer = require("puppeteer");

async function paymentInvoice(data, file) {
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
<html lang='en'>

<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Egov Payment Invoice</title>
    <style>
        body {
            /* margin: 0; */
            padding: 0;
            font-family: ' Arial Unicode MS', 'Sans-serif', 'Microsoft Sans Serif', 'Times New Roman';
            font-size: small;
            /* font-family: 'Segoe UI', 'Segoe WP', 'Segoe UI Regular', 'Helvetica Neue', Helvetica, Tahoma, 'Arial Unicode MS', Sans-serif; */
            font-style: normal;
            margin: 0px 0px 0px 0px
        }

        table,
        tr,
        td,
        th {
            border-collapse: collapse;
            border: 2px solid #b7b7b7;
        }

        img {
            border: none;
            outline: none;
            max-width: 100%;
        }

        p {
            margin: 0px;
        }

        h5,
        h4 {
            margin: 0;
        }

        .tblcomon {
            border: 0px hidden !important;
            width: 100%;
        }

        .noborder {
            border: 0px hidden !important;
        }

        .font-bold {
            font-weight: bold;
        }

        .halfwidth {
            width: 50%;
        }

        .subtable {
            width: 100%;
            border-top: 0px !important;
        }

        .success {
            color: var(--success-color);
        }

        .test2 {
            width: 150px;
        }

        .subtable-comp {
            border-top: 0px !important;
        }
    </style>
</head>

<body>

    <table width="100%" style="border:none; margin: 50px auto; border-collapse: collapse;">
        <tbody>
            <tr style="border: none;">
                <td style="border: none;">
                    <table style='width: 100%;'>
                        <!-- main header Start -->
                        <tr>
                            <td colspan='2'>
                                <table class='tblcomon'>
                                    <tr class='noborder'>
                                        <td class='noborder' Valign='center' style="text-align: left; padding-left:15px">
                                            <h3 style="margin: 0; text-align:left; font-size: 18px;">Payment Invoice</h3>
                                        </td>
                                        <td class='noborder' valign="bottom" style="padding: 10px; text-align: right;">
                                             <img style="max-width: 100px;" src="${
                                                 process.env.API_URL
                                             }document/assets/logo-dark-d.png" alt="Logo">
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- main header End -->
                        <!--invoice details and customer address Start-->
                        <tr>
                            <td class='halfwidth' style="padding: 0 10px 10px 10px;">
                                <table class='tblcomon'>
                                    <tr class='noborder'>
                                        <td class='noborder' style="padding-top: 10px;">Name :</td>
                                        <td class='noborder font-bold' style="padding-top: 10px;">${
                                            data.customerId
                                        }</td>
                                    </tr>
                
                                    <tr class='noborder'>
                                        <td class='noborder' style="padding-top: 10px;">Invoice Date :</td>
                                        <td class='noborder font-bold' style="padding-top: 10px;">${new Date().toLocaleDateString(
                                            "en-GB",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )}</td>

                                    </tr>
                
                                    <tr class='noborder'>
                                        <td class='noborder' style="padding-top: 10px;">Transaction ID :</td>
                                        <td class='noborder font-bold' style="padding-top: 10px;">${
                                            data.transactionId
                                        }</td>
                                    </tr>
                                </table>
                            </td>
                            
                        </tr>
                        <!--invoice details and customer address End-->
                        
                        <tr>
                            <td colspan="2" style='padding: 10px; text-align: center;'>
                                <h4>
                                    <b>Transaction Summary</b>
                                </h4>
                            </td>
                        </tr>
                    </table>
                    <!--invoice iteam details Start-->
                    <table class='subtable'>
                        <tr class='subtable-comp' style='background-color:#f2f3f4 ;'>
                            <td rowspan="2" class='font-bold subtable-comp' style="padding: 10px; text-align:center;">#</td>
                            <td  class='font-bold subtable-comp' style="padding: 10px;">Application ID</td>
                            <td rowspan="2" class='font-bold subtable-comp' style="padding: 10px;">Service Name</td>
                            <td rowspan="2" class='font-bold subtable-comp' style="padding: 10px; text-align:right;">Amount</td>
                           
                        </tr>
                        <tr></tr>
                                <tr>
                                    <td style="padding: 10px; text-align:center">${
                                     1
                                    }</td>
                                    <td style="padding: 10px;">${
                                        data.applicationId
                                    }</td>
                                    <td class="test2" style="padding: 10px;">${
                                        data.serviceName
                                    }</td>
                                    <td style="padding: 10px; text-align:right;">$${
                                        data.transactionAmount
                                    }</td>
                                </tr>
                        
                    </table>
                    <!--invoice iteam details End-->
                
                    <table class='subtable'>
                        <tr class='subtable-comp'>
                            
                            <td class='subtable-comp' style='width: 50%; padding: 10px;  vertical-align: top;'>
                                <table class='tblcomon noborder'>
                                <tr align='right'>
                                    <td class='noborder' style="padding-top: 10px ;padding-right:0; margin-right:0"><strong>Total</strong><span style="margin-left: 15px; padding-right:0;">$${
                                        data.transactionAmount
                                    }</span></td>
                                </tr>
                                
                                   
                                </table>
                            </td>
                        </tr>
                    </table>
                
                    <table class='subtable'>
                        <tr class='subtable-comp'>
                            <td class='subtable-comp' style='width: 50%; width: 50%; text-align: center; padding: 15px 0;'>
                                EGov Services Department <br/> Government of Bahamas
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
   
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
    paymentInvoice,
};
