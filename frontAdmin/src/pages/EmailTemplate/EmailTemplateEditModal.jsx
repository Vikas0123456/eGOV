import React, { useRef } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import CKEditorModel from "../../common/CKEditor/CKEditor";
import TemplatePreviewModal from "./TemplatePreviewModal";
import { useState } from "react";
import SimpleBar from "simplebar-react";

const EmailTemplateEditModal = ({
  show,
  handleClose,
  updateId,
  formik,
  loading,
  viewPermissions,
  editPermission,
}) => {
  const inputRef = useRef(null);
  const [previewshow, setPreviewShow] = useState(false);
  const previewShowToggle = () => {
    setPreviewShow(!previewshow);
  };
  const handleCrossButtonClick = (event) => {
    event.stopPropagation();
    formik.setFieldValue("imageData", "");
  };

  const handleUploadContainerClick = () => {
    inputRef.current.click();
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    formik.setFieldValue("content", data);
  };

  return (
    <>
      <Offcanvas show={show} placement="end" onHide={handleClose} className="container w-100 p-0" >
        <div className="bg-white p-4">
          <SimpleBar className="p-3 p-sm-4 bg-light vh-100" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'auto' }}>
            <form onSubmit={formik.handleSubmit}>
              <div className="modal-header pb-3">
                {updateId && !editPermission && (
                  <h4 className="modal-title" id="exampleModalgridLabel">
                    View Email Template
                  </h4>
                )}

                {updateId && editPermission && (
                  <h4 className="modal-title" id="exampleModalgridLabel">
                    Update Email Template
                  </h4>
                )}
                {/* <h4 className="modal-title" id="exampleModalgridLabel">
                  Update Email Template
                </h4> */}
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
                    <label htmlFor="eventTitle-field" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Event Title"
                      value={formik.values.title}
                      {...formik.getFieldProps("title")}
                      disabled={
                        (!editPermission) ||
                        (updateId && !editPermission)
                    }
                    />
                    {formik.errors.title && formik.touched.title && (
                      <div className="text-danger">
                        {formik.errors.title}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 mb-3">
                  <div>
                    <label htmlFor="eventTitle-field" className="form-label">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Event Title"
                      value={formik.values.subject}
                      {...formik.getFieldProps("subject")}
                      disabled={
                        (!editPermission) ||
                        (updateId && !editPermission)
                    }
                    />
                    {formik.errors.subject && formik.touched.subject && (
                      <div className="text-danger">
                        {formik.errors.subject}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-12 mb-3">
                  <div>
                    <label
                      htmlFor="eventDescription-field"
                      className="form-label"
                    >
                      Content
                    </label>
                    {/* <input
                      type="text"
                      className="form-control"
                      placeholder="Enter URL eg:http://example.com"
                      value={formik.values.url}
                      {...formik.getFieldProps("url")}
                    /> */}

                    <CKEditorModel
                      data={formik.values.content}
                      onChange={(event, editorData) =>
                        formik.setFieldValue("content", editorData)
                      }
                      onBlur={(event, editor) => {
                        formik.setFieldTouched("content", true);
                      }}
                      disabled={
                        (!editPermission) ||
                        (updateId && !editPermission)
                      }
                    />

                    {formik.errors.content && formik.touched.content && (
                      <div className="text-danger">
                        {formik.errors.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  className=" btn btn-primary mb-3"
                  onClick={() => previewShowToggle()}
                >
                  Preview Email Template
                </Button>
                {(
                (updateId && editPermission)) && (
                <Button
                  className=" btn btn-primary ms-3 mb-3"
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
                    <span className="fs-13"> Update Template</span>
                  )}
                </Button>
                )}
              </div>
          
            </form>
          </SimpleBar>
        </div>
      </Offcanvas>
      <TemplatePreviewModal
        show={previewshow}
        setShow={setPreviewShow}
        handleToggle={previewShowToggle}
        data={formik.values}
      />
    </>
  );
};

export default EmailTemplateEditModal;
