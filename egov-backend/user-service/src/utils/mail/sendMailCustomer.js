const axios = require("axios");
const { getblockedDomainsCheck } = require("../commonFunctions/common");
const { sendEmailLogs } = require("../../services/emailLogs.service");
const { generalsettingModal } = require("../../models");
const netcluesImage =
    "https://egov.api.netcluesdemo.com/document/documentFile-1732861699891.gif";
    const eGOVImage =
    "https://egov.api.netcluesdemo.com/document/documentFile-1732861710999.png";


module.exports = {
  forgotPasswordCustomer: async (email, htmlContent) => {
        let setting = await generalsettingModal.findAll({raw: true});
        const extractedSettings = setting.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

    // email.tst
    // test@test.com
    // const email="v1.netclues@gmail.com"
    const isBlocked = await getblockedDomainsCheck(email);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (isBlocked?.status === "blocked") {
      return isBlocked;
    }
    const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
    const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
    const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

    const emailParams = {
      EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
      Subject: "Forgot Password", // Define Email Subject
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
      ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
      RelpyToName: "Reply To Name", // Define Reply To Name
      CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
      BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
      AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
      Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
    };

    const returnObject = {
        EmailPara: JSON.stringify(emailParams),
        SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
        SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
    };

    const headers = {
        Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
    };
    try {
      const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
        headers,
      });

      try {
        sendEmailLogs(
            "Customer Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "2",
            "1"
        );
    } catch (error) {
        console.log(error);
    }

      return { status: response.data || 1, message: "Email is sent." };
    } catch (error) {
        try {
            sendEmailLogs(
                "Customer Login",
                extractedSettings.NOTIFICATION_EMAIL,
                email,
                emailParams.Subject,
                emailParams?.Message,
                "2",
                "0"
            );
        } catch (error) {
            console.log(error);
        }
      return { status: false, message: "Email is not sent." };
    }
  },

  sendOTPmailCustomer: async (email, htmlContent,subject = null) => {
        let setting = await generalsettingModal.findAll({raw: true});
        const extractedSettings = setting.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

    // email.tst
    // test@test.com
    // const email="v1.netclues@gmail.com"
    const isBlocked = await getblockedDomainsCheck(email);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (isBlocked?.status === "blocked") {
      return isBlocked;
    }
    const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
    const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
    const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

    const emailParams = {
      EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
      Subject: subject ? subject :"OTP", // Define Email Subject
      // Message: `Your OTP for login is: ${otp}`,
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
      ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
      RelpyToName: "Reply To Name", // Define Reply To Name
      CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
      BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
      AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
      Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
    };

      const returnObject = {
          EmailPara: JSON.stringify(emailParams),
          SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
          SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
      };

      const headers = {
          Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
      };
    try {
      const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
        headers,
      });

      try {
        sendEmailLogs(
            "Customer Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "2",
            "1"
        );
    } catch (error) {
        console.log(error);
    }
      return { status: response.data || 1, message: "Email is sent." };
    } catch (error) {
        try {
            sendEmailLogs(
                "Customer Login",
                extractedSettings.NOTIFICATION_EMAIL,
                email,
                emailParams.Subject,
                emailParams?.Message,
                "2",
                "0"
            );
        } catch (error) {
            console.log(error);
        }
      return { status: false, message: "Email is not sent." };
    }
  },

  emailConfirmationmailCustomer: async (email, htmlContent) => {
        let setting = await generalsettingModal.findAll({raw: true});
        const extractedSettings = setting.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

    // email.tst
    // test@test.com
    // const email="v1.netclues@gmail.com"
    const isBlocked = await getblockedDomainsCheck(email);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (isBlocked?.status === "blocked") {
      return isBlocked;
    }
    const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
    const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
    const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

    const emailParams = {
      EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
      Subject: "Email Confirmation", // Define Email Subject
      // Message: `Welcome your Email is confirmed on Egov portal!`,
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

      </html>`, // Define Email Message
      ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
      ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
      RelpyToName: "Reply To Name", // Define Reply To Name
      CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
      BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
      AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
      Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
    };

      const returnObject = {
          EmailPara: JSON.stringify(emailParams),
          SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
          SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
      };

      const headers = {
          Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
      };
    try {
      const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
        headers,
      });
      try {
        sendEmailLogs(
            "Customer Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "2",
            "1"
        );
    } catch (error) {
        console.log(error);
    }
      return { status: response.data || 1, message: "Email is sent." };
    } catch (error) {
        try {
            sendEmailLogs(
                "Customer Login",
                extractedSettings.NOTIFICATION_EMAIL,
                email,
                emailParams.Subject,
                emailParams?.Message,
                "2",
                "0"
            );
        } catch (error) {
            console.log(error);
        }
      return { status: false, message: "Email is not sent." };
    }
  },

  setPasswordwelcomemailCustomer: async (email, htmlContent) => {
        let setting = await generalsettingModal.findAll({raw: true});
        const extractedSettings = setting.reduce((acc, setting) => {
            acc[setting.settingKey] = setting.settingValue;
            return acc;
        }, {});

    // email.tst
    // test@test.com
    // const email="v1.netclues@gmail.com"
    const isBlocked = await getblockedDomainsCheck(email);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (isBlocked?.status === "blocked") {
      return isBlocked;
    }
    const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
    const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
    const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

    const emailParams = {
      EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
      Subject: "Set New Password", // Define Email Subject
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
      ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
      RelpyToName: "Reply To Name", // Define Reply To Name
      CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
      BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
      AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
      Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
    };

      const returnObject = {
          EmailPara: JSON.stringify(emailParams),
          SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
          SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
      };

      const headers = {
          Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
      };
    try {
      const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
        headers,
      });
      try {
          sendEmailLogs(
              "Customer Login",
              extractedSettings.NOTIFICATION_EMAIL,
              email,
              emailParams.Subject,
              emailParams?.Message,
              "2",
              "1"
          );
    } catch (error) {
        console.log(error);
    }
      return { status: response.data || 1, message: "Email is sent." };
    } catch (error) {
        try {
            sendEmailLogs(
                "Customer Login",
                extractedSettings.NOTIFICATION_EMAIL,
                email,
                emailParams.Subject,
                emailParams?.Message,
                "2",
                "0"
            );
        } catch (error) {
            console.log(error);
        }
      return { status: false, message: "Email is not sent." };
    }
  },

  deleteAccountConfirmationCustomer: async (email, htmlContent,cancelRequest = false) => {
    let setting = await generalsettingModal.findAll({raw: true});
    const extractedSettings = setting.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
    }, {});

// email.tst
// test@test.com
// const email="v1.netclues@gmail.com"
const isBlocked = await getblockedDomainsCheck(email);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
if (isBlocked?.status === "blocked") {
  return isBlocked;
}
const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

const emailParams = {
  EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
  Subject: cancelRequest ? "Cancel Account Deletion Request":"Delete Account Request", // Define Email Subject
  // Message: `<b>Reset Password Link </b>  <a href=http://localhost:3000/auth-pass-reset-cover/${userId} + '">click here</a>`,
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
  ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
  RelpyToName: "Reply To Name", // Define Reply To Name
  CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
  BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
  AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
  Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
};

const returnObject = {
  EmailPara: JSON.stringify(emailParams),
  SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
  SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
};

const headers = {
  Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
};
try {
  const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
    headers,
  });

  try {
      sendEmailLogs(
          "User Login",
          extractedSettings.NOTIFICATION_EMAIL,
          email,
          emailParams.Subject,
          emailParams?.Message,
          "1",
          "1"
      );
} catch (error) {
    console.log(error);
}

  return { status: response.data || 1, message: "Email is sent." };
} catch (error) {
    try {
        sendEmailLogs(
            "User Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "1",
            "0"
        );
    } catch (error) {
        console.log(error);
    }
  return { status: false, message: "Email is not sent." };
}
},
  afterDeleteConfirmationCustomer: async (email, htmlContent) => {
    let setting = await generalsettingModal.findAll({raw: true});
    const extractedSettings = setting.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
    }, {});

