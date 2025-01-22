import React, { useState, useRef, useCallback } from "react";
import { Button, Offcanvas, Spinner } from "react-bootstrap";
import { ImCross } from "react-icons/im";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import Cropper from "react-easy-crop";

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
        }, "image/jpeg");
    });
};

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
    });

const BannerModal = ({
    bannerConfigData,
    show,
    handleClose,
    updateId,
    formik,
    selectedFile,
    setSelectedFile,
    handleImageUpload,
    loading,
    isCropping,
    setIsCropping,
    croppedImageUrl,
    setCroppedImageUrl,
    handleAllPermissionsChange,
    viewPermissions,
    createPermission,
    editPermission,
}) => {
    const inputRef = useRef(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const aspect = parseInt(bannerConfigData?.width?.settingValue) / parseInt(bannerConfigData?.height?.settingValue);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropImage = useCallback(async () => {
        if (!croppedAreaPixels) return; 
        try {
            const croppedImage = await getCroppedImg(
                URL.createObjectURL(selectedFile),
                croppedAreaPixels
            );
            setCroppedImageUrl(croppedImage);
            formik.setFieldValue("documentFile", croppedImage);
            setIsCropping(false);
        } catch (e) {
            console.error(e);
        }
    }, [croppedAreaPixels, selectedFile, formik, setIsCropping]);

    const handleCrossButtonClick = (event) => {
        event.stopPropagation();
        formik.setFieldValue("imageData", "");
        setSelectedFile(null);
        setCroppedImageUrl(null);
        setIsCropping(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleUploadContainerClick = () => {
        if (!selectedFile && !croppedImageUrl && !formik.values.imageData) {
            inputRef.current.click();
        }
    };

    const handleReCrop = () => {
        setIsCropping(true);
        setCroppedImageUrl(null);
    };

    const statusOptions = [
        { value: "", label: "Select Status" },
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];

    const renderImage = () => {
        if (selectedFile && isCropping) {
            return (
                <div style={{ width: "100%", height: "100%" }}>
                    <Cropper
                        image={URL.createObjectURL(selectedFile)}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
            );
        } else if (croppedImageUrl || formik.values.imageData) {
            const imageSource =
                croppedImageUrl ||
                (formik.values.imageData.documentPath
                    ? formik.values.imageData.documentPath
                    : formik.values.imageData);
            return (
                <img
                    src={imageSource}
                    alt="Cropped"
                    style={{
                        maxWidth: "100%",
                        height: "100%",
                        objectFit: "contain",
                    }}
                />
            );
        } else {
            return (
                <div>
                    <button type="button" className="browse-button">
                        Browse
                    </button>
                </div>
            );
        }
    };

    return (
        <Offcanvas show={show} placement="end" onHide={handleClose}>
            <div className="bg-white p-4">
                <SimpleBar
                    className="bg-light p-3 p-sm-4 vh-100"
                    style={{
                        maxHeight: "calc(100vh - 50px)",
                        overflow: "auto",
                    }}>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-header pb-3">
                            {!updateId && createPermission && (
                                <h4 className="modal-title" id="exampleModalgridLabel">
                                    Create Banner
                                </h4>
                            )}

                            {updateId && !editPermission && (
                                <h4 className="modal-title" id="exampleModalgridLabel">
                                    View Banner
                                </h4>
                            )}

                            {updateId && editPermission && (
                                <h4 className="modal-title" id="exampleModalgridLabel">
                                    Update Banner
                                </h4>
                            )}
                            {/* <h4
                                className="modal-title"
                                id="exampleModalgridLabel">
                                {updateId ? "Update Banner" : "Add Banner"}
                            </h4> */}
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
                            <div className="mb-3">
                                <div
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        border: "1px dashed #ccc",
                                        borderRadius: "7px",
                                        display: "flex",
                                        backgroundColor: "#e6e4e4",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        position: "relative",
                                    }}
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
                                        id="departmentImage"
                                        name="departmentImage"
                                        type="file"
                                        onChange={(e) => {
                                            handleImageUpload(e);
                                            setIsCropping(true);
                                        }}
                                        style={{ display: "none" }}
                                        disabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                        }
                                    />
                                    {renderImage()}

                                    {(selectedFile || croppedImageUrl || formik.values.imageData) &&
                                        ((createPermission && !updateId) || (editPermission && updateId)) && (
                                            <button
                                                type="button"
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "10px",
                                                    zIndex: 100,
                                                    background: "white",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    padding: "5px",
                                                }}
                                                onClick={handleCrossButtonClick}
                                            >
                                                <ImCross size="15px" color="black" />
                                            </button>
                                        )}
                                </div>
                                <p className="text-secondary mt-2">
                                    Note: Recommended resolution is {bannerConfigData?.width?.settingValue} × {bannerConfigData?.height?.settingValue}
                                </p>
                                {formik.errors.documentFile && (
                                    <div className="text-danger">{formik.errors.documentFile}</div>
                                )}
                            </div>

                            {selectedFile && isCropping && (
                                <div className="mb-3">
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => {
                                            setZoom(parseFloat(e.target.value));
                                        }}
                                        className="zoom-range"
                                    />
                                    <Button
                                        onClick={handleCropImage}
                                        className="mt-2">
                                        Crop Image
                                    </Button>
                                </div>
                            )}
                            {(croppedImageUrl) &&
                                !isCropping && (
                                    <div className="mb-3">
                                        <Button
                                            onClick={handleReCrop}
                                            className="mt-2">
                                            Re-crop Image
                                        </Button>
                                    </div>
                                )}
                            {/* Rest of the form fields */}
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label
                                        htmlFor="bannerTitle-field"
                                        className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Banner Title"
                                        {...formik.getFieldProps("title")}
                                        disabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                        }
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
                                    <label
                                        htmlFor="bannerUrl-field"
                                        className="form-label">
                                        URL
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter URL eg:http://example.com"
                                        {...formik.getFieldProps("url")}
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
                                    <label
                                        htmlFor="bannerStatus-field"
                                        className="form-label">
                                        Status
                                    </label>
                                    <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        value={
                                            statusOptions.find(
                                                (option) =>
                                                    option.value ===
                                                    formik.values.status
                                            ) || null
                                        }
                                        onChange={(selectedOption) =>
                                            formik.setFieldValue(
                                                "status",
                                                selectedOption
                                                    ? selectedOption.value
                                                    : ""
                                            )
                                        }
                                        options={statusOptions}
                                        aria-label="Select Status"
                                        placeholder="Select Status"
                                        isDisabled={
                                            (!createPermission && !editPermission) ||
                                            (updateId && !editPermission)
                                        }
                                    />
                                    {formik.errors.status &&
                                        formik.touched.status && (
                                            <div className="text-danger">
                                                {formik.errors.status}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {((!updateId && createPermission) ||
                            (updateId && editPermission)) && (
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

export default BannerModal;
