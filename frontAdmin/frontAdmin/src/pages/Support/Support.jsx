import React, { useEffect, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import Pagination from "../../CustomComponents/Pagination";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import { toast } from "react-toastify";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import MessageModal from "./MessageModal";

const Support = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableName = "support";
    const tableColumnConfig =
        tableConfigList &&
        tableConfigList?.find((data) => data?.tableName === tableName);
    // List of all columns
    const allColumns = ["Name", "Email", "Department", "Message"];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Name", "Email", "Department", "Message"] // Define all available columns
        : [...tableColumnConfig?.tableConfig]; // Ensure "actions" is include
    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
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
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);

    const [messageShow, setMessageShow] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState("");

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);


    const fetchSupportList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/support/view`,
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
                `userService/support/view`,
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
            fetchSupportList();
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

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
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
        setMessageShow(false);
    };

    const handleMessageModal = (selectedMessage) => {
        setSelectedMessage(selectedMessage);
        setMessageShow(true);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return text;
    };

    document.title = "Support | eGov Solution";

    return (
        <div>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <DepartmentUserInfo />
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Support Messages
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
                                            <div className="col">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                    onClick={resetFilters}
                                                >
                                                     <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                     Reset
                                                </button>
                                            </div>

                                            <div className="col-xl-4 col-lg-4 col-12 col-md-4 col-sm-6  col-xxl-4 ms-auto text-end d-flex align-items-start justify-content-end">

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
                                                                        </span>{" "}
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
                                                                "Message"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "message"
                                                                            )
                                                                        }
                                                                    >
                                                                        Message{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
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
                                                                        heading="Support messages not found."
                                                                        message="Unfortunately, support messages not available at the moment."
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            data?.map(
                                                                (
                                                                    support,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {columns.includes(
                                                                            "Name"
                                                                        ) && (
                                                                                <td>
                                                                                    <div className="fw-bold text-black">
                                                                                        {
                                                                                            support.name
                                                                                        }
                                                                                    </div>
                                                                                </td>
                                                                            )}

                                                                        {columns.includes(
                                                                            "Email"
                                                                        ) && (
                                                                                <td>
                                                                                    {
                                                                                        support.email
                                                                                    }
                                                                                </td>
                                                                            )}

                                                                        {columns.includes(
                                                                            "Department"
                                                                        ) && (
                                                                                <td>
                                                                                    {
                                                                                        support
                                                                                            .departmentData
                                                                                            .departmentName
                                                                                    }
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Message"
                                                                        ) && (
                                                                            <td
                                                                                onClick={() => handleMessageModal(support.message)}
                                                                                style={{ cursor: "pointer" }}
                                                                                title={"Click here for detailed message."}
                                                                            >
                                                                                {truncateText(support.message || BlankData, 5)}
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
                <MessageModal
                    messageShow={messageShow}
                    setMessageShow={setMessageShow}
                    handleToggle={handleToggle}
                    selectedMessage={selectedMessage}
                />
            </div>

            <ScrollToTop />
        </div>
    );
};

export default Support;
