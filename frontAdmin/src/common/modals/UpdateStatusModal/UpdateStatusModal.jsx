import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import SimpleBar from "simplebar-react";

const UpdateStatusModal = ({
    formik,
    showUpdateModal,
    handleToggleUpdateShow,
    handleClose,
    isUpdating,
    applicationData,
}) => {
    const parseWorkflowData = applicationData?.workflowData
        ? JSON.parse(applicationData?.workflowData)
        : null;

    const options = [
            { value: "2", label: "Inprogress" },
            { value: "3", label: "Check & Verified" },
            { value: "4", label: "Auto Pay" },           
        ...(parseWorkflowData &&
            parseWorkflowData?.workflow.length <= applicationData?.workflowIndex + 1
            ? [{ value: "5", label: "Approved" }]
            : []),
        ...(parseWorkflowData === null &&
            applicationData?.workflowIndex === null
            ? [{ value: "5", label: "Approved" }]
            : []),
            { value: "6", label: "Reject" },
            { value: "7", label: "Shipped" },
    ];

    const selectedOption =
        options.find(
            (option) =>
                option.value ===
                (formik.values.status || applicationData?.status)
        ) || null;
    return (
        <>
            <Modal
                aria-labelledby="contained-modal-title-vcenter"
                show={showUpdateModal}
                onHide={handleToggleUpdateShow}
                centered>
                <div className="modal-header">
                    <h5 className="modal-title"> Update Status</h5>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={handleClose}></button>
                </div>
                <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}>
                    <div className="modal-body">
                        <form onSubmit={formik?.handleSubmit}>
                            <div>
                                <div className="mb-3">
                                    <label htmlFor="status" className="form-label"> Status </label>
                                    <Select
                                        value={selectedOption}
                                        onChange={(selectedOption) => formik.setFieldValue("status", selectedOption.value)}
                                        options={options}
                                        styles={{
                                            control: (provided) => ({ ...provided, cursor: "pointer", }),
                                            menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                            option: (provided) => ({ ...provided, cursor: "pointer", }),
                                        }}
                                    />
                                    {formik?.touched?.status &&
                                        formik?.errors?.status ? (
                                        <div className="text-danger">
                                            {formik?.errors?.status}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="file-upload mb-3">
                                    <label htmlFor="file" className="form-label"> Upload Image / Document </label>
                                    <input id="file" type="file" name="file" className="form-control" onChange={(event) => formik?.setFieldValue("file", event.currentTarget.files[0])} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label"> Description </label>
                                    <textarea id="description" className="form-control" rows="3" {...formik?.getFieldProps("description")} style={{ resize: 'vertical', overflowY: 'auto' }}></textarea>
                                    {formik?.touched?.description &&
                                        formik?.errors?.description ? (
                                        <div className="text-danger">
                                            {formik?.errors?.description}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="modal-footer justify-content-between px-0">
                                <button type="button" className="btn w-sm btn-primary" onClick={handleClose}> Close </button>
                                {isUpdating ? (
                                    <Button disabled={isUpdating} variant="btn w-sm btn-primary">
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span className="visually-hidden"> Loading... </span>{" "} Submiting...
                                    </Button>
                                ) : (
                                    <button type="submit" className="btn w-sm btn-primary"> Submit </button>
                                )}
                            </div>
                        </form>
                    </div>
                </SimpleBar>
            </Modal>
        </>
    );
};

export default UpdateStatusModal;
