import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { Button, Input } from "reactstrap";
import html2canvas from "html2canvas";
import { Modal, Spinner } from "react-bootstrap";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import TawkMinChatIconSvg from "../../assets/svg/TawkMinChatIconSvg";
import useAxios from "../../utils/hook/useAxios";

const SystemSupport = () => {
  const axiosInstance = useAxios()

  const navigate = useNavigate();

  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;

  const [supportTypeList, setSupportTypeList] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [captureSelected, setCaptureSelected] = useState(null);
  const [uploadSelected, setUploadSelected] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setloading] = useState(false);
  useEffect(() => {
    fetchSupportTypeList();
  }, []);

  const validationSchema = yup.object().shape({
    name: yup.string().required("Please enter first name"),
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter email"),
    type: yup.string().required("Please select type"),
    description: yup
      .string()
      .min(5, "Description should be 5 char long")
      .required("Please enter description"),
    uploadAttechment: Yup.mixed().nullable(),
  });

  const fetchSupportTypeList = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/systemSupport/supportType/view`
      );

      if (response?.data) {
        const { rows } = response?.data?.data;
        setSupportTypeList(rows);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: userData?.name,
      email: userData?.email,
      type: "",
      description: "",
      uploadAttechment: null,
      link: window.location.href,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      addNewSystemSupport(values);
      // setloading(true)
      // handleSupport();
    },
  });

  const addNewSystemSupport = async (values) => {
    setloading(true);
    try {
      let ids = null;
      if (uploadSelected) {
        const formData = new FormData();
        formData.append("viewDocumentName", "System Support");
        formData.append("isGenerated", "0");
        formData.append("isShowInDocument", "0");
        uploadedFiles.forEach((file, index) => {
          formData.append(`documentFile`, file);
        });
        const fileResponse = await axiosInstance.post(
          "documentService/uploading",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const uploadedImage = fileResponse.data.data;
        ids = uploadedImage.map((file) => file.id).join(", ");
      }

      const response = await axiosInstance.post(
        `userService/systemSupport/create`,
        {
          name: formik.values.name,
          type: formik.values.type,
          description: formik.values.description,
          attachment: ids,
          link: formik.values.link,
          email: formik.values.email,
        }
      );

      if (response) {
        setloading(false);
        toast.success("System support data saved successfully.");
        handleToggleSupport();
      }
    } catch (error) {
      setloading(true);
      console.error("Something went wrong while add new banner");
    }
  };

  const handleToggleSupport = () => {
    setIsChatOpen((prevState) => !prevState);
    formik.resetForm();
  };

  const takeScreenshot = () => {
    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }

    html2canvas(document.body, {
      // Use the window's dimensions to capture the visible part
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      useCORS: true, // Enable this if you're capturing content from other domains
    }).then((canvas) => {
      // Convert canvas to image and download
      const imgData = canvas.toDataURL("image/png");

      const fileName = `capture_attechment.png`;
      let data = [...uploadedFiles];
      var file = dataURLtoFile(imgData, fileName);
      if (file) {
        data.push(file);
        setCaptureSelected(imgData);
        setUploadedFiles(data);
        formik.setFieldValue("captureAttechment", file);
      }
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedFormats = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      const maxSize = 1024 * 1024; // 1MB in bytes
      if (selectedFile.size > maxSize) {
        event.target.value = null;
        formik.setFieldError(
          "uploadAttechment",
          "Please select an image file that is less than 1MB."
        );
        return; // Exit the function if size exceeds the limit
      }

      let dataPush = [...uploadedFiles];

      if (allowedFormats.includes(selectedFile.type)) {
        formik.setFieldValue("uploadAttechment", selectedFile);
        dataPush.push(selectedFile);
        setUploadedFiles(dataPush);
        setUploadSelected(selectedFile);
        // formik.setFieldError("uploadAttechment", "");
      } else {
        event.target.value = null;
        formik.setFieldError(
          "uploadAttechment",
          "Please select a valid image file (JPEG, JPG, or PNG)."
        );
      }
    }
  };

  const supportOptions = supportTypeList && [
    { value: "", label: "Select Support Type" },
    ...supportTypeList.map((supportType) => ({
      value: supportType.id,
      label: supportType.type,
    })),
  ];

  return (
    <>
      {isChatOpen && (
        <div
          className="modal fade chat-box chatbox-admin show"
          id="myModal"
          tabIndex={-1}
          aria-labelledby="myModalLabel"
          data-bs-backdrop="static"
          style={{
            display: "block",
            paddingLeft: 0,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog p-0">
            <div className="modal-content border-0 support-modal">
              <div className="modal-header bg-primary text-center flex-column">
                <div className="">
                  <h4 className="text-white" id="myModalLabel">
                    Welcome to Egov Support Systems
                  </h4>
                  <p className="pt-4 mb-0 text-white">
                    Search our Knowledge Base or start a chat. We're here to
                    help you 24 x 7
                  </p>
                </div>
                <div className="" style={{ display: "none" }}>
                  <h4 className="text-white" id="myModalLabel">
                    Welcome to Egov Support Systems
                  </h4>
                  <p className="pt-4 mb-0 text-white">
                    Search our Knowledge Base or start a chat. We're here to
                    help you 24 x 7
                  </p>
                </div>
              </div>
              <SimpleBar
                className="chat-bar"
                style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto" }}
              >
                <form onSubmit={formik.handleSubmit}>
                  <div className="modal-body p-3">
                    <div id="chat-form">
                      <div className="p-0">
                        <div
                          className="search-box"
                          style={{
                            marginTop: "-40px",
                            marginBottom: 20,
                          }}
                        >
                          <input
                            type="text"
                            className="form-control bg-light border-light"
                            placeholder="Search here..."
                            // onkeyup="searchMessages()"
                            // value={searchQuery}
                            // onChange={(e) =>
                            //     handleInputSearch(e)
                            // }
                            // onKeyDown={(e) => {
                            //     if (e.key === "Enter")
                            //         searchKnowladgeBase();
                            // }}
                            id="searchMessage"
                            style={{ height: 50 }}
                          />
                          <i className="ri-search-2-line search-icon" />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label htmlFor="nameInput" className="form-label">
                              Name
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter your name"
                              {...formik.getFieldProps("name")}
                            />
                            {formik.touched.name && formik.errors.name && (
                              <div className="text-danger text-start">
                                {formik.errors.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                              Description
                            </label>
                            <Input
                              type="textarea"
                              placeholder="Enter description"
                              {...formik.getFieldProps("description")}
                            />
                            {formik.touched.description &&
                              formik.errors.description && (
                                <div className="text-danger text-start">
                                  {formik.errors.description}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label">
                              Email Address
                            </label>
                            <Input
                              type="text"
                              {...formik.getFieldProps("email")}
                              disabled={true}
                            />
                            {formik.touched.email && formik.errors.email && (
                              <div className="text-danger text-start">
                                {formik.errors.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <label htmlFor="type" className="form-label">
                              Select Support Type
                            </label>
                            <Select
                              id="depart"
                              name="type"
                              menuPlacement="top"
                              options={supportOptions}
                              onChange={(selectedOption) => {
                                formik.setFieldValue(
                                  "type",
                                  selectedOption ? selectedOption.value : ""
                                );
                              }}
                              value={
                                supportOptions
                                  ? supportOptions.find(
                                      (option) =>
                                        option.value === formik.values.type
                                    )
                                  : ""
                              }
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
                            {formik.touched.type && formik.errors.type && (
                              <div className="text-danger text-start">
                                {formik.errors.type}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="">
                            <label
                              className="form-label"
                              onClick={takeScreenshot}
                              style={{ cursor: "pointer" }}
                            >
                              Capture
                            </label>
                            {formik.values.captureAttechment && (
                              <img
                                src={captureSelected}
                                alt="Preview"
                                height="100px"
                                width="100px"
                                style={{
                                  display: "block",
                                  marginBottom: "10px",
                                }}
                              />
                            )}
                            {formik.touched.captureAttechment &&
                              formik.errors.captureAttechment && (
                                <div className="text-danger text-start">
                                  {formik.errors.captureAttechment}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <input
                              type="file"
                              accept="image/*"
                              id="attachment"
                              className="mb-0 form-control"
                              name="attachment"
                              onChange={handleFileChange}
                              onBlur={formik.handleBlur}
                              style={{ display: "block", marginBottom: "10px" }}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                              }}
                            >
                              {formik.values.uploadAttechment && (
                                <img
                                  src={URL.createObjectURL(uploadSelected)}
                                  alt="Preview"
                                  className="mb-0"
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                    marginBottom: "10px",
                                  }}
                                />
                              )}
                              {formik.touched.uploadAttechment &&
                                formik.errors.uploadAttechment && (
                                  <div className="text-danger text-start">
                                    {formik.errors.uploadAttechment}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="mb-3">
                            <label htmlFor="nameInput" className="form-label">
                              Link
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter link"
                              {...formik.getFieldProps("link")}
                            />
                            {formik.touched.link && formik.errors.link && (
                              <div className="text-danger text-start">
                                {formik.errors.link}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="hstack gap-2 justify-content-between d-flex w-100">
                      <Button
                        className="btn btn-danger"
                        onClick={handleToggleSupport}
                      >
                        Close
                      </Button>
                      {loading ? (
                        <Button
                          className="btn btn-primary btn-chat-form"
                          type="submit"
                          disabled
                        >
                          <div>
                            <Spinner animation="border" size="sm" />{" "}
                            <span>Submitting...</span>
                          </div>
                        </Button>
                      ) : (
                        <Button
                          className="btn btn-primary btn-chat-form"
                          type="submit"
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </SimpleBar>
            </div>
          </div>
        </div>
      )}
      <div
        className="position-fixed "
        style={{ bottom: 15, right: 15, zIndex: 1 }}
        onClick={() => handleToggleSupport()}
      >
        <span title="System Support">
          <div className="avatar-sm cursor-pointer">
            <div className="avatar-title rounded-circle bg-primary text-success">
              <TawkMinChatIconSvg />
            </div>
          </div>
        </span>
      </div>
    </>
  );
};

export default SystemSupport;
