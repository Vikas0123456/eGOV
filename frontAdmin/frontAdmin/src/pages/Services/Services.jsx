import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Input,
    Button,
    Table,
    FormGroup,
    Label,
} from "reactstrap";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import * as Yup from "yup";
import ServiceModal from "./ServiceModal";
import { FiEdit2 } from "react-icons/fi";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { Eye, UserPlus } from "feather-icons-react/build/IconComponents";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import errorImage from "../../assets/images/error.gif";
import { FaRegCopy } from "react-icons/fa";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import Swal from "sweetalert2";
import CopyServiceModal from "./CopyServiceModal";
import ShortDescriptionModal from "./ShortDescriptionModal";
import { useLocation } from "react-router-dom"

const BlankData = process.env.REACT_APP_BLANK;
const Services = () => {
    const axiosInstance = useAxios();

    const location = useLocation()

    // table data filter search sort
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    const [isLoading, setIsloading] = useState(true);
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    // dropdown department data
    const [departmentList, setDepartmentList] = useState([]);
    const [formList, setFormList] = useState([]);
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [shortDescriptionShow, setShortDescriptionShow] = useState(false);
    const [selectedShortDescription, setSelectedShortDescription] = useState("");
    const [id, setId] = useState();
    const [documentList, setDocumentList] = useState([]);
    //  pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(10);
    const [serviceDataById, setServiceById] = useState(null);
    const [serviceList, setServiceList] = useState([]);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const dispatch = useDispatch();
    const tableName = "services";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Service Name",
        "Short Description",
        "Department Name",
        "Current Version",
        "Priority",
        "Price",
        "Status",
    ];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "Service Name",
            "Short Description",
            "Department Name",
            "Current Version",
            "Priority",
            "Price",
            "Status",
            "Action",
        ] // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);


    //Copy Service
    const [copyServiceLoading, setCopyServiceLoading] = useState(false)
    const [copyServiceData, setCopyServiceData] = useState(null)
    const [copyModalOpen, setCopyModalOpen] = useState(false)

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

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        setSelectedDept();
        formik.resetForm();
        formik.setErrors({});
        setServiceById(null);
    };

    useEffect(() => {
        if (location?.key && show) {
            handleClose()
        }
    }, [location?.key])

    const fetchServiceById = async (id) => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    id: id,
                }
            );
            if (response?.data) {
                if (response?.data) {
                    const { rows } = response?.data?.data;
                    setServiceById(rows[0]);
                    setShow(true);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const fetchServiceList = async () => {
        try {
            setIsloading(true);
            const response = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    departmentId: selectedDept,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsloading(false);
            }
        } catch (error) {
            console.error(error.message);
            setIsloading(false);
        }
    };

    const listOfSearch = async () => {
        try {
            setIsloading(true);
            const response = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    departmentId: selectedDept,
                    searchFilter: searchQuery,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsloading(false);
            }
        } catch (error) {
            console.error(error.message);
            setIsloading(false);
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

    const listOfForm = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/form/list`,
                {
                    fullList: true,
                }
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setFormList(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

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
            fetchServiceList();
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
        setPerPageSize(10);
        setSelectedDept("");
        setSearchQuery("");
    };

    const addService = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/service/create`,
                {
                    ...values,
                }
            );
            if (response) {
                toast.success("Service added successfully.");
                fetchServiceList();
                setSelectedDept();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
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
                    setSelectedDept();
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

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };
    const validationSchema = Yup.object({
        serviceName: Yup.string().required("Please enter service name"),
        slug: Yup.string().required("Please enter slug"),
        shortDescription: Yup.string().required(
            "Please enter short description "
        ),
        departmentId: Yup.number().required("Please select department"),
        currentVersion: Yup.string().required(" Please enter current version"),
        price: Yup.number().required(" Please enter price"),
        priority: Yup.string().required("Please select priority"),
    });

    const handleAddService = async (e, row) => {
        if (row) {
            await fetchServiceById(row?.id);
        } else {
            setShow(true);
        }
    };

    const getDocumentList = async () => {
        await axiosInstance
            .post("documentService/alldocument/list")
            .then((res) => {
                const { data } = res.data;
                setDocumentList(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const getAllServiceList = async () => {
        await axiosInstance
            .post("serviceManagement/service/list")
            .then((res) => {
                const { rows } = res.data.data;
                setServiceList(rows);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const formik = useFormik({
        initialValues: {
            serviceName: "",
            slug: "",
            shortDescription: "",
            departmentId: "",
            currentVersion: "",
            price: "",
            priority: "",
            certificateTemplate: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateService(id, values);
            } else {
                addService(values);
            }
        },
    });

    useEffect(() => {
        listOfDepartments();
        listOfForm();
        getDocumentList();
        getAllServiceList();
    }, []);

    const departmentOptions = departmentList &&
        departmentList.length > 0 && [
            { value: "", label: "Select Department*" },
            ...departmentList.map((department) => ({
                value: department.id,
                label: department.departmentName,
            })),
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
        console.log("Selected Columns:", selectedColumns);
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

    const handleCopyService = (serviceData) => {
        setCopyServiceData(serviceData)
        setCopyModalOpen(true)
    }

    const handleCopyServiceApi = async () => {
        try {
            setCopyServiceLoading(true);
            const latestSlug = await axiosInstance.post(
                `serviceManagement/service/getLatestUniqueSlug`,
                {
                    slug: copyServiceData?.slug,
                }
            );
            if (latestSlug?.data?.data) {
                const updatedData = {
                    ...copyServiceData,
                    slug: latestSlug?.data?.data?.slug,
                    serviceName: copyServiceData?.serviceName?.concat(" copy"),
                    dynamicFields: copyServiceData?.step
                }
                const response = await axiosInstance.post(
                    `serviceManagement/service/create`,
                    {
                        ...updatedData,
                    }
                );
                if (response?.data?.data) {
                    toast.success("Service copied successfully.");
                    fetchServiceList();
                    setCopyServiceData(null)
                    setCopyServiceLoading(false)
                    setCopyModalOpen(false)
                }
            }
        } catch (error) {
            setCopyServiceLoading(false)
            setCopyServiceData(null)
            setCopyModalOpen(false)
            console.error("Something went wrong while copying please try again");
        }
    }

    const handleToggle = () => {
        setShortDescriptionShow(false);
    };

    const handleShortDescription = (shortDescription) => {
        setSelectedShortDescription(shortDescription);
        setShortDescriptionShow(true);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return text;
    };

    document.title = "Services | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                {!show ? (
                    <div className="main-content">
                        <div className="page-content">
                            <Container fluid>
                                <Row>
                                    <DepartmentUserInfo />
                                    <Col xs={12}>
                                        <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                            <h4 className="mb-sm-0">
                                                Services
                                            </h4>
                                            <div className="page-title-right">
                                                <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xxl={12}>
                                        <Card className="border-0">
                                            <CardBody className="border-0">
                                                <div className="row">
                                                    <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xxl-3 mb-3 mb-lg-0">
                                                        <div className="search-box d-flex align-items-center">
                                                            <Input
                                                                type="text"
                                                                className="form-control search bg-light border-light"
                                                                placeholder="Search"
                                                                value={
                                                                    searchQuery
                                                                }
                                                                onChange={
                                                                    handleInputSearch
                                                                }
                                                            />
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6  col-xxl-3 mb-3 mb-lg-0">
                                                        <div className="text-start bg-choice ">
                                                            <Select
                                                                value={
                                                                    (selectedDept &&
                                                                        departmentOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                selectedDept
                                                                        )) ||
                                                                    null
                                                                }
                                                                onChange={(
                                                                    option
                                                                ) =>
                                                                    handleDepartmentSearch(
                                                                        option
                                                                            ? option.value
                                                                            : ""
                                                                    )
                                                                }
                                                                options={
                                                                    departmentOptions
                                                                }
                                                                placeholder="Select Department*"
                                                                name="department"
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
                                                    <div className="col-xl-1 col-lg-3 col-md-4 col-sm-4 col-12 col-4 col-xxl-2  d-flex align-items-start justify-content-start mb-3 mb-lg-0">
                                                        <Button
                                                            color="primary" className="btn btn-primary btn-label bg-warning border-warning " onClick={resetFilters}
                                                        >
                                                            <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                            Reset
                                                        </Button>

                                                    </div>
                                                    <div className="col-xl-4 col-lg-5 col-md-6 col-12 col-sm-8 col-8 col-xxl-3 d-flex align-items-start  justify-content-end ms-auto ">
                                                        {createPermission && (

                                                            <Button
                                                                color="primary"
                                                                id="create-btn"
                                                                className="btn btn-primary btn-label me-3  d-flex align-items-start justify-content-start text-nowra"
                                                                onClick={
                                                                    handleShow
                                                                }
                                                            >
                                                                <i className=" ri-user-add-line label-icon align-middle fs-20 me-2"></i>
                                                                Create Services
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
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col xxl={12}>
                                        <Card className="border-0 mb-0">
                                            <CardBody className="pb-0">
                                                <div className="table-responsive table-card mb-0">
                                                    {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                        <Table
                                                            className="table align-middle table-nowrap mb-0 com_table"
                                                            id="tasksTable"
                                                        >
                                                            <thead className="bg-white">
                                                                <tr>
                                                                    {columns.includes(
                                                                        "Service Name"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "serviceName"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Service
                                                                                Name{" "}
                                                                                <BiSortAlt2 />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Short Description"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "shortDescription"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Short
                                                                                Description{" "}
                                                                                <BiSortAlt2 />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Department Name"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "departmentName"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Department
                                                                                Name{" "}
                                                                                <BiSortAlt2 />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Current Version"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "currentVersion"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Current
                                                                                Version{" "}
                                                                                <BiSortAlt2 />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Priority"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "priority"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Priority{" "}
                                                                                <BiSortAlt2 />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Price"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "price"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Price
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
                                                                            <th className="fw-bold text-center">
                                                                                Action
                                                                            </th>
                                                                        )}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {isLoading ? (
                                                                    <tr>
                                                                        <td
                                                                            colSpan="8"
                                                                            className="text-center"
                                                                        >
                                                                            <LoaderSpin />
                                                                        </td>
                                                                    </tr>
                                                                ) : data.length ===
                                                                    0 ? (
                                                                    <tr>
                                                                        <td
                                                                            colSpan="8"
                                                                            className="text-center"
                                                                        >
                                                                            {" "}
                                                                            <NotFound
                                                                                heading="Services not found."
                                                                                message="Unfortunately, services not available at the moment."
                                                                            />{" "}
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    data.map(
                                                                        (
                                                                            service,
                                                                            index
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {columns.includes(
                                                                                    "Service Name"
                                                                                ) && (
                                                                                        <td>
                                                                                            <div className="fw-semibold text-black">
                                                                                                {service.serviceName ||
                                                                                                    BlankData}
                                                                                            </div>
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes("Short Description") && (
                                                                                    <td
                                                                                        onClick={() => handleShortDescription(service.shortDescription || BlankData)}
                                                                                        style={{ cursor: "pointer" }}
                                                                                        title={"Click here for detailed description."}
                                                                                    >
                                                                                        {truncateText(service.shortDescription || BlankData, 5)}
                                                                                    </td>
                                                                                )}
                                                                                {columns.includes(
                                                                                    "Department Name"
                                                                                ) && (
                                                                                        <td>
                                                                                            {service.departmentName ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Current Version"
                                                                                ) && (
                                                                                        <td>
                                                                                            {service.currentVersion ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Priority"
                                                                                ) && (
                                                                                        <td>
                                                                                            {service.priority ===
                                                                                                "1"
                                                                                                ? "Express"
                                                                                                : "Standard"}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Price"
                                                                                ) && (
                                                                                        <td>
                                                                                            {service.price ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Status"
                                                                                ) && (
                                                                                        <td className="status-update fw-bold">
                                                                                            {service.status ===
                                                                                                "1" ? (
                                                                                                <div className="badge badge-soft-success text-success fs-12">
                                                                                                    <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                                                                                    Active
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="badge badge-soft-warning text-warning fs-12">
                                                                                                    <i className="ri-close-circle-line align-bottom"></i>{" "}
                                                                                                    In-Active
                                                                                                </div>
                                                                                            )}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Action"
                                                                                ) &&
                                                                                    editPermission && (
                                                                                        <td className="text-center">
                                                                                            <span
                                                                                                title="Edit"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    handleAddService(
                                                                                                        e,
                                                                                                        service
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <FiEdit2 className="cursor-pointer" />
                                                                                            </span>
                                                                                            {columns.includes(
                                                                                                "Action"
                                                                                            ) &&
                                                                                                editPermission && (

                                                                                                    <span className="cursor-pointer ms-2 d-inline"
                                                                                                        title="Copy Service"
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) =>
                                                                                                            handleCopyService(service)
                                                                                                        }
                                                                                                    >
                                                                                                        <FaRegCopy color="#f99f1e" />
                                                                                                    </span>

                                                                                                )}
                                                                                            {viewPermissions &&
                                                                                                !editPermission && (

                                                                                                    <span className="cursor-pointer ms-2 d-inline"
                                                                                                        title="View"
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) =>
                                                                                                            handleAddService(
                                                                                                                e,
                                                                                                                service
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Eye width="16" height="16" className="text-primary cursor-pointer ms-2" />
                                                                                                    </span>

                                                                                                )}
                                                                                                  
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
                                            </CardBody>
                                            {/* Existing pagination component */}
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
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                ) : (
                    <ServiceModal
                        show={show}
                        handleClose={handleClose}
                        serviceDataById={serviceDataById}
                        departmentList={departmentList}
                        formList={formList}
                        fetchServiceList={fetchServiceList}
                        documentList={documentList}
                        serviceList={serviceList}
                        viewPermissions={viewPermissions}
                        createPermission={createPermission}
                        editPermission={editPermission}
                    />
                )}
                <CopyServiceModal
                    show={copyModalOpen}
                    toggleShow={() => setCopyModalOpen(!copyModalOpen)}
                    data={copyServiceData}
                    copyService={handleCopyServiceApi}
                    copyServiceLoading={copyServiceLoading}
                />
                <ShortDescriptionModal
                    shortDescriptionShow={shortDescriptionShow}
                    setShortDescriptionShow={setShortDescriptionShow}
                    handleToggle={handleToggle}
                    shortDescription={selectedShortDescription}
                />
            </div>
            <ScrollToTop />
        </>
    );
};

export default Services;
