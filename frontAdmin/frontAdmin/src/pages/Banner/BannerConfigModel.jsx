import React from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";

const BannerConfigModel = ({ configFormik, show, handleClose, loading }) => {
    return (
        <Offcanvas show={show} placement="end" onHide={handleClose}>
            <div className="bg-white p-4">
                <SimpleBar
                    className="bg-light p-3 p-sm-4 vh-100"
                    style={{
                        maxHeight: "calc(100vh - 50px)",
                        overflow: "auto",
                    }}>
                    <form onSubmit={configFormik.handleSubmit}>
                        <div className="modal-header pb-3">
                            <h5
                                className="modal-title"
                                id="exampleModalgridLabel">
                                Update Banner Settings
                            </h5>
                            <div className="d-flex justify-content-end align-items-center">
                                <span
                                    onClick={handleClose}
                                    className="btn btn-sm btn-primary">
                                    <i className="ri-close-line me-1 align-middle"></i>{" "}
                                    Cancel
                                </span>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label
                                        htmlFor="width-field"
                                        className="form-label">
                                        Banner Image Width
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter Width"
                                        {...configFormik.getFieldProps("width")}
                                    />
                                    {configFormik.errors.width &&
                                        configFormik.touched.width && (
                                            <div className="text-danger">
                                                {configFormik.errors.width}
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label
                                        htmlFor="height-field"
                                        className="form-label">
                                        Banner Image Height
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter Height"
                                        {...configFormik.getFieldProps(
                                            "height"
                                        )}
                                    />
                                    {configFormik.errors.height &&
                                        configFormik.touched.height && (
                                            <div className="text-danger">
                                                {configFormik.errors.height}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="fs-13"
                                        />
                                        <span className="fs-13">
                                            {" "}
                                            Submitting...{" "}
                                        </span>
                                    </>
                                ) : (
                                    <span className="fs-13">Submit</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </SimpleBar>
            </div>
        </Offcanvas>
    );
};

export default BannerConfigModel;
