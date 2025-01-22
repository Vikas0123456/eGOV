import React, { useEffect, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import Pagination from "../../CustomComponents/Pagination";
import "../css/fileupload.css";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { hasViewPermission } from "../../common/CommonFunctions/common";
import { format } from "date-fns";
import DateRangePopup from "../../common/Datepicker/DatePicker";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import { toast } from "react-toastify";
const BlankData = process.env.REACT_APP_BLANK;
function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const AuditLog = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableName = "auditlog";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Module Name",
        "Action",
        "Name",
        "Email",
        "Type",
        "IP Address",
        "Dated",
    ];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "Module Name",
            "Action",
            "Name",
            "Email",
            "Type",
            "IP Address",
            "Dated",
        ]
        : // Define all available columns
        [...tableColumnConfig?.tableConfig]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const [logdata, setLogData] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const [selectStartDate, setSelectStartDate] = useState("");
    const [selectEndDate, setSelectEndDate] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedType, setSelectedType] = useState("");
    //loader
    const [isLoading, setIsLoading] = useState(true);
    const typeEnum = ["0", "1", "2"];
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const FeedbackPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "auditLog"
        );
    const viewPermissions = FeedbackPermissions
        ? hasViewPermission(FeedbackPermissions)
        : false;

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const fetchModulesList = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/auditLog/list`,
                {
                    searchQuery: searchQuery,
                }
            );
            setModuleList(response?.data?.data?.moduleName);
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchModulesList();
    }, []);

    const searchLogList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/auditLog/get",
                {
                    page: currentPage,
                    perPage: perPageSize,
                    searchFilter: searchQuery,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    selectedModule: selectedModule,
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;
                setIsLoading(false);
                setLogData(records);
                setTotalCount(totalRecords);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching audit logs:", error.message);
        }
    };

    const logList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/auditLog/get",
                {
                    page: currentPage,
                    perPage: perPageSize,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    selectedModule: selectedModule,
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;
                setLogData(records);
                setTotalCount(totalRecords);
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                searchLogList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        searchQuery,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
        selectStartDate,
        selectEndDate,
        selectedModule,
        selectedType,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            logList();
        }
    }, [
        searchQuery,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
        selectStartDate,
        selectEndDate,
        selectedModule,
        selectedType,
    ]);

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
    };

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };

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
        // setSearchQuery("");
        setDateStart(value[0]);
        setDateEnd(value[1]);
    }

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
        setSelectStartDate("");
        setSelectEndDate("");
        setDateStart("");
        setDateEnd("");
        setSelectedModule("");
        setSelectedType("");
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };

    const handleModuleChange = (selectedModule) => {
        if (selectedModule) {
            setCurrentPage(1);
            setSelectedModule(selectedModule);
        } else {
            setSelectedModule("");
        }
    };

    const handleTypeChange = (selectedType) => {
        if (selectedType) {
            setCurrentPage(1);
            setSelectedType(selectedType);
        } else {
            setSelectedType("");
        }
    };

    const moduleOptions = moduleList &&
        moduleList.length > 0 && [
            { value: "", label: "Select Module*" },
            ...moduleList
                .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
                .map((module) => ({
                    value: module.moduleName,
                    label: module.moduleName,
                })),
        ];

    const typeOptions = typeEnum.length > 0 && [
        { value: "", label: "Select Type*" },
        ...typeEnum
            .map((type) => ({
                value: type,
                label:
                    type === "0"
                        ? "User"
                        : type === "1"
                            ? "Customer"
                            : "System Generated",
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
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

    document.title = "Audit Log | eGov Solution";

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
                                        <h4 className="mb-sm-0">Audit Logs</h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xxl-12">
                                    <div className="card border-0">
                                        <div className="card-body border-0 ">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-2 col-md-6 col-sm-6 col-xxl-2 mb-3 mb-lg-0">
                                                    <div className="search-box">
                                                        <input
                                                            type="text"
                                                            className="form-control search bg-light border-light"
                                                            placeholder="Search"
                                                            value={searchQuery}
                                                            onChange={(e) =>
                                                                handleInputSearch(
                                                                    e
                                                                )
                                                            }
                                                        />
                                                        <i className="ri-search-line search-icon"></i>
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xxl-2 mb-3 mb-lg-0">
                                                    <div className="dateinput  inner-border-0 cursor-pointer">
                                                        <DateRangePopup
                                                            dateStart={
                                                                dateStart
                                                            }
                                                            dateEnd={dateEnd}
                                                            onChangeHandler={
                                                                onChangeHandler
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-md-0">
                                                    <div className=" input-light">
                                                        <Select
                                                            className="bg-choice"
                                                            classNamePrefix="bg-choice "
                                                            name="module"
                                                            value={
                                                                selectedModule
                                                                    ? moduleOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            selectedModule
                                                                    )
                                                                    : null
                                                            }
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
                                                            onChange={(
                                                                selectedOption
                                                            ) =>
                                                                handleModuleChange(
                                                                    selectedOption.value
                                                                )
                                                            }
                                                            options={
                                                                moduleOptions
                                                            }
                                                            placeholder="Select Module*"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-2 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xxl-0">
                                                    <div className=" input-light">
                                                        <Select
                                                            classNamePrefix=" select"
                                                            className="bg-choice"
                                                            name="type"
                                                            value={
                                                                selectedType
                                                                    ? typeOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            selectedType
                                                                    )
                                                                    : null
                                                            }
                                                            onChange={(
                                                                selectedOption
                                                            ) =>
                                                                handleTypeChange(
                                                                    selectedOption.value
                                                                )
                                                            }
                                                            options={
                                                                typeOptions
                                                            }
                                                            placeholder="Select Type*"
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
                                                <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6 col-6 col-xxl-2 mb-3 mb-lg-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center "
                                                        onClick={resetFilters}
                                                    >
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </button>

                                                </div>

                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-6 col-6 col-xxl-2  ms-auto text-end">
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
                                <div></div>
                                <div className="col-xxl-12">
                                    <div className="card border-0 mb-0">
                                        <div className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                    <table
                                                        className="table align-middle mb-0 com_table"
                                                        id="tasksTable"
                                                    >
                                                        <thead className="bg-white">
                                                            <tr>
                                                                {columns.includes(
                                                                    "Module Name"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "moduleName"
                                                                                )
                                                                            }
                                                                        >
                                                                            Module
                                                                            Name{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Action"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "action"
                                                                                )
                                                                            }
                                                                        >
                                                                            Action{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Name"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "userName"
                                                                                )
                                                                            }
                                                                        >
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
                                                                    "Type"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "type"
                                                                                )
                                                                            }
                                                                        >
                                                                            Type{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "IP Address"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "ipAddress"
                                                                                )
                                                                            }
                                                                        >
                                                                            IP
                                                                            Address{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Dated"
                                                                ) && (
                                                                        <th
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "createdDate"
                                                                                )
                                                                            }
                                                                        >
                                                                            Dated{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                            </tr>
                                                        </thead>
                                                        {/* <tbody>
                                                                {logdata && logdata?.length === 0 && !isLoading && (

                                                                    <tr>
                                                                        <td colSpan="7" className="text-center" >
                                                                            No records found.
                                                                        </td>
                                                                    </tr>
                                                              
                                                            )}
                                                              </tbody> */}
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
                                                            ) : logdata.length ===
                                                                0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan="6"
                                                                        className="text-center"
                                                                    >
                                                                        <NotFound
                                                                            heading="Audit Logs not found."
                                                                            message="Unfortunately, audit logs not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                logdata.map(
                                                                    (
                                                                        auditLog,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {columns.includes(
                                                                                "Module Name"
                                                                            ) && (
                                                                                    <td className="">
                                                                                        {auditLog?.moduleName ||
                                                                                            BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Action"
                                                                            ) && (
                                                                                    <td className="">
                                                                                        {auditLog?.action ||
                                                                                            BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Name"
                                                                            ) && (
                                                                                    <td className="">
                                                                                        {auditLog
                                                                                            .user
                                                                                            ?.name ||
                                                                                            (auditLog
                                                                                                .customer
                                                                                                ?.firstName &&
                                                                                                auditLog
                                                                                                    .customer
                                                                                                    ?.lastName
                                                                                                ? `${auditLog.customer.firstName} ${auditLog.customer.lastName}`
                                                                                                : BlankData)}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Email"
                                                                            ) && (
                                                                                    <td className=" ">
                                                                                        {auditLog
                                                                                            .user
                                                                                            ?.email ||
                                                                                            auditLog
                                                                                                .customer
                                                                                                ?.email}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Type"
                                                                            ) && (
                                                                                    <td className=" ">
                                                                                        {auditLog.type ===
                                                                                            "0"
                                                                                            ? "User"
                                                                                            : auditLog.type ===
                                                                                                "1"
                                                                                                ? "Customer"
                                                                                                : "System Generated"}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "IP Address"
                                                                            ) && (
                                                                                    <td className=" ">
                                                                                        {auditLog?.ipAddress ||
                                                                                            BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Dated"
                                                                            ) && (
                                                                                    <td className=" ">
                                                                                        {auditLog?.createdDate
                                                                                            ? format(
                                                                                                new Date(
                                                                                                    auditLog?.createdDate
                                                                                                ),
                                                                                                "dd MMM, yyyy - h:mm a"
                                                                                            )
                                                                                            : BlankData}
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
                                            handlePageChange={handlePageChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollToTop />
        </>
    );
};
export default AuditLog;
