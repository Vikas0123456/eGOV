import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import Select from "react-select";
import { LoaderSpin } from "../../../common/Loader/Loader";

const DocumentsTab = ({
 loading,
  handleGetDocument,
  citizenData,
  assignPermission,
  listOptions,
  selectedReqDoc,
  handleSelectChange,
  reqComment,
  setReqComment,
  isloadingReqDoc,
  handleRequestDocumentLog,
  userData
}) => {
  const checkDocumentFileType = (docs) => {
      if (!Array.isArray(docs)) {
          return docs;
      }

      const isValid = docs.every((item) => typeof item === "string");
      if (!isValid) {
          return "Invalid input: Array must contain only strings";
      }

      const transformedDocs = docs.map((item) => item.split("/")[1]);

      return transformedDocs.join(", ");
  };
  return (
      <div>
          <div className="row">
              <div className="col-12 col-lg-6 col-xl-12 col-xxl-6 order-2 order-xl-2 order-lg-1 order-xxl-1">
                  <div className="card border-0">
                      <div className="card-header">
                          <h5 className="mb-0">Prerequisite:</h5>
                      </div>
                      {
                        loading ? (
                            <div className="d-flex justify-content-center">
                               <LoaderSpin height="200px" />
                            </div>
                         ) : (
                            citizenData?.servicePrerequisiteData && (
                                <div className="card-body cms"
                                    dangerouslySetInnerHTML={{
                                    __html: citizenData?.servicePrerequisiteData,
                                    }}
                                ></div>
                            )
                        )
                      }
                  </div>
                  <div className="card border-0">
                      <div className="card-header">
                          <h5 className="mb-0">Instructions:</h5>
                      </div>
                      {
                        loading ? (
                            <div className="d-flex justify-content-center">
                               <LoaderSpin height="200px" />
                            </div>
                         ) : (
                        citizenData?.
                        serviceInstructionsData && (
                            <div className="card-body cms"
                                dangerouslySetInnerHTML={{
                                __html: citizenData?.
                                serviceInstructionsData,
                                }}
                            ></div>
                        )
                         )
                      }
                  </div>
              </div>
              <div className="col-12 col-lg-6 col-xl-12 col-xxl-6 order-1 order-xl-1 order-lg-2 order-xxl-2">
                  <div className="card border-0">
                      <div className="card-header align-items-center d-flex border-bottom-dashed">
                          <h5 className="mb-0 flex-grow-1">Attachments</h5>
                          <div className="flex-shrink-0 d-none">
                              <button
                                  type="button"
                                  className="btn btn-soft-info btn-sm">
                                  <i className="ri-upload-2-fill me-1 align-bottom"></i>{" "}
                                  Upload
                              </button>
                          </div>
                      </div>
                      <div className="card-body">
                          <div className="vstack gap-2">
                              {
                                  loading ? (
                                      <div className="d-flex justify-content-center">
                                         <LoaderSpin height="400px" />
                                      </div>
                                  ) : (
                              citizenData?.applicationData
                                  ?.requiredDocumentList?.data &&
                                  citizenData?.applicationData?.requiredDocumentList?.data?.map(
                                      (doc, index) => (
                                          <Card
                                              className="upload-box w-100 mb-3 d-flex"
                                              key={index}>
                                              <Row
                                                  className={
                                                      doc?.uploadedDocumentId
                                                          ? "align-items-center ps-2 pb-2 pe-2"
                                                          : "align-items-center ps-2 pe-2"
                                                  }>
                                                  <Col
                                                      xs="12"
                                                      sm="9"
                                                      className="mb-0 mb-sm-0 d-flex align-items-center">
                                                      <div className="me-3 border border-start-0 border-top-0 border-bottom-0 border-end-1 d-flex align-items-center h-100 py-3">
                                                          {doc?.uploadedDocumentId ? (
                                                              <i
                                                                  id="upload-doc-s"
                                                                  className="text-success mdi mdi-checkbox-blank-circle me-3 ms-2"></i>
                                                          ) : (
                                                              <i
                                                                  id="upload-doc-f"
                                                                  className="text-warning mdi mdi-checkbox-blank-circle me-3 ms-2 "></i>
                                                          )}
                                                      </div>
                                                      <div className="mb-1">
                                                          <strong className="f_name fs-14">
                                                              {" "}
                                                              {
                                                                  doc?.documentName
                                                              }{" "}
                                                          </strong>
                                                          <span className="f_type d-flex align-items-center mt-0 fs-12">
                                                              {doc?.isRequired ===
                                                              true ? (
                                                                  <span className="badge text-bg-success me-2 d-inline-block">
                                                                      {" "}
                                                                      Required{" "}
                                                                  </span>
                                                              ) : (
                                                                  <span className="badge text-bg-warning me-2 d-inline-block">
                                                                      {" "}
                                                                      Not
                                                                      Required{" "}
                                                                  </span>
                                                              )}
                                                              File Type:{" "}
                                                              {doc?.documentFileType
                                                                  ? checkDocumentFileType(
                                                                        doc?.documentFileType
                                                                    )
                                                                  : ""}
                                                          </span>
                                                      </div>
                                                  </Col>
                                                  <Col
                                                      xs="12"
                                                      sm="3"
                                                      className="text-end px-1">
                                                      <div className="upload_doc  py-2 pe-2">
                                                          {doc?.uploadedDocumentId ? (
                                                              <span className="badge bg-success p-2 ">
                                                                  {" "}
                                                                  Uploaded{" "}
                                                              </span>
                                                          ) : (
                                                              <span className="badge bg-warning p-2 ">
                                                                  {" "}
                                                                  Pending{" "}
                                                              </span>
                                                          )}
                                                      </div>
                                                  </Col>
                                                  <Col
                                                      xs="12"
                                                      sm="12"
                                                      className="mb-0 px-1 d-flex align-items-center col-sm-12 col-12"
                                                      id="upload-doc">
                                                      <div
                                                          className={`border border-start-0 border-top-1 border-bottom-0 border-end-0 align-items-center justify-content-between d-flex w-100 pt-2 px-3 ${
                                                              doc?.uploadedDocumentId
                                                                  ? ""
                                                                  : "d-none"
                                                          }`}>
                                                          <div className="text-success d-flex align-items-center fw-bold">
                                                              <i className="ri-check-line me-2 fs-21"></i>
                                                              <p className="mb-0 fs-14">
                                                                  {" "}
                                                                  {
                                                                      doc
                                                                          ?.attachedDoc
                                                                          ?.documentName
                                                                  }{" "}
                                                              </p>
                                                          </div>

                                                          <div className="text-success">
                                                              <span
                                                                  title="Download"
                                                                  className="border border-1 rounded-2 p-1 px-2 ms-2 fs-18 d-inline-flex align-items-center cursor-pointer"
                                                                  onClick={() =>
                                                                      handleGetDocument(
                                                                          doc?.uploadedDocumentId,
                                                                          doc?.documentName
                                                                      )
                                                                  }>
                                                                  <i className="ri-download-2-line"></i>
                                                              </span>
                                                              <span
                                                                  title="Delete"
                                                                  className="border border-1 rounded-2 p-1 px-2 ms-2 fs-18 d-inline-flex align-items-center d-none">
                                                                  <i className="ri-delete-bin-line fs-18"></i>
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </Col>
                                              </Row>
                                          </Card>
                                      )
                                    )
                                    )}
                          </div>
                      </div>
                  </div>
                  {citizenData?.status !== "4" &&
                  citizenData?.status !== "6" ? (
                      <div>
                          {citizenData?.applicationAssignedToUser?.id &&
                              (assignPermission ||
                                  citizenData?.applicationAssignedToUser?.id ===
                                      userData?.id) && (
                                  <div className="card border-0">
                                      <div className="card-header">
                                          <h5 className="mb-0">
                                              {" "}
                                              Request for the document{" "}
                                          </h5>
                                      </div>
                                      <form
                                          className="tablelist-form"
                                          autoComplete="off">
                                          <div className="p-3">
                                              <label className="form-label me-3">
                                                  {" "}
                                                  Request Document{" "}
                                              </label>
                                              <Select
                                                  isMulti={true}
                                                  options={listOptions}
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
                                                  placeholder="Select document"
                                                  value={selectedReqDoc}
                                                  onChange={handleSelectChange}
                                              />
                                          </div>
                                          <div className="card-body cms">
                                              <div className="row g-3">
                                                  <div className="col-lg-12 mt-0">
                                                      <label
                                                          htmlFor="addaddress-Name"
                                                          className="form-label">
                                                          {" "}
                                                          Description{" "}
                                                      </label>
                                                      <textarea
                                                          className="form-control"
                                                          id="VertimeassageInput"
                                                          rows="3"
                                                          placeholder="Enter your description"
                                                          value={reqComment}
                                                          onChange={(e) =>
                                                              setReqComment(
                                                                  e.target.value
                                                              )
                                                          }
                                                          style={{
                                                              resize: "vertical",
                                                              overflowY: "auto",
                                                          }}></textarea>
                                                  </div>
                                                  <div className="col-lg-12 mt-3 text-end">
                                                      {isloadingReqDoc ? (
                                                          <button className="btn btn-primary">
                                                              <Spinner
                                                                  as="span"
                                                                  animation="border"
                                                                  size="sm"
                                                                  role="status"
                                                                  aria-hidden="true"
                                                              />
                                                              <span className="visually-hidden">
                                                                  {" "}
                                                                  Loading...{" "}
                                                              </span>
                                                          </button>
                                                      ) : (
                                                          <button
                                                              type="button"
                                                              className="btn btn-primary"
                                                              onClick={
                                                                  handleRequestDocumentLog
                                                              }
                                                              disabled={
                                                                  !reqComment ||
                                                                  !selectedReqDoc
                                                              }>
                                                              Submit
                                                          </button>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      </form>
                                  </div>
                              )}
                      </div>
                  ) : null}
              </div>
          </div>
      </div>
  );
};
export default DocumentsTab;
