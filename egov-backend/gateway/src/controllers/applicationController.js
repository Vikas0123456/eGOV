const express = require("express");
const axios = require("axios");
const { encrypt, decrypt } = require("../middleware/encryptDecrypt");
const { MESSAGES } = require("../utiles/constants");

const getCertificateUsingQrcode = async (req, res) => {
  try {
    const qrCodeData = req.params.data;
    const decryptData = decrypt({ data: qrCodeData });
    const data = decryptData.data;
    let applicationDetail;
    try {
      applicationDetail = await axios.post(
        `${process.env.BUSINESSLICENSESERVICE}/application/applicationDetailForQrScan`,
        { data: { slug: data?.application, applicationId: data?.id } }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error retrieving application data",
        success: false,
        data: {},
      });
    }
    const applicationData = applicationDetail?.data?.data;
    if (applicationData?.expiryDate === null) {
      if (applicationData?.issuedDocumentId) {
        const Docdata = {
          documentId: applicationData?.issuedDocumentId,
        };
        const docApiUrl = `${process.env.DOCUMENTSERVICE}/document/list/upload`;

        try {
          const responseDoc = await axios.post(docApiUrl, {
            data: Docdata,
          });
          const path = responseDoc.data.data.rows?.[0]?.documentPath;
          return res.redirect(path);
        } catch (error) {
          return res.status(500).json({
            message: "Error retrieving document",
            success: false,
            data: {},
          });
        }
      } else {
        return res.status(404).json({
          message: "Document not found",
          success: false,
          data: {},
        });
      }
    } else {
      const currentDate = Date.now();
      const expiryDate = Date.parse(applicationData.expiryDate);
      if (currentDate > expiryDate) {
        return res.redirect("http://localhost:3000/application-expired");
      } else {
 
        if (applicationData?.issuedDocumentId) {
          const Docdata = {
            documentId: applicationData?.issuedDocumentId,
          };
          const docApiUrl = `${process.env.DOCUMENTSERVICE}/document/list/upload`;

          try {
            const responseDoc = await axios.post(docApiUrl, {
              data: Docdata,
            });
            const path = responseDoc.data.data.rows?.[0]?.documentPath;
            return res.redirect(path);
          } catch (error) {
            return res.status(500).json({
              message: "Error retrieving document",
              success: false,
              data: {},
            });
          }
        } else {
          return res.status(404).json({
            message: "Document not found",
            success: false,
            data: {},
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
      data: {},
    });
  }
};

module.exports = {
  getCertificateUsingQrcode,
};
