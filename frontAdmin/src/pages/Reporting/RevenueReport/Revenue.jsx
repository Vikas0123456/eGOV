import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../../CustomComponents/Pagination";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Loader,{LoaderSpin} from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from 'feather-icons-react';
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import DataExportDateRangePopup from "../../../common/Datepicker/DataExportDatePicker";
import { toast } from "react-toastify";
import classnames from "classnames";
import { Collapse } from 'reactstrap';
import Accordion from 'react-bootstrap/Accordion';
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
const Revenue = () => {
    const axiosInstance = useAxios()

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [departmentRevenueList, setDepartmentRevenueList] = useState([]);
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
    const [isDateRangePopupVisibleForExcel, setIsDateRangePopupVisibleForExcel] = useState(false);

    const [selectStartDateForPDF, setSelectStartDateForPDF] = useState("");
    const [selectEndDateForPDF, setSelectEndDateForPDF] = useState("");
    const [dateStartForPDF, setDateStartForPDF] = useState("");
    const [dateEndForPDF, setDateEndForPDF] = useState("");
    const [isDateRangePopupVisibleForPDF, setIsDateRangePopupVisibleForPDF] = useState(false);

    function formatDateString(inputDateString) {
        const dateObject = new Date(inputDateString);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const handleChange = (event) => {
        // setSelectedDateRangeOption(event.target.value);
        setSelectedDateRangeOption(event);
    };

    const handleAccordionClick = (e, index) => {
        e.stopPropagation();
        e.preventDefault();
        if (index === activeAccordion) {
            setActiveAccordion(null);
            return;
        }
        setActiveAccordion(index);
    };
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
    const getDepartmentRevenueList = async (customerId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport`,
                {
                    departmentId: userData?.isCoreTeam === "0" ? (userData?.departmentId || "").split(',').map(id => id.trim()) : selectedDepartment,
                    dateRangeOption: dateRangeOption,
                }
            );
            if (response) {
                const { data } = response?.data;
                setDepartmentRevenueList(data);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    const excelReportExport = async () => {
        setExportLoader({ excel: true, pdf: false });
        const timestamp = new Date().getTime();
        const fileName = `department_report_${timestamp}.xlsx`;

        try {
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport/exportToExcel`,
                {
                    departmentId: userData?.isCoreTeam === "0" ? (userData?.departmentId || "").split(',').map(id => id.trim()) : selectedDepartment,
                    dateRange: {
                        startDate: selectStartDateForExcel,
                        endDate: selectEndDateForExcel,
                    },
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

                    await axiosInstance.post(
                        `paymentService/customerDetails/revenueReport/removeExcel`,
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

    const pdfReportExport = async () => {
        setExportLoader({ excel: false, pdf: true });
        const timestamp = new Date().getTime();
        const fileName = `department_report_${timestamp}.pdf`;

        try {
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport/generatePdf`,
                {
                    departmentId: userData?.isCoreTeam === "0" ? (userData?.departmentId || "").split(',').map(id => id.trim()) : selectedDepartment,
                    dateRange: {
                        startDate: selectStartDateForPDF,
                        endDate: selectEndDateForPDF,
                    },
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
                        `paymentService/customerDetails/revenueReport/removePDF`,
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

    const listOfSearch = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/revenueReport`,
                {
                    departmentId: selectedDepartment,
                    dateRangeOption: dateRangeOption,
                    searchQuery: searchQuery,
                }
            );

            if (response?.data) {
                const { data } = response?.data;
                setDepartmentRevenueList(data);
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
            getDepartmentRevenueList();
        }
    }, [searchQuery, dateRangeOption, selectedDepartment]);

    const handleDepartmentSearch = (e) => {
        if (e) {
            setSelectedDepartment(e);
        }else{
            setSelectedDepartment("")
        }
    };
    const handleInputSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    const resetFilters = async () => {
        setSelectedDateRangeOption("");
        setSelectedDepartment("");
        setSearchQuery("");
    };

    const departmentOptions = departmentList.length > 0 && 
        [{ value: "", label: "Select Department*" }, 
            ...departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }))]

    const dateRangeOptions = [
        { label: "All", value: "All" },
        { label: "One Week", value: "1w" },
        { label: "One Month", value: "1m" },
        { label: "Three Months", value: "3m" },
        { label: "Six Months", value: "6m" },
        { label: "One Year", value: "1y" },
    ];

    document.title = "Revenue Report | eGov Solution"
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
                                            <h4 className="mb-sm-0">Revenue</h4>
                                            <div className="page-title-right">
                                                <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">

                                    <div className="col-xxl-12 mb-3">
                                        <div className="card border-0">
                                            <div className="card-body border-0">
                                                <div className="row">
                                                    <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
                                                        <div className="search-box">
                                                            <input type="text" className="form-control search bg-light border-light" placeholder="Search" value={searchQuery} onChange={(e) => handleInputSearch(e)} />
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
                                                        <div className=" input-light">
                                                            <Select

                                                                className="basic-single bg-choice"
                                                                classNamePrefix="select"
                                                                value={ dateRangeOption ?
                                                                    dateRangeOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            dateRangeOption
                                                                    ) :
                                                                    null
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
                                                                // isClearable
                                                                aria-label="Select Duration"
                                                                placeholder="Select Duration*"
                                                                styles={{
                                                                    control: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {userData?.isCoreTeam === "1" &&
                                                        <div className="col-xl-3 col-lg-4 col-md-4 col-sm-12 col-xxl-2 mb-3 mb-xl-0">
                                                            <div className=" input-light">
                                                                <Select
                                                                    className="basic-single bg-choice"
                                                                    classNamePrefix="select"
                                                                    value={selectedDepartment ? departmentOptions.find((option) => option.value === selectedDepartment) : null}
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
                                                    }
                                                    <div className="col-xl-1 col-lg-4 col-md-4 col-sm-4 col-xxl-2 col-12 mb-3 mb-sm-0">
                                                        <button type="button" className="btn btn-primary btn-label bg-warning border-warning  d-flex align-items-center" onClick={resetFilters}>
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                        </button>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-4 col-md-8 col-sm-8 col-xxl-3 ms-auto text-sm-end col-12">
                                                        <button
                                                            className={classnames("btn btn-light material-shadow-none cursor-pointer", "fw-medium", { collapsed: !isDateRangePopupVisibleForExcel })} type="button" onClick={handleExportButtonClickForExcel} >
                                                            Export to Excel
                                                        </button>

                                                        <Collapse
                                                            className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForExcel ? 'show' : ''
                                                                }`}
                                                            style={{ top: '40px' }}
                                                        >
                                                            <div className="accordion-body">
                                                                <div className="input-group bg-white p-2">
                                                                    <DataExportDateRangePopup
                                                                        dateStart={dateStartForExcel}
                                                                        dateEnd={dateEndForExcel}
                                                                        onChangeHandler={onChangeHandlerForExcel}
                                                                    />
                                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                                        <i className="ri-calendar-2-line"></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Collapse>


                                                        <button className={classnames("btn btn-light material-shadow-none cursor-pointer ms-2", "fw-medium", { collapsed: !isDateRangePopupVisibleForPDF })} type="button" onClick={handleExportButtonClickForPDF} >
                                                            Export to PDF
                                                        </button>

                                                        <Collapse className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${isDateRangePopupVisibleForPDF ? 'show' : ''
                                                            }`}
                                                            style={{ top: '40px' }}
                                                        >
                                                            <div className="accordion-body">
                                                                <div className="input-group bg-white rounded p-2">
                                                                    <DataExportDateRangePopup
                                                                        dateStart={dateStartForPDF}
                                                                        dateEnd={dateEndForPDF}
                                                                        onChangeHandler={onChangeHandlerForPDF}
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
                                        {/* <div className="row">
                                            <div className="col-6">
                                                <strong>Department</strong>
                                            </div>
                                            <div className="col">
                                                <strong>
                                                    Total Revenue
                                                </strong>
                                            </div>
                                        </div> */}
                                        <div className="row justify-content-evenly">
                                            <div className="col-lg-12 mt-3">
                                                <div className="accordion accordion-border-box" id="genques-accordion">
                        
                                                    {loading ? ( 
                                                            <div className="accordion-item">
                                                            <span className="text-center my-3"> <LoaderSpin /> </span>
                                                        </div>
                                                    ) : departmentRevenueList.length === 0 ? (
                                                        <div className="accordion-item">
                                                        <NotFound heading="Revenue not found." message="Unfortunately, revenue not available at the moment." />
                                                    </div>
                                                    ) :(
                                                        departmentRevenueList?.map((revenue, index) => (
                                                            <div className="accordion-item" key={index}>
                                                                <div className="accordion-header" id={`km-heading${index}`}>
                                                                    <div className={`accordion-button d-block ${activeAccordion === index ? "" : "collapsed"}`} type="button"
                                                                        onClick={(e) => handleAccordionClick(e, index, revenue?.id)}
                                                                        aria-expanded={activeAccordion === index ? "true" : "false"}
                                                                        aria-controls={`km-collapse${index}`}
                                                                        data-bs-toggle="collapse"
                                                                        data-bs-target={`#km-collapse${index}`}
                                                                        data-bs-parent="#km-accordion">
                                                                        <div className="row align-items-center">
                                                                            <div className="col-6">
                                                                                <strong> {revenue.departmentName} </strong>
                                                                            </div>
                                                                        </div>
    
                                                                    </div>
                                                                </div>
                                                                {loading ? (
                                                                    <LoaderSpin/>
                                                                ):(
                                                                    <div id={`km-collapse${index}`} className={`accordion-collapse collapse ${activeAccordion === index ? "show" : ""}`}
                                                                    aria-labelledby={`km-heading${index}`}
                                                                    data-bs-parent="#km-accordion">
                                                                    <div className="accordion-body">
                                                                        <div className="table-responsive">
                                                                            {/* <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}> */}
                                                                                <table className="table table-bordered align-middle table-nowrap mb-0" id="tasksTable">
                                                                                    <thead className="sticky-top table-light">
                                                                                        <tr className="text-capitalize">
                                                                                            <th className="" >
                                                                                                Services
                                                                                            </th>
                                                                                            <th className="" >
                                                                                                Total Revenue
                                                                                            </th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="list form-check-all">
                                                                                        {revenue?.serviceList && revenue?.serviceList.map((servicesrevenue, ind) => (
                                                                                            <tr key={ind}>
                                                                                                <td className="text-black fw-semibold" role="button" onClick={() => navigate("/application-report", {
                                                                                                    state: {
                                                                                                        departmentName:
                                                                                                            revenue?.departmentName,
                                                                                                        serviceName:
                                                                                                            servicesrevenue?.serviceName,
                                                                                                        serviceSlug:
                                                                                                            servicesrevenue?.serviceSlug,
                                                                                                    },
                                                                                                }
                                                                                                )
                                                                                                }>
                                                                                                    {servicesrevenue.serviceName}
                                                                                                    {servicesrevenue?.Slug}
                                                                                                </td>
                                                                                                <td>
                                                                                                    ${" "} {servicesrevenue.totalRevenueService} .00
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
                                                                )}
                                                                
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
                    </div>
                </div>
            
            <ScrollToTop />
        </>
    );
};

export default Revenue;
