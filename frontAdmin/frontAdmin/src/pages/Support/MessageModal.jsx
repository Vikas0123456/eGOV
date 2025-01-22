import React from "react";
import { Modal } from "react-bootstrap";
import SimpleBar from "simplebar-react";

const MessageModal = ({
    messageShow,
    handleToggle,
    selectedMessage
}) => {
    return (
        <Modal
            aria-labelledby="contained-modal-title-vcenter"
            show={messageShow}
            onHide={handleToggle}
            size="lg"
            centered
        >
            <Modal.Body className="modal-body">
                <div className="card mb-0">
                    <div className="card-header badge-soft-success">
                        <div className="d-flex">
                            <div className="flex-grow-1">
                                <h5 className="card-title mb-0">
                                    Message
                                </h5>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleToggle}
                            ></button>
                        </div>
                    </div>
                    <SimpleBar style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}>
                    <div className="card-body">
                        <p>{selectedMessage || "No description available"}</p>
                    </div>
                    </SimpleBar>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default MessageModal;
