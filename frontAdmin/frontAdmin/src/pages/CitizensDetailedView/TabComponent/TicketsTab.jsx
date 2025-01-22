import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Row,
    Table,
} from "reactstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import { Eye } from "feather-icons-react/build/IconComponents";
import { Trash2 } from "feather-icons-react/build/IconComponents";
import { Filter } from "feather-icons-react/build/IconComponents";
import Pagination from "../../../CustomComponents/Pagination";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
import { LoaderSpin } from "../../../common/Loader/Loader";

const BlankData = process.env.REACT_APP_BLANK;

const TicketsForCustomer = ({ customerId }) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [modalBackdrop, setmodalBackdrop] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [departmentList, setDepartmentList] = useState([
        { id: 0, departmentName: "All" },
    ]);
    const [servicesList, setServicesList] = useState([]);
    const [nibImageUpload, setNIBimageUpload] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTicketLoading, setIsTicketLoading] = useState(false);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(5);
    const totalPages = Math.ceil(totalCount / perPageSize);

    const StatusFilterList = [
        {
            value: "All",
            label: "All",
        },
        {
            value: 0,
            label: "New",
        },
        {
            value: 1,
            label: "Pending",
        },
        {
            value: 2,
            label: "Inprogress",
        },
        {
            value: 3,
            label: "Completed",
        },
    ];

    const departmentOptions =
        departmentList &&
        departmentList.map((department) => ({
            value: department.id,
            label: department.departmentName,
        }));

    const serviceOptions =
        servicesList &&
        servicesList.map((service) => ({
            value: service.slug,
            label: service.serviceName,
        }));

    function togBackdrop() {
        setmodalBackdrop(!modalBackdrop);
    }

    const validationSchema = yup.object().shape({
        title: yup.string().required("Please enter title"),
        department: yup.string().required("Please select department"),
        serviceSlug: yup.string().required("Please select service"),
        discription: yup.string().required("Please enter discription"),
        priority: yup.string().required("Please select priority"),
        documentFile: nibImageUpload
            ? yup.mixed()
            : yup.mixed().required("Please upload a image"),
    });

    const formik = useFormik({
        initialValues: {
            documentFile: "",
            customerId: customerId,
            title: "",
            discription: "",
            department: "",
            serviceSlug: "",
            priority: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setFieldError }) => {
            try {
                setIsTicketLoading(true)
                let nibImageId = null;

                if (nibImageUpload) {
                    const formData = new FormData();
                    formData.append(
                        "viewDocumentName",
                        `ticket_${values?.title.slice(0, 5)}`
                    );
                    formData.append("documentFile", values?.documentFile);
                    formData.append("customerId", customerId);
                    formData.append("isGenerated", "0");
                    formData.append("isShowInDocument", "0");
                    let fileResponse = await axiosInstance.post(
                        "documentService/uploading",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        }
                    );
                    nibImageId = fileResponse?.data?.data
                        ? fileResponse?.data?.data?.[0]?.id
                        : null;
                }

                let responseCreateTicket = await axiosInstance.post(
                    `ticketService/ticket/create`,
                    {
                        ...values,
                        // serviceId: values.service === "" ? null : values.service,
                        documentId: nibImageId,
                        customerId: customerId,
                        departmentId: values.department,
                        documentFile: undefined,
                        service: undefined,
                        department: undefined,
                        serviceSlug:
                            values.serviceSlug === ""
                                ? null
                                : values.serviceSlug,
                    }
                );
                if (responseCreateTicket) {
                    formik.resetForm();
                    setmodalBackdrop(false);
                    setNIBimageUpload();
                    fetchSupportTicketsList();
                    setIsTicketLoading(false);
                    toast.success("Ticket added successfully.");
                } else {
                    toast.error(
                        "Something went wrong. Please check info and try again"
                    );
                }
            } catch (error) {
                setIsTicketLoading(false);
                console.error(error.message);
            }
        },
    });

    const fetchDepartmentsList = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
            }
        } catch (error) {
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
    }, [searchQuery, selectedStatus, currentPage, perPageSize]);

    useEffect(() => {
        if (!searchQuery) {
            fetchSupportTicketsList();
        }
    }, [searchQuery, selectedStatus, currentPage, perPageSize]);

    useEffect(() => {
        fetchDepartmentsList();
    }, []);

    const fetchSupportTicketsList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `ticketService/ticket/view`,
                {
                    customerId: customerId,
                    page: currentPage,
                    perPage: perPageSize,
                    status: selectedStatus == "All" ? null : selectedStatus,
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setData(rows);
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            console.error(error.message);
            setIsLoading(false);
        }
    };

    const listOfSearch = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `ticketService/ticket/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    searchFilter: searchQuery,
                    status: selectedStatus == "All" ? null : selectedStatus,
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
    
    const handleStatusFilter = (e) => {
        setCurrentPage(1);
        // const selectedStatus = e.target.value;
        const selectedStatus = e.toString();
        setSelectedStatus(selectedStatus);
    };

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };

    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(e.target.value);
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
        const ampm = hours >= 12 ? 'PM' : 'AM';
    
        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
    
        // Add leading zero to minutes if needed
        minutes = minutes < 10 ? '0' + minutes : minutes;

        const formattedTime = `${hours}:${minutes} ${ampm}`

        return (
            <div>
                <span className="five">{formattedDate}</span>
                <small className="d-block fs-11">{formattedTime}</small>
            </div>
        );
    }

    window.onscroll = function () {
        scrollFunction();
    };

    const scrollFunction = () => {
        const element = document.getElementById("back-to-top");
        if (element) {
            if (
                document.body.scrollTop > 100 ||
                document.documentElement.scrollTop > 100
            ) {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        }
    };

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };
    const handleTicketView = (ticketDetails) => {
        navigate("/tickets-details", { state: { ticketDetails } });
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

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStatus("All");
        setCurrentPage(1);
        setPerPageSize(5);
    };

    return (
            <div className="row mt-4">
                {/* 1/9 */}
                <Col
                    xs={12}
                    xl={9}
                    xxl={ 12}>
                    <Card className="border-0 p-0 p-xl-2 rounded">
                        <CardHeader className="border-0 pb-0 pb-3">
                            <div className=" align-items-center">
                                <div className="tween ms-auto">
                                    {/* <a
                                        href="#filter-table"
                                        className="mobfilter nav-link d-flex d-xl-none  "
                                        data-bs-toggle="collapse"
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls="filter-table"
                                        data-key="t-tasks">
                                        <Filter className="icon-sm" />
                                    </a> */}
                                                <div className="row">
                                                    <div className="col-12 col-xxl-2 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-12 mb-3">
                                                        <form className=" p-0 ms-0">
                                                            <div className="search-box text-muted position-relative">
                                                                <input
                                                                    type="text"
                                                                    className="form-control bg-white "
                                                                    placeholder="Search Ticket ID"
                                                                    autoComplete="off"
                                                                    id="search-options"
                                                                    value={
                                                                        searchQuery
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleInputSearch(
                                                                            e
                                                                        )
                                                                    }
                                                                />
                                                              <i class="ri-search-line search-icon"></i>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className="col-12 col-xxl-2 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-12 mb-3">
                                                        <div
                                                            className=" depart_select_box_wrap  "
                                                            data-type="select-one">
                                                            <Select
                                                             classNames="depart_select_box css-b62m3t-container"
                                                                value={
                                                                    StatusFilterList.find(
                                                                        (
                                                                            option
                                                                        ) =>
                                                                            option.value ==
                                                                            selectedStatus
                                                                    ) ||
                                                                    null
                                                                  
                                                                }
                                                                 
                                                                onChange={(
                                                                    option
                                                                ) =>
                                                                    handleStatusFilter(
                                                                        option
                                                                            ? option.value
                                                                            : ""
                                                                    )
                                                                }
                                                                options={
                                                                    StatusFilterList
                                                                }
                                                                placeholder="Select Ticket Status"
                                                                name="status"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-xxl-2 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-12 mb-3">
                                                        <div>
                                                            <button
                                                                id="loadMore"
                                                                className="btn btn-primary "
                                                                onClick={
                                                                    resetFilters
                                                                }>
                                                                <RefreshCcw className=" me-2 icon-xs" />{" "}
                                                                <span>
                                                                    {" "}
                                                                    Reset{" "}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                           
                                        {/* </div>
                                    </div> */}
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="table-responsive">
                                <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }}>
                                    <Table className="table table-striped table-borderless mb-0">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="fw-bold">
                                                    {" "}
                                                    Tickets ID{" "}
                                                </th>
                                                <th className="fw-bold">
                                                    {" "}
                                                    Department Name{" "}
                                                </th>
                                                <th className="fw-bold">
                                                    {" "}
                                                    Task{" "}
                                                </th>
                                                <th className="fw-bold">
                                                    {" "}
                                                    Create Date / Time{" "}
                                                </th>
                                                <th className="fw-bold">
                                                    {" "}
                                                    Status{" "}
                                                </th>
                                                <th className="status text-center">
                                                    {" "}
                                                    Actions{" "}
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
                                            ) : data.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="text-center">
                                                        {/* No records found. */}
                                                        <NotFound
                                                            heading="Tickets not found."
                                                            message="Unfortunately, Tickets not available at the moment."
                                                        />
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.map(
                                                    (ticket, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <span
                                                                    className="fw-bold text-black"
                                                                    data-toggle="tooltip"
                                                                    data-placement="bottom"
                                                                    title=""
                                                                    data-original-title="Relation: Self">
                                                                    {`#${ticket?.ticketId}` ||
                                                                        BlankData}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {ticket
                                                                    ?.departmentData
                                                                    ?.departmentName ||
                                                                    BlankData}
                                                            </td>
                                                            <td>
                                                                <strong className="fw-bold">
                                                                    {ticket?.title ||
                                                                        BlankData}
                                                                </strong>
                                                            </td>
                                                            <td>
                                                                {formatDate(
                                                                    ticket.createdDate
                                                                ) ||
                                                                    BlankData}
                                                            </td>
                                                            <td>
                                                                {ticket?.status ? (
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
                                                                                <div className="px-3 badge border border-success text-success bg-soft-success fs-13 p-2 pe-none">
                                                                                    <span className="">
                                                                                        Closed
                                                                                    </span>
                                                                                </div>
                                                                            )}{" "}
                                                                            {ticket?.status ===
                                                                                "3" && (
                                                                                <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                    <span className="">
                                                                                    Escalated
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
                                                                ) : (
                                                                    BlankData
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span
                                                                    onClick={() =>
                                                                        handleTicketView(
                                                                            ticket
                                                                        )
                                                                    }
                                                                    className="py-2 px-2 fs-18 text-primary text-end"
                                                                    role="button"
                                                                    title="View">
                                                                    <Eye className="icon-sm" />
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            )}
                                        </tbody>
                                    </Table>
                                </SimpleBar>
                            </div>
                        </CardBody>
                        { data && data?.length !== 0 && (
                            <Pagination
                                totalCount={totalCount}
                                perPageSize={perPageSize}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                handleSelectPageSize={handleSelectPageSize}
                                handlePageChange={handlePageChange}
                            />
                        )}
                    </Card>
                </Col>
            </div>
      
    );
};

export default TicketsForCustomer;
