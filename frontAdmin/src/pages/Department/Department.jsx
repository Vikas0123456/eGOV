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
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import * as Yup from "yup";
import DepartmentModal from "./DepartmentModal";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import Noimage from "../../assets/images/NoImage.jpg";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { Eye, UserPlus } from "feather-icons-react/build/IconComponents";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import errorImage from "../../assets/images/error.gif";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
const BlankData = process.env.REACT_APP_BLANK;
const Department = () => {
    const axiosInstance = useAxios();
    // table data filter search sort
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const dispatch = useDispatch();
    const tableName = "department";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Department Name",
        "Email",
        "URL",
        "Contact Number",
        "Location Title",
        "Location",
        "Status",
    ];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "Department Name",
            "Email",
            "URL",
            "Contact Number",
            "Location Title",
            "Location",
            "Status",
            "Action",
        ] // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);

    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("asc");
    const [isLoading, setIsloading] = useState(true);
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    // upload Image
    const [selectedFile, setSelectedFile] = useState(null);

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const UserPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "departments"
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
    };
    const fetchDepartmentList = async () => {
        try {
            setIsloading(true);
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
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
            setIsloading(false);
            console.error(error.message);
        }
    };
    const listOfSearch = async () => {
        try {
            setIsloading(true);
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
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
            setIsloading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                listOfSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder]);

    useEffect(() => {
        if (!searchQuery) {
            fetchDepartmentList();
        }
    }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder]);

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

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
    };

    const addDepartment = async (values) => {
        try {
            setLoading(true);
            let fileId = null;
            if (selectedFile) {
                const formData = new FormData();
                formData.append("viewDocumentName", values?.departmentName);
                formData.append("documentFile", values.documentFile);
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
                `serviceManagement/department/create`,
                {
                    ...values,
                    logo: fileId,
                    documentFile: undefined,
                    customerId: undefined,
                }
            );
            if (response) {
                toast.success("Department added successfully.");
                fetchDepartmentList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong while create new department");
        }
    };

    const updateDeaprtment = async (id, values) => {
        try {
            if (id) {
                setLoading(true);
                let fileId = null;
                if (selectedFile) {
                    const formData = new FormData();

                    formData.append("viewDocumentName", values?.departmentName);
                    formData.append("documentFile", values.documentFile);
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
                    `serviceManagement/department/update`,
                    {
                        id: id,
                        ...values,
                        logo: fileId ? fileId : formik.values.logo,
                        documentFile: undefined,
                        customerId: undefined,
                    }
                );
                if (response) {
                    toast.success("Department updated successfully.");
                    fetchDepartmentList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update department");
        }
    };
    const deleteDepartment = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this department!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `serviceManagement/department/delete`,
                    {
                        id: deleteId,
                    }
                );
                if (response) {
                    toast.success(`Department deleted successfully.`);
                    fetchDepartmentList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete department.`);
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
        departmentName: Yup.string().required("Please enter department name"),
        email: Yup.string()
            .email("Please enter valid email")
            .required("Please enter email"),
        url: Yup.string()
            .url("Please enter valid url eg:http://example.com")
            .required("Please enter url"),
        contactNumber: Yup.string()
            .matches(
                /^\d{10,}$/,
                "Please enter at least 10 digit. Only digits are allowed"
            )
            .required("Please enter contact number"),
        contactNumberExt: Yup.string().required(
            "Please enter conatct number ext"
        ),
        shortDescription: Yup.string().required(
            "Please enter short description"
        ),
        locationTitle: Yup.string().required("Please enter location title"),
        location: Yup.string().required("Please enter location"),
        documentFile: selectedFile
            ? Yup.mixed()
            : Yup.mixed().required("Please upload a department logo"),
        customerId: Yup.number(),
    });
    const formik = useFormik({
        initialValues: {
            departmentName: "",
            email: "",
            url: "",
            contactNumber: "",
            contactNumberExt: "",
            shortDescription: "",
            locationTitle: "",
            location: "",
            keyword: "",
            documentFile: "",
            customerId: 1,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateDeaprtment(id, values);
            } else {
                addDepartment(values);
            }
        },
    });
    const updateDepartmentPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                departmentName: data.departmentName || "",
                email: data.email || "",
                url: data.url || "",
                contactNumber: data.contactNumber || "",
                contactNumberExt: data.contactNumberExt || "",
                shortDescription: data.shortDescription || "",
                locationTitle: data.locationTitle || "",
                location: data.location || "",
                status: data.status || "",
                logo: data.logo || "",
                keyword: data.keyword || "",
                documentFile: data.logo || "",
                imageData: data.imageData || "",
            });
        }
        setShow(true);
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

    document.title = "Departments | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <Container fluid>
                            <Row>
                                <DepartmentUserInfo />
                                <Col xs={12}>
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Departments</h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Card className="border-0">
                                <CardBody className="border-0">
                                    <div className="row">
                                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0">
                                            <div className="search-box d-flex align-items-center">
                                                <Input
                                                    type="text"
                                                    className="form-control search bg-light border-light"
                                                    placeholder="Search"
                                                    value={searchQuery}
                                                    onChange={handleInputSearch}
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>

                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-6 col-12 col-4 col-xxl-2  mb-3 mb-md-0">

                                            <Button color="primary" className="btn btn-primary btn-label bg-warning border-warning " onClick={resetFilters} >
                                                <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                Reset
                                            </Button>

                                        </div>
                                        <div className="col-xl-3 col-lg-4 col-md-4 col-12 col-sm-5 col-8 col-xxl-2 d-flex align-items-start justify-content-end ms-auto ">
                                            {createPermission && (

                                                <Button
                                                    color="primary"
                                                    id="create-btn"
                                                    onClick={handleShow}
                                                    className="btn btn-primary btn-label me-3  d-flex align-items-start justify-content-start text-nowrap" 
                                                >
                                                     <i className=" ri-user-add-line label-icon align-middle fs-20 me-2"></i>
                                                    Create Department
                                                </Button>

                                            )}
                                            <ColumnConfig
                                                openColumnModal={openColumnModal}
                                                handleOpenColumnModal={
                                                    handleOpenColumnModal
                                                }
                                                handleApplyChanges={
                                                    handleApplyChanges
                                                }
                                                handleSelectAll={handleSelectAll}
                                                selectedColumns={selectedColumns}
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
                                                                    Department Name{" "}
                                                                    <span>
                                                                        <BiSortAlt2 />
                                                                    </span>
                                                                </th>
                                                            )}
                                                        {columns.includes(
                                                            "Email"
                                                        ) && (
                                                                <th className="fw-bold">
                                                                    Email
                                                                </th>
                                                            )}
                                                        {columns.includes(
                                                            "URL"
                                                        ) && (
                                                                <th className="fw-bold">
                                                                    URL
                                                                </th>
                                                            )}
                                                        {columns.includes(
                                                            "Contact Number"
                                                        ) && (
                                                                <th className="fw-bold">
                                                                    Contact Number
                                                                </th>
                                                            )}
                                                        {columns.includes(
                                                            "Location Title"
                                                        ) && (
                                                                <th className="fw-bold">
                                                                    Location Title
                                                                </th>
                                                            )}
                                                        {columns.includes(
                                                            "Location"
                                                        ) && (
                                                                <th className="fw-bold">
                                                                    Location
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
                                                    ) : data.length === 0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan="8"
                                                                className="text-center"
                                                            >
                                                                {" "}
                                                                <NotFound
                                                                    heading="Departments not found."
                                                                    message="Unfortunately, departments not available at the moment."
                                                                />{" "}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        data.map(
                                                            (
                                                                department,
                                                                index
                                                            ) => (
                                                                <tr key={index}>
                                                                    {columns.includes(
                                                                        "Department Name"
                                                                    ) && (
                                                                            <td className="w-xl">
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="flex-shrink-0 me-2">
                                                                                        <img
                                                                                            src={
                                                                                                department
                                                                                                    ?.imageData
                                                                                                    ?.documentPath ||
                                                                                                Noimage
                                                                                            }
                                                                                            alt=""
                                                                                            className="avatar-xs rounded-circle"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="fw-semibold text-black">
                                                                                        {department.departmentName ||
                                                                                            BlankData}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Email"
                                                                    ) && (
                                                                            <td>
                                                                                {department.email ||
                                                                                    BlankData}
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "URL"
                                                                    ) && (
                                                                            <td>
                                                                                {department.url ||
                                                                                    BlankData}
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Contact Number"
                                                                    ) && (
                                                                            <td>
                                                                                {department.contactNumber ||
                                                                                    BlankData}
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Location Title"
                                                                    ) && (
                                                                            <td>
                                                                                {department.locationTitle ||
                                                                                    BlankData}
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Location"
                                                                    ) && (
                                                                            <td>
                                                                                {department.location ||
                                                                                    BlankData}
                                                                            </td>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Status"
                                                                    ) && (
                                                                            <td className="status-update  fw-bold">
                                                                                {" "}
                                                                                {department.status ===
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
                                                                    ) && (
                                                                            <td>
                                                                                <span>
                                                                                    {viewPermissions &&
                                                                                        !editPermission && (
                                                                                            <span
                                                                                                title="view"
                                                                                                className="cursor-pointer me-4"
                                                                                                onClick={() =>
                                                                                                    updateDepartmentPrefilledData(
                                                                                                        department
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
                                                                                                updateDepartmentPrefilledData(
                                                                                                    department
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <FiEdit2 className="cursor-pointer me-4" />
                                                                                        </span>
                                                                                    )}
                                                                                    {deletePermission && (
                                                                                        <span
                                                                                            title="Delete"
                                                                                            onClick={() =>
                                                                                                deleteDepartment(
                                                                                                    department.id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <RiDeleteBinLine className=" cursor-pointer" />
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
                                </CardBody>
                                {/* Existing pagination code */}
                                <Pagination
                                    totalCount={totalCount}
                                    perPageSize={perPageSize}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    handleSelectPageSize={handleSelectPageSize}
                                    handlePageChange={handlePageChange}
                                />
                            </Card>
                        </Container>
                    </div>
                </div>
                <DepartmentModal
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    handleImageUpload={handleImageUpload}
                    loading={loading}
                    viewPermissions={viewPermissions}
                    createPermission={createPermission}
                    editPermission={editPermission}
                />
            </div>
            <ScrollToTop />
        </>
    );
};

export default Department;
