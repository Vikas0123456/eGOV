import React from "react";
import { Button, Label, Offcanvas, Spinner } from "reactstrap";
import Select from "react-select";

const MasterDocumentListModel = ({
    show,
    handleClose,
    updateId,
    formik,
    loading,
}) => {
    const statusOptions = [
        { value: "", label: "Select" },
        { value: "1", label: "Yes" },
        { value: "0", label: "No" },
    ];

    return (
        <Offcanvas isOpen={show} direction="end" toggle={handleClose} style={{ width: "auto" }}>
            <div className="modal-dialog modal-lg my-0">
                <div className="modal-content bg-light p-4 shadow-sm vh-100 overflow-auto">
                    <div className="bg-white p-4">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="modal-header pt-4">
                                <h4 className="modal-title" id="exampleModalgridLabel">
                                    {updateId ? "Update Document" : "Create Document"}
                                </h4>
                                <div className="d-flex justify-content-end align-items-center">
                                    <span onClick={handleClose} className="btn btn-primary">
                                        <i className="ri-close-line me-1 align-middle"></i>{" "} Cancel
                                    </span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <Label htmlFor="documentName-field" className="form-label"> Document Name </Label>
                                        <input type="text" className="form-control" placeholder="Enter Document Name" value={formik.values.documentName} {...formik.getFieldProps("documentName")} />
                                        {formik.errors.documentName &&
                                            formik.touched.documentName && (
                                                <div className="text-danger">
                                                    {formik.errors.documentName}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <Label htmlFor="slug-field" className="form-label"> Slug </Label>
                                        <input type="text" className="form-control" placeholder="Enter Slug" value={formik.values.slug} {...formik.getFieldProps("slug")} />
                                        {formik.errors.slug &&
                                            formik.touched.slug && (
                                                <div className="text-danger">
                                                    {formik.errors.slug}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <Label htmlFor="isRequired-field" className="form-label"> Is Required </Label>
                                        <Select id="isRequired-field" name="isRequired"
                                            options={statusOptions}
                                            value={statusOptions.find((option) => option.value === formik.values.isRequired)}
                                            onChange={(selectedOption) => formik.setFieldValue("isRequired", selectedOption.value)}
                                            styles={{
                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                            }}
                                        />
                                        {formik.errors.isRequired &&
                                            formik.touched.isRequired && (
                                                <div className="text-danger">
                                                    {formik.errors.isRequired}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <Label htmlFor="canApply-field" className="form-label"> Can Apply </Label>
                                        <Select id="canApply-field" name="canApply"
                                            options={statusOptions}
                                            value={statusOptions.find((option) => option.value === formik.values.canApply)}
                                            onChange={(selectedOption) => formik.setFieldValue("canApply", selectedOption.value)}
                                            styles={{
                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                            }}
                                        />
                                        {formik.errors.canApply &&
                                            formik.touched.canApply && (
                                                <div className="text-danger">
                                                    {formik.errors.canApply}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" type="submit" disabled={loading} >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="fs-13" />
                                            <span className="fs-13">
                                                Submitting...
                                            </span>
                                        </>
                                    ) : (
                                        <span className="fs-13">
                                            Submit
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Offcanvas>
    );
};

export default MasterDocumentListModel;
