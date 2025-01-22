import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Eye } from "feather-icons-react/build/IconComponents";
import {
  CardHeader, Spinner, Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
  CardFooter
} from "reactstrap";
import axios from "axios";
import useAxios from "../../../utils/hook/useAxios";

const formatFileSize = (sizeInBytes) => {
  return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
};

function formatDateString(isoDateString) {
  if (isoDateString) {
    const isoString = String(isoDateString);
    const date = new Date(isoString);

    const optionsDate = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    const optionsTime = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-GB", optionsDate);
    const formattedTime = date.toLocaleTimeString("en-GB", optionsTime);
    const hasTime = isoString.includes(":");

    return hasTime ? `${formattedDate}` : formattedDate;
  } else {
    return "-";
  }
}

function formatFileType(fileType) {
  if (!fileType) {
    return
  }
  return fileType?.split("/")?.[1]
}

const DocumentItem = ({
  index,
  documentItem,
  editableIndex,
  setEditableIndex,
  fetchDocumentsList,
}) => {
  const axiosInstance = useAxios();
  const [loading, setLoading] = useState(false);
  const documentFileExtension = documentItem?.documentPath?.substring(
    documentItem?.documentPath?.lastIndexOf(".") + 1
  );

  const openDocumentPreview = () => {
    const imagePath = documentItem?.documentPath; // Replace with the actual image path
    window.open(imagePath, '_blank'); // Opens in a new blank tab
  };

  const formik = useFormik({
    initialValues: {
      documentName: documentItem.viewDocumentName || "",
    },
    validationSchema: Yup.object({
      documentName: Yup.string().required("Pls enter document name"),
    }),
    onSubmit: async (values) => {
      if (documentItem.id) {
        updateDocument(documentItem.id, values);
      }
    },
  });

  useEffect(() => {
    formik.setValues({ documentName: documentItem.viewDocumentName });
  }, [documentItem.viewDocumentName]);

  const updateDocument = async (id, values) => {
    try {
      setLoading(true);
      if (id) {
        const response = await axiosInstance.put(
          `documentService/document/nameUpdate`,
          {
            id: id,
            ...values,
          }
        );
        if (response) {
          toast.success("Your document name updated successfully.");
          fetchDocumentsList();
          setEditableIndex(null);
          formik.resetForm();
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("No changes were made.");
      console.error(error.message);
    }
  };

  const handleDownload = (url, filename) => {
    const fileExtension = url.substring(url.lastIndexOf(".") + 1);
    const downloadedFileName = `${filename ? filename : "file"
      }.${fileExtension}`;

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", downloadedFileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error downloading file:", error));
  };

  const allowedFormats = ["jpeg", "png", "jpg", "webp", "pdf"];

  return (
    <Card className="">
      <CardHeader className="p-0">
        
        <div className="d-flex justify-content-between px-3 py-2 align-items-center  rounded-top ">
          <h5 className="mb-0">
            {documentItem?.viewDocumentName}
          </h5>
        </div>
      </CardHeader>
      <CardBody className="border-0 d-card p-3">

        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <div className="avatar-sm">
              <div className="avatar-title avatar-title rounded-2 bg-warning-subtle  fs-24">
                <i className=" ri-file-list-line text-dark" />
              </div>
            </div>
          </div>
          <div className="flex-grow-1 overflow-hidden">
            {editableIndex === index ? (
              <form onSubmit={formik.handleSubmit}>
                <div className="d-flex">
                  <input
                    type="text"
                    name="documentName"
                    className="form-control"
                    value={formik.values.documentName}
                    onChange={formik.handleChange}
                  />

                  <button type="submit" className="btn btn-primary ms-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="fs-13"
                        />
                        <span className="fs-13"> Saving... </span>
                      </>
                    ) : (
                      <span className="fs-13"> Save </span>
                    )}
                  </button>
                </div>
                {formik.touched.documentName && formik.errors.documentName && (
                  <div
                    className="text-danger text-start"
                  >
                    {formik.errors.documentName}
                  </div>
                )}
              </form>
            ) : (


              <div>
                <div className="text-muted" > <span > File Size:</span>  {formatFileSize(documentItem?.fileSize)}</div>

                <div className="text-muted" > <span >File Type: </span>  {formatFileType(documentItem?.documentType)}</div>
              </div>
            )}

          </div>
        </div>
      </CardBody>
      <CardFooter className="border-top-dashed py-1">

        <div className="d-flex justify-content-between align-items-center">


          <div className="text-muted"><i className="ri-calendar-event-fill me-1 align-bottom"></i> {formatDateString(documentItem?.createdDate)}</div>
          <div className="d-flex gap-1 align-items-center">
            {allowedFormats.includes(documentFileExtension) && (
              <button type="button" className="btn btn-icon text-primary btn-sm fs-18 dropdown" data-bs-toggle="modal" data-bs-target="#birthapp" onClick={openDocumentPreview} title="View" >
                <Eye width="18" height="18" className="text-primary " />
              </button>
            )}
            <span
              className="btn btn-icon text-primary btn-sm fs-18"
              title="Download"
              onClick={() =>
                handleDownload(
                  documentItem?.documentPath,
                  documentItem?.viewDocumentName
                )
              }
            >
              <i className="ri-download-2-line" />
            </span>
          </div>

        </div>

      </CardFooter>
    </Card>

  );
};

export default DocumentItem;
