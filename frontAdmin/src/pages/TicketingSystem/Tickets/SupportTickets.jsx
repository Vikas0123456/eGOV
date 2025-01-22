import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import CreateNewTicketModal from "../../../common/modals/CreateNewTicketModal/CreateNewTicketModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import Pagination from "../../../CustomComponents/Pagination";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasAssignPermission,
    calculateRemainingTimeTAT,
} from "../../../common/CommonFunctions/common";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import { format } from "date-fns";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from 'feather-icons-react';
import { Eye } from "feather-icons-react/build/IconComponents";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import errorImage from "../../../assets/images/error.gif";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import ColumnConfig from "../../../common/ColumnConfig/ColumnConfig";
import { setTableColumnConfig } from "../../../slices/layouts/reducer";
function getMonthName(date) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return months[date.getMonth()];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${("0" + date.getDate()).slice(-2)} ${getMonthName(
        date
    )}, ${date.getFullYear()}`;

    // Get the hours and minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Add leading zero to minutes if needed
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedTime = `${hours}:${minutes} ${ampm}`

    return (
        <div>
            <span className="">{formattedDate}</span>
            <small className="d-block text-muted fs-11">{formattedTime}</small>
        </div>
    );
}
const getStatusLabel = (priority) => {
    switch (priority) {
        case 0:
            return "Pending";
        case 1:
            return "In Progress";
        case 2:
            return "Escalated";
        case 3:
            return "Closed";
        case 4:
            return "Reopened";
        default:
            return "Unknown";
    }
};
function formatDateString(isoDateString) {
    if (isoDateString) {
        const isoString = String(isoDateString);
        const date = new Date(isoString);

        const optionsDate = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };

        const optionsTime = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };

        const formattedDate = date.toLocaleDateString("en-GB", optionsDate);
        const formattedTime = date.toLocaleTimeString("en-GB", optionsTime);
        const hasTime = isoString.includes(":");

        return hasTime ? `${formattedDate} ${formattedTime}` : formattedDate;
    } else {
        return "-";
    }
}

function toISOStringWithoutTime(date) {
    // return date ? date.toISOString().split('T')[0] : null;
    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}
const BlankData = process.env.REACT_APP_BLANK;
const SupportTickets = ({ isDashBoard = false }) => {
    const axiosInstance = useAxios()

    const navigate = useNavigate();
    const dispatch = useDispatch()
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const ticketPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "tickets"
        );
    const createPermission = ticketPermissions
        ? hasCreatePermission(ticketPermissions)
        : false;
    const editPermission = ticketPermissions
        ? hasEditPermission(ticketPermissions)
        : false;
    const assignPermission = ticketPermissions
        ? hasAssignPermission(ticketPermissions)
        : false;
    const tableName = "ticket";
    const tableConfigList = useSelector((state) => state?.Layout?.tableColumnConfig);
    const tableColumnConfig = tableConfigList?.find((config) => config?.tableName === tableName)
    // List of all columns
    const allColumns = ["Tickets ID", "Department Name", "Services", "Created By", "Create Date / Time", "Responded On", "TAT", "Assign To", "Priority", "Status"].filter(Boolean);
    const shouldShowAllColumns = !tableColumnConfig?.tableConfig || tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Tickets ID", "Department Name", "Services", "Created By", "Create Date / Time", "Responded On", "TAT", "Assign To", "Priority", "Status", "Action"].filter(Boolean) // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"] // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [openModel, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [priority, setPriority] = useState("Select Priority");
    const [status, setStatus] = useState("All");
    const [ticketData, setTicketData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const [searchValue, setSearchValue] = useState("");
    const [userData, setUserData] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const totalPages = Math.ceil(totalCount / perPageSize);


    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userDetails = userDecryptData?.data;
    const userId = userDetails?.id;

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const handleCloseModel = () => {
        setOpenModal(false);
    };

    const departmentOptions =
        departmentList &&
        departmentList.length > 0 &&
        [{ value: "", label: "Select Department*" }, ...departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }))]

    const handleDepartmentSearch = (e) => {
        setCurrentPage(1);
        if (e) {
            setSelectedDepartment(e);
        } else {
            setSelectedDepartment("")
        }
    };

    const priorityOptions = {
        0: "High",
        1: "Medium",
        2: "Low",
    };

    const handleDateChange = (value) => {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = toISOStringWithoutTime(inputstartDateString);
        const formattedendDate = toISOStringWithoutTime(inputEndDateString);

        if (formattedstartDate) {
            setSelectedDate(formattedstartDate);
        }
        if (formattedendDate) {
            setEndDate(formattedendDate);
        }
        setDateStart(value[0]);
        setDateEnd(value[1]);
        if (inputstartDateString && inputEndDateString) {
            const data = {
                page: currentPage,
                perPage: perPageSize,
                priority:
                    priority == "Select Priority" || priority == "All"
                        ? null
                        : priority,
                status: status == "All" ? null : status,
                dateRange: {
                    startDate: formattedstartDate,
                    endDate: formattedendDate,
                },
                permission: ticketPermissions,
            };
            getTicketData(data);
        }
    };

    const handlePriorityChange = (value) => {
        if (value) {
            setCurrentPage(1);
            setPriority(value);
        } else {
            setPriority("")
        }
    };

    const handleStatusChange = (value) => {
        if (value) {
            setCurrentPage(1);
            setStatus(value);
        } else {
            setStatus("")
        }
    };

    const handleSearchChange = (event) => {
        setCurrentPage(1);
        setSearchValue(event.target.value);
    };

    const resetFilters = async () => {
        // getTicketData();
        setCurrentPage(1);
        setPriority("");
        setSearchValue("");
        setStatus("");
        setDateStart("");
        setDateEnd("");
        setSelectedDate("");
        setEndDate("");
        setSelectedDepartment("");
        setPerPageSize(10)
    };

    const listOfDepartment = async () => {
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
            console.error(error.message);
        }
    };

    useEffect(() => {
        listOfDepartment()
    }, [])

    const getTicketData = async (data) => {
        try {
            setIsLoading(true);
            const requestBody = data
                ? data
                : {
                    page: currentPage,
                    perPage: isDashBoard ? 10 : perPageSize,
                    priority:
                        priority == "Select Priority" || priority == "All"
                            ? null
                            : priority,
                    status: status == "All" ? null : status,
                    dateRange: { startDate: selectedDate, endDate: endDate },
                    permission: ticketPermissions,
                    userId: userId,
                    departmentId: selectedDepartment
                };
            const response = await axiosInstance.post(
                `ticketService/ticket/view`,
                requestBody
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setTicketData(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    const listOfSearch = async (data) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `ticketService/ticket/view`,
                data
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setTicketData(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    const fetchUserList = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/user/getAlluser`,
                {}
            );
            if (response) {
                const { rows } = response?.data?.data;
                setUserData(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (!searchValue) {
            getTicketData();
        }
    }, [currentPage, perPageSize, status, priority, searchValue, selectedDate, selectedDepartment]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchValue) {
                const data = {
                    page: currentPage,
                    perPage: perPageSize,
                    priority:
                        priority == "Select Priority" || priority == "All"
                            ? null
                            : priority,
                    status: status == "All" ? null : status,
                    dateRange: { startDate: selectedDate, endDate: endDate },
                    searchFilter: searchValue,
                    permission: ticketPermissions,
                    userId: userId,
                    departmentId: selectedDepartment
                };
                listOfSearch(data);
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [currentPage, perPageSize, status, priority, searchValue, selectedDate, selectedDepartment]);

    useEffect(() => {
        fetchUserList();
    }, []);

    const updateStatus = async (e, ticket) => {
        try {
            const statusId = e;
            // const statusId = e.target.value;
            const response = await axiosInstance.put(
                `ticketService/ticket/status/${ticket?.id}`,
                {
                    statusId,
                }
            );
            if (response) {
                getTicketData();
                toast.success("Status updated successfully");
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const updatePriority = async (e, ticket) => {
        try {
            const priorityId = e.target.value;
            const response = await axiosInstance.put(
                `ticketService/ticket/priority/${ticket?.id}`,
                {
                    priorityId,
                }
            );
            if (response) {
                getTicketData();
                toast.success("Priority status updated successfully");
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const updateAssignToUser = async (e, ticket) => {
        try {
            const assignToUserId = e;
            // const assignToUserId = e.target.value;
            const response = await axiosInstance.put(
                `ticketService/ticket/assignTo/${ticket?.id}`,
                {
                    assignToUserId,
                    ticketData: ticket,
                }
            );
            if (response) {
                getTicketData();
                toast.success("Assign To user updated successfully");
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const handleClick = (e, ticketDetails) => {
        navigate("/tickets-details", { state: { ticketDetails } });
    };

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
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

    const priorityOptionsAll = [
        { value: "", label: "Select Priority*" },
        { value: "0", label: "High" },
        { value: "1", label: "Medium" },
        { value: "2", label: "Low" },
    ];

    const statusOptions = [
        { value: "", label: "Select Status*" },
        {
            value: "0",
            label: "Pending",
        },
        {
            value: "1",
            label: "Inprogress",
        },
        {
            value: "2",
            label: "Escalated",
        },
        {
            value: "3",
            label: "Closed",
        },
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

    const getStatusOptions = (ticket, userDetails) => {
        const { status, workflowData } = ticket;
        const { isCoreTeam, role } = userDetails;

        if (status === "1") {
            if (workflowData) {
                return [
                    { value: "2", label: "Escalated" },
                    { value: "3", label: "Closed" },
                ];
            } else if (isCoreTeam === "1" || role?.isAdmin === "1") {
                return [
                    { value: "2", label: "Escalated" },
                    { value: "3", label: "Closed" },
                ];
            } else {
                return [{ value: "3", label: "Closed" }];
            }
        } else if (status === "2") {
            return [{ value: "3", label: "Closed" }];
        } else if (status === "3") {
            return [{ value: "3", label: "Closed" }];
        } else {
            return [{ value: "1", label: "In Progress" }];
        }
    };

    // document.title = "Tickets | eGov Solution"
    return (
        <>

            <div id="layout-wrapper">
                <div className={isDashBoard ? "" : "main-content"}>
                    <div className={isDashBoard ? "" : "page-content"}>
                        <div className={isDashBoard ? "" : "container-fluid"}>
                            <div className="row">
                                {!isDashBoard &&
                                    <>
                                        <DepartmentUserInfo />
                                        <div className="col-12">
                                            <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                                <h4 className="mb-sm-0">Tickets</h4>
                                                <div className="page-title-right">
                                                    <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }

                                <div className="col-xxl-12 ">
                                    <div className="card border-0 border-bottom border-bottom-1">
                                        <div className="card-body border-0 p-3">
                                            <div className="row">

                                                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xxl-3 mb-3 ">
                                                    <div className="search-box">
                                                        <input type="text" className="form-control search bg-light border-light" placeholder="Search" value={searchValue} onChange={(e) => handleSearchChange(e)} />
                                                        <i className="ri-search-line search-icon"></i>
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xxl-3 mb-3 ">
                                                    <div className="dateinput inner-border-0">
                                                        <DateRangePopup dateStart={dateStart} dateEnd={dateEnd} onChangeHandler={handleDateChange} />
                                                        {/* <DatePicker id="dateStartEnd" selectsRange={true} startDate={selectedDate} endDate={endDate} onChange={handleDateChange} placeholderText="Select date Range" dateFormat="dd MMM yyyy" className={"form-control bg-light border-light"} autoComplete="off" showDisabledMonthNavigation /> */}
                                                        {/* <DatePicker id="gen-info-dob-input" className="form-control" selected={selectedDate} onChange={(date) => handleDateChange(date) } dateFormat="dd/MM/yyyy" placeholderText="Select date range" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} /> */}
                                                    </div>
                                                </div>
                                                {userDetails && userDetails?.isCoreTeam !== "0" && (
                                                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-3 mb-3 ">
                                                        <div className=" input-light">
                                                            <Select className="bg-choice" data-choices name="choices-single-default" id="idStatus"
                                                                value={selectedDepartment ? departmentOptions.find((option) => option.value === selectedDepartment) : null}
                                                                onChange={(option) => handleDepartmentSearch(option.value)}
                                                                placeholder="Select Department*"
                                                                options={departmentOptions}
                                                                styles={{
                                                                    control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-3 mb-3 ">
                                                    <div className="input-light ">
                                                        <Select className="cursor-pointer bg-choice" name="choices-single-default" id="idStatus"
                                                            value={status ? statusOptions.find((option) => option.value === status) : null}
                                                            onChange={(option) => handleStatusChange(option.value)}
                                                            placeholder="Select Status*" options={statusOptions}
                                                            styles={{
                                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-3 mb-3 mb-sm-0 mb-md-3 mb-lg-0 mb-xl-0">
                                                    <div className="input-light ">
                                                        <Select className="cursor-pointer bg-choice" name="choices-single-default" id="idStatus"
                                                            value={priority ? priorityOptionsAll.find((option) => option.value === priority) : null}
                                                            onChange={(option) => handlePriorityChange(option.value)}
                                                            placeholder="Select Priority*" options={priorityOptionsAll}
                                                            styles={{
                                                                control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col mb-md-0 mb-3">
                                                    <button id="loadMore" className="btn btn-primary btn-label bg-warning border-warning  d-flex align-items-center me-3" onClick={resetFilters}>
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </button>

                                                </div>


                                                <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12 col-xxl-3  d-flex align-items-start justify-content-end">
                                                    {!isDashBoard && createPermission && (

                                                        <div>
                                                            <button type="button" className="btn btn-primary btn-label me-3  text-nowrap" id="create-btn" onClick={(e) => { setOpenModal(true); }}>
                                                                <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                                Create a new ticket
                                                            </button>
                                                        </div>

                                                    )}
                                                    <ColumnConfig openColumnModal={openColumnModal} handleOpenColumnModal={handleOpenColumnModal} handleApplyChanges={handleApplyChanges} handleSelectAll={handleSelectAll} selectedColumns={selectedColumns} allColumns={allColumns} handleColumnChange={handleColumnChange} handleCancel={handleCancel} />
                                                    {isDashBoard &&
                                                        <button type="button" className="btn btn-primary ms-3" id="create-btn" onClick={() => navigate("/support-tickets")}> View All </button>
                                                    }
                                                </div>





                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-12">
                                    <div className="card mb-0 border-0">
                                        <div className="card-body">
                                            <div
                                                className="table-responsive table-card " >
                                                <table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable">
                                                    <thead className="bg-white">
                                                        <tr>
                                                            {columns.includes(
                                                                "Tickets ID"
                                                            ) && (<th className="fw-bold">Tickets ID</th>)}
                                                            {columns.includes(
                                                                "Department Name"
                                                            ) && (<th className="fw-bold">Department Name</th>)}
                                                            {columns.includes(
                                                                "Services"
                                                            ) && (<th className="fw-bold">Services</th>)}
                                                            {columns.includes(
                                                                "Created By"
                                                            ) && (<th className="fw-bold">Created By</th>)}
                                                            {columns.includes(
                                                                "Create Date / Time"
                                                            ) && (<th className="fw-bold">Create Date / Time</th>)}
                                                            {columns.includes(
                                                                "Responded On"
                                                            ) && (<th className="fw-bold">Responded On</th>)}
                                                            {columns.includes(
                                                                "TAT"
                                                            ) && (<th className="fw-bold">TAT</th>)}
                                                            {columns.includes(
                                                                "Assign To"
                                                            ) && (
                                                                    <th className="fw-bold" style={{ minWidth: '150px' }}>Assign To</th>)
                                                            }
                                                            {/* {editPermission && ( */}
                                                            {columns.includes(
                                                                "Priority"
                                                            ) && (<th className="fw-bold">Priority</th>)}
                                                            {/* )} */}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (<th className="fw-bold">Status</th>)}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (<th className="fw-bold">Update Status</th>)}
                                                            {columns.includes(
                                                                "Action"
                                                            ) && (<th className="fw-bold">Action</th>)}

                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {isLoading ? (
                                                            <tr>
                                                                <td colSpan="11" className="text-center">
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        ) : ticketData.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="11" className="text-center">
                                                                    <NotFound heading="Tickets not found." message="Unfortunately, tickets not available at the moment." />
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            ticketData.map((ticket) => {
                                                                const userOptions =
                                                                    ticket?.assignUserDropDown.length > 0
                                                                        ? ticket.assignUserDropDown.map(
                                                                            (user) => ({
                                                                                value: user.userId,
                                                                                label: `${user.userName} ${user?.isSupportTeam === "1" ? "(Support)" : ""}`,
                                                                            })
                                                                        )
                                                                        : ticket?.assignDepartmentUser.map(
                                                                            (user) => ({
                                                                                value: user.id,
                                                                                label: `${user.name} ${user?.isSupportTeam === "1" ? "(Support)" : ""}`,
                                                                            })
                                                                        ) ||
                                                                        [];

                                                                // Handle the change event
                                                                const handleChange =
                                                                    (selectedOption) => {
                                                                        updateAssignToUser(
                                                                            selectedOption
                                                                                ? selectedOption.value : "",
                                                                            ticket
                                                                        );
                                                                    };

                                                                // Find the currently selected option
                                                                const selectedOption =
                                                                    userOptions.find((option) => option.value === parseInt(ticket?.assignTo)) || "";

                                                                // Handle the change event for the select component
                                                                const handleStatusChange =
                                                                    (selectedOption) => {
                                                                        updateStatus(selectedOption ? selectedOption.value : "", ticket);
                                                                    };

                                                                // Determine the currently selected option
                                                                const selectedStatusOption = getStatusOptions(ticket, userDetails)?.find((option) => option.value === ticket.status) || null;

                                                                return (

                                                                    <tr key={ticket.id}>
                                                                        {columns.includes(
                                                                            "Tickets ID"
                                                                        ) && (<td>
                                                                            <div className="fw-bold text-black">
                                                                                # {ticket?.ticketId || BlankData}
                                                                            </div>
                                                                        </td>)}
                                                                        {columns.includes(
                                                                            "Department Name"
                                                                        ) && (<td>
                                                                            {ticket?.departmentData?.departmentName || BlankData}
                                                                        </td>)}
                                                                        {columns.includes(
                                                                            "Services"
                                                                        ) && (<td className="fw-bold">
                                                                            {ticket?.serviceData?.serviceName || BlankData}
                                                                        </td>)}
                                                                        {columns.includes(
                                                                            "Created By"
                                                                        ) && (<td>
                                                                            {ticket?.user ? ticket?.user?.userName : ticket?.customerData?.customerName}
                                                                        </td>)}
                                                                        {columns.includes(
                                                                            "Create Date / Time"
                                                                        ) && (<td>
                                                                            {/* <div className="current-date"></div> */}
                                                                            <div>
                                                                                {/* {formatDateString(ticket?.createdDate)} */}
                                                                                {/* {ticket?.createdDate ? format(new Date(ticket?.createdDate), "dd MMM, yyyy - h:mm a") : "-"} */}
                                                                                {formatDate(ticket?.createdDate) || BlankData}
                                                                            </div>
                                                                        </td>)}
                                                                        {columns.includes(
                                                                            "Responded On"
                                                                        ) && (<td>
                                                                            {/* <div className="current-date"></div> */}
                                                                            <div>
                                                                                {/* {formatDateString( ticket?.respondedOn )} */}
                                                                                {/* {ticket?.respondedOn ? format(new Date(ticket?.respondedOn), "dd MMM, yyyy - h:mm a") : "-"} */}
                                                                                {ticket?.respondedOn ? formatDate(ticket.respondedOn) : BlankData}
                                                                            </div>
                                                                        </td>)}

                                                                        {columns.includes(
                                                                            "TAT"
                                                                        ) && (<td>
                                                                            {ticket?.turnAroundTime ? (
                                                                                <>
                                                                                    {" "} {calculateRemainingTimeTAT(ticket?.turnAroundTime, ticket?.status, "ticket") === "Completed" ? (
                                                                                        <div className="badge bg-success d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                                                                            <div className="mb-0 ms-1 fs-13" id="demo1">
                                                                                                {calculateRemainingTimeTAT(ticket?.turnAroundTime, ticket?.status, "ticket")}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : calculateRemainingTimeTAT(ticket?.turnAroundTime, ticket?.status, "ticket") === "Overdue" ? (
                                                                                        <div className="badge bg-danger d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-alert fs-14"></i>
                                                                                            <span className="mb-0 ms-1 fs-13">
                                                                                                {calculateRemainingTimeTAT(ticket?.turnAroundTime, ticket?.status, "ticket")}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="badge bg-warning d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-outline fs-14"></i>
                                                                                            <span className="mb-0 ms-1 fs-13">
                                                                                                {calculateRemainingTimeTAT(ticket?.turnAroundTime, ticket?.status, "ticket")}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                BlankData
                                                                            )}
                                                                        </td>)}

                                                                        {columns.includes(
                                                                            "Assign To"
                                                                        ) && (<td>
                                                                            <Select
                                                                                isDisabled={ticket?.status === "3" || (ticket?.status != "2" && (userDetails?.isCoreTeam != "1" && !assignPermission)) || (!assignPermission && ticket?.assignTo != userId)}
                                                                                value={selectedOption}
                                                                                onChange={handleChange}
                                                                                options={userOptions}
                                                                                placeholder="Assign To"
                                                                                styles={{
                                                                                    control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                    menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                    option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                }}
                                                                                menuPosition="fixed"
                                                                            />
                                                                        </td>)
                                                                        }
                                                                        {columns.includes(
                                                                            "Priority"
                                                                        ) && (
                                                                                <td>
                                                                                    {ticket?.priority ? (<>
                                                                                        {ticket?.priority === "0" && (
                                                                                            <span className="badge" id="t-priority" >
                                                                                                <span className="badge badge-soft-danger fs-11 border border-1 border-danger">
                                                                                                    High
                                                                                                </span>
                                                                                            </span>
                                                                                        )}
                                                                                        {ticket?.priority === "1" && (
                                                                                            <span className="badge" id="t-priority" >
                                                                                                <span className="badge badge-soft-info fs-11 border border-1 border-info">
                                                                                                    Medium
                                                                                                </span>
                                                                                            </span>
                                                                                        )}{" "}
                                                                                        {ticket?.priority === "2" && (
                                                                                            <span className="badge" id="t-priority" >
                                                                                                <span className="badge badge-soft-warning fs-11 border border-1 border-warning">
                                                                                                    Low
                                                                                                </span>
                                                                                            </span>
                                                                                        )}
                                                                                    </>) : (
                                                                                        BlankData
                                                                                    )}

                                                                                </td>)}
                                                                        {columns.includes(
                                                                            "Status"
                                                                        ) && (<td>
                                                                            {ticket?.status ?
                                                                                <>
                                                                                    {ticket?.status ===
                                                                                        "0" && (
                                                                                            <div className="px-3 badge border border-warning text-warning bg-soft-warning fs-13 p-2 pe-none">
                                                                                                <span className="">
                                                                                                    Pending
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                    {ticket?.status ===
                                                                                        "1" && (
                                                                                            <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                                <span className="">
                                                                                                    Inprogress
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                    {ticket?.status ===
                                                                                        "2" && (
                                                                                            <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                                <span className="">
                                                                                                    Escalated
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                    {ticket?.status ===
                                                                                        "3" && (
                                                                                            <div className="px-3 badge border border-success text-success bg-soft-success fs-13 p-2 pe-none">
                                                                                                <span className="">
                                                                                                    Closed
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}

                                                                                    {ticket?.status ===
                                                                                        "4" && (
                                                                                            <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                                <span className="">
                                                                                                    Reopened
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                </>
                                                                                : BlankData}
                                                                        </td>)}
                                                                        {
                                                                            columns.includes(
                                                                                "Status"
                                                                            ) && (
                                                                                <td>
                                                                                    <Select
                                                                                        isDisabled={(!ticket?.assignTo || ticket?.status === "3") || (userDetails?.isCoreTeam != "1" && !assignPermission && ticket?.assignTo != userId)}
                                                                                        value={selectedStatusOption}
                                                                                        onChange={handleStatusChange}
                                                                                        options={getStatusOptions(ticket, userDetails)}
                                                                                        placeholder="Select Status"
                                                                                        styles={{
                                                                                            control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                            menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                            option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                                        }}
                                                                                        menuPosition="fixed"
                                                                                    />
                                                                                </td>
                                                                            )}
                                                                        <td onClick={(e) => handleClick(e, ticket)}>
                                                                            <div className="py-2 px-2 cursor-pointer" title="View">
                                                                                <Eye width="18" height="18" className="text-primary " />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                            )

                                                        )}

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {!isDashBoard &&
                                            <Pagination
                                                totalCount={totalCount}
                                                perPageSize={perPageSize}
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                handleSelectPageSize={handleSelectPageSize}
                                                handlePageChange={handlePageChange}
                                            />}
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
                {openModel ? (
                    <CreateNewTicketModal
                        openModel={openModel}
                        handleCloseModel={handleCloseModel}
                        userData={userData}
                        getTicketData={getTicketData}
                        ticketPermissions={ticketPermissions}
                    />
                ) : null}
                <div
                    className="modal fade zoomIn"
                    id="deleteRecordModal"
                    tabIndex="-1"
                    aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    id="btn-close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mt-2 text-center">
                                    <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json"
                                        trigger="loop"
                                        colors="dark:#25a0e2,secondary:#00bd9d"
                                        style={{ width: "100px", height: "100px", }}></lord-icon>
                                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                                        <h4>Are you sure ?</h4>
                                        <p className="text-muted mx-4 mb-0"> Are you sure you want to remove this user ? </p>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                                    <button type="button" className="btn w-sm btn-light" data-bs-dismiss="modal"> Close </button>
                                    <button type="button" className="btn w-sm btn-primary" id="delete-record"> Yes, Delete It! </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isDashBoard && <ScrollToTop />}
        </>
    );
};

export default SupportTickets;
