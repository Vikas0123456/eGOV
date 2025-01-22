import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import * as Yup from "yup";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import UpcomingEventsModal from "./UpcomingEventsModal";
import Noimage from "../../assets/images/NoImage.jpg";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import { Eye } from "feather-icons-react/build/IconComponents";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import DescriptionModal from "./DescriptionModal";
const BlankData = process.env.REACT_APP_BLANK;

const UpcomingEvents = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableName = "upcomingevent";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = ["Image", "Title", "Description", "Status"];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Image", "Title", "Description", "Status","Action"] // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);

    // table data filter search sort
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [descriptionShow, setDescriptionShow] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState("");
    const [id, setId] = useState();
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // upload Image
    const [selectedFile, setSelectedFile] = useState(null);
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const EventPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "upcomingevents"
        );
    const viewPermissions = EventPermissions
        ? hasViewPermission(EventPermissions)
        : false;
    const createPermission = EventPermissions
        ? hasCreatePermission(EventPermissions)
        : false;
    const editPermission = EventPermissions
        ? hasEditPermission(EventPermissions)
        : false;
    const deletePermission = EventPermissions
        ? hasDeletePermission(EventPermissions)
        : false;
        
    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    function formatDateString(inputDateString) {
        const dateObject = new Date(inputDateString);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const handleImageUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const allowedFormats = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp",
            ];

            const maxSize = 2 * 1024 * 1024; // 1MB in bytes
            if (selectedFile.size > maxSize) {
                event.target.value = null;
                formik.setFieldError(
                    "documentFile",
                    "Please select an image file that is less than 2MB."
                );
                return; // Exit the function if size exceeds the limit
            }

            if (allowedFormats.includes(selectedFile.type)) {
                formik.setFieldValue("documentFile", selectedFile);
                setSelectedFile(selectedFile);
                formik.setFieldError("documentFile", "");
            } else {
                event.target.value = null;
                formik.setFieldError(
                    "documentFile",
                    "Please select a valid image file (JPEG, JPG, or PNG)."
                );
            }
        }
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

    const handleDateChange = (date) => {
        const inputstartDateString = date[0];

        const formattedstartDate = formatDateString(inputstartDateString);

        if (formattedstartDate) {
            formik.setFieldValue("eventDate", formattedstartDate);
        }
    };

    const fetchUpcomingEventList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/upcomingEvents/view`,
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
            const response = await axiosInstance.post(
                `userService/upcomingEvents/view`,
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
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
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
            fetchUpcomingEventList();
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

    const addUpcomingEvent = async (values) => {
        try {
            setLoading(true);
            let fileId = null;
            if (selectedFile) {
                const formData = new FormData();
                formData.append("viewDocumentName", "upcomingEvent");
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
                `userService/upcomingEvents/create`,
                {
                    ...values,
                    documentFile: undefined,
                    userId: undefined,
                    imageId: fileId,
                }
            );
            if (response) {
                toast.success("UpcomingEvent added successfully.");
                fetchUpcomingEventList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong while add new UpcomingEvent");
        }
    };

    const updateUpcomingEvent = async (id, values) => {
        try {
            if (id) {
                setLoading(true);
                let fileId = null;
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("viewDocumentName", "upcomingEvent");
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
                    `userService/upcomingEvents/update`,
                    {
                        id: id,
                        ...values,
                        imageId: fileId ? fileId : formik.values.imageId,
                        documentFile: undefined,
                        userId: undefined,
                    }
                );
                if (response) {
                    toast.success("UpcomingEvent updated successfully.");
                    fetchUpcomingEventList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update UpcomingEvent");
        }
    };
    const deleteUpcomingEvent = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this Event!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/upcomingEvents/update`,
                    {
                        id: deleteId,
                        isDeleted: "1",
                    }
                );
                if (response) {
                    toast.success(`UpcomingEvent deleted successfully.`);
                    fetchUpcomingEventList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete UpcomingEvent.`);
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
        title: Yup.string()
            .min(5, "Please enter title 5 charcter long")
            .required("Please enter title"),
        description: Yup.string().required("Please enter description"),
        status: Yup.string().required("Please select status"),
        documentFile: selectedFile
            ? Yup.mixed()
            : Yup.mixed().required("Please upload a image"),
        userId: Yup.number(),
        eventDate: Yup.date().required("Pls select event date"),
    });
    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            status: "1",
            documentFile: "",
            userId: userId,
            eventDate: formatDateString(new Date()),
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateUpcomingEvent(id, values);
            } else {
                addUpcomingEvent(values);
            }
        },
    });

    const updateUpcomingEventPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                title: data.title || "",
                description: data.description || "",
                status: data.status || "",
                documentFile: data.imageId || null,
                imageId: data.imageId || null,
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

    const handleToggle = () => {
        setDescriptionShow(false);
    };

    const handleDescriptionModal = (selectedDescription) => {
        setSelectedDescription(selectedDescription);
        setDescriptionShow(true);
    };

    const truncateText = (text, wordLimit) => {
        const tempElement = document.createElement("div");
        tempElement.innerHTML = text;
        const plainText = tempElement.textContent || tempElement.innerText || "";
    
        const words = plainText.split(" ");
        return words.length > wordLimit
            ? words.slice(0, wordLimit).join(" ") + " ..."
            : plainText;
    };

    document.title = "Upcoming Events | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <DepartmentUserInfo />
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Upcoming Events
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xxl-12 mb-3">
                                <div className="card border-0">
                                    <div className="card-body border-0">
                                        <div className="row">
                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xxl-2 mb-3 mb-md-0">
                                                <div className="search-box">
                                                    <input
                                                        type="text"
                                                        className="form-control search bg-light border-light"
                                                        placeholder="Search"
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            handleInputSearch(e)
                                                        }
                                                    />
                                                    <i className="ri-search-line search-icon"></i>
                                                </div>
                                            </div>
                                           
                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-12 col-xxl-3 mb-3 mb-sm-0 d-flex align-items-start justify-content-start">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                    onClick={resetFilters}
                                                >
                                                      <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                      Reset
                                                </button>

                                              
                                            </div>
                                            <div className="col-xl-4 col-lg-4 col-9 col-md-4 col-sm-6 col-12  col-xxl-4 ms-auto text-end  d-flex align-items-start justify-content-end">
                                            {createPermission && (
                                           
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label me-3  text-nowrap "
                                                        id="create-btn"
                                                        title="Add upcoming Event"
                                                        onClick={handleShow}
                                                    >
                                                      <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                        Add Upcoming Event
                                                    </button>
                                              
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
                                    </div>
                                </div>
                            </div>

                            <div className="col-xxl-12">
                                <div className="card border-0 mb-0">
                                    <div className="card-body pb-0">
                                        <div className="table-responsive table-card mb-0">
                                            {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                <table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable"
                                                >
                                                    <thead className="bg-white">
                                                        <tr>
                                                        {columns.includes(
                                                                "Image"
                                                            ) && (
                                                            <th className="fw-bold">
                                                                {" "}
                                                                Image{" "}
                                                            </th>)}
                                                            {columns.includes(
                                                                "Title"
                                                            ) && (<th
                                                                className="fw-bold cursor-pointer"
                                                                onClick={() =>
                                                                    handleSorting(
                                                                        "title"
                                                                    )
                                                                }
                                                            >
                                                                Title{" "}
                                                                <span>
                                                                    <BiSortAlt2 />
                                                                </span>
                                                            </th>)}
                                                            {columns.includes(
                                                                "Description"
                                                            ) && (<th
                                                                className="fw-bold cursor-pointer"
                                                                onClick={() =>
                                                                    handleSorting(
                                                                        "description"
                                                                    )
                                                                }
                                                            >
                                                                Description{" "}
                                                                <span>
                                                                    <BiSortAlt2 />
                                                                </span>
                                                            </th>)}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (<th className="fw-bold">
                                                                Status
                                                            </th>)}
                                                            {columns.includes(
                                                                "Action"
                                                            ) && (<th className="fw-bold">
                                                                Action
                                                            </th>)}
                                                        </tr>
                                                    </thead>

                                                    <tbody>
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
                                                                    <NotFound
                                                                        heading="Upcoming Events not found."
                                                                        message="Unfortunately, upcoming events not available at the moment."
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            data?.map(
                                                                (
                                                                    upcomingEvent,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {columns.includes(
                                                                "Image"
                                                            ) && (<td className="text-wrap">
                                                                            <div>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="flex-shrink-0 me-2">
                                                                                        <img
                                                                                            src={
                                                                                                upcomingEvent
                                                                                                    ?.imageData
                                                                                                    ?.documentPath ||
                                                                                                Noimage
                                                                                            }
                                                                                            alt=""
                                                                                            className="avatar-xs rounded-circle"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>)}
                                                                        {columns.includes(
                                                                "Title"
                                                            ) && (<td className="text-wrap">
                                                                            <div>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="fw-semibold text-black">
                                                                                        {upcomingEvent?.title ||
                                                                                            BlankData}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>)}

                                                                        {columns.includes(
                                                                "Description"
                                                            ) && (
                                                                            <td
                                                                                onClick={() => handleDescriptionModal(upcomingEvent.description || BlankData)}
                                                                                style={{ cursor: "pointer" }}
                                                                                title="Click here for detailed description."
                                                                            >
                                                                               {truncateText(upcomingEvent.description || BlankData, 10)}
                                                                            </td>
                                                                    )}
                                                                        {columns.includes(
                                                                "Status"
                                                            ) && (<td className="status-update text-success fw-bold">
                                                                            {upcomingEvent.status ===
                                                                            "1" ? (
                                                                                <div className="badge badge-soft-success text-success fs-12">
                                                                                    <i className="ri-checkbox-circle-line align-bottom "></i>{" "}
                                                                                    {upcomingEvent.status ===
                                                                                    "1"
                                                                                        ? "Active"
                                                                                        : "In-Active"}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="badge badge-soft-warning text-warning fs-12">
                                                                                    <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                    {upcomingEvent.isActive ===
                                                                                    "1"
                                                                                        ? "Active"
                                                                                        : "In-Active"}
                                                                                </div>
                                                                            )}
                                                                        </td>)}
                                                                        {columns.includes(
                                                                "Action"
                                                            ) && (<td>
                                                                            {" "}
                                                                            <span>
                                                                                {viewPermissions &&
                                                                                    !editPermission && (
                                                                                        <span
                                                                                            className="cursor-pointer me-4"
                                                                                            title="view"
                                                                                            onClick={() =>
                                                                                                updateUpcomingEventPrefilledData(
                                                                                                    upcomingEvent
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Eye
                                                                                                width="16"
                                                                                                height="16"
                                                                                                className="cursor-pointer"
                                                                                            />
                                                                                        </span>
                                                                                    )}
                                                                                {editPermission && (
                                                                                    <span
                                                                                        title="Edit"
                                                                                        onClick={() =>
                                                                                            updateUpcomingEventPrefilledData(
                                                                                                upcomingEvent
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
                                                                                            deleteUpcomingEvent(
                                                                                                upcomingEvent.id
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        <RiDeleteBinLine className="cursor-pointer" />
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </td>)}
                                                                    </tr>
                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            {/* </SimpleBar> */}
                                        </div>
                                    </div>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <UpcomingEventsModal
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    handleImageUpload={handleImageUpload}
                    loading={loading}
                    handleDateChange={handleDateChange}
                    viewPermissions={viewPermissions}
                    createPermission={createPermission}
                    editPermission={editPermission}
                />
                <DescriptionModal
                    descriptionShow={descriptionShow}
                    setDescriptionShow={setDescriptionShow}
                    handleToggle={handleToggle}
                    selectedDescription={selectedDescription}
                />
            </div>
            <ScrollToTop />
        </>
    );
};

export default UpcomingEvents;
