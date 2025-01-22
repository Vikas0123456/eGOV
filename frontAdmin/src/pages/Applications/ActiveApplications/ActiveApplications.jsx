import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import UpdateStatusModal from "../../../common/modals/UpdateStatusModal/UpdateStatusModal";
import { useEffect } from "react";
import { useState } from "react";
import userIcon from "../../../assets/images/userIcon.webp";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Swal from "sweetalert2";
import TransactionStatusModal from "./TransactionStatusModal";
import { BiSortAlt2 } from "react-icons/bi";
import {
    calculateRemainingTimeTAT,
    hasAssignPermission,
} from "../../../common/CommonFunctions/common";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Badge, Button, Stack } from "react-bootstrap";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import Pagination from "../../../CustomComponents/Pagination";
import DateRangePopup from "../../../common/Datepicker/DatePicker";

import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import { Dropdown } from "react-bootstrap";

import { RefreshCcw } from "feather-icons-react";
import { Eye } from "feather-icons-react/build/IconComponents";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { IoChevronBack } from "react-icons/io5";
import NotFound from "../../../common/NotFound/NotFound";
import DepartmentServices from "../../DepartmentServices/DepartmentServices";
import useAxios from "../../../utils/hook/useAxios";
import { LoaderSpin } from "../../../common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import ColumnConfig from "./../../../common/ColumnConfig/ColumnConfig";
import { setTableColumnConfig } from "../../../slices/layouts/reducer";

