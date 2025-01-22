import React, { useEffect, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import Pagination from "../../CustomComponents/Pagination";
import "../css/fileupload.css";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { hasViewPermission } from "../../common/CommonFunctions/common";
import { format } from "date-fns";
import star from "../../assets/images/ri--star-s-fill.png";
import DateRangePopup from "../../common/Datepicker/DatePicker";
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
import { RiStarFill, RiStarLine } from "react-icons/ri";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import CommentModal from "./CommentModal";

function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const UserReview = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableName = "review&feedback";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = ["Citizen", "Department", "Comments", "Rating", "Dated"];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Citizen", "Department", "Comments", "Rating", "Dated"] // Define all available columns
        : [...tableColumnConfig?.tableConfig]; // Ensure "actions" is include

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    // table data filter search sort
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");

    const [commentShow, setCommentShow] = useState(false);
    const [selectedComment, setSelectedComment] = useState("");

    //loader
    const [isLoading, setIsLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const [selectStartDate, setSelectStartDate] = useState("");
    const [selectEndDate, setSelectEndDate] = useState("");
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const FeedbackPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "reviewfeedback"
        );
    const viewPermissions = FeedbackPermissions
        ? hasViewPermission(FeedbackPermissions)
        : false;
    
    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const fetchFeedbackList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/feedback/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    sortOrder: sortOrder,
                    orderBy: orderBy,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
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
            console.error(error);
        }
    };

    const listOfSearch = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/feedback/view`,
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
                }
            );

            if (response?.data) {
                const { rows, count } = response.data.data;

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
    }, [
        searchQuery,
        currentPage,
        perPageSize,
        orderBy,
        sortOrder,
        selectStartDate,
        selectEndDate,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            fetchFeedbackList();
        }
    }, [
        searchQuery,
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
        setCommentShow(false);
    };

    const handleCommentModal = (selectedComment) => {
        setSelectedComment(selectedComment);
        setCommentShow(true);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return text;
    };

    document.title = "Reviews & Feedback | eGov Solution";
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
                                            Review & Feedbacks
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xxl-12">
                                    <div className="card border-0">
                                        <div className="card-body border-0 ">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-4 col-xxl-2 mb-3 mb-sm-0">
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
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-4 col-xxl-2 mb-3 mb-sm-0">
                                                    <div className="dateinput  inner-border-0">
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
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-4 col-xxl-2 mb-3 mb-md-0">
                                                <button
                                                        type="button"
                                                        className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center "
                                                        onClick={resetFilters}
                                                    > <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                            Reset
                                                    </button>
                                                </div>
                                                <div className="col-xl-5 col-lg-3 col-9 col-md-3 col-sm-4 col-xxl-4 ms-auto text-end">
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
                                                        className="table align-middle mb-0 com_table"
                                                        id="tasksTable"
                                                    >
                                                        <thead className="bg-white">
                                                            <tr>
                                                                {columns.includes(
                                                                    "Citizen"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "firstName"
                                                                            )
                                                                        }
                                                                    >
                                                                        Citizen{" "}
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
                                                                    "Comments"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "note"
                                                                            )
                                                                        }
                                                                    >
                                                                        Comments{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>
                                                                    </th>
                                                                )}
                                                                {columns.includes(
                                                                    "Rating"
                                                                ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "rating"
                                                                            )
                                                                        }
                                                                    >
                                                                        Rating{" "}
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
                                                                                "Dated"
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
                                                        {/* {data && !isLoading &&
                                                                data?.length ===
                                                        0 && (
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan="7" className="text-center" > No records found. </td>
                                                                        </tr>
                                                                    </tbody>
                                                                )} */}
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
                                                                            heading="Reviews & Feedbacks not found."
                                                                            message="Unfortunately, reviews & feedbacks not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                data?.map(
                                                                    (
                                                                        feedback,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {columns.includes(
                                                                                "Citizen"
                                                                            ) && (
                                                                                <td
                                                                                    className="text-nowrap"
                                                                                    style={{
                                                                                        width: "300px",
                                                                                    }}
                                                                                >
                                                                                    {feedback
                                                                                        .customer
                                                                                        .firstName &&
                                                                                    feedback
                                                                                        .customer
                                                                                        .lastName
                                                                                        ? `${feedback.customer.firstName} ${feedback.customer.lastName}`
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Department"
                                                                            ) && (
                                                                                <td className="w-xl text-nowrap">
                                                                                    {feedback.type ===
                                                                                    "1"
                                                                                        ? feedback.departmentId ===
                                                                                          0
                                                                                            ? "All"
                                                                                            : feedback.departmentName ||
                                                                                              "-"
                                                                                        : feedback.type ===
                                                                                          "0"
                                                                                        ? "About eGOV"
                                                                                        : feedback.type ===
                                                                                          "2"
                                                                                        ? "Others"
                                                                                        : "-"}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Comments"
                                                                            ) && (
                                                                                // <td className="w-xl text-nowrap">
                                                                                //     {feedback.note
                                                                                //         ? feedback.note
                                                                                //         : "-"}
                                                                                // </td>
                                                                                <td
                                                                                    className="w-xl text-nowrap"
                                                                                    onClick={() => handleCommentModal(feedback.note ? feedback.note : "-")}
                                                                                    style={{ cursor: "pointer" }}
                                                                                    title={"Click here for detailed comment."}
                                                                                >
                                                                                    {truncateText(feedback.note ? feedback.note : "-", 5)}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Rating"
                                                                            ) && (
                                                                                <td className="w-xl text-nowrap">
                                                                                    {feedback.rating ? (
                                                                                        <>
                                                                                            {[
                                                                                                ...Array(
                                                                                                    5
                                                                                                ),
                                                                                            ].map(
                                                                                                (
                                                                                                    _,
                                                                                                    index
                                                                                                ) =>
                                                                                                    index <
                                                                                                    feedback.rating ? (
                                                                                                        <RiStarFill
                                                                                                            key={
                                                                                                                index
                                                                                                            }
                                                                                                            style={{
                                                                                                                color: "#ffc107",
                                                                                                                fontSize:
                                                                                                                    "15px",
                                                                                                            }}
                                                                                                        />
                                                                                                    ) : (
                                                                                                        <RiStarLine
                                                                                                            key={
                                                                                                                index
                                                                                                            }
                                                                                                            style={{
                                                                                                                color: "#ffc107",
                                                                                                                fontSize:
                                                                                                                    "15px",
                                                                                                            }}
                                                                                                        />
                                                                                                    )
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        "-"
                                                                                    )}
                                                                                </td>
                                                                            )}
                                                                            {columns.includes(
                                                                                "Dated"
                                                                            ) && (
                                                                                <td className="w-xl text-nowrap">
                                                                                    {feedback.createdDate
                                                                                        ? format(
                                                                                              new Date(
                                                                                                  feedback.createdDate
                                                                                              ),
                                                                                              "dd MMM, yyyy - h:mm a"
                                                                                          )
                                                                                        : "-"}
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
                <CommentModal
                    commentShow={commentShow}
                    setCommentShow={setCommentShow}
                    handleToggle={handleToggle}
                    selectedComment={selectedComment}
                />
            </div>

            <ScrollToTop />
        </>
    );
};
export default UserReview;
