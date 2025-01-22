import React, { useEffect, useState } from "react";
import { Button, Offcanvas, Spinner, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { hasAssignPermission } from "../../CommonFunctions/common";
import useAxios from "../../../utils/hook/useAxios";

const CreateNewTicketModal = ({
    openModel,
    handleCloseModel,
    userData,
    getTicketData,
    customerId,
    ticketPermissions
}) => {
    
    const axiosInstance = useAxios()
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    let userDepartmentId = userDecryptData?.data?.departmentId
    userDepartmentId= parseInt(userDepartmentId)
    let isCoreTeam = userDecryptData?.data?.isCoreTeam;
    const coreTeam = isCoreTeam === "0"
    
    const [departmentList, setDepartmentList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [filteredServiceList, setFilteredServiceList] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [loading, setLoading] = useState(false);
    const [filteredUserData, setFilteredUserData] = useState([]);
    const [selectDepartment, setSelectedDepartment] = useState(false);

    const assignPermission = ticketPermissions
        ? hasAssignPermission(ticketPermissions)
        : false;

    const validationSchema = Yup.object().shape({
        title: Yup.string().required("Please enter the Title."),
        discription: Yup.string().required("Please enter the Description."),
        department: Yup.string().required("Please select the Department."),
        serviceSlug: Yup.string().required("Please select service"),
        assignTo:assignPermission? Yup.string().required("Please select the Assign To."):Yup.string(),
        priority: Yup.string().required("Please select the Priority."),
        documentFile: Yup.mixed()
            .nullable()
            .required("Please select the Document.")
            .test(
                "fileType",
                "Only JPEG, PNG, and JPG image is allowed.",
                (value) => {
                    if (!value) {
                        return true;
                    }

                    const isFile = value instanceof File;
                    if (!isFile) {
                        return true;
                    }
                    if (value) {
                        const supportedFormats = ["jpeg", "png", "jpg"];
                        return supportedFormats.includes(
                            value.name.split(".").pop()
                        );
                    }
                    return true;
                }
            )
            .test(
                "fileSize",
                "File size should be less than 2 MB.",
                (value) => {
                    const maxFileSize = 2 * 1024 * 1024;
                    if (!value) {
                        return true;
                    }

                    const isFile = value instanceof File;
                    if (!isFile) {
                        return true;
                    }

                    return value.size <= maxFileSize;
                }
            ),
    });

    const formik = useFormik({
        initialValues: {
            title: "",
            discription: "",
            department: "",
            serviceSlug: "",
            assignTo: "",
            priority: "",
            documentFile: "",
        },        
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            let documentId;
            setLoading(true);
            if (selectedFile) {
                const formData = new FormData();
                formData.append(
                    "viewDocumentName",
                    `ticket_${values?.title.slice(0, 5)}`
                );
                formData.append("documentFile", values?.documentFile);
                formData.append("userId", values?.assignTo);
                formData.append("isGenerated", "0");
                formData.append("isShowInDocument", "0");
                let fileResponse = await axiosInstance.post(
                    "documentService/uploading",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                documentId = fileResponse?.data?.data
                    ? fileResponse?.data?.data?.[0]?.id
                    : null;
            }
            let responseCreateTicket = await axiosInstance.post(
                `ticketService/ticket/create`,
                {
                    ...values,
                    serviceSlug: values.serviceSlug,
                    documentId: documentId,
                    assignTo: values.assignTo,
                    priority: values.priority,
                    departmentId: values.department,
                    userId: userDecryptData?.data?.id,
                    customerId: customerId ? customerId : null,
                    documentFile: undefined,
                    service: undefined,
                    department: undefined,
                    ticketPermissions: ticketPermissions
                }
            );
            if (responseCreateTicket) {
                toast.success("Ticket added successfully.");
                setLoading(false);
            } else {
                toast.error(
                    "Something went wrong. Please check info and try again"
                );
            }
            setLoading(false);
            formik.resetForm();
            handleCloseModel();
            getTicketData();
        },
    });

    const fetchDepartmentsList = async () => {
        try {
            const response = await axiosInstance.post(
                "serviceManagement/department/view",
                {}
            );
            if (response) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
               
                if (coreTeam) {
                    const { id } = rows.find(
                        (dept) => dept.id === userDepartmentId
                    );
                    formik.setFieldValue("department", id);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchServiceList = async () => {
        try {
            const response = await axiosInstance.post(
                "serviceManagement/service/list",
                {}
            );
            if (response) {
                const { rows } = response?.data?.data;
                setServiceList(rows);
                if(coreTeam){
                    setSelectedDepartment(true);
                    const filteredServices = rows.filter(
                        (service) => service.departmentId == coreTeam
                    );
                    setFilteredServiceList(filteredServices);
                    const filteredUsers = userData.filter(
                        (user) => user.departmentId == coreTeam
                    );
                    setFilteredUserData(filteredUsers);
                    if (filteredUsers.length === 0) {
                        formik.setFieldValue("assignTo", "");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching service list", error);
        }
    };

    useEffect(() => {
        fetchDepartmentsList();
        fetchServiceList();
    }, []);

    const handleDepartmentChange = (e) => {
        const selectedDepartmentId = e.target.value;
        formik.setFieldValue("department", selectedDepartmentId);
        formik.setFieldValue("serviceSlug", "");
        formik.setFieldValue("assignTo", "");
    
        formik.setFieldTouched("department", false);
        formik.setFieldTouched("serviceSlug", false);
    
        setSelectedDepartment(true);
        const filteredServices = serviceList.filter(
            (service) => service.departmentId == selectedDepartmentId
        );
        setFilteredServiceList(filteredServices);
    
        const filteredUsers = userData.filter((user) => {
            if(!user.departmentId) return false;
            const departmentIds = user?.departmentId?.includes(',')
                ? user.departmentId.split(',').map(id => id.trim())
                : [user.departmentId?.trim()];
            return departmentIds.includes(selectedDepartmentId.toString());
        });        
        setFilteredUserData(filteredUsers);
    };
    

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
    
        const allowedFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        const fileSizeLimit = 2 * 1024 * 1024;
    
        if (!allowedFormats.includes(selectedFile.type)) {
            formik.setFieldError("documentFile", "Please select a valid image file (JPEG, JPG, PNG, or WEBP).");
            event.target.value = null;
            return;
        }
    
        if (selectedFile.size > fileSizeLimit) {
            formik.setFieldError("documentFile", "Please select an image file that is less than 2MB.");
            event.target.value = null;
            return;
        }
    
        formik.setFieldValue("documentFile", selectedFile);
        setSelectedFile(selectedFile);
        formik.setFieldError("documentFile", "");
    };

    const handleSelectPriority = (event) => {
        const value = event.target.value;
        formik.setFieldValue("priority", value)
    };

    const departmentOptions =
        departmentList &&
        departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }));

    const serviceOptions =
        filteredServiceList &&
        filteredServiceList.map((service) => ({
            value: service.slug,
            label: service.serviceName,
        }));

    const userOptions =
        filteredUserData &&
        filteredUserData.map((user) => ({
            value: user.id,
            label: user.name,
        }));

    const priorityOptions = [
        { value: "0", label: "High" },
        { value: "1", label: "Medium" },
        { value: "2", label: "Low" },
    ];

    return (
        <Offcanvas show={openModel} placement="end" onHide={handleCloseModel}>
            <div className="bg-white p-4">
                <SimpleBar className="bg-light vh-100 p-3 p-sm-4" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'auto' }}>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="modal-header pb-4">
                            <h4 className="modal-title" id="exampleModalgridLabel"> Create a new ticket </h4>
                            <div className="d-flex justify-content-end align-items-center">
                                <span onClick={handleCloseModel} className="btn btn-sm btn-primary"> <i className="ri-close-line me-1 align-middle"></i>{" "} Cancel </span>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label
                                        htmlFor="title-field"
                                        className="form-label">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Title"
                                        name="title"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.title &&
                                        formik.errors.title ? (
                                        <div className="text-danger">
                                            {formik.errors.title}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label
                                        htmlFor="description-field"
                                        className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Enter Description"
                                        rows={5}
                                        name="discription"
                                        value={formik.values.discription}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        style={{ resize: 'vertical', overflowY: 'auto' }}
                                    />
                                    {formik.touched.discription &&
                                        formik.errors.discription ? (
                                        <div className="text-danger">
                                            {formik.errors.discription}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label htmlFor="department-field" className="form-label"> Department </label>
                                    <Select aria-label="Select Department" name="department"
                                        value={departmentOptions.find((option) => option.value === formik.values.department)}
                                        onChange={(selectedOption) => handleDepartmentChange({ target: { name: "department", value: selectedOption.value, }, })}
                                        onBlur={formik.handleBlur}
                                        options={departmentOptions}
                                        placeholder="Select Department"
                                        isSearchable={true}
                                        styles={{
                                            control: (provided) => ({ ...provided, cursor: "pointer", }),
                                            menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                            option: (provided) => ({ ...provided, cursor: "pointer", }),
                                        }}
                                        isDisabled={isCoreTeam === "0"}
                                    />
                                    {formik.touched.department &&
                                        formik.errors.department ? (
                                        <div className="text-danger">
                                            {formik.errors.department}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            {selectDepartment ? (
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <label htmlFor="service-field" className="form-label"> Service </label>
                                        <Select aria-label="Select Service" name="service"
                                            value={formik.values.serviceSlug ? serviceOptions.find((option) => option.value === formik.values.serviceSlug) : null}
                                            onChange={(selectedOption) => formik.setFieldValue("serviceSlug", selectedOption ? selectedOption.value : "")}
                                            onBlur={formik.handleBlur}
                                            options={serviceOptions}
                                            placeholder="Select Service"
                                            isSearchable={true}
                                            // isDisabled={filteredServiceList.length === 0}
                                            styles={{
                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                            }}
                                        />
                                        {formik.touched.serviceSlug &&
                                            formik.errors.serviceSlug ? (
                                            <div className="text-danger">
                                                {formik.errors.serviceSlug}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                            {(selectDepartment && assignPermission) && (
                                <div className="col-lg-12 mb-3">
                                    <div>
                                        <label htmlFor="assignTo-field" className="form-label"> Assign To </label>
                                        <Select
                                            aria-label="Select Assign To"
                                            name="assignTo"
                                            value={formik.values.assignTo ? userOptions.find((option) => option.value === formik.values.assignTo) : null}
                                            onChange={(selectedOption) => formik.setFieldValue("assignTo", selectedOption ? selectedOption.value : "")}
                                            onBlur={formik.handleBlur}
                                            options={userOptions}
                                            placeholder="Select Assign To User"
                                            isSearchable={true}
                                            styles={{
                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                            }}
                                        />
                                        {formik.touched.assignTo &&
                                            formik.errors.assignTo ? (
                                            <div className="text-danger">
                                                {formik.errors.assignTo}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                            <div className="col-lg-12 mb-3">
                                <div>
                                    <label htmlFor="priority-field" className="form-label"> Priority </label>
                                 
                                    <Select aria-label="Select Priority" name="priority"
                                        value={priorityOptions.find( (option) => option.value === formik.values.priority )}
                                        onChange={(selectedOption) => handleSelectPriority({ target: { value: selectedOption ? selectedOption.value : "", }, }) }
                                        onBlur={formik.handleBlur}
                                        options={priorityOptions}
                                        styles={{
                                            control: (provided) => ({ ...provided, cursor: "pointer", }),
                                            menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                            option: (provided) => ({ ...provided, cursor: "pointer", }),
                                        }}
                                    />
                                    {formik.touched.priority &&
                                        formik.errors.priority ? (
                                        <div className="text-danger">
                                            {formik.errors.priority}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-3">
                                <div className="file-upload">
                                    <label
                                        htmlFor="file-upload-input"
                                        className="form-label">
                                        Upload Image / Document
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={(event) =>
                                            handleFileChange(event)
                                        }
                                    />
                                    {formik.errors.documentFile && (
                                        <div className="text-danger">
                                            {formik.errors.documentFile}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                    <Spinner animation="border" size="sm" /> <span className=""> Submitting... </span>
                                    </>
                            ) : (
                                <span className=""> Submit </span>
                            )}
                            </Button>
                        </div>
                    </form>

                </SimpleBar>
            </div>
        </Offcanvas>
    );
};

export default CreateNewTicketModal;
