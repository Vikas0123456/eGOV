import React, { useEffect } from "react";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import SimpleBar from "simplebar-react";

const SettingModal = ({ loading, togBackdrop, modalBackdrop, setModalBackdrop, handleClose, formik, selectedSettingId }) => {
    useEffect(() => {
        if (modalBackdrop && selectedSettingId) {
            // console.log('Setting id in modal:', selectedSettingId);
            formik.setFieldValue('id', selectedSettingId);
        }
    }, [modalBackdrop, selectedSettingId]);

    return (
        <Modal
            isOpen={modalBackdrop}
            toggle={togBackdrop}
            backdrop="static"
            size="lg"
            centered>
            <ModalHeader className="setting-popup">
                Edit Setting
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleClose}></button>
            </ModalHeader>
            <SimpleBar
                style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto" }}>
                <ModalBody className="p-4">
                    <form onSubmit={formik.handleSubmit}>
                        <Input
                            type="hidden"
                            id="id"
                            name="id"
                            value={formik.values.id || ""}
                            onChange={formik.handleChange}
                        />
                        {/* <FormGroup>
                            <Label for="settingKey">Setting Key</Label>
                            <Input
                                type="text"
                                id="settingKey"
                                name="settingKey"
                                value={formik.values.settingKey}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                
                            />
                        </FormGroup> */}
                        <FormGroup>
                            <Label for="settingValue">Setting Value</Label>
                            <Input
                                type="text"
                                id="settingValue"
                                name="settingValue"
                                value={formik.values.settingValue}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.settingValue &&
                            formik.errors.settingValue ? (
                                <div className="text-danger text-start">
                                    {formik.errors.settingValue}
                                </div>
                            ) : null}
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input
                                type="text"
                                id="description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.description &&
                            formik.errors.description ? (
                                <div className="text-danger text-start">
                                    {formik.errors.description}
                                </div>
                            ) : null}
                        </FormGroup>
                        <div className="text-center">
                            {loading ? (
                                <Button
                                    disabled={loading}
                                    color="primary"
                                    type="submit">
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Saving...
                                </Button>
                            ) : (
                                <Button
                                    color="primary"
                                    type="submit">
                                    Save
                                </Button>
                            )}
                            <Button
                                disabled={loading}
                                color="secondary"
                                onClick={handleClose}
                                className="ms-2">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </SimpleBar>
        </Modal>
    );
};

export default SettingModal;