const BlankData = process.env.REACT_APP_BLANK;
function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${("0" + date.getDate()).slice(-2)} ${getMonthName(
        date
    )}, ${date.getFullYear()}`;

    const formattedTime = `${("0" + date.getHours()).slice(-2)}:${(
        "0" + date.getMinutes()
    ).slice(-2)} ${date.getHours() >= 12 ? "PM" : "AM"}`;

    return (
        <div>
            <span className="">{formattedDate}</span>
            <small className="d-block text-muted fs-11">{formattedTime}</small>
        </div>
    );
}
const MultiValueRemove = (props) => {
    if (props.selectProps.value.length === 1) {
        return null;
    }
    return <components.MultiValueRemove {...props} />;
};

const ActiveApplications = ({ isDashBoard = false }) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);

    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const userEncryptData = localStorage.getItem("userData");
    const [applicationData, setApplicationData] = useState();
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const savedState = location?.state?.data;

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const applicationPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "applications"
        );
    const assignPermission = applicationPermissions
        ? hasAssignPermission(applicationPermissions)
        : false;

    const dispatch = useDispatch();
    const tableName = "application";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = [
        "NIB / Citizen",
        "Application ID",
        "Date",
        "Service",
        "Department",
        "TAT",
        "Transaction Status",
        "Status",
        assignPermission ? "Assign To" : null,
    ].filter(Boolean);
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? [
            "NIB / Citizen",
            "Application ID",
            "Date",
            "Service",
            "Department",
            "TAT",
            "Transaction Status",
            "Status",
            assignPermission ? "Assign To" : null,
            "Action",
        ].filter(Boolean) // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [open, setOpen] = useState(
        savedState ? false : userData?.isCoreTeam === "1" ? true : false
    );
    const [show, setShow] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [applicationList, setApplicationList] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");
    const [serviceList, setServiceList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    // const [selectedService, setSelectedService] = useState("");
    const [selectedService, setSelectedService] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]); // Multiple selected services

    const [selectedModalService, setSelectedModalService] = useState("");
    const [selectedModalDept, setSelectedModalDept] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectStartDate, setSelectStartDate] = useState();
    const [selectEndDate, setSelectEndDate] = useState();
    const [dateStart, setDateStart] = useState();
    const [dateEnd, setDateEnd] = useState();
    const [sortBy, setSortBy] = useState();
    const [sortOrder, setSortOrder] = useState("DESC");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(true);
    const [isCompleteApplication, setIsCompleteApplication] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(
        "Active Applications"
    );

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    useEffect(() => {
        const savedData = location?.state?.data;

        if (savedData) {
            setOpen(false);
            setSelectedService(savedData?.selectedService);
            setSelectedModalService(savedData?.selectedModalService);
            setSelectedStatus(savedData?.selectedStatus);
            setSelectedUser(savedData?.selectedUser);
            setDateStart(savedData?.dateStart);
            setDateEnd(savedData?.dateEnd);
            setSelectStartDate(savedData?.selectStartDate);
            setSelectEndDate(savedData?.selectEndDate);
            setSearchQuery(savedData?.searchQuery);
            navigate(location.pathname, { state: {} });
        } else if (
            userData?.isCoreTeam === "0" &&
            serviceList.length > 0 &&
            selectedService.length === 0
        ) {
            const defaultService = serviceList[0];
            setSelectedModalService([
                {
                    value: defaultService?.slug,
                    label: defaultService?.serviceName,
                },
            ]);
            setSelectedService([defaultService?.slug]);
        }
    }, [JSON.stringify(serviceList)]);

    const handleSelect = (eventKey) => {
        if (eventKey === "completed") {
            setSelectedApplication("Completed Applications");
            setIsCompleteApplication(true);
        } else {
            setSelectedApplication("Active Applications");
            setIsCompleteApplication(false);
        }
    };
    const handleSorting = (value) => {
        setSortBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "DESC" ? "ASC" : "DESC"
        );
    };

    const handleToggle = () => {
        setShow(!show);
    };

    const handleToggleUpdateShow = () => {
        setShowUpdateModal(!showUpdateModal);
    };
    const handleDepartmentSearch = async (value, isStateData) => {
        try {
            const serviceResponse = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    departmentId:
                        userData?.isCoreTeam === "0" && (userData?.departmentId || "").split(',').map(id => id.trim()),
                }
            );

            if (serviceResponse?.data?.data?.rows) {
                // console.log(serviceResponse?.data?.data);
                setServiceList(serviceResponse?.data?.data?.rows);
            }

            // const userResponse = await axiosInstance.post(`userService/user/view`, {
            //   departmentId: value,
            // });

            // if (userResponse?.data?.data?.rows) {
            //   setUserList(userResponse?.data?.data?.rows);
            // }
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    const handleServiceListwithDepartmentId = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/service/view`,
                {
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : null,
                }
            );

            if (response?.data) {
                const { rows } = response?.data?.data;
                setServiceList(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const handleUserListwithDepartmentId = async () => {
        try {
            const response = await axiosInstance.post(`userService/user/view`, {
                departmentId:
                    userData?.isCoreTeam === "0"
                        ? (userData?.departmentId || "").split(',').map(id => id.trim())
                        : null,
            });

            if (response?.data) {
                const { rows } = response?.data?.data;
                setUserList(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            handleServiceListwithDepartmentId();
            handleUserListwithDepartmentId();
        }
    }, []);
    const handleServiceSearch = async (value) => {
        if (value) {
            setCurrentPage(1);
            setSelectedService(value);
        } else {
            setSelectedService("");
        }
    };
    const handleUserSearch = async (value) => {
        if (value) {
            setCurrentPage(1);
            setSelectedUser(value);
        } else {
            setSelectedUser("");
        }
    };
    const handleStatusSearch = async (value) => {
        if (value) {
            setCurrentPage(1);
            setSelectedStatus(value);
        } else {
            setSelectedStatus("");
        }
    };
    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };

    const getApplicationList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `businessLicense/application/adminApplicationList`,
                {
                    page: currentPage,
                    perPage: isDashBoard ? 10 : perPageSize,
                    serviceSlug: selectedService
                        ? selectedService
                        : selectedModalService,
                    status: isCompleteApplication ? "4" : selectedStatus,
                    userId: selectedUser,
                    sortBy: sortBy,
                    departmentId: selectedDept,
                    dateRange: {
                        startDate: selectStartDate,
                        endDate: selectEndDate,
                    },
                    searchFilter: searchQuery,
                    sortOrder: sortOrder,
                },
                {
                    timeout: 50000, // Set the timeout to 50 seconds (50000 ms)
                }
            );
            if (response) {
                const { rows, count } = response?.data?.data;
                setApplicationList(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
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

    const getTransactionDetails = async (applicationId, slug) => {
        setIsModalLoading(true);
        setShow(true);
        try {
            const response = await axiosInstance.post(
                `paymentService/customerDetails/gettransactionDetails`,
                {
                    slug: slug,
                    applicationId: applicationId,
                    transactionDetail:true,
                }
            );
            if (response) {
                const { count, rows } = response?.data?.data;
                setTransactionDetails(rows?.[0]);
                setIsModalLoading(false);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsModalLoading(false);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery && selectedService.length > 0) {
                getApplicationList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        currentPage,
        perPageSize,
        selectedUser,
        JSON.stringify(selectedService),
        selectedStatus,
        selectedStatus,
        selectedDept,
        sortBy,
        selectStartDate,
        selectEndDate,
        searchQuery,
        sortOrder,
        isCompleteApplication,
        // selectedModalService,
    ]);

    useEffect(() => {
        if (!searchQuery && selectedService.length > 0) {
            getApplicationList();
        }
    }, [
        currentPage,
        perPageSize,
        selectedUser,
        JSON.stringify(selectedService),
        selectedStatus,
        selectedDept,
        selectedStatus,
        sortBy,
        selectStartDate,
        selectEndDate,
        searchQuery,
        sortOrder,
        isCompleteApplication,
        // selectedModalService,
    ]);
    const handleBackClick = () => {
        navigate(-1);
    };

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
        // Parse the input date string
        const date = new Date(dateString);

        // Format the date in the desired format (08 Mar, 2024)
        const formattedDate = `${("0" + date.getDate()).slice(
            -2
        )} ${getMonthName(date)}, ${date.getFullYear()}`;

        // Get the hours and minutes
        let hours = date.getHours();
        let minutes = date.getMinutes();

        // AM or PM
        const ampm = hours >= 12 ? "PM" : "AM";

        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        // Add leading zero to minutes if needed
        minutes = minutes < 10 ? "0" + minutes : minutes;

        const formattedTime = `${hours}:${minutes} ${ampm}`;

        return (
            <div>
                <div>{formattedDate}</div>
                <small className="text-muted fs-11">{formattedTime}</small>
            </div>
        );
    }
    const handleAssignedUser = async (
        applicationId,
        assignedUserId,
        serviceName,
        applicationIdSlug
    ) => {
        try {
            const matchingApplication = applicationList.find(
                (application) => application.applicationId === applicationIdSlug
            );
            const departmentId = matchingApplication
                ? matchingApplication?.serviceName?.departmentId
                : null;
            const customerId = matchingApplication
                ? matchingApplication?.customerId
                : null;
            const customerEmail = matchingApplication
                ? matchingApplication?.customerInfo?.email
                : null;
            const userFind = matchingApplication
                ? matchingApplication?.assignUserList.find(
                    (application) => application.id == assignedUserId
                )
                : null;
            const userEmail = userFind?.email;
            const response = await axiosInstance.put(
                `businessLicense/application/updateAssigneduser`,
                {
                    applicationId: applicationId,
                    assignedUserId: assignedUserId,
                    userId: userId,
                    applicationIdSlug: applicationIdSlug,
                    departmentNameData: departmentId,
                    customerId: customerId,
                    customerEmail: customerEmail,
                    userEmail: userEmail,
                    slug: serviceName?.slug,
                    serviceData: {
                        serviceName: serviceName?.serviceName,
                        departmentName: serviceName?.departmentName,
                        TAT: JSON.parse(serviceName?.TAT),
                    },
                }
            );
            if (response) {
                toast.success("application assign to agent");
                getApplicationList();
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const openAssignUserConfirmation = (
        applicationId,
        assignedUserId,
        selectedUser,
        serviceName,
        applicationIdSlug,
        customerIdData,
        departmentNameData
    ) => {
        Swal.fire({
            html: `This application assigned to <strong>${selectedUser?.name}</strong> ?`,
            icon: "info",
            showCancelButton: false,
            confirmButtonText: "ok",
        }).then((result) => {
            if (result.isConfirmed) {
                handleAssignedUser(
                    applicationId,
                    assignedUserId,
                    serviceName,
                    applicationIdSlug,
                    customerIdData,
                    departmentNameData
                );
            }
        });
    };

    const getDocumentSlug = (slug) => {
        if (slug === "bcs") {
          return "bcs";
        } else if (slug === "pcs") {
          return "pcs";
        } else if (slug === "tcs") {
          return "tcs";
        } else {
          return null;
        }
    };
      
    const findApplicationForDocUpdate = async (serviceSlug, applicationId, documentInfo) => {
        try {
            const docSlug = serviceSlug
            
            const response = await axiosInstance.post(
                `businessLicense/application/findApplicationForDocUpdate`,
                {
                    applicationId: applicationId,
                    documentSlug: docSlug,
                }
            );
            
            if (response) {
                const { rows } = response?.data?.data || {};
                if (rows && rows.length > 0) {
                    await Promise.all(
                        rows.map(async (data) => {
                          
                            if (docSlug) {
                                try {
                              
                                    const updateResponse = await axiosInstance.put(
                                        `businessLicense/application/update/reqDoc`,
                                        {
                                            documentSlug: docSlug,
                                            applicationId: data?.id,
                                            slug: data?.serviceData?.slug,
                                            uploadedDocumentId:
                                            documentInfo?.id,
                                        }
                                    );
    
                                    if (updateResponse) {
                                        // console.log("Update successful:", updateResponse.data?.data);
                                    }
                                } catch (error) {
                                    console.error("Update error:", error.message);
                                }
                            }
                        })
                    );
                }
            }
        } catch (error) {
            console.error("Error finding application:", error.message);
        }
    };
    
    const handleUpdateStatusApplication = async (values) => {

        // Find matching application and department ID
        const matchingApplication = applicationList.find(
            (application) =>
                application.id === values.applicationId
        );

        const data = JSON?.parse(matchingApplication?.applicationData)?.requiredDocumentList?.data
        const documentsWithNullId = data?.length > 0 && data
        ?.filter(doc => doc?.uploadedDocumentId === null)
        ?.map(doc => doc?.documentName);

        const updateStatus = async ()=>{
            try {
                let fileId = null;
                setIsUpdating(true); // Set loading state

                if (values?.serviceName?.slug) {
                    const serviceSlug = values?.serviceName?.slug;
    
                    // Handle file upload if there's a file
                    if (values?.file) {
                        const formData = new FormData();
                        formData.append(
                            "viewDocumentName",
                            "Application Status attachedDoc"
                        );
                        formData.append("documentFile", values?.file);
                        formData.append("userId", userId);
                        formData.append("customerId", values?.customerId);
                        formData.append("isGenerated", "0");
                        formData.append("isShowInDocument", "0");
    
                        const fileResponse = await axiosInstance.post(
                            "documentService/uploading",
                            formData,
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            }
                        );
    
                        fileId = fileResponse?.data?.data
                            ? fileResponse?.data?.data?.[0]?.id
                            : null;
                    }
    
                    
                    const departmentId = matchingApplication
                        ? matchingApplication?.serviceName?.departmentId
                        : null;
                    const assignedUserDetails = matchingApplication?.assignUserList?.length> 0 && matchingApplication.assignUserList?.find((user)=> user.id === matchingApplication?.userId)
    
                    const response = await axiosInstance.put(
                        "businessLicense/application/updateStatus",
                        {
                            applicationId: values?.applicationId,
                            status: values?.status,
                            documentId: fileId,
                            description: values?.description,
                            userId: userId,
                            applicationIdSlug: values?.applicationIdSlug,
                            customerIdData: values?.customerId,
                            departmentNameData: departmentId,
                            customerEmail: values?.customerEmail,
                            serviceData: {
                                ...values?.serviceName,
                                agentDetails: assignedUserDetails ? {
                                    name: assignedUserDetails.name,
                                    id: assignedUserDetails?.id,
                                    email: assignedUserDetails?.email
                                } : null
                            },
                            slug: serviceSlug,
                        }
                    );
    
                    if (response) {
                        const documentData = response?.data?.data?.issuedDocumentData
                        if(documentData){
                            await findApplicationForDocUpdate(serviceSlug, matchingApplication?.applicationId, documentData)
                        }

                        toast.success("Application status updated successfully");
                        formik.resetForm();
                        setShowUpdateModal(false);
                        getApplicationList();
                    }
                }
            } catch (error) {
                console.error(error.message);
                setIsUpdating(false);
            } finally {
                setIsUpdating(false); // Ensure this runs no matter what
            }
        }

        if(documentsWithNullId?.length > 0 && values?.status === "4" ){
            Swal.fire({
                text: `${documentsWithNullId?.join(", ")} are still pending?`,
                icon: "info",
                showCancelButton : true,
                confirmButtonText: "Approve, anyway"
              }).then( async (result)=>{
                if(result?.isConfirmed){
                    updateStatus()  
                }
              })
        }else{
            updateStatus()
        }
    };

    const formik = useFormik({
        initialValues: {
            applicationId: "",
            status: "",
            file: "",
            description: "",
            customerId: "",
            serviceName: "",
            applicationIdSlug: "",
            customerIdData: "",
            departmentNameData: "",
            customerEmail: "",
        },
        validationSchema: Yup.object({
            status: Yup.string().required("Please select status"),
            file: Yup.mixed(),
            description: Yup.string().required("Please enter description"),
        }),
        onSubmit: (values) => {
            handleUpdateStatusApplication(values);
        },
    });

    const handleClose = () => {
        setShowUpdateModal(false);
        formik.resetForm();
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

    const handleApplicationDetailedView = async (data, serviceName) => {
        const stateToSave = {
            selectedService,
            selectedModalService,
            searchQuery,
            selectedStatus,
            selectStartDate,
            selectEndDate,
            dateStart,
            dateEnd,
            currentPage,
            perPageSize,
        };

        navigate("/application-detailed-view", {
            state: { ...data, backButtonData: stateToSave },
        });
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
        setDateStart(value[0]);
        setDateEnd(value[1]);
    }

    const departmentOptions =
        departmentList &&
        departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }));

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

    const serviceOptions =
        serviceList.length > 0 &&
        serviceList.map((service) => ({
            value: service.slug,
            label: service.serviceName,
        }));

    const userOptions = userList.length > 0 && [
        { value: "", label: "Select Assign to*" },
        ...userList.map((user) => ({
            value: user.id,
            label: user.name,
        })),
    ];

    const resetFilters = () => {
        if (userData?.isCoreTeam === "1") {
            setOpen(true);
            setSelectedServices([]);
            //  setSelectedModalService([])
        } else {
            // setSelectedService(serviceOptions?.[0]?.value);
            setSelectedStatus("");
            setSelectedUser("");
            setSelectStartDate();
            setSelectEndDate();
            setDateStart();
            setDateEnd();
            setSearchQuery("");
            setCurrentPage(1);
            setPerPageSize(10);
        }
    };

    const handleModalSelect = (service, departmentId) => {
        if(!serviceOptions || serviceOptions?.length === 0) return;
        const serviceOption = serviceOptions
            .filter((option) => service?.includes(option.value)) // Filter only matched services
            .map((option) => option); // Return the matched options
        setSelectedModalService(serviceOption); // Set the selected services in modal
        setSelectedService(service); // Keep the raw selected service array
        setOpen(false);
        if (selectedServices.length > 0) {
            setSelectedStatus("");
            setSelectedUser("");
            setSelectStartDate();
            setSelectEndDate();
            setDateStart();
            setDateEnd();
            setSearchQuery("");
            setCurrentPage(1);
            setPerPageSize(10);
        }
    };

    const handleServiceChange = (selectedOptions) => {
        // Save the array of selected options
        setSelectedModalService(selectedOptions || []);
        // Extract the value properties from the selected options
        const selectedValues = selectedOptions
            ? selectedOptions.map((option) => option.value)
            : [];
        // Pass the selected values for further processing (e.g., search)
        handleServiceSearch(selectedValues);
    };

    useEffect(() => {
        handleDepartmentSearch();
    }, []);
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
        // console.log("Selected Columns:", selectedColumns);
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

    return (
        <>
            <div id="layout-wrapper">
                <div className={isDashBoard ? "" : "main-content trans-sup"}>
                    <div className={isDashBoard ? "" : "page-content"}>
                        <div className={isDashBoard ? "" : "container-fluid"}>
                            {!isDashBoard && (
                                <div className="row">
                                    <DepartmentUserInfo />
                                    <div className="col-12">
                                        <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                            <Dropdown
                                                className="card-header-dropdown"
                                                onSelect={handleSelect}
                                            >
                                                <Dropdown.Toggle
                                                    variant="link"
                                                    id="dropdown-active-applications"
                                                    className="dropdown-btn h4 text-black py-0"
                                                >
                                                    {selectedApplication}{" "}
                                                    <i className="mdi mdi-chevron-down align-middle"></i>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    {selectedApplication ===
                                                        "Active Applications" && (
                                                            <Dropdown.Item eventKey="completed">
                                                                Completed
                                                                Applications
                                                            </Dropdown.Item>
                                                        )}
                                                    {selectedApplication ===
                                                        "Completed Applications" && (
                                                            <Dropdown.Item eventKey="active">
                                                                Active Applications
                                                            </Dropdown.Item>
                                                        )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <div className="page-title-right">
                                                <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="row">
                                <div className="col-xxl-12 ">
                                    <div className="card border-0 border-bottom border-bottom-1 ">
                                        <div className="card-body border-0 p-3 ">
                                            <div className="row">
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xxl-3 mb-xxl-0 mb-3 ">
                                                    <div className="search-box">
                                                        <input
                                                            type="text"
                                                            className="form-control search bg-light border-light"
                                                            placeholder="Search Application ID"
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

                                                <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-4 col-sm-6 mb-xxl-0 mb-3">
                                                    <div className=" inner-border-0 p-0 ">
                                                        <div className="dateinput">
                                                            <DateRangePopup
                                                                dateStart={
                                                                    dateStart
                                                                }
                                                                dateEnd={
                                                                    dateEnd
                                                                }
                                                                onChangeHandler={
                                                                    onChangeHandler
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isCompleteApplication && (
                                                    <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-4 col-sm-6 mb-xxl-0 mb-3">
                                                        <div className="input-light ">
                                                            <Select
                                                                className="cursor-pointer bg-choice"
                                                                name="choices-single-default"
                                                                id="idStatus"
                                                                value={
                                                                    selectedStatus
                                                                        ? statusOptions.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                selectedStatus
                                                                        )
                                                                        : null
                                                                }
                                                                onChange={(
                                                                    option
                                                                ) =>
                                                                    handleStatusSearch(
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
                                                )}

                                                {/* {userData?.isCoreTeam === "1" && (
                          <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-4 col-sm-6 mb-3  ">
                            <div className=" input-light">
                              <Select
                                className="text-start bg-choice"
                                name="choices-single-default"
                                id="idStatus"
                                value={
                                  departmentOptions.find(
                                    (option) =>
                                      option.value ===
                                      (userData?.isCoreTeam === "0"
                                        ? userData?.departmentId
                                        : selectedDept)
                                  ) || null
                                }
                                onChange={(option) => {
                                  const isStateData = false;
                                  handleDepartmentSearch(
                                    option.value,
                                    isStateData
                                  );
                                }}
                                placeholder="Select Department"
                                options={departmentOptions}
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                  option: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                }}
                              />
                            </div>
                          </div>
                        )} */}

                                                {serviceList &&
                                                    serviceList.length > 0 && (
                                                        <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-6 col-lg-3 col-sm-6 mb-xxl-0 mb-3">
                                                            <div className="input-light">
                                                                <Select
                                                                    isClearable={
                                                                        false
                                                                    }
                                                                    backspaceRemovesValue={
                                                                        false
                                                                    }
                                                                    components={{
                                                                        MultiValueRemove,
                                                                    }}
                                                                    // isSearchable={false}
                                                                    isMulti
                                                                    className="bg-choice"
                                                                    name="choices-multiple-default"
                                                                    id="idStatus"
                                                                    value={
                                                                        selectedModalService
                                                                    } // Set the selected values
                                                                    onChange={
                                                                        handleServiceChange
                                                                    } // Update the change handler
                                                                    placeholder="Select Service*"
                                                                    hideSelectedOptions={false}
                                                                    options={
                                                                        serviceOptions
                                                                    } // Make sure this array contains the options you want to show
                                                                    styles={{
                                                                        control:
                                                                            (
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
                                                                            provided ,state
                                                                        ) => ({
                                                                            ...provided,
                                                                            cursor: "pointer",
                                                                             backgroundColor: state.isSelected ? '#DEEBFF' : 'inherit',
                                                                             color: state.isSelected ? '#212529' : 'inherit',
                                                                             marginBottom: "1px",
                                                                             
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                {userList &&
                                                    userList?.length > 0 && (
                                                        <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-6 col-lg-3 col-sm-6  mb-xxl-0 mb-3 mt-0  mt-xxl-3">
                                                            <div className="input-light">
                                                                <Select
                                                                    className="bg-choice"
                                                                    name="choices-single-default"
                                                                    id="idStatus"
                                                                    value={
                                                                        selectedUser
                                                                            ? userOptions.find(
                                                                                (
                                                                                    option
                                                                                ) =>
                                                                                    option.value ===
                                                                                    selectedUser
                                                                            )
                                                                            : null
                                                                    }
                                                                    onChange={(
                                                                        option
                                                                    ) =>
                                                                        handleUserSearch(
                                                                            option.value
                                                                        )
                                                                    }
                                                                    placeholder="Assign to*"
                                                                    options={
                                                                        userOptions
                                                                    }
                                                                    styles={{
                                                                        control:
                                                                            (
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

                                                <div className="col ms-auto text-end d-flex justify-content-end align-items-start mt-0 mt-xxl-3">
                                                    <button title="Reset"
                                                        type="button"
                                                        className="btn btn-primary btn-label bg-warning border-warning me-3  d-flex align-items-center"
                                                        onClick={resetFilters}
                                                    >
                                                        <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>

                                                        Reset
                                                        {/* <RefreshCcw
                                                            className="text-muted me-2"
                                                            width="16"
                                                            height="16"
                                                        />{" "}
                                                        <span> Reset </span> */}
                                                    </button>
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

                                                    {isDashBoard && (
                                                        <button
                                                            className="btn btn-primary add-btn ms-2"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/applications"
                                                                )
                                                            }
                                                        >
                                                            {" "}
                                                            View All{" "}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <div className="card mb-0 border-0">
                                        <div className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                <table className="table align-middle mb-0 com_table" id="tasksTable" >
                                                    <thead className="bg-white">
                                                        <tr className="text-capitalize">
                                                            {columns.includes(
                                                                "NIB / Citizen"
                                                            ) && (
                                                                    <th data-sort="id">
                                                                        {" "} NIB / Citizen{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Application ID"
                                                            ) && (
                                                                    <th>
                                                                        {" "}
                                                                        Application
                                                                        ID{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Date"
                                                            ) && (
                                                                    <th
                                                                        className=" cursor-pointer"
                                                                        data-sort="due_date"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "createdDate"
                                                                            )
                                                                        }
                                                                    >
                                                                        {" "}
                                                                        Date{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Service"
                                                            ) && (
                                                                    <th
                                                                        className=""
                                                                        data-sort="service-name"
                                                                    >
                                                                        {" "}
                                                                        Service{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Department"
                                                            ) && (
                                                                    <th
                                                                        className=" cursor-pointer"
                                                                        data-sort="department-name"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "departmentName"
                                                                            )
                                                                        }
                                                                    >
                                                                        {" "}
                                                                        Department{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "TAT"
                                                            ) && (
                                                                    <th
                                                                        className=" cursor-pointer"
                                                                        data-sort="time-remain"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "turnAroundTime"
                                                                            )
                                                                        }
                                                                    >
                                                                        {" "}
                                                                        TAT{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Transaction Status"
                                                            ) && (
                                                                    <th
                                                                        className=" cursor-pointer"
                                                                        data-sort="tr-status"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "transactionStatus"
                                                                            )
                                                                        }
                                                                    >
                                                                        {" "}
                                                                        Transaction
                                                                        Status{" "}
                                                                        <span>
                                                                            {" "}
                                                                            <BiSortAlt2 />{" "}
                                                                        </span>{" "}
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (
                                                                    <th>
                                                                        Status
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Assign To"
                                                            ) &&
                                                                assignPermission && (
                                                                    <th className="w-xl">
                                                                        Assign
                                                                        To
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Action"
                                                            ) && (
                                                                    <th
                                                                        className=" text-end"
                                                                        data-sort="status"
                                                                    >
                                                                        {" "}
                                                                        Action{" "}
                                                                    </th>
                                                                )}
                                                        </tr>
                                                    </thead>
                                                    <tbody
                                                        className={
                                                            !isLoading
                                                                ? "list form-check-all"
                                                                : "list form-check-all d-none"
                                                        }
                                                    >
                                                        {!open &&
                                                            applicationList &&
                                                            !isLoading &&
                                                            applicationList?.length ===
                                                            0 && (
                                                                <tr>
                                                                    <td
                                                                        colSpan="10"
                                                                        className="text-center"
                                                                    >
                                                                        {" "}
                                                                        {/* No records found.{" "} */}
                                                                        <NotFound
                                                                            heading="Applications not found."
                                                                            message="Unfortunately, Applications not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        {applicationList &&
                                                            applicationList?.map(
                                                                (
                                                                    data,
                                                                    index
                                                                ) => {
                                                                    const options =
                                                                        data?.assignUserList?.map(
                                                                            (
                                                                                user
                                                                            ) => ({
                                                                                value: user.id,
                                                                                label: user.name,
                                                                            })
                                                                        ) || [
                                                                            {
                                                                                value: "",
                                                                                label: "Select User",
                                                                                isDisabled: true,
                                                                            },
                                                                        ];
                                                                    const selectedOption =
                                                                        options.find(
                                                                            (
                                                                                option
                                                                            ) =>
                                                                                option.value ===
                                                                                data?.userId
                                                                        );
                                                                    const handleChange =
                                                                        (
                                                                            selectedOption
                                                                        ) => {
                                                                            const selectedUserId =
                                                                                selectedOption.value;
                                                                            const applicationId =
                                                                                data?.id;
                                                                            const selectedUser =
                                                                                data?.assignUserList.find(
                                                                                    (
                                                                                        user
                                                                                    ) =>
                                                                                        user.id ===
                                                                                        selectedUserId
                                                                                );
                                                                            openAssignUserConfirmation(
                                                                                applicationId,
                                                                                selectedUserId,
                                                                                selectedUser,
                                                                                data?.serviceName,
                                                                                data?.applicationId
                                                                            );
                                                                        };
                                                                    return (
                                                                        <tr
                                                                            key={
                                                                                data?.applicationId
                                                                            }
                                                                        >
                                                                            {columns.includes(
                                                                                "Application ID"
                                                                            ) && (
                                                                                    <td className="id">
                                                                                        <div>
                                                                                            <div className="d-flex align-items-center">
                                                                                                <div className="flex-shrink-0 me-2">
                                                                                                    <img
                                                                                                        src={
                                                                                                            data
                                                                                                                ?.customerInfo
                                                                                                                ?.imageData
                                                                                                                ?.documentPath ||
                                                                                                            userIcon
                                                                                                        }
                                                                                                        alt=""
                                                                                                        className="avatar-xs rounded-circle"
                                                                                                    />
                                                                                                </div>
                                                                                                {data
                                                                                                    ?.customerInfo
                                                                                                    ?.nibNumber ? (
                                                                                                    <div className="flex-grow-1">
                                                                                                        <small className="text-secondary">
                                                                                                            {
                                                                                                                data
                                                                                                                    ?.customerInfo
                                                                                                                    ?.nibNumber
                                                                                                            }
                                                                                                        </small>
                                                                                                        <br />
                                                                                                        <strong>
                                                                                                            {
                                                                                                                data
                                                                                                                    ?.customerInfo
                                                                                                                    ?.firstName
                                                                                                            }{" "}
                                                                                                            {
                                                                                                                data
                                                                                                                    ?.customerInfo
                                                                                                                    ?.middleName
                                                                                                            }{" "}
                                                                                                            {
                                                                                                                data
                                                                                                                    ?.customerInfo
                                                                                                                    ?.lastName
                                                                                                            }
                                                                                                        </strong>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <strong>
                                                                                                        {
                                                                                                            data
                                                                                                                ?.customerInfo
                                                                                                                ?.firstName
                                                                                                        }{" "}
                                                                                                        {
                                                                                                            data
                                                                                                                ?.customerInfo
                                                                                                                ?.middleName
                                                                                                        }{" "}
                                                                                                        {
                                                                                                            data
                                                                                                                ?.customerInfo
                                                                                                                ?.lastName
                                                                                                        }
                                                                                                    </strong>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Application ID"
                                                                            ) && (
                                                                                    <td className="fw-bold">
                                                                                        {data?.applicationId ||
                                                                                            BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Date"
                                                                            ) && (
                                                                                    <td className="due_date">
                                                                                        {formatDate(
                                                                                            data?.createdDate
                                                                                        ) ||
                                                                                            BlankData}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Service"
                                                                            ) && (
                                                                                    <td className="service-name fw-bold">
                                                                                        <div>
                                                                                            {" "}
                                                                                            {data
                                                                                                ?.serviceName
                                                                                                ?.serviceName ||
                                                                                                BlankData}{" "}
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Department"
                                                                            ) && (
                                                                                    <td>
                                                                                        <div className="d-flex">
                                                                                            <div className="flex-grow-1 department-name">
                                                                                                {data
                                                                                                    ?.serviceName
                                                                                                    ?.departmentName ||
                                                                                                    BlankData}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "TAT"
                                                                            ) && (
                                                                                    <td>
                                                                                        {data?.turnAroundTime ? (
                                                                                            <>
                                                                                                {" "}
                                                                                                {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status,"service") === "Completed" ? (
                                                                                                    <div className="badge bg-success d-inline-flex align-items-center">
                                                                                                        <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                                                                                        <div className="mb-0 ms-1 fs-13" id="demo1">
                                                                                                            {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status,"service")}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : calculateRemainingTimeTAT(data?.turnAroundTime, data?.status,"service") === "Overdue" ? (
                                                                                                    <div className="badge bg-danger d-inline-flex align-items-center">
                                                                                                        <i className="mdi mdi-clock-alert fs-14"></i>
                                                                                                        <span className="mb-0 ms-1 fs-13">
                                                                                                            {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status,"service")}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="badge bg-warning d-inline-flex align-items-center">
                                                                                                        <i className="mdi mdi-clock-outline fs-14"></i>
                                                                                                        <span className="mb-0 ms-1 fs-13">
                                                                                                            {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status,"service")}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}

                                                                                            </>
                                                                                        ) : (
                                                                                            BlankData
                                                                                        )}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Transaction Status"
                                                                            ) && (
                                                                                <td className="tr-status">
                                                                                        <div
                                                                                            onClick={() => {
                                                                                                if (
                                                                                                    data?.transactionStatus ===
                                                                                                    "1"
                                                                                                ) {
                                                                                                    getTransactionDetails(
                                                                                                        data?.applicationId,
                                                                                                        data
                                                                                                            ?.serviceData
                                                                                                            ?.slug
                                                                                                    );
                                                                                                }
                                                                                            }}
                                                                                            className="d-block text-body p-1 px-2 "
                                                                                            title={data?.transactionStatus === "1" ? "Click here to see payment details." : ""}
                                                                                        >
                                                                                            {data?.transactionStatus ? (
                                                                                                <>
                                                                                                    {data?.transactionStatus ===
                                                                                                        "0" && (
                                                                                                            <span className="badge badge-soft-warning fs-12 border border-1 border-warning">
                                                                                                                {" "}
                                                                                                                Txn:
                                                                                                                Pending{" "}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    {data?.transactionStatus ===
                                                                                                        "1" && (
                                                                                                            <span className="badge badge-soft-success fs-12 border border-1 border-success cursor-pointer">
                                                                                                                {" "}
                                                                                                                Txn:
                                                                                                                Success{" "}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    {data?.transactionStatus ===
                                                                                                        "2" && (
                                                                                                            <span className="badge badge-soft-danger fs-12 border border-1 border-danger">
                                                                                                                {" "}
                                                                                                                Txn:
                                                                                                                Failed{" "}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    {data?.transactionStatus ===
                                                                                                        "3" && (
                                                                                                            <span className="badge badge-soft-info fs-12 border border-1 border-info">
                                                                                                                {" "}
                                                                                                                Txn:
                                                                                                                Refund{" "}
                                                                                                            </span>
                                                                                                        )}
                                                                                                </>
                                                                                            ) : (
                                                                                                BlankData
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Status"
                                                                            ) && (
                                                                                    <td>
                                                                                        {data?.status ? (
                                                                                             <>
                                                                                             {data?.status ===
                                                                                               "0" && (
                                                                                                 <div className="px-3 fs-13 badge border border-primary text-primary bg-soft-primary p-2 pe-none">
                                                                                                   <span>
                                                                                                     {" "}
                                                                                                     Incomplete{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}
                                                                                             {data?.status ===
                                                                                               "1" && (
                                                                                                 <div className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                                                                                   <span>
                                                                                                     {" "}
                                                                                                     Pending{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                                             {data?.status ===
                                                                                               "2" && (
                                                                                                 <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                                                                                   <span className="">
                                                                                                     {" "}
                                                                                                     Inprogress{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                                             {data?.status ===
                                                                                               "3" && (
                                                                                                 <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                                                                                   <span>
                                                                                                     {" "}
                                                                                                     Checked
                                                                                                     &
                                                                                                     Verified{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                 
                                                                                             {data?.status ===
                                                                                               "4" && (
                                                                                                 <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                                                                                   <span className="">
                                                                                                     {" "}
                                                                                                     Auto Pay{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                                             {data?.status ===
                                                                                               "5" && (
                                                                                                 <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                                                                                   <span className="">
                                                                                                     {" "}
                                                                                                     Approved{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                                             {data?.status ===
                                                                                               "6" && (
                                                                                                 <div className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                                                                                   <span className="">
                                                                                                     {" "}
                                                                                                     Rejected{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}
                                                                                             {data?.status ===
                                                                                               "7" && (
                                                                                                 <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                                                                                   <span className="">
                                                                                                     {" "}
                                                                                                     Shipped{" "}
                                                                                                   </span>
                                                                                                 </div>
                                                                                               )}{" "}
                                                                                           </>
                                                                                        ) : (
                                                                                            BlankData
                                                                                        )}
                                                                                    </td>
                                                                                )}
                                                                            {assignPermission &&
                                                                                columns.includes(
                                                                                    "Assign To"
                                                                                ) && (
                                                                                    <td>
                                                                                        <Select
                                                                                            value={
                                                                                                selectedOption
                                                                                            }
                                                                                            onChange={
                                                                                                handleChange
                                                                                            }
                                                                                            options={
                                                                                                options
                                                                                            }
                                                                                            isDisabled={
                                                                                                data?.transactionStatus !==
                                                                                                "1" ||
                                                                                                data?.status ===
                                                                                                "4" ||
                                                                                                data?.status ===
                                                                                                "5"
                                                                                            }
                                                                                            styles={{
                                                                                                control:
                                                                                                    (
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
                                                                                            menuPosition="fixed"
                                                                                            
                                                                                        />
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Action"
                                                                            ) && (
                                                                                    <td className="status text-end">
                                                                                        {data?.status !==
                                                                                            "4" &&
                                                                                            data?.status !==
                                                                                            "6" ? (
                                                                                            <span>
                                                                                                {data?.userId &&
                                                                                                    (assignPermission ||
                                                                                                        data?.userId ===
                                                                                                        userData?.id) && (
                                                                                                        <button
                                                                                                            className="btn btn-primary"
                                                                                                            title="Update Status"
                                                                                                            onClick={() => {
                                                                                                                setShowUpdateModal(
                                                                                                                    true
                                                                                                                );
                                                                                                                setApplicationData(
                                                                                                                    data
                                                                                                                );
                                                                                                                formik?.setFieldValue(
                                                                                                                    "applicationId",
                                                                                                                    data?.id
                                                                                                                );
                                                                                                                formik?.setFieldValue(
                                                                                                                    "customerId",
                                                                                                                    data?.customerId
                                                                                                                );
                                                                                                                formik?.setFieldValue(
                                                                                                                    "customerEmail",
                                                                                                                    data
                                                                                                                        ?.customerInfo
                                                                                                                        ?.email
                                                                                                                );
                                                                                                                formik?.setFieldValue(
                                                                                                                    "serviceName",
                                                                                                                    data?.serviceName
                                                                                                                );
                                                                                                            }}
                                                                                                        >
                                                                                                            {" "}
                                                                                                            Update
                                                                                                            Status
                                                                                                        </button>
                                                                                                    )}
                                                                                            </span>
                                                                                        ) : null}

                                                                                        <span
                                                                                            onClick={() =>
                                                                                                handleApplicationDetailedView(
                                                                                                    data
                                                                                                )
                                                                                            }
                                                                                            className="py-2 px-3 cursor-pointer"
                                                                                            title="View Detail"
                                                                                        >
                                                                                            <Eye
                                                                                                width="18"
                                                                                                height="18"
                                                                                                className="text-primary "
                                                                                            />
                                                                                        </span>
                                                                                    </td>
                                                                                )}
                                                                        </tr>
                                                                    );
                                                                }
                                                            )}
                                                    </tbody>
                                                    {((open &&
                                                        !isDashBoard &&
                                                        userData?.isCoreTeam ===
                                                        "1") ||
                                                        (isLoading &&
                                                            !isDashBoard)) && (
                                                            <tbody className="placeholder-glow">
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                                <tr className="">
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="flex-shrink-0 me-2">
                                                                                <div
                                                                                    alt=""
                                                                                    className="avatar-xs placeholder rounded-circle "
                                                                                >
                                                                                    {" "}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                {" "}
                                                                                <small className=" placeholder d-block p-0 w-50 rounded-3"></small>
                                                                                <br />
                                                                                <strong className="d-block placeholder w-100 rounded-3"></strong>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="placeholder d-block bg-primary rounded-3"></span>{" "}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        )}
                                                    {isDashBoard &&
                                                        isLoading && (
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            "12"
                                                                        }
                                                                        className="text-center"
                                                                    >
                                                                        <LoaderSpin />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        )}
                                                </table>
                                                <div
                                                    className="noresult"
                                                    style={{ display: "none" }}
                                                >
                                                    <div className="text-center">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#25a0e2,secondary:#00bd9d"
                                                            style={{
                                                                width: "75px",
                                                                height: "75px",
                                                            }}
                                                        ></lord-icon>
                                                        <h5 className="mt-2">
                                                            {" "}
                                                            Sorry! No Result
                                                            Found{" "}
                                                        </h5>
                                                        <p className="text-muted mb-0">
                                                            {" "}
                                                            We've searched more
                                                            than 200k+ tasks We
                                                            did not find any
                                                            tasks for you
                                                            search.{" "}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isDashBoard && (
                                                    <Pagination
                                                        totalCount={totalCount}
                                                        perPageSize={
                                                            perPageSize
                                                        }
                                                        currentPage={
                                                            currentPage
                                                        }
                                                        totalPages={totalPages}
                                                        handleSelectPageSize={
                                                            handleSelectPageSize
                                                        }
                                                        handlePageChange={
                                                            handlePageChange
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <UpdateStatusModal
                    formik={formik}
                    handleUpdateStatusApplication={
                        handleUpdateStatusApplication
                    }
                    showUpdateModal={showUpdateModal}
                    handleToggleUpdateShow={handleToggleUpdateShow}
                    handleClose={handleClose}
                    isUpdating={isUpdating}
                    applicationData={applicationData}
                />
                <TransactionStatusModal
                    show={show}
                    setShow={setShow}
                    handleToggle={handleToggle}
                    transactionDetails={transactionDetails}
                    isModalLoading ={isModalLoading}
                />
                {userData?.isCoreTeam === "1" && (
                    <DepartmentServices
                        allServices={serviceList}
                        open={open}
                        setOpen={setOpen}
                        setSelectedModalService={setSelectedModalService}
                        selectedService={selectedService}
                        handleSelect={handleModalSelect}
                        selectedServices={selectedServices}
                        setSelectedServices={setSelectedServices}
                    />
                )}
            </div>

            {!isDashBoard && <ScrollToTop />}
        </>
    );
};
export default ActiveApplications;
