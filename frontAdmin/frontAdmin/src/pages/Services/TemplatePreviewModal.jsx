import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import SimpleBar from "simplebar-react";
import { serviceTemplates } from "./CertificateTemplates";

const processHtmlContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const rows = doc.querySelectorAll("tr");
    let keyValuePairs = [];

    rows.forEach((row) => {
        const keyElement = row.querySelector("th p") || row.querySelector("th");
        const valueElement =
            row.querySelector("td p") || row.querySelector("td");

        if (keyElement && valueElement) {
            const key = keyElement.innerHTML;
            const value = valueElement.innerHTML;
            keyValuePairs.push({ key, value });
        }
    });

    return keyValuePairs;
};

const CertificatePreview = ({
    show,
    setShow,
    handleToggle,
    data,
    selectedDepartment,
}) => {
    const logo =
        selectedDepartment && selectedDepartment?.imageData?.documentPath;
    const departmentName =
        selectedDepartment && selectedDepartment.departmentName;

    const keyValuePairs = processHtmlContent(data.certificateTemplate);

    const defaultTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> @@service Certificate</title>
        <style>
            :root {
                --light-color: #535252;
            }
 
            body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                box-sizing: border-box;
                background: white;
            }
 
            .card-section {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                padding: 20px;
                box-sizing: border-box;
            }
 
            .main-box {
                width: 100%;
                width: 600px;
                height: 1000px;
                border: 2px solid #d3d2d2;
                padding: 20px;
                text-align: center;
                box-sizing: border-box;
                background-color: #f9f9f9;
                position: relative;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
 
            .main-box h2 {
                font-size: 24px;
                font-weight: 500;
                color: var(--light-color);
                margin-bottom: 20px;
            }
 
            .main-box h1 {
                font-size: 40px;
                font-weight: 600;
                color: var(--light-color);
                line-height: 1.2;
                margin: 20px 0;
            }
 
            .content-box {
                padding: 10px 20px;
                margin: 20px 0;
                display: flex;
                justify-content: space-between;
                font-size: 18px;
            }
 
            .content-box h4 {
                font-size: 18px;
                font-weight: 500;
                color: var(--light-color);
            }
 
            .content-box .title {
                width: 40%;
                text-align: start;
            }
 
            .content-box .info {
                width: 60%;
                text-align: start;
            }
 
            .title1 {
                position: relative;
                font-size: 28px;
                margin: 20px 0;
            }
 
            .title1:before {
                position: absolute;
                content: '';
                left: 50%;
                transform: translateX(-50%);
                height: 10px;
                border-top: 2px solid rgb(216, 216, 216);
                border-bottom: 2px solid rgb(216, 216, 216);
                display: block;
                width: 50%;
            }
 
            .title1 span {
                background-color: #fff;
                position: relative;
                padding: 0 15px;
            }
 
            .footer-box {
                position: absolute;
                bottom: 30px;
                width: 100%;
                text-align: center;
                font-size: 14px;
                color: var(--light-color);
            }
        </style>
    </head>
   
    <body>
        <section class="card-section">
            <div class="main-box">
                <img src=${logo} alt="Logo" style="max-width: 120px; margin-bottom: 20px;">
                <h2>${departmentName}</h2>
                <h1><span>${data.serviceName}</span></h1>
    
                ${keyValuePairs
                    .map(
                        (pair) => `
                    <div class="content-box">
                      <div class="title">
                          <h4>${pair.key}</h4>
                      </div>
                      <div class="info">
                          <h4>${pair.value}</h4>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
            </div>
        </section>
    </body>
    </html>
  `;

    let newContent;
    let htmlContent;
    htmlContent = serviceTemplates.find(
        (service) => service.serviceSlug === data.slug
    );

    if (htmlContent) {
        htmlContent = htmlContent.serviceTemplate;
        newContent = htmlContent.replace(/@@department_logo@@/g, logo);
    } else {
        newContent = defaultTemplate;
    }

    return (
        <div>
            <Modal isOpen={show} toggle={handleToggle} size="lg" centered>
                <ModalBody>
                    <div dangerouslySetInnerHTML={{ __html: newContent }} />
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CertificatePreview;
