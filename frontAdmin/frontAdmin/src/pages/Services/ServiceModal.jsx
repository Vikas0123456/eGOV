import { useFormik } from "formik";
import React, { useState } from "react";
import {
    Button,
    Form,
    Spinner,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { FaRegCopy } from "react-icons/fa";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useEffect } from "react";
import Select from "react-select";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import infotool from "../../../src/images/svg/icons8-info.svg";
import StripeLogo from "../../../src/assets/images/payment.png";
import payLaterLogo from "../../../src/assets/images/pay-later.png";
import payNowLogo from "../../../src/assets/images/pay-now.png";

import CKEditorModelTemplate from "./ServiceCKEditor";
import PreviewTemplateModel from "./TemplatePreviewModal";
import { Table, InputGroup, Input, Label } from "reactstrap";
import useAxios from "../../utils/hook/useAxios";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import CKEditorModel from "../../common/CKEditor/CKEditor";

const dynamicFieldsValidationSchema = Yup.object().shape({
    id: Yup.string().required(),
    applicationFormId: Yup.lazy((value, { parent }) => {
        if (parent.id === "appForm") {
            // Required only for the first step
            return Yup.string().required("Please select the Form.");
        } else {
            // Not required for other steps
            return Yup.string().nullable();
        }
    }),
    requiredDocuments: Yup.lazy((value, { parent }) => {
        if (
            parent.id === "appForm" ||
            parent.id === "declaration & paymentRules"
        ) {
            return Yup.array().notRequired();
        } else {
            return Yup.array()
                .of(
                    Yup.object().shape({
                        selectedDocument: Yup.string().required(
                            "Please select document"
                        ),
                        isRequired: Yup.boolean(),
                        canApply: Yup.boolean(),
                        appliedService: Yup.string().test(
                            "appliedService-required",
                            "Please select the Applied Service.",
                            function (value) {
                                const { canApply } = this.parent;
                                return !canApply || !!value; // Require appliedService if canApply is true
                            }
                        ),
                    })
                )
                .required("Required documents are missing");
        }
    }),
    paymentFormId: Yup.string(),
    selectedImage: Yup.string(),
    title: Yup.string().required(),
    imageUrl: Yup.string().required("Please select icon."),
});

const validationSchema = Yup.object({
    serviceName: Yup.string().required("Please enter service name"),
    slug: Yup.string().required("Please enter slug"),
    shortDescription: Yup.string().required("Please enter short description "),
    departmentId: Yup.number().required("Please select department"),
    // currentVersion: Yup.string().required(" Please enter current version"),
    price: Yup.number().required(" Please enter price"),
    priority: Yup.string().required("Please select priority"),
    TAT: Yup.number().required("Please enter Turn Around Time (TAT) in Days"),
    certificateExpiryTime: Yup.number().required(
        "Please enter Certificate Expiry Time in Days"
    ),
    pdfGenerator: Yup.string().required(
        "Please select Certificate Generation Method"
    ),
    servicePrerequisiteData: Yup.string().required(
        "Please enter Service Prerequisite"
    ),
    serviceInstructionsData: Yup.string().required(
        "Please enter Service Instructions"
    ),
    meetingInstructionData: Yup.string().required(
        "Please enter Meeting Instructions"
    ),
    paymentMethod: Yup.string().required(
        "Please select payment method"
    ),
    paymentOption: Yup.string().required(
        "Please select payment option"
    ),
    dynamicFields: Yup.array().of(dynamicFieldsValidationSchema).required(),
});

const cleanHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};

