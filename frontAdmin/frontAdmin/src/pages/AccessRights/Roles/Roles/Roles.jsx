import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Input,
    Button,
    Table,
    Badge,
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
//Import Icons
import { BiSortAlt2 } from "react-icons/bi";
import FeatherIcon from "feather-icons-react";
import { useFormik } from "formik";
import DepartmentRolesModal from "./RolesModal";
import Pagination from "../../../../CustomComponents/Pagination";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../../../common/CommonFunctions/common";
import Loader, { LoaderSpin } from "../../../../common/Loader/Loader";
import ScrollToTop from "../../../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { Eye, UserPlus } from "feather-icons-react/build/IconComponents";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../../../common/UserInfo/DepartmentUserInfo";
import errorImage from "../../../../assets/images/error.gif";
import NotFound from "../../../../common/NotFound/NotFound";
import useAxios from "../../../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../../../slices/layouts/reducer";
import ColumnConfig from "../../../../common/ColumnConfig/ColumnConfig";
const BlankData = process.env.REACT_APP_BLANK;

const Roles = () => {
    const axiosInstance = useAxios();
    // table data filter search sort
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const dispatch = useDispatch();
    const tableName = "roles";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Role Name",
        "Departments",
        userData?.isCoreTeam !== "0" ? "Core Team" : null,
        "Support Team",
        "Department Admin",
        "Modified Date",
    ].filter(Boolean);
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Role Name", "Departments", userData?.isCoreTeam !== "0" ? "Core Team" : null, "Support Team","Department Admin","Modified Date", "Action"].filter(Boolean) // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);

    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [departmentList, setDepartmentList] = useState([]);
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("asc");
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [moduleData, setModuleData] = useState([]);
    const [permissionList, setPermissionsList] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [intData, setIntData] = useState([
        {
            role: {
                roleName: "",
                isCoreTeam: "",
                isSupportTeam:"0",
                isAdmin:"0",
                departmentId: [],
            },
            modules: [],
        },
    ]);
    //  pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const RolesPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "roles"
        );
    const viewPermissions = RolesPermissions
        ? hasViewPermission(RolesPermissions)
        : false;
    const createPermission = RolesPermissions
        ? hasCreatePermission(RolesPermissions)
        : false;
    const editPermission = RolesPermissions
        ? hasEditPermission(RolesPermissions)
        : false;
    const deletePermission = RolesPermissions
        ? hasDeletePermission(RolesPermissions)
        : false;
    const handleShow = () => {
        setShow(true);
    };

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const handleClose = () => {
        setShow(false);
        setIsUpdate(false);
        setSelectedDepartment(null);
        setSelectedDept();
        formik.resetForm();
        formik.setErrors({});
        setIntData([
            {
                role: {
                    roleName: "",
                    isCoreTeam: userData?.isCoreTeam === "0" ? "0" : null,
                    isSupportTeam:userData?.isSupportTeam,
                    isAdmin:"0",
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? [userData?.departmentId]
                            : [],
                },
                modules: moduleData.map((module) => ({
                    moduleId: module.id,
                    allowPermissions: module?.modulesPermissions,
                    modulePermissions: [],
                    moduleName: module.moduleName,
                })),
            },
        ]);
    };

    const fetchRoleList = async () => {
        try {
            setIsLoading(true);
            let isCoreTeamDept = userData?.isCoreTeam === "0";
            const response = await axiosInstance.post(
                `userService/roles/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    departmentId: isCoreTeamDept
                        ? (userData?.departmentId || "").split(',').map(id => id.trim())
                        : selectedDept,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                }
            );

            // Decrypt the response data if needed
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    const listOfSearch = async () => {
        try {
            setIsLoading(true);
            let isCoreTeamDept = userData?.isCoreTeam === "0";
            const response = await axiosInstance.post(
                `userService/roles/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    departmentId: isCoreTeamDept
                        ? (userData?.departmentId || "").split(',').map(id => id.trim())
                        : selectedDept,
                    roleName: searchQuery,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                }
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };
    const listOfDepartments = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    useEffect(() => {
        listOfDepartments();
    }, []);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                listOfSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        selectedDept,
        searchQuery,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            fetchRoleList();
        }
    }, [
        selectedDept,
        searchQuery,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
    ]);

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
    };

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (page) => {
        if (page < 1) {
            page = 1;
        } else if (page > totalPages) {
            page = totalPages;
        }
        setCurrentPage(page);

        if (page === totalPages) {
            document
                .querySelector(".pagination-next")
                .classList.add("disabled");
        } else {
            document
                .querySelector(".pagination-next")
                .classList.remove("disabled");
        }

        if (page === 1) {
            document
                .querySelector(".pagination-prev")
                .classList.add("disabled");
        } else {
            document
                .querySelector(".pagination-prev")
                .classList.remove("disabled");
        }
    };

    const handleDepartmentSearch = (e) => {
        setCurrentPage(1);
        if (e) {
            setSelectedDept(e);
        } else {
            setSelectedDept("");
        }
    };

    const resetFilters = async () => {
        setCurrentPage(1);
        setSelectedDept("");
        setSearchQuery("");
        setPerPageSize(10)
    };

    const addRolesModulePermissionsData = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `userService/roles/create`,
                {
                    ...values,
                }
            );
            if (response) {
                toast.success("Roles added successfully.");
                fetchRoleList();
                setSelectedDept();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error(
                "Something went wrong while create new role module permisssions"
            );
            console.error(
                "Something went wrong while create new role module permisssions"
            );
        }
    };

    const updateModulePermissionsData = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.put(
                `userService/roles/update`,
                {
                    ...values,
                }
            );
            if (response) {
                toast.success("Roles updated successfully.");
                fetchRoleList();
                setSelectedDept();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error(
                "Something went wrong while update role module permisssions"
            );
            console.error(
                "Something went wrong while update role module permisssions"
            );
        }
    };
    const deleteRoles = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this role!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/roles/delete`,
                    {
                        id: deleteId,
                    }
                );
                if (response) {
                    toast.success(`Role deleted successfully.`);
                    fetchRoleList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete role.`);
                console.error(error);
            }
        }
    };
    const departmentOptions = [
        ...departmentList.map((department) => ({
            value: department.id,
            label: department.departmentName,
        })),
    ];
    const updateDepartment = async (id) => {
        try {
            setShow(true);
            const response = await axiosInstance.post(
                `userService/roleModulePermissions/view`,
                { roleId: id }
            );
            if (response) {
                setIsUpdate(true);
                const { role } = response?.data?.data[0];
                const { departmentId } = role;

                if (departmentId && departmentId.length > 0) {
                    const department = departmentId[0];
                    // Find the corresponding department option
                    const selectedDepartment = departmentOptions.find(
                        (option) => option.value === department
                    );
                    if (selectedDepartment) {
                        setSelectedDepartment([selectedDepartment]);
                    }
                }

                if (response?.data?.data?.length > 0) {
                    intData.map((data, index) => {
                        intData[index].role = response?.data?.data[0].role;

                        intData[index].modules.map((module) => {
                            const matchedModule =
                                response?.data?.data[0].modules.find(
                                    (apiModule) =>
                                        apiModule.moduleId === module.moduleId
                                );
                            if (matchedModule) {
                                module.modulePermissions =
                                    matchedModule.modulePermissions;
                            } else {
                                module.modulePermissions = [];
                            }
                        });
                    });
                    setIntData([...intData]);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };

    const getmodulesData = async () => {
        try {
            // const response = await axiosInstance.post(`userService/modules/view`, {});
            const response = await axiosInstance.post(
                `userService/modules/modulePermissionsView`,
                {}
            );

            if (response?.data) {
                const { rows } = response?.data?.data;
                setModuleData(rows);
                // Update intData here as well
                setIntData([
                    {
                        role: {
                            roleName: "",
                            isCoreTeam:
                                userData?.isCoreTeam === "0" ? "0" : null,
                            isSupportTeam:userData?.isSupportTeam,
                            isAdmin:"0",
                            departmentId:
                                userData?.isCoreTeam === "0"
                                    ? [userData?.departmentId]
                                    : [],
                        },
                        modules: rows?.map((module) => ({
                            moduleId: module.id,
                            allowPermissions: module?.modulesPermissions,
                            modulePermissions: [],
                            moduleName: module.moduleName, // Add moduleName key
                        })),
                    },
                ]);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const getPermissions = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/modules/permissionsView`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setPermissionsList(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    useEffect(() => {
        getmodulesData();
        getPermissions();
    }, []);

    useEffect(() => {
        formik.setValues({ formData: intData });
    }, [intData]);

    const formik = useFormik({
        initialValues: {
            formData: intData,
        },
        validate: (values) => {
            const errors = {};

            // Validate role
            if (!values?.formData[0]?.role?.roleName?.trim()) {
                errors.role = "Please enter role name";
            }
            if (!values?.formData[0]?.role?.isSupportTeam?.trim()) {
                errors.isSupportTeam = "Please select support team";
            }
            // validate core Team
            if (!values?.formData[0]?.role?.isCoreTeam?.trim()) {
                errors.isCoreTeam = "Please select core team";
            }
            // validate department
            if (
                values?.formData[0]?.role?.isCoreTeam === "0" &&
                values?.formData[0]?.role?.isSupportTeam === "0" &&
                values?.formData[0]?.role?.departmentId?.length === 0
            ) {
                errors.department = "Please select department";
            }
            // validate modules
            const isModuleValid = values?.formData[0]?.modules.some(
                (module) => module.modulePermissions.length > 0
            );
            if (!isModuleValid) {
                errors.module = "Please select at least one module permission";
            }

            return errors;
        },
        onSubmit: (values) => {
            if (!isUpdate) {
                addRolesModulePermissionsData({ ...values.formData[0] });
            } else {
                updateModulePermissionsData({ ...values.formData[0] });
            }
        },
    });

    const handleCheckboxChange = (
        formIndex,
        moduleIndex,
        permission,
        isChecked
    ) => {
        const path = `formData[${formIndex}].modules[${moduleIndex}].modulePermissions`;
        let newPermissions = [
            ...formik.values.formData[formIndex].modules[moduleIndex]
                .modulePermissions,
        ];

        if (isChecked) {
            // Add permission if checked
            newPermissions.push(permission);
        } else {
            // Remove permission if unchecked
            newPermissions = newPermissions.filter(
                (perm) => perm !== permission
            );
        }

        formik.setFieldValue(path, newPermissions);
    };
    const areAllAllowedChecked = (module) => {
        const allowedPermissions = permissionList.filter((p) =>
            module.allowPermissions.includes(p.id)
        );
        return allowedPermissions.every((p) =>
            module.modulePermissions.includes(p.id)
        );
    };

    // Handle changes for all allowed permissions
    const handleAllPermissionsChange = (formIndex, moduleIndex, isChecked) => {
        const allowedPermissions = permissionList.filter((p) =>
            formik.values.formData[formIndex].modules[
                moduleIndex
            ].allowPermissions.includes(p.id)
        );
        const path = `formData[${formIndex}].modules[${moduleIndex}].modulePermissions`;

        let newPermissions = [
            ...formik.values.formData[formIndex].modules[moduleIndex]
                .modulePermissions,
        ];
        if (isChecked) {
            // Add all allowed permissions if not already added
            allowedPermissions.forEach((p) => {
                if (!newPermissions.includes(p.id)) {
                    newPermissions.push(p.id);
                }
            });
        } else {
            // Remove all allowed permissions
            newPermissions = newPermissions.filter(
                (perm) => !allowedPermissions.some((p) => p.id === perm)
            );
        }

        formik.setFieldValue(path, newPermissions);
    };
    const handleSelectChange = (selectedOptions) => {
        formik.initialValues.departmentId = selectedOptions.value;
        setSelectedDepartment(selectedOptions);
        const selectedDepartmentIds = selectedOptions.map(
            (option) => option.value
        );
        const updatedFormData = formik.values.formData.map((item) => ({
            ...item,
            role: {
                ...item.role,
                departmentId: selectedDepartmentIds,
                departmentName: selectedOptions.map((option) => option.label),
            },
        }));
        formik.setValues({
            ...formik.values,
            formData: updatedFormData,
        });
    };
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
    const updateTableConfig = async (selectedColumns) => {
        setOpenColumnModal(false);
        try {
            const response = await axiosInstance.post(
                `userService/table/update-table-config`,
                {
                    userId: userId,
                    tableName: tableName,
                    tableConfig: selectedColumns,
                }
            );
            if (response) {
                fetchTableConfigData();
            }
        } catch (error) {
            console.error("Something went wrong while update banner");
        }
    };

    // Function to handle selecting all columns
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all columns
            setSelectedColumns(allColumns);
        } else {
            // Deselect all columns
            setSelectedColumns([]);
        }
    };

    // Function to handle individual column selection
    const handleColumnChange = (column) => {
        if (selectedColumns.includes(column)) {
            // If the column is already selected, remove it
            setSelectedColumns(selectedColumns.filter((col) => col !== column));
        } else {
            // Otherwise, add it to the selected columns
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    // Function to handle applying changes
    const handleApplyChanges = (e) => {
        e.preventDefault();
        // Add logic to handle applying column changes
        updateTableConfig(selectedColumns);
    };

    // Function to handle canceling changes
    const handleCancel = () => {
        setSelectedColumns([]); // Reset the selected columns
        setOpenColumnModal(false); // Close the dropdown
    };

    // Function to toggle the column modal
    const handleOpenColumnModal = (isOpen) => {
        setOpenColumnModal(isOpen);
    };

    document.title = "Roles | eGov Solution";
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <Container fluid>
                            <Row>
                                <DepartmentUserInfo />
                                <Col xs="12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Roles</h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col xxl="12">
                                    <Card className="border-0">
                                        <CardBody className="border-0">
                                            <Row className=" ">
                                                <Col sm="6" lg="3" xl="3" className="mb-3 mb-md-0" >
                                                    <div className="search-box">
                                                        <Input
                                                            type="text"
                                                            className="form-control search bg-light border-light"
                                                            placeholder="Search"
                                                            value={searchQuery}
                                                            onChange={
                                                                handleInputSearch
                                                            }
                                                        />
                                                        <i className="ri-search-line search-icon"></i>
                                                    </div>
                                                </Col>

                                                {userData &&
                                                    userData?.isCoreTeam ===
                                                    "0" ? null : (
                                                    <Col sm="6" lg="3" xl="3" className="mb-3 mb-lg-0 " >   <div className=" input-light">
                                                        <Select
                                                            className="bg-choice text-sart "
                                                            options={[
                                                                { value: "", label: "Select Department*" },
                                                                ...departmentOptions,
                                                            ]}
                                                            onChange={(
                                                                value
                                                            ) =>
                                                                handleDepartmentSearch(
                                                                    value.value
                                                                )
                                                            }
                                                            value={
                                                                selectedDept
                                                                    ? departmentOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            selectedDept
                                                                    )
                                                                    : null
                                                            }
                                                            placeholder="Select Department*"
                                                            name="Select Department*"
                                                            styles={{
                                                                control: (
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
                                                    </div>
                                                    </Col>
                                                )}
                                                <Col className="mb-3 mb-sm-0 ">
                                                    <Button type="button" className="btn btn-primary btn-label bg-warning border-warning  " onClick={resetFilters} title="Reset" >
                                                        {/* <RefreshCcw
                                                                className="text-muted me-2"
                                                                width="16"
                                                                height="16"
                                                            />
                                                            <span> Reset </span> */}
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </Button>

                                                </Col>
                                                <Col className=" d-flex  justify-content-end align-items-start  mb-md-0">
                                                    {createPermission && (

                                                        <Button
                                                            color="primary"
                                                            type="button"
                                                            className="btn btn-primary btn-label me-3 w-xl"
                                                            id="create-btn"
                                                            onClick={handleShow} title="Create Roles"
                                                        >
                                                            <i className=" ri-user-add-line label-icon align-middle fs-20 me-2"></i>
                                                            {/* <UserPlus
                                                                className=" align-middle fs-16 me-2"
                                                                width="20"
                                                                height="20"
                                                            /> */}
                                                            Create Roles
                                                        </Button>

                                                    )}
                                                    <ColumnConfig
                                                        openColumnModal={
                                                            openColumnModal
                                                        }
                                                        handleOpenColumnModal={
                                                            handleOpenColumnModal
                                                        }
                                                        handleApplyChanges={
                                                            handleApplyChanges
                                                        }
                                                        handleSelectAll={
                                                            handleSelectAll
                                                        }
                                                        selectedColumns={
                                                            selectedColumns
                                                        }
                                                        allColumns={allColumns}
                                                        handleColumnChange={
                                                            handleColumnChange
                                                        }
                                                        handleCancel={handleCancel}
                                                    />



                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col xxl="12">
                                    <Card className="border-0 mb-0">
                                        <CardBody className="pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                    <Table
                                                        className="table align-middle table-nowrap mb-0 com_table"
                                                        id="tasksTable"
                                                    >
                                                        <thead className="bg-white">
                                                            <tr className="text-capitalize">
                                                                {columns.includes(
                                                                    "Role Name"
                                                                ) && (
                                                                        <th
                                                                            className=" fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "roleName"
                                                                                )
                                                                            }
                                                                        >
                                                                       Role Name{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Departments"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "departmentId"
                                                                                )
                                                                            }
                                                                        >
                                                                            Departments{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Core Team"
                                                                ) &&
                                                                    userData &&
                                                                    userData?.isCoreTeam !==
                                                                    "0" && (
                                                                        <th className="fw-bold">
                                                                            Core
                                                                            Team{" "}
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Support Team"
                                                                ) &&
                                                                    (
                                                                        <th className="fw-bold">
                                                                            Support Team{" "}
                                                                        </th>
                                                                    )}
                                                                     {columns.includes(
                                                                    "Department Admin"
                                                                ) &&
                                                                    (
                                                                        <th className="fw-bold">
                                                                            Department Admin{" "}
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Modified Date"
                                                                ) && (
                                                                        <th
                                                                            className=" fw-bold  cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "updateDate"
                                                                                )
                                                                            }
                                                                        >
                                                                            Modified
                                                                            Date{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Action"
                                                                ) && (
                                                                        <th className=" fw-bold text-center">
                                                                            {" "}
                                                                            Action{" "}
                                                                        </th>
                                                                    )}
                                                            </tr>
                                                        </thead>

                                                        <tbody className="list form-check-all">
                                                            {isLoading ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan="6"
                                                                        className="text-center"
                                                                    >
                                                                        <LoaderSpin />
                                                                    </td>
                                                                </tr>
                                                            ) : data.length ===
                                                                0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan="6"
                                                                        className="text-center"
                                                                    >
                                                                        {" "}
                                                                        <NotFound
                                                                            heading="Roles not found."
                                                                            message="Unfortunately, roles not available at the moment."
                                                                        />{" "}
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                data.map(
                                                                    (
                                                                        roleData,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {columns.includes(
                                                                                "Role Name"
                                                                            ) && (
                                                                                    <td>
                                                                                        <div className="d-flex align-items-center">
                                                                                            <div className="flex-grow-1 fw-semibold">
                                                                                                {roleData.roleName ||
                                                                                                    BlankData}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Departments"
                                                                            ) && (
                                                                                    <td>
                                                                                        <div className="flex-grow-1">
                                                                                            {roleData.departmentName ||
                                                                                                BlankData}
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Core Team"
                                                                            ) &&
                                                                                (userData
                                                                                    ? userData?.isCoreTeam !==
                                                                                    "0" && (
                                                                                        <td className="status-update text-success fw-bold">
                                                                                            {roleData.isCoreTeam ===
                                                                                                "1" ? (
                                                                                                <div className="badge badge-soft-success text-success fs-12">
                                                                                                    <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                                    Yes
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="badge badge-soft-warning text-warning fs-12">
                                                                                                    <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                                    No
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                    )
                                                                                    : BlankData)}
                                                                            {columns.includes(
                                                                                "Support Team"
                                                                            ) &&
                                                                                (
                                                                                    <td className="status-update text-success fw-bold">
                                                                                        {roleData.isSupportTeam ===
                                                                                            "1" ? (
                                                                                            <div className="badge badge-soft-success text-success fs-12">
                                                                                                <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                                Yes
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="badge badge-soft-warning text-warning fs-12">
                                                                                                <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                                No
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                    
                                                                                )}
                                                                                  {columns.includes(
                                                                                "Department Admin"
                                                                            ) &&
                                                                                (
                                                                                    <td className="status-update text-success fw-bold">
                                                                                        {roleData.isAdmin ===
                                                                                            "1" ? (
                                                                                            <div className="badge badge-soft-success text-success fs-12">
                                                                                                <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                                Yes
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="badge badge-soft-warning text-warning fs-12">
                                                                                                <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                                No
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                    
                                                                                )}
                                                                            {columns.includes(
                                                                                "Modified Date"
                                                                            ) && (
                                                                                    <td className="  ">
                                                                                        {roleData.updateDate
                                                                                            ? format(
                                                                                                new Date(
                                                                                                    roleData.updateDate
                                                                                                ),
                                                                                                "dd MMM, yyyy - h:mm a"
                                                                                            )
                                                                                            : BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Action"
                                                                            ) && (
                                                                                    <td className="status text-center">
                                                                                        <span>
                                                                                            {viewPermissions &&
                                                                                                !editPermission && (
                                                                                                    <span
                                                                                                        title="view"
                                                                                                        className="cursor-pointer me-4"
                                                                                                        onClick={() =>
                                                                                                            updateDepartment(
                                                                                                                roleData.id
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Eye
                                                                                                            width="16"
                                                                                                            height="16"
                                                                                                            className="text-primary "
                                                                                                        />
                                                                                                    </span>
                                                                                                )}
                                                                                            {editPermission && (
                                                                                                <span
                                                                                                    title="Edit"
                                                                                                    className="cursor-pointer me-4"
                                                                                                    onClick={() =>
                                                                                                        updateDepartment(
                                                                                                            roleData.id
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <FiEdit2 />
                                                                                                </span>
                                                                                            )}
                                                                                            {deletePermission && (
                                                                                                <span
                                                                                                    title="Delete"
                                                                                                    className="cursor-pointer"
                                                                                                    onClick={() => {
                                                                                                        deleteRoles(
                                                                                                            roleData.id
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <RiDeleteBinLine className="" />
                                                                                                </span>
                                                                                            )}
                                                                                        </span>
                                                                                    </td>
                                                                                )}
                                                                        </tr>
                                                                    )
                                                                )
                                                            )}
                                                        </tbody>
                                                    </Table>
                                                {/* </SimpleBar> */}
                                            </div>
                                            <Pagination
                                                totalCount={totalCount}
                                                perPageSize={perPageSize}
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                handleSelectPageSize={
                                                    handleSelectPageSize
                                                }
                                                handlePageChange={
                                                    handlePageChange
                                                }
                                            />
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
                <DepartmentRolesModal
                    show={show}
                    handleClose={handleClose}
                    isUpdate={isUpdate}
                    formik={formik}
                    departmentOptions={departmentOptions}
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    handleSelectChange={handleSelectChange}
                    handleCheckboxChange={handleCheckboxChange}
                    loading={loading}
                    permissionList={permissionList}
                    areAllAllowedChecked={areAllAllowedChecked}
                    handleAllPermissionsChange={handleAllPermissionsChange}
                    userData={userData}
                    viewPermissions={viewPermissions}
                    createPermission={createPermission}
                    editPermission={editPermission}
                />
            </div>
            <ScrollToTop />
        </>
    );
};

export default Roles;
