import React from "react";
import { Button, Modal } from "react-bootstrap";
const BlankData = process.env.REACT_APP_BLANK;
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import NotFound from "../../../common/NotFound/NotFound";

const TransactionStatusModal = ({
    show,
    setShow,
    handleToggle,
    transactionDetails,
    isModalLoading 
}) => {
    function getMonthName(date) {
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
    }
    function formatDate(dateString) {
        // Parse the input date string
        const date = new Date(dateString);

        // Format the date in the desired format (08 Mar, 2024)
        const formattedDate = `${("0" + date.getDate()).slice(
            -2
        )} ${getMonthName(date)}, ${date.getFullYear()}`;

       // Get the hours and minutes
       let hours = date.getHours();
       let minutes = date.getMinutes();

       // AM or PM
       const ampm = hours >= 12 ? 'PM' : 'AM';

       // Convert hours to 12-hour format
       hours = hours % 12;
       hours = hours ? hours : 12; // the hour '0' should be '12'

       // Add leading zero to minutes if needed
       minutes = minutes < 10 ? '0' + minutes : minutes;

       const formattedTime = `${hours}:${minutes} ${ampm}`

        return (
            <div>
                <div className="four">{formattedDate}</div>
                <br />
                <small className="text-muted">{formattedTime}</small>
            </div>
        );
    }
    return (
        <Modal
            aria-labelledby="contained-modal-title-vcenter"
            show={show}
            onHide={handleToggle}
            centered>
            <Modal.Body className="modal-body">
                <div className="card mb-0">
                    <div className="card-header badge-soft-success">
                        <div className="d-flex">
                            <div className="flex-grow-1">
                                <h5 className="card-title mb-0">
                                    <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                                    Payment Details
                                </h5>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleToggle}></button>
                        </div>
                    </div>
                    {isModalLoading ? (
                  <LoaderSpin />
                ) : !transactionDetails?.transaction ? (
                    <NotFound
                    heading="Payment details not found."
                    message="Unfortunately, payment details not available at the moment."
                />
                ) : (
                    <div className="card-body">
                        <div className="table-responsive table-card">
                            <table className="table table-borderless align-middle mb-0">
                                <tbody>
                                    <tr>
                                        <td
                                            className="text-muted fs-13"
                                            colSpan="2">
                                            Payment Mode :
                                        </td>
                                        <td className="fw-semibold text-end">
                                            Credit Card ( VISA )
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="2"
                                            className="text-muted fs-13">
                                            Transaction Number :
                                        </td>
                                        <td className="fw-semibold text-end">
                                            {
                                                transactionDetails?.transaction
                                                    ?.transactionId || BlankData
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="2"
                                            className="text-muted fs-13">
                                            Citizen Receipt Number :{" "}
                                        </td>
                                        <td className="fw-semibold text-end">
                                            {
                                                transactionDetails?.transaction
                                                    ?.transactionReceipt || BlankData
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="2"
                                            className="text-muted fs-13">
                                            Transaction Date Time :{" "}
                                        </td>
                                        <td className="fw-semibold text-end">
                                            {transactionDetails?.transaction
                                                ?.createdDate ? transactionDetails?.transaction
                                                ?.createdDate &&
                                                formatDate(
                                                    transactionDetails
                                                        ?.transaction
                                                        ?.createdDate
                                                )
                                                : BlankData
                                              }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan="2"
                                            className="text-muted fs-13">
                                            Transaction Status :{" "}
                                        </td>
                                        <td className="fw-semibold text-end">
                                            {transactionDetails?.transaction
                                                ?.transactionStatus === "1" ? (
                                                <>
                                                    <span className="badge badge-soft-success fs-12 border border-1 border-success cursor-pointer">
                                                        {" "}
                                                        Txn: Success{" "}
                                                    </span>
                                                </>
                                            ) : (
                                                BlankData
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="table-active">
                                        <th colSpan="2">Total :</th>
                                        <td className="text-end">
                                            <div className="fw-semibold">
                                                $
                                                {
                                                    transactionDetails
                                                        ?.transaction
                                                        ?.transactionAmount
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default TransactionStatusModal;
