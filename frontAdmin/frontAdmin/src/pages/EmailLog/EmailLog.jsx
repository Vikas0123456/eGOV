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
import { RefreshCcw, Eye } from "feather-icons-react";
import { Badge } from "react-bootstrap";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import EmailTemplatePreviewModal from "./EmailTemplatePreviewModal";

function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}
const BlankData = process.env.REACT_APP_BLANK;
const EmailLog = () => {
    const axiosInstance = useAxios();
    const [emailLogdata, setEmailLogData] = useState([]);
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
    const [selectedSenderType, setSelectedSenderType] = useState("");
    //loader
    const [isLoading, setIsLoading] = useState(true);
    const typeEnum = ["0", "1"];
    const senderTypeEnum = ["0", "1", "2"];
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const FeedbackPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "emailLog"
        );
    const viewPermissions = FeedbackPermissions
        ? hasViewPermission(FeedbackPermissions)
        : false;

    const [previewshow, setPreviewShow] = useState(false);
    const [selectedEmailLog, setSelectedEmailLog] = useState("");

    const previewShowToggle = (emailLog) => {
        setSelectedEmailLog(emailLog);
        setPreviewShow(!previewshow);
    };

    const fetchModulesList = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/emailLog/list`,
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

    const searchEmailLogList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/emailLog/get",
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
                    selectedSenderType: selectedSenderType,
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;
                setIsLoading(false);
                setEmailLogData(records);
                setTotalCount(totalRecords);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching audit logs:", error.message);
        }
    };

    const emailLogList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                "userService/emailLog/get",
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
                    selectedSenderType: selectedSenderType,
                    selectedType: selectedType,
                }
            );

            if (response?.data) {
                const { records, totalRecords } = response?.data?.data;
                setEmailLogData(records);
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
                searchEmailLogList();
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
        selectedSenderType,
        selectedType,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            emailLogList();
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
        selectedSenderType,
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
        setSelectedSenderType("");
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

    const handleSenderTypeChange = (selectedSenderType) => {
        if (selectedSenderType) {
            setCurrentPage(1);
            setSelectedSenderType(selectedSenderType);
        } else {
            setSelectedSenderType("");
        }
    };

    const moduleOptions = moduleList.length > 0 && [
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
                    type === "0" ? "Failure" : type === "1" ? "Success" : "-",
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
    ];

    const senderTypeOptions = senderTypeEnum.length > 0 ? [
        { value: "", label: "Select Sender Type*" },
        ...senderTypeEnum
            .map((type) => ({
                value: type,
                label:
                    type === "0"
                        ? "System Generated"
                        : type === "1"
                            ? "User"
                            : type === "2"
                                ? "Customer"
                                : "-"
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
    ] : [];

    document.title = "Email Log | eGov Solution";

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
                                            {" "}
                                            Email Logs{" "}
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xxl-12 mb-3">
                                    <div className="card border-0">
                                        <div className="card-body border-0 ">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-2 col-md-4 col-sm-6  col-xxl-2 mb-3    mb-md-3 mb-lg-0 mb-xl-0">
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
                                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3    mb-md-3 mb-lg-0 mb-xl-0">
                                                    <div className="dateinput inner-border-0">
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
                                                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0   mb-md-3 mb-lg-0 mb-xl-0">
                                                    <div className=" input-light">
                                                        <Select
                                                            className="bg-choice"
                                                            classNamePrefix="select"
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
                                                            onChange={(
                                                                selectedOption
                                                            ) =>
                                                                handleModuleChange(
                                                                    selectedOption
                                                                        ? selectedOption.value
                                                                        : ""
                                                                )
                                                            }
                                                            options={
                                                                moduleOptions
                                                            }
                                                            placeholder="Select Modules*"
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

                                                <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-3   mb-md-0 mb-lg-0 mb-xl-0">
                                                    <div className="input-light">
                                                        <Select
                                                            classNamePrefix="select"
                                                            className="bg-choice"
                                                            name="type"
                                                            value={
                                                                selectedSenderType
                                                                    ? senderTypeOptions.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ===
                                                                            selectedSenderType
                                                                    )
                                                                    : null
                                                            }
                                                            onChange={(
                                                                selectedSenderOption
                                                            ) =>
                                                                handleSenderTypeChange(
                                                                    selectedSenderOption
                                                                        ? selectedSenderOption.value
                                                                        : ""
                                                                )
                                                            }
                                                            options={
                                                                senderTypeOptions
                                                            }
                                                            placeholder="Select Sender Type*"
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
                                                <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-3   mb-md-0 mb-lg-0 mb-xl-0">
                                                    <div className="input-light">
                                                        <Select
                                                            classNamePrefix="select"
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
                                                <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0   mb-md-0 mb-lg-0 mb-xl-0 d-flex  justify-content-end ms-auto">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center "
                                                        onClick={resetFilters}>
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                        Reset
                                                    </button>
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
                                                {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }}> */}
                                                    <table
                                                        className="table align-middle mb-0 com_table"
                                                        id="tasksTable">
                                                        <thead className="bg-white">
                                                            <tr>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "moduleName"
                                                                        )
                                                                    }>
                                                                    Module Name{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "sender_email"
                                                                        )
                                                                    }>
                                                                    Sender{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "recipient_email"
                                                                        )
                                                                    }>
                                                                    Recipient{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "subject"
                                                                        )
                                                                    }>
                                                                    Subject{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "sender_type"
                                                                        )
                                                                    }>
                                                                    Sender Type{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "isMailedSuccess"
                                                                        )
                                                                    }>
                                                                    Type{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "createdDate"
                                                                        )
                                                                    }>
                                                                    Dated{" "}
                                                                    <span>
                                                                        {" "}
                                                                        <BiSortAlt2 />{" "}
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                >
                                                                    Content{" "}
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {isLoading ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan="6"
                                                                        className="text-center">
                                                                        <LoaderSpin />
                                                                    </td>
                                                                </tr>
                                                            ) : emailLogdata.length ===
                                                                0 ? (
                                                                <tr>
                                                                    <td
                                                                        colSpan="7"
                                                                        className="text-center">
                                                                        <NotFound
                                                                            heading="Email Logs not found."
                                                                            message="Unfortunately, email logs not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                emailLogdata?.map(
                                                                    (
                                                                        emailLog,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }>
                                                                            <td>
                                                                                {emailLog?.moduleName
                                                                                    ? emailLog?.moduleName
                                                                                    : BlankData}
                                                                            </td>
                                                                            <td>
                                                                                {emailLog?.sender_email
                                                                                    ? emailLog?.sender_email
                                                                                    : BlankData}
                                                                            </td>
                                                                            <td>
                                                                                {emailLog?.recipient_email
                                                                                    ? emailLog?.recipient_email
                                                                                    : BlankData}
                                                                            </td>
                                                                            <td>
                                                                                {" "}
                                                                                {emailLog?.subject
                                                                                    ? emailLog?.subject
                                                                                    : BlankData}{" "}
                                                                            </td>
                                                                            <td className="text-nowrap w-xl">
                                                                                {emailLog.sender_type === "0"
                                                                                    ? "System Generated"
                                                                                    : emailLog.sender_type === "1"
                                                                                        ? "Admin"
                                                                                        : emailLog.sender_type === "2"
                                                                                            ? "Customer"
                                                                                            : BlankData
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <Badge
                                                                                    bg={
                                                                                        emailLog.isMailedSuccess ===
                                                                                            "0"
                                                                                            ? "danger"
                                                                                            : emailLog.isMailedSuccess ===
                                                                                                "1"
                                                                                                ? "success"
                                                                                                : "secondary"
                                                                                    }
                                                                                    className="fw-bold">
                                                                                    {emailLog.isMailedSuccess ===
                                                                                        "0"
                                                                                        ? "Failure"
                                                                                        : emailLog.isMailedSuccess ===
                                                                                            "1"
                                                                                            ? "Success"
                                                                                            : BlankData}
                                                                                </Badge>
                                                                            </td>
                                                                            <td className="w-xl cursor-pointer">
                                                                                {emailLog?.createdDate
                                                                                    ? format(
                                                                                        new Date(
                                                                                            emailLog?.createdDate
                                                                                        ),
                                                                                        "dd MMM, yyyy - h:mm a"
                                                                                    )
                                                                                    : BlankData}
                                                                            </td>
                                                                            <td>
                                                                                {emailLog?.content ? (
                                                                                    <Eye
                                                                                        className="text-muted me-2"
                                                                                        width="16"
                                                                                        height="16"
                                                                                        onClick={() => previewShowToggle(emailLog.content)}
                                                                                        style={{ cursor: 'pointer' }}
                                                                                    />
                                                                                ) : (
                                                                                    BlankData
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                               {/* </SimpleBar> */}
                                            </div>
                                        </div>
                                        <EmailTemplatePreviewModal
                                            show={previewshow}
                                            setShow={setPreviewShow}
                                            handleToggle={previewShowToggle}
                                            data={selectedEmailLog}
                                        />

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
export default EmailLog;
