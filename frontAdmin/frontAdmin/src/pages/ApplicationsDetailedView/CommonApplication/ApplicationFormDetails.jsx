import { Card, CardBody, Col, Row, Table, Container } from "reactstrap";
import React, { useMemo } from "react";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import { LoaderSpin } from "../../../common/Loader/Loader";

const cleanHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};

function getHeaderFontSize(subtype) {
    switch (subtype) {
        case "h1":
            return "1.5rem";
        case "h2":
            return "1.25rem";
        case "h3":
            return "1.125rem";
        case "h4":
            return "1rem";
        case "h5":
            return "1rem";
        case "h6":
            return "1rem";
        default:
            return "1rem";
    }
}

const RenderRow = ({ items }) => (
    <Row>
        {items.map((item, index) => (
            <Col md={4} key={index}>
                <div className="mb-3">
                    <label className="mb-0 fs-14 fw-bold text-black">
                        {item.label}:
                    </label>
                    <div className="w-100 mb-2 text-black fs-14">
                        {item.value}
                    </div>
                </div>
            </Col>
        ))}
    </Row>
);

const getMonthName = (date) => {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return months[date.getMonth()];
};

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const formattedDate = `${("0" + date.getDate()).slice(-2)} ${getMonthName(
        date
    )}, ${date.getFullYear()}`;

    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Check if time is not midnight
    if (hours !== 0 || minutes !== 0) {
        const formattedTime = `${("0" + hours).slice(-2)}:${(
            "0" + minutes
        ).slice(-2)} ${hours >= 12 ? "PM" : "AM"}`;
        return (
            <div>
                <span className="five">{formattedDate}</span>
                <small className="d-block fs-11">{formattedTime}</small>
            </div>
        );
    } else {
        // If time is midnight, only show the date
        return <span className="five">{formattedDate}</span>;
    }
};

