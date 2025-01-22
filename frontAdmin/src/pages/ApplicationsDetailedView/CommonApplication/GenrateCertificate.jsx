import React, { useState, useEffect } from "react";
import { Row, Col, Button, Card, Image, Modal, Alert } from "react-bootstrap";
import { Spinner } from "reactstrap";
import useAxios from "../../../utils/hook/useAxios";
import loaderImage from "../../../assets/images/loader-doc.gif"
import previewPdf from "../../../assets/images/preview-65.png"
const pdfVersion = "3.11.174";
const pdfWorkerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.js`;
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';


const GenrateCertificate = ({
    isPdfDownloadLoading,
    applicationDataId,
    userData,
    handleDownloadPDF,
    citizenData,
    setCitizenData,
}) => {
  const axiosInstance = useAxios()
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);
    const [customerEmail, setCustomerEmail] = useState(null);
    const [showIcon, setShowIcon] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: "",
        variant: "info",
    });

    const applicationSlug = citizenData?.serviceData?.slug;
    const serviceName = citizenData?.serviceName;

    const checkFileExistence = async () => {
        if (citizenData?.issuedDocumentId?.documentPath) {
            try {
                const response = await axiosInstance.head(
                    citizenData.issuedDocumentId.documentPath
                );
                if (response.status === 200) return true;
            } catch (error) {
                setCitizenData((prevData) => ({
                    ...prevData,
                    issuedDocumentId: null,
                }));
                setAlert({
                    show: true,
                    message:
                        "The file was removed or corrupted. Generate again.",
                    variant: "danger",
                });
            }
        } else {
            setCitizenData((prevData) => ({
                ...prevData,
                issuedDocumentId: null,
            }));
        }
        return false;
    };

    useEffect(() => {
        checkFileExistence();
    }, [citizenData?.issuedDocumentId?.documentPath]);

    const isDocumentAvailable = () => {
        return citizenData?.issuedDocumentId?.documentPath && !isLoading;
    };
      
    const findApplicationForDocUpdate = async (applicationId, documentInfo) => {
        try {
            const docSlug = citizenData?.serviceData?.slug
            const response = await axiosInstance.post(
                `businessLicense/application/findApplicationForDocUpdate`,
                {
                    applicationId: applicationId,
                    documentSlug: docSlug,
                }
            );
            console.log(JSON.parse(response?.data?.data?.sample.data))
    
            if (response) {
                const { rows } = response?.data?.data || {};
                if (rows && rows.length > 0) {
                    await Promise.all(
                        rows.map(async (data) => {
                          
                            if (docSlug) {
                                try {
                              
                                    const updateResponse = await axiosInstance.put(
                                        `businessLicense/application/update/reqDoc`,
                                        {
                                            documentSlug: docSlug,
                                            applicationId: data?.id,
                                            slug: data?.serviceData?.slug,
                                            uploadedDocumentId:
                                            documentInfo?.id,
                                        }
                                    );
    
                                    if (updateResponse) {
                                    }
                                } catch (error) {
                                    console.error("Update error:", error.message);
                                }
                            }
                        })
                    );
                }
            }
        } catch (error) {
            console.error("Error finding application:", error.message);
        }
    };

    const genrateCertificateManually = async () => {
        try {
            setIsLoading(true);
            const document = await axiosInstance.post(`documentService/view`, {
                documentId: citizenData?.departmentLogo,
                isShowInDocument: "0",
            });

            const documentId = document?.data?.data?.rows[0];

            const response = await axiosInstance.post(
                "businessLicense/application/genrateCertificateManually",
                {
                    applicationId: applicationDataId,
                    userId: userData,
                    slug: applicationSlug,
                    serviceData: {
                        certificateTemplate:
                            citizenData?.certificateTemplate || null,
                        departmentName: citizenData?.departmentName,
                        serviceName: citizenData?.serviceName,
                        pdfGenerator: citizenData?.pdfGenerator || null,
                        issuedDocumentId: null,
                        certificateExpiryTime:
                            citizenData?.certificateExpiryTime,
                        expiryTime: citizenData?.expiryTime || null,
                        agentDetails: citizenData?.applicationAssignedToUser,
                    },
                    fromAdmin: true,
                    departmentData: documentId,
                }
            );            

            if (response.data?.data?.uploadResult?.data[0]) {
                setCitizenData((prevData) => ({
                    ...prevData,
                    issuedDocumentId: response.data.data.uploadResult.data[0],
                }));
                setAlert({
                    show: true,
                    message: "Certificate generated successfully.",
                    variant: "success",
                });
                const documentInfo= response.data.data.uploadResult.data[0]

               await findApplicationForDocUpdate(applicationDataId,documentInfo)
            } else {
                setAlert({
                    show: true,
                    message: "Failed to generate certificate.",
                    variant: "danger",
                });
            }
        } catch (error) {
            console.error("Error: ", error);
            setAlert({
                show: true,
                message: "Failed to generate certificate.",
                variant: "danger",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const sendNotification = async () => {
        try {
            setIsNotificationLoading(true);
            const response = await axiosInstance.post(
                "businessLicense/application/sendNotifications",
                {
                    applicationId: applicationDataId,
                    userId: userData,
                    pdfUrl: citizenData?.issuedDocumentId?.documentPath,
                    slug: applicationSlug,
                    serviceData: {
                        customerEmail:
                            citizenData?.requestedByCustomerInfo?.email,
                        slug: citizenData?.serviceData?.slug,
                        departmentName: citizenData?.departmentName,
                        departmentId: citizenData?.departmentId,
                        serviceName: citizenData?.serviceName,
                        issuedDocumentId: citizenData?.issuedDocumentId || null,
                    },
                }
            );

            setCustomerEmail(response.data.data.customerEmail);
            setShowPopup(true);
            setShowIcon(true);
            setAlert({
                show: true,
                message: "Notification sent successfully!",
                variant: "success",
            });
            setIsNotificationLoading(false);
        } catch (error) {
            setAlert({
                show: true,
                message: "Failed to send notification.",
                variant: "danger",
            });
            setIsNotificationLoading(false);
        }
    };

    const handleSendNotification = async () => {
        if (!(await checkFileExistence())) return;

        await sendNotification();
    };

    const handlePdfPreview = async () => {
        if (!(await checkFileExistence())) return;

        const pdfUrl = citizenData?.issuedDocumentId?.documentPath;

        if (!pdfUrl) {
            setAlert({
                show: true,
                message: "PDF URL is missing.",
                variant: "danger",
            });
            return;
        }

        try {
            const response = await fetch(pdfUrl, { method: 'HEAD' });
            if (!response.ok) throw new Error("PDF file not found");

            window.open(pdfUrl, "_blank");
        } catch (error) {
            setAlert({
                show: true,
                message: "Failed to load the PDF. Generate again.",
                variant: "danger",
            });
        }
    };

    const handleDownload = async () => {
        if (!(await checkFileExistence())) return;

        const pdfUrl = citizenData?.issuedDocumentId?.documentPath;
        try {
            await handleDownloadPDF(pdfUrl, citizenData?.serviceName)
            setAlert({
                show: true,
                message: "Download successful!",
                variant: "success",
            });
        } catch (error) {
            setAlert({
                show: true,
                message: "Failed to download the PDF. Generate again.",
                variant: "danger",
            });
        }
    };

    const EmailSentIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 58 58">
            <g fill="none" fillRule="evenodd">
                <path
                    fill="#f29c1f"
                    d="m54 19.28 2.49 1.97A4.012 4.012 0 0 1 58 24.38V54a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V24.38a4.012 4.012 0 0 1 1.51-3.13L4 19.28z"></path>
                <path
                    fill="#ecf0f1"
                    d="M4 47.74V2a2.006 2.006 0 0 1 2-2h46a2.006 2.006 0 0 1 2 2v44.7z"></path>
                <circle cx="29" cy="18" r="14" fill="#4fba6f"></circle>
                <path
                    fill="#ecf0f1"
                    d="M26 26a1.99 1.99 0 0 1-1.414-.586l-4-4a2 2 0 0 1 2.828-2.828L26 21.171l8.586-8.585a2 2 0 1 1 2.828 2.828l-10 10A1.99 1.99 0 0 1 26 26z"></path>
                <path
                    fill="#f0c419"
                    d="M58 24.91V54a3.944 3.944 0 0 1-1.33 2.97L37.81 42.31z"></path>
                <path
                    fill="#f3d55b"
                    d="M56.67 56.97A3.984 3.984 0 0 1 54 58H4a3.984 3.984 0 0 1-2.67-1.03l18.86-14.66 7.57-5.88a2.012 2.012 0 0 1 2.48 0l7.57 5.88z"></path>
                <path
                    fill="#f0c419"
                    d="M20.19 42.31 1.33 56.97A3.944 3.944 0 0 1 0 54V24.91z"></path>
            </g>
        </svg>
    );

    return (
        <div>
            {alert.show && (
                <Alert
                    variant={alert.variant}
                    onClose={() => setAlert({ ...alert, show: false })}
                    dismissible>
                    {alert.message}
                </Alert>
            )}

            <Card className="border-0 shadow-sm bg-white">
                <div className="card-header align-items-center d-flex border-bottom-dashed">
                    <h5 className="text-dark mb-0">Attachments</h5>
                </div>
                <Card.Body className="mx-3">
                    {isLoading && (
                        <div
                            id="loader-doc"
                            className="loader-main loader-full-page"
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 9999,
                            }}>
                            <div
                                className="loader-payment"
                                style={{ textAlign: "center" }}>
                                <img
                                    src={loaderImage}
                                    style={{ width: "80px", height: "80px" }}
                                    alt="Loading..."
                                />
                                <h3 className="text-primary mt-4">
                                    Document Generating
                                </h3>
                                <p>
                                    Please do not refresh the page or click the
                                    <br /> "Back" or close button of your
                                    browser.
                                </p>
                            </div>
                        </div>
                    )}
                    {!isLoading && (
                        <Row className="align-items-center border rounded border-dashed p-2 gap-2">
                            <Col xs="auto px-0">
                                <div className="avatar-sm">
                                    <div className="avatar-title bg-light text-secondary rounded fs-24">
                                        <i className="ri-file-list-2-line"></i>
                                    </div>
                                </div>
                            </Col>
                            <Col className="ps-1">
                                <p className="mb-0 fw-bold text-dark">
                                    {serviceName}
                                </p>
                            </Col>
                            <Col xs="auto px-0">
                                {isDocumentAvailable() ? (
                                    <div className="d-flex align-items-center">
                                        {/* <Image
                                            src={previewPdf}
                                            alt="PDF Preview"
                                            title="Preview Certificate"
                                            onClick={handlePdfPreview}
                                            style={{
                                                cursor: "pointer",
                                                width: "30px",
                                                height: "30px",
                                                marginRight: "8px",
                                            }}
                                            rounded
                                        /> */}
                                        <div
                                            onClick={handlePdfPreview}
                                            style={{
                                                cursor: "pointer",
                                                width: "50px",
                                                height: "60px",
                                                marginRight: "8px",
                                                overflow: "hidden",
                                                border: "1px solid #007bff",
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <Worker workerUrl={pdfWorkerUrl}>
                                                <Viewer
                                                    fileUrl={citizenData?.issuedDocumentId?.documentPath}
                                                    defaultScale={SpecialZoomLevel.PageFit}
                                                    initialPage={0}
                                                    plugins={[]}
                                                />
                                            </Worker>
                                        </div>

                                        <Button
                                            variant="success"
                                            className="me-2 btn-sm"
                                            disabled={isLoading}
                                            onClick={genrateCertificateManually}
                                        >
                                            Re Generate
                                        </Button>

                                        <Button
                                            disabled={isPdfDownloadLoading}
                                            variant="success"
                                            className="me-2 btn-sm"
                                            onClick={handleDownload}>
                                            {isPdfDownloadLoading
                                                ? ((
                                                      <Spinner
                                                          as="span"
                                                          animation="border"
                                                          size="sm"
                                                          role="status"
                                                          aria-hidden="true"
                                                      />
                                                  ),
                                                  "Downloading")
                                                : "Download"}
                                        </Button>
                                        {isNotificationLoading ? (
                                            <Button
                                                disabled={isNotificationLoading}
                                                variant="success"
                                                className="btn-sm me-2"
                                                onClick={
                                                    handleSendNotification
                                                }>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                Sending
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="success"
                                                className="btn-sm me-2"
                                                onClick={
                                                    handleSendNotification
                                                }>
                                                Send
                                            </Button>
                                        )}

                                        {showIcon && <EmailSentIcon />}
                                    </div>
                                ) : (
                                    <Button
                                        disabled={isLoading}
                                        variant="success"
                                        onClick={genrateCertificateManually}>
                                        Generate
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body className="text-center">
                    <i
                        className="bx bx-check text-warning"
                        style={{ fontSize: "80px" }}
                    />
                    <h4>Application Sent</h4>
                    <p>
                        Your {serviceName} has been sent to the registered email{" "}
                        {customerEmail}.
                    </p>
                    <Button variant="dark" onClick={() => setShowPopup(false)}>
                        OK
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default GenrateCertificate;
