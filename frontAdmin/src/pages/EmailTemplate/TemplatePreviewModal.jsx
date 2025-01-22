import React from "react";
import { Button, Modal } from "react-bootstrap";
import Logo from "../../assets/images/logo-dark-d.png";
import SimpleBar from "simplebar-react";
import netcluesImage from "../../assets/images/netcluesImage.gif";
import eGOVImage from "../../assets/images/eGOVImage.png";

const PreviewTemplateModel = ({ show, setShow, handleToggle, data }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const htmlContent = `
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
                    border-collapse: collapse;
                }

                table td {
                    border-collapse: collapse;
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
                                    <table width="90%" border="0" cellpadding="0" cellspacing="0" align="center">
                                        <tr>
                                            <td width="38%" align="center" valign="middle" style="padding:15px;">
                                                <a title="eGOV" href="https://egov.customerportal.netcluesdemo.com/">
                                                    <img src="${eGOVImage}" style="width:100px;"
                                                        alt="egov" />
                                                </a>
                                            </td>
                                        </tr>
                                    <tr>
                                        <td align="left" style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; color:#707070; padding: 0 0 4px; text-align: left; padding-left: 20px; padding-top: 10px; padding-bottom: 10px;">${data.content}</td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-top: 10px; padding-left: 20px;">Best Regards,</td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="font-family:Montserrat,sans-serif; font-size:16px; line-height:20px; text-align: left; padding-bottom: 10px; padding-left: 20px;">eGov</td>
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
                                        <td align="center" valign="middle" style="font-family:Montserrat,sans-serif; font-size:14px; line-height:16px; font-weight:400; color:#707070; padding:0 10px;">Copyright © ${currentYear} eGov. All Rights Reserved.</td>
                                    </tr>
                                    <tr>
                                        <td align="center" valign="middle">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center; padding:10px 0 20px;">
                                            <span>Powered by:</span>
                                            <a href="https://www.netclues.ky/" title="Netclues!" style=" display:inline-flex; vertical-align:middle;">
                                                <img src="${netcluesImage}" alt="netclues" style='height:18px; width:18px;' />
                                            </a>
                                        </td>
                                    </tr>
                                    </table>
                            </td>
                        </tr>
                        <tr>
                            <td height="5" align="left" valign="middle" bgcolor="#013357"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
  return (
    <Modal
      aria-labelledby="contained-modal-title-center"
      show={show}
      onHide={handleToggle}
      size="lg"
      centered
    >
      {/* <div className="modal-body"> */}
      <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}>
      <div className="card mb-0">
        <div className="card-header badge-soft-success">
          <div className="d-flex">
            <div className="flex-grow-1">
              <h5 className="card-title mb-0">Preview Email Template</h5>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={handleToggle}
            ></button>
          </div>
        </div>
        <div className="card-body" style={{ background: "#f0f0f0" }}>
          <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>
      </div>
      </SimpleBar>
      {/* </div> */}
    </Modal>
  );
};

export default PreviewTemplateModel;
