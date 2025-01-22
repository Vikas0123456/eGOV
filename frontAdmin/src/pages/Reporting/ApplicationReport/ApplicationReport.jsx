import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import Pagination from "../../../CustomComponents/Pagination";
import { format } from "date-fns";
import { Badge, Button } from "react-bootstrap";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import { RefreshCcw } from 'feather-icons-react';
import Select from "react-select";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { toast } from "react-toastify";
import DataExportDateRangePopup from "../../../common/Datepicker/DataExportDatePicker";
import SimpleBar from "simplebar-react";
import classnames from "classnames";
import { Collapse } from 'reactstrap';
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
import { IoChevronBack } from "react-icons/io5";

function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const ApplicationReport = () => {
    const axiosInstance = useAxios();
    const location = useLocation();
    const navigate = useNavigate();
    const { serviceName, serviceSlug, departmentName } = location.state || {};
    const [selectStartDate, setSelectStartDate] = useState("");
    const [selectEndDate, setSelectEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    // table data filter search sort
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const [serviceTransactionDetails, setServiceTransactiondetails] = useState(
        []
    );

    const [selectStartDateForExcel, setSelectStartDateForExcel] = useState("");
    const [selectEndDateForExcel, setSelectEndDateForExcel] = useState("");
    const [dateStartForExcel, setDateStartForExcel] = useState("");
    const [dateEndForExcel, setDateEndForExcel] = useState("");
    
    const [selectStartDateForPDF, setSelectStartDateForPDF] = useState("");
    const [selectEndDateForPDF, setSelectEndDateForPDF] = useState("");
    const [dateStartForPDF, setDateStartForPDF] = useState("");
    const [dateEndForPDF, setDateEndForPDF] = useState("");
    const [exportLoader, setExportLoader] = useState({
        excel: false,
        pdf: false,
    });
    const [isDateRangePopupVisibleForExcel, setIsDateRangePopupVisibleForExcel] = useState(false);
    const [isDateRangePopupVisibleForPDF, setIsDateRangePopupVisibleForPDF] = useState(false);


    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(25);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const UserPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "directory"
        );
    const viewPermissions = UserPermissions
        ? hasViewPermission(UserPermissions)
        : false;

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
    };

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
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
        // setSearchQuery("");
        setDateStart(value[0]);
        setDateEnd(value[1]);
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
        const fileName = `transaction_report_${timestamp}.xlsx`;

        try {
            const response = await axiosInstance.post(
                `paymentService/customerDetails/application/transactions/exportToExcel`,
                {
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDateForExcel,
                        endDate: selectEndDateForExcel,
                    },
                    searchQuery: searchQuery,
                    page: currentPage,
                    perPage: 10000000,
                    status: status,
                    fileName: fileName
                },
            );

            if (response.data.data.result.message === 'No data found to export.') {
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

                    const result = await axiosInstance.post(
                        `paymentService/customerDetails/application/transactions/removeExcel`,
                        {
                            fileName: fileName,
                        }
                    );

                    setSelectStartDateForExcel("");
                    setSelectEndDateForExcel("");
                    setDateStartForExcel("");
                    setDateEndForExcel("");

                    if (result.data) {
                        // console.log("sddssd", result.data);
                    }

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
        const fileName = `transaction_report_${timestamp}.pdf`;

        try {
            const response = await axiosInstance.post(
                `paymentService/customerDetails/application/transactions/exportToPDF`,
                {
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDateForPDF,
                        endDate: selectEndDateForPDF,
                    },
                    searchQuery: searchQuery,
                    page: currentPage,
                    perPage: 10000000,
                    status: status,
                    fileName: fileName
                },
            );

            if (response.data.data.result.message === 'No data found to export.') {
                toast.info("No data found to export.");
                setExportLoader({ excel: false, pdf: false });
                return;
            }

            fetch(`${response?.data?.data?.result}`)
                .then((response) => response.blob())
                .then((blob) => {
                    const fileURL = window.URL.createObjectURL(new Blob([blob]));
                    const a = document.createElement("a");
                    a.href = fileURL;
                    a.download = `${fileName}`;
                    a.click();
                    window.URL.revokeObjectURL(fileURL);

                    const result = axiosInstance.post(
                        `paymentService/customerDetails/application/transactions/removePDF`,
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

    const handleStatusChange = (value) => {
        if (value) {
            setCurrentPage(1);
            setStatus(value);
        }else{
            setStatus("")
        }
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
    
    const getServiceTransactionDetails = async (customerId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport/transactions`,
                {
                    serviceSlug: serviceSlug,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    page: currentPage,
                    perPage: perPageSize,
                    status: status,
                }
            );
            if (response) {
                const { rows, count } = response?.data?.data;
                setServiceTransactiondetails(rows);
                setTotalCount(count);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    const listOfSearch = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport/transactions`,
                {
                    serviceSlug: serviceSlug,
                    searchQuery: searchQuery,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    page: currentPage,
                    perPage: perPageSize,
                    status: status,
                }
            );

            if (response?.data) {
                const { rows, count } = response.data.data;
                setServiceTransactiondetails(rows);
                setTotalCount(count);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
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
    }, [searchQuery, currentPage, perPageSize, selectEndDate, status]);

    useEffect(() => {
        if (!searchQuery) {
            getServiceTransactionDetails();
        }
    }, [searchQuery, currentPage, perPageSize, selectEndDate, status]);

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(25);
        setSearchQuery("");
        setSelectStartDate("");
        setSelectEndDate("");
        setDateStart("");
        setDateEnd("");
        setStatus("");
    };

    const statusOptions = [
        { value: "", label: "Select Status*" },
        { value: "0", label: "Incomplete" },
        { value: "1", label: "Pending" },
        { value: "2", label: "Inprogress" },
        { value: "3", label: "Check & Verified" },
        { value: "4", label: "Auto Pay" },
        { value: "5", label: "Approve" },
        { value: "6", label: "Reject" },
        { value: "7", label: "Shipped" },
    ];
      
    const handleBackClick = () => {
        navigate(-1);
    };

    document.title = "Application Report | eGov Solution"
     
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
                                            Transaction Report
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

                                                <div className="col-xl-3 col-xxl-2 col-lg-3 col-md-4 col-sm-6  mb-3 mb-lg-0">
                                                    <div className="input-light ">
                                                        <Select
                                                            className="cursor-pointer bg-choice"
                                                            name="choices-single-default"
                                                            id="idStatus"
                                                            value={
                                                                status ? statusOptions.find(
                                                                    (option) =>
                                                                        option.value ===
                                                                        status
                                                                ) : null
                                                            }
                                                            onChange={(
                                                                option
                                                            ) =>
                                                                handleStatusChange(
                                                                    option.value
                                                                )
                                                            }
                                                            placeholder="Select Status*"
                                                            options={
                                                                statusOptions
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
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-xl-3 col-xxl-2 col-md-4 col-lg-3 col-sm-6 mb-3 mb-lg-0 mb-sm-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary bg-light border-light text-muted d-flex align-items-center"
                                                        onClick={resetFilters}>
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
                                                        }>
                                                        Export to Excel
                                                    </button>

                                                    <Collapse
                                                        className={`dropdown-menu dropdown-menu-end shadow-none position-absolute rounded shadow-sm z-1 ${
                                                            isDateRangePopupVisibleForExcel
                                                                ? "show"
                                                                : ""
                                                        }`}
                                                        style={{ top: "40px" }}>
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
                                                        }>
                                                        Export to PDF
                                                    </button>

                                                    <Collapse
                                                        className={`dropdown-menu dropdown-menu-end shadow-none position-absolute rounded shadow-sm z-1 ${
                                                            isDateRangePopupVisibleForPDF
                                                                ? "show"
                                                                : ""
                                                        }`}
                                                        style={{ top: "40px" }}>
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
                                                    }}>
                                                    <table
                                                        className="table align-middle table-nowrap mb-0 com_table"
                                                        id="tasksTable">
                                                        <thead className="bg-white">
                                                            <tr className="text-capitalize">
                                                                <th className="cursor-pointer">
                                                                    NIB /
                                                                    Citizen
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Date
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Service
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Department
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Transaction
                                                                    Status
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Application
                                                                    Current
                                                                    Status
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Transaction
                                                                    No.
                                                                </th>
                                                                <th className="cursor-pointer">
                                                                    Amount
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        {loading ? (
                                                            <thead>
                                                            <tr>
                                                                <td
                                                                    colSpan="11"
                                                                    className="text-center">
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                            </thead>
                                                        ) : serviceTransactionDetails &&
                                                          serviceTransactionDetails?.length ===
                                                              0 ? (
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        colSpan="11"
                                                                        className="text-center">
                                                                        <NotFound
                                                                            heading="Transaction not found."
                                                                            message="Unfortunately, transaction not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        ) : (
                                                            serviceTransactionDetails.map(
                                                                (
                                                                    data,
                                                                    index
                                                                ) => (
                                                                    <tbody
                                                                        className="list form-check-all"
                                                                        key={
                                                                            index
                                                                        }>
                                                                        <tr>
                                                                            <td className="id">
                                                                                <small className="text-secondary">
                                                                                    {
                                                                                        data
                                                                                            ?.customer
                                                                                            ?.nibNumber
                                                                                    }
                                                                                </small>
                                                                                <br />
                                                                                <strong>
                                                                                    {
                                                                                        data
                                                                                            ?.customer
                                                                                            ?.firstName
                                                                                    }{" "}
                                                                                    {
                                                                                        data
                                                                                            ?.customer
                                                                                            ?.middleName
                                                                                    }{" "}
                                                                                    {
                                                                                        data
                                                                                            ?.customer
                                                                                            ?.lastName
                                                                                    }
                                                                                </strong>
                                                                            </td>
                                                                            <td className="due_date">
                                                                                {" "}
                                                                                {data.createdDate
                                                                                    ? format(
                                                                                          new Date(
                                                                                              data.createdDate
                                                                                          ),
                                                                                          "dd MMM, yyyy - h:mm a"
                                                                                      )
                                                                                    : "-"}
                                                                            </td>
                                                                            <td className="service-name">
                                                                                <span>
                                                                                    {" "}
                                                                                    {
                                                                                        serviceName
                                                                                    }{" "}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <span className="d-flex">
                                                                                    <span className="flex-grow-1 department-name">
                                                                                        {" "}
                                                                                        {
                                                                                            departmentName
                                                                                        }{" "}
                                                                                    </span>
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                {" "}
                                                                                {data?.transactionStatus ===
                                                                                    "0" && (
                                                                                    <Badge bg="warning">
                                                                                        {" "}
                                                                                        Pending{" "}
                                                                                    </Badge>
                                                                                )}
                                                                                {data?.transactionStatus ===
                                                                                    "1" && (
                                                                                    <Badge bg="success">
                                                                                        {" "}
                                                                                        Success{" "}
                                                                                    </Badge>
                                                                                )}
                                                                                {data?.transactionStatus ===
                                                                                    "2" && (
                                                                                    <Badge bg="danger">
                                                                                        {" "}
                                                                                        Failed{" "}
                                                                                    </Badge>
                                                                                )}
                                                                                {data?.transactionStatus ===
                                                                                    "3" && (
                                                                                    <Badge bg="info">
                                                                                        {" "}
                                                                                        Refund{" "}
                                                                                    </Badge>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {data?.status ===
                                                                                    "0" && (
                                                                                    <Badge bg="info">
                                                                                        {" "}
                                                                                        Incomplete{" "}
                                                                                    </Badge>
                                                                                )}
                                                                                {data?.status ===
                                                                                    "1" && (
                                                                                    <Badge bg="warning">
                                                                                        {" "}
                                                                                        Pending{" "}
                                                                                    </Badge>
                                                                                )}{" "}
                                                                                {data?.status ===
                                                                                    "2" && (
                                                                                    <Badge bg="warning">
                                                                                        {" "}
                                                                                        Inprogress{" "}
                                                                                    </Badge>
                                                                                )}{" "}
                                                                                {data?.status ===
                                                                                    "3" && (
                                                                                    <Badge bg="info">
                                                                                        {" "}
                                                                                        Checked
                                                                                        &
                                                                                        Verified{" "}
                                                                                    </Badge>
                                                                                )}{" "}
                                                                                {data?.status ===
                                                                                    "4" && (
                                                                                    <Badge bg="success">
                                                                                        {" "}
                                                                                        Autopay
                                                                                    </Badge>
                                                                                )}{" "}
                                                                                {data?.status ===
                                                                                    "5" && (
                                                                                    <Badge bg="success">
                                                                                        {" "}
                                                                                        Approved{" "}
                                                                                    </Badge>
                                                                                )}{" "}
                                                                                {data?.status ===
                                                                                    "6" && (
                                                                                    <Badge bg="info">
                                                                                        {" "}
                                                                                        Rejected{" "}
                                                                                    </Badge>
                                                                                )}
                                                                                {data?.status ===
                                                                                    "7" && (
                                                                                    <Badge bg="info">
                                                                                        {" "}
                                                                                        Shipped{" "}
                                                                                    </Badge>
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    data.transactionId
                                                                                }
                                                                            </td>
                                                                            <td className="tr-status">
                                                                                ${" "}
                                                                                {
                                                                                    data.transactionAmount
                                                                                }{" "}
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

export default ApplicationReport;