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
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../../css/fileupload.css";
import Pagination from "../../../../CustomComponents/Pagination";
import Swal from "sweetalert2";
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";
import Noimage from "../../../../assets/images/NoImage.jpg";
import UserAddUpdateModal from "./UserModal";
import userIcon from "../../../../assets/images/userIcon.webp";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../../../common/CommonFunctions/common";
import errorImage from "../../../../assets/images/error.gif";
import Loader, { LoaderSpin } from "../../../../common/Loader/Loader";
import ScrollToTop from "../../../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { Eye, UserPlus } from "feather-icons-react/build/IconComponents";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../../../common/UserInfo/DepartmentUserInfo";
import NotFound from "../../../../common/NotFound/NotFound";
import useAxios from "../../../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../../../slices/layouts/reducer";
import ColumnConfig from "../../../../common/ColumnConfig/ColumnConfig";

const BlankData = process.env.REACT_APP_BLANK;
export function stringAvatar(userData) {
    return `${userData?.name?.split("")[0].toUpperCase()}${userData?.name
        ?.split("")[1]
        .toUpperCase()}`;
}
const UserList = () => {
    const axiosInstance = useAxios();
    const getIpInfo = useSelector((state) => state?.Layout?.ipData);
    const ipAddress = getIpInfo?.ip;

    // table data filter search sort

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const dispatch = useDispatch();
    const tableName = "users";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Name",
        "Email",
        "Phone",
        "Role",
        "Department",
        userData?.isCoreTeam !== "0" ? "Core Team" : null,
        "Status",
    ].filter(Boolean);
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "Name",
            "Email",
            "Phone",
            "Role",
            "Department",
            userData?.isCoreTeam !== "0" ? "Core Team" : null,
            "Status",
            "Action",
        ].filter(Boolean)
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("asc");
    // add update modal
    const [isCoreteam, setIscoreteam] = useState(false);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    const [listofRoleBydept, setListofRoleByDept] = useState([]);
    // dropdown department data
    const [departmentList, setDepartmentList] = useState([]);
    const [roleList, setRolelist] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    // upload Image
    const [loading, setLoading] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const UserPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "users"
        );
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

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const handleImageUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const allowedFormats = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];
        const maxSize = 1024 * 1024;

        if (selectedFile.size > maxSize) {
            formik.setFieldError(
                "documentFile",
                "Please select an image file that is less than 1MB."
            );
            event.target.value = null;
            return;
        }

        if (!allowedFormats.includes(selectedFile.type)) {
            formik.setFieldError(
                "documentFile",
                "Please select a valid image file (JPEG, JPG, or PNG)."
            );
            event.target.value = null;
            return;
        }

        formik.setFieldValue("documentFile", selectedFile);
        setSelectedFile(selectedFile);
        formik.setFieldError("documentFile", "");
    };

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        setSelectedFile(null);
        formik.resetForm();
        formik.setErrors({});
        // setIscoreteam(false);
    };

    const fetchUserList = async () => {
        try {
            setIsUserLoading(true);
            const response = await axiosInstance.post(`userService/user/view`, {
                page: currentPage,
                perPage: perPageSize,
                sortOrder: sortOrder,
                sortBy: orderBy,
                status: selectedStatus,
                departmentId:
                    userData?.isCoreTeam === "0"
                        ? (userData?.departmentId || "").split(',').map(id => id.trim()).filter(Boolean)
                        : selectedDepartment ? [selectedDepartment] : [],
                roleId: selectedRole,
            });

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);

                setIsUserLoading(false);
            }
        } catch (error) {
            setIsUserLoading(false);
            console.error(error.message);
        }
    };

    const listOfSearch = async () => {
        try {
            setIsUserLoading(true);
            const response = await axiosInstance.post(`userService/user/view`, {
                page: currentPage,
                perPage: perPageSize,
                searchFilter: searchQuery,
                sortOrder: sortOrder,
                sortBy: orderBy,
                filter: searchQuery,
                status: selectedStatus,
                departmentId:
                    userData?.isCoreTeam === "0"
                        ? (userData?.departmentId || "").split(',').map(id => id.trim()).filter(Boolean)
                        : selectedDepartment ? [selectedDepartment] : [],
                roleId: selectedRole,
            });

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsUserLoading(false);
            }
        } catch (error) {
            setIsUserLoading(false);
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

    const listOfRoles = async () => {
        try {
            if (selectedDepartment) {
                const response = await axiosInstance.post(
                    `userService/roles/view`,
                    {
                        departmentId: selectedDepartment,
                    }
                );
                if (response?.data) {
                    const { rows } = response?.data?.data;
                    setRolelist(rows);
                }
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    const listOfRolesByDepartment = async (departmentId) => {
        try {
            const response = await axiosInstance.post(
                `userService/roles/view`,
                {
                    departmentId: (departmentId.split(',').map(id => id.trim())),
                }
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setListofRoleByDept(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    const listOfRolesByCoreaTeam = async (isCoreTeam) => {
        try {
            const response = await axiosInstance.post(
                `userService/roles/view`,
                {
                    isCoreTeam: isCoreTeam,
                }
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setListofRoleByDept(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };
    const listOfRolesBySupportTeam = async (isSupportTeam) => {
        try {
            const response = await axiosInstance.post(
                `userService/roles/view`,
                {
                    isSupportTeam: isSupportTeam,
                }
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setListofRoleByDept(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    useEffect(() => {
        listOfDepartments();
    }, []);
    useEffect(() => {
        listOfRoles();
    }, [selectedDepartment]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                listOfSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        searchQuery,
        selectedDepartment,
        selectedRole,
        selectedStatus,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            fetchUserList();
        }
    }, [
        searchQuery,
        selectedDepartment,
        selectedRole,
        selectedStatus,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
    ]);

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
    };
    const handleDepartmentSearch = (value) => {
        setCurrentPage(1);
        if (value) {
            setSelectedDepartment(value);
        } else {
            setSelectedDepartment("");
        }
    };
    const handleRoleSearch = (selectedRole) => {
        setCurrentPage(1);
        if (selectedRole) {
            setSelectedRole(selectedRole);
        } else {
            setSelectedRole("");
        }
    };
    const handleStatusSearch = (selectedStatus) => {
        setCurrentPage(1);
        if (selectedStatus) {
            setSelectedStatus(selectedStatus);
        } else {
            setSelectedStatus("");
        }
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

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
        setSelectedRole("");
        setSelectedStatus("");
        if (userData?.isCoreTeam !== "0") {
            setRolelist([]);
            setSelectedDepartment("");
        }
    };

    const addUser = async (values) => {
        try {
            setLoading(true);
            let fileId = null;
            if (selectedFile) {
                const formData = new FormData();
                formData.append("viewDocumentName", values?.name);
                formData.append("documentFile", values?.documentFile);
                formData.append("userId", userId);
                formData.append("isGenerated", "0");
                formData.append("isShowInDocument", "0");
                const fileResponse = await axiosInstance.post(
                    "documentService/uploading",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                fileId = fileResponse?.data?.data
                    ? fileResponse?.data?.data?.[0]?.id
                    : null;
            }
            const response = await axiosInstance.post(
                `userService/user/create`,
                {
                    ...values,
                    profileImageId: fileId,
                    documentFile: undefined,
                    userId: undefined,
                    ipAddress: ipAddress,
                }
            );
            if (response) {
                toast.success("User added successfully.");
                fetchUserList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            if (error?.response?.data?.message === "User aleady exists") {
                toast.error("User already exists");
            } else {
                toast.error("Something went wrong while create new user");
            }

            setLoading(false);
            console.error("Something went wrong while create new user");
        }
    };

    const updateUser = async (id, values) => {
        try {
            if (id) {
                setLoading(true);
                let fileId = null;
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("viewDocumentName", values?.name);
                    formData.append("documentFile", values?.documentFile);
                    formData.append("userId", userId);
                    formData.append("isGenerated", "0");
                    formData.append("isShowInDocument", "0");
                    const fileResponse = await axiosInstance.post(
                        "documentService/uploading",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    fileId = fileResponse?.data?.data
                        ? fileResponse?.data?.data?.[0]?.id
                        : null;
                }
                const response = await axiosInstance.put(
                    `userService/user/update`,
                    {
                        id: id,
                        ...values,
                        profileImageId: fileId
                            ? fileId
                            : formik.values.profileImageId,
                        documentFile: undefined,
                        userId: undefined,
                        imageData: undefined,
                        ipAddress: ipAddress,
                    }
                );

                if (response) {
                    toast.success("User updated successfully.");
                    fetchUserList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("Something went wrong while update user");
            console.error("Something went wrong while update user");
        }
    };

    const deleteUser = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this user!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/user/delete`,
                    {
                        userId: deleteId,
                        ipAddress: ipAddress,
                    }
                );
                if (response) {
                    toast.success(`User deleted successfully.`);
                    fetchUserList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete User.`);
                console.error(error);
            }
        }
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };
    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Please enter name"),
        email: Yup.string()
            .email("Please enter valid email")
            .required("Please enter email"),
        phone: Yup.string()
            .matches(
                /^\d{10,}$/,
                "Please enter at least 10 digit. Only digits are allowed"
            )
            .required("Please enter phone number"),
        profileImageId: Yup.number(),
        isSupportTeam: Yup.string().required("Please select is support team member"),
        isCoreTeam: Yup.string()
            .test('isCoreTeam', 'Please select core team', function (value) {
                const { isSupportTeam } = this.parent;
                return isSupportTeam !== '0' || (isSupportTeam === '0' && !!value);
            }),
        departmentId: Yup.string()
            .test('departmentId', 'Please select department', function (value) {
                const { isCoreTeam } = this.parent;
                return isCoreTeam !== '0' || (isCoreTeam === '0' && !!value);
            }),
        roleId: Yup.number().required("Please select role"),
        documentFile: selectedFile
            ? Yup.mixed()
            : Yup.mixed().required("Please upload a user image"),
        userId: Yup.number(),
    });
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            profileImageId: "",
            isSupportTeam: "",
            isCoreTeam: userData?.isCoreTeam === "0" ? "0" : "",
            departmentId:
                userData?.isCoreTeam === "0"
                    ? userData?.departmentId
                    : undefined,
            roleId: "",
            documentFile: "",
            userId: 1,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateUser(id, values);
            } else {
                addUser(values);
            }
        },
    });
    const updateUserPrefilledData = (data) => {
        setShow(true);
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                name: data?.name || "",
                email: data?.email || "",
                phone: data?.phone || "",
                profileImageId: data?.profileImageId || "",
                isSupportTeam: data?.isSupportTeam || "",
                isCoreTeam: data?.isCoreTeam || "",
                departmentId: data?.departmentId || undefined,
                roleId: data?.roleId || "",
                status: data?.status || "",
                documentFile: data?.profileImageId || "",
                imageData: data?.imageData || "",
            });
        }
    };

    useEffect(() => {
        if (formik.values.departmentId && formik.values.isSupportTeam === "0") {
            listOfRolesByDepartment(formik.values.departmentId);
        }
    }, [formik.values.departmentId, formik.values.isSupportTeam]);

    useEffect(() => {
        if (formik.values.isCoreTeam === "1") {
            listOfRolesByCoreaTeam(formik.values.isCoreTeam);
            // setIscoreteam(true);
        }
    }, [formik.values.isCoreTeam]);

    useEffect(() => {
        if (formik.values.isSupportTeam === "1") {
            listOfRolesBySupportTeam(formik.values.isSupportTeam);
            // setIscoreteam(true);
        }
    }, [formik.values.isSupportTeam]);
    

    const departmentOptions = [
        { value: "", label: "Select Department*" },
        ...departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        })),
    ];

    const roleOptions = [
        { value: "", label: "Select Role*" },
        ...roleList.map((roleData) => ({
            value: roleData.id,
            label: roleData.roleName,
        })),
    ];

    const statusOptions = [
        { value: "", label: "Select Status*" },
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
    ];
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

    document.title = "Users | eGov Solution";
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
                                        <h4 className="mb-sm-0">Users</h4>
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
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-lg-0">
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
                                                </div>
                                                {userData?.isCoreTeam !==
                                                    "0" && (
                                                        <>
                                                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-lg-0">
                                                            <div className=" input-light">
                                                                <Select
                                                                    className="bg-choice text-start"
                                                                    options={
                                                                        departmentOptions
                                                                    }
                                                                    onChange={(
                                                                        value
                                                                    ) =>
                                                                        handleDepartmentSearch(
                                                                            value.value
                                                                        )
                                                                    }
                                                                    value={
                                                                        selectedDepartment
                                                                            ? departmentOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    selectedDepartment
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
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xxl-0">
                                                            <div className=" input-light">
                                                                <Select
                                                                    isDisabled={
                                                                        !selectedDepartment
                                                                    }
                                                                    className="bg-choice"
                                                                    options={
                                                                        roleOptions
                                                                    }
                                                                    onChange={(value) =>
                                                                        handleRoleSearch(
                                                                            value.value
                                                                        )
                                                                    }
                                                                    value={
                                                                        selectedRole
                                                                            ? roleOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    selectedRole
                                                                            )
                                                                            : null
                                                                    }
                                                                    placeholder="Select Role*"
                                                                    name="Select Role*"
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
                                                        </div>
                                                        </>
                                                     )
                                                }
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0 mb-md-0 mb-lg-0">
                                                    <div className=" input-light">
                                                        <Select
                                                            className="text-start bg-choice"
                                                            options={
                                                                statusOptions
                                                            }
                                                            onChange={(
                                                                option
                                                            ) =>
                                                                handleStatusSearch(
                                                                    option.value
                                                                )
                                                            }
                                                            value={
                                                                selectedStatus
                                                                    ? statusOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            selectedStatus
                                                                    )
                                                                    : null
                                                            }
                                                            placeholder="Select Status*"
                                                            name="Select Status*"
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
                                                </div>
                                                <div className="col   mb-3 mb-xxl-0">
                                                    <Button
                                                        type="button"
                                                        className=" btn btn-primary btn-label bg-warning border-warning me-3 w-md"
                                                        onClick={resetFilters}
                                                    >
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </Button>


                                                </div>
                                                <div className="col d-flex justify-content-end align-items-start   ">

                                                    {createPermission && (

                                                        <Button
                                                            type="button"
                                                            color="primary"
                                                            className="btn btn-primary btn-label me-3 w-lg"
                                                            id="create-btn"
                                                            onClick={handleShow}
                                                        >
                                                            <i className=" ri-user-add-line label-icon align-middle fs-20 me-2"></i>
                                                            Create User
                                                        </Button>

                                                    )}
                                                    <ColumnConfig className=""
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

                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <div className="col-xxl-12">
                                    <Card className="card border-0 mb-0">
                                        <CardBody className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                <Table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable"
                                                >
                                                    <thead className="bg-white">
                                                        <tr>
                                                            {columns.includes(
                                                                "Name"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "name"
                                                                            )
                                                                        }
                                                                    >
                                                                        {" "}
                                                                        Name{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Email"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "email"
                                                                            )
                                                                        }
                                                                    >
                                                                        Email{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Phone"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "phone"
                                                                            )
                                                                        }
                                                                    >
                                                                        Phone{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Role"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "roleName"
                                                                            )
                                                                        }
                                                                    >
                                                                        Role{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Department"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "departmentId"
                                                                            )
                                                                        }
                                                                    >
                                                                        Department{" "}
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
                                                                        {" "}
                                                                        Core
                                                                        Team{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (
                                                                    <th className="fw-bold">
                                                                        Status
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Action"
                                                            ) && (
                                                                    <th className="fw-bold">
                                                                        Action
                                                                    </th>
                                                                )}
                                                        </tr>
                                                    </thead>
                                                    {data &&
                                                        data.length === 0 &&
                                                        !isUserLoading && (
                                                            <tbody></tbody>
                                                        )}

                                                    {isUserLoading ? (
                                                        <thead>
                                                            <tr>
                                                                <td
                                                                    colSpan="8"
                                                                    className="text-center"
                                                                >
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        </thead>
                                                    ) : data.length ===
                                                        0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan="8"
                                                                className="text-center"
                                                            >
                                                                {" "}
                                                                <NotFound
                                                                    heading="Users not found."
                                                                    message="Unfortunately, users not available at the moment."
                                                                />
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.map(
                                                            (
                                                                users,
                                                                index
                                                            ) => (
                                                                <tbody
                                                                    key={
                                                                        index
                                                                    }
                                                                >
                                                                    <tr>
                                                                        {columns.includes(
                                                                            "Name"
                                                                        ) && (
                                                                                <td>
                                                                                    <div>
                                                                                        <div className="d-flex align-items-center">
                                                                                            <div className="flex-shrink-0 me-2">
                                                                                                {users
                                                                                                    ?.imageData
                                                                                                    ?.documentPath ? (
                                                                                                    <img
                                                                                                        src={
                                                                                                            users
                                                                                                                ?.imageData
                                                                                                                ?.documentPath
                                                                                                        }
                                                                                                        alt=""
                                                                                                        className="avatar-xs rounded-circle"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <div>
                                                                                                        {stringAvatar(
                                                                                                            users
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="fw-semibold text-black">
                                                                                                {users.name ||
                                                                                                    BlankData}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Email"
                                                                        ) && (
                                                                                <td>
                                                                                    {users.email ||
                                                                                        BlankData}{" "}
                                                                                    {users.isValidEmail ===
                                                                                        "1" ? (
                                                                                        <MdOutlineVerified
                                                                                            className="text-success fs-4"
                                                                                            title="Verified"
                                                                                        />
                                                                                    ) : (
                                                                                        <VscUnverified
                                                                                            className="text-warning fs-4"
                                                                                            title="Unverified"
                                                                                        />
                                                                                    )}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Phone"
                                                                        ) && (
                                                                                <td>
                                                                                    {users.phone ||
                                                                                        BlankData}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Role"
                                                                        ) && (
                                                                                <td>
                                                                                    {users.roleName ||
                                                                                        BlankData}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Department"
                                                                        ) && (
                                                                                <td className="text-wrap " style={{width:"30%"}}>
                                                                                    {users.departmentName ||
                                                                                        BlankData}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Core Team"
                                                                        ) &&
                                                                            (userData
                                                                                ? userData?.isCoreTeam !==
                                                                                "0" && (
                                                                                    <td className="status-update text-success fw-bold">
                                                                                        {users.isCoreTeam ===
                                                                                            "1" ? (
                                                                                            <div className="badge badge-soft-success text-success fs-12">
                                                                                                <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                                {users.isCoreTeam ===
                                                                                                    "1"
                                                                                                    ? "Yes"
                                                                                                    : "No"}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="badge badge-soft-warning text-warning fs-12">
                                                                                                <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                                {users.isCoreTeam ===
                                                                                                    "1"
                                                                                                    ? "Yes"
                                                                                                    : "No"}
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                )
                                                                                : BlankData)}
                                                                        {columns.includes(
                                                                            "Status"
                                                                        ) && (
                                                                                <td className="status-update fw-bold">
                                                                                    {users.status ===
                                                                                        "1" ? (
                                                                                        <div className="badge badge-soft-success text-success fs-12">
                                                                                            <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                            {users.status ===
                                                                                                "1"
                                                                                                ? "Active"
                                                                                                : "Inactive"}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="badge badge-soft-warning text-warning fs-12">
                                                                                            <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                            {users.status ===
                                                                                                "1"
                                                                                                ? "Active"
                                                                                                : "In-Active"}
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Action"
                                                                        ) && (
                                                                                <td>
                                                                                    <span>
                                                                                        {viewPermissions &&
                                                                                            !editPermission && (
                                                                                                <span
                                                                                                    title="view"
                                                                                                    className="cursor-pointer me-4"
                                                                                                    onClick={() =>
                                                                                                        updateUserPrefilledData(
                                                                                                            users
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
                                                                                                onClick={() =>
                                                                                                    updateUserPrefilledData(
                                                                                                        users
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <FiEdit2 className="cursor-pointer me-4" />
                                                                                            </span>
                                                                                        )}
                                                                                        {deletePermission && (
                                                                                            <span
                                                                                                title="Delete"
                                                                                                onClick={() => {
                                                                                                    deleteUser(
                                                                                                        users.id
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <RiDeleteBinLine className="cursor-pointer" />
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                </td>
                                                                            )}
                                                                    </tr>
                                                                </tbody>
                                                            )
                                                        )
                                                    )}
                                                </Table>
                                                {/* </SimpleBar> */}
                                            </div>
                                        </CardBody>
                                        <Pagination
                                            totalCount={totalCount}
                                            perPageSize={perPageSize}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            handleSelectPageSize={
                                                handleSelectPageSize
                                            }
                                            handlePageChange={handlePageChange}
                                        />
                                    </Card>
                                </div>
                            </Row>
                        </Container>
                    </div>
                </div>
                <UserAddUpdateModal
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    handleImageUpload={handleImageUpload}
                    departmentList={departmentList}
                    listofRoleBydept={listofRoleBydept}
                    loading={loading}
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

export default UserList;
