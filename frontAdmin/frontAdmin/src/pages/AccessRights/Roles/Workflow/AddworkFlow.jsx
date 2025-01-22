import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import ScrollToTop from "../../../../common/ScrollToTop/ScrollToTop";
import {
    Container,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    Row,
    Col,
    Card,
    CardBody,
    CardFooter,
} from "reactstrap";
import { Button } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import {
    hasCreatePermission,
    hasEditPermission,
} from "../../../../common/CommonFunctions/common";
import useAxios from "../../../../utils/hook/useAxios";
import { IoChevronBack } from "react-icons/io5";

const AddWorkflow = () => {
    const axiosInstance = useAxios()
    const userEncryptData = localStorage.getItem("userData");
    const navigate = useNavigate();
    const location = useLocation();
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const workflowID = location?.state;
    const [previouslyAddedServiceId, setpreviouslyAddedServiceId] = useState([]);
    const [intValue, setIntValue] = useState({
        workflowName: "",
        userId: userData?.id,
        workflowFor: "",
        workflow: [
            {
                departmentId:
                    userData?.isCoreTeam === "0" ? userData?.departmentId : "",
                workflowMethod: "",
                TAT: "",
                roleId: null,
                selectedUser: [],
                serviceListApproval: [],
                isDirectApproval: "",
            },
        ],
    });
    const [departments, setDepartments] = useState([]);
    const [services, setServices] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const [roleLists, setRoleLists] = useState([]);
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const EventPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "workflow"
        );
    const createPermission = EventPermissions
        ? hasCreatePermission(EventPermissions)
        : false;
    const editPermission = EventPermissions
        ? hasEditPermission(EventPermissions)
        : false;
    const getDepartmentList = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );

            if (response?.data) {
                const { rows } = response?.data?.data;
                setDepartments(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const getServiceList = async (departmentId, index) => {
        try {
            const serviceResponse = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    departmentId: departmentId,
                }
            );

            if (serviceResponse?.data) {
                const { rows: serviceRows } = serviceResponse?.data?.data;
                setServices((prev) => {
                    const newServiceLists = [...prev];
                    newServiceLists[index] = serviceRows;
                    return newServiceLists;
                });
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchDeptUserList = async (departmentId, index) => {
        try {
            const response = await axiosInstance.post(`userService/user/view`, {
                departmentId: departmentId,
                isSupportTeam: "0",
            });

            if (response?.data) {
                const { rows } = response?.data?.data;
                setUserLists((prev) => {
                    const newUserLists = [...prev];
                    newUserLists[index] = rows;
                    return newUserLists;
                });
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchRoleList = async (departmentId, index) => {
        try {
            const response = await axiosInstance.post(`userService/roles/view`, {
                departmentId: departmentId,
            });

            if (response?.data) {
                const { rows } = response?.data?.data;
                setRoleLists((prev) => {
                    const newRoleLists = [...prev];
                    newRoleLists[index] = rows;
                    return newRoleLists;
                });
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        getDepartmentList();
    }, []);
    const getpreviouslyAddedServiceId = async (departmentId, workflowFor, workflowId) => {
        if (departmentId && workflowFor) {
            try {
                const addedServices = await axiosInstance.post(
                    `userService/workflow/addedServices`,
                    { departmentId: departmentId, workflowFor: workflowFor, workflowId: workflowId ? workflowId : null }
                );
                if (addedServices) {
                    const { serviceIds } = addedServices.data.data;
                    setpreviouslyAddedServiceId(serviceIds);
                }
            } catch (error) {
                console.error(error);
            }
        }

    };

    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            getServiceList(userData?.departmentId, 0);
        }
    }, []);


    const validationSchema = Yup.object().shape({
        workflowName: Yup.string().required("Please enter workflowName"),
        workflowFor: Yup.string().required("Please select workflowFor"),
        userId: Yup.number().nullable().required("Please enter userId"),
        workflow: Yup.array().of(
            Yup.lazy((value, options) => {
                const { workflowMethod } = value;
                if (workflowMethod === "role") {
                    return Yup.object().shape({
                        departmentId: Yup.number()
                            .nullable()
                            .required("Please select deparment"),
                            TAT: Yup.number()
                            .nullable()
                            .required("Please enter turnaround time (TAT)")
                            .min(0, "TAT cannot be less than 0"), 
                        workflowMethod: Yup.string().required(
                            "Please select workflowMethod"
                        ),
                        roleId: Yup.number().required("Please select role"),
                        // selectedUser: Yup.array().of(Yup.number().nullable()),
                        serviceListApproval: Yup.array()
                            .of(Yup.string().required("Please select service"))
                            .min(1, "Please select at least one service"),
                        isDirectApproval: Yup.string().required("Please select approval"),
                    });
                } else if (workflowMethod === "agent") {
                    return Yup.object().shape({
                        departmentId: Yup.number()
                            .nullable()
                            .required("Please select deparment"),
                            TAT: Yup.number()
                            .nullable()
                            .required("Please enter turnaround time (TAT)")
                            .min(0, "TAT cannot be less than 0"),
                        workflowMethod: Yup.string().required(
                            "Please select workflowMethod"
                        ),
                        selectedUser: Yup.array()
                            .of(Yup.number().required("Please select user"))
                            .min(1, "Please select at least one user"),
                        serviceListApproval: Yup.array()
                            .of(Yup.string().required("Please select service"))
                            .min(1, "Please select at least one service"),
                        isDirectApproval: Yup.string().required("Please select approval"),
                    });
                } else {
                    return Yup.object().shape({
                        departmentId: Yup.number()
                            .nullable()
                            .required("Please select deparment"),
                            TAT: Yup.number()
                            .nullable()
                            .required("Please enter turnaround time (TAT)")
                            .min(0, "TAT cannot be less than 0"),
                        workflowMethod: Yup.string().required(
                            "Please select workflowMethod"
                        ),
                        roleId: Yup.number().required("Please select role"),
                        selectedUser: Yup.array().of(Yup.number().nullable()),
                        serviceListApproval: Yup.array()
                            .of(Yup.string().required("Please select service"))
                            .min(1, "Please select at least one service"),
                        isDirectApproval: Yup.string().required("Please select approval"),
                    });
                }
            })
        ),
    });

    const formik = useFormik({
        initialValues: intValue,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (workflowID) {
                await updateWorkflowApi(values);
            } else {
                await createWorkflowApi(values);
            }
        },
    });
    useEffect(() => {
        if (formik.values.workflowFor && formik.values?.workflow[0]?.departmentId && !intValue?.id) {
            getpreviouslyAddedServiceId(formik.values?.workflow[0]?.departmentId, formik.values?.workflowFor);
        }
        if (formik.values.workflowFor && formik.values?.workflow[0]?.departmentId && intValue?.id) {
            getpreviouslyAddedServiceId(formik.values?.workflow[0]?.departmentId, formik.values?.workflowFor, intValue?.id);

        }
    }, [formik.values.workflowFor, formik.values?.workflow[0]?.departmentId, intValue])

    const handleInputChange = async (index, field, value) => {
        // const updatedWorkflows = formik.values.workflow.map((workflow, i) =>
        //   i === index ? { ...workflow, [field]: value } : workflow
        // );
        const updatedWorkflows = formik.values.workflow.map((workflow, i) => {
            if (i === index) {
                if (field === "departmentId") {
                    return {
                        ...workflow,
                        [field]: value,
                        workflowMethod: "",
                        roleId: null,
                        TAT: "",
                        serviceListApproval: [],
                        selectedUser: [],
                    };
                } else {
                    return { ...workflow, [field]: value };
                }
            } else {
                return workflow;
            }
        });
        formik.setFieldValue("workflow", updatedWorkflows);

        if (field === "departmentId") {
            await getServiceList(value, index);
        } else if (field === "workflowMethod") {
            const departmentId = formik.values.workflow[index].departmentId;
            if (value === "role") {
                await fetchRoleList(departmentId, index);
            } else if (value === "agent") {
                await fetchDeptUserList(departmentId, index);
            }
        }
    };

    const addWorkflow = (index) => {
        if (index + 1 === formik?.values?.workflow?.length) {
            formik.setFieldValue("workflow", [
                ...formik.values.workflow,
                {
                    departmentId:
                        userData?.isCoreTeam === "0" ? userData?.departmentId : "",
                    TAT: "",
                    workflowMethod: "",
                    roleId: null,
                    selectedUser: [],
                    serviceListApproval: [],
                    isDirectApproval: "",
                },
            ]);
            setUserLists([...userLists, []]);
            setRoleLists([...roleLists, []]);
        }
    };
    const createWorkflowApi = async (values) => {
        try {
            const response = await axiosInstance.post(`userService/workflow/create`, {
                ...values,
            });

            if (response?.data) {
                toast.success("Workflow added successfully.");
                navigate("/workflow");
            }
        } catch (error) {
            console.error(error.message);
            toast.error("Something went worng while adding workflow.");
        }
    };

    const updateWorkflowApi = async (values) => {
        try {
            const response = await axiosInstance.put(`userService/workflow/update`, {
                workflowId: workflowID,
                ...values,
            });

            if (response?.data) {
                toast.success("Workflow updated successfully.");
                navigate("/workflow");
            }
        } catch (error) {
            console.error(error.message);
            toast.error("Something went worng while updatings workflow.");
        }
    };
    const getWorkflowApi = async () => {
        try {
            const response = await axiosInstance.post(`userService/workflow/view`, {
                workflowId: workflowID,
            });

            if (response?.data) {
                const fetchedWorkflowData = response.data.data;
                setIntValue({
                    id: fetchedWorkflowData?.id,
                    workflowName: fetchedWorkflowData?.workflowName || "",
                    userId: fetchedWorkflowData?.userId || userData?.id,
                    workflowFor: fetchedWorkflowData?.workflowFor || "",
                    workflow: fetchedWorkflowData?.workflow || intValue.workflow,
                });
                if (fetchedWorkflowData) {
                    fetchedWorkflowData?.workflow?.forEach(async (wf, index) => {
                        if (index === 0) {
                            try {
                                const addedServices = await axiosInstance.post(
                                    `userService/workflow/addedServices`,
                                    {
                                        departmentId: wf.departmentId,
                                        workflowId: wf.workflowId,
                                        workflowFor: fetchedWorkflowData?.workflowFor
                                    }
                                );
                                if (addedServices) {
                                    const { serviceIds } = addedServices.data.data;
                                    setpreviouslyAddedServiceId(serviceIds);
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        }
                        if (wf.departmentId) {
                            await fetchDeptUserList(wf.departmentId, index);
                            await fetchRoleList(wf.departmentId, index);
                            await getServiceList(wf.departmentId, index);
                        }
                    });
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (workflowID) {
            getWorkflowApi();
        }
    }, [workflowID]);

    const removeWorkflow = (index) => {
        if (formik.values.workflow.length > 1 && index >= 0) {
            const updatedWorkflows = [...formik.values.workflow];
            updatedWorkflows.splice(index + 1);
            formik.setFieldValue("workflow", updatedWorkflows);

            const updatedUserLists = [...userLists];
            updatedUserLists.splice(index + 1);
            setUserLists(updatedUserLists);

            const updatedRoleLists = [...roleLists];
            updatedRoleLists.splice(index + 1);
            setRoleLists(updatedRoleLists);
        }
    };

    const handleSelectChange = (selectedOption, index) => {
        const updatedWorkflows = formik.values.workflow.map((workflow, i) =>
            i === index
                ? { ...workflow, serviceListApproval: selectedOption }
                : workflow
        );
        formik.setFieldValue("workflow", updatedWorkflows);
    };
    const handleDirectApproval = (index, field, value) => {
        const updatedWorkflows = formik.values.workflow.map((workflow, i) =>
            i === index ? { ...workflow, [field]: value } : workflow
        );

        formik.setFieldValue("workflow", updatedWorkflows);
        if (value === "0") {
            addWorkflow(index);
        }
        if (value === "1") {
            removeWorkflow(index);
        }
    };

    const departmentOptions = departments.map((deparment) => ({
        value: deparment.id,
        label: deparment.departmentName,
    }));

    const workflowMethodOptions = [
        {
            value: "role",
            label: "By Role",
        },
        {
            value: "agent",
            label: "By Agent",
        },
    ];
    const workflowForOptions = [
        {
            value: "0",
            label: "Service",
        },
        {
            value: "1",
            label: "Ticket",
        },
    ];

    // const directApprovalOptions = [
    //   { value: "1", label: "Yes" },
    //   { value: "0", label: "No" },
    // ];

    const roleOptions = (index) =>
        roleLists[index]?.map((role) => ({
            value: role.id,
            label: role.roleName,
        })) || [];

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content services">
                    <div className="page-content">
                        <Container fluid>
                            <div className="col-12">
                                <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                    <h4 className="mb-sm-0">
                                        Workflow
                                    </h4>
                                    <div className="page-title-right">
                                        <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                    </div>
                                    <div>
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
                            </div>
                            <form onSubmit={formik.handleSubmit}>
                                <Card>
                                    <CardBody className="work-flow-bg">
                                        <SimpleBar
                                            style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto" }}
                                        >
                                            <div className="col-sm-12 col-md-6 col-lg-4 col-xxl-3 py-4 mx-auto">
                                                <div className="approvals">

                                                    <div className="form-body">
                                                        <div className="flow_form">
                                                            <div className="form-group ">
                                                                <div className="user_fill text-center">
                                                                    <div className="z-1 btn btn-success pe-none px-5  fs-15 rounded-pill fw-semibold position-relative">
                                                                        Initiation
                                                                    </div>
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="form-group">
                                                                <div className="card mb-0">
                                                                    <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                        {/* bg-light */}
                                                                        <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                        <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                            {" "}
                                                                            Workflow Name
                                                                        </h4>
                                                                        <div className=" flex-shrink-0 "></div>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <div className="user_fill ">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="Enter Workflow Name"
                                                                                name="workflowName"
                                                                                value={formik.values.workflowName}
                                                                                onChange={formik.handleChange}
                                                                            />
                                                                            {formik.touched.workflowName &&
                                                                                formik.errors.workflowName && (
                                                                                    <div className="error-message text-danger">
                                                                                        {formik.errors.workflowName}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="arrow_line">
                                                                    <span></span>
                                                                </div>
                                                                <div className="card  mb-0">
                                                                    <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                        {/* bg-light */}
                                                                        <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                        <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                            {" "}
                                                                            <Label className="mb-0">
                                                                                {" "}
                                                                                Select Workflow For{" "}
                                                                                <span
                                                                                    aria-required="true"
                                                                                    className="required d-inline"
                                                                                >
                                                                                    {" "}
                                                                                    *{" "}
                                                                                </span>{" "}
                                                                            </Label>
                                                                        </h4>
                                                                        <div className=" flex-shrink-0 "></div>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <FormGroup className="form-md-line-input">
                                                                            <div className="clearfix"></div>
                                                                            <div className="input_box text-start">
                                                                                <Select
                                                                                    className="bg-white text-start"
                                                                                    options={workflowForOptions}
                                                                                    onBlur={formik.handleBlur}
                                                                                    value={workflowForOptions.find(
                                                                                        (option) =>
                                                                                            option.value ===
                                                                                            formik.values.workflowFor
                                                                                    )}
                                                                                    onChange={
                                                                                        (selectedOption) =>
                                                                                            formik.setFieldValue(
                                                                                                "workflowFor",
                                                                                                selectedOption.value
                                                                                            )
                                                                                    }
                                                                                    placeholder="Select Method*"
                                                                                    name="workflowFor"
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
                                                                                {formik.touched.workflowFor &&
                                                                                    formik.errors.workflowFor && (
                                                                                        <div className="error-message text-danger">
                                                                                            {formik.errors.workflowFor}
                                                                                        </div>
                                                                                    )}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {formik.values.workflow.map((workflow, index) => (

                                                    <div
                                                        className="live-preview"
                                                        id="general"
                                                        key={index}
                                                    >
                                                        <div className="arrow_line">
                                                            <span></span>
                                                        </div>
                                                        <div className="form-group ">
                                                            <div className="user_fill text-center">
                                                                <div className="z-1 btn btn-success pe-none px-5  fs-15 rounded-pill fw-semibold position-relative">
                                                                    {`Workflow Configuration - Part ${index + 1}`}
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className="approvals">
                                                            <div className="form-body">
                                                                <div className="flow_form">
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                    <div className="card mb-0">
                                                                        <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                            {/* bg-light */}
                                                                            <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                            <h4 className="flex-grow-1 card-title mb-0 align-items-center d-flex ">
                                                                                {" "}
                                                                                <Label className="mb-0">
                                                                                    {" "}
                                                                                    {userData?.isCoreTeam === "0"
                                                                                        ? "Department"
                                                                                        : "Select Department"}{" "}
                                                                                    <span
                                                                                        aria-required="true"
                                                                                        className="required d-inline"
                                                                                    >
                                                                                        {" "}
                                                                                        *{" "}
                                                                                    </span>{" "}
                                                                                </Label>
                                                                            </h4>
                                                                            <div className=" flex-shrink-0 "></div>
                                                                        </div>
                                                                        <div className="card-body p-4">
                                                                            <FormGroup className="form-md-line-input mb-0">
                                                                                <div className="clearfix"></div>
                                                                                <div className="input_box text-start">
                                                                                    <Select
                                                                                        className="bg-white text-start"
                                                                                        options={departmentOptions}
                                                                                        onChange={(value) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "departmentId",
                                                                                                value.value
                                                                                            )
                                                                                        }
                                                                                        onBlur={formik.handleBlur}
                                                                                        value={departmentOptions.find(
                                                                                            (option) =>
                                                                                                option.value ===
                                                                                                formik?.values?.workflow[index]
                                                                                                    ?.departmentId
                                                                                        )}
                                                                                        placeholder="Select Department*"
                                                                                        name={`workflow.${index}.departmentId`}
                                                                                        isDisabled={
                                                                                            index === 0
                                                                                                ? userData?.isCoreTeam === "0"
                                                                                                : false
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
                                                                                    {formik.touched.workflow?.[index]
                                                                                        ?.departmentId &&
                                                                                        formik.errors.workflow?.[index]
                                                                                            ?.departmentId && (
                                                                                            <div className="error-message text-danger">
                                                                                                {
                                                                                                    formik.errors.workflow[index]
                                                                                                        .departmentId
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </div>
                                                                    </div>
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                    <div className="card  mb-0">
                                                                        <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                            {/* bg-light */}
                                                                            <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                            <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                                {" "}
                                                                                <Label className="mb-0">
                                                                                    {" "}
                                                                                    Select Service List Approval{" "}
                                                                                    <span
                                                                                        aria-required="true"
                                                                                        className="required d-inline"
                                                                                    >
                                                                                        {" "}
                                                                                        *{" "}
                                                                                    </span>{" "}
                                                                                </Label>
                                                                            </h4>
                                                                            <div className=" flex-shrink-0 "></div>
                                                                        </div>
                                                                        <div className="card-body p-4">
                                                                            <FormGroup className="form-md-line-input">
                                                                                <div className="clearfix"></div>
                                                                                <div className="input_box text-start">
                                                                                    <Select
                                                                                        isMulti
                                                                                        isDisabled={
                                                                                            formik.values.workflow?.[index]
                                                                                                ?.departmentId === null
                                                                                        }
                                                                                        value={workflow.serviceListApproval.map(
                                                                                            (option) => {
                                                                                                const service = services[
                                                                                                    index
                                                                                                ]?.find(
                                                                                                    (service) =>
                                                                                                        service.slug === option
                                                                                                );
                                                                                                return service
                                                                                                    ? {
                                                                                                        value: service.slug,
                                                                                                        label:
                                                                                                            service.serviceName,
                                                                                                    }
                                                                                                    : null;
                                                                                            }
                                                                                        )}
                                                                                        onChange={(selectedOptions) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "serviceListApproval",
                                                                                                selectedOptions.map(
                                                                                                    (option) => option.value
                                                                                                )
                                                                                            )
                                                                                        } // This will now map slugs
                                                                                        options={services[index]?.map(
                                                                                            (service) => ({
                                                                                                value: service.slug, // Use service.slug instead of service.id
                                                                                                label: service.serviceName,
                                                                                                isDisabled:
                                                                                                    index === 0 &&
                                                                                                    previouslyAddedServiceId.includes(
                                                                                                        service.slug
                                                                                                    ), // Ensure previouslyAddedServiceId uses slugs
                                                                                            })
                                                                                        )}
                                                                                        onBlur={formik.handleBlur}
                                                                                        name={`workflow.${index}.serviceListApproval`}
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

                                                                                    {formik.touched.workflow?.[index]
                                                                                        ?.serviceListApproval &&
                                                                                        formik.errors.workflow?.[index]
                                                                                            ?.serviceListApproval && (
                                                                                            <div className="error-message text-danger">
                                                                                                {
                                                                                                    formik.errors.workflow[index]
                                                                                                        .serviceListApproval
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </div>
                                                                    </div>
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                    <div className="card  mb-0">
                                                                        <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                            {/* bg-light */}
                                                                            <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                            <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                                {" "}
                                                                                <Label className="mb-0">
                                                                                    {" "}
                                                                                    Select Workflow Method{" "}
                                                                                    <span
                                                                                        aria-required="true"
                                                                                        className="required d-inline"
                                                                                    >
                                                                                        {" "}
                                                                                        *{" "}
                                                                                    </span>{" "}
                                                                                </Label>
                                                                            </h4>
                                                                            <div className=" flex-shrink-0 "></div>
                                                                        </div>
                                                                        <div className="card-body p-4">
                                                                            <FormGroup className="form-md-line-input">
                                                                                <div className="clearfix"></div>
                                                                                <div className="input_box text-start">
                                                                                    <Select
                                                                                        className="bg-white text-start"
                                                                                        options={workflowMethodOptions}
                                                                                        onChange={(value) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "workflowMethod",
                                                                                                value.value
                                                                                            )
                                                                                        }
                                                                                        onBlur={formik.handleBlur}
                                                                                        value={workflowMethodOptions.find(
                                                                                            (option) =>
                                                                                                option.value ===
                                                                                                formik?.values?.workflow[index]
                                                                                                    ?.workflowMethod
                                                                                        )}
                                                                                        placeholder="Select Method*"
                                                                                        name={`workflow.${index}.workflowMethod`}
                                                                                        isDisabled={
                                                                                            formik.values.workflow?.[index]
                                                                                                ?.departmentId === null
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
                                                                                    {formik.touched.workflow?.[index]
                                                                                        ?.workflowMethod &&
                                                                                        formik.errors.workflow?.[index]
                                                                                            ?.workflowMethod && (
                                                                                            <div className="error-message text-danger">
                                                                                                {
                                                                                                    formik.errors.workflow[index]
                                                                                                        .workflowMethod
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </div>
                                                                    </div>
                                                                    {workflow.workflowMethod === "role" && (
                                                                        <>
                                                                            <div className="arrow_line">
                                                                                <span></span>
                                                                            </div>
                                                                            <div className="card  mb-0">
                                                                                <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                                    {/* bg-light */}
                                                                                    <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                                    <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                                        {" "}
                                                                                        <Label className="mb-0">
                                                                                            {" "}
                                                                                            Select role to create workflow{" "}
                                                                                            <span
                                                                                                aria-required="true"
                                                                                                className="required d-inline"
                                                                                            >
                                                                                                {" "}
                                                                                                *{" "}
                                                                                            </span>{" "}
                                                                                        </Label>
                                                                                    </h4>
                                                                                    <div className=" flex-shrink-0 "></div>
                                                                                </div>
                                                                                <div className="card-body p-4">
                                                                                    <FormGroup className="form-md-line-input">
                                                                                        <div className="clearfix"></div>
                                                                                        <div className="input_box text-start">
                                                                                            <Select
                                                                                                className="bg-white text-start"
                                                                                                options={roleOptions(index)}
                                                                                                onChange={(value) =>
                                                                                                    handleInputChange(
                                                                                                        index,
                                                                                                        "roleId",
                                                                                                        value.value
                                                                                                    )
                                                                                                }
                                                                                                onBlur={formik.handleBlur}
                                                                                                value={roleOptions(index).find(
                                                                                                    (option) =>
                                                                                                        option.value ===
                                                                                                        formik?.values?.workflow[
                                                                                                            index
                                                                                                        ]?.roleId
                                                                                                )}
                                                                                                placeholder="Select Role*"
                                                                                                name={`workflow.${index}.roleId`}
                                                                                                isDisabled={
                                                                                                    formik.values.workflow?.[
                                                                                                        index
                                                                                                    ]?.departmentId === null
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
                                                                                            {formik.touched.workflow?.[index]
                                                                                                ?.roleId &&
                                                                                                formik.errors.workflow?.[index]
                                                                                                    ?.roleId && (
                                                                                                    <div className="error-message text-danger">
                                                                                                        {
                                                                                                            formik.errors.workflow[
                                                                                                                index
                                                                                                            ].roleId
                                                                                                        }
                                                                                                    </div>
                                                                                                )}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                    {workflow.workflowMethod === "agent" && (
                                                                        <>
                                                                            <div className="arrow_line">
                                                                                <span></span>
                                                                            </div>
                                                                            <div className="card  mb-0">
                                                                                <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                                    {/* bg-light */}
                                                                                    <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                                    <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                                                        {" "}
                                                                                        <Label className="mb-0">
                                                                                            {" "}
                                                                                            Select Agent{" "}
                                                                                            <span
                                                                                                aria-required="true"
                                                                                                className="required d-inline"
                                                                                            >
                                                                                                {" "}
                                                                                                *{" "}
                                                                                            </span>{" "}
                                                                                        </Label>
                                                                                    </h4>
                                                                                    <div className=" flex-shrink-0 "></div>
                                                                                </div>
                                                                                <div className="card-body p-4">
                                                                                    <FormGroup className="form-md-line-input">
                                                                                        <div className="clearfix"></div>
                                                                                        <div className="input_box text-start">
                                                                                            <Select
                                                                                                isMulti
                                                                                                value={workflow.selectedUser.map(
                                                                                                    (userId) => {
                                                                                                        const user = userLists[
                                                                                                            index
                                                                                                        ]?.find(
                                                                                                            (user) =>
                                                                                                                user.id === userId
                                                                                                        );
                                                                                                        return user
                                                                                                            ? {
                                                                                                                value: user.id,
                                                                                                                label: user.name,
                                                                                                            }
                                                                                                            : null;
                                                                                                    }
                                                                                                )}
                                                                                                onChange={(selectedOptions) =>
                                                                                                    handleInputChange(
                                                                                                        index,
                                                                                                        "selectedUser",
                                                                                                        selectedOptions.map(
                                                                                                            (option) => option.value
                                                                                                        )
                                                                                                    )
                                                                                                }
                                                                                                options={userLists[index]?.map(
                                                                                                    (user) => ({
                                                                                                        value: user.id,
                                                                                                        label: user.name,
                                                                                                    })
                                                                                                )}
                                                                                                onBlur={formik.handleBlur}
                                                                                                name={`workflow.${index}.selectedUser`}
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
                                                                                            {formik.touched.workflow?.[index]
                                                                                                ?.selectedUser &&
                                                                                                formik.errors.workflow?.[index]
                                                                                                    ?.selectedUser && (
                                                                                                    <div className="error-message text-danger">
                                                                                                        {
                                                                                                            formik.errors.workflow[
                                                                                                                index
                                                                                                            ].selectedUser
                                                                                                        }
                                                                                                    </div>
                                                                                                )}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                    <div className="card  mb-0">
                                                                        <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                            {/* bg-light */}
                                                                            <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                            <h4 className="flex-grow-1 card-title mb-0 align-items-center d-flex">
                                                                                {" "}
                                                                                <Label className="mb-0">
                                                                                    {" "}
                                                                                    Turnaround Time (TAT) in Days{" "}
                                                                                    <span
                                                                                        aria-required="true"
                                                                                        className="required d-inline"
                                                                                    >
                                                                                        {" "}
                                                                                        *{" "}
                                                                                    </span>{" "}
                                                                                </Label>
                                                                            </h4>
                                                                            <div className=" flex-shrink-0 "></div>
                                                                        </div>
                                                                        <div className="card-body p-4">
                                                                            <FormGroup className="form-md-line-input">
                                                                                <div className="clearfix"></div>
                                                                                <div className="input_box text-start">
                                                                                    <Input
                                                                                        type="number"
                                                                                        className="form-control"
                                                                                        placeholder="Enter TAT in days"
                                                                                        value={workflow.TAT}
                                                                                        onChange={(e) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "TAT",
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                        onBlur={formik.handleBlur}
                                                                                        name={`workflow.${index}.TAT`}
                                                                                    />
                                                                                    {formik.touched.workflow?.[index]
                                                                                        ?.TAT &&
                                                                                        formik.errors.workflow?.[index]
                                                                                            ?.TAT && (
                                                                                            <div className="error-message text-danger">
                                                                                                {
                                                                                                    formik.errors.workflow[index]
                                                                                                        .TAT
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </div>
                                                                    </div>
                                                                    <div className="arrow_line">
                                                                        <span></span>
                                                                    </div>
                                                                    <div className="card  mb-0">
                                                                        <div className="card-header align-items-center d-flex py-2 py-2 ">
                                                                            {/* bg-light */}
                                                                            <i className="ri-settings-4-line align-middle me-2 fs-2 text-warning"></i>
                                                                            <h4 className="flex-grow-1 card-title mb-0 align-items-center d-flex">
                                                                                {" "}
                                                                                <Label className="mb-0">
                                                                                    {" "}
                                                                                    Direct Approval{" "}
                                                                                    <span
                                                                                        aria-required="true"
                                                                                        className="required d-inline"
                                                                                    >
                                                                                        {" "}
                                                                                        *{" "}
                                                                                    </span>{" "}
                                                                                </Label>
                                                                            </h4>
                                                                            <div className=" flex-shrink-0 "></div>
                                                                        </div>
                                                                        <div className="card-body p-4">
                                                                            <FormGroup className="form-md-line-input">
                                                                                <div className="clearfix"></div>
                                                                                <div className="input_box text-start">
                                                                                    <Input
                                                                                        type="select"
                                                                                        className={
                                                                                            formik.values.workflow?.[index]
                                                                                                ?.departmentId === null
                                                                                                ? "bg-grey text-start cursor-pointer"
                                                                                                : "bg-white text-start cursor-pointer"
                                                                                        }
                                                                                        disabled={
                                                                                            formik.values.workflow?.[index]
                                                                                                ?.departmentId === null
                                                                                        }
                                                                                        value={workflow.isDirectApproval}
                                                                                        onChange={(e) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "isDirectApproval",
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                        onClick={(e) =>
                                                                                            handleDirectApproval(
                                                                                                index,
                                                                                                "isDirectApproval",
                                                                                                e.target.value
                                                                                            )
                                                                                        }
                                                                                        onBlur={formik.handleBlur}
                                                                                        name={`workflow.${index}.isDirectApproval`}
                                                                                    >
                                                                                        <option value="">
                                                                                            {" "}
                                                                                            Select Approval{" "}
                                                                                        </option>
                                                                                        <option value="1"> Yes </option>
                                                                                        <option value="0"> No </option>
                                                                                    </Input>

                                                                                    {formik.touched.workflow?.[index]
                                                                                        ?.isDirectApproval &&
                                                                                        formik.errors.workflow?.[index]
                                                                                            ?.isDirectApproval && (
                                                                                            <div className="error-message text-danger">
                                                                                                {
                                                                                                    formik.errors.workflow[index]
                                                                                                        .isDirectApproval
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="arrow_line">
                                                    <span></span>
                                                </div>
                                                <div className="form-group ">
                                                    <div className="user_fill text-center">
                                                        <div className="z-1 btn btn-success pe-none px-5  fs-15 rounded-pill fw-semibold position-relative">
                                                            Closure
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SimpleBar>
                                    </CardBody>
                                    <CardFooter>
                                        <Row>
                                            <Col
                                                md={12}
                                                className="text-center d-flex align-items-center justify-content-center"
                                            >
                                                <Button
                                                    type="submit"
                                                    color="primary"
                                                    className=" btn btn-primary mx-1"
                                                >
                                                    <i className="ri-save-3-line label-icon align-middle me-2"></i>{" "}
                                                    <span className="ms-2"> Submit </span>
                                                </Button>
                                                <button
                                                    outline
                                                    className="btn btn-primary mx-1"
                                                    onClick={() => navigate("/workflow")}
                                                >
                                                    <i className="ri-close-line label-icon align-middle "></i>{" "}
                                                    <span className="ms-2"> Cancel </span>
                                                </button>
                                            </Col>
                                        </Row>
                                    </CardFooter>
                                </Card>
                            </form>

                        </Container>
                    </div>
                </div>
            </div>
            <ScrollToTop />
        </>
    );
};
export default AddWorkflow;