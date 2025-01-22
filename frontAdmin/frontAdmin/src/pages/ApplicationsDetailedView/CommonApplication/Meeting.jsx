import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Alert } from "react-bootstrap";
import axiosInstance from "../../../utils/axiosInterceptor/axiosInstance";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../../utils/hook/useAxios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoaderSpin } from "../../../common/Loader/Loader";

const Meeting = ({
    mainApplicationLoading,
    citizenData,
    showValidation,
    setShowValidation,
    ApplicationId,
    userData,
    applicationSlug,
    applicationList,
    getLogList,
}) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate()
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [isLoadingDescriptionMessage, setIsLoadingDescriptionMessage] =
        useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [meetingLink, setMeetingLink] = useState();
    const [actionTaken, setActionTaken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showNoteValidtion, setShowNoteValidtion] = useState(false);
    const parsedData = applicationList?.bookingDetails ? JSON.parse(applicationList?.bookingDetails) : {};
    // console.log("applicationList",applicationList);
    // console.log("parsedData",parsedData);
    const handleAccept = () => {
        handleSubmitBooking();
        setActionTaken("accept");
    };

    const handleReject = async () => {
        try {

            const response = await axiosInstance.post("businessLicense/application/cancelBookingApi", {
                applicationId: applicationList?.id,
                departmentId: applicationList?.departmentId,
                slug: applicationSlug
            });
            const cancelBooking = await axios.post(
                "https://booknmeet-reapptionist.netcluesdemo.com/api/v2/close-meeting",
                {
                    visitorId: parsedData?.visitorId,
                    checksum: parsedData?.checksum
                },
            );

            cancelBooking && response;
            // console.log(response,"response");
        } catch (error) {
            console.log("error", error);
        }
        setActionTaken("reject");
    };

    const handleNotetextareaChange = (e) => {
        setNote(e.target.value);
        if (e.target.value) {
            setShowNoteValidtion(false);
        }
    };

    const handleTextareaChange = (e) => {
        setDescription(e.target.value);
        if (e.target.value) {
            setShowValidation(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const data = {
                id: citizenData,
            };
            const response = await axiosInstance.post(
                `userService/user/view`,
                data
            );

            if (response) {
                setMeetingLink(response?.data?.data?.rows[0]?.meetingLink);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    useEffect(() => {
        if (citizenData) {
            fetchUserProfile();
        }
    }, [citizenData]);

    const handleSubmitRequest = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `businessLicense/application/bookAppoitmentRequest`,
                {
                    applicationId: ApplicationId,
                    userId: userData,
                    slug: applicationSlug,
                    departmentId: applicationList?.departmentId,
                    description: "Meeting request sent please book appointment."
                }
            );
            if (response) {
                toast.success("Meeting link has been sent to citizen");
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };
    const handleSubmitCommentLog = async () => {
        if (!note) {
            setShowNoteValidtion(true);
            return;
        }
        setShowNoteValidtion(false);
        setIsLoadingMessage(true);
        try {
            const response = await axiosInstance.post(
                `businessLicense/application/log/create`,
                {
                    applicationId: ApplicationId,
                    customerId: applicationList?.customerId,
                    userId: JSON.parse(userData),
                    description: note,
                    logBy: "0",
                    oldStatus: applicationList?.status,
                    newStatus: applicationList?.status,
                    slug: applicationSlug,
                }
            );
            if (response?.data?.data) {
                getLogList();
                setNote("");
                setShowPopup(false);
                toast.success("Note added successfully");
            }
        } catch (error) {
            console.error(error.message);
            toast.error(error.message);
        } finally {
            setIsLoadingMessage(false);
        }
    };

    const handleSubmitDescription = async () => {
        if (!description) {
            setShowValidation(true);
            return;
        }

        setShowValidation(false);
        setIsLoadingDescriptionMessage(true);
        try {
            const response = await axiosInstance.post(
                `businessLicense/application/log/create`,
                {
                    applicationId: ApplicationId,
                    customerId: applicationList?.customerId,
                    userId: JSON.parse(userData),
                    description: description,
                    logBy: "0",
                    oldStatus: applicationList?.status,
                    newStatus: applicationList?.status,
                    slug: applicationSlug,
                }
            );
            if (response?.data?.data) {
                toast.success("Description added successfully");
                getLogList();
                setDescription("");
            }
        } catch (error) {
            console.error(error.message);
            toast.error(error.message);
        } finally {
            setIsLoadingDescriptionMessage(false);
        }
    };

    const handleSubmitBooking = async () => {
        try {
            const response = await axiosInstance.post(
                `businessLicense/application/getBookingConfirmation`,
                {
                    applicationId: ApplicationId,
                    departmentId: applicationList?.departmentId,
                    slug: applicationSlug,
                }
            );
            response;
        } catch (error) {
            console.error("Error in handleSubmitBooking:", error);
        }
    };
    const bookingDetails = applicationList?.bookingDetails ? JSON.parse(applicationList?.bookingDetails) : {};
    return (
        <div>
            <div className="row">
                {/* Ownership Information Section */}
                <div className="col-xs-12 col-lg-6 col-xl-12 col-xxl-6 order-2 order-xl-2 order-lg-1 order-xxl-1">
                    <div className="card border-0">
                        <div className="card-header">
                            <h5 className="mb-0">Application Information :</h5>
                        </div>
                        <div className="card-body cms">
                            {
                                mainApplicationLoading ? (
                                    <div className="d-flex justify-content-center">
                                        <LoaderSpin height="100px" />
                                    </div>
                                ) : (
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div>
                                                <strong>Owner's Full Name :</strong>
                                            </div>
                                            <div>
                                                {
                                                    applicationList
                                                        ?.requestedByCustomerInfo
                                                        ?.firstName
                                                }{" "}
                                                {
                                                    applicationList
                                                        ?.requestedByCustomerInfo
                                                        ?.lastName
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div>
                                                <strong>Owner's Address :</strong>
                                            </div>
                                            <div>
                                                {
                                                    applicationList
                                                        ?.requestedByCustomerInfo
                                                        ?.address
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div>
                                                <strong>Telephone Number :</strong>
                                            </div>
                                            <div>
                                                {
                                                    applicationList
                                                        ?.requestedByCustomerInfo
                                                        ?.mobileNumber
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div>
                                                <strong>Email Address :</strong>
                                            </div>
                                            <div>
                                                {
                                                    applicationList
                                                        ?.requestedByCustomerInfo?.email
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="card border-0">
                        <div className="card-header">
                            <h5 className="mb-0">Instructions :</h5>
                        </div>
                        {/* <div className="card-body cms"> */}
                        {
                            mainApplicationLoading ? (
                                <div className="d-flex justify-content-center">
                                    <LoaderSpin height="100px" />
                                </div>
                            ) : (
                            applicationList?.meetingInstructionData && (
                                <div className="card-body cms"
                                    dangerouslySetInnerHTML={{
                                        __html: applicationList?.meetingInstructionData,
                                    }}
                                ></div>
                            )
                            )
                        }
                    </div>
                </div>

                {/* Appointment Section */}
                <div className="col-xs-12 col-lg-6 col-xl-12 col-xxl-6 order-1 order-xl-1 order-lg-2 order-xxl-2">
                    {/* Appointment Section */}
                    <div className="card border-0">
                        {
                            mainApplicationLoading ? (
                                <div className="d-flex justify-content-center">
                                    <LoaderSpin height="200px" />
                                </div>
                            ) : (
                                <div>
                                <div className="card-header align-items-center d-flex justify-content-between border-bottom-dashed">
                                    <h5 className="mb-0">Appointment</h5>
                                    <div>
                                        {meetingLink ? (
                                            <Button
                                                disabled={loading}
                                                className="primary"
                                                onClick={handleSubmitRequest}
                                            >
                                                {loading ? (
                                                    <Spinner
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    ""
                                                )}{" "}
                                                Send Appointment Request
                                            </Button>
                                        ) : (
                                            <p style={{ color: "red", margin: 0 }} className="btn" onClick={() => navigate("/my-profile")}>
                                                Please add the Meeting Link
                                            </p>
                                        )}
                                    </div>
                                </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <Table className="table table-striped table-borderless mb-0">
                                                <thead>
                                                    <tr>
                                                        <th className="fw-bold text-start" style={{ width: "20%" }} >
                                                            Name Email Id
                                                        </th>
                                                        <th className="fw-bold text-start" style={{ width: "20%" }} >
                                                            Date Time
                                                        </th>
                                                        <th className="fw-bold text-center" style={{ width: "60%" }} >
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {applicationList?.bookingDetails || applicationList?.isBooking === "1" ? (
                                                        <tr style={{ backgroundColor: "#f4f9fc", }} >
                                                            <td className="text-start" style={{ verticalAlign: "middle", padding: "1rem", }} >
                                                                <b>
                                                                    {
                                                                        applicationList
                                                                            ?.requestedByCustomerInfo
                                                                            ?.firstName
                                                                    }{" "}
                                                                    {
                                                                        applicationList
                                                                            ?.requestedByCustomerInfo
                                                                            ?.lastName
                                                                    }
                                                                </b>
                                                                <br />
                                                                {
                                                                    applicationList
                                                                        ?.requestedByCustomerInfo
                                                                        ?.email
                                                                }
                                                            </td>
                                                            <td className="text-start" style={{ verticalAlign: "middle", padding: "1rem", }} >
                                                                { bookingDetails?.bookingDetails }
                                                            </td>
                                                            <td className="text-end" style={{ verticalAlign: "middle", padding: "1rem", }} >
                                                                {actionTaken == null &&
                                                                    applicationList?.isBooking == "1" && applicationList?.bookingDetails && (
                                                                        <>
                                                                            <Button
                                                                                variant="success"
                                                                                className="me-1"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        "#17c671",
                                                                                    borderColor:
                                                                                        "#17c671",
                                                                                }}
                                                                                onClick={
                                                                                    handleAccept
                                                                                }
                                                                            >
                                                                                Accept
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                className="me-1"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        "#f4516c",
                                                                                    borderColor:
                                                                                        "#f4516c",
                                                                                }}
                                                                                onClick={
                                                                                    handleReject
                                                                                }
                                                                            >
                                                                                Reject
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                {actionTaken === "accept" &&
                                                                    applicationList?.isBooking === "1" && (
                                                                        <Button
                                                                            variant="success"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#17c671",
                                                                                borderColor:
                                                                                    "#17c671",
                                                                                width: "100%",
                                                                            }}
                                                                        >
                                                                            Accepted
                                                                        </Button>
                                                                    )}

                                                                {actionTaken === "reject" &&
                                                                    applicationList?.bookingDetails && (
                                                                        <Button
                                                                            variant="danger"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#f4516c",
                                                                                borderColor:
                                                                                    "#f4516c",
                                                                                width: "100%",
                                                                            }}
                                                                        >
                                                                            Rejected
                                                                        </Button>
                                                                    )}

                                                                {(applicationList?.bookingDetails || applicationList?.isBooking === "1") && (
                                                                    <Button
                                                                        variant="primary"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "#495057",
                                                                            borderColor:
                                                                                "#495057",
                                                                            marginLeft: "1rem",
                                                                        }}
                                                                        onClick={() =>
                                                                            setShowPopup(true)
                                                                        }
                                                                    >
                                                                        Note
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan="3"
                                                                className="text-center"
                                                                style={{ padding: "1rem" }}
                                                            >
                                                                No records found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    <Modal
                                        show={showPopup}
                                        onHide={() => {
                                            setShowPopup(false);
                                            setShowNoteValidtion(false);
                                        }}
                                        centered
                                        size="lg"
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title>Note</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body
                                            style={{
                                                backgroundColor: "#fff",
                                                padding: "20px",
                                                textAlign: "left",
                                            }}
                                        >
                                            <label
                                                htmlFor="description"
                                                style={{
                                                    display: "block",
                                                    marginBottom: "10px",
                                                    fontWeight: "500",
                                                    fontSize: "16px",
                                                }}
                                            >
                                                Description
                                            </label>

                                            <textarea
                                                className="form-control"
                                                id="description"
                                                rows="3"
                                                placeholder="Enter your description"
                                                value={note}
                                                onChange={handleNotetextareaChange}
                                                style={{
                                                    width: "100%",
                                                    padding: "10px",
                                                    fontSize: "14px",
                                                    borderRadius: "4px",
                                                    border: "1px solid #ced4da",
                                                    marginBottom: "20px",
                                                }}
                                            ></textarea>

                                            {showNoteValidtion && (
                                                <div style={{ color: "red", margin: 0 }}>
                                                    Please enter a note
                                                </div>
                                            )}

                                            <div style={{ textAlign: "right" }}>
                                                {" "}
                                                <Button
                                                    variant="dark"
                                                    onClick={handleSubmitCommentLog}
                                                    style={{
                                                        backgroundColor: "#343a40",
                                                        color: "#ffffff",
                                                        padding: "8px 20px",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {isLoadingMessage
                                                        ? "Loading..."
                                                        : "Submit"}
                                                </Button>
                                            </div>
                                        </Modal.Body>
                                    </Modal>
                                </div>
                            )
                        }
                        
                    </div>

                    {/* Meeting Notes Section */}
                        <div className="card border-0 mt-4">
                            <div className="card-header align-items-center d-flex border-bottom-dashed">
                                <h5 className="mb-0">
                                    Meeting Notes and Additional Remarks
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-lg-12">
                                        <label
                                            htmlFor="description"
                                            className="form-label"
                                        >
                                            Description
                                        </label>
                                        <textarea
                                            className="form-control my-0"
                                            id="description"
                                            rows="3"
                                            placeholder="Enter your description"
                                            value={description}
                                            onChange={handleTextareaChange}
                                            style={{ resize: 'vertical', overflowY: 'auto' }}
                                        ></textarea>
                                    </div>

                                    {showValidation && (
                                        <div
                                            style={{ color: "red", margin: 0 }}
                                        >
                                            Please enter description
                                        </div>
                                    )}
                                    <div className="col-lg-12 mt-3 text-end">
                                        <Button
                                            variant="primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#upstatus"
                                            onClick={handleSubmitDescription}
                                        >
                                            {isLoadingDescriptionMessage
                                                ? "Loading..."
                                                : "Submit"}
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default Meeting;
