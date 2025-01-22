import React from "react";
import { useEffect, useState } from "react";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import DataExportDateRangePopup from "../../../common/Datepicker/DataExportDatePicker";
import { toast } from "react-toastify";
import classnames from "classnames";
import { Collapse } from "reactstrap";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const BlankData = process.env.REACT_APP_BLANK;
function calculatePercentage(totalCompletedTime, totalTATDays) {
    if (totalCompletedTime > 0 && totalTATDays > 0) {
        let percentage = (totalCompletedTime / totalTATDays) * 100;
        return parseFloat(percentage.toFixed(2));
    }
    return 0;
}
const DepartmentPerformance = () => {
    const navigate = useNavigate();
    const axiosInstance = useAxios();
    const [searchQuery, setSearchQuery] = useState("");
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departmentReportList, setDepartmentReportList] = useState([]);
    const [dateRangeOption, setSelectedDateRangeOption] = useState("");
    const [departmentList, setDepartmentList] = useState([]);
    const [exportLoader, setExportLoader] = useState({
        excel: false,
        pdf: false,
    });

    const [selectStartDateForExcel, setSelectStartDateForExcel] = useState("");
    const [selectEndDateForExcel, setSelectEndDateForExcel] = useState("");
    const [dateStartForExcel, setDateStartForExcel] = useState("");
    const [dateEndForExcel, setDateEndForExcel] = useState("");
    const [
        isDateRangePopupVisibleForExcel,
        setIsDateRangePopupVisibleForExcel,
    ] = useState(false);

    const [selectStartDateForPDF, setSelectStartDateForPDF] = useState("");
    const [selectEndDateForPDF, setSelectEndDateForPDF] = useState("");
    const [dateStartForPDF, setDateStartForPDF] = useState("");
    const [dateEndForPDF, setDateEndForPDF] = useState("");
    const [isDateRangePopupVisibleForPDF, setIsDateRangePopupVisibleForPDF] =
        useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [activeTicketAccordion, setActiveTicketAccordion] = useState(null);

    function formatDateString(inputDateString) {
        const dateObject = new Date(inputDateString);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    const handleAccordionClick = (e, index) => {
        e.stopPropagation();
        e.preventDefault();
        if (index === activeAccordion) {
            setActiveAccordion(null);
            return;
        }
        setActiveAccordion(index);
    };

    const handleAccordionTicketClick = (e, index) => {
        e.stopPropagation();
        e.preventDefault();
        if (index === activeTicketAccordion) {
            setActiveTicketAccordion(null);
            return;
        }
        setActiveTicketAccordion(index);
    };
    const listOfDepartments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("No results found for the given search query.");
        }
    };

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
        const fileName = `department_report_${timestamp}.xlsx`;

        try {
            const response = await axiosInstance.post(
                `departmentReport/deptperformance/exportToExcel`,
                {
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : selectedDepartment,
                    dateRange: {
                        startDate: selectStartDateForExcel,
                        endDate: selectEndDateForExcel,
                    },
                    fileName: fileName,
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
                        `departmentReport/deptperformance/removeExcel`,
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
        const fileName = `department_report_${timestamp}.pdf`;

        try {
            const response = await axiosInstance.post(
                `departmentReport/deptperformance/generateDeptPdf`,
                {
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : selectedDepartment,
                    dateRange: {
                        startDate: selectStartDateForPDF,
                        endDate: selectEndDateForPDF,
                    },
                    fileName: fileName,
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
                        `departmentReport/deptperformance/removeDeptPdf`,
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

    const getDepartmentReport = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `departmentReport/deptperformance/list`,
                {
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : selectedDepartment,
                    dateRangeOption: dateRangeOption,
                }
            );
            if (response?.data) {
                const { data } = response?.data;

                setDepartmentReportList(data);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong while add new banner");
        }
    };

    const listOfSearch = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `departmentReport/deptperformance/list`,
                {
                    departmentId: selectedDepartment,
                    dateRangeOption: dateRangeOption,
                    searchQuery: searchQuery,
                }
            );

            if (response?.data) {
                const { data } = response?.data;
                setDepartmentReportList(data);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };
    useEffect(() => {
        listOfDepartments();
    }, []);
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                listOfSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [searchQuery, dateRangeOption, selectedDepartment]);

    useEffect(() => {
        if (!searchQuery) {
            getDepartmentReport();
        }
    }, [searchQuery, dateRangeOption, selectedDepartment]);

    const handleDepartmentSearch = (e) => {
        const selectedDepartmentName = e;
        // const selectedDepartmentName = e.target.value;
        if (selectedDepartmentName) {
            setSelectedDepartment(selectedDepartmentName);
        }
    };
    const handleInputSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    const handleChange = (event) => {
        setSelectedDateRangeOption(event);
        // setSelectedDateRangeOption(event.target.value);
    };
    const resetFilters = async () => {
        setSelectedDateRangeOption("");
        setSelectedDepartment("");
        setSearchQuery("");
    };
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
    const departmentOptions =
        departmentList &&
        departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }));

        const dateRangeOptions = [
            { label: "All", value: "All" },
            { label: "One Week", value: "1w" },
            { label: "One Month", value: "1m" },
            { label: "Three Months", value: "3m" },
            { label: "Six Months", value: "6m" },
            { label: "One Year", value: "1y" },
        ];

    document.title = "Department Report | eGov Solution";
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Department Performance
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-xxl-12 ">
                                    <div className="card border-0">
                                        <div className="card-body border-0">
                                            <div className="row">
                                                <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
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
                                                <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
                                                    <div className=" input-light">
                                                        <Select
                                                            className=" bg-choice basic-single"
                                                            classNamePrefix="select"
                                                            value={
                                                                dateRangeOptions.find(
                                                                    (option) =>
                                                                        option.value ===
                                                                        dateRangeOption
                                                                ) || null
                                                            }
                                                            onChange={(
                                                                selectedOption
                                                            ) =>
                                                                handleChange(
                                                                    selectedOption
                                                                        ? selectedOption.value
                                                                        : ""
                                                                )
                                                            }
                                                            options={
                                                                dateRangeOptions
                                                            }
                                                            aria-label="Select Duration"
                                                            placeholder="Select Duration"
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
                                                        <div className="col-xl-3 col-lg-4 col-md-4 col-sm-12 col-xxl-2 mb-3 mb-xl-0">
                                                            <div className="input-light">
                                                                <Select
                                                                    className="bg-choice basic-single"
                                                                    classNamePrefix="select"
                                                                    value={
                                                                        departmentOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                selectedDepartment
                                                                        ) || null
                                                                    }
                                                                    onChange={(
                                                                        selectedOption
                                                                    ) =>
                                                                        handleDepartmentSearch(
                                                                            selectedOption
                                                                                ? selectedOption.value
                                                                                : ""
                                                                        )
                                                                    }
                                                                    options={
                                                                        departmentOptions
                                                                    }
                                                                    aria-label="Select Department"
                                                                    placeholder="Select Department"
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
                                                    )}
                                                <div className="col-xl-1 col-lg-4 col-md-4 col-sm-4 col-xxl-2   mb-3 mb-sm-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                        onClick={resetFilters}
                                                    >
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
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
                                                        className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForExcel
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
                                                        className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForPDF
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
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Request Details
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <Row className=" d-md-flex d-none">
                                <Col className="col-md-3 col-12">
                                    <strong> Department Name </strong>
                                </Col>
                                <Col className="col-md-3 col-12">
                                    <strong> Request Assigned </strong>
                                </Col>
                                <Col className="col-md-3 col-12">
                                    <strong> Request Completed </strong>
                                </Col>
                                <Col className="col-md-3 col-12">
                                    <strong> Avg. Time </strong>
                                </Col>
                            </Row>

                            <div className="row justify-content-evenly">
                                <div className="col-lg-12 mt-3">
                                    <div
                                        className="accordion accordion-border-box"
                                        id="genques-accordion"
                                    >
                                        {loading ? (
                                            <LoaderSpin />
                                        ) : departmentReportList &&
                                            departmentReportList?.application?.length ===
                                            0 &&
                                            !loading ? (
                                            <NotFound
                                                heading="Citizen not found."
                                                message="Unfortunately, citizen not available at the moment."
                                            />
                                        ) : (
                                            departmentReportList &&
                                            departmentReportList?.application?.map(
                                                (application, index) => (
                                                    <div
                                                        className="accordion-item"
                                                        key={index}
                                                    >
                                                        <div
                                                            className="accordion-header"
                                                            id={`km-heading${index}`}
                                                        >
                                                            <div
                                                                className={`accordion-button d-block ${activeAccordion ===
                                                                    index
                                                                    ? ""
                                                                    : "collapsed"
                                                                    }`}
                                                                type="button"
                                                                onClick={(
                                                                    e
                                                                ) =>
                                                                    handleAccordionClick(
                                                                        e,
                                                                        index,
                                                                        application?.id
                                                                    )
                                                                }
                                                                aria-expanded={
                                                                    activeAccordion ===
                                                                        index
                                                                        ? "true"
                                                                        : "false"
                                                                }
                                                                aria-controls={`km-collapse${index}`}
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#km-collapse${index}`}
                                                                data-bs-parent="#km-accordion"
                                                            >
                                                                <Row className=" align-items-center">
                                                                    <Col className="col-lg-3 col-md-3 col-sm-6 col-xs-6 mb-2 mb-lg-0 col-12">

                                                                        <div className="d-md-none d-block text-muted">Department Name</div>
                                                                        {application.departmentName}

                                                                    </Col>
                                                                    <Col className="col-lg-3 col-md-3  col-sm-6 col-xs-6 mb-2 mb-lg-0 col-12 ">

                                                                        <div className="d-md-none d-block text-muted">Request Assigned</div>
                                                                        {application.RequestAssigned}

                                                                    </Col>

                                                                    <Col className="col-lg-3  col-md-3  col-sm-6 col-xs-6 mb-2 mb-lg-0 col-12">

                                                                        <div className="d-md-none d-block text-muted">Request Completed</div>
                                                                        {application.RequestCompleted}

                                                                    </Col>
                                                                    <Col className="col-lg-3  col-md-3  col-sm-6 col-xs-6 mb-2 mb-lg-0 col-12">
                                                                      {calculateAverageTimePerRequest(application?.RequestCompleted,application?.completedDays)}
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        </div>

                                                        <div
                                                            id={`km-collapse${index}`}
                                                            className={`accordion-collapse collapse ${activeAccordion ===
                                                                index
                                                                ? "show"
                                                                : ""
                                                                }`}
                                                            aria-labelledby={`km-heading${index}`}
                                                            data-bs-parent="#km-accordion"
                                                        >
                                                            <div className="accordion-body">
                                                                <div className="table-responsive">
                                                                    {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                                        <table className="table table-striped text-dark table-borderless mb-0">
                                                                            <thead className="sticky-top table-light">
                                                                                <tr className="text-capitalize">
                                                                                    <th className="">
                                                                                        Service
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Request
                                                                                        assigned
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Request
                                                                                        Completed
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Avg.
                                                                                        Time
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="list form-check-all">
                                                                                {application?.services &&
                                                                                    application?.services.map(
                                                                                        (
                                                                                            servicesrevenue,
                                                                                            ind
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    ind
                                                                                                }
                                                                                            >
                                                                                                <td
                                                                                                    className="text-black fw-semibold"
                                                                                                    role="button"
                                                                                                    onClick={() => {
                                                                                                        navigate(
                                                                                                            "/user-performance",
                                                                                                            {
                                                                                                                state: {
                                                                                                                    serviceName:
                                                                                                                        servicesrevenue?.serviceName,
                                                                                                                    serviceSlug:
                                                                                                                        servicesrevenue?.serviceSlug,
                                                                                                                    departmentName:
                                                                                                                        application?.departmentName,
                                                                                                                },
                                                                                                            }
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        servicesrevenue.serviceName
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                    {
                                                                                                        servicesrevenue.RequestAssigned
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                    {
                                                                                                        servicesrevenue.RequestCompleted
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                    {calculateAverageTimePerRequest(servicesrevenue?.RequestCompleted,servicesrevenue?.completedDays)}

                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                            </tbody>
                                                                        </table>
                                                                    {/* </SimpleBar> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mt-4 mt-md-5">
                                <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                    <h4 className="mb-sm-0">
                                        Ticket Details
                                    </h4>
                                </div>
                            </div>
                            <Row className=" d-md-flex  d-none">
                                <Col className=" col-md-3">
                                    <strong> Department Name </strong>
                                </Col>
                                <Col className="col-md-3">
                                    <strong> Ticket assigned </strong>
                                </Col>
                                <Col className="col-md-3">
                                    <strong> closed </strong>
                                </Col>
                                <Col className="col-md-3">
                                    <strong> Avg. Time </strong>
                                </Col>
            
                            </Row>

                            <div className="row justify-content-evenly">
                                <div className="col-lg-12 mt-3">
                                    <div
                                        className="accordion accordion-border-box"
                                        id="genques-accordion"
                                    >
                                        {loading ? (
                                            <LoaderSpin />
                                        ) : departmentReportList &&
                                            departmentReportList?.ticket?.length ===
                                            0 &&
                                            !loading ? (
                                            <NotFound
                                                heading="Citizen not found."
                                                message="Unfortunately, citizen not available at the moment."
                                            />
                                        ) : (
                                            departmentReportList &&
                                            departmentReportList?.ticket?.map(
                                                (ticket, index) => (
                                                    <div
                                                        className="accordion-item"
                                                        key={index}
                                                    >
                                                        <div
                                                            className="accordion-header"
                                                            id={`km-heading${index}`}
                                                        >
                                                            <div
                                                                className={`accordion-button d-block ${activeTicketAccordion ===
                                                                    index
                                                                    ? ""
                                                                    : "collapsed"
                                                                    }`}
                                                                type="button"
                                                                onClick={(
                                                                    e
                                                                ) =>
                                                                    handleAccordionTicketClick(
                                                                        e,
                                                                        index,
                                                                        ticket?.id
                                                                    )
                                                                }
                                                                aria-expanded={
                                                                    activeTicketAccordion ===
                                                                        index
                                                                        ? "true"
                                                                        : "false"
                                                                }
                                                                aria-controls={`km-collapse${index}`}
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#km-collapse${index}`}
                                                                data-bs-parent="#km-accordion"
                                                            >
                                                                <Row className="d-md-flex  align-items-center">
                                                                    <Col className="col-md-3 col-sm-12 col-xs-12 col-12 mb-md-0 mb-2">
                                                                        
                                                                            <div className="d-md-none d-block text-muted">Department Name</div>
                                                                            {ticket.departmentName}
                                                                        
                                                                    </Col>
                                                                    <Col className="col-md-3 col-sm-6 col-xs-6 col-12 mb-md-0 mb-2 ">
                                                                        <div className="d-md-none d-block text-muted">Ticket assigned</div>
                                                                        {ticket.RequestAssigned}

                                                                    </Col>
                                                                    <Col className="col-md-3 col-sm-6 col-xs-6 col-12 mb-md-0 mb-2 ">
                                                                        <div className="d-md-none d-block text-muted">Closed</div>
                                                                        {ticket.RequestCompleted}

                                                                    </Col>
                                                                    <Col className="col-md-3 col-sm-6 col-xs-6 col-12 mb-md-0 mb-2">
                                                                    {calculateAverageTimePerRequest(ticket?.RequestCompleted,ticket?.completedDays)}

                                                                    </Col>
                                                                   
                                                                </Row>
                                                            </div>
                                                        </div>

                                                        <div
                                                            id={`km-collapse${index}`}
                                                            className={`accordion-collapse collapse ${activeTicketAccordion ===
                                                                index
                                                                ? "show"
                                                                : ""
                                                                }`}
                                                            aria-labelledby={`km-heading${index}`}
                                                            data-bs-parent="#km-accordion"
                                                        >
                                                            <div className="accordion-body">
                                                                <div className="table-responsive">
                                                                    {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                                        <table className="table table-striped text-dark table-borderless mb-0">
                                                                            <thead className="sticky-top table-light">
                                                                                <tr className="text-capitalize">
                                                                                    <th className="">
                                                                                        Service
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Tickets
                                                                                        assigned
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Closed
                                                                                    </th>
                                                                                    <th className="">
                                                                                        Avg.
                                                                                        Time
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="list form-check-all">
                                                                                {ticket?.services &&
                                                                                    ticket?.services.map(
                                                                                        (
                                                                                            servicesrevenue,
                                                                                            ind
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    ind
                                                                                                }
                                                                                            >
                                                                                                <td
                                                                                                    className="text-black fw-semibold"
                                                                                                    role="button"
                                                                                                    onClick={() => {
                                                                                                        navigate(
                                                                                                            "/user-ticket-performance",
                                                                                                            {
                                                                                                                state: {
                                                                                                                    serviceName:
                                                                                                                        servicesrevenue?.serviceName,
                                                                                                                    serviceSlug:
                                                                                                                        servicesrevenue?.serviceSlug,
                                                                                                                    departmentName:
                                                                                                                        ticket?.departmentName,
                                                                                                                },
                                                                                                            }
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        servicesrevenue.serviceName
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                    {
                                                                                                        servicesrevenue.RequestAssigned
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                    {
                                                                                                        servicesrevenue.RequestCompleted
                                                                                                    }
                                                                                                </td>
                                                                                                <td>
                                                                                                {calculateAverageTimePerRequest(servicesrevenue?.RequestCompleted,servicesrevenue?.completedDays)}

                                                                                                </td>
                                                                                              
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                            </tbody>
                                                                        </table>
                                                                    {/* </SimpleBar> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        )}
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
export default DepartmentPerformance;
