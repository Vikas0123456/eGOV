import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import { LoaderSpin } from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import SimpleBar from "simplebar-react";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
import Pagination from "../../../CustomComponents/Pagination";
import { Button, Collapse } from "react-bootstrap";
import { IoChevronBack } from "react-icons/io5";
import classnames from "classnames";
import DataExportDateRangePopup from "../../../common/Datepicker/DataExportDatePicker";
import { toast } from "react-toastify";

function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function calculatePercentage(totalCompletedTime, totalTATDays) {
    if (totalCompletedTime > 0 && totalTATDays > 0) {
        let percentage = (totalCompletedTime / totalTATDays) * 100;
        return parseFloat(percentage.toFixed(2));
    }
    return 0;
}

const TicketPerformanceByUser = () => {
    const axiosInstance = useAxios();
    const location = useLocation();
    const navigate=useNavigate()
    const { serviceSlug, serviceName, departmentName } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [userPerformanceList, setUserPerformanceList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectStartDate, setSelectStartDate] = useState("");
    const [selectEndDate, setSelectEndDate] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(25);
    const totalPages = Math.ceil(totalCount / perPageSize);

    const [isDateRangePopupVisibleForExcel, setIsDateRangePopupVisibleForExcel] = useState(false);
    const [dateStartForExcel, setDateStartForExcel] = useState("");
    const [dateEndForExcel, setDateEndForExcel] = useState("");
    const [selectStartDateForExcel, setSelectStartDateForExcel] = useState("");
    const [selectEndDateForExcel, setSelectEndDateForExcel] = useState("");
    const [selectStartDateForPDF, setSelectStartDateForPDF] = useState("");
    const [selectEndDateForPDF, setSelectEndDateForPDF] = useState("");
    const [isDateRangePopupVisibleForPDF, setIsDateRangePopupVisibleForPDF] = useState(false);
    const [dateStartForPDF, setDateStartForPDF] = useState("");
    const [dateEndForPDF, setDateEndForPDF] = useState("");
    const [exportLoader, setExportLoader] = useState({
        excel: false,
        pdf: false,
    });

    function onChangeHandlerForExcel(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectStartDateForExcel(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectEndDateForExcel(formattedendDate);
        }
        setDateStartForExcel(value[0]);
        setDateEndForExcel(value[1]);

        setIsDateRangePopupVisibleForExcel(false);
    }

    function onChangeHandlerForPDF(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectStartDateForPDF(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectEndDateForPDF(formattedendDate);
        }
        setDateStartForPDF(value[0]);
        setDateEndForPDF(value[1]);

        setIsDateRangePopupVisibleForPDF(false);
    }

    const handleExportButtonClickForExcel = () => {
        setIsDateRangePopupVisibleForExcel(!isDateRangePopupVisibleForExcel);
        setIsDateRangePopupVisibleForPDF(false);
    };

    const handleExportButtonClickForPDF = () => {
        setIsDateRangePopupVisibleForPDF(!isDateRangePopupVisibleForPDF);
        setIsDateRangePopupVisibleForExcel(false);
    };

    useEffect(() => {
        if (selectEndDateForExcel) {
            excelReportExport();
        }
    }, [selectStartDateForExcel, selectEndDateForExcel]);

    useEffect(() => {
        if (selectEndDateForPDF) {
            pdfReportExport();
        }
    }, [selectStartDateForPDF, selectEndDateForPDF]);

    const excelReportExport = async () => {
        setExportLoader({ excel: true, pdf: false });
        const timestamp = new Date().getTime();
        const fileName = `agent_performance_report_${timestamp}.xlsx`;

        try {
            const response = await axiosInstance.post(
                `departmentReport/agentTicketPerformance/exportToExcel`,
                {
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDateForExcel,
                        endDate: selectEndDateForExcel,
                    },
                    fileName: fileName,
                    serviceName: serviceName,
                    departmentName: departmentName
                }
            );

            if (
                response.data.data.result.message === "No data found to export."
            ) {
                toast.info("No data found to export.");
                setExportLoader({ excel: false, pdf: false });
                return;
            }

            fetch(`${response?.data?.data?.result}`)
                .then((response) => response.blob())
                .then(async (blob) => {
                    const fileURL = window.URL.createObjectURL(
                        new Blob([blob])
                    );

                    const a = document.createElement("a");
                    a.href = fileURL;
                    a.download = `${fileName}`;

                    a.click();

                    window.URL.revokeObjectURL(fileURL);

                    await axiosInstance.post(
                        `departmentReport/agentTicketPerformance/removeExcel`,
                        {
                            fileName: fileName,
                        }
                    );

                    setSelectStartDateForExcel("");
                    setSelectEndDateForExcel("");
                    setDateStartForExcel("");
                    setDateEndForExcel("");

                    setExportLoader({ excel: false, pdf: false });
                })
                .catch((error) => {
                    console.error("Error downloading Excel:", error);
                });
        } catch (error) {
            console.error(error.message);
            setExportLoader({ excel: false, pdf: false });
        }
    };

    const pdfReportExport = async () => {
        setExportLoader({ excel: false, pdf: true });
        const timestamp = new Date().getTime();
        const fileName = `agent_performance_report_${timestamp}.pdf`;

        try {
            const response = await axiosInstance.post(
                `departmentReport/agentTicketPerformance/generateDeptPdf`,
                {
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDateForPDF,
                        endDate: selectEndDateForPDF,
                    },
                    fileName: fileName,
                    serviceName: serviceName,
                    departmentName: departmentName
                }
            );

            if (
                response.data.data.result.message === "No data found to export."
            ) {
                toast.info("No data found to export.");
                setExportLoader({ excel: false, pdf: false });
                return;
            }

            fetch(`${response?.data?.data?.result}`)
                .then((response) => response.blob())
                .then((blob) => {
                    const fileURL = window.URL.createObjectURL(
                        new Blob([blob])
                    );
                    const a = document.createElement("a");
                    a.href = fileURL;
                    a.download = `${fileName}`;
                    a.click();
                    window.URL.revokeObjectURL(fileURL);

                    const result = axiosInstance.post(
                        `departmentReport/agentTicketPerformance/removeDeptPdf`,
                        {
                            fileName: fileName,
                        }
                    );

                    setSelectStartDateForPDF("");
                    setSelectEndDateForPDF("");
                    setDateStartForPDF("");
                    setDateEndForPDF("");

                    if (result.data) {
                    }
                })
                .catch((error) => {
                    console.error("Error downloading PDF:", error);
                });
            setExportLoader({ excel: false, pdf: false });
        } catch (error) {
            console.error(error.message);
            setExportLoader({ excel: false, pdf: false });
        }
    };

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
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
    const onChangeHandler = (value) => {
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
    };

    const getServiceReport = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `departmentReport/ticketagentPerformance/list`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    searchQuery: searchQuery,
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                }
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setUserPerformanceList(rows);
                setTotalCount(count);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong");
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                getServiceReport();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [searchQuery, dateEnd, currentPage, perPageSize]);

    useEffect(() => {
        if (!searchQuery) {
            getServiceReport();
        }
    }, [searchQuery, dateEnd, currentPage, perPageSize]);
    const calculateAverageTimePerRequest = (
        RequestCompleted,
        completedHours
    ) => {
        const totalMinutes = parseInt(completedHours, 10);

        // Check if RequestCompleted is not zero to avoid division by zero
        if (RequestCompleted > 0) {
            const averageTimeInMinutes = totalMinutes / RequestCompleted;

            // Calculate days, hours, and minutes from the total minutes
            const days = Math.floor(averageTimeInMinutes / (60 * 24)); // 1 day = 24 hours
            const hours = Math.floor((averageTimeInMinutes % (60 * 24)) / 60); // remaining hours
            const minutes = Math.floor(averageTimeInMinutes % 60); // remaining minutes

            // Build the result string based on the calculated values
            let result = "";

            // Show only days if more than 24 hours
            if (days > 0) {
                result += `${days} day${days > 1 ? "s" : ""}`;
            } else {
                // Show hours and minutes when it's less than 24 hours
                if (hours > 0) {
                    result += `${hours} hour${hours > 1 ? "s" : ""} `;
                }
                if (minutes > 0) {
                    result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
                }
            }

            if (result.trim() === "") {
                return "_"; // Return '_' if no time was calculated
            }

            return result.trim(); // Remove any trailing spaces
        }

        return "_"; // Return '_' if no requests were completed
    };

    const resetFilters = async () => {
        setSearchQuery("");
        setSelectEndDate("");
        setSelectStartDate("");
        setDateStart("");
        setDateEnd("");
        setCurrentPage(1);
        setPerPageSize(25);
    };
    const handleBackClick = () => {
        navigate(-1);
    };

    document.title = "Agent Performance Report | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <DepartmentUserInfo />
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Agent Performance Report
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                        <div>
                                            <Button
                                                color="outline-secondary"
                                                className="waves-effect waves-light back-btn d-flex align-items-center"
                                                onClick={handleBackClick}
                                            >
                                                <IoChevronBack size={20} />
                                                <span className="ms-2">
                                                    Back
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xxl-12 mb-3">
                                    <div className="card border-0">
                                        <div className="card-body border-0">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xxl-0">
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

                                                <div className="col-xl-3 col-lg-3 col-xxl-2 col-md-4 col-sm-6 mb-3 mb-xxl-0">
                                                    <div className="dateinput mx-3 inner-border-0">
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

                                                <div className="col-xl-3 col-xxl-2 col-md-4 col-lg-3 col-sm-6 mb-3 mb-lg-0 mb-sm-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary bg-light border-light text-muted d-flex align-items-center"
                                                        onClick={resetFilters}
                                                    >
                                                        <RefreshCcw
                                                            className="text-muted me-2"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <span> Reset </span>
                                                    </button>
                                                </div>
                                                <div className="col-xl-6 d-flex align-items-center col-lg-5 col-md-6 col-sm-8  col-xxl-4 ms-auto justify-content-sm-end ">
                                                    <button
                                                        className={classnames(
                                                            "btn btn-light material-shadow-none cursor-pointer",
                                                            "fw-medium",
                                                            {
                                                                collapsed:
                                                                    !isDateRangePopupVisibleForExcel,
                                                            }
                                                        )}
                                                        type="button"
                                                        onClick={
                                                            handleExportButtonClickForExcel
                                                        }
                                                    >
                                                        Export to Excel
                                                    </button>

                                                    <Collapse
                                                        className={`dropdown-menu dropdown-menu-end shadow-none position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForExcel
                                                            ? "show"
                                                            : ""
                                                            }`}
                                                        style={{ top: "40px" }}
                                                    >
                                                        <div className="accordion-body">
                                                            <div className="input-group bg-white p-2">
                                                                <DataExportDateRangePopup
                                                                    dateStart={
                                                                        dateStartForExcel
                                                                    }
                                                                    dateEnd={
                                                                        dateEndForExcel
                                                                    }
                                                                    onChangeHandler={
                                                                        onChangeHandlerForExcel
                                                                    }
                                                                />
                                                                <div className="input-group-text bg-primary border-primary text-white">
                                                                    <i className="ri-calendar-2-line"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Collapse>

                                                    <button
                                                        className={classnames(
                                                            "btn btn-light material-shadow-none cursor-pointer ms-2",
                                                            "fw-medium",
                                                            {
                                                                collapsed:
                                                                    !isDateRangePopupVisibleForPDF,
                                                            }
                                                        )}
                                                        type="button"
                                                        onClick={
                                                            handleExportButtonClickForPDF
                                                        }
                                                    >
                                                        Export to PDF
                                                    </button>

                                                    <Collapse
                                                        className={`dropdown-menu dropdown-menu-end shadow-none position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForPDF
                                                            ? "show"
                                                            : ""
                                                            }`}
                                                        style={{ top: "40px" }}
                                                    >
                                                        <div className="accordion-body">
                                                            <div className="input-group bg-white rounded p-2">
                                                                <DataExportDateRangePopup
                                                                    dateStart={
                                                                        dateStartForPDF
                                                                    }
                                                                    dateEnd={
                                                                        dateEndForPDF
                                                                    }
                                                                    onChangeHandler={
                                                                        onChangeHandlerForPDF
                                                                    }
                                                                />
                                                                <div className="input-group-text bg-primary border-primary text-white">
                                                                    <i className="ri-calendar-2-line"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Collapse>
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
                                                    }}
                                                >
                                                    <table
                                                        className="table align-middle table-nowrap mb-0 com_table"
                                                        id="tasksTable"
                                                    >
                                                        <thead className="bg-white">
                                                            <tr className="text-capitalize">
                                                                <th className="cursor-pointer">
                                                                    Agent
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Email
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Service
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Department
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Request
                                                                    Assigned
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Request
                                                                    Completed
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Avg. Time
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        {loading ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="11"
                                                                    className="text-center"
                                                                >
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        ) : userPerformanceList &&
                                                          userPerformanceList?.length ===
                                                              0 ? (
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        colSpan="11"
                                                                        className="text-center"
                                                                    >
                                                                        <NotFound
                                                                            heading="No report found."
                                                                            message="Unfortunately, report not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        ) : (
                                                            userPerformanceList.map(
                                                                (
                                                                    data,
                                                                    index
                                                                ) => (
                                                                    <tbody
                                                                        className="list form-check-all"
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <tr>
                                                                            <td className="id">
                                                                                <strong>
                                                                                    {
                                                                                        data
                                                                                            ?.userInfo
                                                                                            ?.userName
                                                                                    }
                                                                                </strong>
                                                                            </td>
                                                                            <td className="due_date">
                                                                                {
                                                                                    data
                                                                                        ?.userInfo
                                                                                        ?.userEmail
                                                                                }
                                                                            </td>
                                                                            <td className="service-name">
                                                                                <span>
                                                                                    {
                                                                                        serviceName
                                                                                    }
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <span className="d-flex">
                                                                                    <span className="flex-grow-1 department-name">
                                                                                        {
                                                                                            departmentName
                                                                                        }
                                                                                    </span>
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    data?.RequestAssigned
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    data?.RequestCompleted
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <div className="d-flex align-items-center w-50">
                                                                                    {calculateAverageTimePerRequest(
                                                                                        data?.RequestCompleted,
                                                                                        data?.completedHours
                                                                                    )}
                                                                                </div>
                                                                            </td>
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

export default TicketPerformanceByUser;