// email.tst
// test@test.com
// const email="v1.netclues@gmail.com"
const isBlocked = await getblockedDomainsCheck(email);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
if (isBlocked?.status === "blocked") {
  return isBlocked;
}
const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

const emailParams = {
  EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
  Subject: "Confirmation of Account Deletion", // Define Email Subject
  // Message: `<b>Reset Password Link </b>  <a href=http://localhost:3000/auth-pass-reset-cover/${userId} + '">click here</a>`,
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
  ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
  RelpyToName: "Reply To Name", // Define Reply To Name
  CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
  BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
  AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
  Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
};

const returnObject = {
  EmailPara: JSON.stringify(emailParams),
  SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
  SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
};

const headers = {
  Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
};
try {
  const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
    headers,
  });

  try {
      sendEmailLogs(
          "User Login",
          extractedSettings.NOTIFICATION_EMAIL,
          email,
          emailParams.Subject,
          emailParams?.Message,
          "1",
          "1"
      );
} catch (error) {
    console.log(error);
}

  return { status: response.data || 1, message: "Email is sent." };
} catch (error) {
    try {
        sendEmailLogs(
            "User Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "1",
            "0"
        );
    } catch (error) {
        console.log(error);
    }
  return { status: false, message: "Email is not sent." };
}
},
 delinkMailToParentCustomer: async (email, htmlContent,transfer=false) => {
    let setting = await generalsettingModal.findAll({raw: true});
    const extractedSettings = setting.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
    }, {});