const ServiceModal = ({
    show,
    handleClose,
    serviceDataById,
    departmentList,
    formList,
    fetchServiceList,
    documentList,
    serviceList,
    viewPermissions,
    createPermission,
    editPermission,
}) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const [formdata, setFormData] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [dynamicFields, setDynamicFields] = useState(
        serviceDataById?.step
            ? JSON.parse(serviceDataById?.step)
            : [
                {
                    id: "appForm",
                    applicationFormId: "",
                    requiredDocuments: [
                        {
                            selectedDocument: "",
                            isRequired: false,
                            canApply: false,
                            appliedService: "",
                        },
                    ],
                    paymentFormId: "",
                    selectedImage: "",
                    title: "Application Form",
                    imageUrl: "",
                },
                {
                    id: "docForm",
                    applicationFormId: "",
                    requiredDocuments: [
                        {
                            selectedDocument: "",
                            isRequired: false,
                            canApply: false,
                            appliedService: "",
                        },
                    ],
                    paymentFormId: "",
                    selectedImage: "",
                    title: "Upload Document",
                    imageUrl: "",
                },
                {
                    id: "declaration & paymentRules",
                    applicationFormId: "",
                    requiredDocuments: [
                        {
                            selectedDocument: "",
                            isRequired: false,
                            canApply: false,
                            appliedService: "",
                        },
                    ],
                    paymentFormId: "",
                    selectedImage: "",
                    title: "Declaration & Payment Rules",
                    imageUrl: "",
                },
            ]
    );

    const [previewshow, setPreviewShow] = useState(false);
    const previewShowToggle = () => {
        setPreviewShow(!previewshow);
    };
    const [searchQuery, setSearchQuery] = useState("");

    const [copiedIndex, setCopiedIndex] = useState(null);

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    // Filter data based on the search query for label
    const filteredData = formdata?.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (serviceDataById && formList.length > 0) {
            const formData = JSON.parse(serviceDataById?.step);

            let formId = Number(formData[0]?.applicationFormId);

            const selectedForm = formList.find((form) => form.id === formId);

            const formDataParsed =
                selectedForm && JSON.parse(selectedForm.formData);
            const extractedData = formDataParsed
                ?.map((item) => {
                    return {
                        label: cleanHTML(item.label),
                        name: item.name,
                    };
                })
                ?.filter((item) => item.label && item.name);

            setFormData(extractedData);
        }
    }, []);

    const addService = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/service/create`,
                {
                    ...values,
                }
            );
            if (response.data?.data) {
                toast.success("Service added successfully.");
                fetchServiceList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Error while creating service, please try again."
            );
            setLoading(false);
            console.error("Something went wrong while create new service");
        }
    };

    const updateService = async (id, values) => {
        try {
            setLoading(true);
            if (id) {
                const response = await axiosInstance.put(
                    `serviceManagement/service/update`,
                    {
                        id: id,
                        ...values,
                    }
                );
                if (response) {
                    toast.success("Service updated successfully.");
                    fetchServiceList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update service");
        }
    };

    const renderTooltip = (props) => (
        <Tooltip id="info-tooltip" {...props}>
            Create Your Service Flow:
            <br />
            1. Select the application form.
            <br />
            2. Select the required documents.
            <br />
            3. Complete the payment process.
        </Tooltip>
    );

    const initialcertificateTemplate = `
            <figure class="table">
            <table>
                <tbody>
                <tr>
                    <th>Example Name</th>
                    <td><strong>@@ExampleValue@@</strong></td>
                </tr>
                <tr>
                    <th>Example Type</th>
                    <td><strong>@@ExampleValue@@</strong></td>
                </tr>
                </tbody>
            </table>
            </figure>
            `;

    const formik = useFormik({
        initialValues: {
            serviceName: serviceDataById?.serviceName || "",
            slug: serviceDataById?.slug || "",
            shortDescription: serviceDataById?.shortDescription || "",
            departmentId: serviceDataById?.departmentId || "",
            price: serviceDataById?.price || "",
            priority: serviceDataById?.priority || "",
            TAT: serviceDataById?.TAT || "",
            certificateExpiryTime: serviceDataById?.certificateExpiryTime || 0,
            status: serviceDataById?.status || "",
            dynamicFields: dynamicFields,
            certificateTemplate: serviceDataById?.certificateTemplate
                ? serviceDataById?.certificateTemplate
                : initialcertificateTemplate,
            pdfGenerator: serviceDataById?.pdfGenerator || "",
            serviceInstructionsData: serviceDataById?.serviceInstructionsData || "",
            servicePrerequisiteData: serviceDataById?.servicePrerequisiteData || "",
            meetingInstructionData: serviceDataById?.meetingInstructionData || "",
            paymentMethod: serviceDataById?.paymentMethod || "0",
            paymentOption: serviceDataById?.paymentOption || "0",
        },
        // validate: validate,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            values.dynamicFields = JSON.stringify(values.dynamicFields);
            if (serviceDataById) {
                await updateService(serviceDataById?.id, values)
                    .then((res) => {
                        setLoading(false);
                        handleClose();
                        fetchServiceList();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                addService(values)
                    .then((res) => {
                        setLoading(false);
                        handleClose();
                        fetchServiceList();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        },
    });

    const handleFormChange = (index, formId) => {
        const numericFormId = Number(formId);
        const updatedData = [...dynamicFields];
        updatedData[index].applicationFormId = formId;
        setDynamicFields(updatedData);
        formik.setFieldValue("dynamicFields", updatedData);

        const selectedForm = formList.find((form) => form.id === numericFormId);

        const formDataParsed = selectedForm
            ? JSON.parse(selectedForm?.formData)
            : null;
        const extractedData = formDataParsed
            ?.map((item) => {
                return {
                    label: cleanHTML(item.label),
                    name: item.name,
                    // value: item.value
                };
            })
            ?.filter((item) => item.label && item.name);

        //   return extractedData
        setFormData(extractedData);
    };

    const addDocumentField = (fieldIndex) => {
        const updatedFields = [...dynamicFields];

        // Add a new document object to the requiredDocuments array
        updatedFields[fieldIndex].requiredDocuments.push({
            selectedDocument: "", // Initialize as an empty string
            isRequired: false,
            canApply: false,
            appliedService: "", // Initialize as an empty string
        });

        setDynamicFields(updatedFields);
        formik.setFieldValue("dynamicFields", updatedFields, false); // Don't validate on change

        const docIndex = updatedFields[fieldIndex].requiredDocuments.length - 1; // Newly added document index

        formik.setFieldError(
            `dynamicFields.${fieldIndex}.requiredDocuments.${docIndex}.selectedDocument`,
            ""
        );
    };

    const handleDocumentChange = (fieldIndex, docIndex, documentId) => {
        const updatedFields = [...dynamicFields];
        updatedFields[fieldIndex].requiredDocuments[docIndex].selectedDocument =
            documentId;
        updatedFields[fieldIndex].requiredDocuments[docIndex].canApply =
            false;
        updatedFields[fieldIndex].requiredDocuments[docIndex].isRequired =
            false;
        setDynamicFields(updatedFields);
        formik.setFieldValue("dynamicFields", updatedFields);
    };

    const handleCheckboxChange = (index, docIndex, field) => {
        const updatedFields = [...dynamicFields];

        updatedFields[index].requiredDocuments[docIndex][field] =
            !updatedFields[index].requiredDocuments[docIndex][field];

        // If 'canApply' is unchecked, clear the 'appliedService' value
        if (
            field === "canApply" &&
            !updatedFields[index].requiredDocuments[docIndex][field]
        ) {
            updatedFields[index].requiredDocuments[docIndex].appliedService =
                "";

            formik.setFieldError(
                `dynamicFields.${index}.requiredDocuments.${docIndex}.appliedService`,
                ""
            );
        }
        // Update the dynamicFields in state
        setDynamicFields(updatedFields);
    };

    const handleAppliedFormChange = (index, docIndex, form) => {
        const updatedFields = [...dynamicFields];
        updatedFields[index].requiredDocuments[docIndex].appliedService = form;
        setDynamicFields(updatedFields);
        formik.setFieldValue("dynamicFields", updatedFields);
    };

    useEffect(() => {
        if (serviceDataById) {
            formik.setFieldValue(
                "dynamicFields",
                JSON.parse(serviceDataById.step)
            );
        }
    }, [serviceDataById]);

    const handleRemoveDocumentField = (fieldIndex, docIndex) => {
        const updatedFields = [...dynamicFields];
        updatedFields[fieldIndex].requiredDocuments = updatedFields[
            fieldIndex
        ].requiredDocuments.filter((_, index) => index !== docIndex);
        setDynamicFields(updatedFields);
        formik.setFieldValue("dynamicFields", updatedFields);
    };

    const handleImageChange = async (index, event) => {
        const updatedFields = [...dynamicFields];
        const file = event.target.files[0];

        if (file) {
            if (file.size > 102400) {
                toast.error(
                    "File size exceeds 100KB. Please choose a smaller file."
                );
                event.target.value = "";
                updatedFields[index] = {
                    ...updatedFields[index],
                    selectedImage: null,
                    imageUrl: null,
                };

                setDynamicFields(updatedFields);
                formik.setFieldValue("dynamicFields", updatedFields);
                return;
            }

            const formData = new FormData();
            formData.append("viewDocumentName", "Form Icon");
            formData.append("documentFile", file);
            formData.append("userId", userId);
            formData.append("isGenerated", "0");
            formData.append("isShowInDocument", "0");

            try {
                const fileResponse = await axiosInstance.post(
                    "documentService/uploading",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                const uploadedDocumentId = fileResponse?.data?.data?.[0]?.id;
                const imageUrl = fileResponse?.data?.data?.[0]?.documentPath;
                updatedFields[index] = {
                    ...updatedFields[index],
                    selectedImage: uploadedDocumentId,
                    imageUrl: imageUrl,
                };

                setDynamicFields(updatedFields);
                formik.setFieldValue("dynamicFields", updatedFields);
            } catch (error) {
                console.error("Image upload error:", error);
            }
        }
    };

    const departmentOptions =
        departmentList &&
        departmentList.map((department) => ({
            value: department.id,
            label: department.departmentName,
        }));

    const priorityOptions = [
        { value: "0", label: "Standard" },
        { value: "1", label: "Express" },
    ];
    const pdfGenretorOptions = [
        { value: "0", label: "Automatic" },
        { value: "1", label: "Manual" },
    ];
    const paymentOptions = [
        { value: "0", label: "Charge Now" },
        { value: "1", label: "Charge Later" },
    ];

    const parseDynamicFieldErrors = (errors) => {
        try {
            return JSON.parse(errors);
        } catch {
            return {};
        }
    };

    useEffect(() => {
        const selectedDept = departmentList.find(
            (dept) => dept.id === formik.values.departmentId
        );
        setSelectedDepartment(selectedDept || null);
    }, [formik.values.departmentId, departmentList]);

    const errors = formik.errors.dynamicFields
        ? parseDynamicFieldErrors(formik.errors.dynamicFields)
        : {};

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <>
            <div className="main-content">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                    <h4 className="mb-sm-0">Services</h4>
                                    <div className="page-title-right">
                                        <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 pe-xxl-4">
                            <div className="row">
                                <div className="col-xxl-12">
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="card border-0 mb-0">
                                            <div className="card-body p-4">
                                                <div className=" ">
                                                    <div className="modal-header  pb-4">
                                                        {!serviceDataById &&
                                                            createPermission && (
                                                                <h4
                                                                    className="modal-title"
                                                                    id="exampleModalgridLabel"
                                                                >
                                                                    Create
                                                                    Service
                                                                </h4>
                                                            )}
                                                        {serviceDataById &&
                                                            !editPermission && (
                                                                <h4
                                                                    className="modal-title"
                                                                    id="exampleModalgridLabel"
                                                                >
                                                                    View Service
                                                                </h4>
                                                            )}
                                                        {editPermission &&
                                                            serviceDataById && (
                                                                <h4
                                                                    className="modal-title"
                                                                    id="exampleModalgridLabel"
                                                                >
                                                                    Update
                                                                    Service
                                                                </h4>
                                                            )}
                                                        <div>
                                                            <Button
                                                                color="outline-secondary"
                                                                className="waves-effect waves-light back-btn d-flex align-items-center"
                                                                onClick={handleClose}
                                                            >
                                                                <IoChevronBack size={20} />
                                                                <span className="ms-2">
                                                                    Back
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="modal-body">
                                                        <div className="row">
                                                            <div className="col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-2">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Service
                                                                        Name{" "}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Service Name"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .serviceName
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "serviceName"
                                                                        )}
                                                                        disabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .serviceName &&
                                                                        formik
                                                                            .touched
                                                                            .serviceName && (
                                                                            <div className="text-danger error ">
                                                                                {" "}
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .serviceName
                                                                                }{" "}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Slug*
                                                                        (Unique
                                                                        and
                                                                        unchangeable
                                                                        after
                                                                        creation){" "}
                                                                    </label>
                                                                    <input
                                                                        disabled={
                                                                            serviceDataById ||
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Slug"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .slug
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "slug"
                                                                        )}
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .slug &&
                                                                        formik
                                                                            .touched
                                                                            .slug && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .slug
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Short
                                                                        Description{" "}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Short Description"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .shortDescription
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "shortDescription"
                                                                        )}
                                                                        disabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .shortDescription &&
                                                                        formik
                                                                            .touched
                                                                            .shortDescription && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .shortDescription
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Department{" "}
                                                                    </label>

                                                                    <div className="text-start bg-light">
                                                                        <Select
                                                                            id="departmentId"
                                                                            value={
                                                                                departmentOptions.find(
                                                                                    (
                                                                                        option
                                                                                    ) =>
                                                                                        option.value ===
                                                                                        formik
                                                                                            .values
                                                                                            .departmentId
                                                                                ) ||
                                                                                null
                                                                            }
                                                                            onChange={(
                                                                                option
                                                                            ) =>
                                                                                formik.setFieldValue(
                                                                                    "departmentId",
                                                                                    option
                                                                                        ? parseInt(
                                                                                            option.value
                                                                                        )
                                                                                        : ""
                                                                                )
                                                                            }
                                                                            options={
                                                                                departmentOptions
                                                                            }
                                                                            placeholder="Select Department"
                                                                            name="departmentId"
                                                                            styles={{
                                                                                control:
                                                                                    (
                                                                                        provided
                                                                                    ) => ({
                                                                                        ...provided,
                                                                                        cursor: "pointer",
                                                                                    }),
                                                                                menu: (
                                                                                    provided
                                                                                ) => ({
                                                                                    ...provided,
                                                                                    cursor: "pointer",
                                                                                }),
                                                                                option: (
                                                                                    provided
                                                                                ) => ({
                                                                                    ...provided,
                                                                                    cursor: "pointer",
                                                                                }),
                                                                            }}
                                                                            isDisabled={
                                                                                (!createPermission &&
                                                                                    !editPermission) ||
                                                                                (serviceDataById &&
                                                                                    !editPermission)
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {formik
                                                                        .touched
                                                                        .departmentId &&
                                                                        formik
                                                                            .errors
                                                                            .departmentId && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .departmentId
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Price{" "}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        placeholder="Enter Price"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .price
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "price"
                                                                        )}
                                                                        disabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .price &&
                                                                        formik
                                                                            .touched
                                                                            .price && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .price
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Priority{" "}
                                                                    </label>
                                                                    <Select
                                                                        id="priority"
                                                                        value={
                                                                            priorityOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    formik
                                                                                        .values
                                                                                        .priority
                                                                            ) ||
                                                                            null
                                                                        }
                                                                        onChange={(
                                                                            option
                                                                        ) =>
                                                                            formik.setFieldValue(
                                                                                "priority",
                                                                                option
                                                                                    ? option.value
                                                                                    : ""
                                                                            )
                                                                        }
                                                                        options={
                                                                            priorityOptions
                                                                        }
                                                                        placeholder="Select Priority"
                                                                        name="priority"
                                                                        styles={{
                                                                            control:
                                                                                (
                                                                                    provided
                                                                                ) => ({
                                                                                    ...provided,
                                                                                    cursor: "pointer",
                                                                                }),
                                                                            menu: (
                                                                                provided
                                                                            ) => ({
                                                                                ...provided,
                                                                                cursor: "pointer",
                                                                            }),
                                                                            option: (
                                                                                provided
                                                                            ) => ({
                                                                                ...provided,
                                                                                cursor: "pointer",
                                                                            }),
                                                                        }}
                                                                        isDisabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .touched
                                                                        .priority &&
                                                                        formik
                                                                            .errors
                                                                            .priority && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .priority
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        TAT
                                                                        -Turn
                                                                        Around
                                                                        Time (In
                                                                        Days){" "}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        placeholder="Enter TAT (in Days)"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .TAT
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "TAT"
                                                                        )}
                                                                        disabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .TAT &&
                                                                        formik
                                                                            .touched
                                                                            .TAT && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .TAT
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Certificate
                                                                        Generation
                                                                        Method{" "}
                                                                    </label>
                                                                    <Select
                                                                        id="certificateGenerationMethod"
                                                                        value={
                                                                            pdfGenretorOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    formik
                                                                                        .values
                                                                                        .pdfGenerator
                                                                            ) ||
                                                                            null
                                                                        }
                                                                        onChange={(
                                                                            option
                                                                        ) =>
                                                                            formik.setFieldValue(
                                                                                "pdfGenerator",
                                                                                option
                                                                                    ? option.value
                                                                                    : ""
                                                                            )
                                                                        }
                                                                        options={
                                                                            pdfGenretorOptions
                                                                        }
                                                                        placeholder="Select Certificate Generation Method"
                                                                        name="certificateGenerationMethod"
                                                                        styles={{
                                                                            control:
                                                                                (
                                                                                    provided
                                                                                ) => ({
                                                                                    ...provided,
                                                                                    cursor: "pointer",
                                                                                }),
                                                                            menu: (
                                                                                provided
                                                                            ) => ({
                                                                                ...provided,
                                                                                cursor: "pointer",
                                                                            }),
                                                                            option: (
                                                                                provided
                                                                            ) => ({
                                                                                ...provided,
                                                                                cursor: "pointer",
                                                                            }),
                                                                        }}
                                                                        isDisabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .touched
                                                                        .pdfGenerator &&
                                                                        formik
                                                                            .errors
                                                                            .pdfGenerator && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .pdfGenerator
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className=" col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label
                                                                        htmlFor="tasksTitle-field"
                                                                        className="form-label"
                                                                    >
                                                                        {" "}
                                                                        Certificate
                                                                        Expiry
                                                                        Time (In
                                                                        Days){" "}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        placeholder="Certificate Expiry Time (in Days)"
                                                                        value={
                                                                            formik
                                                                                .values
                                                                                .certificateExpiryTime
                                                                        }
                                                                        {...formik.getFieldProps(
                                                                            "certificateExpiryTime"
                                                                        )}
                                                                        disabled={
                                                                            (!createPermission &&
                                                                                !editPermission) ||
                                                                            (serviceDataById &&
                                                                                !editPermission)
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .errors
                                                                        .certificateExpiryTime &&
                                                                        formik
                                                                            .touched
                                                                            .certificateExpiryTime && (
                                                                            <div className="text-danger error ">
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .certificateExpiryTime
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-4 col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
                                                                <div>
                                                                    <label htmlFor="tasksTitle-field" className="form-label">
                                                                        Payment Option
                                                                    </label>
                                                                    <div className="d-flex align-items-center mt-2">
                                                                        <div className="form-check  d-flex align-items-center me-4">
                                                                            <input
                                                                                type="radio"
                                                                                id="payNow"
                                                                                name="paymentOption"
                                                                                value="0"
                                                                                className="form-check-input"
                                                                                checked={formik.values.paymentOption === "0"}
                                                                                onChange={() => formik.setFieldValue("paymentOption", "0")}
                                                                                disabled={
                                                                                    (!createPermission && !editPermission) ||
                                                                                    (serviceDataById && !editPermission)
                                                                                }
                                                                            />
                                                                            <label className="form-check-label" htmlFor="payNow">
                                                                                <span className="mx-2 ">Pay Now</span>
                                                                                <img src={payNowLogo} width={33} alt="Pay Now" />
                                                                            </label>
                                                                        </div>
                                                                        <div className="form-check  d-flex align-items-center">
                                                                            <input
                                                                                type="radio"
                                                                                id="payLater"
                                                                                name="paymentOption"
                                                                                value="1"
                                                                                className="form-check-input"
                                                                                checked={formik.values.paymentOption === "1"}
                                                                                onChange={() => formik.setFieldValue("paymentOption", "1")}
                                                                                disabled={
                                                                                    (!createPermission && !editPermission) ||
                                                                                    (serviceDataById && !editPermission)
                                                                                }
                                                                            />
                                                                            <label className="form-check-label" htmlFor="payLater">
                                                                                <span className="mx-2">Pay Later</span>
                                                                                <img src={payLaterLogo} width={33} alt="Pay Later" />
                                                                            </label>
                                                                        </div>

                                                                    </div>
                                                                    {formik.touched.paymentOption && formik.errors.paymentOption && (
                                                                        <div className="text-danger error">
                                                                            {formik.errors.paymentOption}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>


                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card border-0 mt-4 mb-0">
                                            <div className="card-body p-4">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div>
                                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                                <h4
                                                                    htmlFor="dynamicFields"
                                                                    className="form-label"
                                                                >
                                                                    {" "}
                                                                    Form Steps{" "}
                                                                    <OverlayTrigger
                                                                        placement="right"
                                                                        overlay={
                                                                            renderTooltip
                                                                        }
                                                                        className="text-primary"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                infotool
                                                                            }
                                                                            alt="info"
                                                                            style={{
                                                                                cursor: "pointer",
                                                                            }}
                                                                        />
                                                                    </OverlayTrigger>
                                                                </h4>
                                                            </div>

                                                            <Tabs
                                                                defaultActiveKey="0"
                                                                id="dynamic-fields-tabs"
                                                                className="border-bottom-0 step-form-box"
                                                            >
                                                                {dynamicFields.map(
                                                                    (
                                                                        field,
                                                                        index
                                                                    ) => (
                                                                        <Tab
                                                                            className=""
                                                                            eventKey={index.toString()}
                                                                            title={
                                                                                <>
                                                                                    <span
                                                                                        style={{
                                                                                            color:
                                                                                                formik
                                                                                                    .touched
                                                                                                    .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields[
                                                                                                    index
                                                                                                    ]
                                                                                                    ? "red" // Apply red color if there's an error
                                                                                                    : "inherit", // Keep default color if no error
                                                                                            fontWeight:
                                                                                                formik
                                                                                                    .touched
                                                                                                    .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields[
                                                                                                    index
                                                                                                    ]
                                                                                                    ? "bold" // Make the text bold if there's an error
                                                                                                    : "normal", // Keep default weight if no error
                                                                                        }}
                                                                                    >
                                                                                        Step{" "}
                                                                                        {index +
                                                                                            1}{" "}
                                                                                        -{" "}
                                                                                        {
                                                                                            field?.title
                                                                                        }
                                                                                    </span>
                                                                                </>
                                                                            }
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <div className="border rounded-2 border-1 p-3 p-sm-4 mb-4">
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <div className="mb-3">
                                                                                        <h5>
                                                                                            Step{" "}
                                                                                            {index +
                                                                                                1}{" "}
                                                                                            -{" "}
                                                                                            {
                                                                                                field?.title
                                                                                            }
                                                                                        </h5>
                                                                                        {index ===
                                                                                            1 && (
                                                                                                <>
                                                                                                    <div className="col-12">
                                                                                                        <div className="mb-3">
                                                                                                            <label
                                                                                                                htmlFor={`titleInput-${index}`}
                                                                                                                className="form-label"
                                                                                                            >
                                                                                                                {" "}
                                                                                                                Title{" "}
                                                                                                            </label>
                                                                                                            <input
                                                                                                                type="text"
                                                                                                                id={`titleInput-${index}`}
                                                                                                                value={
                                                                                                                    field.title
                                                                                                                }
                                                                                                                disabled
                                                                                                                className="form-control"
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    <div className="col-12">
                                                                                                        <div className="mb-2 d-flex align-items-end">
                                                                                                            <div className="w-100">
                                                                                                                <label
                                                                                                                    htmlFor={`documentImage-${index}`}
                                                                                                                    className="form-label"
                                                                                                                >
                                                                                                                    {" "}
                                                                                                                    Select
                                                                                                                    Document
                                                                                                                    Image{" "}
                                                                                                                </label>
                                                                                                                <input
                                                                                                                    type="file"
                                                                                                                    id={`documentImage-${index}`}
                                                                                                                    accept="image/svg+xml"
                                                                                                                    onChange={(
                                                                                                                        e
                                                                                                                    ) =>
                                                                                                                        handleImageChange(
                                                                                                                            index,
                                                                                                                            e
                                                                                                                        )
                                                                                                                    }
                                                                                                                    className="form-control"
                                                                                                                    disabled={
                                                                                                                        (!createPermission &&
                                                                                                                            !editPermission) ||
                                                                                                                        (serviceDataById &&
                                                                                                                            !editPermission)
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                            {field.image && (
                                                                                                                <img
                                                                                                                    src={URL.createObjectURL(
                                                                                                                        field.image
                                                                                                                    )}
                                                                                                                    alt="Document"
                                                                                                                    style={{
                                                                                                                        width: "100px",
                                                                                                                        height: "auto",
                                                                                                                    }}
                                                                                                                />
                                                                                                            )}
                                                                                                            {field.imageUrl && (
                                                                                                                <img
                                                                                                                    src={
                                                                                                                        field.imageUrl
                                                                                                                    }
                                                                                                                    alt="Document Preview"
                                                                                                                    className="ms-2 rounded-2"
                                                                                                                    style={{
                                                                                                                        width: "40px",
                                                                                                                    }}
                                                                                                                />
                                                                                                            )}
                                                                                                        </div>
                                                                                                        {formik
                                                                                                            .touched
                                                                                                            .dynamicFields &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields[
                                                                                                            index
                                                                                                            ] &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields[
                                                                                                                index
                                                                                                            ]
                                                                                                                .imageUrl && (
                                                                                                                <div className="text-danger">
                                                                                                                    {
                                                                                                                        formik
                                                                                                                            .errors
                                                                                                                            .dynamicFields[
                                                                                                                            index
                                                                                                                        ]
                                                                                                                            .imageUrl
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                    </div>
                                                                                                </>
                                                                                            )}
                                                                                    </div>
                                                                                </div>

                                                                                {index ===
                                                                                    0 && (
                                                                                        <div className="mb-3 row">
                                                                                            <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                <div className="mb-2">
                                                                                                    <label
                                                                                                        htmlFor={`formSelect-${index}`}
                                                                                                        className="form-label"
                                                                                                    >
                                                                                                        {" "}
                                                                                                        Select
                                                                                                        Form{" "}
                                                                                                    </label>
                                                                                                    <Form.Select
                                                                                                        id={`formSelect-${index}`}
                                                                                                        value={
                                                                                                            field.applicationFormId
                                                                                                        }
                                                                                                        onChange={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            handleFormChange(
                                                                                                                index,
                                                                                                                e
                                                                                                                    .target
                                                                                                                    .value
                                                                                                            );
                                                                                                        }}
                                                                                                        onBlur={() =>
                                                                                                            formik.setFieldTouched(
                                                                                                                `dynamicFields[${index}].applicationFormId`,
                                                                                                                true
                                                                                                            )
                                                                                                        }
                                                                                                        disabled={
                                                                                                            (!createPermission &&
                                                                                                                !editPermission) ||
                                                                                                            (serviceDataById &&
                                                                                                                !editPermission)
                                                                                                        }
                                                                                                    >
                                                                                                        <option value="">
                                                                                                            Select
                                                                                                            Form
                                                                                                        </option>
                                                                                                        {formList.map(
                                                                                                            (
                                                                                                                form
                                                                                                            ) => (
                                                                                                                <option
                                                                                                                    key={
                                                                                                                        form.id
                                                                                                                    }
                                                                                                                    value={
                                                                                                                        form.id
                                                                                                                    }
                                                                                                                >
                                                                                                                    {
                                                                                                                        form.formName
                                                                                                                    }{" "}
                                                                                                                    (
                                                                                                                    {
                                                                                                                        form.formSlug
                                                                                                                    }

                                                                                                                    )
                                                                                                                </option>
                                                                                                            )
                                                                                                        )}
                                                                                                    </Form.Select>
                                                                                                </div>
                                                                                                {formik
                                                                                                    .touched
                                                                                                    .dynamicFields &&
                                                                                                    formik
                                                                                                        .touched
                                                                                                        .dynamicFields[
                                                                                                        index
                                                                                                    ]
                                                                                                        ?.applicationFormId &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields[
                                                                                                        index
                                                                                                    ]
                                                                                                        ?.applicationFormId && (
                                                                                                        <div className="text-danger">
                                                                                                            {
                                                                                                                formik
                                                                                                                    .errors
                                                                                                                    .dynamicFields[
                                                                                                                    index
                                                                                                                ]
                                                                                                                    .applicationFormId
                                                                                                            }
                                                                                                        </div>
                                                                                                    )}
                                                                                            </div>

                                                                                            <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                <div className="mb-3">
                                                                                                    <label
                                                                                                        htmlFor={`titleInput-${index}`}
                                                                                                        className="form-label"
                                                                                                    >
                                                                                                        {" "}
                                                                                                        Title{" "}
                                                                                                    </label>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        id={`titleInput-${index}`}
                                                                                                        value={
                                                                                                            field.title
                                                                                                        }
                                                                                                        disabled
                                                                                                        className="form-control"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                <div className="mb-2 d-flex align-items-end">
                                                                                                    <div className="w-100">
                                                                                                        <label
                                                                                                            htmlFor={`documentImage-${index}`}
                                                                                                            className="form-label"
                                                                                                        >
                                                                                                            {" "}
                                                                                                            Select
                                                                                                            Form
                                                                                                            Icon{" "}
                                                                                                        </label>
                                                                                                        <input
                                                                                                            type="file"
                                                                                                            id={`imageUpload-${index}`}
                                                                                                            accept="image/svg+xml"
                                                                                                            onChange={(
                                                                                                                e
                                                                                                            ) =>
                                                                                                                handleImageChange(
                                                                                                                    index,
                                                                                                                    e
                                                                                                                )
                                                                                                            }
                                                                                                            className="form-control"
                                                                                                            disabled={
                                                                                                                (!createPermission &&
                                                                                                                    !editPermission) ||
                                                                                                                (serviceDataById &&
                                                                                                                    !editPermission)
                                                                                                            }
                                                                                                        />
                                                                                                    </div>
                                                                                                    {field.imageUrl && (
                                                                                                        <img
                                                                                                            src={
                                                                                                                field.imageUrl
                                                                                                            }
                                                                                                            alt="Form Preview"
                                                                                                            className="ms-2 rounded-2"
                                                                                                            style={{
                                                                                                                width: "40px",
                                                                                                            }}
                                                                                                        />
                                                                                                    )}
                                                                                                </div>
                                                                                                {formik
                                                                                                    .touched
                                                                                                    .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields[
                                                                                                    index
                                                                                                    ] &&
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .dynamicFields[
                                                                                                        index
                                                                                                    ]
                                                                                                        .imageUrl && (
                                                                                                        <div className="text-danger">
                                                                                                            {
                                                                                                                formik
                                                                                                                    .errors
                                                                                                                    .dynamicFields[
                                                                                                                    index
                                                                                                                ]
                                                                                                                    .imageUrl
                                                                                                            }
                                                                                                        </div>
                                                                                                    )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                {index ===
                                                                                    1 && (
                                                                                        <>
                                                                                            <div className="dynamic-field row">
                                                                                                {field.requiredDocuments.map(
                                                                                                    (
                                                                                                        doc,
                                                                                                        docIndex
                                                                                                    ) => {
                                                                                                        const selectedDocument = doc.selectedDocument
                                                                                                            ? JSON.parse(doc.selectedDocument)
                                                                                                            : null;

                                                                                                        return (
                                                                                                            <div
                                                                                                                key={
                                                                                                                    docIndex
                                                                                                                }
                                                                                                                className="mb-4 col-xl-4 col-xxl-3 col-lg-6 col-md-6"
                                                                                                            >
                                                                                                                <div className=" card">
                                                                                                                    <div className="card-header bg-light py-2">
                                                                                                                        <h5 className="mb-0 "> {" "} Documents{" "} </h5>
                                                                                                                    </div>


                                                                                                                    <div className="card-body p-3">

                                                                                                                        {selectedDocument?.canApply === "1" &&
                                                                                                                            (
                                                                                                                                <div className="form-check form-check-inline mb-3">
                                                                                                                                    <input
                                                                                                                                        className="form-check-input"
                                                                                                                                        type="checkbox"
                                                                                                                                        id={`canApply-${index}-${docIndex}`}
                                                                                                                                        checked={
                                                                                                                                            doc.canApply
                                                                                                                                        }
                                                                                                                                        onChange={() =>
                                                                                                                                            handleCheckboxChange(
                                                                                                                                                index,
                                                                                                                                                docIndex,
                                                                                                                                                "canApply"
                                                                                                                                            )
                                                                                                                                        }
                                                                                                                                        disabled={
                                                                                                                                            (!createPermission &&
                                                                                                                                                !editPermission) ||
                                                                                                                                            (serviceDataById &&
                                                                                                                                                !editPermission)
                                                                                                                                        }
                                                                                                                                    />
                                                                                                                                    <label
                                                                                                                                        className="form-check-label"
                                                                                                                                        htmlFor={`canApply-${index}-${docIndex}`}
                                                                                                                                    >
                                                                                                                                        {" "}
                                                                                                                                        Can
                                                                                                                                        Apply{" "}
                                                                                                                                    </label>
                                                                                                                                </div>
                                                                                                                            )}

                                                                                                                        <div className="mb-2">
                                                                                                                            <label
                                                                                                                                htmlFor={`documentSelect-${index}-${docIndex}`}
                                                                                                                                className="form-label"
                                                                                                                            >
                                                                                                                                {" "}
                                                                                                                                Select
                                                                                                                                Document{" "}
                                                                                                                            </label>
                                                                                                                            <Form.Select
                                                                                                                                id={`documentSelect-${index}-${docIndex}`}
                                                                                                                                value={
                                                                                                                                    doc.selectedDocument
                                                                                                                                }
                                                                                                                                onChange={(
                                                                                                                                    e
                                                                                                                                ) =>
                                                                                                                                    handleDocumentChange(
                                                                                                                                        index,
                                                                                                                                        docIndex,
                                                                                                                                        e
                                                                                                                                            .target
                                                                                                                                            .value
                                                                                                                                    )
                                                                                                                                }
                                                                                                                                disabled={
                                                                                                                                    (!createPermission &&
                                                                                                                                        !editPermission) ||
                                                                                                                                    (serviceDataById &&
                                                                                                                                        !editPermission)
                                                                                                                                }
                                                                                                                            >
                                                                                                                                <option value="">
                                                                                                                                    {" "}
                                                                                                                                    Select
                                                                                                                                    Document{" "}
                                                                                                                                </option>
                                                                                                                                {documentList.map(
                                                                                                                                    (
                                                                                                                                        document
                                                                                                                                    ) => (
                                                                                                                                        <option
                                                                                                                                            key={
                                                                                                                                                document.id
                                                                                                                                            }
                                                                                                                                            value={JSON.stringify(
                                                                                                                                                document
                                                                                                                                            )}
                                                                                                                                            disabled={field.requiredDocuments.some(
                                                                                                                                                (
                                                                                                                                                    d,
                                                                                                                                                    idx
                                                                                                                                                ) =>
                                                                                                                                                    d.selectedDocument ===
                                                                                                                                                    document.id &&
                                                                                                                                                    idx !==
                                                                                                                                                    docIndex
                                                                                                                                            )}
                                                                                                                                        >
                                                                                                                                            {
                                                                                                                                                document.documentName
                                                                                                                                            }
                                                                                                                                        </option>
                                                                                                                                    )
                                                                                                                                )}
                                                                                                                            </Form.Select>
                                                                                                                        </div>
                                                                                                                        {formik
                                                                                                                            .touched
                                                                                                                            .dynamicFields &&
                                                                                                                            formik
                                                                                                                                .errors
                                                                                                                                .dynamicFields &&
                                                                                                                            formik
                                                                                                                                .errors
                                                                                                                                .dynamicFields[
                                                                                                                                index
                                                                                                                            ]
                                                                                                                                ?.requiredDocuments?.[
                                                                                                                                docIndex
                                                                                                                            ]
                                                                                                                                ?.selectedDocument && (
                                                                                                                                <div className="text-danger">
                                                                                                                                    {
                                                                                                                                        formik
                                                                                                                                            .errors
                                                                                                                                            .dynamicFields[
                                                                                                                                            index
                                                                                                                                        ]
                                                                                                                                            .requiredDocuments[
                                                                                                                                            docIndex
                                                                                                                                        ]
                                                                                                                                            .selectedDocument
                                                                                                                                    }
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                    </div>

                                                                                                                    {doc.canApply && (
                                                                                                                        <div className="col-sm-12">
                                                                                                                            <div className="mb-2">
                                                                                                                                <label
                                                                                                                                    htmlFor={`appliedFormSelect-${index}-${docIndex}`}
                                                                                                                                    className="form-label"
                                                                                                                                >
                                                                                                                                    {" "}
                                                                                                                                    Applied
                                                                                                                                    Service{" "}
                                                                                                                                </label>
                                                                                                                                <Form.Select
                                                                                                                                    id={`appliedFormSelect-${index}-${docIndex}`}
                                                                                                                                    value={
                                                                                                                                        doc.appliedService
                                                                                                                                    }
                                                                                                                                    onChange={(
                                                                                                                                        e
                                                                                                                                    ) =>
                                                                                                                                        handleAppliedFormChange(
                                                                                                                                            index,
                                                                                                                                            docIndex,
                                                                                                                                            e
                                                                                                                                                .target
                                                                                                                                                .value
                                                                                                                                        )
                                                                                                                                    }
                                                                                                                                    disabled={
                                                                                                                                        (!createPermission &&
                                                                                                                                            !editPermission) ||
                                                                                                                                        (serviceDataById &&
                                                                                                                                            !editPermission)
                                                                                                                                    }
                                                                                                                                >
                                                                                                                                    <option value="">
                                                                                                                                        {" "}
                                                                                                                                        Select
                                                                                                                                        Applied
                                                                                                                                        Service{" "}
                                                                                                                                    </option>
                                                                                                                                    {serviceList.map(
                                                                                                                                        (
                                                                                                                                            service
                                                                                                                                        ) => (
                                                                                                                                            <option
                                                                                                                                                key={
                                                                                                                                                    service.id
                                                                                                                                                }
                                                                                                                                                value={
                                                                                                                                                    service.slug
                                                                                                                                                }
                                                                                                                                                disabled={field.requiredDocuments.some(
                                                                                                                                                    (
                                                                                                                                                        d,
                                                                                                                                                        idx
                                                                                                                                                    ) =>
                                                                                                                                                        d.appliedService ===
                                                                                                                                                        service.id &&
                                                                                                                                                        idx !==
                                                                                                                                                        docIndex
                                                                                                                                                )}
                                                                                                                                            >
                                                                                                                                                {
                                                                                                                                                    service.serviceName
                                                                                                                                                }{" "}
                                                                                                                                                {`(${service.slug})`}{" "}
                                                                                                                                                {`(${service.currentVersion})`}
                                                                                                                                            </option>
                                                                                                                                        )
                                                                                                                                    )}
                                                                                                                                </Form.Select>
                                                                                                                                {formik
                                                                                                                                    .touched
                                                                                                                                    .dynamicFields &&
                                                                                                                                    formik
                                                                                                                                        .errors
                                                                                                                                        .dynamicFields &&
                                                                                                                                    formik
                                                                                                                                        .errors
                                                                                                                                        .dynamicFields[
                                                                                                                                        index
                                                                                                                                    ]
                                                                                                                                        ?.requiredDocuments?.[
                                                                                                                                        docIndex
                                                                                                                                    ]
                                                                                                                                        ?.appliedService && (
                                                                                                                                        <div className="text-danger">
                                                                                                                                            {
                                                                                                                                                formik
                                                                                                                                                    .errors
                                                                                                                                                    .dynamicFields[
                                                                                                                                                    index
                                                                                                                                                ]
                                                                                                                                                    .requiredDocuments[
                                                                                                                                                    docIndex
                                                                                                                                                ]
                                                                                                                                                    .appliedService
                                                                                                                                            }
                                                                                                                                        </div>
                                                                                                                                    )}
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    )}


                                                                                                                    <div className="card-footer  d-flex align-items-centr justify-content-between py-2">
                                                                                                                        {selectedDocument?.isRequired === "1" &&
                                                                                                                            (
                                                                                                                                <div className="form-check form-check-inline py-1">
                                                                                                                                    <input
                                                                                                                                        className="form-check-input"
                                                                                                                                        type="checkbox"
                                                                                                                                        id={`isRequired-${index}-${docIndex}`}
                                                                                                                                        checked={
                                                                                                                                            doc.isRequired
                                                                                                                                        }
                                                                                                                                        onChange={() =>
                                                                                                                                            handleCheckboxChange(
                                                                                                                                                index,
                                                                                                                                                docIndex,
                                                                                                                                                "isRequired"
                                                                                                                                            )
                                                                                                                                        }
                                                                                                                                        disabled={
                                                                                                                                            (!createPermission &&
                                                                                                                                                !editPermission) ||
                                                                                                                                            (serviceDataById &&
                                                                                                                                                !editPermission)
                                                                                                                                        }
                                                                                                                                    />
                                                                                                                                    <label
                                                                                                                                        className="form-check-label"
                                                                                                                                        htmlFor={`isRequired-${index}-${docIndex}`}
                                                                                                                                    >
                                                                                                                                        {" "}
                                                                                                                                        Is
                                                                                                                                        Required{" "}
                                                                                                                                    </label>
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        {((!serviceDataById &&
                                                                                                                            createPermission) ||
                                                                                                                            (serviceDataById &&
                                                                                                                                editPermission)) && (

                                                                                                                                <div className=" ms-auto">
                                                                                                                                    {docIndex !==
                                                                                                                                        0 && (
                                                                                                                                            <Button
                                                                                                                                            className="btn-sm " 
                                                                                                                                                variant="danger"
                                                                                                                                                onClick={() =>
                                                                                                                                                    handleRemoveDocumentField(
                                                                                                                                                        index,
                                                                                                                                                        docIndex
                                                                                                                                                    )
                                                                                                                                                }
                                                                                                                                            >
                                                                                                                                                <i className="ri-delete-bin-line"></i>
                                                                                                                                            </Button>
                                                                                                                                        )}
                                                                                                                                </div>

                                                                                                                            )}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )
                                                                                                    }
                                                                                                )}
                                                                                            </div>
                                                                                            {createPermission &&
                                                                                                editPermission && (
                                                                                                    <span
                                                                                                        className="btn btn-primary mt-sm-3 w-lg"
                                                                                                        onClick={() =>
                                                                                                            addDocumentField(
                                                                                                                index
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        Add
                                                                                                        More
                                                                                                        Documents
                                                                                                    </span>
                                                                                                )}
                                                                                        </>
                                                                                    )}

                                                                                {index ===
                                                                                    2 && (
                                                                                        <>
                                                                                            <div>
                                                                                                <div className="mb-3 row">
                                                                                                    <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                        <div className="mb-2 d-flex align-items-end">
                                                                                                            <div className="w-100">
                                                                                                                <label
                                                                                                                    htmlFor={`documentImage-${index}`}
                                                                                                                    className="form-label"
                                                                                                                >
                                                                                                                    {" "}
                                                                                                                    Select
                                                                                                                    Payment
                                                                                                                    Icon{" "}
                                                                                                                </label>
                                                                                                                <input
                                                                                                                    type="file"
                                                                                                                    id={`documentImage-${index}`}
                                                                                                                    accept="image/svg+xml"
                                                                                                                    onChange={(
                                                                                                                        e
                                                                                                                    ) =>
                                                                                                                        handleImageChange(
                                                                                                                            index,
                                                                                                                            e
                                                                                                                        )
                                                                                                                    }
                                                                                                                    className="form-control"
                                                                                                                    disabled={
                                                                                                                        (!createPermission &&
                                                                                                                            !editPermission) ||
                                                                                                                        (serviceDataById &&
                                                                                                                            !editPermission)
                                                                                                                    }
                                                                                                                />
                                                                                                            </div>
                                                                                                            {field.imageUrl && (
                                                                                                                <img
                                                                                                                    src={
                                                                                                                        field.imageUrl
                                                                                                                    }
                                                                                                                    className="ms-2 rounded-2"
                                                                                                                    alt="Payment Preview"
                                                                                                                    style={{
                                                                                                                        width: "40px",
                                                                                                                    }}
                                                                                                                />
                                                                                                            )}
                                                                                                        </div>
                                                                                                        {formik
                                                                                                            .touched
                                                                                                            .dynamicFields &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields[
                                                                                                            index
                                                                                                            ] &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .dynamicFields[
                                                                                                                index
                                                                                                            ]
                                                                                                                .imageUrl && (
                                                                                                                <div className="text-danger">
                                                                                                                    {
                                                                                                                        formik
                                                                                                                            .errors
                                                                                                                            .dynamicFields[
                                                                                                                            index
                                                                                                                        ]
                                                                                                                            .imageUrl
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                    </div>
                                                                                                    <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                        <label
                                                                                                            htmlFor={`titleInput-${index}`}
                                                                                                            className="form-label"
                                                                                                        >
                                                                                                            {" "}
                                                                                                            Title{" "}
                                                                                                        </label>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            id={`titleInput-${index}`}
                                                                                                            value={
                                                                                                                field.title
                                                                                                            }
                                                                                                            disabled
                                                                                                            className="form-control"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="mb-3 row">
                                                                                                    <div className="col-xxl-3 col-xl-4 col-lg-6 col-sm-12">
                                                                                                        <div className="mb-2 d-flex align-items-end">
                                                                                                            <div className="w-100">
                                                                                                                <label
                                                                                                                    htmlFor={`paymentMethod`}
                                                                                                                    className="form-label"
                                                                                                                >
                                                                                                                    {" "}
                                                                                                                    Select
                                                                                                                    Payment
                                                                                                                    Method
                                                                                                                </label>
                                                                                                                <div className="form-check mb-1 d-flex align-items-center">
                                                                                                                    <input
                                                                                                                        className="form-check-input"
                                                                                                                        type="radio"
                                                                                                                        value={formik.values.paymentMethod}
                                                                                                                        defaultChecked
                                                                                                                        onChange={() => { }}
                                                                                                                        disabled={
                                                                                                                            (!createPermission &&
                                                                                                                                !editPermission) ||
                                                                                                                            (serviceDataById &&
                                                                                                                                !editPermission)
                                                                                                                        }
                                                                                                                    />
                                                                                                                    <label className="form-check-label" >
                                                                                                                        {" "} <span className="mx-2"> Gov Pay</span>

                                                                                                                        <img src={StripeLogo} className="" alt="Stripe Icon" style={{ width: "33px", }} />
                                                                                                                    </label>
                                                                                                                </div>
                                                                                                            </div>

                                                                                                        </div>
                                                                                                        {formik
                                                                                                            .touched
                                                                                                            .paymentMethod &&
                                                                                                            formik
                                                                                                                .errors
                                                                                                                .paymentMethod && (
                                                                                                                <div className="text-danger error ">
                                                                                                                    {
                                                                                                                        formik
                                                                                                                            .errors
                                                                                                                            .paymentMethod
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                    </div>

                                                                                                </div>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                            </div>
                                                                        </Tab>
                                                                    )
                                                                )}
                                                            </Tabs>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card border-0 mt-4 mb-0">
                                            <div className="card-body p-4">
                                                <h4>
                                                    Service Prerequisite
                                                </h4>
                                                <div className="row">
                                                    <div className="col-12 mb-0 mb-sm-3">
                                                        <CKEditorModel
                                                            data={
                                                                formik
                                                                    .values
                                                                    .servicePrerequisiteData
                                                            }
                                                            onChange={(
                                                                event,
                                                                editorData
                                                            ) =>
                                                                formik.setFieldValue(
                                                                    "servicePrerequisiteData",
                                                                    editorData
                                                                )
                                                            }
                                                        />
                                                        {formik.errors
                                                            .servicePrerequisiteData && (
                                                                <div className="text-danger error ">
                                                                    {
                                                                        formik
                                                                            .errors
                                                                            .servicePrerequisiteData
                                                                    }
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card border-0 mt-4 mb-0">
                                            <div className="card-body p-4">
                                                <h4>
                                                    Service Instructions
                                                </h4>
                                                <div className="row">
                                                    <div className="col-12 mb-0 mb-sm-3">
                                                        <CKEditorModel
                                                            data={
                                                                formik.values.serviceInstructionsData
                                                            }
                                                            onChange={(
                                                                event,
                                                                editorData
                                                            ) =>
                                                                formik.setFieldValue(
                                                                    "serviceInstructionsData",
                                                                    editorData
                                                                )
                                                            }
                                                        />
                                                        {formik.errors.serviceInstructionsData && (
                                                            <div className="text-danger error ">
                                                                {
                                                                    formik.errors.serviceInstructionsData
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card border-0 mt-4 mb-0">
                                            <div className="card-body p-4">
                                                <h4>
                                                    Meeting Instructions
                                                </h4>
                                                <div className="row">
                                                    <div className="col-12 mb-0 mb-sm-3">
                                                        <CKEditorModel
                                                            data={
                                                                formik.values.meetingInstructionData
                                                            }
                                                            onChange={(
                                                                event,
                                                                editorData
                                                            ) =>
                                                                formik.setFieldValue(
                                                                    "meetingInstructionData",
                                                                    editorData
                                                                )
                                                            }
                                                        />
                                                        {formik.errors.meetingInstructionData && (
                                                            <div className="text-danger error ">
                                                                {
                                                                    formik.errors.meetingInstructionData
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {formdata?.length > 0 && (
                                            <div className="card border-0 mt-4 mb-0">
                                                <div className="card-body p-4">
                                                    <h3>
                                                        Service Certificate
                                                        Editor
                                                    </h3>
                                                    <div className="row">
                                                        <div className="col-12 mb-0 mb-sm-3">
                                                            <CKEditorModelTemplate
                                                                data={
                                                                    formik
                                                                        .values
                                                                        .certificateTemplate
                                                                }
                                                                onChange={(
                                                                    event,
                                                                    editorData
                                                                ) =>
                                                                    formik.setFieldValue(
                                                                        "certificateTemplate",
                                                                        editorData
                                                                    )
                                                                }
                                                            />
                                                            <h6 className="mt-2">
                                                                {" "}
                                                                Note: Copy the
                                                                value from below
                                                                List and paste
                                                                between @@{" "}
                                                                <strong>
                                                                    {" "}
                                                                    value{" "}
                                                                </strong>{" "}
                                                                @@.{" "}
                                                            </h6>
                                                            {formik.errors
                                                                .certificateTemplate && (
                                                                    <div className="text-danger error ">
                                                                        {
                                                                            formik
                                                                                .errors
                                                                                .certificateTemplate
                                                                        }
                                                                    </div>
                                                                )}
                                                            {selectedDepartment && (
                                                                <Button
                                                                    className="my-3"
                                                                    onClick={() =>
                                                                        previewShowToggle()
                                                                    }
                                                                >
                                                                    Preview
                                                                    Service
                                                                    Template
                                                                </Button>
                                                            )}
                                                            <>
                                                                {formdata?.length >
                                                                    0 && (
                                                                        <div className="mt-5">
                                                                            {/* Search Input */}
                                                                            <InputGroup className="mb-3">
                                                                                <Input
                                                                                    placeholder="Search by label"
                                                                                    value={
                                                                                        searchQuery
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setSearchQuery(
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </InputGroup>

                                                                            <div className="row">
                                                                                {filteredData?.map(
                                                                                    (
                                                                                        form,
                                                                                        index
                                                                                    ) => (
                                                                                        <div className="col-md-4 col-sm-6">
                                                                                            <div
                                                                                                key={
                                                                                                    index
                                                                                                }
                                                                                                className="my-2 my-sm-3"
                                                                                            >
                                                                                                <label className="mb-0 fs-14 fw-bold text-black pe-2 text-break">
                                                                                                    {
                                                                                                        form.label
                                                                                                    }
                                                                                                </label>
                                                                                                <div className="mb-2 mt-1 fs-14 text-black d-flex align-items-center">
                                                                                                    <span>
                                                                                                        {
                                                                                                            form.name
                                                                                                        }
                                                                                                    </span>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="p-0 border-0 ms-2 bg-transparent lh-0"
                                                                                                        onClick={() =>
                                                                                                            copyToClipboard(
                                                                                                                form.name,
                                                                                                                index
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        {copiedIndex ===
                                                                                                            index ? (
                                                                                                            <FaRegCopy color="#f99f1e" />
                                                                                                        ) : (
                                                                                                            <FaRegCopy
                                                                                                                color="gray"
                                                                                                                title="Copy"
                                                                                                            />
                                                                                                        )}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="card-footer p-4">
                                            {(createPermission ||
                                                editPermission) && (
                                                    <div
                                                        className="modal-footer"
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "flex-end",
                                                        }}
                                                    >
                                                        <Button
                                                            className=" btn btn-primary "
                                                            type="submit"
                                                            disabled={loading}
                                                            onClick={() =>
                                                                formik.validateForm()
                                                            }
                                                        >
                                                            {" "}
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
                                                                <span className="fs-13">
                                                                    {" "}
                                                                    Submit{" "}
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PreviewTemplateModel
                show={previewshow}
                setShow={setPreviewShow}
                handleToggle={previewShowToggle}
                data={formik.values}
                selectedDepartment={selectedDepartment}
            />
        </>
    );
};

export default ServiceModal;
