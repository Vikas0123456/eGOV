const axios = require("axios");
const netcluesImage =
    "https://egov.api.netcluesdemo.com/document/documentFile-1732861699891.gif";
    const eGOVImage =
    "https://egov.api.netcluesdemo.com/document/documentFile-1732861710999.png";

const getEmailSettings = async () => {
    try {
        const headers = {
            jwttoken: '',
            jwtpayload: JSON.stringify({})
        };

        const emailSettingResponse = await axios.post(
            `${process.env.USERMICROSERVICE}/setting/get`,
            { data: {} },
            { headers }
        );

        const result = emailSettingResponse?.data?.data;
        return result;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

module.exports = {

    adminAssignMail: async (email, htmlContent, serviceName) => {

        const settings = await getEmailSettings();
        if (!settings) {
            return { status: false, message: "Email settings could not be retrieved." };
        }

        const settingMap = settings.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

        const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
        const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
        const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const emailParams = {
        EmailTo: email || "",
        Subject: `New assignment for ${serviceName}`,
        Message: `
        <!DOCTYPE html>
        <html>

        <head>
            <style type="text/css">
                body {
                    margin: 0;
                    padding: 0;
                    background: #f0f0f0;
                    font-family: Montserrat, sans-serif;
                }

                table {
                    border-collapse: collapse
                }

                table td {
                    border-collapse: collapse
                }

                img {
                    border: none;
                }
            </style>
        </head>

        <body style="background:#f0f0f0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valign="top">
                        <table width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td height="5" align="left" valign="middle" bgcolor="#013357"></td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff">
                                    <table width="90%" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td width="38%" align="center" valign="middle" style="padding:15px;">
                                                <a title="eGOV"><img src=${eGOVImage} width="100" alt="egov"
                                                        style="display:inline-block;" /></a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; color:#707070; padding: 0 0 4px; text-align: left; padding-left: 20px; padding-top: 10px; padding-bottom: 10px;">
                                                ${htmlContent}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-top: 10px; padding-left: 20px;">
                                                Best Regards,</td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-bottom: 10px; padding-left: 20px;">
                                                eGov</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#dcdcdc" style="height:2px;"></td>
                            </tr>
                            <tr>
                                <td align="center" valign="middle" bgcolor="#FFFFFF">
                                    <table width="90%" border="0" align="center" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle"
                                                style="font-family:Montserrat,sans-serif; font-size:14px; line-height:16px; font-weight:400; color:#707070; padding:0 10px;">
                                                Copyright © ${currentYear} eGov. All Rights Reserved.</td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center; padding:10px 0 20px;">
                                                <span>Powered by:</span>
                                                <a href="https://www.netclues.ky/" title="Netclues!"
                                                    style=" display:inline-flex; vertical-align:middle;">
                                                    <img src="${netcluesImage}" alt="netclues"
                                                        style='height:18px; width:18px;' />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#013357" style="height:5px;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>

        </html>`,
        ReplyToEmail: "",
        RelpyToName: "Reply To Name",
        CcEmail: "",
        BccEmail: "",
        AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv",
        Attachment: [],
        };

        const returnObject = {
            EmailPara: JSON.stringify(emailParams),
            SiteId: settingMap.NMAIL_SITE_ID,
            SiteTocken: settingMap.NMAIL_SITE_TOCKEN,
        };

        const headers = {
            Authorization: settingMap.NMAIL_HEADER_TOKEN,
        };
        try {
            const response = await axios.post(settingMap.NMAIL_URL, returnObject, {
                headers,
            });

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: email,
                    recipient_email : settingMap.NOTIFICATION_EMAIL,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "1"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: response.data || 1, message: "Email is sent." };
        } catch (error) {

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: email,
                    recipient_email : settingMap.NOTIFICATION_EMAIL,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "0"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: false, message: "Email is not sent." };
        }
    },

    statusUpdateMail: async (email, htmlContent, serviceName) => {

        const settings = await getEmailSettings();
        if (!settings) {
            return { status: false, message: "Email settings could not be retrieved." };
        }

        const settingMap = settings.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

        const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
        const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
        const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const emailParams = {
        EmailTo: email || "",
        Subject: `Update the status for the application of ${serviceName}`,
        Message: `
        <!DOCTYPE html>
        <html>

        <head>
            <style type="text/css">
                body {
                    margin: 0;
                    padding: 0;
                    background: #f0f0f0;
                    font-family: Montserrat, sans-serif;
                }

                table {
                    border-collapse: collapse
                }

                table td {
                    border-collapse: collapse
                }

                img {
                    border: none;
                }
            </style>
        </head>

        <body style="background:#f0f0f0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valign="top">
                        <table width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td height="5" align="left" valign="middle" bgcolor="#013357"></td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff">
                                    <table width="90%" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td width="38%" align="center" valign="middle" style="padding:15px;">
                                                <a title="eGOV"><img src=${eGOVImage} width="100" alt="egov"
                                                        style="display:inline-block;" /></a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; color:#707070; padding: 0 0 4px; text-align: left; padding-left: 20px; padding-top: 10px; padding-bottom: 10px;">
                                                ${htmlContent}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-top: 10px; padding-left: 20px;">
                                                Best Regards,</td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-bottom: 10px; padding-left: 20px;">
                                                eGov</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#dcdcdc" style="height:2px;"></td>
                            </tr>
                            <tr>
                                <td align="center" valign="middle" bgcolor="#FFFFFF">
                                    <table width="90%" border="0" align="center" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle"
                                                style="font-family:Montserrat,sans-serif; font-size:14px; line-height:16px; font-weight:400; color:#707070; padding:0 10px;">
                                                Copyright © ${currentYear} eGov. All Rights Reserved.</td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center; padding:10px 0 20px;">
                                                <span>Powered by:</span>
                                                <a href="https://www.netclues.ky/" title="Netclues!"
                                                    style=" display:inline-flex; vertical-align:middle;">
                                                    <img src="${netcluesImage}" alt="netclues"
                                                        style='height:18px; width:18px;' />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#013357" style="height:5px;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>

        </html>`,
        ReplyToEmail: "",
        RelpyToName: "Reply To Name",
        CcEmail: "",
        BccEmail: "",
        AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv",
        Attachment: [],
        };

        const returnObject = {
            EmailPara: JSON.stringify(emailParams),
            SiteId: settingMap.NMAIL_SITE_ID,
            SiteTocken: settingMap.NMAIL_SITE_TOCKEN,
        };

        const headers = {
            Authorization: settingMap.NMAIL_HEADER_TOKEN,
        };
        try {
            const response = await axios.post(settingMap.NMAIL_URL, returnObject, {
                headers,
            });

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: settingMap.NOTIFICATION_EMAIL,
                    recipient_email :email,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "1"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: response.data || 1, message: "Email is sent." };
        } catch (error) {

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: settingMap.NOTIFICATION_EMAIL,
                    recipient_email :email,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "0"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: false, message: "Email is not sent." };
        }
    },

    sendCertificateMail: async (email, htmlContent, pdfUrl, serviceName) => {

        const settings = await getEmailSettings();
        if (!settings) {
            return { status: false, message: "Email settings could not be retrieved." };
        }
    
        const settingMap = settings.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

        const toEmail = email;
        const ccEmail = "";
        const bccEmail = "";
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const emailParams = {
        EmailTo: email || "",
        Subject: `Send certificate for the application of ${serviceName}`,
        Message: `
        <!DOCTYPE html>
        <html>

        <head>
            <style type="text/css">
                body {
                    margin: 0;
                    padding: 0;
                    background: #f0f0f0;
                    font-family: Montserrat, sans-serif;
                }

                table {
                    border-collapse: collapse
                }

                table td {
                    border-collapse: collapse
                }

                img {
                    border: none;
                }
            </style>
        </head>

        <body style="background:#f0f0f0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" valign="top">
                        <table width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                            <tr>
                                <td height="5" align="left" valign="middle" bgcolor="#013357"></td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff">
                                    <table width="90%" border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td width="38%" align="center" valign="middle" style="padding:15px;">
                                                <a title="eGOV"><img src=${eGOVImage} width="100" alt="egov"
                                                        style="display:inline-block;" /></a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; color:#707070; padding: 0 0 4px; text-align: left; padding-left: 20px; padding-top: 10px; padding-bottom: 10px;">
                                                ${htmlContent}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-top: 10px; padding-left: 20px;">
                                                You can download the certificate <a href="${pdfUrl}"
                                                    target="_blank">here</a>.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-top: 10px; padding-left: 20px;">
                                                Best Regards,
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="left"
                                                style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-bottom: 10px; padding-left: 20px;">
                                                eGov
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#dcdcdc" style="height:2px;"></td>
                            </tr>
                            <tr>
                                <td align="center" valign="middle" bgcolor="#FFFFFF">
                                    <table width="90%" border="0" align="center" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle"
                                                style="font-family:Montserrat,sans-serif; font-size:14px; line-height:16px; font-weight:400; color:#707070; padding:0 10px;">
                                                Copyright © ${currentYear} eGov. All Rights Reserved.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td style="text-align:center; padding:10px 0 20px;">
                                                <span>Powered by:</span>
                                                <a href="https://www.netclues.ky/" title="Netclues!"
                                                    style=" display:inline-flex; vertical-align:middle;">
                                                    <img src="${netcluesImage}" alt="netclues"
                                                        style='height:18px; width:18px;' />
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">&nbsp;</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td height="0" align="left" valign="middle" bgcolor="#013357" style="height:5px;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>

        </html>`,
        ReplyToEmail: "",
        RelpyToName: "Reply To Name",
        CcEmail: "",
        BccEmail: "",
        AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv",
        Attachment: [pdfUrl], // Attach the PDF URL here
        };

        const returnObject = {
            EmailPara: JSON.stringify(emailParams),
            SiteId: settingMap.NMAIL_SITE_ID,
            SiteTocken: settingMap.NMAIL_SITE_TOCKEN,
        };

        const headers = {
            Authorization: settingMap.NMAIL_HEADER_TOKEN,
        };
        try {
            const response = await axios.post(settingMap.NMAIL_URL, returnObject, {
                headers,
            });

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: settingMap.NOTIFICATION_EMAIL,
                    recipient_email :email,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "1"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: response.data || 1, message: "Email is sent." };
        } catch (error) {

            try {
                const emailLogBody = {
                    moduleName: serviceName,
                    sender_email: settingMap.NOTIFICATION_EMAIL,
                    recipient_email :email,
                    subject: emailParams.Subject,
                    content: emailParams?.Message,
                    sender_type: "1",
                    isMailedSuccess: "0"
                }

                await axios.post(
                    `${process.env.USERMICROSERVICE}/emailLog/create`,
                    {
                        data: emailLogBody,
                    }
                );
            } catch (error) {
                console.log(error);
            }

            return { status: false, message: "Email is not sent." };
        }
    },

}