// email.tst
// test@test.com
// const email="v1.netclues@gmail.com"
const isBlocked = await getblockedDomainsCheck(email);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
if (isBlocked?.status === "blocked") {
  return isBlocked;
}
const toEmail = email; // Define To Email Id and please note that if multiple email addresses then pass comma separated.
const ccEmail = ""; // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
const bccEmail = ""; // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.

const emailParams = {
  EmailTo: toEmail || "", // Define To Email Address and please note that if multiple email addresses then pass comma separated.
  Subject: transfer?"Account Transfer Confirmation":"Account Delink Confirmation", // Define Email Subject
  // Message: `<b>Reset Password Link </b>  <a href=http://localhost:3000/auth-pass-reset-cover/${userId} + '">click here</a>`,
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
  ReplyToEmail: "", // Define Reply To Email Address and please note that if multiple email addresses then pass comma separated.
  RelpyToName: "Reply To Name", // Define Reply To Name
  CcEmail: ccEmail || "", // Define CC Email Id and please note that if multiple email addresses then pass comma separated.
  BccEmail: bccEmail || "", // Define BCC Email Id and please note that if multiple email addresses then pass comma separated.
  AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv", // Define Allow Your Attachment Type
  Attachment: [], // Pass Attachment in array Eg. array('https://www.xxx.ky/PDF/Ticketive_Event/Ticketive-Event-10240_1691033814.pdf', 'https://www.xxx.ky/QRCode/Tours/T_10000_1664514000.png', 'https://www.xxxx.ky/PDF/Reservation_Tour_Invoice/Turtle-Tour-Reservation-invoice-30012.pdf'),
};

const returnObject = {
  EmailPara: JSON.stringify(emailParams),
  SiteId: extractedSettings.NMAIL_SITE_ID, // Define Site ID
  SiteTocken: extractedSettings.NMAIL_SITE_TOCKEN, // Define SiteKey
};

const headers = {
  Authorization: extractedSettings.NMAIL_HEADER_TOKEN,
};
try {
  const response = await axios.post(extractedSettings.NMAIL_URL, returnObject, {
    headers,
  });

  try {
      sendEmailLogs(
          "User Login",
          extractedSettings.NOTIFICATION_EMAIL,
          email,
          emailParams.Subject,
          emailParams?.Message,
          "1",
          "1"
      );
} catch (error) {
    console.log(error);
}

  return { status: response.data || 1, message: "Email is sent." };
} catch (error) {
    try {
        sendEmailLogs(
            "User Login",
            extractedSettings.NOTIFICATION_EMAIL,
            email,
            emailParams.Subject,
            emailParams?.Message,
            "1",
            "0"
        );
    } catch (error) {
        console.log(error);
    }
  return { status: false, message: "Email is not sent." };
}
},
};
