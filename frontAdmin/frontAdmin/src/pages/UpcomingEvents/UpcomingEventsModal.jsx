import React, { useRef } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import { ImCross } from "react-icons/im";
import CKEditorModel from "../../common/CKEditor/CKEditor";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import Flatpickr from "react-flatpickr";

const UpcomingEventsModal = ({
  show,
  handleClose,
  updateId,
  formik,
  selectedFile,
  setSelectedFile,
  handleImageUpload,
  loading,
  handleDateChange,
  viewPermissions,
  createPermission,
  editPermission,
}) => {
  const inputRef = useRef(null);

  const handleCrossButtonClick = (event) => {
    event.stopPropagation();
    formik.setFieldValue("imageData", "");
    setSelectedFile(null);
  };

  const handleUploadContainerClick = () => {
    inputRef.current.click();
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    formik.setFieldValue("description", data);
  };

  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ];

  return (
    <Offcanvas
      show={show}
      placement="end"
      className="container p-0 w-100"
      onHide={handleClose}
    >
      <div className="bg-white p-4">
        <SimpleBar
          className="bg-light vh-100 p-3 p-sm-4"
          style={{
            maxHeight: "calc(100vh - 50px)",
            overflow: "auto",
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header  pb-3">
            {!updateId && createPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Create Upcoming Event
                </h4>
              )}
              {updateId && !editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  View Upcoming Event
                </h4>
              )}
              {updateId && editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Update Upcoming Event
                </h4>
              )}
              <div className="d-flex justify-content-end align-items-center">
                <span onClick={handleClose} className="btn btn-sm btn-primary">
                  {" "}
                  <i className="ri-close-line me-1 align-middle"></i> Cancel{" "}
                </span>
              </div>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div
                  className="upload-container cursor-pointer"
                  onClick={handleUploadContainerClick}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const files = event.dataTransfer.files;
                    if (files.length > 0) {
                      handleImageUpload({ target: { files } });
                    }
                  }}
                >
                  <input
                    ref={inputRef}
                    id="eventImage"
                    name="eventImage"
                    type="file"
                    onChange={(event) => handleImageUpload(event)}
                    style={{ display: "none" }}
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                  />
                  {selectedFile || formik.values?.imageData ? (
                    <div className="file-preview">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : formik.values?.imageData?.documentPath
                        }
                        alt="Uploaded file"
                      />
                      {((!updateId && createPermission) ||
                        (updateId && editPermission)) && (
                        <Button
                          type="button"
                          className="circle-button p-0 d-flex justify-content-center align-items-center btn btn-secondary"
                          onClick={
                            handleCrossButtonClick
                          }
                        >
                          <ImCross />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="upload-circle">
                      <div>
                        <p>Drag & Drop image or</p>
                        <button type="button" className="browse-button">
                          {" "}
                          Browse{" "}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {formik.errors.documentFile && (
                  <div className="text-danger">
                    {formik.errors.documentFile}
                  </div>
                )}
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="eventTitle-field" className="form-label">
                    {" "}
                    Title{" "}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Event Title"
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                    value={formik.values.title}
                    {...formik.getFieldProps("title")}
                  />
                  {formik.errors.title && formik.touched.title && (
                    <div className="text-danger">{formik.errors.title}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <label
                    htmlFor="eventDescription-field"
                    className="form-label"
                  >
                    {" "}
                    Description{" "}
                  </label>
                  <CKEditorModel
                    data={formik?.values?.description}
                    onChange={(event, editorData) =>
                      formik.setFieldValue("description", editorData)
                    }
                    onBlur={(event, editor) => {
                      formik.setFieldTouched("description", true);
                    }}
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                  />
                  {formik.errors.description && formik.touched.description && (
                    <div className="text-danger">
                      {formik.errors.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="eventStatus-field" className="form-label">
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
                      menu: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
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
              <div className="col-lg-12 mb-3">
                <div>
                  <label htmlFor="eventDate-field" className="form-label">
                    Event Date
                  </label>
                  <Flatpickr
                    options={{
                      dateFormat: "d M Y",
                      disableMobile: true,
                      minDate: formik.eventDate,
                    }}
                    key={close}
                    onChange={handleDateChange}
                    placeholder="Select event date"
                    className="form-control"
                    value={formik.eventDate}
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                  />
                  {formik.errors.eventDate && formik.touched.eventDate && (
                    <div className="text-danger">{formik.errors.eventDate}</div>
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
              </div>
            )}
          </form>
        </SimpleBar>
      </div>
    </Offcanvas>
  );
};

export default UpcomingEventsModal;
