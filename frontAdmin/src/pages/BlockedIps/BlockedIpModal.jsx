import React from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import Select from "react-select";

const BlockedIpModal = ({ show, handleClose, updateId, formik, loading }) => {
  const blockedOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];
  return (
    <Offcanvas show={show} placement="end" onHide={handleClose} >
      <div className="bg-white p-4">
        <SimpleBar className="p-3 p-sm-4 bg-light vh-100" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'auto' }}>
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header pb-3">
              <h4 className="modal-title" id="exampleModalgridLabel">
                {updateId ? "Update BlockedIP" : "Add BlockedIP"}
              </h4>
              <div className="d-flex justify-content-end align-items-center">
                <span
                  onClick={handleClose}
                  className="btn btn-sm btn-primary"
                >
                  <i className="ri-close-line me-1 align-middle"></i> Cancel
                </span>
              </div>
            </div>
            <div className="modal-body">
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="faqQuestion-field" className="form-label">
                    IP <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter IP"
                    value={formik.values.ipAddress}
                    {...formik.getFieldProps("ipAddress")}
                  />
                  {formik.errors.ipAddress && formik.touched.ipAddress && (
                    <div className="text-danger">
                      {formik.errors.ipAddress}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <label htmlFor="blocked-field" className="form-label">
                    Blocked <span>*</span>
                  </label>
                  <Select
                    options={blockedOptions}
                    value={blockedOptions.find(option => option.value === formik.values.isBlocked)}
                    onChange={option => formik.setFieldValue("isBlocked", option.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                className=" btn btn-primary "
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="fs-13"
                    />
                    <span className="fs-13">Submitting...</span>
                  </>
                ) : (
                  <span className="fs-13"> Submit</span>
                )}
              </Button>
            </div>
          </form>

        </SimpleBar>
      </div>
    </Offcanvas>
  );
};

export default BlockedIpModal;
