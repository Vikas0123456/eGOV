import React, { useEffect, useRef, useState } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import { ImCross } from "react-icons/im";
import Editor from "../../ckeditor-build/build/ckeditor";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import useAxios from "../../utils/hook/useAxios";

const KnowledgeBaseModal = ({
    show,
    handleClose,
    updateId,
    formik,
    selectedFile,
    setSelectedFile,
    handleImageUpload,
    loading
}) => {
    const axiosInstance = useAxios()
    const [selectedDept, setSelectedDept] = useState(0);
    const [departmentList, setDepartmentList] = useState([]);

    const listOfDepartments = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    useEffect(() => {
        listOfDepartments();
    }, []);

    useEffect(() => {
        setSelectedDept(formik.values.departmentId);
    }, [updateId, formik.values.departmentId]);

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

    const handleDepartmentSearch = (event) => {
        setSelectedDept(event.target.value);
        formik.setFieldValue("departmentId", event.target.value);

    };

    return (
        <Offcanvas show={show} placement="end" onHide={handleClose} style={{ width: "auto" }} >
            <div className="modal-dialog modal-lg my-0">
                <div className="modal-content bg-light p-4 shadow-sm vh-100 overflow-auto"  >
                    <div className="bg-white ">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="modal-header px-4 pt-4">
                                <h4 className="modal-title" id="exampleModalgridLabel">
                                    {updateId ? "Update Knowledge Base" : "Add Knowledge Base"}
                                </h4>
                                <div className="d-flex justify-content-end align-items-center">
                                    <span
                                        onClick={handleClose}
                                        className="btn btn-primary"
                                    >
                                        <i className="ri-close-line me-1 align-middle"></i> Cancel
                                    </span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <div>
                                        <label htmlFor="eventTitle-field" className="form-label" >
                                            Department
                                        </label>
                                        <select
                                            className="form-control text-start bg-light"
                                            value={selectedDept}
                                            onChange={handleDepartmentSearch}
                                        >
                                            <option value={0}>All</option>
                                            {departmentList.map((departmentData) => (
                                                <option key={departmentData.id} value={departmentData.id}>
                                                    {departmentData.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <label
                                            htmlFor="eventTitle-field"
                                            className="form-label"
                                        >
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Event Title"
                                            value={formik.values.title}
                                            {...formik.getFieldProps("title")}
                                        />
                                        {formik.errors.title &&
                                            formik.touched.title && (
                                                <div className="text-danger">
                                                    {formik.errors.title}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <label htmlFor="eventDescription-field" className="form-label">
                                            Description
                                        </label>

                                        <CKEditor
                                            editor={Editor}
                                            data={formik.values.description}
                                            onChange={handleEditorChange}
                                            onBlur={(event, editor) => {
                                                formik.setFieldTouched("description", true);
                                            }}
                                        />


                                        {formik.errors.description && formik.touched.description && (
                                            <div className="text-danger">{formik.errors.description}</div>
                                        )}
                                    </div>
                                </div>


                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <label htmlFor="eventStatus-field" className="form-label">
                                            Status
                                        </label>
                                        <select
                                            className="form-control"
                                            value={formik.values.status}
                                            {...formik.getFieldProps("status")}
                                            onChange={(e) =>
                                                formik.setFieldValue("status", e.target.value)
                                            }
                                        >
                                            <option value="">Select Status</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        {formik.errors.status && formik.touched.status && (
                                            <div className="text-danger">{formik.errors.status}</div>
                                        )}
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
                                                c />
                                            <span className="fs-13">Submitting...</span>
                                        </>
                                    ) : (
                                        <span className="fs-13"> Submit</span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Offcanvas>
    );
}

export default KnowledgeBaseModal;