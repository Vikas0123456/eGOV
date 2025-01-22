import React from "react";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Table,
  Badge,
  Img,
} from "reactstrap";
import Accordion from "react-bootstrap/Accordion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import Pagination from "../../CustomComponents/Pagination";
import Noimage from "../../../src/assets/images/NoImage.jpg";
import { calculateRemainingTimeTAT } from "../../common/CommonFunctions/common";
import { Spinner } from "react-bootstrap";
import { format } from "date-fns";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import { Eye } from "feather-icons-react/build/IconComponents";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import userIcon from "../../assets/images/userIcon.webp";
import errorImage from "../../assets/images/error.gif";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
const BlankData = process.env.REACT_APP_BLANK;
export function stringAvatar(citizen) {
  return `${citizen?.firstName?.charAt(0).toUpperCase()}${citizen?.lastName
    ?.charAt(0)
    .toUpperCase()}`;
}

const Citizen = () => {
  const axiosInstance = useAxios()
  const navigate = useNavigate();
  // table data filter search sort
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // add update modal
  const [show, setShow] = useState(false);
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
      ? decrypt({ data: userEncryptData })
      : {};
  const userData = userDecryptData?.data;
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState();
  const [perPageSize, setPerPageSize] = useState(10);
  const totalPages = Math.ceil(totalCount / perPageSize);
  // upload Image
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [applicationList, setApplicationList] = useState([]);
  const [isCitizenLoading, setIsCitizenLoading] = useState(true);

  //customer application pagination
  const [applicationCurrentPage, setApplicationCurrentPage] = useState(1);
  const [applicationPerPage, setApplicationPerPage] = useState(10);
  const [applicationTotalCount, setApplicationTotalCount] = useState();
  const totalApplicationPages = Math.ceil(
    applicationTotalCount / applicationPerPage
  );

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
        <div>{formattedDate}</div>
        <small className="text-muted fs-11">{formattedTime}</small>
      </div>
    );
  }

  const handleAccordionClick = (e, index, customerId) => {
    e.stopPropagation();
    e.preventDefault();
    if (index === activeAccordion) {
      setActiveAccordion(null);
      return;
    }

    // Clear previous data and set loading state
    setApplicationList([]);
    setApplicationPerPage(10);
    // Set the new active accordion
    setActiveAccordion(index);
    // Fetch new application list
    getApplicationList(customerId);
  };

  const getApplicationList = async (customerId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `businessLicense/application/customerApplicationList`,
        {
          customerId: customerId,
          page: applicationCurrentPage,
          perPage: applicationPerPage,
          departmentId: userData?.isCoreTeam ==="0"? (userData?.departmentId || "").split(',').map(id => id.trim())  :null
        }
      );
      if (response) {
        const { rows, count } = response?.data?.data;
        setApplicationTotalCount(count);
        setApplicationList(rows);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (activeAccordion !== null) {
      getApplicationList();
    }
  }, [applicationCurrentPage, applicationPerPage]);

  const handleLoadMore = () => {
    if (applicationPerPage < applicationTotalCount) {
      setApplicationPerPage((prePageSize) => prePageSize + 10);
    }
  };

  const fetchCitizenList = async () => {
    try {
      setIsCitizenLoading(true);
      const response = await axiosInstance.post(`userService/customer/view`, {
        page: currentPage,
        perPage: perPageSize,
      });
      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(count);
        setIsCitizenLoading(false);
      }
    } catch (error) {
      setIsCitizenLoading(false);
      console.error(error.message);
    }
  };

  const listOfSearch = async () => {
    try {
      setIsCitizenLoading(true);
      const response = await axiosInstance.post(`userService/customer/view`, {
        page: currentPage,
        perPage: perPageSize,
        filter: searchQuery,
      });

      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(count);
        setIsCitizenLoading(false);
      }
    } catch (error) {
      setIsCitizenLoading(false);
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
  }, [searchQuery, currentPage, perPageSize]);

  useEffect(() => {
    if (!searchQuery) {
      fetchCitizenList();
    }
  }, [searchQuery, currentPage, perPageSize]);
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
      document.querySelector(".pagination-next").classList.add("disabled");
    } else {
      document.querySelector(".pagination-next").classList.remove("disabled");
    }

    if (page === 1) {
      document.querySelector(".pagination-prev").classList.add("disabled");
    } else {
      document.querySelector(".pagination-prev").classList.remove("disabled");
    }
  };

  const handleInputSearch = (e) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };
  const resetFilters = async () => {
    setCurrentPage(1);
    setPerPageSize(10);
    setSearchQuery("");
  };
  const handleApplicationDetailedView = async (data) => {
    navigate("/application-detailed-view", {
      state: data,
    });
  };

  document.title = "Citizens | eGov Solution";
  return (
    <>
      <div id="layout-wrapper">
        <div className="main-content">
          <div className="page-content">
            <div className="container-xl">
              <div className="row">
                <DepartmentUserInfo />
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0">Citizens</h4>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="tab-content  text-muted">
                    <div
                      className="tab-pane active"
                      id="base-justified-messages"
                      role="tabpanel"
                    >
                      <div className="card rounded-0 bg-soft-primary mx-n4 mt-n5 border-0 d-none">
                        <div className="px-5">
                          <div className="row">
                            <div className="col-xxl-5 align-self-center">
                              <div className="py-4">
                                <h4 className="display-6 coming-soon-text">
                                  eGOV Services
                                </h4>
                                <p className="text-muted fs-15 mt-3">
                                  {" "}
                                  eGOV is the centralized, secure way to request
                                  and pay for a range of online services from
                                  the Government of The Bahamas.{" "}
                                </p>
                              </div>
                            </div>
                            <div className="col-xxl-3 ms-auto">
                              <div className="mb-n5 pb-1 faq-img d-none d-xxl-block">
                                <img
                                  src="assets/images/faq-img.png"
                                  alt=""
                                  className="img-fluid"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-12 mb-3">
                        <div className="card border-0">
                          <div className="card-body border-0">
                            <div className="row">

                              <div className="col-xl-4 col-lg-4 col-xxl-3 col-md-6 col-lg-3 col-sm-6 mb-3 mb-sm-0 ">
                                <div className="search-box">
                                  <input
                                    type="text"
                                    className="form-control search bg-light border-light"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => handleInputSearch(e)}
                                  />
                                  <i className="ri-search-line search-icon"></i>
                                </div>
                              </div>
                              <div className="col  d-flex justify-content-start  align-items-start ">
                                <button
                                  type="button"
                                  className="btn btn-primary btn-label bg-warning border-warning  "
                                  onClick={resetFilters} title="Reset"
                                >
                                  {/* <RefreshCcw
                                      className="text-muted me-2"
                                      width="16"
                                      height="16"
                                    />
                                    <span> Reset </span> */}
                                  <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                  Reset
                                </button>
                              </div>



                            </div>
                          </div>
                        </div>
                      </div>

                      <Row className="row d-md-flex d-none">
                        <Col className="col-md-3 col-12">
                          <strong> Citizen Name </strong>
                        </Col>
                        <Col className="col-md-3 col-12">
                          <strong> Contact Number </strong>
                        </Col>
                        <Col className="col-md-3 col-12">
                          <strong> Email </strong>
                        </Col>
                        <Col className="col-md-3 col-12">
                          <strong> Action </strong>
                        </Col>
                      </Row>

                      <div className="row justify-content-evenly">
                        <div className="col-lg-12 mt-3">
                          <div
                            className="accordion accordion-border-box"
                            id="genques-accordion"
                          >
                            {isCitizenLoading ? (
                              <LoaderSpin />
                            ) : data &&
                              data.length === 0 &&
                              !isCitizenLoading ? (
                              <NotFound
                                heading="Citizen not found."
                                message="Unfortunately, citizen not available at the moment."
                              />
                            ) : (
                              data &&
                              data?.map((citizen, index) => (
                                <div className="accordion-item" key={index}>
                                  <div
                                    className="accordion-header"
                                    id={`km-heading${index}`}
                                  >
                                    <div
                                      className={`accordion-button d-block ${activeAccordion === index
                                        ? ""
                                        : "collapsed"
                                        }`}
                                      type="button"
                                      onClick={(e) =>
                                        handleAccordionClick(
                                          e,
                                          index,
                                          citizen?.id
                                        )
                                      }
                                      aria-expanded={
                                        activeAccordion === index
                                          ? "true"
                                          : "false"
                                      }
                                      aria-controls={`km-collapse${index}`}
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#km-collapse${index}`}
                                      data-bs-parent="#km-accordion"
                                    >
                                      <Row className=" align-items-center">
                                        <Col className="col-lg-3 col-md-12 col-sm-12 col-xs-12 mb-2 mb-lg-0 col-12">
                                          <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0 me-3">
                                              {/* <span className="notification-dot me-2"></span> */}
                                              {/* <img
                                                    src={
                                                      citizen?.imageData
                                                        ?.documentPath || userIcon
                                                    }
                                                    alt=""
                                                    className="avatar-xs rounded-circle"
                                                  /> */}

                                              {citizen?.imageData
                                                ?.documentPath ? (
                                                <img
                                                  src={
                                                    citizen?.imageData
                                                      ?.documentPath || userIcon
                                                  }
                                                  alt=""
                                                  className="avatar-sm rounded-circle"
                                                />
                                              ) : (
                                                <div className="avatar-sm rounded-circle d-flex align-items-center justify-content-center bg-warning-subtle">
                                                  {stringAvatar(citizen)}
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-grow-1">
                                              {" "}
                                              <small className="text-secondary">
                                                {citizen.nibNumber}
                                              </small>
                                              <br />
                                              <strong>
                                                {citizen.firstName}{" "}
                                                {citizen.middleName}{" "}
                                                {citizen.lastName}
                                              </strong>
                                            </div>
                                          </div>
                                        </Col>
                                        <Col className="col-lg-3 col-md-12 col-sm-12 col-xs-12 mb-2 mb-md-0 col-12 ">
                                          <div className="ms-4 ps-3 ms-lg-0">
                                            {citizen.mobileNumber}
                                          </div>
                                        </Col>
                                        <Col className="col-lg-3 col-md-12 col-sm-12 col-xs-12 col-12">
                                          <div className="ms-4 ps-3 ms-lg-0">
                                            {citizen.email}
                                          </div>
                                        </Col>
                                        <Col className="col-lg-3 col-md-12 col-sm-12 col-xs-12 col-12">
                                          <div className="ms-4 ps-3 ms-lg-0" onClick={()=>navigate("/citizens-detailed-view",{state:{data:citizen?.id}})}>
                                          <Eye
                                          width="18"
                                          height="18"
                                          className="text-primary"
                                          />
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  </div>

                                  <div
                                    id={`km-collapse${index}`}
                                    className={`accordion-collapse collapse ${activeAccordion === index ? "show" : ""
                                      }`}
                                    aria-labelledby={`km-heading${index}`}
                                    data-bs-parent="#km-accordion"
                                  >
                                    <div className="accordion-body">
                                      <div className="table-responsive-xl">
                                        {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                          <table className="table table-striped text-dark table-borderless mb-0">
                                            <thead className="bg-white">
                                              <tr>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Application ID{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Date / Time{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Service Name{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Department Name{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  TAT{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Transaction Status{" "}
                                                </th>
                                                <th className="fw-bold">
                                                  {" "}
                                                  Status{" "}
                                                </th>
                                                <th
                                                  className="status text-center"
                                                  style={{ width: "100px" }}
                                                ></th>
                                              </tr>
                                            </thead>
                                            {applicationList?.length === 0 &&
                                              !loading && (
                                                <tbody>
                                                  <tr>
                                                    <td
                                                      colSpan="8"
                                                      className="text-center text-dark bg-white"
                                                    >
                                                      {" "}
                                                      {/* No record found.{" "} */}
                                                      <NotFound
                                                        heading="Applications not found."
                                                        message="Unfortunately, applications not available at the moment."
                                                      />
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              )}
                                            <tbody>
                                              {applicationList &&
                                                applicationList?.map(
                                                  (application, index) => (
                                                    <tr key={index}>
                                                      <td>
                                                        <div className="fw-bold text-black">
                                                          {application.applicationId ||
                                                            BlankData}
                                                        </div>
                                                      </td>
                                                      <td>
                                                        <div className="four">
                                                          {formatDate(
                                                            application?.createdDate
                                                          ) || BlankData}
                                                        </div>
                                                      </td>
                                                      <td>
                                                        <strong className="fw-bold">
                                                          {application
                                                            ?.serviceName
                                                            ?.serviceName ||
                                                            BlankData}
                                                        </strong>
                                                      </td>
                                                      <td>
                                                        {application
                                                          ?.serviceName
                                                          ?.departmentName ||
                                                          BlankData}
                                                      </td>
                                                      <td>
                                                        {application?.turnAroundTime ? (
                                                          <>
                                                            {" "}
                                                            {calculateRemainingTimeTAT(application?.turnAroundTime, application?.status, "service") === "Completed" ? (
                                                              <div className="badge bg-success d-inline-flex align-items-center">
                                                                <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                                                <div className="mb-0 ms-1 fs-13" id="demo1">
                                                                  {calculateRemainingTimeTAT(application?.turnAroundTime, application?.status, "service")}
                                                                </div>
                                                              </div>
                                                            ) : calculateRemainingTimeTAT(application?.turnAroundTime, application?.status, "service") === "Overdue" ? (
                                                              <div className="badge bg-danger d-inline-flex align-items-center">
                                                                <i className="mdi mdi-clock-alert fs-14"></i>
                                                                <span className="mb-0 ms-1 fs-13">
                                                                  {calculateRemainingTimeTAT(application?.turnAroundTime, application?.status, "service")}
                                                                </span>
                                                              </div>
                                                            ) : (
                                                              <div className="badge bg-warning d-inline-flex align-items-center">
                                                                <i className="mdi mdi-clock-outline fs-14"></i>
                                                                <span className="mb-0 ms-1 fs-13">
                                                                  {calculateRemainingTimeTAT(application?.turnAroundTime, application?.status, "service")}
                                                                </span>
                                                              </div>
                                                            )}
                                                          </>
                                                        ) : (
                                                          BlankData
                                                        )}
                                                      </td>

                                                      <td>
                                                        {application?.transactionStatus ? (
                                                          <>
                                                            {application?.transactionStatus ===
                                                              "0" && (
                                                                <div className="badge badge-soft-warning badge-outline-warning p-2 px-3 pe-none">
                                                                  {" "}
                                                                  Pending{" "}
                                                                </div>
                                                              )}{" "}
                                                            {application?.transactionStatus ===
                                                              "1" && (
                                                                <div className="badge badge-soft-success badge-outline-success p-2 px-3 pe-none">
                                                                  {" "}
                                                                  Success{" "}
                                                                </div>
                                                              )}{" "}
                                                            {application?.transactionStatus ===
                                                              "2" && (
                                                                <div className="badge badge-soft-danger badge-outline-danger p-2 px-3 pe-none">
                                                                  {" "}
                                                                  Failed{" "}
                                                                </div>
                                                              )}{" "}
                                                            {application?.transactionStatus ===
                                                              "3" && (
                                                                <div className="badge badge-soft-info badge-outline-info p-2 px-3 pe-none">
                                                                  {" "}
                                                                  Refund{" "}
                                                                </div>
                                                              )}
                                                          </>
                                                        ) : (
                                                          BlankData
                                                        )}
                                                      </td>

                                                      <td>
                                                        {application?.status ? (
                                                             <>
                                                             {application?.status ===
                                                               "0" && (
                                                                 <div className="px-3 fs-13 badge border border-primary text-primary bg-soft-primary p-2 pe-none">
                                                                   <span>
                                                                     {" "}
                                                                     Incomplete{" "}
                                                                   </span>
                                                                 </div>
                                                               )}
                                                             {application?.status ===
                                                               "1" && (
                                                                 <div className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                                                   <span>
                                                                     {" "}
                                                                     Pending{" "}
                                                                   </span>
                                                                 </div>
                                                               )}{" "}
                                                             {application?.status ===
                                                               "2" && (
                                                                 <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                                                   <span className="">
                                                                     {" "}
                                                                     Inprogress{" "}
                                                                   </span>
                                                                 </div>
                                                               )}{" "}
                                                             {application?.status ===
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
                                 
                                                             {application?.status ===
                                                               "4" && (
                                                                 <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                                                   <span className="">
                                                                     {" "}
                                                                     Auto Pay{" "}
                                                                   </span>
                                                                 </div>
                                                               )}{" "}
                                                             {application?.status ===
                                                               "5" && (
                                                                 <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                                                   <span className="">
                                                                     {" "}
                                                                     Approved{" "}
                                                                   </span>
                                                                 </div>
                                                               )}{" "}
                                                             {application?.status ===
                                                               "6" && (
                                                                 <div className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                                                   <span className="">
                                                                     {" "}
                                                                     Rejected{" "}
                                                                   </span>
                                                                 </div>
                                                               )}
                                                             {application?.status ===
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
                                                          <div
                                                            onClick={() =>
                                                              handleApplicationDetailedView(
                                                                application
                                                              )
                                                            }
                                                            className="py-2 px-2 cursor-pointer"
                                                            title="View"
                                                          >
                                                            <Eye
                                                              width="18"
                                                              height="18"
                                                              className="text-primary"
                                                            />
                                                          </div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                            </tbody>
                                          </table>
                                        {/* </SimpleBar> */}
                                        {totalApplicationPages !==
                                          applicationCurrentPage &&
                                          applicationCurrentPage *
                                          applicationPerPage <
                                          applicationTotalCount &&
                                          !loading && (
                                            <Col className="mb-2 mx-auto d-flex justify-content-center border-top border-dark border-opacity-10">
                                              <button
                                                type="button"
                                                className="btn btn-outline-primary mt-4"
                                                title="Load more applications"
                                                onClick={handleLoadMore}
                                                disabled={
                                                  totalApplicationPages ===
                                                  applicationCurrentPage ||
                                                  applicationCurrentPage *
                                                  applicationPerPage >=
                                                  applicationTotalCount
                                                }
                                              >
                                                Load More Applications
                                              </button>
                                            </Col>
                                          )}

                                        {loading && <LoaderSpin />}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}

                            <Pagination
                              totalCount={totalCount}
                              perPageSize={perPageSize}
                              currentPage={currentPage}
                              totalPages={totalPages}
                              handleSelectPageSize={handleSelectPageSize}
                              handlePageChange={handlePageChange}
                            />
                          </div>
                        </div>
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

export default Citizen;
