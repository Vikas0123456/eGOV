import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useId,
    useRef,
} from "react";
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
    Button,
    Row,
    Col,
    Card,
    CardBody,
    CardFooter,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import {
    hasCreatePermission,
    hasEditPermission,
} from "../../../../common/CommonFunctions/common";
import useAxios from "../../../../utils/hook/useAxios";
import { Offcanvas } from "react-bootstrap";
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { setTableColumnConfig } from "../../../../slices/layouts/reducer";
import { useDispatch, useSelector } from "react-redux";

const CustomNode = ({ data }) => {
    const handleClick = () => {
        data.onClick();
    };

    return (
        <div className=" card border-warning " onClick={handleClick}>
            {data?.id !== "1" && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-2 h-2 bg-blue-500"
                    isConnectable={false}
                />
            )}
            <div className="card-header p-2  bg-warning-subtle"> {/* Fixed width for consistency */}
                <div className="">
                    <h6 className="pt-1 m-0">
                        {data?.label}
                    </h6>
                </div>
            </div>
            <div className="card-body p-0">
                {data.isWorkFlow ? (
                    <table className="table align-middle table-nowrap table-bordered mb-0">
                        <tbody>
                            {data?.services && (
                                <tr>
                                    <td className=" fw-bold">Services</td>
                                    <td className="ml-2">{data?.services}</td>
                                </tr>
                            )}
                            {data?.TAT && (
                                <tr>
                                    <td className=" fw-bold ">TAT</td>
                                    <td className="ml-2">{data?.TAT}</td>
                                </tr>
                            )}
                            {data?.Roles && (
                                <tr>
                                    <td className=" fw-bold ">Roles</td>
                                    <td className="ml-2">{data?.Roles}</td>
                                </tr>
                            )}
                            {data?.Users && (
                                <tr>
                                    <td className=" fw-bold ">Users</td>
                                    <td className="ml-2">{data?.Users}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="table align-middle table-nowrap table-bordered mb-0">
                        <tbody>
                            {data?.departmentName && (
                                <tr>
                                    <td className="fw-bold">Department:</td>
                                    <td className="ml-2">{data?.departmentName}</td>
                                </tr>
                            )}
                            {data?.workflowFor && (
                                <tr>
                                    <td className="fw-bold">Type:</td>
                                    <td className="ml-2">{data?.workflowFor}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Handle
                type="source"
                position={data?.id === "1" ? Position.Right : Position.Bottom}
                className="w-2 h-2 bg-blue-500"
                isConnectable={false}
            />
        </div>
    );
};

const nodeTypes = {
    customNode: CustomNode,
};

const AddWorkflow = () => {
    const dispatch = useDispatch();
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const location = useLocation();

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const workflowID = location?.state;

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const EventPermissions = userPermissionsDecryptData?.data?.find(
        (module) => module.slug === "workflow"
    );
    const createPermission = EventPermissions
        ? hasCreatePermission(EventPermissions)
        : false;
    const editPermission = EventPermissions
        ? hasEditPermission(EventPermissions)
        : false;
    // dynamic workflow
    const [show, setShow] = useState(false);
    const [currentWorkflow, setCurrentworkflow] = useState(null);
    // dynamic workflow

    const [previouslyAddedServiceId, setPreviouslyAddedServiceId] = useState(
        []
    );
    const [intValue, setIntValue] = useState({
        workflowName: "",
        userId: userData?.id,
        workflowFor: "",
        departmentId: null,
    });
    const [departments, setDepartments] = useState([]);
    const [services, setServices] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const [roleLists, setRoleLists] = useState([]);
    const tableName = "workflowDataConfig";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const workflowDataConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    const workflowDataConfigById = workflowDataConfig?.tableConfig?.find(
        (table) => table?.workflowID === workflowID
    );

    const handleCloseModal = () => {
        setShow(!show);
    };
    const handleClickModal = (value) => {
        setCurrentworkflow(value);
        setShow(!show);
    };

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Create a ref to store the latest state values
    const stateRef = useRef({
        nodes,
        edges,
        workflowDataConfig,
        workflowID,
        userData,
    });

    // Update ref when values change
    useEffect(() => {
        stateRef.current = {
            nodes,
            edges,
            workflowDataConfig,
            workflowID,
            userData,
        };
    }, [nodes, edges, workflowDataConfig, workflowID, userData]);

    // Custom debounce implementation
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const sanitizeNodeForStorage = (node) => {
        const { data, ...nodeWithoutData } = node;
        const sanitizedData = { ...data };
        delete sanitizedData.setShow;
        return {
            ...nodeWithoutData,
            data: sanitizedData,
        };
    };

    // Create debounced store update function
    const debouncedUpdateStore = useCallback(
        debounce((updatedNodes) => {
            const { workflowDataConfig, workflowID, userData, edges } =
                stateRef.current;

            const sanitizedNodes = updatedNodes.map(sanitizeNodeForStorage);

            const newUpdatedData = [
                {
                    workflowID: workflowID,
                    nodes: sanitizedNodes,
                    edges,
                },
            ];
            updateTableConfig(newUpdatedData);
        }, 3000), // 1 second delay
        []
    );

    // Enhanced node position change handler with debouncing
    const handleNodesChange = useCallback(
        (changes) => {
            onNodesChange(changes);

            const positionChanges = changes.filter(
                (change) => change.type === "position" && change.position
            );

            if (positionChanges.length > 0) {
                const updatedNodes = stateRef.current.nodes.map((node) => {
                    const change = positionChanges.find(
                        (c) => c.id === node.id
                    );
                    return change
                        ? { ...node, position: change.position }
                        : node;
                });

                debouncedUpdateStore(updatedNodes);
            }
        },
        [onNodesChange, debouncedUpdateStore]
    );

    useEffect(() => {
        return () => {
            debouncedUpdateStore.cancel = () => { };
        };
    }, [debouncedUpdateStore]);

    const baseConfig = useMemo(() => ({
        horizontalSpacing: 100,  // Reduced from 450
        verticalSpacing: 250,    // Increased from 150
        initialX: 50,
        initialY: 50,
    }), []);

    const getBaseNodes = useCallback(() => ([
        {
            id: "1",
            type: "customNode",
            position: { x: baseConfig.initialX, y: baseConfig.initialY },
            draggable: true,
            data: {
                id: "1",
                label: "Workflow Details",
                workflowName: intValue?.workflowName,
                workflowFor: intValue?.workflowFor === "1" ? "Service" : "Ticket",
                departmentName: intValue?.departmentId ?
                    departments?.find((dept) => dept.id === intValue?.departmentId)?.departmentName : "",
                onClick: () => {
                    setCurrentworkflow(null);
                    setShow(true);
                },
            },
        }
    ]), [intValue, departments, baseConfig, setShow, setCurrentworkflow]);

    const generateWorkflowNodes = useCallback((workflowIndex) => {
        const xPos = baseConfig.initialX + baseConfig.horizontalSpacing;
        const yPos = baseConfig.initialY + (workflowIndex * baseConfig.verticalSpacing);

        return [{
            id: `node-${workflowIndex + 2}`,
            type: "customNode",
            position: { x: xPos, y: yPos },
            draggable: true,
            data: {
                isWorkFlow: true,
                label: `(${workflowIndex + 1})  WorkFlow Process`,
                services: intValue?.workflow?.[workflowIndex]?.serviceListApproval?.join(", ") || "No services available",
                Users: intValue?.workflow?.[workflowIndex]?.workflowMethod === "user" && Array.isArray(userLists) ?
                    intValue?.workflow?.[workflowIndex]?.selectedUser
                        ?.map(userId => userLists?.find(user => user?.id === userId)?.name || "Unknown User")
                        .join(", ") || "No users assigned" : null,
                Roles: intValue?.workflow?.[workflowIndex]?.workflowMethod === "role" && Array.isArray(roleLists) ?
                    roleLists?.find(role => role?.id === intValue?.workflow?.[workflowIndex]?.roleId)?.roleName || "Role not found" : null,
                TAT: intValue?.workflow?.[workflowIndex]?.TAT || "N/A",
                onClick: () => {
                    setShow(true);
                    setCurrentworkflow(workflowIndex);
                },
            },
        }];
    }, [intValue, userLists, roleLists, baseConfig, setShow]);

    useEffect(() => {
        const baseNodes = getBaseNodes();
        const workflowNodes = [];
        const workflowEdges = [];

        intValue?.workflow?.forEach((_, index) => {
            const newNodes = generateWorkflowNodes(index);
            workflowNodes.push(...newNodes);

            // Create edge from previous node
            const targetNode = newNodes[0];
            const sourceNode = index === 0 ? baseNodes[0] : workflowNodes[index - 1];

            workflowEdges.push({
                id: `e${sourceNode.id}-${targetNode.id}`,
                source: sourceNode.id,
                target: targetNode.id,
                animated: true,
                type: 'smoothstep',
                style: { stroke: '#0d6efd', strokeWidth: 2 },
            });
        });

        setNodes([...baseNodes, ...workflowNodes]);
        setEdges(workflowEdges);
    }, [intValue?.workflow, getBaseNodes, generateWorkflowNodes]);

    const fetchTableConfigData = async () => {
        try {
            if (userId) {
                const response = await axiosInstance.post(
                    `userService/table/get-table-config`,
                    {
                        userId: userId,
                    }
                );

                if (response) {
                    const data = response?.data?.data;
                    dispatch(setTableColumnConfig(data));
                }
            }
        } catch (error) {
            console.error("Error fetching profile image:", error.message);
        }
    };

    const updateTableConfig = async (data) => {
        try {
            const response = await axiosInstance.post(
                `userService/table/update-table-config`,
                {
                    userId: userId,
                    tableName: tableName,
                    tableConfig: data,
                }
            );
            if (response) {
                fetchTableConfigData();
            }
        } catch (error) {
            console.error("Something went wrong while update banner");
        }
    };

    const getDepartmentList = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response.data.data;
                setDepartments(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const getServiceList = async (departmentId) => {
        try {
            const serviceResponse = await axiosInstance.post(
                `serviceManagement/service/view`,
                { departmentId }
            );
            if (serviceResponse?.data) {
                const { rows } = serviceResponse.data.data;
                setServices(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchDeptUserList = async (departmentId) => {
        try {
            const response = await axiosInstance.post(`userService/user/view`, {
                departmentId,
            });
            if (response?.data) {
                const { rows } = response.data.data;
                setUserLists(rows); // Simplified for a single departmentId
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchRoleList = async (departmentId) => {
        try {
            const response = await axiosInstance.post(
                `userService/roles/view`,
                { departmentId }
            );
            if (response?.data) {
                const { rows } = response.data.data;
                setRoleLists(rows); // Simplified for a single departmentId
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const getPreviouslyAddedServiceId = async (
        departmentId,
        workflowFor,
        workflowId
    ) => {
        if (departmentId && workflowFor) {
            try {
                const addedServices = await axiosInstance.post(
                    `userService/workflow/addedServices`,
                    {
                        departmentId: departmentId,
                        workflowFor: workflowFor,
                        workflowId: workflowId ? workflowId : null,
                    }
                );
                if (addedServices?.data) {
                    const { serviceIds } = addedServices.data.data;
                    setPreviouslyAddedServiceId(serviceIds);
                }
            } catch (error) {
                console.error(error.message);
            }
        }
    };

    useEffect(() => {
        getDepartmentList();
        if (userData?.isCoreTeam === "0") {
            getServiceList(userData?.departmentId);
        }
    }, []);

    const validationSchema = Yup.object().shape({
        workflowName: Yup.string().required("Please enter workflowName"),
        workflowFor: Yup.string().required("Please select workflowFor"),
        userId: Yup.number().nullable().required("Please enter userId"),
        departmentId: Yup.number()
            .nullable()
            .required("Please select department"),
        workflow: Yup.array().of(
            Yup.lazy((value) => {
                const { workflowMethod, index } = value; // Access index directly from value
                console.log(
                    "Workflow item index:",
                    index,
                    "Current Workflow:",
                    currentWorkflow
                );

                let validationShape = {
                    TAT: Yup.number()
                        .nullable()
                        .required("Please enter turnaround time (TAT)"),
                    workflowMethod: Yup.string().required(
                        "Please select workflowMethod"
                    ),
                    serviceListApproval: Yup.array()
                        .of(Yup.string().required("Please select service"))
                        .min(1, "Please select at least one service"),
                    isDirectApproval: Yup.string().required(
                        "Please select approval"
                    ),
                };

                if (workflowMethod === "role") {
                    validationShape = {
                        ...validationShape,
                        roleId: Yup.number().required("Please select role"),
                    };
                } else if (workflowMethod === "user") {
                    validationShape = {
                        ...validationShape,
                        selectedUser: Yup.array()
                            .of(Yup.number().required("Please select user"))
                            .min(1, "Please select at least one user"),
                    };
                }

                // Only validate the current workflow in the modal
                if (index === currentWorkflow) {
                    return Yup.object().shape(validationShape);
                } else {
                    // Skip validation for other workflows
                    return Yup.object().shape({});
                }
            })
        ),
    });


    // Step 2: Set Up Formik with the Validation Context and Debugging Logs
    const formik = useFormik({
        initialValues: intValue,
        enableReinitialize: true,
        validateOnChange: true,
        validateOnBlur: true,
        validate: async (values) => {
            try {
                console.log(
                    "Validating with currentWorkflow:",
                    currentWorkflow
                );
                await validationSchema.validate(values, {
                    abortEarly: false,
                    context: { currentWorkflow },
                });
            } catch (error) {
                console.error("Validation Error:", error);
                return error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});
            }
        },
        onSubmit: async (values) => {
            if (workflowID) {
                await updateWorkflowApi(values);
            } else {
                await createWorkflowApi(values);
            }
        },
    });
    console.log(formik.values, "Int values");

    useEffect(() => {
        if (
            formik?.values?.workflowFor &&
            formik?.values?.departmentId &&
            !intValue?.id
        ) {
            getPreviouslyAddedServiceId(
                formik?.values?.departmentId,
                formik.values?.workflowFor
            );
        }
        if (
            formik?.values?.workflowFor &&
            formik?.values?.departmentId &&
            intValue?.id
        ) {
            getPreviouslyAddedServiceId(
                formik?.values?.departmentId,
                formik?.values?.workflowFor,
                intValue?.id
            );
        }
    }, [formik.values.workflowFor, formik.values.departmentId, intValue]);

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
    };

    const addWorkflow = () => {
        formik.setFieldValue("workflow", [
            ...formik.values.workflow,
            {
                workflowMethod: "",
                TAT: "",
                roleId: null,
                selectedUser: [],
                serviceListApproval: [],
                isDirectApproval: "",
            },
        ]);
        setUserLists([...userLists, []]);
        setRoleLists([...roleLists, []]);
    };

    const createWorkflowApi = async (values) => {
        try {
            const newData = {
                ...values,
                workflow: [
                    {
                        workflowMethod: "",
                        TAT: "",
                        roleId: null,
                        selectedUser: [],
                        serviceListApproval: [],
                        isDirectApproval: "",
                    },
                ],
            };
            const response = await axiosInstance.post(
                `userService/workflow/create`,
                newData
            );
            if (response?.data) {
                toast.success("Workflow added successfully.");
                setShow(false);
                setIntValue({
                    ...intValue,
                    workflow:
                        [
                            {
                                workflowMethod: "",
                                TAT: "",
                                roleId: null,
                                selectedUser: [],
                                serviceListApproval: [],
                                isDirectApproval: "",
                                index: 0
                            },
                        ]

                })
            }
        } catch (error) {
            console.error(error.message);
            toast.error("Something went wrong while adding workflow.");
        }
    };

    const updateWorkflowApi = async (values) => {
        try {
            const response = await axiosInstance.put(
                `userService/workflow/update`,
                { workflowId: workflowID, ...values }
            );
            if (response?.data) {
                toast.success("Workflow updated successfully.");
                setCurrentworkflow(null);
                setShow(false);
                getWorkflowApi();
                // navigate("/workflow");
            }
        } catch (error) {
            console.error(error.message);
            toast.error("Something went wrong while updating workflow.");
        }
    };

    const getWorkflowApi = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/workflow/view`,
                { workflowId: workflowID }
            );
            if (response?.data) {
                const fetchedWorkflowData = response.data.data;

                console.log(fetchedWorkflowData, "fetchedWorkflowData");

                setIntValue({
                    id: fetchedWorkflowData?.id,
                    workflowName: fetchedWorkflowData?.workflowName || "",
                    userId: fetchedWorkflowData?.userId || userData?.id,
                    workflowFor: fetchedWorkflowData?.workflowFor || "",
                    departmentId:
                        fetchedWorkflowData?.workflowDepartmentId || null,
                    workflow:
                        fetchedWorkflowData?.workflow &&
                            fetchedWorkflowData?.workflow.length === 0
                            ? [
                                {
                                    workflowMethod: "",
                                    TAT: "",
                                    roleId: null,
                                    selectedUser: [],
                                    serviceListApproval: [],
                                    isDirectApproval: "",
                                },
                            ]
                            : fetchedWorkflowData?.workflow?.map(
                                (item, index) => ({
                                    ...item,
                                    index, // Add index property directly to each item
                                })
                            ),
                });
                //   formik.setValues({
                //     id: fetchedWorkflowData?.id,
                //     workflowName: fetchedWorkflowData?.workflowName || "",
                //     userId: fetchedWorkflowData?.userId || userData?.id,
                //     workflowFor: fetchedWorkflowData?.workflowFor || "",
                //     departmentId: fetchedWorkflowData?.workflowDepartmentId || "",
                //     workflow: fetchedWorkflowData?.workflow && fetchedWorkflowData?.workflow.length ===0 ?intValue.workflow: fetchedWorkflowData?.workflow,
                // })
                if (fetchedWorkflowData) {
                    getPreviouslyAddedServiceId(
                        fetchedWorkflowData.departmentId,
                        fetchedWorkflowData.workflowFor,
                        fetchedWorkflowData.id
                    );
                    getServiceList(fetchedWorkflowData?.workflowDepartmentId);
                    fetchRoleList(fetchedWorkflowData?.workflowDepartmentId);
                    fetchDeptUserList(
                        fetchedWorkflowData?.workflowDepartmentId
                    );
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (workflowID) {
            getWorkflowApi();
            // setShow(true);
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
    const handleDepartmentChange = (departmentId) => {
        formik.setFieldValue("departmentId", departmentId);
        getServiceList(departmentId);
        fetchRoleList(departmentId);
        fetchDeptUserList(departmentId);
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
            value: "user",
            label: "By User",
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

    const roleOptions = () =>
        roleLists?.map((role) => ({
            value: role.id,
            label: role.roleName,
        })) || [];

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content services">
                    <div className="page-content">
                        <Container fluid>
                            {!workflowID && (
                                <div className="form-body create-work-flow" style={{ zIndex: "50", }}>
                                    <div className="flow_form">
                                        <div className="form-group">
                                            <div className="user_fill text-center mb-4">
                                                <button
                                                    className="btn btn-success px-5  fs-15 rounded-pill fw-semibold"
                                                    onClick={() =>
                                                        setShow(true)
                                                    }>
                                                    Create Workflow
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ width: "100%", height: "80vh", background: "#fff" }}>

                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    nodeTypes={nodeTypes}
                                    onNodesChange={handleNodesChange}
                                    fitView
                                    minZoom={0.1}
                                    maxZoom={1.5}
                                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                                >
                                    <Background />
                                    <Controls />
                                </ReactFlow>
                            </div>
                            {/* <div
                              className="col-12"
                              style={{ marginBottom: "30px" }}>
                              <div className="d-flex align-items-center flex-lg-row flex-column">
                                  <div className="flex-grow-1">
                                      <div className="d-flex align-items-center">
                                          <div>
                                              <h2 className="mb-0 fw-bold text-black">
                                                  Workflow
                                              </h2>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="approvals">
                              <div className="form-body">
                                  <div className="flow_form">
                                      <div className="form-group">
                                          <div className="user_fill text-center mb-4">
                                              <button
                                                  className="btn btn-success px-5  fs-15 rounded-pill fw-semibold"
                                                  onClick={() =>
                                                      setShow(true)
                                                  }>
                                                  Create Workflow
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div
                                  className="card "
                                  onClick={() => handleClickModal(null)}>
                                  <div className="card-header align-items-center d-flex py-2 py-2 bg-light">
                                      <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                          {" "}
                                          Workflow Name
                                      </h4>
                                      <div className=" flex-shrink-0 ">
                                          <span className="text-muted">
                                              <i className="ri-settings-4-line align-middle me-1 fs-22 text-warning"></i>
                                          </span>
                                      </div>
                                  </div>
                                  <div className="card-body p-4">
                                      <div className="user_fill ">
                                          <div>
                                              {formik.values.workflowName}
                                          </div>
                                          <div>
                                              {formik.values.workflowFor ===
                                              "0"
                                                  ? "Service"
                                                  : "Ticket"}
                                          </div>
                                          <div>
                                              {
                                                  formik.values
                                                      .workflowDepartmentId
                                              }
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              {(intValue?.workflowName ||
                                  intValue?.workflowDepartmentId) && (
                                  <>
                                      {!workflowID && (
                                          <h4
                                              className="flex-grow-1 card-title mb-0  align-items-center d-flex"
                                              onClick={() =>
                                                  handleClickModal(0)
                                              }>
                                              {" "}
                                              Workflow Step 1
                                          </h4>
                                      )}

                                      {intValue?.workflow?.length > 0 && intValue?.workflow?.map(
                                          (data, index) => (
                                              <div
                                                  className="card "
                                                  key={index}
                                                  onClick={() =>
                                                      handleClickModal(index)
                                                  }>
                                                  <div className="card-header align-items-center d-flex py-2 py-2 bg-light">
                                                      <h4 className="flex-grow-1 card-title mb-0  align-items-center d-flex">
                                                          {" "}
                                                          Workflow Step {index + 1}
                                                      </h4>
                                                      <div className=" flex-shrink-0 ">
                                                          <span className="text-muted">
                                                              <i className="ri-settings-4-line align-middle me-1 fs-22 text-warning"></i>
                                                          </span>
                                                      </div>
                                                  </div>
                                                  <div className="card-body p-4">
                                                      <div className="user_fill">
                                                          <div>
                                                              {
                                                                  data?.workflowMethod
                                                              }
                                                          </div>
                                                          <div>
                                                              {
                                                                  data?.serviceListApproval
                                                              }
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          )
                                      )}
                                  </>
                              )}
                          </div> */}
                        </Container>
                        <Offcanvas
                            show={show}
                            placement="end"
                            onHide={handleCloseModal}>
                            <SimpleBar
                                className="bg-light m-3 m-sm-4 p-3 p-sm-4 vh-100"
                                style={{
                                    maxHeight: "calc(100vh - 50px)",
                                    overflow: "auto",
                                }}>
                                <form onSubmit={formik.handleSubmit}>
                                    <div>
                                        {currentWorkflow == null && (
                                            <div className="approvals">
                                                <div className="form-body">
                                                    <div className="flow_form">
                                                        <div className="form-group">
                                                            <div className="user_fill text-center mb-4">
                                                                <div className="btn btn-success px-5  fs-15 rounded-pill fw-semibold">
                                                                    Create
                                                                    Workflow
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label className="form-label"> {" "} Workflow Name</label>
                                                            <div className="user_fill ">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Enter Workflow Name"
                                                                    name="workflowName"
                                                                    value={
                                                                        formik
                                                                            .values
                                                                            .workflowName
                                                                    }
                                                                    onChange={
                                                                        formik.handleChange
                                                                    }
                                                                />
                                                                {formik
                                                                    .touched
                                                                    .workflowName &&
                                                                    formik
                                                                        .errors
                                                                        .workflowName && (
                                                                        <div
                                                                            className="error-message"
                                                                            style={{
                                                                                color: "red",
                                                                            }}>
                                                                            {
                                                                                formik
                                                                                    .errors
                                                                                    .workflowName
                                                                            }
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <label className="form-label"> {" "} Select Workflow For </label>
                                                            <div className="user_fill ">
                                                                <FormGroup className="form-md-line-input mb-0">
                                                                    <div className="clearfix"></div>
                                                                    <div className="input_box text-start">
                                                                        <Select
                                                                            className="bg-white text-start"
                                                                            options={
                                                                                workflowForOptions
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            value={workflowForOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    formik
                                                                                        .values
                                                                                        .workflowFor
                                                                            )}
                                                                            onChange={(
                                                                                selectedOption
                                                                            ) =>
                                                                                formik.setFieldValue(
                                                                                    "workflowFor",
                                                                                    selectedOption.value
                                                                                )
                                                                            }
                                                                            placeholder="Select Method*"
                                                                            name="workflowFor"
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
                                                                        />
                                                                        {formik
                                                                            .touched
                                                                            .workflowFor &&
                                                                            formik
                                                                                .errors
                                                                                .workflowFor && (
                                                                                <div
                                                                                    className="error-message"
                                                                                    style={{
                                                                                        color: "red",
                                                                                    }}>
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .workflowFor
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </FormGroup>
                                                            </div>
                                                        </div>
                                                        <div className="form-group mb-3">
                                                            <Label className="form-label">
                                                                {" "}
                                                                {userData?.isCoreTeam ===
                                                                    "0"
                                                                    ? "Department"
                                                                    : "Select Department"}{" "}
                                                                <span
                                                                    aria-required="true"
                                                                    className="required d-inline">
                                                                    {" "}
                                                                    *{" "}
                                                                </span>{" "}
                                                            </Label>
                                                            <FormGroup className="form-md-line-input mb-0">
                                                                <div className="clearfix"></div>
                                                                <div className="input_box text-start">
                                                                    <Select
                                                                        className="bg-white text-start"
                                                                        options={
                                                                            departmentOptions
                                                                        }
                                                                        onChange={(
                                                                            value
                                                                        ) =>
                                                                            handleDepartmentChange(
                                                                                value.value
                                                                            )
                                                                        }
                                                                        onBlur={
                                                                            formik.handleBlur
                                                                        }
                                                                        value={departmentOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                formik
                                                                                    ?.values
                                                                                    ?.departmentId
                                                                        )}
                                                                        placeholder="Select Department*"
                                                                        name={`departmentId`}
                                                                        isDisabled={
                                                                            userData?.isCoreTeam ===
                                                                            "0"
                                                                        }
                                                                    />
                                                                    {formik
                                                                        .touched
                                                                        ?.departmentId &&
                                                                        formik
                                                                            .errors
                                                                            ?.departmentId && (
                                                                            <div
                                                                                className="error-message"
                                                                                style={{
                                                                                    color: "red",
                                                                                }}>
                                                                                {
                                                                                    formik
                                                                                        .errors
                                                                                        .departmentId
                                                                                }
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </FormGroup>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(currentWorkflow === 0 ||
                                            currentWorkflow) &&
                                            formik.values.workflow.map(
                                                (workflow, index) =>
                                                    currentWorkflow ===
                                                    index && (
                                                        <div
                                                            className="live-preview"
                                                            id="general"
                                                            key={index}>
                                                            <h5>{`Step ${index + 1
                                                                }`}</h5>
                                                            <div className="approvals">

                                                                <FormGroup className="form-md-line-input mb-3">
                                                                    <Label className="form-label">
                                                                        {" "} Select Service List Approval{" "}
                                                                        <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                    </Label>
                                                                    <div className="input_box text-start">
                                                                        <Select
                                                                            isMulti
                                                                            isDisabled={
                                                                                formik
                                                                                    .values
                                                                                    .workflow?.[
                                                                                    index
                                                                                ]
                                                                                    ?.departmentId ===
                                                                                null
                                                                            }
                                                                            value={workflow.serviceListApproval.map(
                                                                                (
                                                                                    option
                                                                                ) => {
                                                                                    const service =
                                                                                        services.find(
                                                                                            (
                                                                                                service
                                                                                            ) =>
                                                                                                service.slug ===
                                                                                                option
                                                                                        );
                                                                                    return service
                                                                                        ? {
                                                                                            value: service.slug,
                                                                                            label: service.serviceName,
                                                                                        }
                                                                                        : null;
                                                                                }
                                                                            )}
                                                                            onChange={(
                                                                                selectedOptions
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "serviceListApproval",
                                                                                    selectedOptions.map(
                                                                                        (
                                                                                            option
                                                                                        ) =>
                                                                                            option.value
                                                                                    )
                                                                                )
                                                                            }
                                                                            options={services?.map(
                                                                                (
                                                                                    service
                                                                                ) => ({
                                                                                    value: service.slug,
                                                                                    label: service.serviceName,
                                                                                    isDisabled:
                                                                                        index ===
                                                                                        0 &&
                                                                                        previouslyAddedServiceId.includes(
                                                                                            service.slug
                                                                                        ),
                                                                                })
                                                                            )}
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            name={`workflow.${index}.serviceListApproval`}
                                                                        />
                                                                        {formik
                                                                            .touched
                                                                            .workflow?.[
                                                                            index
                                                                        ]
                                                                            ?.serviceListApproval &&
                                                                            formik
                                                                                .errors
                                                                                .workflow?.[
                                                                                index
                                                                            ]
                                                                                ?.serviceListApproval && (
                                                                                <div
                                                                                    className="error-message"
                                                                                    style={{
                                                                                        color: "red",
                                                                                    }}>
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow[
                                                                                            index
                                                                                        ]
                                                                                            .serviceListApproval
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </FormGroup>
                                                                <FormGroup className="form-md-line-input mb-3">
                                                                    <Label className="form-label">
                                                                        {" "} Select Workflow Method{" "}
                                                                        <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                    </Label>
                                                                    <div className="input_box text-start">
                                                                        <Select
                                                                            className="bg-white text-start"
                                                                            options={
                                                                                workflowMethodOptions
                                                                            }
                                                                            onChange={(
                                                                                value
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "workflowMethod",
                                                                                    value.value
                                                                                )
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            value={workflowMethodOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    formik
                                                                                        ?.values
                                                                                        ?.workflow[
                                                                                        index
                                                                                    ]
                                                                                        ?.workflowMethod
                                                                            )}
                                                                            placeholder="Select Method*"
                                                                            name={`workflow.${index}.workflowMethod`}
                                                                            isDisabled={
                                                                                formik
                                                                                    .values
                                                                                    .workflow?.[
                                                                                    index
                                                                                ]
                                                                                    ?.departmentId ===
                                                                                null
                                                                            }
                                                                        />
                                                                        {formik
                                                                            .touched
                                                                            .workflow?.[
                                                                            index
                                                                        ]
                                                                            ?.workflowMethod &&
                                                                            formik
                                                                                .errors
                                                                                .workflow?.[
                                                                                index
                                                                            ]
                                                                                ?.workflowMethod && (
                                                                                <div
                                                                                    className="error-message"
                                                                                    style={{
                                                                                        color: "red",
                                                                                    }}>
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow[
                                                                                            index
                                                                                        ]
                                                                                            .workflowMethod
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </FormGroup>

                                                                {workflow.workflowMethod ===
                                                                    "role" && (
                                                                        <>

                                                                            <FormGroup className="form-md-line-input">
                                                                                <Label className="form-label">
                                                                                    {" "} Select role to create workflow{" "}
                                                                                    <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                                </Label>
                                                                                <div className="input_box text-start">
                                                                                    <Select
                                                                                        className="bg-white text-start"
                                                                                        options={roleOptions()}
                                                                                        onChange={(
                                                                                            value
                                                                                        ) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "roleId",
                                                                                                value.value
                                                                                            )
                                                                                        }
                                                                                        onBlur={
                                                                                            formik.handleBlur
                                                                                        }
                                                                                        value={roleOptions().find(
                                                                                            (
                                                                                                option
                                                                                            ) =>
                                                                                                option.value ===
                                                                                                formik
                                                                                                    ?.values
                                                                                                    ?.workflow[
                                                                                                    index
                                                                                                ]
                                                                                                    ?.roleId
                                                                                        )}
                                                                                        placeholder="Select Role*"
                                                                                        name={`workflow.${index}.roleId`}
                                                                                        isDisabled={
                                                                                            formik
                                                                                                .values
                                                                                                .workflow?.[
                                                                                                index
                                                                                            ]
                                                                                                ?.departmentId ===
                                                                                            null
                                                                                        }
                                                                                    />
                                                                                    {formik
                                                                                        .touched
                                                                                        .workflow?.[
                                                                                        index
                                                                                    ]
                                                                                        ?.roleId &&
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.roleId && (
                                                                                            <div
                                                                                                className="error-message"
                                                                                                style={{
                                                                                                    color: "red",
                                                                                                }}>
                                                                                                {
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .workflow[
                                                                                                        index
                                                                                                    ]
                                                                                                        .roleId
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>

                                                                        </>
                                                                    )}

                                                                {workflow.workflowMethod ===
                                                                    "user" && (
                                                                        <>
                                                                            <FormGroup className="form-md-line-input mb-3">
                                                                                <Label className="form-label">
                                                                                    {" "} Select User{" "}
                                                                                    <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                                </Label>

                                                                                <div className="input_box text-start">
                                                                                    <Select
                                                                                        isMulti
                                                                                        value={workflow.selectedUser.map(
                                                                                            (
                                                                                                userId
                                                                                            ) => {
                                                                                                const user =
                                                                                                    userLists?.find(
                                                                                                        (
                                                                                                            user
                                                                                                        ) =>
                                                                                                            user.id ===
                                                                                                            userId
                                                                                                    );
                                                                                                return user
                                                                                                    ? {
                                                                                                        value: user.id,
                                                                                                        label: user.name,
                                                                                                    }
                                                                                                    : null;
                                                                                            }
                                                                                        )}
                                                                                        onChange={(
                                                                                            selectedOptions
                                                                                        ) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                "selectedUser",
                                                                                                selectedOptions.map(
                                                                                                    (
                                                                                                        option
                                                                                                    ) =>
                                                                                                        option.value
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                        options={userLists?.map(
                                                                                            (
                                                                                                user
                                                                                            ) => ({
                                                                                                value: user.id,
                                                                                                label: user.name,
                                                                                            })
                                                                                        )}
                                                                                        onBlur={
                                                                                            formik.handleBlur
                                                                                        }
                                                                                        name={`workflow.${index}.selectedUser`}
                                                                                    />
                                                                                    {formik
                                                                                        .touched
                                                                                        .workflow?.[
                                                                                        index
                                                                                    ]
                                                                                        ?.selectedUser &&
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow?.[
                                                                                            index
                                                                                        ]
                                                                                            ?.selectedUser && (
                                                                                            <div
                                                                                                className="error-message"
                                                                                                style={{
                                                                                                    color: "red",
                                                                                                }}>
                                                                                                {
                                                                                                    formik
                                                                                                        .errors
                                                                                                        .workflow[
                                                                                                        index
                                                                                                    ]
                                                                                                        .selectedUser
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </FormGroup>

                                                                        </>
                                                                    )}
                                                                <FormGroup className="form-md-line-input mb-3">
                                                                    <Label className="form-label">
                                                                        {" "} Turnaround Time (TAT) in Days{" "}
                                                                        <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                    </Label>
                                                                    <div className="input_box text-start">
                                                                        <Input
                                                                            type="number"
                                                                            className="form-control"
                                                                            placeholder="Enter TAT in days"
                                                                            value={
                                                                                workflow.TAT
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "TAT",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            name={`workflow.${index}.TAT`}
                                                                        />
                                                                        {formik
                                                                            .touched
                                                                            .workflow?.[
                                                                            index
                                                                        ]
                                                                            ?.TAT &&
                                                                            formik
                                                                                .errors
                                                                                .workflow?.[
                                                                                index
                                                                            ]
                                                                                ?.TAT && (
                                                                                <div
                                                                                    className="error-message"
                                                                                    style={{
                                                                                        color: "red",
                                                                                    }}>
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow[
                                                                                            index
                                                                                        ]
                                                                                            .TAT
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </FormGroup>





                                                                <FormGroup className="form-md-line-input mb-3">
                                                                    <Label className="form-label">
                                                                        {" "} Direct Approval{" "}
                                                                        <span aria-required="true" className="required d-inline"> {" "} *{" "} </span>{" "}
                                                                    </Label>
                                                                    <div className="input_box text-start">
                                                                        <Input
                                                                            type="select"
                                                                            className={
                                                                                formik
                                                                                    .values
                                                                                    .workflow?.[
                                                                                    index
                                                                                ]
                                                                                    ?.departmentId ===
                                                                                    null
                                                                                    ? "bg-grey text-start"
                                                                                    : "bg-white text-start"
                                                                            }
                                                                            disabled={
                                                                                formik
                                                                                    .values
                                                                                    .workflow?.[
                                                                                    index
                                                                                ]
                                                                                    ?.departmentId ===
                                                                                null
                                                                            }
                                                                            value={
                                                                                workflow.isDirectApproval
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "isDirectApproval",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                handleDirectApproval(
                                                                                    index,
                                                                                    "isDirectApproval",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            onBlur={
                                                                                formik.handleBlur
                                                                            }
                                                                            name={`workflow.${index}.isDirectApproval`}>
                                                                            <option value="">
                                                                                Select
                                                                                Approval
                                                                            </option>
                                                                            <option value="1">
                                                                                Yes
                                                                            </option>
                                                                            <option value="0">
                                                                                No
                                                                            </option>
                                                                        </Input>

                                                                        {formik
                                                                            .touched
                                                                            .workflow?.[
                                                                            index
                                                                        ]
                                                                            ?.isDirectApproval &&
                                                                            formik
                                                                                .errors
                                                                                .workflow?.[
                                                                                index
                                                                            ]
                                                                                ?.isDirectApproval && (
                                                                                <div
                                                                                    className="error-message"
                                                                                    style={{
                                                                                        color: "red",
                                                                                    }}>
                                                                                    {
                                                                                        formik
                                                                                            .errors
                                                                                            .workflow[
                                                                                            index
                                                                                        ]
                                                                                            .isDirectApproval
                                                                                    }
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                </FormGroup>

                                                            </div>
                                                        </div>
                                                    )
                                            )}
                                    </div>

                                    <Row>
                                        <Col
                                            md={12}
                                            className="text-center d-flex align-items-center justify-content-center">
                                            <Button
                                                type="submit"
                                                color="primary"
                                                className=" btn btn-primary  mx-1">
                                                <i className="ri-save-3-line label-icon align-middle me-2"></i>
                                                <span className="ms-2">
                                                    Submit
                                                </span>
                                            </Button>
                                            <Button
                                                outline
                                                className="btn  btn-outline-primary mx-1"
                                                onClick={handleCloseModal}>
                                                <i className="ri-close-line label-icon align-middle  "></i>
                                                <span className="ms-2">
                                                    Cancel
                                                </span>
                                            </Button>
                                        </Col>
                                    </Row>
                                </form>
                            </SimpleBar>
                        </Offcanvas>
                    </div>
                </div>
            </div>
            <ScrollToTop />
        </>
    );
};

export default AddWorkflow;
