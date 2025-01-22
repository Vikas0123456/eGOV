import React from "react";
import { Button, Modal } from "react-bootstrap";
import Logo from "../../assets/images/logo-dark-d.png";
import SimpleBar from "simplebar-react";

const EmailTemplatePreviewModal = ({ show, setShow, handleToggle, data }) => {
  return (
    <Modal
      aria-labelledby="contained-modal-title-center"
      show={show}
      onHide={handleToggle}
      size="lg"
      centered
    >
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
              <div dangerouslySetInnerHTML={{ __html: data }} />
            </div>
          </div>
        </div>
      </SimpleBar>
    </Modal>
  );
};

export default EmailTemplatePreviewModal;
