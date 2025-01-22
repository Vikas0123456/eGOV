import React from "react";
import { Modal } from "reactstrap";
import checkImage from "../../assets/images/error_icon.png";
import { Link } from "react-router-dom";

const UnauthorizedModal = ({ show, toggleShow }) => {
  return (
    <Modal
      isOpen={show}
      toggle={() => {
        toggleShow();
      }}
      backdrop={"static"}
      id="staticBackdrop"
      centered
    >
      <div className="modal-content">
        <div className="modal-body text-center p-5">
          <div>
            <img
              src={checkImage}
              height="70"
              width="70"
              alt="checkmark"
              className="mt-4 mb-5 mx-auto"
            />
            <h5 className="mb-3">
              You have entered invalid reset password url. <br></br>
              Please reset the password again.
            </h5>
            <Link
              to="/"
              className="btn btn-primary w-100"
              title="Return to Sign in"
            >
              Return to Sign in
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UnauthorizedModal;
