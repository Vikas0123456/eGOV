import React, { useRef } from "react";
import { Button, Label, Offcanvas, Spinner } from "reactstrap";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import SimpleBar from "simplebar-react";

const DepartmentModal = ({
    show,
    handleClose,
    updateId,
    formik,
    selectedFile,
    setSelectedFile,
    handleImageUpload,
    loading,
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

    const statusOptions = [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    return (
        <Offcanvas isOpen={show} direction="end" toggle={handleClose} >
            <div className="bg-white p-4">
                <SimpleBar className="p-3 p-sm-4 bg-light vh-100" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'auto' }}>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-header pb-3">
                        {!updateId && createPermission && (
                            <h4 className="modal-title" id="exampleModalgridLabel">
                            Create Department
                            </h4>
                        )}
                        {updateId && !editPermission && (
                            <h4 className="modal-title" id="exampleModalgridLabel">
                            View Department
                            </h4>
                        )}
                        {updateId && editPermission && (
                            <h4 className="modal-title" id="exampleModalgridLabel">
                            Update Department
                            </h4>
                        )}
                            <div className="d-flex justify-content-end align-items-center">
                                <span onClick={handleClose} className="btn btn-sm btn-primary"> <i className="ri-close-line me-1 align-middle"></i>{" "} Cancel </span>
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
                                    <input ref={inputRef} id="departmentImage" name="departmentImage" type="file" onChange={(event) => handleImageUpload(event)} className="d-none"
                                        disabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                        }
                                    />
                                    {selectedFile || formik.values?.imageData ? (
                                        <div className="file-preview">
                                            <img src={selectedFile ? URL.createObjectURL(selectedFile) : formik.values?.imageData?.documentPath} alt="Uploaded file" />
                                            {((!updateId && createPermission) ||
                                                (updateId && editPermission)) && (
                                                    <Button type="button" className="circle-button p-0 d-flex justify-content-center align-items-center btn btn-secondary"
                                                        onClick={handleCrossButtonClick}>
                                                        <ImCross />
                                                    </Button>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="upload-circle">
                                            <div>
                                                <p> Drag & Drop image or </p>
                                                <button type="button" className="browse-button"> Browse </button>
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
                                    <Label htmlFor="departmentName-field" className="form-label"> Department Name </Label>
                                    <input type="text" className="form-control" placeholder="Enter Department Name"
                                        value={formik.values.departmentName}
                                        {...formik.getFieldProps(
                                            "departmentName"
                                        )}
                                        disabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                          }
                                    />
                                    {formik.errors.departmentName &&
                                        formik.touched.departmentName && (
                                            <div className="text-danger"> {formik.errors.departmentName} </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="shortDescription-field" className="form-label"> Short Description </Label>
                                    <input type="text" className="form-control" placeholder="Enter Short Description"
                                        value={formik.values.shortDescription}
                                        {...formik.getFieldProps("shortDescription")}
                                        disabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                          }
                                    />
                                    {formik.errors.shortDescription &&
                                        formik.touched.shortDescription && (
                                            <div className="text-danger">
                                                {formik.errors.shortDescription}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="email-field" className="form-label"> Email </Label>
                                    <input type="text" className="form-control" placeholder="Enter Email" value={formik.values.email} {...formik.getFieldProps("email")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                     />
                                    {formik.errors.email &&
                                        formik.touched.email && (
                                            <div className="text-danger">
                                                {formik.errors.email}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="url-field" className="form-label"> URL </Label>
                                    <input type="text" className="form-control" placeholder="Enter URL eg:http://example.com" value={formik.values.url} {...formik.getFieldProps("url")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                     />
                                    {formik.errors.url &&
                                        formik.touched.url && (
                                            <div className="text-danger">
                                                {formik.errors.url}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="contactNumber-field" className="form-label"> Contact Number </Label>
                                    <input type="text" className="form-control" placeholder="Enter Contact No." value={formik.values.contactNumber} {...formik.getFieldProps("contactNumber")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                    />
                                    {formik.errors.contactNumber &&
                                        formik.touched.contactNumber && (
                                            <div className="text-danger">
                                                {formik.errors.contactNumber}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="contactNumberExt-field" className="form-label"> Contact Number Extension </Label>
                                    <input type="text" className="form-control" placeholder="Enter Contact No. Ext" value={formik.values.contactNumberExt} {...formik.getFieldProps("contactNumberExt")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                    />
                                    {formik.errors.contactNumberExt &&
                                        formik.touched.contactNumberExt && (
                                            <div className="text-danger">
                                                {formik.errors.contactNumberExt}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="locationTitle-field" className="form-label"> Location Title </Label>
                                    <input type="text" className="form-control" placeholder="Enter Location Title" value={formik.values.locationTitle} {...formik.getFieldProps("locationTitle")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                    />
                                    {formik.errors.locationTitle &&
                                        formik.touched.locationTitle && (
                                            <div className="text-danger">
                                                {formik.errors.locationTitle}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="location-field" className="form-label"> Location </Label>
                                    <input type="text" className="form-control" placeholder="Enter Location" value={formik.values.location} {...formik.getFieldProps("location")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                    />
                                    {formik.errors.location &&
                                        formik.touched.location && (
                                            <div className="text-danger">
                                                {formik.errors.location}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <Label htmlFor="keyword-field" className="form-label"> Keyword </Label>
                                    <input type="text" className="form-control" placeholder="Enter Keyword" value={formik.values.keyword} {...formik.getFieldProps("keyword")}
                                    disabled={
                                        (!createPermission && !editPermission) ||
                                        (updateId && !editPermission)
                                      }
                                    />
                                </div>
                            </div>
                            {updateId && (
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <Label htmlFor="tasksTitle-field" className="form-label"> Status </Label>
                                        <Select value={statusOptions.find((option) => option.value === formik.values.status) || null}
                                            onChange={(option) => formik.setFieldValue("status", option ? option.value : "")}
                                            options={statusOptions}
                                            placeholder="Select Status"
                                            name="status"
                                            styles={{
                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                            }}
                                            isDisabled={
                                                (!createPermission && !editPermission) ||
                                                (updateId && !editPermission)
                                              }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {((!updateId && createPermission) ||
                          (updateId && editPermission)) && (

                        <div className="modal-footer">
                            <Button className=" btn btn-primary " type="submit" color="primary" disabled={loading}> {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="fs-13" />
                                    <span className="fs-13"> Submitting... </span>
                                </>
                            ) : (
                                <span className="fs-13"> {" "} Submit </span>
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

export default DepartmentModal;
