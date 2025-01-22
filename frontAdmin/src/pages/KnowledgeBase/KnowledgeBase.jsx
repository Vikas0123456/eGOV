import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import Pagination from "../../CustomComponents/Pagination";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import errorImage from "../../assets/images/error.gif";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { useNavigate } from "react-router-dom";
import DateRangePopup from "../../common/Datepicker/DatePicker";
import KnowledgeBaseOffcanvas from "./KnowledgeBaseView";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import { Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
const BlankData = process.env.REACT_APP_BLANK;
const ArticleAddEditPage = () => {
    const axiosInstance = useAxios();

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tableName = "knowledgebase";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Title",
        "Authors",
        "Department",
        "Feedback",
        "Visibility",
        "Status",
    ];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "Title",
            "Authors",
            "Department",
            "Feedback",
            "Visibility",
            "Status",
            "Action",
        ] // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [data, setData] = useState([]);
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");
    const [visibility, setVisibility] = useState("");
    const [status, setStatus] = useState("");

    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [knowledgeBaseToShow, setKnowledgeBaseToShow] = useState(null);

    const [selectStartDate, setSelectStartDate] = useState(null);
    const [selectEndDate, setSelectEndDate] = useState(null);
    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [authorList, setAuthorList] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    // upload Image

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const EventPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "knowledgebase"
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

    const listOfKnowledgeBase = (knowledgeBaseId) => {
        if (knowledgeBaseId) {
            setKnowledgeBaseToShow(knowledgeBaseId);
        }
    };

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    useEffect(() => {
        if (knowledgeBaseToShow) {
            listOfKnowledgeBase(knowledgeBaseToShow);
        }
    }, [knowledgeBaseToShow]);

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

    const handleDepartmentSearch = (e) => {
        setCurrentPage(1);
        setSelectedDept(e);
        // setSelectedDept(e.target.value);
    };

    const fetchAuthorList = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/knowledgebase/authors`,
                {
                    searchQuery: searchQuery,
                }
            );

            setAuthorList(response.data.data.authors);
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchAuthorList();
    }, []);

    const fetchKnowledgeBaseList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/knowledgebase/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : selectedDept,
                    selectedAuthor: selectedAuthor,
                    visibility: visibility,
                    status: status,
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

    const listOfKnowledgeBaseSearch = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/knowledgebase/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? userData?.departmentId
                            : selectedDept,
                    searchFilter: searchQuery,
                    selectedAuthor: selectedAuthor,
                    visibility: visibility,
                    status: status,
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
                listOfKnowledgeBaseSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        searchQuery,
        selectedDept,
        selectedAuthor,
        visibility,
        status,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
        selectStartDate,
        selectEndDate,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            fetchKnowledgeBaseList();
        }
    }, [
        searchQuery,
        selectedDept,
        selectedAuthor,
        visibility,
        status,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
        selectStartDate,
        selectEndDate,
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
        setSelectedRows([]);
        setSelectAll(false);

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

    const handleVisibilityChange = (selectedVisibility) => {
        setCurrentPage(1);
        setVisibility(selectedVisibility);
    };

    const handleStatusChange = (selectedStatus) => {
        setCurrentPage(1);
        setStatus(selectedStatus);
    };

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
        setSelectedDept("");
        setSelectStartDate(null);
        setSelectEndDate(null);
        setDateStart(null);
        setDateEnd(null);
        setSelectedAuthor("");
        setVisibility("");
        setStatus("");
    };

    const deleteKnowledgeBase = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this KnowledgeBase!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/knowledgebase/delete`,
                    {
                        id: deleteId,
                    }
                );
                if (response) {
                    toast.success(`KnowledgeBase deleted successfully.`);
                    fetchKnowledgeBaseList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete KnowledgeBase.`);
                console.error(error);
            }
        }
    };

    const deleteMultipleKnowledgeBases = async (deleteIds) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover these KnowledgeBases!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete them!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/knowledgebase/multiple-delete`,
                    {
                        ids: deleteIds,
                    }
                );
                if (response && response.data && response.data.success) {
                    toast.success(`KnowledgeBases deleted successfully.`);
                    fetchKnowledgeBaseList();
                    setSelectedRows([]);
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete KnowledgeBases.`);
                console.error(error);
            }
        }
    };

    const deleteSelectedKnowledgeBases = () => {
        const deleteIds = selectedRows.map((index) => data[index].id);
        deleteMultipleKnowledgeBases(deleteIds);
    };

    const getKnowledgebaseApi = async (knowledgeBaseId) => {
        navigate("/knowledgebase-model", {
            state: knowledgeBaseId,
        });
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };

    const extractText = (html) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    const getTruncatedTextFromHTML = (html, length) => {
        const text = extractText(html);
        return truncateText(text, length);
    };

    function abbreviateNumber(number) {
        const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
        const tier = (Math.log10(number) / 3) | 0;
        if (tier === 0) return number;
        const suffix = SI_SYMBOL[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = number / scale;
        return scaled.toFixed(1) + suffix;
    }

    function formatDateString(inputDateString) {
        const dateObject = new Date(inputDateString);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function onChangeHandler(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectStartDate(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectEndDate(formattedendDate);
        }
        setDateStart(value[0]);
        setDateEnd(value[1]);
    }

    const handleAuthorChange = (selectedAuthor) => {
        if (selectedAuthor) {
            setCurrentPage(1);
            setSelectedAuthor(selectedAuthor);
        } else {
            setSelectedAuthor("");
        }
    };

    const toggleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedRows(data.map((_, index) => index));
        } else {
            setSelectedRows([]);
        }
    };

    const toggleRowSelection = (index) => {
        const selectedIndex = selectedRows.indexOf(index);
        let newSelectedRows = [...selectedRows];

        if (selectedIndex === -1) {
            newSelectedRows.push(index);
        } else {
            newSelectedRows.splice(selectedIndex, 1);
        }

        setSelectedRows(newSelectedRows);
    };

    const clearSelection = () => {
        setSelectedRows([]);
        setSelectAll(false);
    };

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = (knowledgeBaseId) => {
        setKnowledgeBaseToShow(knowledgeBaseId);
        setShowOffcanvas(true);
    };

    const departmentOptions = departmentList &&
        departmentList.length > 0 && [
            { value: "", label: "Select Department*" },
            ...departmentList
                .sort((a, b) =>
                    a.departmentName.localeCompare(b.departmentName)
                )
                .map((department) => ({
                    value: department.id,
                    label: department.departmentName,
                })),
        ];

    const authorOptions = authorList &&
        authorList.length > 0 && [
            { value: "", label: "Select Author*" },
            ...authorList
                .sort((a, b) =>
                    a.authors.trim().localeCompare(b.authors.trim())
                )
                .map((author, index) => ({
                    value: author.authors.trim(),
                    label: author.authors.trim(),
                    key: index,
                })),
        ];

    const visibilityOptions = [
        { value: "", label: "Select Visibility*" },
        { value: "1", label: "Private" },
        { value: "0", label: "Public" },
    ];

    const statusOptions = [
        { value: "", label: "Select Status*" },
        { value: "2", label: "Archived" },
        { value: "1", label: "Draft" },
        { value: "0", label: "Published" },
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

    document.title = "Knowledge Base | eGov Solution";

    return (
        <div>
            <div className="page-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Knowledge Base
                                        </h4>
                                    </div>
                                </div>
                                <div className="col-12 d-flex justify-content-end">
                                    {selectedRows.length > 0 && (
                                        <div
                                            id="selectRecord"
                                            className="justify-content-end align-items-center d-flex me-auto mb-3 "
                                        >
                                            <div className="text-dark">
                                                {" "}
                                                {selectedRows.length} items
                                                Selected{" "}
                                            </div>
                                            <button
                                                className="btn btn-danger dlt-btn ms-3"
                                                title="Delete selection"
                                                onClick={
                                                    deleteSelectedKnowledgeBases
                                                }
                                            >
                                                Delete selection
                                            </button>
                                            <button
                                                className="btn btn-soft-primary ms-3"
                                                title="Clear selection"
                                                onClick={clearSelection}
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    )}
                                    <div className="row gx-2"></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 mb-2">
                            <div
                                className="tab-content"
                                id="knowledge-baseContent"
                            >
                                <div
                                    className="tab-pane fade show active"
                                    id="articlestab"
                                    role="tabpanel"
                                    aria-labelledby="tab1-tab"
                                >
                                    <div className="col-xxl-12 mb-3">
                                        <div className="card border-0">
                                            <div className="card-header border-0">
                                                <div className="row">
                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 ">
                                                        <div className="search-box">
                                                            <input
                                                                type="text"
                                                                className="form-control search bg-light border-light"
                                                                placeholder="Search Knowledgebase"
                                                                value={
                                                                    searchQuery
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputSearch(
                                                                        e
                                                                    )
                                                                }
                                                            />
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 ">
                                                        <div className=" inner-border-0 dateinput">
                                                            <DateRangePopup
                                                                dateStart={
                                                                    dateStart
                                                                }
                                                                dateEnd={
                                                                    dateEnd
                                                                }
                                                                onChangeHandler={
                                                                    onChangeHandler
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 ">
                                                        <div className="input-light ">
                                                            <Select
                                                                className="bg-choice"
                                                                classNamePrefix="select"
                                                                name="choices-single-default"
                                                                id="idStatus"
                                                                value={
                                                                    selectedAuthor
                                                                        ? authorOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                selectedAuthor
                                                                        )
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    selectedOption
                                                                ) =>
                                                                    handleAuthorChange(
                                                                        selectedOption
                                                                            ? selectedOption.value
                                                                            : ""
                                                                    )
                                                                }
                                                                options={
                                                                    authorOptions
                                                                }
                                                                placeholder="Select Author*"
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
                                                    {userData?.isCoreTeam ===
                                                        "1" && (
                                                            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 ">
                                                                <div className="input-light ">
                                                                <Select
                                                                    className="basic-single bg-choice"
                                                                    classNamePrefix="select"
                                                                    value={selectedDept ? departmentOptions.find((option) => option.value === selectedDept) : null}
                                                                    onChange={(selectedOption) => handleDepartmentSearch(selectedOption ? selectedOption.value : "")}
                                                                    options={departmentOptions}

                                                                    aria-label="Select Department"
                                                                    placeholder="Select Department"
                                                                    styles={{
                                                                        control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                        menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                        option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    }}
                                                                />
                                                                </div>
                                                            </div>
                                                        )}

                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 mb-xxl-0 mb-xl-0 mb-lg-0">
                                                        <div className="input-light ">
                                                            <Select
                                                                classNamePrefix="select"
                                                                className="bg-choice"
                                                                name="choices-single-default"
                                                                id="idStatus"
                                                                value={
                                                                    visibility
                                                                        ? visibilityOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                visibility
                                                                        )
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    selectedOption
                                                                ) =>
                                                                    handleVisibilityChange(
                                                                        selectedOption
                                                                            ? selectedOption.value
                                                                            : ""
                                                                    )
                                                                }
                                                                options={
                                                                    visibilityOptions
                                                                }
                                                                placeholder="Select Visibility*"
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

                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-3 mb-3 mb-xxl-0 mb-xl-0 mb-lg-0">
                                                        <div className="input-light ">
                                                            <Select
                                                                classNamePrefix="select"
                                                                className="bg-choice"
                                                                name="choices-single-default"
                                                                id="idStatus"
                                                                value={
                                                                    status
                                                                        ? statusOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                status
                                                                        )
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    selectedOption
                                                                ) =>
                                                                    handleStatusChange(
                                                                        selectedOption
                                                                            ? selectedOption.value
                                                                            : ""
                                                                    )
                                                                }
                                                                options={
                                                                    statusOptions
                                                                }
                                                                placeholder="Select Status*"
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

                                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 col-xxl-3  d-flex align-items-start justify-content-start mb-3 mb-xxl-0 mb-xl-0 mb-lg-0">

                                                        <button
                                                            type="button"
                                                            className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                            onClick={
                                                                resetFilters
                                                            }
                                                        >
                                                            <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                            Reset
                                                        </button>





                                                    </div>
                                                    <div className="col-xl-3 col-lg-2 col-md-4 col-sm-6 col-xxl-3  d-flex ms-auto align-items-start justify-content-end">
                                                        {createPermission && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-label me-3  text-nowrap"
                                                                id="create-btn"
                                                                onClick={() =>
                                                                    navigate(
                                                                        "/knowledgebase-model"
                                                                    )
                                                                }
                                                            >
                                                                    <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                                New Article
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
                                                            handleCancel={
                                                                handleCancel
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="card mb-0 border-0">
                                            <div className="card-body pb-0">
                                                <div className="table-responsive table-card mb-0">
                                                    {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                        <table className="table align-middle table-mobile mb-0 com_table">
                                                            <thead className="bg-white">
                                                                <tr valign="middle">
                                                                    {((viewPermissions &&
                                                                        deletePermission) ||
                                                                        editPermission) && (
                                                                            <th width="40">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        selectAll
                                                                                    }
                                                                                    onChange={
                                                                                        toggleSelectAll
                                                                                    }
                                                                                    id="group-checkable"
                                                                                    className="form-check-input multiSelectList cursor-pointer"
                                                                                    data-table="articlesTable"
                                                                                />
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Title"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "title"
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                Title{" "}
                                                                                <span>
                                                                                    {" "}
                                                                                    <BiSortAlt2 />{" "}
                                                                                </span>
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Authors"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "authors"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Authors{" "}
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
                                                                                        "departmentName"
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
                                                                        "Feedback"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "likeCountResult"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Feedback{" "}
                                                                                <span>
                                                                                    {" "}
                                                                                    <BiSortAlt2 />{" "}
                                                                                </span>
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Visibility"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "visibility"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Visibility{" "}
                                                                                <span>
                                                                                    {" "}
                                                                                    <BiSortAlt2 />{" "}
                                                                                </span>
                                                                            </th>
                                                                        )}
                                                                    {columns.includes(
                                                                        "Status"
                                                                    ) && (
                                                                            <th
                                                                                className="fw-bold cursor-pointer w-xl"
                                                                                onClick={() =>
                                                                                    handleSorting(
                                                                                        "status"
                                                                                    )
                                                                                }
                                                                            >
                                                                                Status{" "}
                                                                                <span>
                                                                                    {" "}
                                                                                    <BiSortAlt2 />{" "}
                                                                                </span>
                                                                            </th>
                                                                        )}
                                                                    {viewPermissions &&
                                                                        columns.includes(
                                                                            "Action"
                                                                        ) && (
                                                                            <th className="fw-bold">
                                                                                Action
                                                                            </th>
                                                                        )}
                                                                </tr>
                                                            </thead>

                                                            <tbody id="articlesTable">
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
                                                                            <NotFound
                                                                                heading="Knowledge Base not found."
                                                                                message="Unfortunately, knowledge base not available at the moment."
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    data?.map(
                                                                        (
                                                                            knowledgeBase,
                                                                            index
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                {((viewPermissions &&
                                                                                    deletePermission) ||
                                                                                    editPermission) && (
                                                                                        <td>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={selectedRows.includes(
                                                                                                    index
                                                                                                )}
                                                                                                onChange={() =>
                                                                                                    toggleRowSelection(
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                                id="group-checkable"
                                                                                                className="form-check-input table-list cursor-pointer"
                                                                                            />
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Title"
                                                                                ) && (
                                                                                        <td>
                                                                                            {knowledgeBase.title ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Authors"
                                                                                ) && (
                                                                                        <td>
                                                                                            {knowledgeBase.authors ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Department"
                                                                                ) && (
                                                                                        <td>
                                                                                            {knowledgeBase?.departmentName ||
                                                                                                BlankData}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Feedback"
                                                                                ) && (
                                                                                        <td>
                                                                                            <div className="d-flex  align-items-center">
                                                                                                <i
                                                                                                    className={
                                                                                                        knowledgeBase.likeCountResult >
                                                                                                            0
                                                                                                            ? "ri-thumb-up-fill fs-4 me-2 d-inline-block text-success"
                                                                                                            : " ri-thumb-up-fill fs-4 me-2 d-inline-block text-danger"
                                                                                                    }
                                                                                                ></i>
                                                                                                <span className="like me-3 d-inline-block text-dark">
                                                                                                    {abbreviateNumber(
                                                                                                        knowledgeBase.likeCountResult
                                                                                                    )}
                                                                                                </span>
                                                                                                <i
                                                                                                    className={
                                                                                                        knowledgeBase.dislikeCount >
                                                                                                            0
                                                                                                            ? "ri-thumb-down-fill fs-4 me-2 d-inline-block text-danger"
                                                                                                            : "ri-thumb-down-fill fs-4 me-2 d-inline-block text-success"
                                                                                                    }
                                                                                                ></i>
                                                                                                <span className="dislike d-inline-block text-dark">
                                                                                                    {abbreviateNumber(
                                                                                                        knowledgeBase.dislikeCount
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Visibility"
                                                                                ) && (
                                                                                        <td>
                                                                                            {" "}
                                                                                            {knowledgeBase.visibility ===
                                                                                                "0"
                                                                                                ? "Public"
                                                                                                : "Private"}{" "}
                                                                                        </td>
                                                                                    )}
                                                                                {columns.includes(
                                                                                    "Status"
                                                                                ) && (
                                                                                        <td>
                                                                                            <span
                                                                                                className={
                                                                                                    knowledgeBase.status ===
                                                                                                        "0"
                                                                                                        ? "badge bg-success"
                                                                                                        : knowledgeBase.status ===
                                                                                                            "1"
                                                                                                            ? "badge  bg-primary-subtle text-primary"
                                                                                                            : "badge bg-warning"
                                                                                                }
                                                                                            >
                                                                                                {knowledgeBase.status ===
                                                                                                    "0"
                                                                                                    ? "Published"
                                                                                                    : knowledgeBase.status ===
                                                                                                        "1"
                                                                                                        ? "Draft"
                                                                                                        : "Archived"}
                                                                                            </span>
                                                                                        </td>
                                                                                    )}
                                                                                {viewPermissions &&
                                                                                    columns.includes(
                                                                                        "Action"
                                                                                    ) && (
                                                                                        <td className="w-lg">
                                                                                            <Dropdown>
                                                                                                <Dropdown.Toggle
                                                                                                    variant="white"
                                                                                                    size="sm"
                                                                                                    className="bg-transparent"
                                                                                                >
                                                                                                    <i className="ri-more-fill align-middle"></i>
                                                                                                </Dropdown.Toggle>
                                                                                                <Dropdown.Menu align="end">
                                                                                                    {viewPermissions &&
                                                                                                        knowledgeBase?.description && (
                                                                                                            <Dropdown.Item
                                                                                                                onClick={() =>
                                                                                                                    handleShowOffcanvas(
                                                                                                                        knowledgeBase
                                                                                                                    )
                                                                                                                }
                                                                                                            >
                                                                                                                <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                                                                                                View
                                                                                                            </Dropdown.Item>
                                                                                                        )}
                                                                                                    {editPermission && (
                                                                                                        <Dropdown.Item
                                                                                                            onClick={() =>
                                                                                                                getKnowledgebaseApi(
                                                                                                                    knowledgeBase
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                                                                                            Edit
                                                                                                        </Dropdown.Item>
                                                                                                    )}
                                                                                                    {deletePermission && (
                                                                                                        <Dropdown.Item
                                                                                                            onClick={() =>
                                                                                                                deleteKnowledgeBase(
                                                                                                                    knowledgeBase.id
                                                                                                                )
                                                                                                            }
                                                                                                        >
                                                                                                            <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                                                                                            Delete
                                                                                                        </Dropdown.Item>
                                                                                                    )}
                                                                                                </Dropdown.Menu>
                                                                                            </Dropdown>
                                                                                        </td>
                                                                                    )}
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
                                                handlePageChange={
                                                    handlePageChange
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <KnowledgeBaseOffcanvas
                    show={showOffcanvas}
                    handleClose={handleCloseOffcanvas}
                    knowledgeBaseId={knowledgeBaseToShow}
                />
            </div>

            <ScrollToTop />
        </div>
    );
};

export default ArticleAddEditPage;
