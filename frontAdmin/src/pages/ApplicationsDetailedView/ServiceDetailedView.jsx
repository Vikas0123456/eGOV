import React, { useEffect, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { TabContent, TabPane } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Noimage from "../../../src/assets/images/NoImage.jpg";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { formatDateLog } from "../../common/CommonFunctions/logdate";
import { Card, CardBody, CardHeader, Table, Button } from "react-bootstrap";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import {
    calculateRemainingTimeTAT,
    formatRelativeTime,
    hasAssignPermission,
} from "../../common/CommonFunctions/common";
import UpdateStatusModal from "../../common/modals/UpdateStatusModal/UpdateStatusModal";
import CreateNewTicketModal from "../../common/modals/CreateNewTicketModal/CreateNewTicketModal";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import "bootstrap/dist/css/bootstrap.min.css";
import UserDetailModalView from "./ApplicationCommonModal/UserDetailview";
import SimpleBar from "simplebar-react";
import { Eye } from "feather-icons-react/build/IconComponents";
import AllApplicationTab from "./CommonApplication/AllApplication";
import TicketsTab from "./CommonApplication/Tickets";
import PaymentHistoryTab from "./CommonApplication/PaymentHistory";
import DocumentsTab from "./CommonApplication/Documents";
import ActivityTab from "./CommonApplication/ActivityTab";
import GenrateCertificate from "./CommonApplication/GenrateCertificate";
import Meeting from "./CommonApplication/Meeting";
import ApplicationFormDetails from "./CommonApplication/ApplicationFormDetails";
import useAxios from "../../utils/hook/useAxios";
import { IoChevronBack } from "react-icons/io5";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import loaderGIF from "../../assets/images/loader.gif";
const stripePromise = loadStripe(process.env.REACT_APP_PUBLISHABLE_KEY);

export function stringAvatar(citizen) {
    return `${citizen?.firstName?.charAt(0).toUpperCase()}${citizen?.lastName
        ?.charAt(0)
        .toUpperCase()}`;
}
function formatDateString(isoDateString) {
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
}
const convertMimeTypes = (mimeTypes) => {
    return mimeTypes
        ? mimeTypes
            .split(",")
            .map((mime) => mime.split("/")[1])
            .join(", ")
        : "";
};
const ServiceDetailed = () => {
    const axiosInstance = useAxios()
    const stripe = useStripe();
    const location = useLocation();
    const navigate = useNavigate();
    const [citizenData, setCitizenData] = useState(null);
    const applicationDataId = citizenData?.applicationId;
    const applicationId = location?.state?.id;
    const applicationSlug = location?.state?.serviceName?.slug;
    const applicationServiceName = location?.state?.serviceName?.serviceName;
    const priority = location?.state?.serviceName?.priority;
    const getIpInfo = useSelector((state) => state?.Layout?.ipData);
    const ipAddress = getIpInfo?.ip;
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const [applicationData, setApplicationData] = useState();
    const [userDetailsView, setUserDetailsView] = useState(false);
    const toggleUserDetailsModel = () => {
        setUserDetailsView(!userDetailsView);
    };
    const userData = userDecryptData?.data;
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const RolesPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "applications"
        );
    const assignPermission = RolesPermissions
        ? hasAssignPermission(RolesPermissions)
        : false;
    const [customActiveTab, setcustomActiveTab] = useState("1");
    const [comment, setComment] = useState("");
    const [reqComment, setReqComment] = useState("");
    const [isloadingMessage, setIsLoadingMessage] = useState(false);
    const [isloadingRefress, setIsLoadingRefress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isloadingReqDoc, setIsLoadingReqDoc] = useState(false);
    const [docList, setDocList] = useState([]);
    const [allDocumentList, setALLDocumentList] = useState([]);
    const [selectedReqDoc, setSelectedReqDoc] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [logList, setLoglist] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const userId = userData?.id;
    const [selectStartDate, setSelectStartDate] = useState("");
    const [selectEndDate, setSelectEndDate] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [durationOfLog, setDurationOfLog] = useState("all");
    const [durationOfPayment, setDurationOfPayment] = useState("all");
    const [transactionDeatils, setTransactionDetails] = useState();
    const [customerTransactionList, setCustomerTransactionList] = useState([]);
    const [countryList, setCountryList] = useState([]);
    const [allstateList, setallStateList] = useState([]);
    const [dropdownLists, setDropdownLists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryForApplication, setSearchQueryForApplication] =
        useState("");
    const [ticketSearchQuery, setTicketSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [data, setData] = useState([]);

    const [customerServicesList, setCustomerServicesList] = useState([]);
    const [customerDepartment, setCustomerDepartmentList] = useState([]);
    const [customerDocumentPath, setCustomerDocumentPath] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);

    //ticket
    const [currentPageForTicket, setCurrentPageForTicket] = useState(1);
    const [totalCountForTicket, setTotalCountForTicket] = useState(0);
    const [perPageSizeForTicket, setPerPageSizeForTicket] = useState(10);
    const totalPagesForTicket = Math.ceil(
        totalCountForTicket / perPageSizeForTicket
    );
    const [paylaterLoading, setPaylaterLoading] = useState(false)

    const [ticketStartDate, setTicketStartDate] = useState("");
    const [ticketEndDate, setTicketEndDate] = useState("");
    const [selectedApplicationStartDate, setSelectedApplicationStartDate] =
        useState("");
    const [selectedApplicationEndDate, setSelectedApplicationEndDate] =
        useState("");
    const [durationOfTickets, setDurationOfTickets] = useState("all");

    //All application-
    const [currentPageForApplication, setCurrentPageForApplication] =
        useState(1);
    const [totalCountForApplication, setTotalCountForApplication] = useState(0);
    const [perPageSizeForApplication, setPerPageSizeForApplication] =
        useState(10);
    const totalPagesForApplication = Math.ceil(
        totalCountForApplication / perPageSizeForApplication
    );
    const [durationOfApplication, setDurationOfApplication] = useState("all");

    const [applicationStartDate, setApplicationStartDate] = useState("");
    const [applicationEndDate, setApplicationEndDate] = useState("");
    const [selectedTicketStartDate, setSelectedTicketStartDate] = useState("");
    const [selectedTicketEndDate, setSelectedTicketEndDate] = useState("");

    const [transactionStatusFilter, setTransactionStatusFilter] = useState("");
    const transactionStatuses = ["Success", "Failed", "Pending", "Refund"];
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [applicationList, setApplicationList] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("All");

    //loader states
    const [isTicketLoading, setIsTicketLoading] = useState(false);
    const [isApplicationListLoading, setIsApplicationListLoading] = useState(false);
    const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(false);
    const [isApplicationTransactionLoading, setIsApplicationTransactionLoading] = useState(false);
    const [isPdfDownloadLoading, setIsPdfDownloadLoading] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const applicationStatus = citizenData?.status;

    let activityDate = logList.sort((a, b) => {
        const dateA = new Date(a?.createdDate);
        const dateB = new Date(b?.createdDate);
        return dateB - dateA;
    })[0];

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleStatusClick = (status) => {
        switch (status) {
            case "Pending":
                setTransactionStatusFilter("0");
                break;
            case "Success":
                setTransactionStatusFilter("1");
                break;
            case "Failed":
                setTransactionStatusFilter("2");
                break;
            case "Refund":
                setTransactionStatusFilter("3");
                break;
            default:
                setTransactionStatusFilter("");
                break;
        } // Update transaction status filter
        setIsDropdownOpen(false); // Close the dropdown
    };

    const handleSelectPageSizeForApplication = (e) => {
        setCurrentPageForApplication(1);
        setPerPageSizeForApplication(parseInt(e.target.value));
    };

    const handlePageChangeForApplication = (page) => {
        if (page < 1) {
            page = 1;
        } else if (page > totalPagesForApplication) {
            page = totalPagesForApplication;
        }
        setCurrentPageForApplication(page);

        if (page === totalPagesForApplication) {
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

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (ticketSearchQuery && citizenData?.customerId) {
                fetchSupportTicketsList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        ticketSearchQuery,
        selectedStatus,
        currentPageForTicket,
        perPageSizeForTicket,
        selectedTicketStartDate,
        selectedTicketEndDate,
        citizenData?.customerId,
        durationOfTickets,
    ]);

    useEffect(() => {
        if (!ticketSearchQuery && citizenData?.customerId) {
            fetchSupportTicketsList();
        }
    }, [
        ticketSearchQuery,
        selectedStatus,
        currentPageForTicket,
        perPageSizeForTicket,
        selectedTicketStartDate,
        selectedTicketEndDate,
        citizenData?.customerId,
        durationOfTickets,
    ]);


    const fetchSupportTicketsList = async () => {
        setIsTicketLoading(true);
        try {
            const customerDataId = citizenData?.customerId;

            const response = await axiosInstance.post(
                `ticketService/ticket/view`,
                {
                    page: currentPageForTicket,
                    perPage: perPageSizeForTicket,
                    status: selectedStatus === "All" ? null : selectedStatus,
                    customerId: customerDataId,
                    dateRange: {
                        startDate: selectedTicketStartDate,
                        endDate: selectedTicketEndDate,
                    },
                    duration: durationOfTickets,
                    searchFilter: ticketSearchQuery,
                    slug: citizenData?.serviceData?.slug
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCountForTicket(count);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsTicketLoading(false);
        }
    };

    function createTransactionDetailsFailed(
        result,
        newStatus,
    ) {
        return axiosInstance.post(
            "paymentService/customerDetails/create/transactionDetails",
            {
                customerId: JSON.parse(citizenData?.customerId),
                applicationId: citizenData?.applicationId,
                serviceSlug: citizenData?.serviceData?.slug,
                departmentId: citizenData?.departmentId,
                transactionId:
                    newStatus === "2" ? result?.paymentIntent?.id : null,
                transactionAmount: citizenData?.serviceData?.price,
                transactionStatus: "2",
                ipAddress: ipAddress
            }
        );
    }

    function createTransactionDetailsSuccess(
        result,
        allApplicationPriceData
    ) {
        return axiosInstance.post(
            "paymentService/customerDetails/create/transactionDetails",
            {
                customerId: JSON.parse(citizenData?.customerId),
                applicationId: citizenData?.applicationId,
                serviceSlug: citizenData?.serviceData?.slug,
                departmentId: citizenData?.departmentId,
                transactionId: result?.paymentIntent?.id,
                transactionAmount: citizenData?.serviceData?.price,
                transactionStatus: "1",
                allApplicationPriceData: allApplicationPriceData,
                ipAddress: ipAddress
            }
        );
    }

    function createServiceUpdate(newStatus, description, result) {
        return axiosInstance.put(`businessLicense/application/updateTransactionStatus`, {

            applicationId: citizenData?.id,
            transactionStatus: newStatus,
            description: description,
            transactionId: result ? result?.paymentIntent?.id : null,
            userId: userData?.id,
            serviceData: {
                slug: citizenData?.serviceData?.slug,
                version: citizenData?.serviceData?.version,
                price: citizenData?.serviceData?.price,
                serviceName: citizenData?.serviceName,
                departmentName: citizenData?.departmentName,
                departmentId: citizenData?.departmentId
            },
            slug: citizenData?.serviceData?.slug
        });
    }
    const handleFailure = async (error) => {
        Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: error ? `${error.message}` : "Oops, payment has been failed. You can reject the application.",
        });

        const newStatus = "2";
        const description = `Your application charge later payment has been failed.`
        try {
            await Promise.allSettled([
                createServiceUpdate(newStatus, description, null),
                createTransactionDetailsFailed(error, newStatus),
            ]);
            await getLogList()
            await gettransactionDetailsForPaymentDetails(citizenData?.applicationId)
            await getTransactionDetailsForList(citizenData?.applicationId)
            await getApplicationData()
            setPaylaterLoading(false)

        } catch (err) {
            console.error("Error processing payment failure:", err);
        }
    };

    const handleSuccess = async (result) => {
        const newStatus = "1";
        const description = `Your application charge later payment has been completed successfully.`
        const allApplicationPriceData = [
            {
                serviceName: citizenData?.serviceName,
                amount: citizenData?.price,
                applicationId: citizenData?.applicationId,
            },
        ];

        try {
            await Promise.allSettled([
                createTransactionDetailsSuccess(result, allApplicationPriceData),
                createServiceUpdate(newStatus, description, result),
            ])
            return true
        } catch (error) {
            console.error("Error processing payment success:", error);
            await handleFailure(error);
            return false
        }
    };

    const payNow = async () => {
        try {
            const decryptToken = decrypt({ data: citizenData?.paymentToken })
            setPaylaterLoading(true)
            if (decryptToken?.id) {
                const response = await axiosInstance.post("paymentService/customerDetails/payAmount/payment-cards", {
                    customerId: decryptToken?.stripeCustomerId,
                    paymentMethodId: decryptToken?.id,
                    amount: decryptToken?.price,
                    description: `Payment for ${decryptToken?.serviceName}`,
                });
                if (response.status == 203) {
                    await handleFailure(null);
                }

                if (response.data.requiresAction) {
                    setLoading(true);
                    const result = await stripe.confirmCardPayment(response.data.intent.client_secret);
                    setLoading(false);
                    if (result.error) {
                        await handleFailure(result.error);
                        setPaylaterLoading(false)

                    } else if (result.paymentIntent.status === "succeeded") {
                        const check = await handleSuccess(result);
                        if (check) {
                            await getLogList()
                            await gettransactionDetailsForPaymentDetails(citizenData?.applicationId)
                            await getTransactionDetailsForList(citizenData?.applicationId)
                            await getApplicationData()
                        }
                        setPaylaterLoading(false)

                    }
                }
            }

        } catch (error) {
            setPaylaterLoading(false)
            console.error(error)
        }

    }
    // const listOfSearch = async () => {
    //     setIsTicketLoading(true);
    //     try {
    //         const customerDataId = citizenData?.customerId;
    //         const response = await axiosInstance.post(
    //             `ticketService/ticket/view`,
    //             {
    //                 page: currentPageForTicket,
    //                 perPage: perPageSizeForTicket,
    //                 searchFilter: ticketSearchQuery,
    //                 status: selectedStatus === "All" ? null : selectedStatus,
    //                 customerId: customerDataId,
    //                 dateRange: {
    //                     startDate: selectedTicketStartDate,
    //                     endDate: selectedTicketEndDate,
    //                 },
    //                 duration: durationOfTickets,
    //             }
    //         );

    //         if (response?.data) {
    //             const { rows, count } = response?.data?.data;
    //             setData(rows);
    //             setTotalCountForTicket(count);
    //         }
    //     } catch (error) {
    //         console.error(error.message);
    //     } finally {
    //         setIsTicketLoading(false);
    //     }
    // };

    const handleStatusFilter = (e) => {
        setCurrentPageForTicket(1);
        const selectedStatus = e.toString();
        setSelectedStatus(selectedStatus);
        setPerPageSizeForTicket(10);
    };

    const handleSelectPageSizeForTicket = (e) => {
        setCurrentPageForTicket(1);
        setPerPageSizeForTicket(parseInt(e.target.value));
    };

    const handlePageChangeForTicket = (page) => {
        if (page < 1) {
            page = 1;
        } else if (page > totalPagesForTicket) {
            page = totalPagesForTicket;
        }
        setCurrentPageForTicket(page);

        if (page === totalPagesForTicket) {
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

    const getApplicationList = async () => {
        setIsApplicationListLoading(true);
        try {
            const customerDataId = citizenData?.customerId;
            const response = await axiosInstance.post(
                `businessLicense/application/adminApplicationList`,
                {
                    page: currentPageForApplication,
                    perPage: perPageSizeForApplication,
                    customerId: customerDataId,
                    searchFilter: searchQueryForApplication,
                    dateRange: {
                        startDate: selectedApplicationStartDate,
                        endDate: selectedApplicationEndDate,
                    },
                    duration: durationOfApplication,
                    serviceSlug: [applicationSlug],
                }
            );
            if (response) {
                const { rows, count } = response?.data?.data;
                const filteredApplications = rows?.filter((application) => application.applicationId !== citizenData?.applicationId);
                setApplicationList(filteredApplications);
                // setApplicationList(rows);
                setTotalCountForApplication(count);
                setIsApplicationListLoading(false);
            }
        } catch (error) {
            setIsApplicationListLoading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (!searchQueryForApplication && citizenData?.customerId) {
            getApplicationList();
        }
        // if (citizenData?.customerId) {
        //   getApplicationList();
        // }
    }, [
        citizenData?.customerId,
        citizenData?.applicationId,
        perPageSizeForApplication,
        currentPageForApplication,
        searchQueryForApplication,
        selectedApplicationStartDate,
        selectedApplicationEndDate,
        durationOfApplication,
    ]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQueryForApplication) {
                getApplicationList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        citizenData,
        currentPageForApplication,
        perPageSizeForApplication,
        searchQueryForApplication,
        selectedApplicationStartDate,
        selectedApplicationEndDate,
        durationOfApplication,
    ]);

    function onChangeHandlerTickets(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectedTicketStartDate(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectedTicketEndDate(formattedendDate);
        }
        setSearchFilter("");
        setTicketStartDate(value[0]);
        setTicketEndDate(value[1]);
    }

    function onChangeHandlerApplications(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectedApplicationStartDate(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectedApplicationEndDate(formattedendDate);
        }
        setSearchFilter("");
        setApplicationStartDate(value[0]);
        setApplicationEndDate(value[1]);
    }

    const handleInputSearch = (e) => {
        setCurrentPageForApplication(1);
        setSearchQueryForApplication(e.target.value);
    };

    const listOptions = allDocumentList.map((documentId) => ({
        value: documentId.slug,
        label: documentId.documentName,
        docType: documentId.documentFileType,
    }));

    const handleSelectChange = (selectedOptions) => {
        setSelectedReqDoc(selectedOptions);
        const selectedDocIds = selectedOptions.map((option) => option.value);
    };
    const formatFileSize = (bytes) => {
        const kb = 1024;
        const mb = kb * 1024;

        if (bytes >= mb) {
            return (bytes / mb).toFixed(1) + " MB";
        } else {
            return Math.round(bytes / kb) + " KB";
        }
    };

    const handleSearch = (e) => {
        setSearchFilter(e.target.value);
        setSelectStartDate("");
        setSelectEndDate("");
        setDateStart("");
        setDateEnd("");
        setDurationOfLog("all");
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
        setSearchFilter("");
        setDurationOfLog("all");
        setDateStart(value[0]);
        setDateEnd(value[1]);
    }

    const resetFilter = () => {
        setSearchFilter("");
        setSelectStartDate("");
        setSelectEndDate("");
        setDateStart("");
        setDateEnd("");
        setDurationOfLog("all");
    };

    const handleInputSearchBox = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
        setDurationOfPayment("all");
    };

    function onChangeHandlerPayment(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectedStartDate(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectedEndDate(formattedendDate);
        }
        setSearchFilter("");
        setDurationOfPayment("all");
        setStartDate(value[0]);
        setEndDate(value[1]);
    }

    const resetFilterForPaymentInvoice = () => {
        setSearchQuery("");
        setDurationOfPayment("all");
        setTransactionStatusFilter("");
        setSelectedStartDate("");
        setSelectedEndDate("");
        setStartDate("");
        setEndDate("");
        setPerPageSize(10)
        setCurrentPage(1)
    };

    const handleToggleUpdateShow = () => {
        setShowUpdateModal(!showUpdateModal);
    };
    const toggleCustom = (tab) => {
        if (customActiveTab !== tab) {
            setcustomActiveTab(tab);
        }
        if (customActiveTab === "4") {
            setShowValidation(false);
        }
    };

    const getLogList = async () => {
        try {
            if (applicationId) {
                setIsLoadingRefress(true);
                const response = await axiosInstance.post(
                    `businessLicense/application/allApplictionLogList`,
                    {
                        applicationId: applicationId,
                        searchFilter: searchFilter,
                        dateRange: {
                            startDate: selectStartDate,
                            endDate: selectEndDate,
                        },
                        duration: durationOfLog,
                        slug: applicationSlug,
                    }
                );
                if (response) {
                    const { count, rows } = response?.data?.data;
                    setLoglist(rows);
                    setIsLoadingRefress(false);
                } else {
                    setIsLoadingRefress(false);
                }
            }
        } catch (error) {
            setIsLoadingRefress(false);
            console.error(error.message);
        }
    };

    const gettransactionDetailsForPaymentDetails = async (
        applicationId
    ) => {
        try {
            setIsApplicationTransactionLoading(true);
            if (applicationId) {
                const response = await axiosInstance.post(
                    `paymentService/customerDetails/gettransactionDetails`,
                    {
                        applicationId: applicationId,
                    }
                );
                if (response && response.data && response.data.data) {
                    const { count, rows } = response.data.data;
                    setTransactionDetails(rows?.[0]?.transaction);
                    setIsApplicationTransactionLoading(false);
                }
            }
        } catch (error) {
            setIsApplicationTransactionLoading(false);
            console.error("Error fetching transaction details:", error.message);
        }
    };

    useEffect(() => {
        if (citizenData?.applicationId) {
            gettransactionDetailsForPaymentDetails(citizenData?.applicationId);
        }
    }, [citizenData?.applicationId]);

    const getTransactionDetailsForList = async (applicationId) => {
        try {
            setIsPaymentHistoryLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/gettransactionDetails`,
                {
                    applicationId: applicationId,
                    page: currentPage, // Send page parameter to backend
                    limit: perPageSize,
                    transactionStatus: transactionStatusFilter,
                    searchQuery: searchQuery,
                    startDate: selectedStartDate || undefined, // Send startDate from state
                    endDate: selectedEndDate || undefined, // Send endDate from state
                    duration: durationOfPayment,
                }
            );
            if (response && response.data && response.data.data) {
                const { count, rows } = response.data.data;
                setCustomerTransactionList(rows);
                setTotalCount(count);
                setIsPaymentHistoryLoading(false);
            }
        } catch (error) {
            setIsPaymentHistoryLoading(false);
            console.error("Error fetching transaction details:", error.message);
        }
    };
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery && citizenData?.customerId) {
                setCurrentPage(1);
                getTransactionDetailsForList(
                    citizenData?.applicationId
                );
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [
        citizenData?.customerId,
        transactionStatusFilter,
        selectedStartDate,
        selectedEndDate,
        searchQuery,
        durationOfPayment,
        perPageSize,
        currentPage
    ]);
    useEffect(() => {
        if (!searchQuery && citizenData?.customerId) {
            getTransactionDetailsForList(
                citizenData?.applicationId
            );
        }
    }, [
        citizenData?.customerId,
        transactionStatusFilter,
        selectedStartDate,
        selectedEndDate,
        searchQuery,
        durationOfPayment,
        perPageSize,
        currentPage
    ]);

    const getCountriesList = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/country/list`,
                {}
            );
            if (response) {
                const { rows, count } = response?.data?.data;
                setCountryList(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const getAllstate = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/country/state/list`,
                {}
            );
            if (response) {
                const { rows, count } = response?.data?.data;
                setallStateList(rows);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const getDropDownLists = async () => {
        await axiosInstance
            .get(`businessLicense/application/dropdownLists`)
            .then((res) => {
                const { data } = res.data;
                setDropdownLists(data);
            })
            .catch((error) => {
                console.log("error", error);
            });
    };

    const getStateName = (stateId) => {
        if (allstateList) {
            const stateNameObj = allstateList.find(
                (state) => state.id == stateId
            );
            return stateNameObj ? stateNameObj.name : null;
        }
        return null;
    };
    const getCountryName = (countryId) => {
        if (countryList) {
            const countryNameObj = countryList.find(
                (country) => country.id == countryId
            );
            return countryNameObj ? countryNameObj.name : null;
        }
        return null;
    };

    const getDoclist = async () => {
        try {
            if (applicationId) {
                const response = await axiosInstance.post(
                    `businessLicense/application/reqDocList`,
                    {
                        applicationId: applicationId,
                    }
                );
                if (response) {
                    const { count, rows } = response?.data?.data;
                    setDocList(rows);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const getAllDocumentlist = async () => {
        try {
            if (applicationId) {
                const response = await axiosInstance.post(
                    `documentService/alldocument/list`
                );
                if (response) {
                    const dataList = response?.data?.data;
                    setALLDocumentList(dataList);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    useEffect(() => {
        getDoclist();
        getAllDocumentlist();
        getDropDownLists();
        getAllstate();
        getCountriesList();
    }, []);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchFilter && citizenData?.applicationId) {
                getLogList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [searchFilter, selectStartDate, selectEndDate, durationOfLog, citizenData?.applicationId]);

    useEffect(() => {
        if (!searchFilter && citizenData?.applicationId) {
            getLogList();
        }
    }, [searchFilter, selectStartDate, selectEndDate, durationOfLog, citizenData?.applicationId]);

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value));
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

    const findApplicationForDocUpdate = async (serviceSlug, applicationId, documentInfo) => {
        try {
            const response = await axiosInstance.post(
                `businessLicense/application/findApplicationForDocUpdate`,
                {
                    applicationId: applicationId,
                    documentSlug: serviceSlug,
                }
            );

            if (response) {
                const { rows } = response?.data?.data || {};
                if (rows && rows.length > 0) {
                    await Promise.all(
                        rows.map(async (data) => {

                            if (serviceSlug) {
                                try {

                                    const updateResponse = await axiosInstance.put(
                                        `businessLicense/application/update/reqDoc`,
                                        {
                                            documentSlug: serviceSlug,
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
        const data = citizenData?.applicationData?.requiredDocumentList?.data
        const documentsWithNullId = data?.length > 0 && data
            ?.filter(doc => doc?.uploadedDocumentId === null)
            ?.map(doc => doc?.documentName);

        const updateStatus = async () => {
            try {
                let fileId = null;
                setIsUpdating(true);
                if (values?.file) {
                    const formData = new FormData();
                    formData.append(
                        "viewDocumentName",
                        "Application Status attachedDoc"
                    );
                    formData.append("documentFile", values?.file);
                    formData.append("userId", userId);
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


                const response = await axiosInstance.put(
                    `businessLicense/application/updateStatus`,
                    {
                        applicationId: values?.applicationId,
                        status: values?.status,
                        documentId: fileId,
                        description: values?.description,
                        userId: userId,
                        slug: applicationSlug,
                        customerEmail: citizenData?.requestedByCustomerInfo?.email,
                        serviceData: {
                            slug: applicationSlug,
                            serviceName: citizenData?.serviceName,
                            departmentId: citizenData?.departmentId,
                            departmentLogo: citizenData?.departmentLogo,
                            departmentName: citizenData?.departmentName,
                            certificateTemplate: citizenData?.certificateTemplate,
                            pdfGenerator: citizenData?.pdfGenerator,
                            certificateExpiryTime: citizenData?.certificateExpiryTime,
                            expiryTime: citizenData?.expiryTime || null,
                            agentDetails: citizenData?.applicationAssignedToUser || null
                        }
                    }
                );
                if (response.data) {
                    setCitizenData(prevData => ({
                        ...prevData,
                        status: response?.data?.data?.status,
                        issuedDocumentId: response?.data?.data?.issuedDocumentData ? response?.data?.data?.issuedDocumentData : null
                    }));

                    setLoglist(prevLogs => [
                        ...prevLogs,
                        response.data?.data?.log
                    ]);
                    const documentData = response?.data?.data?.issuedDocumentData
                    if (documentData) {
                        await findApplicationForDocUpdate(applicationSlug, citizenData?.applicationId, documentData)
                    }
                    toast.success("application status update successfully");
                    formik.resetForm();
                    setShowUpdateModal(false);
                    setIsUpdating(false);
                } else {
                    setIsUpdating(false);
                }
            } catch (error) {
                setLoading(false)
                console.error(error.message);
            }

        }

        if (documentsWithNullId?.length > 0 && values?.status === "4") {
            Swal.fire({
                text: `${documentsWithNullId?.join(", ")} are still pending?`,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Approve, anyway"
            }).then(async (result) => {
                if (result?.isConfirmed) {
                    updateStatus()
                }
            }
            )
        } else {
            updateStatus()
        }
    };

    const formik = useFormik({
        initialValues: {
            applicationId: "",
            status: "",
            file: "",
            description: "",
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

    const handleSubmitCommentLog = async () => {
        try {
            if (comment) {
                setIsLoadingMessage(true);
                const response = await axiosInstance.post(
                    `businessLicense/application/log/create`,
                    {
                        applicationId: applicationId,
                        customerId: JSON.parse(citizenData?.customerId),
                        userId: JSON.parse(userId),
                        description: comment,
                        logBy: "0",
                        oldStatus: citizenData?.status,
                        newStatus: citizenData?.status,
                        slug: applicationSlug,
                    }
                );
                if (response) {
                    getLogList();
                    setComment("");
                    setIsLoadingMessage(false);
                } else {
                    setIsLoadingMessage(false);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    const handleRequestDocumentLog = async () => {
        try {
            if (reqComment && selectedReqDoc) {
                setIsLoadingRefress(true);
                const response = await axiosInstance.post(
                    `businessLicense/application/createRequestedDocument`,
                    {
                        applicationId: applicationId,
                        documentData: selectedReqDoc,
                        slug: applicationSlug,
                        logData: {
                            customerId:
                                citizenData?.requestedByCustomerInfo?.id,
                            userId: userId,
                            description: reqComment,
                            oldStatus: citizenData?.status,
                            newStatus: citizenData?.status,
                        },
                    }
                );

                if (response) {
                    getLogList();
                    getApplicationData();
                    setReqComment("");
                    setSelectedReqDoc("");
                    setIsLoadingReqDoc(false);
                } else {
                    setIsLoadingReqDoc(false);
                }
            }
        } catch (error) {
            setIsLoadingReqDoc(false);
            console.error(error.message);
        }
    };
    const handleDownloadDownloadPDF = (url, filename) => {
        setIsPdfDownloadLoading(true);
        const fileExtension = url?.substring(url.lastIndexOf(".") + 1);
        const downloadedFileName = `${filename ? filename : "file"
            }.${fileExtension}`;
        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", downloadedFileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setIsPdfDownloadLoading(false);
            })
            .catch((error) => {
                setIsPdfDownloadLoading(false);
                console.error("Error downloading image:", error)
            });
    };
    const getApplicationData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `businessLicense/application/list`,
                { applicationId: applicationId, slug: applicationSlug }
            );
            if (response) {
                const { rows } = response.data.data;
                let applicationDetails = rows?.[0];
                setCitizenData(applicationDetails);
                // getTransactionDetails(
                //     applicationDetails?.customerId,
                //     applicationDetails?.applicationId
                // );
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };
    useEffect(() => {
        if (applicationId) {
            getApplicationData();
        }
    }, [applicationId]);

    const handleGetDocument = async (documentId, documentName) => {
        try {
            const response = await axiosInstance.post(`documentService/view`, {
                documentId: documentId,
                isShowInDocument: "1",
            });
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                if (rows[0]) {
                    handleDownload(rows[0].documentPath, documentName);
                }
            }
        } catch (error) {
            console.log("Error downloading document");
        }
    };

    const handleDownload = (url, filename) => {
        setIsPdfDownloadLoading(true);
        const fileExtension = url?.substring(url.lastIndexOf(".") + 1);
        const downloadedFileName = `${filename ? filename : "file"
            }.${fileExtension}`;

        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", downloadedFileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                setIsPdfDownloadLoading(false)
            })
            .catch((error) => {
                setIsPdfDownloadLoading(false)
                console.error("Error downloading file:", error)
            });
    };

    const priorityOptions = [
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
    ];

    const statusOptions = [
        { value: "new", label: "New" },
        { value: "pending", label: "Pending" },
        { value: "inProgress", label: "In Progress" },
        { value: "closed", label: "Closed" },
    ];

    const transactionOptions = [
        { value: "", label: "All" },
        { value: "0", label: "Txn: Pending" },
        { value: "1", label: "Txn: Success" },
        { value: "2", label: "Txn: Failed" },
        { value: "3", label: "Txn: Refund" },
    ];

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

        const formattedDate = `${("0" + date.getDate()).slice(
            -2
        )} ${getMonthName(date)}, ${date.getFullYear()}`;

        const hours = date.getHours();
        const formattedTime = `${("0" + (hours % 12 || 12)).slice(-2)}:${(
            "0" + date.getMinutes()
        ).slice(-2)} ${hours >= 12 ? "PM" : "AM"}`;

        return (
            <div>
                <span className="text-nowrap">{formattedDate}</span>
                <small className="d-block fs-11 text-muted">
                    {formattedTime}
                </small>
            </div>
        );
    }

    const handleApplicationDetailedView = async (data) => {
        navigate("/application-detailed-view", {
            state: data,
        });
        setLoglist([]);
        setcustomActiveTab("1");
    };

    const resetApplicationFilters = () => {
        setSearchQueryForApplication("");
        setSelectedApplicationStartDate("");
        setSelectedApplicationEndDate("");
        setApplicationStartDate("");
        setApplicationEndDate("");
        setDurationOfApplication("all");
        setPerPageSizeForApplication(10)
        setCurrentPageForApplication(1)
    };

    const resetTicketFilters = () => {
        setTicketSearchQuery("");
        setSelectedStatus("All");
        setSelectedTicketStartDate("");
        setSelectedTicketEndDate("");
        setTicketStartDate("");
        setTicketEndDate("");
        setDurationOfTickets("all");
        setPerPageSizeForTicket(10);
    };

    const handleInputTicketSearch = (e) => {
        setCurrentPageForTicket(1);
        setTicketSearchQuery(e.target.value);
    };

    const StatusFilterList = [
        {
            value: "All",
            label: "All",
        },
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

    const handleTicketView = (e, ticketDetails) => {
        navigate("/tickets-details", { state: { ticketDetails } });
    };

    const handleBackClick = () => {
        navigate("/applications", { state: { data: location?.state?.backButtonData } });
    };

    document.title = `${applicationServiceName} Application | eGov Solution`;

    return (
        <>
            <Elements stripe={stripePromise}>
                <div id="layout-wrapper">
                    <div className="main-content overflow-hidden trans-detail-content">
                        <div className="page-content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-12">

                                        <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">

                                            <>
                                                <h4 className="mb-0 fw-bold text-black">
                                                    Application Details
                                                </h4>

                                                <div className="d-flex justify-content-end">
                                                    <button type="button"
                                                      
                                                        className="btn back-btn btn btn-primary btn-label btn btn-primary"
                                                        onClick={
                                                            handleBackClick
                                                        }>
                                                           
                                                        <i className=" ri-arrow-left-s-line fs-22 label-icon"></i>
                                                        
                                                       
                                                     
                                                            Back
                                                      
                                                    </button>
                                                </div>
                                            </>

                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="card border-0 shadow-sm">
                                            <div className="bg-white">
                                                <div className="card-body">
                                                    {loading ? (
                                                        <LoaderSpin
                                                            height={"77px"}
                                                        />
                                                    ) : (
                                                        <div className="row">

                                                            <div className="col-lg">
                                                                <div className="row align-items-center">

                                                                    <div className="col-sm-auto">
                                                                        <div className="avatar-sm me-2">
                                                                            <div className="avatar-title bg-white rounded">
                                                                                <img
                                                                                    src={citizenData?.departmentLogoPath || Noimage}
                                                                                    alt=""
                                                                                    className="avatar-sm rounded-circle"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-auto col-12  ps-md-0">
                                                                        <div className=" mb-2 mb-sm-0">
                                                                            <div className="hstack gap-3 flex-wrap mb-1">
                                                                                <small className="text-muted">
                                                                                    Application ID
                                                                                </small>
                                                                            </div>
                                                                            <div>
                                                                                <h6 className="fw-bold mb-0 me-2 text-capitalize">
                                                                                    {citizenData?.applicationId}
                                                                                </h6>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-auto col-12 ">
                                                                        <div className="service-box mb-2 mb-sm-0">
                                                                            <div className="hstack gap-3 flex-wrap mb-1">
                                                                                <small className="text-muted">
                                                                                    Service Name
                                                                                </small>
                                                                            </div>
                                                                            {citizenData?.applicationId &&
                                                                                <h6 className="fw-bold mb-0 me-2 text-capitalize">
                                                                                    {citizenData?.serviceName}
                                                                                </h6>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-auto col-12  me-auto ">
                                                                        <div className="service-box">
                                                                            <div className="hstack gap-3 flex-wrap mb-1">
                                                                                <small className="text-muted">
                                                                                    Service Requested By
                                                                                </small>
                                                                            </div>

                                                                            {citizenData?.applicationId &&
                                                                                <h6 className="fw-bold mb-0 me-2 text-capitalize">
                                                                                    {citizenData?.requestedByCustomerInfo?.firstName}{" "}
                                                                                    {citizenData?.requestedByCustomerInfo?.middleName}{" "}
                                                                                    {citizenData?.requestedByCustomerInfo?.lastName}
                                                                                </h6>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-auto mt-3 mt-md-0 d-flex align-items-center ms-auto">
                                                                <div className="hstack gap-1 flex-wrap align-items-center">
                                                                    {citizenData?.status !==
                                                                        "4" &&
                                                                        citizenData?.status !==
                                                                        "6" ? (
                                                                        <div>
                                                                            {citizenData
                                                                                ?.applicationAssignedToUser
                                                                                ?.id &&
                                                                                (assignPermission ||
                                                                                    citizenData
                                                                                        ?.applicationAssignedToUser
                                                                                        ?.id ===
                                                                                    userData?.id) && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-primary me-2"
                                                                                        onClick={() => {
                                                                                            setShowUpdateModal(
                                                                                                true
                                                                                            );
                                                                                            setApplicationData(
                                                                                                citizenData
                                                                                            );
                                                                                            formik?.setFieldValue(
                                                                                                "applicationId",
                                                                                                citizenData?.id
                                                                                            );
                                                                                        }}>
                                                                                        Update
                                                                                        Status
                                                                                    </button>
                                                                                )}
                                                                        </div>
                                                                    ) : null}

                                                                    <div
                                                                        type="button"
                                                                        className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange"
                                                                        onClick={
                                                                            toggleUserDetailsModel
                                                                        }>
                                                                        <Eye
                                                                            width="20"
                                                                            height="20"
                                                                            className="text-white"
                                                                        />
                                                                    </div>
                                                                    {/* <div className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange d-flex justify-content-center align-items-center" >
                                                                            <i className="ri-mail-send-line fs-18 text-white"></i>
                                                                        </div> */}
                                                                    <a
                                                                        href={`mailto:${citizenData?.requestedByCustomerInfo?.email}`}
                                                                        className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange">
                                                                        <i className="ri-mail-send-line fs-18 text-white"></i>
                                                                    </a>
                                                                    {/* <div className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange d-flex justify-content-center align-items-center" >
                                                                            <i className="ri-phone-line fs-18 text-white"></i>
                                                                        </div> */}
                                                                    <a
                                                                        href={`tel:${citizenData?.requestedByCustomerInfo?.mobileNumber}`}
                                                                        className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange">
                                                                        <i className="ri-phone-line fs-18 text-white"></i>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-xl-8 col-xxl-9">
                                        <div className="row">
                                            <div className="col-xxl-12">
                                                <div className="card border-0 bg-transparent remove-inner-bg mb-0">
                                                    <div className="card-body border-0 p-0">
                                                        <div className="row">
                                                            <div className="col-lg-12">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="scroll-tab mb-3 mb-xl-0">
                                                                        <ul
                                                                            className="nav nav-tabs nav-tabs-customs nav-justified mb-md-4 mb-3"
                                                                            role="tablist"
                                                                            aria-orientation="vertical">
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "1"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="home1"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="activity-home"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "1"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "1"
                                                                                        )
                                                                                    }>
                                                                                    Activity
                                                                                </a>
                                                                            </li>
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "2"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="parents-details-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="parents-details"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "2"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "2"
                                                                                        )
                                                                                    }>
                                                                                    Application
                                                                                    Details
                                                                                </a>
                                                                            </li>
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "3"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="attachments-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="attachments"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "3"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "3"
                                                                                        )
                                                                                    }>
                                                                                    Documents
                                                                                </a>
                                                                            </li>
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "4"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="payment-updated-pop-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="payment-updated-pop"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "4"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "4"
                                                                                        )
                                                                                    }>
                                                                                    Meeting
                                                                                </a>
                                                                            </li>
                                                                            {applicationStatus ===
                                                                                "4" ? (
                                                                                <li>
                                                                                    <a
                                                                                        className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                            "5"
                                                                                            ? "active"
                                                                                            : ""
                                                                                            }`}
                                                                                        id="payment-updated-pop-tab"
                                                                                        data-bs-toggle="pill"
                                                                                        role="tab"
                                                                                        aria-controls="payment-updated-pop"
                                                                                        aria-selected={
                                                                                            customActiveTab ===
                                                                                            "5"
                                                                                        }
                                                                                        onClick={() =>
                                                                                            toggleCustom(
                                                                                                "5"
                                                                                            )
                                                                                        }>
                                                                                        Generate
                                                                                    </a>
                                                                                </li>
                                                                            ) : null}
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "6"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="allapp-updated-pop-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="allapp-updated-pop"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "6"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "6"
                                                                                        )
                                                                                    }>
                                                                                    Tickets
                                                                                </a>
                                                                            </li>

                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "7"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="allapp-updated-pop-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="allapp-updated-pop"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "7"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "7"
                                                                                        )
                                                                                    }>
                                                                                    Payment
                                                                                    History
                                                                                </a>
                                                                            </li>
                                                                            <li>
                                                                                <a
                                                                                    className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 ${customActiveTab ===
                                                                                        "8"
                                                                                        ? "active"
                                                                                        : ""
                                                                                        }`}
                                                                                    id="allapp-updated-pop-tab"
                                                                                    data-bs-toggle="pill"
                                                                                    role="tab"
                                                                                    aria-controls="allapp-updated-pop"
                                                                                    aria-selected={
                                                                                        customActiveTab ===
                                                                                        "8"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        toggleCustom(
                                                                                            "8"
                                                                                        )
                                                                                    }>
                                                                                    All
                                                                                    Applications
                                                                                </a>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-12">
                                                                <TabContent
                                                                    activeTab={
                                                                        customActiveTab
                                                                    }
                                                                    className="text-muted">
                                                                    <TabPane
                                                                        tabId="1"
                                                                        id="home1">
                                                                        <ActivityTab
                                                                            mainApplicationLoading={
                                                                                loading
                                                                            }
                                                                            searchFilter={
                                                                                searchFilter
                                                                            }
                                                                            handleSearch={
                                                                                handleSearch
                                                                            }
                                                                            dateStart={
                                                                                dateStart
                                                                            }
                                                                            dateEnd={
                                                                                dateEnd
                                                                            }
                                                                            onChangeHandler={
                                                                                onChangeHandler
                                                                            }
                                                                            resetFilter={
                                                                                resetFilter
                                                                            }
                                                                            durationOfLog={
                                                                                durationOfLog
                                                                            }
                                                                            setDurationOfLog={
                                                                                setDurationOfLog
                                                                            }
                                                                            comment={
                                                                                comment
                                                                            }
                                                                            setComment={
                                                                                setComment
                                                                            }
                                                                            isloadingMessage={
                                                                                isloadingMessage
                                                                            }
                                                                            handleSubmitCommentLog={
                                                                                handleSubmitCommentLog
                                                                            }
                                                                            isloadingRefress={
                                                                                isloadingRefress
                                                                            }
                                                                            getLogList={
                                                                                getLogList
                                                                            }
                                                                            logList={
                                                                                logList
                                                                            }
                                                                            formatDateLog={
                                                                                formatDateLog
                                                                            }
                                                                            handleDownload={
                                                                                handleDownload
                                                                            }
                                                                            stringAvatar={stringAvatar}
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="2">
                                                                        <ApplicationFormDetails
                                                                            loading={loading}
                                                                            payNow={payNow}
                                                                            isPdfDownloadLoading={
                                                                                isPdfDownloadLoading
                                                                            }
                                                                            citizenData={
                                                                                citizenData
                                                                            }
                                                                            handleDownloadPDF={
                                                                                handleDownload
                                                                            }
                                                                            dropdownLists={
                                                                                dropdownLists
                                                                            }
                                                                            getStateName={
                                                                                getStateName
                                                                            }
                                                                            getCountryName={
                                                                                getCountryName
                                                                            }
                                                                            docList={
                                                                                docList
                                                                            }
                                                                            formatDateString={
                                                                                formatDateString
                                                                            }
                                                                            formatFileSize={
                                                                                formatFileSize
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="3">
                                                                        <DocumentsTab
                                                                            loading={loading}
                                                                            handleGetDocument={
                                                                                handleGetDocument
                                                                            }
                                                                            citizenData={
                                                                                citizenData
                                                                            }
                                                                            assignPermission={
                                                                                assignPermission
                                                                            }
                                                                            listOptions={
                                                                                listOptions
                                                                            }
                                                                            selectedReqDoc={
                                                                                selectedReqDoc
                                                                            }
                                                                            handleSelectChange={
                                                                                handleSelectChange
                                                                            }
                                                                            reqComment={
                                                                                reqComment
                                                                            }
                                                                            setReqComment={
                                                                                setReqComment
                                                                            }
                                                                            isloadingReqDoc={
                                                                                isloadingReqDoc
                                                                            }
                                                                            handleRequestDocumentLog={
                                                                                handleRequestDocumentLog
                                                                            }
                                                                            userData={
                                                                                userData
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="4">
                                                                        <Meeting
                                                                            mainApplicationLoading={loading}
                                                                            showValidation={
                                                                                showValidation
                                                                            }
                                                                            setShowValidation={
                                                                                setShowValidation
                                                                            }
                                                                            getLogList={
                                                                                getLogList
                                                                            }
                                                                            applicationList={
                                                                                citizenData
                                                                            }
                                                                            applicationSlug={
                                                                                applicationSlug
                                                                            }
                                                                            userData={
                                                                                userId
                                                                            }
                                                                            citizenData={
                                                                                citizenData
                                                                                    ?.applicationAssignedToUser
                                                                                    ?.id
                                                                            }
                                                                            ApplicationId={
                                                                                applicationId
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="5">
                                                                        <GenrateCertificate
                                                                            isPdfDownloadLoading={
                                                                                isPdfDownloadLoading
                                                                            }
                                                                            applicationDataId={
                                                                                applicationDataId
                                                                            }
                                                                            userData={
                                                                                userId
                                                                            }
                                                                            handleDownloadPDF={
                                                                                handleDownload
                                                                            }
                                                                            applicationSlug={
                                                                                applicationSlug
                                                                            }
                                                                            citizenData={
                                                                                citizenData
                                                                            }
                                                                            setCitizenData={
                                                                                setCitizenData
                                                                            }
                                                                            applicationLists={
                                                                                applicationList
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="6">
                                                                        <TicketsTab
                                                                            mainApplicationLoading={loading}
                                                                            customerId={
                                                                                citizenData?.customerId
                                                                            }
                                                                            fetchSupportTicketsList={
                                                                                fetchSupportTicketsList
                                                                            }
                                                                            loading={
                                                                                isTicketLoading
                                                                            }
                                                                            setLoading={
                                                                                setIsTicketLoading
                                                                            }
                                                                            durationOfTickets={
                                                                                durationOfTickets
                                                                            }
                                                                            setDurationOfTickets={
                                                                                setDurationOfTickets
                                                                            }
                                                                            ticketSearchQuery={
                                                                                ticketSearchQuery
                                                                            }
                                                                            handleInputTicketSearch={
                                                                                handleInputTicketSearch
                                                                            }
                                                                            ticketStartDate={
                                                                                ticketStartDate
                                                                            }
                                                                            ticketEndDate={
                                                                                ticketEndDate
                                                                            }
                                                                            onChangeHandlerTickets={
                                                                                onChangeHandlerTickets
                                                                            }
                                                                            selectedStatus={
                                                                                selectedStatus
                                                                            }
                                                                            StatusFilterList={
                                                                                StatusFilterList
                                                                            }
                                                                            handleStatusFilter={
                                                                                handleStatusFilter
                                                                            }
                                                                            resetTicketFilters={
                                                                                resetTicketFilters
                                                                            }
                                                                            data={
                                                                                data
                                                                            }
                                                                            formatDate={
                                                                                formatDate
                                                                            }
                                                                            handleTicketView={
                                                                                handleTicketView
                                                                            }
                                                                            totalCountForTicket={
                                                                                totalCountForTicket
                                                                            }
                                                                            perPageSizeForTicket={
                                                                                perPageSizeForTicket
                                                                            }
                                                                            currentPageForTicket={
                                                                                currentPageForTicket
                                                                            }
                                                                            totalPagesForTicket={
                                                                                totalPagesForTicket
                                                                            }
                                                                            handleSelectPageSizeForTicket={
                                                                                handleSelectPageSizeForTicket
                                                                            }
                                                                            handlePageChangeForTicket={
                                                                                handlePageChangeForTicket
                                                                            }
                                                                        />
                                                                    </TabPane>

                                                                    <TabPane tabId="7">
                                                                        <PaymentHistoryTab
                                                                            mainApplicationLoading={loading}
                                                                            isPaymentHistoryLoading={
                                                                                isPaymentHistoryLoading
                                                                            }
                                                                            searchQuery={
                                                                                searchQuery
                                                                            }
                                                                            handleInputSearchBox={
                                                                                handleInputSearchBox
                                                                            }
                                                                            startDate={
                                                                                startDate
                                                                            }
                                                                            endDate={
                                                                                endDate
                                                                            }
                                                                            onChangeHandlerPayment={
                                                                                onChangeHandlerPayment
                                                                            }
                                                                            transactionOptions={
                                                                                transactionOptions
                                                                            }
                                                                            transactionStatusFilter={
                                                                                transactionStatusFilter
                                                                            }
                                                                            setTransactionStatusFilter={
                                                                                setTransactionStatusFilter
                                                                            }
                                                                            resetFilterForPaymentInvoice={
                                                                                resetFilterForPaymentInvoice
                                                                            }
                                                                            durationOfPayment={
                                                                                durationOfPayment
                                                                            }
                                                                            setDurationOfPayment={
                                                                                setDurationOfPayment
                                                                            }
                                                                            customerTransactionList={
                                                                                customerTransactionList
                                                                            }
                                                                            formatDate={
                                                                                formatDate
                                                                            }
                                                                            handleDownloadDownloadPDF={
                                                                                handleDownload
                                                                            }
                                                                            totalCount={
                                                                                totalCount
                                                                            }
                                                                            perPageSize={
                                                                                perPageSize
                                                                            }
                                                                            currentPage={
                                                                                currentPage
                                                                            }
                                                                            totalPages={
                                                                                totalPages
                                                                            }
                                                                            handleSelectPageSize={
                                                                                handleSelectPageSize
                                                                            }
                                                                            handlePageChange={
                                                                                handlePageChange
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                    <TabPane tabId="8">
                                                                        <AllApplicationTab
                                                                           mainApplicationLoading={loading}
                                                                            loading={
                                                                                isApplicationListLoading
                                                                            }
                                                                            searchQueryForApplication={
                                                                                searchQueryForApplication
                                                                            }
                                                                            handleInputSearch={
                                                                                handleInputSearch
                                                                            }
                                                                            applicationStartDate={
                                                                                applicationStartDate
                                                                            }
                                                                            applicationEndDate={
                                                                                applicationEndDate
                                                                            }
                                                                            onChangeHandlerApplications={
                                                                                onChangeHandlerApplications
                                                                            }
                                                                            resetApplicationFilters={
                                                                                resetApplicationFilters
                                                                            }
                                                                            applicationList={
                                                                                applicationList
                                                                            }
                                                                            formatDate={
                                                                                formatDate
                                                                            }
                                                                            calculateRemainingTimeTAT={
                                                                                calculateRemainingTimeTAT
                                                                            }
                                                                            handleApplicationDetailedView={
                                                                                handleApplicationDetailedView
                                                                            }
                                                                            totalCountForApplication={
                                                                                totalCountForApplication
                                                                            }
                                                                            perPageSizeForApplication={
                                                                                perPageSizeForApplication
                                                                            }
                                                                            currentPageForApplication={
                                                                                currentPageForApplication
                                                                            }
                                                                            totalPagesForApplication={
                                                                                totalPagesForApplication
                                                                            }
                                                                            handleSelectPageSizeForApplication={
                                                                                handleSelectPageSizeForApplication
                                                                            }
                                                                            handlePageChangeForApplication={
                                                                                handlePageChangeForApplication
                                                                            }
                                                                            durationOfApplication={
                                                                                durationOfApplication
                                                                            }
                                                                            setDurationOfApplication={
                                                                                setDurationOfApplication
                                                                            }
                                                                        />
                                                                    </TabPane>
                                                                </TabContent>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-4 col-xxl-3 col-12 mt-xl-5 mt-0 pt-2">
                                        <div className="row">
                                            <div className="col-xl-12 col-md-6 col-lg-6">
                                                <div className="card">
                                                    <div className="card-header bg-soft-success">
                                                        <h5 className="card-title mb-0">
                                                            Application Details
                                                        </h5>
                                                    </div>

                                                    <div className="card-body">
                                                        <div className="table-responsive table-card">
                                                            <SimpleBar
                                                                style={{
                                                                    maxHeight:
                                                                        "calc(100vh - 50px)",
                                                                    overflowX:
                                                                        "auto",
                                                                }}>
                                                                <table className="table table-borderless align-middle mb-0">
                                                                    {loading ? (
                                                                        <tr>
                                                                            <td colSpan="2">
                                                                                <LoaderSpin
                                                                                    height={
                                                                                        "300px"
                                                                                    }
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-bold">
                                                                                    NIB
                                                                                    Number
                                                                                </td>
                                                                                <td className="fw-bold">
                                                                                    {
                                                                                        citizenData
                                                                                            ?.requestedByCustomerInfo
                                                                                            ?.nibNumber
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Application
                                                                                    ID
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        citizenData?.applicationId
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Department
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        citizenData?.departmentName
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Service Name
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        citizenData?.serviceName
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Priority
                                                                                </td>
                                                                                <td>
                                                                                    <div className="btn badge-soft-light badge-outline-light pe-none text-bg-light">
                                                                                        <span className="fs-14 text-dark">
                                                                                            {
                                                                                                priority === "0" ? "Standard" : "Express"
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Assigned
                                                                                    To:
                                                                                </td>
                                                                                <td>
                                                                                    <div className="avatar-group">
                                                                                        <div className="avatar-group-item d-flex align-items-center border-0">
                                                                                            <img
                                                                                                src={
                                                                                                    citizenData
                                                                                                        ?.applicationAssignedToUser
                                                                                                        ?.documentPath
                                                                                                }
                                                                                                alt=""
                                                                                                className="rounded-circle avatar-xs me-2"
                                                                                            />
                                                                                            <div className="ms-2">
                                                                                                {
                                                                                                    citizenData
                                                                                                        ?.applicationAssignedToUser
                                                                                                        ?.name
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Status:
                                                                                </td>
                                                                                <td>
                                                                                    {citizenData?.status ===
                                                                                        "0" && (
                                                                                            <div className="btn badge-soft-warning badge-outline-warning pe-none">
                                                                                                <span className="fs-14 text-warning fw-semibold">
                                                                                                    Incomplete
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                        {citizenData?.status ===
                                                                                        "1" && (
                                                                                            <div className="btn badge-soft-warning badge-outline-warning pe-none">
                                                                                                <span className="fs-14 text-warning fw-semibold">
                                                                                                    Pending
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                        {citizenData?.status ===
                                                                                        "2" && (
                                                                                            <div className="btn badge-soft-info badge-outline-info pe-none">
                                                                                                <span className="fs-14 text-info fw-semibold">
                                                                                                    Inprogress
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                        
                                                                                    {citizenData?.status ===
                                                                                        "3" && (
                                                                                            <div className="btn badge-soft-success badge-outline-success pe-none">
                                                                                                <span className="fs-14 text-success fw-semibold">
                                                                                                    Checked
                                                                                                    &
                                                                                                    Verified
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                        {citizenData?.status ===
                                                                                        "4" && (
                                                                                            <div className="btn badge-soft-info badge-outline-info pe-none">
                                                                                                <span className="fs-14 text-info fw-semibold">
                                                                                                    Auto Pay
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                    
                                                                                    
                                                                                    {citizenData?.status ===
                                                                                        "5" && (
                                                                                            <div className="btn badge-soft-success badge-outline-success pe-none">
                                                                                                <span className="fs-14 text-success fw-semibold">
                                                                                                    Approve
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                        {citizenData?.status ===
                                                                                        "6" && (
                                                                                            <div className="btn badge-soft-danger badge-outline-danger pe-none">
                                                                                                <span className="fs-14 text-danger fw-semibold">
                                                                                                    Rejected
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    {citizenData?.status ===
                                                                                        "7" && (
                                                                                            <div className="btn badge-soft-info badge-outline-info pe-none">
                                                                                                <span className="fs-14 text-info fw-semibold">
                                                                                                    Shipped
                                                                                                </span>
                                                                                            </div>
                                                                                        )}{" "}
                                                                                    
                                                                                    {citizenData?.paymentToken && citizenData?.transactionStatus !== "1" && (
                                                                                        <Button className="btn btn-primary ms-md-4 ms-2" onClick={payNow}>Pay Now</Button>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Last
                                                                                    Activity
                                                                                </td>
                                                                                <td>
                                                                                    {formatRelativeTime(
                                                                                        activityDate?.createdDate
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    )}
                                                                </table>
                                                            </SimpleBar>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-12 col-md-6 col-lg-6">
                                                <div className="card ">
                                                    <div className="card-header bg-soft-success">
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1">
                                                                <h5 className="card-title mb-0">
                                                                    Payment
                                                                    Details
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="table-responsive table-card">
                                                            <SimpleBar
                                                                style={{
                                                                    maxHeight:
                                                                        "calc(100vh - 50px)",
                                                                    overflowX:
                                                                        "auto",
                                                                }}>
                                                                <table className="table table-borderless align-middle mb-0">
                                                                    {isApplicationTransactionLoading ||
                                                                        loading ? (
                                                                        <tr>
                                                                            <td colSpan="2">
                                                                                <LoaderSpin
                                                                                    height={
                                                                                        "250px"
                                                                                    }
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ) : !isApplicationTransactionLoading &&
                                                                        citizenData?.transactionStatus == 0 ? (
                                                                        <tr>
                                                                            <td colSpan="2">
                                                                                <p className="text-center">
                                                                                    No
                                                                                    Transaction
                                                                                    Found
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    ) : (
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    className="text-muted fs-13"
                                                                                    colSpan="2">
                                                                                    Payment
                                                                                    Mode
                                                                                    :
                                                                                </td>
                                                                                <td className="fw-semibold text-end">
                                                                                    Credit
                                                                                    Card
                                                                                    (
                                                                                    VISA
                                                                                    )
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    className="text-muted fs-13"
                                                                                    colSpan="2">
                                                                                    Payment
                                                                                    Option
                                                                                    :
                                                                                </td>
                                                                                <td className="fw-semibold text-end">
                                                                                    {citizenData?.paymentOption === "0" ? "Charge Now" : "Charge Later"}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    colSpan="2"
                                                                                    className="text-muted fs-13">
                                                                                    Transaction
                                                                                    Number
                                                                                    :
                                                                                </td>
                                                                                <td className="fw-semibold text-end">
                                                                                    {
                                                                                        citizenData?.transactionId
                                                                                            ? citizenData
                                                                                                .transactionId
                                                                                            : "N/A"
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    colSpan="2"
                                                                                    className="text-muted fs-13">
                                                                                    Transaction
                                                                                    Date
                                                                                    Time
                                                                                    :{" "}
                                                                                </td>
                                                                                <td className="fw-semibold text-end">
                                                                                    {transactionDeatils
                                                                                        ?.createdDate
                                                                                        ? formatDateLog(
                                                                                            transactionDeatils?.createdDate
                                                                                        )
                                                                                        : "N/A"}
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td
                                                                                    colSpan="2"
                                                                                    className="text-muted fs-13">
                                                                                    Transaction
                                                                                    Status
                                                                                    :{" "}
                                                                                </td>
                                                                                <td className="fw-semibold text-end">
                                                                                    <div className="d-block text-body p-1 px-2">
                                                                                        {citizenData?.transactionStatus ===
                                                                                            "0" && (
                                                                                                <div className="btn badge-soft-warning badge-outline-warning pe-none">
                                                                                                    <span className="fs-14 text-warning fw-semibold">
                                                                                                        Pending
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        {citizenData?.transactionStatus ===
                                                                                            "1" && (
                                                                                                <div className="btn badge-soft-success badge-outline-success pe-none">
                                                                                                    <span className="fs-14 text-success fw-semibold">
                                                                                                        Success
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        {citizenData?.transactionStatus ===
                                                                                            "2" && (
                                                                                                <div className="btn badge-soft-danger badge-outline-danger pe-none">
                                                                                                    <span className="fs-14 text-danger fw-semibold">
                                                                                                        Failed
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        {citizenData?.transactionStatus ===
                                                                                            "3" && (
                                                                                                <div className="btn badge-soft-info badge-outline-info pe-none">
                                                                                                    <span className="fs-14 text-info fw-semibold">
                                                                                                        Refund
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                            <tr className="table-active">
                                                                                <th colSpan="2">
                                                                                    Total
                                                                                    :
                                                                                </th>
                                                                                <td className="text-end">
                                                                                    <div className="fw-semibold">
                                                                                        {
                                                                                            citizenData
                                                                                                ?.serviceData
                                                                                                ?.price
                                                                                                ? `$${citizenData?.serviceData?.price}`
                                                                                                : "N/A"
                                                                                        }
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    )}
                                                                </table>
                                                            </SimpleBar>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {citizenData?.rating && (
                                                <div className="col-xl-12 col-md-6 col-lg-6">
                                                    <Card>
                                                        <CardHeader className="bg-soft-success">
                                                            <h5 className="card-title mb-0">
                                                                Application
                                                                Service Feedback
                                                            </h5>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <div className="table-responsive table-card">
                                                                <SimpleBar
                                                                    style={{
                                                                        maxHeight:
                                                                            "calc(100vh - 50px)",
                                                                        overflowX:
                                                                            "auto",
                                                                    }}>
                                                                    <Table className="table table-borderless align-middle mb-0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Rating
                                                                                </td>
                                                                                <td>
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        viewBox="0 0 24 24"
                                                                                        width="20"
                                                                                        height="20">
                                                                                        {" "}
                                                                                        <path
                                                                                            fill="none"
                                                                                            d="M0 0h24v24H0z"></path>{" "}
                                                                                        <path
                                                                                            className="i_color"
                                                                                            fill="#edad22"
                                                                                            d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928z"></path>{" "}
                                                                                    </svg>
                                                                                    <small
                                                                                        className="d-block fs-12 text-muted mt-1"
                                                                                        style={{
                                                                                            width: "44px",
                                                                                        }}>
                                                                                        {
                                                                                            citizenData?.rating
                                                                                        }{" "}
                                                                                        Star
                                                                                    </small>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="fw-medium">
                                                                                    Rating
                                                                                    Feedback
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        citizenData?.ratingFeedback
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                </SimpleBar>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <UserDetailModalView
                        isOpen={userDetailsView}
                        toggle={toggleUserDetailsModel}
                        data={citizenData?.requestedByCustomerInfo}
                    />
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
                    <CreateNewTicketModal />
                </div>
                <div className={`loader-main ${paylaterLoading ? "" : "d-none"}`}>
                    <div className="loader-payment">
                        <img src={loaderGIF} alt="" />
                        <h3 className="text-primary">Payment Processing</h3>
                        <p>Please do not refresh the page or click the
                            <br /> "Back" or close button of your browser.</p>
                    </div>
                </div>

                <ScrollToTop />
            </Elements >

        </>
    );
};

const ServiceDetailedView = () => {
    return (
        <Elements stripe={stripePromise}>
            <ServiceDetailed />
        </Elements>
    );
};

export default ServiceDetailedView;
