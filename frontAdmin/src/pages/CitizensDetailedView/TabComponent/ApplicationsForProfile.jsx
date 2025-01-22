import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Row,
    Table,
    FormGroup,
    Input,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import { Eye } from "feather-icons-react/build/IconComponents";
import { RefreshCcw } from "feather-icons-react";
import { calculateRemainingTimeTAT } from "../../../common/CommonFunctions/common";
import Pagination from "../../../CustomComponents/Pagination";
import useAxios from "../../../utils/hook/useAxios";
import { LoaderSpin } from "../../../common/Loader/Loader";
import NotFound from "../../../common/NotFound/NotFound";

const BlankData = process.env.REACT_APP_BLANK;
const ApplicationsForProfile = ({customerId}) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const [applicationList, setApplicationList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(5);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const [isLoading, setisloading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
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


    const resetFilters = () => {
        setSearchQuery("");
        setSelectedStatus("");
        setPerPageSize(5)
        setCurrentPage(1)
    };

    const getApplicationList = async () => {
        try {
            setisloading(true);
            const response = await axiosInstance.post(
                `businessLicense/application/customerApplicationList`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    customerId: customerId,
                    searchFilter: searchQuery,
                    status: selectedStatus,
                },
                {
                    timeout: 50000, // Set the timeout to 50 seconds (50000 ms)
                }
            );

            if (response) {
                const { rows, count } = response?.data?.data;
                setApplicationList(rows);
                setTotalCount(count);
                setisloading(false);
            }
        } catch (error) {
            setisloading(false);
            console.error(error.message);
        }
    };
    useEffect(() => {
        if (!searchQuery) {
            getApplicationList();
        }
    }, [perPageSize, currentPage, searchQuery, selectedStatus]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                getApplicationList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [currentPage, perPageSize, searchQuery, selectedStatus]);

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
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
                <span>{formattedDate}</span>
                <small className="d-block text-muted fs-11">
                    {formattedTime}
                </small>
            </div>
        );
    }

    const handleApplicationDetailedView = async (application) => {
        navigate("/application-detailed-view", {
            state: application,
        });
    };

    const handleStatusSearch = async (value) => {
        if (value) {
            setCurrentPage(1);
            setSelectedStatus(value);
        } else {
            setSelectedStatus("");
        }
    };

    const statusOptions = [
        { value: "0", label: "Incomplete" },
        { value: "1", label: "Pending" },
        { value: "2", label: "Inprogress" },
        { value: "5", label: "Approve" },
        { value: "6", label: "Reject" },
        { value: "7", label: "Shipped" },
    ];


    return (
                    <div className="row mt-5">
                        <Col className=" col-12 col-xl-12 col-xxl-12 ">
                            <Row>
                                <div className="col-12 col-md-6 col-sm-6 col-xl-3 col-lg-4 col-xxl-2  col-md-4">
                                    <FormGroup>
                                        <Input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                handleInputSearch(e)
                                            }
                                            placeholder="Application ID"
                                        />
                                    </FormGroup>
                                </div>
                                <div className="col-12 col-md-6 col-sm-6 col-xl-3 col-lg-4 col-xxl-2  col-md-4  mb-3 ">
                                    <div className="input-light ">
                                        <Select
                                            className="cursor-pointer "
                                            name="choices-single-default"
                                            id="idStatus"
                                            value={
                                                statusOptions.find(
                                                    (option) =>
                                                        option.value ===
                                                        selectedStatus
                                                ) || null
                                            }
                                            onChange={(option) =>
                                                handleStatusSearch(option.value)
                                            }
                                            placeholder="Select Status*"
                                            options={statusOptions}
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
                                <div className="col-md-4 mb-md-0 mb-3 d-flex">
                                    <div>
                                        <button
                                            id="loadMore"
                                            className="btn btn-primary w-100"
                                            onClick={resetFilters}
                                        >
                                            <RefreshCcw className="me-2 icon-xs" />
                                            <span> Reset </span>
                                        </button>
                                    </div>
                                </div>
                            </Row>
                            <Row>
                                <Col>
                                    <Card className="border-0 p-0 p-xl-2 rounded">
                                        <CardBody className="pt-0">
                                            <div className="table-responsive"> 
                                            {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                <Table className="table table-striped table-borderless mb-0">
                                                    <thead className="bg-white">
                                                        <tr>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Application ID{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Date / Time{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Services Name{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Applicant Name{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Department Name{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                TAT{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Transaction
                                                                Status{" "}
                                                            </th>
                                                            <th className="fw-bold text-nowrap">
                                                                {" "}
                                                                Status{" "}
                                                            </th>
                                                            <th className="status text-center text-nowrap">
                                                                {" "}
                                                                Actions{" "}
                                                            </th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {isLoading ? (
                                                         
                                                                <tr>
                                                                    <td
                                                                        colSpan="10"
                                                                        className="text-center"
                                                                    >
                                                                        <LoaderSpin />
                                                                    </td>
                                                                </tr>
                                                           
                                                        ) : applicationList?.length ===
                                                            0 ? (
                                                          
                                                                <tr>
                                                                    <td
                                                                        colSpan="10"
                                                                        className="text-center"
                                                                    >
                                                                        {/* No records found. */}
                                                                        <NotFound
                                                                            heading="Application not found."
                                                                            message="Unfortunately, application not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                           
                                                        ) : (
                                                            applicationList.map(
                                                                (data, index) => (

                                                                    <tr key={index} >
                                                                        <td>
                                                                            <span
                                                                                className="fw-bold text-black"
                                                                                data-toggle="tooltip"
                                                                                data-placement="bottom"
                                                                                title=""
                                                                                data-original-title="Relation: Self"
                                                                            >
                                                                                {data?.applicationId ||
                                                                                    BlankData}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-nowrap">
                                                                            {formatDate(
                                                                                data.createdDate
                                                                            ) ||
                                                                                BlankData}
                                                                        </td>
                                                                        <td>
                                                                            <strong className="fw-bold">
                                                                                {data
                                                                                    ?.serviceName
                                                                                    ?.serviceName ||
                                                                                    BlankData}
                                                                            </strong>
                                                                        </td>
                                                                        <td>
                                                                            {data?.applicantName ||
                                                                                BlankData}
                                                                        </td>
                                                                        <td>
                                                                            {data
                                                                                ?.serviceName
                                                                                ?.departmentName ||
                                                                                BlankData}
                                                                        </td>
                                                                        <td>
                                                                            {data?.turnAroundTime ? (
                                                                                <>
                                                                                    {" "}
                                                                                    {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service") === "Completed" ? (
                                                                                        <div className="badge bg-success d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                                                                            <div className="mb-0 ms-1 fs-13" id="demo1">
                                                                                                {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service") === "Overdue" ? (
                                                                                        <div className="badge bg-danger d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-alert fs-14"></i>
                                                                                            <span className="mb-0 ms-1 fs-13">
                                                                                                {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="badge bg-warning d-inline-flex align-items-center">
                                                                                            <i className="mdi mdi-clock-outline fs-14"></i>
                                                                                            <span className="mb-0 ms-1 fs-13">
                                                                                                {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                BlankData
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {data?.transactionStatus ? (
                                                                                <>
                                                                                    {data?.transactionStatus ===
                                                                                        "0" && (
                                                                                            <div className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                                                                                <span>
                                                                                                    {" "}
                                                                                                    Pending{" "}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    {data?.transactionStatus ===
                                                                                        "1" && (
                                                                                            <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                                                                                <span>
                                                                                                    {" "}
                                                                                                    Success{" "}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    {data?.transactionStatus ===
                                                                                        "2" && (
                                                                                            <div className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                                                                                <span>
                                                                                                    {" "}
                                                                                                    Failed{" "}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    {data?.transactionStatus ===
                                                                                        "3" && (
                                                                                            <div className="px-3 fs-13 badge border border-primary text-primary bg-soft-primary p-2 pe-none">
                                                                                                <span>
                                                                                                    {" "}
                                                                                                    Refund{" "}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                </>
                                                                            ) : (
                                                                                BlankData
                                                                            )}
                                                                        </td>
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
                                                                        <td>
                                                                            <div className="d-flex align-items-center">
                                                                                <span
                                                                                    role="button"
                                                                                    onClick={() =>
                                                                                        handleApplicationDetailedView(
                                                                                            data
                                                                                        )
                                                                                    }
                                                                                    className="py-2 px-2 me-2 text-primary fs-18"
                                                                                    title="View"
                                                                                >
                                                                                    <Eye className="text-primary icon-sm" />
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="">
                                                                            {data?.rating && (
                                                                                <div
                                                                                    className="fs-16 align-middle text-warning text-center ms-1 d-flex flex-column align-items-center text-nowrap pe-2"
                                                                                    title={
                                                                                        data?.ratingFeedback
                                                                                    }
                                                                                >
                                                                                    <i className="lab las la-star fs-20"></i>
                                                                                    <small className="d-block fs-12 text-muted mt-1">
                                                                                        {
                                                                                            data?.rating
                                                                                        }{" "}
                                                                                        Star
                                                                                    </small>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>

                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </Table>
                                            {/* </SimpleBar> */}
                                            </div>
                                        </CardBody>
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
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </div>
              
    );
};

export default ApplicationsForProfile;
