import React from "react";
import { Modal, ModalHeader } from "reactstrap";
import checkImage from "../../assets/images/error_icon.png";
import { Link, useNavigate } from "react-router-dom";

const InvalidLinkModal = ({
    show,
    setShow,
    toggleShow,
    resendLink,
    isInvalidLink,
    setIsInvalidLink,
}) => {
    const navigate = useNavigate();
    const redirectloginCloseModal = () => {
        navigate("/");
        setShow(false);
        setIsInvalidLink(false);
    };

    return (
        <Modal
            isOpen={show}
            toggle={() => {
                toggleShow();
            }}
            backdrop={"static"}
            id="staticBackdrop"
            centered>
            <ModalHeader className="d-flex justify-content-end align-items-center">
                <button
                    type="button"
                    className="btn-close"
                    onClick={redirectloginCloseModal}
                    aria-label="Close"></button>
            </ModalHeader>
            <div className="modal-content">
                <div className="modal-body text-center p-5">
                    {isInvalidLink ? (
                        <h2 className="mb-4 pb-1 h2 text-black fw-medium-semibold">
                            Invalid Link
                        </h2>
                    ) : (
                        <h2 className="mb-4 pb-1 h2 text-black fw-medium-semibold">
                            Link Expired
                        </h2>
                    )}
                    <div>
                        <img
                            src={checkImage}
                            height="70"
                            width="70"
                            alt="checkmark"
                            className="mt-4 mb-5 mx-auto"
                        />

                        <p className="text-black mb-3">
                            The link you followed has expired or is no longer
                            valid.<br></br>
                            Please request a new link to proceed.
                        </p>
                        {isInvalidLink ? (
                            <div
                                onClick={()=>{
                                    navigate("/reset-password")
                                    setShow(false);
                                    setIsInvalidLink(false);
                                }}
                                className="btn btn-primary w-100"
                                title="Resend the reset link"
                            >
                                Create New Link
                            </div>
                        ) : (
                            <div
                                onClick={resendLink}
                                className="btn btn-primary w-100"
                                title="Request a new reset link"
                            >
                                Request Reset Link
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InvalidLinkModal;