const ApplicationFormDetails = ({
    loading,
    payNow,
    isPdfDownloadLoading,
    citizenData,
    handleDownloadPDF,
    dropdownLists,
    getStateName,
    getCountryName,
    docList,
    formatDateString,
    formatFileSize,
}) => {
    const processedData = useMemo(() => {
        let newFormData = citizenData?.applicationData?.formData;

        if (!newFormData || !Array.isArray(newFormData)) return [];

        const result = [];
        let currentRow = [];

        newFormData.forEach((item) => {
            // Skip objects like {"policyCheck": true}
            if (item?.policyCheck) {
                return;
            }

            if (item?.description == "selectProfile" || cleanHTML(item?.label) == "Select Profile *") {
                return;
            }

            // Check for special header fields with subtype (h1, h2, h3, etc.)
            if (item.type === "header" && item.subtype) {
                // If there are items in the currentRow, push them to result
                if (currentRow.length > 0) {
                    result.push({ type: "row", items: currentRow });
                    currentRow = [];
                }
                // Add the header-like item separately
                result.push({
                    type: item.type,
                    subtype: item.subtype,
                    label: cleanHTML(item.label),
                });
            } else {
                const label = cleanHTML(item.label || ""); // Empty string if label is missing
                let value =
                    item.value ||
                    (item.values &&
                        item.values.find((v) => v.selected)?.label) ||
                    "N/A";

                // Handle country and state
                if (label.toLowerCase().includes("country") || (item.description && item.description.includes("country") && !item.description.includes("state")) && !isNaN(value)) {
                    value = getCountryName(value);
                } else if (
                    label.toLowerCase().includes("state") &&
                    !isNaN(value)
                ) {
                    value = getStateName(value);
                } else if (item.type === "date" && value !== "N/A") {
                    // Format date fields
                    value = formatDate(value);
                }

                // If no label and a valid value, treat it like a special field
                if (!label && value !== "N/A") {
                    if (currentRow.length > 0) {
                        result.push({ type: "row", items: currentRow });
                        currentRow = [];
                    }
                    result.push({ type: "special", value }); // Display the value alone, like a special field
                } else {
                    // Add the field with label and value to the current row
                    currentRow.push({ label, value });
                }

                // Push rows of 3 items
                if (currentRow.length === 3) {
                    result.push({ type: "row", items: currentRow });
                    currentRow = [];
                }
            }
        });

        // Push any remaining row
        if (currentRow.length > 0) {
            result.push({ type: "row", items: currentRow });
        }

        return result;
    }, [citizenData]);

    const checkDocumentFileType = (docs) => {
        if (!Array.isArray(docs)) {
            return docs;
        }

        const isValid = docs.every((item) => typeof item === "string");
        if (!isValid) {
            return "Invalid input: Array must contain only strings";
        }

        const transformedDocs = docs.map((item) => item.split("/")[1]);

        return transformedDocs.join(", ");
    };

    const card = citizenData?.paymentToken && decrypt({ data: citizenData?.paymentToken })

    return (
        <div className="tab-content text-muted mt-3 mt-lg-0 home-list-tabs">
            <Card className="mb-0 border-0">
                <CardBody>
                    <Row className="mb-3 mb-xl-5">
                        <Col xs={12} className="mb-4 border-bottom pb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="text-black fs-20 fw-bold mb-0">
                                    KYC Information
                                </h5>
                                {(citizenData?.status === "4" ||
                                    citizenData?.status === "5") &&
                                    citizenData?.issuedDocumentId && (
                                        <button
                                            disabled={isPdfDownloadLoading}
                                            className="d-flex align-items-center btn btn-md btn-outline-primary"
                                            onClick={() =>
                                                handleDownloadPDF(
                                                    citizenData
                                                        ?.issuedDocumentId
                                                        ?.documentPath,
                                                    citizenData.serviceName
                                                )
                                            }>
                                            <i
                                                className="bx bxs-file-pdf"
                                                style={{
                                                    fontSize: "20px",
                                                    marginRight: "5px",
                                                }}></i>
                                            <small> Download</small>
                                        </button>
                                    )}
                            </div>
                        </Col>
                        {/* <Col md={4}>
                            <div className="mb-3">
                                <div>
                                    <label className="mb-0 fs-14 fw-bold text-black">
                                        Application For:
                                    </label>
                                    <div className="w-100 mb-2 fs-14  text-black">
                                        {citizenData?.serviceName}
                                    </div>
                                </div>
                            </div>
                        </Col> */}

                        {loading ? (
                            <div className="d-flex justify-content-center">
                                <LoaderSpin height="300px" />
                            </div>
                         ) : Array.isArray(processedData) &&
                            processedData.length === 0 ? (
                            <Row>
                                <Col>
                                    <span className="text-gray">
                                        No data available
                                    </span>
                                </Col>
                            </Row>
                        ) : (Array.isArray(processedData) &&
                            processedData.map((item, index) => (
                                <React.Fragment key={index}>
                                    {item.type === "header" ? (
                                        <Row>
                                            <Col>
                                                {React.createElement(
                                                    item.subtype,
                                                    {
                                                        className:
                                                            "mb-4 mt-2 text-gray fw-bold",
                                                        style: {
                                                            fontSize:
                                                                getHeaderFontSize(
                                                                    item.subtype
                                                                ),
                                                        },
                                                    },
                                                    item.label
                                                )}
                                            </Col>
                                        </Row>
                                    ) : item.type === "special" ? (
                                        <Row>
                                            <Col>
                                                <p className="mb-2 fs-16 text-gray">
                                                    {item.value}
                                                </p>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <RenderRow items={item.items} />
                                    )}
                                </React.Fragment>
                            ))
                        )
                        }

                    </Row>
                    <Row className="mb-3 mb-xl-5">
                        <Col xs={12}>
                            <h5 className="text-black fs-20 fw-bold mb-4 border-bottom pb-3">
                                Uploaded Documents
                            </h5>
                        </Col>
                        <Col xs={12}>
                            <div className="table-responsive">
                                <Table className="table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>File Type</th>
                                            <th>Status</th>
                                            {/* <th></th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                        { loading ? (
                            <div className="d-flex justify-content-center">
                               <LoaderSpin height="100px" />
                            </div>
                         ) : (
                             citizenData?.applicationData
                                 ?.requiredDocumentList?.data &&
                                 citizenData?.applicationData?.requiredDocumentList?.data?.map(
                                     (doc, index) => (
                                         <tr key={index}>
                                             <td>
                                                 {doc?.documentName}
                                             </td>
                                             <td>
                                                 {checkDocumentFileType(
                                                     doc?.documentFileType
                                                 )}
                                             </td>
                                             {doc?.uploadedDocumentId ? (
                                                 <td>
                                                     <span className="badge text-bg-success">
                                                         Uploaded
                                                     </span>
                                                 </td>
                                             ) : (
                                                 <td>
                                                     <span className="badge text-bg-warning">
                                                         Not Uploaded
                                                     </span>
                                                 </td>
                                             )}
                                             {/* <td></td> */}
                                         </tr>
                                     )
                                 
                                 )
                         )
                                        
                         }
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                    { 
                    citizenData?.paymentToken && citizenData?.transactionStatus !== "1" &&
                        <>
                            <div className="row">
                                <div className="col-12 col-sm-6 col-md-3 mb-4">
                                    <div className="card border-0 p-0 rounded shadow mb-0 h-100">
                                        <div className="card-body p-0">
                                        <div
                                                className={`credit-card ${card?.brand} selectable w-100 mw-100 m-0 p-4`}
                                            >
                                                <div className="credit-card-last4 mb-5 pb-4">
                                                {card?.last4}
                                                </div>
                                                <div className="credit-card-expiry credit-card-name">
                                                {card?.name}
                                                </div>
                                                <div className="credit-card-expiry">
                                                {card?.exp_month}/{card?.exp_year}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="m-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="flexRadioDefault"
                                                    id="flexRadioDefault1"
                                                    checked
                                                />
                                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                                    Selected Card
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-4 ms-auto">
                                    <div className="card">
                                        <div className="card-header">
                                            <div className="d-flex">
                                                <div className="flex-grow-1">
                                                    <h5 className="card-title mb-0">Payment Summary</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive table-card">
                                                <table className="table table-borderless align-middle mb-0">
                                                    <tbody>
                                                        <tr>
                                                            <td>{citizenData?.serviceName}:</td>
                                                            <td className="text-end">
                                                                <span id="cydsid">${citizenData?.serviceData?.price}.00</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="table-active">
                                                            <th>Total Payable Amount:</th>
                                                            <td className="text-end">
                                                                <span className="fw-semibold fs-14" id="totusd" style={{ display: 'none' }}>${citizenData?.serviceData?.price}.00</span>
                                                                <span className="fw-semibold fs-14" id="totcyd">${citizenData?.serviceData?.price}.00</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-start">
                                        <button onClick={payNow} className="btn btn-primary btn-pay-load" title="Pay Now">
                                            Pay Now
                                        </button>
                                        <div className="alert alert-success p-sys-msg" role="alert" style={{ display: 'none' }}>
                                            <strong>Payment has been received successfully!</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>

                    }
                </CardBody>
            </Card>
        </div>
    );
};

export default ApplicationFormDetails;
