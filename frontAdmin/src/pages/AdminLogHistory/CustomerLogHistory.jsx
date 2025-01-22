import React, { useEffect, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import Pagination from "../../CustomComponents/Pagination";
import "../css/fileupload.css";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { hasViewPermission } from "../../common/CommonFunctions/common";
import { format } from "date-fns";
import DateRangePopup from "../../common/Datepicker/DatePicker";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import { Badge, Dropdown } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import { toast } from "react-toastify";

function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const CustomerLogHistory = () => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const [logdata, setLogData] = useState([]);
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
    const [selectedType, setSelectedType] = useState("");
    //loader
    const [isLoading, setIsLoading] = useState(true);
    const typeEnum = ["0", "1"];

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const FeedbackPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "customerLogHistory"
        );
    const viewPermissions = FeedbackPermissions
        ? hasViewPermission(FeedbackPermissions)
        : false;

    const dispatch = useDispatch();
    const tableName = "customerLogHistory";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "Customer Name",
        "Customer Email",
        "Browser Info",
        "Operating System",
        "IP Address",
        "Type",
        "Login Time",
        "Logout Time",
    ].filter(Boolean);
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
              "Customer Name",
              "Customer Email",
              "Browser Info",
              "Operating System",
              "IP Address",
              "Type",
              "Login Time",
              "Logout Time",
              "Action",
          ].filter(Boolean) // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const searchLogList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/customer/customer-login-history/view",
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
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;

                setLogData(records);
                setTotalCount(totalRecords);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching audit logs:", error.message);
        }
    };

    const typeOptions = typeEnum.length > 0 && [
        { value: "", label: "Select Type*" },
        ...typeEnum.map((type) => ({
            value: type,
            label: type === "0" ? "Failure" : type === "1" ? "Success" : "-",
        })),
    ];

    const logList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/customer/customer-login-history/view",
                {
                    page: currentPage,
                    perPage: perPageSize,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;

                setLogData(records);
                setTotalCount(totalRecords);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching audit logs:", error.message);
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
        setSelectedType("");
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };

    const handleTypeChange = (selectedType) => {
        if (selectedType) {
            setCurrentPage(1);
            setSelectedType(selectedType);
        } else {
            setSelectedType("");
        }
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
            setIsLoading(false);
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

    document.title = "Customer Log History | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <Dropdown className="card-header-dropdown">
                                            <Dropdown.Toggle
                                                variant="link"
                                                id="dropdown-basic"
                                                className="dropdown-btn h4 text-black py-0"
                                                style={{ cursor: "pointer" }}>
                                                Customer Log Report
                                                <i className="mdi mdi-chevron-down align-middle"></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        navigate(
                                                            "/admin-log-report"
                                                        )
                                                    }>
                                                    Admin Log Report
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xxl-12 mb-3">
                                    <div className="card border-0">
                                        <div className="card-body border-0 ">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-md-0 mb-lg-0">
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

                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-md-0 mb-lg-0">
                                                    <div className="dateinput inner-border-0 ">
                                                        <DateRangePopup
                                                            dateStart={
                                                                dateStart
                                                            }
                                                            dateEnd={dateEnd}
                                                            onChangeHandler={
                                                                onChangeHandler
                                                            }
                                                        />{" "}
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0   mb-md-3 mb-lg-0 mb-xl-0">
                                                    <div className="input-light">
                                                        <Select
                                                            className="bg-choice"
                                                            classNamePrefix="select"
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
                                                                    selectedOption
                                                                        ? selectedOption.value
                                                                        : ""
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
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6  col-xxl-3 mb-3 mb-md-0 mb-lg-0  d-flex align-items-start justify-content-start">
                                                    <button
                                                        type="button"         
                                                        className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                        onClick={resetFilters}>
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </button>

                                                    </div>
                                                    <div className="col d-flex align-items-center justify-content-end ms-auto">
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
                                <div className="col-xxl-12">
                                    <div className="card border-0 mb-0">
                                        <div className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                <SimpleBar
                                                    style={{
                                                        maxHeight:
                                                            "calc(100vh - 50px)",
                                                        overflowX: "auto",
                                                    }}>
                                                    <table
                                                        className="table align-middle mb-0 com_table"
                                                        id="tasksTable">
                                                        <thead className="bg-white">
                                                            <tr>
                                                                {columns.includes(
                                                                    "Customer Name"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "customerFirstName"
                                                                            )
                                                                        }>
                                                                        {" "}
                                                                        Customer
                                                                        Name{" "}
                                                                        <span>
                                                                            <BiSortAlt2 />
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Customer Email"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "customerEmail"
                                                                            )
                                                                        }>
                                                                        Customer
                                                                        Email{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Browser Info"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "browserInfo"
                                                                            )
                                                                        }>
                                                                        Browser
                                                                        Info{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Operating System"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "os"
                                                                            )
                                                                        }>
                                                                        Operating
                                                                        System{" "}
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
                                                                        }>
                                                                        IP
                                                                        Address{" "}
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
                                                                                "isLoginSuccess"
                                                                            )
                                                                        }>
                                                                        Type{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Login Time"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "createdDate"
                                                                            )
                                                                        }>
                                                                        Login
                                                                        Time{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Logout Time"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "logoutTime"
                                                                            )
                                                                        }>
                                                                        Logout
                                                                        Time{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        {isLoading ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="11"
                                                                    className="text-center">
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        ) : logdata?.length ===
                                                          0 ? (
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        colSpan="11"
                                                                        className="text-center">
                                                                        <NotFound
                                                                            heading="Customer Log Report not found."
                                                                            message="Unfortunately, customer log report not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        ) : (
                                                            logdata &&
                                                            logdata?.map(
                                                                (
                                                                    customerLogHistory,
                                                                    index
                                                                ) => (
                                                                    <tbody
                                                                        key={
                                                                            index
                                                                        }>
                                                                        <tr>
                                                                            {columns.includes(
                                                                                "Customer Name"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.customerFirstName ||
                                                                                    customerLogHistory?.customerMiddleName ||
                                                                                    customerLogHistory?.customerLastName
                                                                                        ? `${
                                                                                              customerLogHistory?.customerFirstName ||
                                                                                              ""
                                                                                          } ${
                                                                                              customerLogHistory?.customerMiddleName ||
                                                                                              ""
                                                                                          } ${
                                                                                              customerLogHistory?.customerLastName ||
                                                                                              ""
                                                                                          }`.trim()
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Customer Email"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.customerEmail
                                                                                        ? customerLogHistory?.customerEmail
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Browser Info"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.browserInfo
                                                                                        ? customerLogHistory?.browserInfo
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Operating System"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.os
                                                                                        ? customerLogHistory?.os
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "IP Address"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.ipAddress
                                                                                        ? customerLogHistory?.ipAddress
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Type"
                                                                            ) && (
                                                                                <td>
                                                                                    <Badge
                                                                                        bg={
                                                                                            customerLogHistory.isLoginSuccess ===
                                                                                            "0"
                                                                                                ? "danger"
                                                                                                : customerLogHistory.isLoginSuccess ===
                                                                                                  "1"
                                                                                                ? "success"
                                                                                                : "secondary"
                                                                                        }>
                                                                                        {customerLogHistory.isLoginSuccess ===
                                                                                        "0"
                                                                                            ? "Failure"
                                                                                            : customerLogHistory.isLoginSuccess ===
                                                                                              "1"
                                                                                            ? "Success"
                                                                                            : "-"}
                                                                                    </Badge>
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Login Time"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.createdDate
                                                                                        ? format(
                                                                                              new Date(
                                                                                                  customerLogHistory?.createdDate
                                                                                              ),
                                                                                              "dd MMM, yyyy - h:mm a"
                                                                                          )
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Logout Time"
                                                                            ) && (
                                                                                <td className="text-nowrap">
                                                                                    {customerLogHistory?.logoutTime
                                                                                        ? format(
                                                                                              new Date(
                                                                                                  customerLogHistory?.logoutTime
                                                                                              ),
                                                                                              "dd MMM, yyyy - h:mm a"
                                                                                          )
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    </tbody>
                                                                )
                                                            )
                                                        )}
                                                    </table>
                                                </SimpleBar>
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
export default CustomerLogHistory;
