import React, { useState, useCallback, useEffect } from "react";
import FormBuilder from "./FormBuilder";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import $, { data } from "jquery";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
window.jQuery = $;
window.$ = $;

const FormBuilderView = ({
  formName,
  formSlug,
  prefilledData,
  fb,
  formNameError,
  setFormNameError,
  formSlugError,
  setFormSlugError,
  validateForm,
  addFormDataApi,
  handleFormName,
  handleFormSlug,
  viewPermissions,
  createPermission,
  editPermission,
}) => {
  const navigate = useNavigate()
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
  ? decrypt({ data: userEncryptData }) : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id;
  const handleSaveSingleForm = async () => {
  const singleFormData = $(fb.current).formBuilder("getData");

  if (formName.current === undefined || !formName.current) {
    setFormNameError("Please enter form name.");
  } else {
    setFormNameError("");
  }

  if (formSlug.current === undefined || !formSlug.current) {
    setFormSlugError("Please enter form slug.");
  } else {
    setFormSlugError("");
  }


    if (formName.current && formSlug.current) {
      const newFormData = {
        userId: userId,
        formName: formName.current,
        formSlug: formSlug.current,
        formData: singleFormData,
      };

      if (newFormData && newFormData.formData.length > 0) {
        await addFormDataApi(newFormData);
      } else {
        setFormNameError("");
        setFormSlugError("");
        // alert("Please create form.");
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: "btn btn-success btn-lg",
          },
          buttonsStyling: false,
        });
        swalWithBootstrapButtons.fire({
          title: "Please create form.",
          text: "",
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
      }
    }
  };
  const handleBackClick = () => {
    navigate(-1);
  };



  // Memoize the formData array
  const formData = [
    { type: "header", subtype: "h1", label: "Header", access: false },
    {
      type: "radio-group",
      required: false,
      label: "Radio Group",
      inline: false,
      name: "radio-group-1698650985253-0",
    },
    {
      type: "number",
      required: false,
      label: "Number",
      className: "form-control",
      name: "number-1698650985820-0",
    },
    { type: "paragraph", subtype: "p", label: "Paragraph", access: false },
    {
      type: "text",
      required: false,
      label: "Text Field",
      className: "form-control",
      name: "text-1698650987736-0",
    },
    {
      type: "textarea",
      required: false,
      label: "Text Area",
      className: "form-control",
      name: "textarea-1698650989924-0",
    },
  ];
  return (
    <div>
      <div id="layout-wrapper bg-white">
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12  d-sm-flex align-items-center justify-content-between">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0">Form Builder</h4>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                  <Button
                    color="outline-secondary"
                    className="waves-effect waves-light back-btn d-flex align-items-center"
                    onClick={handleBackClick}
                  >
                    <IoChevronBack size={20} />
                    <span className="ms-2">
                      Back
                    </span>
                  </Button>
                </div>
              </div>
              <div>
                <div className="d-flex align-items-baseline mt-3 mt-md-0">
                  <div className="mx-3 input-light" style={{ width: "300px" }}>
                    <div>
                      <label htmlFor="tasksTitle-field" className="form-label"> Name * </label>
                      <input type="text" className="form-control" placeholder="Form Name" value={formName.current} onChange={(e) => handleFormName(e)}
                      disabled={
                        (!createPermission && !editPermission) || (prefilledData?.id && !editPermission)
                      }
                       />
                      <div className="text-danger">{formNameError}</div>
                    </div>
                  </div>
                  <div className="mx-3 input-light mb-2" style={{ width: "400px" }} >
                    <div>
                      <label htmlFor="tasksTitle-field" className="form-label">
                        Form Slug * (<span style={{ color: "grey" }}>Unique and unchangeable after creation</span>)
                      </label>
                      <input disabled={prefilledData ? true : false} type="text" className="form-control" placeholder="Form Slug" value={formSlug.current} onChange={(e) => handleFormSlug(e)} />
                      <div className="text-danger">{formSlugError}</div>
                    </div>
                  </div>

                </div>

              </div>
              <div className="mt-4">
                <FormBuilder
                  prefilledData={prefilledData}
                  fb={fb}
                  handleSaveSingleForm={handleSaveSingleForm}
                  viewPermissions={viewPermissions}
                  createPermission={createPermission}
                  editPermission={editPermission}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderView;
