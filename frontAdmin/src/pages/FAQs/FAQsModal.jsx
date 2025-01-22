import React from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import Select from "react-select";
import SimpleBar from "simplebar-react";

const FAQsModal = ({
  show,
  handleClose,
  updateId,
  formik,
  loading,
  viewPermissions,
  createPermission,
  editPermission,
}) => {
  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ];

  return (
    <Offcanvas show={show} placement="end" onHide={handleClose}>
      <div className="bg-white p-4">
        <SimpleBar
          className="bg-light p-3 p-sm-4 vh-100"
          style={{ maxHeight: "calc(100vh - 50px)", overflow: "auto" }}
        >
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header pb-4">
              {!updateId && createPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Create FAQ
                </h4>
              )}
              {updateId && !editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  View FAQ
                </h4>
              )}
              {updateId && editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Update FAQ
                </h4>
              )}
              <div className="d-flex justify-content-end align-items-center">
                {" "}
                <span onClick={handleClose} className="btn btn-sm btn-primary">
                  {" "}
                  <i className="ri-close-line me-1 align-middle"></i> Cancel{" "}
                </span>{" "}
              </div>
            </div>
            <div className="modal-body">
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="faqQuestion-field" className="form-label">
                    {" "}
                    Question{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter FAQ Question"
                    disabled={
                        (!createPermission && !editPermission) ||
                        (updateId && !editPermission)
                      }
                    value={formik.values.question}
                    {...formik.getFieldProps("question")}
                  />
                  {formik.errors.question && formik.touched.question && (
                    <div className="text-danger">{formik.errors.question}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="faqAnswer-field" className="form-label">
                    {" "}
                    Answer{" "}
                  </label>
                  <textarea
                    type="text"
                    rows="4"
                    cols="50"
                    className="form-control"
                    disabled={
                        (!createPermission && !editPermission) ||
                        (updateId && !editPermission)
                      }
                    placeholder="Enter FAQ Answer"
                    value={formik.values.answer}
                    {...formik.getFieldProps("answer")}
                    style={{ resize: 'vertical', overflowY: 'auto' }}
                  />
                  {formik.errors.answer && formik.touched.answer && (
                    <div className="text-danger">{formik.errors.answer}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="faqStatus-field" className="form-label">
                    {" "}
                    Status{" "}
                  </label>
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={
                        (!createPermission && !editPermission) ||
                        (updateId && !editPermission)
                      }
                    value={
                      statusOptions.find(
                        (option) => option.value === formik.values.status
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      formik.setFieldValue(
                        "status",
                        selectedOption ? selectedOption.value : ""
                      )
                    }
                    options={statusOptions}
                    aria-label="Select Status"
                    placeholder="Select Status"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
                      menu: (provided) => ({ ...provided, cursor: "pointer" }),
                      option: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
                    }}
                  />
                  {formik.errors.status && formik.touched.status && (
                    <div className="text-danger">{formik.errors.status}</div>
                  )}
                </div>
              </div>
            </div>
            {((!updateId && createPermission) ||
              (updateId && editPermission)) && (
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
                    <span className="fs-13"> Submitting... </span>
                  </>
                ) : (
                  <span className="fs-13"> Submit </span>
                )}
              </Button>
            </div>)}
          </form>
        </SimpleBar>
      </div>
    </Offcanvas>
  );
};
export default FAQsModal;
