import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormBuilderView from "../../common/FormBuilder/FormBuilderView";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../utils/hook/useAxios";

const FormBuilderCreate = () => {
  const axiosInstance = useAxios()
  const fb = useRef(null);
  const navigate = useNavigate()
  const location = useLocation();
  const formPrefillData = location?.state;
  const formName=useRef()
  const formSlug=useRef()

  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const UserPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find((module) => module.slug === "formbuilder");
  const viewPermissions = UserPermissions
    ? hasViewPermission(UserPermissions)
    : false;
  const createPermission = UserPermissions
    ? hasCreatePermission(UserPermissions)
    : false;
  const editPermission = UserPermissions
    ? hasEditPermission(UserPermissions)
    : false;
  const deletePermission = UserPermissions
    ? hasDeletePermission(UserPermissions)
    : false;

  // Validation states
  const [formNameError, setFormNameError] = useState("");
  const [formSlugError, setFormSlugError] = useState("");
  // Add similar validation states for other fields

  const validateForm = () => {
    let isValid = true;
    return isValid;
  };
  const [_, setRender] = useState(false);

  useEffect(() => {
    // Get the values from local storage
    const storedFormName = formPrefillData?.formName;
    const storedFormSlug = formPrefillData?.formSlug;

    // Set the state if values are found in local storage
    if (storedFormName) {
      formName.current = storedFormName;
    }
    if (storedFormSlug) {
      formSlug.current = storedFormSlug;
    }

    // Trigger re-render to update input fields
    setRender(render => !render);
  }, [formPrefillData]);

  const validationSchema = Yup.object().shape({
    formName: Yup.string()
      .min(5, "Please enter title 4 character long")
      .required("Please enter form name"),
    formSlug: Yup.string().required("Please enter form slug"),
    formData: Yup.string().required("Please create form"),
  });
  const formik = useFormik({
    initialValues: {
      formName: "",
      formSlug: "",
      formData: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      
    },
  });

  const addFormDataApi = async (values) => {
    if (formPrefillData?.id) {
      try {
        const response = await axiosInstance.post(
          `serviceManagement/form/update`,
          {
            ...values,
            formId: formPrefillData?.id,
            formData: JSON.stringify(values?.formData)
          }
        );
        if (response) {
          navigate("/formbuilder/list")
          toast.success("Form updated successfully.");
        }
      } catch (error) {
        toast.error("Something went wrong while create update form.");
      }
    } else {
      try {
        const response = await axiosInstance.post(
          `serviceManagement/form/create`,
          {
            ...values,
            version: 1,
            formData: JSON.stringify(values?.formData)
          }
        );
        if (response) {
          navigate("/formbuilder/list")
          toast.success("Form added successfully.");
        }
      } catch (error) {
        if (error?.response?.data?.message === "SequelizeUniqueConstraintError: Validation error") {
          toast.error("Slug will be unique");
        } else {
          toast.error("Something went wrong while create update form.");
        }
      }
    }
  }
  const handleFormName = (e) => {
    const value = e.target.value;
    formName.current=value
    setRender(render => !render);
  };
  const handleFormSlug=(e)=>{
    const value = e.target.value;
    formSlug.current=value
    setRender(render => !render);
  }

  document.title = "Form Builder | eGov Solution"

  return (
    <>
      <FormBuilderView
        formName={formName}
        formSlug={formSlug}
        prefilledData={formPrefillData}
        fb={fb}
        formNameError={formNameError}
        setFormNameError={setFormNameError}
        formSlugError={formSlugError}
        setFormSlugError={setFormSlugError}
        validateForm={validateForm}
        addFormDataApi={addFormDataApi}
        formik={formik}
        handleFormName={handleFormName}
        handleFormSlug={handleFormSlug}
        viewPermissions={viewPermissions}
        createPermission={createPermission}
        editPermission={editPermission}
      />
    </>
  );
};

export default FormBuilderCreate;
