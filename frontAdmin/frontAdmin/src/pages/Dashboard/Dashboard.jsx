import React from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import teamChart from "../../assets/images/team06.png";
import netclues from "../../assets/images/users/netclues.png";
import userIcon from "../../assets/images/userIcon.webp";
import CreateNewTicketModal from "../../common/modals/CreateNewTicketModal/CreateNewTicketModal";
import UpdateStatusModal from "../../common/modals/UpdateStatusModal/UpdateStatusModal";
import { useState } from "react";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  calculateRemainingTimeTAT,
  hasAssignPermission,
  hasViewPermission,
} from "../../common/CommonFunctions/common";
import { useFormik } from "formik";
import * as Yup from "yup";
import AnnouncementsAddUpdateModal from "./AnnouncementsAddUpdateModal";
import { Badge, Carousel } from "react-bootstrap";
import AnnouncementCarousel from "./AnnouncementCarousel";
import "./carousel.css";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import TransactionStatusModal from "../Applications/ActiveApplications/TransactionStatusModal";
import ActiveApplications from "../Applications/ActiveApplications/ActiveApplications";
import useAxios from "../../utils/hook/useAxios";

const Dashboard = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxios()

  const [show, setShow] = useState(false);
  const [customActiveTab, setcustomActiveTab] = useState("1");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [announcementListCaro, setAnnouncementListCaro] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState();
  const [id, setId] = useState();

  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id;
  const ApplicationPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find(
      (module) => module.slug === "applications"
    );
  const ApplicationViewPermissions = ApplicationPermissions
    ? hasViewPermission(ApplicationPermissions)
    : false;

  const assignPermission = ApplicationPermissions
    ? hasAssignPermission(ApplicationPermissions)
    : false;
  const handleToggleUpdateShow = () => {
    setShowUpdateModal(!showUpdateModal);
  };

  const handleToggle = () => {
    setShow(!show);
  };
  
 

  const listOfAnnouncementsCaro = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/announcement/view`,
        {
          userId: userId,
          isCoreteam: "1",
          page: 1,
          perPage: 5,
        }
      );
      if (response?.data) {
        const { rows } = response?.data?.data;
        setAnnouncementListCaro(rows?.length > 0 ? rows : []);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    listOfAnnouncementsCaro();
  }, []);

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

  const MultipleRadialbar = ({ dataColors }) => {
    const series = [30, 5, 15, 50, 100];
    var options = {
      chart: {
        height: 350,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: "16px",
            },
            total: {
              show: true,
              label: "Total",
              formatter: function (w) {
                return 249;
              },
            },
          },
        },
      },
      labels: ["New", "In-Progress", "Pending", "Completed", "Total"],
      colors: ["#405189", "#f06548", "#f7b84b", "#0ab39c", "#394958"],
    };
    return (
      <ReactApexChart
        dir="ltr"
        series={series}
        options={options}
        type="radialBar"
        height={328.7}
        className="apex-charts"
      />
    );
  };

  const LinewithDataLabels = ({ dataColors, year }) => {
    var series = [
      {
        // name: "Mobile Hits - 2023",
        data: [26, 24, 32, 36, 33, 31, 33, 26, 24, 32, 36, 33],
      },
      {
        // name: "Desktop Hits - 2023",
        data: [14, 10, 16, 12, 17, 13, 12, 14, 11, 16, 12, 17],
      },
    ];

    var options = {
      chart: {
        height: 380,
        type: "line",
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#00bd9d", "#405189"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [3, 3],
        curve: "straight",
      },

      title: {
        // text: "Average Mobile & Desktop Hits",
        align: "left",
        style: {
          fontWeight: 500,
        },
      },
      grid: {
        row: {
          colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.2,
        },
        borderColor: "#f1f1f1",
      },
      markers: {
        style: "inverted",
        size: 6,
      },
      xaxis: {
        categories: [
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
        ],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Service Request / Revenue",
        },
        min: 5,
        max: 40,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: {
              toolbar: {
                show: false,
              },
            },
            legend: {
              show: false,
            },
          },
        },
      ],
    };
    return (
      <React.Fragment>
        <ReactApexChart
          dir="ltr"
          options={options}
          series={series}
          type="line"
          height="380"
          className="apex-charts"
        />
      </React.Fragment>
    );
  };

  document.title = "Dashboard | eGov Solution"

  return (
    <>
      <div id="layout-wrapper">
        <div className="main-content dashboard-ana">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                
                <div className="col-12 mb-4">
                  <div className="d-flex align-items-sm-center flex-sm-row flex-column">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <div className="">
                          <h5 className="mb-0">{userData?.role?.roleName}</h5>
                          <p className="fs-15 mt-1 text-muted mb-0">
                            Hello, {userData?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Announcements */}

                    <div className="mt-3 mt-lg-0 mb-4">
                      <div className="row g-3 mb-0 align-items-center justify-content-end">
                        <div className="col-auto">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown d-flex align-items-center">
                              <div
                                className="d-flex align-items-center"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                                title="Date Range"
                              >
                                <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                <i
                                  data-feather="chevron-down"
                                  className="text-muted icon-sm"
                                ></i>
                              </div>
                              <div className="dropdown-menu dropdown-menu-end shadow">
                                <div
                                  title="Yesterday"
                                  className="dropdown-item"
                                >
                                  Yesterday
                                </div>
                                <div
                                  title="This Week"
                                  className="dropdown-item border-top"
                                >
                                  This Week
                                </div>
                                <div
                                  title="Last Week"
                                  className="dropdown-item border-top"
                                >
                                  Last 7 Days
                                </div>
                                <div
                                  title="This Month"
                                  className="dropdown-item border-top"
                                >
                                  Last 30 Days
                                </div>
                                <div
                                  title="This Year"
                                  className="dropdown-item border-top"
                                >
                                  This Year
                                </div>
                                <div
                                  title="Custom Range"
                                  className="dropdown-item border-top"
                                >
                                  Custom Range
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary d-flex align-items-center justify-content-center ms-4"
                            onClick={() => setShowAnnouncementsModal(true)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              version="1.1"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              xmlnssvgjs="http://svgjs.com/svgjs"
                              width="512"
                              height="512"
                              viewBox="0 0 32 32"
                              style={{
                                enableBackground: "new 0 0 512 512",
                                height: "20px",
                                width: "20px",
                              }}
                              xmlSpace="preserve"
                              className="me-2"
                            >
                              <g>
                                <g id="Layer_2" data-name="Layer 2">
                                  <path
                                    d="M20.683 5.518a3 3 0 0 0-2.8-.3l-7.076 2.83H5a3 3 0 0 0-3 3v6a3 3 0 0 0 2 2.816v5.184a3 3 0 1 0 6 0v-5h.807l7.079 2.831a3 3 0 0 0 4.114-2.785v-12.094a3 3 0 0 0-1.317-2.482zm-16.683 5.53a1 1 0 0 1 1-1h5v8h-5a1 1 0 0 1-1-1zm4 14a1 1 0 1 1-2 0v-5h2zm12-4.954a1 1 0 0 1-1.372.928l-6.628-2.651v-8.646l6.628-2.651a1 1 0 0 1 1.372.926z"
                                    fill="#ffffff"
                                    data-original="#ffffff"
                                  />
                                  <path
                                    d="M29 13.048h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2z"
                                    fill="#ffffff"
                                    data-original="#ffffff"
                                  />
                                  <path
                                    d="M26 8.048a.991.991 0 0 0 .446-.106l2-1a1 1 0 1 0-.894-1.789l-2 1a1 1 0 0 0 .448 1.895z"
                                    fill="#ffffff"
                                    data-original="#ffffff"
                                  />
                                  <path
                                    d="M28.447 21.153l-2-1a1 1 0 1 0-.894 1.789l2 1a.991.991 0 0 0 .446.106 1 1 0 0 0 .448-1.895z"
                                    fill="#ffffff"
                                    data-original="#ffffff"
                                  />
                                </g>
                              </g>
                            </svg>
                            <span> Announcements</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-9">
                      <div className="row">
                        {announcementListCaro?.length !== 0 && (
                          <div className="col-12">
                            <div className="card">
                              <div className="card-header d-flex align-items-center">
                                <h5 className="flex-grow-1 mb-0">
                                  Announcements
                                </h5>
                              </div>
                              <div
                                className="card-body"
                                style={{
                                  padding: "25px 20px",
                                }}
                              >
                                <AnnouncementCarousel
                                  items={announcementListCaro}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="col-xl-7">
                          <div className="card border-0 p-0">
                            <div className="card-header align-items-center d-flex flex-wrap">
                              <h5 className="mb-0 flex-grow-1 title-sr">
                                Service Request vs. Revenue
                              </h5>
                              <div className="col-sm-auto mx-3 gap-1 row">
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  ALL
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  1W
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  1M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  3M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  6M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm col"
                                >
                                  1Y
                                </button>
                              </div>
                              <div className="col-sm-auto btn-card-inline">
                                <div className="flex-shrink-0">
                                  <div className="dropdown card-header-dropdown">
                                    <div
                                      className="btn btn-primary btn-sm"
                                      data-bs-toggle="dropdown"
                                      aria-haspopup="true"
                                      aria-expanded="false"
                                      title="Date Range"
                                    >
                                      <div className="fw-semibold text-uppercase fs-12">
                                      <svg
                                     xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="feather feather-filter icon-xs"
                                  >
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                  </svg>
                                      </div>
                                    </div>
                                    <div
                                      className="dropdown-menu dropdown-menu-end shadow-none"
                                      style={{
                                        width: "270px",
                                      }}
                                    >
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control border-0 dash-filter-picker shadow"
                                          data-provider="flatpickr"
                                          data-range-date="true"
                                          data-date-format="d M, Y"
                                          data-deafult-date="01 Jan 2022 to 31 Jan 2022"
                                        />
                                        <div className="input-group-text bg-primary border-primary text-white">
                                          <i className="ri-calendar-2-line"></i>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <LinewithDataLabels />
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-5 col-12">
                          <div className="card border-0 p-0">
                            <div className="card-header align-items-center d-flex">
                              <h5 className="mb-0 flex-grow-1">
                                Team Request vs. Tickets
                              </h5>
                              <div className="col-sm-auto mx-3 gap-1 row">
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  ALL
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  1W
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  1M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  3M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-secondary btn-sm col"
                                >
                                  6M
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm col"
                                >
                                  1Y
                                </button>
                              </div>
                              <div className="col-sm-auto">
                                <div className="flex-shrink-0">
                                  <div className="dropdown card-header-dropdown">
                                    <div
                                      className="btn btn-primary btn-sm btn-card-inline"
                                      data-bs-toggle="dropdown"
                                      aria-haspopup="true"
                                      aria-expanded="false"
                                      title="Date Range"
                                    >
                                      <div className="fw-semibold text-uppercase fs-12">
                                      <svg
                                     xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="feather feather-filter icon-xs"
                                  >
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                  </svg>
                                      </div>
                                    </div>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <div className="dropdown-item">
                                        Request
                                      </div>
                                      <div className="dropdown-item">
                                        Tickets
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <img src={teamChart} alt="team06" className="team-6chart w-100" />
                              <div className="mt-3 d-flex align-items-center justify-content-center mb-3">
                                <div className="d-flex align-items-center me-3">
                                  <div
                                    className="rounded-circle icon-xs me-2"
                                    style={{
                                      height: "12px",
                                      width: "12px",
                                      backgroundColor: "#405189",
                                    }}
                                  ></div>
                                  <small
                                    style={{
                                      fontSize: "13px",
                                    }}
                                    className="text-muted"
                                  >
                                    John
                                  </small>
                                </div>
                                <div className="d-flex align-items-center me-3">
                                  <div
                                    className="rounded-circle icon-xs me-2"
                                    style={{
                                      height: "12px",
                                      width: "12px",
                                      backgroundColor: "#f06548",
                                    }}
                                  ></div>
                                  <small
                                    style={{
                                      fontSize: "13px",
                                    }}
                                    className="text-muted"
                                  >
                                    Robert
                                  </small>
                                </div>
                                <div className="d-flex align-items-center me-3">
                                  <div
                                    className="rounded-circle icon-xs me-2"
                                    style={{
                                      height: "12px",
                                      width: "12px",
                                      backgroundColor: "#f7b84b",
                                    }}
                                  ></div>
                                  <small
                                    style={{
                                      fontSize: "13px",
                                    }}
                                    className="text-muted"
                                  >
                                    Alvis
                                  </small>
                                </div>
                                <div className="d-flex align-items-center me-3">
                                  <div
                                    className="rounded-circle icon-xs me-2"
                                    style={{
                                      height: "12px",
                                      width: "12px",
                                      backgroundColor: "rgb(10, 179, 156)",
                                    }}
                                  ></div>
                                  <small
                                    style={{
                                      fontSize: "13px",
                                    }}
                                    className="text-muted"
                                  >
                                    Lissa
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-6 d-none">
                          <div className="card border-0 d-none">
                            <div className="card-header align-items-center d-flex">
                              <div className="d-flex align-items-center flex-grow-1">
                                <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold ">
                                  Team Perfomance
                                </h4>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="dropdown card-header-dropdown">
                                  <div
                                    className="text-reset dropdown-btn"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    <div className="text-muted">
                                      <i className="las la-ellipsis-v ms-1 fs-24"></i>
                                    </div>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <div className="dropdown-item">
                                      Download Report
                                    </div>
                                    <div className="dropdown-item">Export</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-6">
                              <div className="card border-0">
                                <div className="card-header">
                                  <h5 className=" mb-0">John</h5>
                                </div>
                                <div className="card-body text-center">
                                  <img
                                    src="assets/images/team05.png"
                                    alt="team01"
                                  />
                                  <div className="mt-3 d-flex align-items-center justify-content-center">
                                    <div className="d-flex align-items-center me-3">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#7473dc",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Request
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#f3b050",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Tickets
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="card border-0">
                                <div className="card-header">
                                  <h5 className=" mb-0">Robert</h5>
                                </div>
                                <div className="card-body text-center">
                                  <img
                                    src="assets/images/team03.png"
                                    alt="team01"
                                  />
                                  <div className="mt-3 d-flex align-items-center justify-content-center">
                                    <div className="d-flex align-items-center me-3">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#7473dc",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Request
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#f3b050",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Tickets
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="card border-0">
                                <div className="card-header">
                                  <h5 className=" mb-0">Alvis</h5>
                                </div>
                                <div className="card-body text-center">
                                  <img
                                    src="assets/images/team04.png"
                                    alt="team01"
                                  />
                                  <div className="mt-3 d-flex align-items-center justify-content-center">
                                    <div className="d-flex align-items-center me-3">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#7473dc",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Request
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#f3b050",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Tickets
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="card border-0">
                                <div className="card-header">
                                  <h5 className=" mb-0">Lissa</h5>
                                </div>
                                <div className="card-body text-center">
                                  <img
                                    src="assets/images/team02.png"
                                    alt="team01"
                                  />
                                  <div className="mt-3 d-flex align-items-center justify-content-center">
                                    <div className="d-flex align-items-center me-3">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#7473dc",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Request
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle icon-xs me-1"
                                        style={{
                                          height: "9px",
                                          width: "9px",
                                          backgroundColor: "#f3b050",
                                        }}
                                      ></div>
                                      <small className="text-muted">
                                        Tickets
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="row">
                        <div className="col-12 d-none">
                          <div className="card border-0">
                            <div className="card-body p-0">
                              <div
                                className="alert alert-danger rounded-top alert-solid border-0 rounded-0 m-0 py-4"
                                role="alert"
                                style={{
                                  zIndex: "1",
                                  padding: "40px 0 60px !important",
                                  position: "relative",
                                }}
                              >
                                <div className="text-center">
                                  <h5 className="text-white mb-0">
                                    Rapid Services Request
                                  </h5>
                                </div>
                              </div>
                              <div
                                className="row bg-white shadow-sm"
                                style={{
                                  margin: "-30px auto 0",
                                  position: "relative",
                                  zIndex: "1",
                                  width: "calc(100% - 4rem)",
                                  borderRadius: "5px",
                                  marginBottom: "28px",
                                }}
                              >
                                <div
                                  className="col-sm-12 pe-0 bg-soft-info position-relative"
                                  style={{
                                    margin:
                                      "0 !important;padding: 0 !important",
                                    backgroundColor:
                                      "rgba(50,204,255,.10)!important",
                                  }}
                                >
                                  <div className="p-xxl-4 p-xl-3">
                                    <h2 className="ff-secondary fw-semibold fs-2">
                                      <div
                                        className="counter-value"
                                        data-target="1"
                                      >
                                        0
                                      </div>
                                    </h2>
                                    <div className="mt-3">
                                      <div
                                        href="#"
                                        className="btn btn-danger btn-label"
                                      >
                                        <i className="mdi mdi-arrow-right label-icon align-middle fs-16 me-2 "></i>
                                        Check Request
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-3 position-absolute top-0 end-0">
                                    <i
                                      className="mdi mdi-application-edit-outline"
                                      style={{
                                        fontSize: "60px",
                                        opacity: "0.1",
                                      }}
                                    ></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="card border-0">
                            <div className="card-header align-items-center d-flex">
                              <div className="d-flex align-items-center flex-grow-1">
                                <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold">
                                  Services Request
                                </h4>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="dropdown card-header-dropdown">
                                  <div
                                    className="text-reset dropdown-btn"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    <div className="text-muted">
                                      <i className="las la-ellipsis-v ms-1 fs-24"></i>
                                    </div>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <div className="dropdown-item">All</div>
                                    <div className="dropdown-item">
                                      One Week
                                    </div>
                                    <div className="dropdown-item">
                                      One Month
                                    </div>
                                    <div className="dropdown-item">
                                      Three Month
                                    </div>
                                    <div className="dropdown-item">
                                      Six Month
                                    </div>
                                    <div className="dropdown-item">
                                      One Year
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="card-body card-c-chart border-0">
                              <MultipleRadialbar />
                              <div
                                id="circle_radialbar"
                                data-colors='["#405189", "#f06548", "#f7b84b", "#0ab39c", "#394958"]'
                                className="apex-charts"
                                dir="ltr"
                              ></div>
                            </div>
                          </div>
                        </div>
                       
                        <div className="col-xl-12 d-none">
                          <div className="card card-height-100 border-0">
                            <div className="card-header align-items-center d-flex">
                              <h5 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold">
                                Services Request
                              </h5>
                              <div className="flex-shrink-0">
                                <div className="dropdown card-header-dropdown">
                                  <div
                                    className="text-reset dropdown-btn"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                  >
                                    <div className="text-muted">
                                      Report
                                      <i className="mdi mdi-chevron-down ms-1"></i>
                                    </div>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <div className="dropdown-item">
                                      Download Report
                                    </div>
                                    <div className="dropdown-item">Export</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <div
                                id="store-visits-source"
                                data-colors='["#405189", "#f06548", "#f7b84b", "#0ab39c", "--vz-primary-rgb, 0.45"]'
                                className="apex-charts"
                                dir="ltr"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 d-none">
                          <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-success">
                            <div className="card-body p-xxl-4 p-xl-3">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <p className="fs-6 fw-medium text-black mb-0">
                                    Total Revenue
                                  </p>
                                  <div className="d-flex">
                                    <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                      <div
                                        className="counter-value"
                                        data-target="65"
                                      >
                                        0
                                      </div>
                                      k
                                    </h2>
                                  </div>
                                  <div className="mb-0 text-muted">
                                    <div className="badge bg-light text-success mb-0">
                                      <i className="ri-arrow-up-line align-middle"></i>{" "}
                                      7.05 %
                                    </div>{" "}
                                    vs. previous month
                                  </div>
                                </div>
                                <div>
                                  <div className="avatar-sm flex-shrink-0">
                                    <div className="avatar-title bg-success rounded-circle fs-2">
                                      <i className="bx bx-transfer"></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 d-none">
                          <div className="card card-animate mb-4 shadow-sm border-0 bg-soft-warning">
                            <div className="card-body p-xxl-4 p-xl-3">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <p className="fs-6 fw-medium text-black mb-0">
                                    Total Closed CSR
                                  </p>
                                  <div className="d-flex">
                                    <h2 className="mt-3 ff-secondary fw-semibold fs-2">
                                      <div
                                        className="counter-value"
                                        data-target="60"
                                      >
                                        0
                                      </div>
                                      k
                                    </h2>
                                  </div>
                                  <div className="mb-0 text-muted">
                                    <div className="badge bg-light text-success mb-0">
                                      <i className="ri-arrow-up-line align-middle"></i>{" "}
                                      7.05 %
                                    </div>{" "}
                                    vs. previous month
                                  </div>
                                </div>
                                <div>
                                  <div className="avatar-sm flex-shrink-0">
                                    <div className="avatar-title bg-warning rounded-circle fs-2">
                                      <i
                                        data-feather="tag"
                                        className="text-white icon-lg"
                                      ></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 d-none">
                          <div className="card mb-1 ribbon-box ribbon-fill ribbon-sm">
                            <div className="card-body bg-light">
                              <div
                                className="d-flex align-items-center"
                                data-bs-toggle="collapse"
                                href="#"
                                role="button"
                                aria-expanded="false"
                                aria-controls="leadDiscovered3"
                              >
                                <div className="flex-shrink-0">
                                  <img
                                    src="assets/images/dvdl.png"
                                    alt=""
                                    className="avatar-xs rounded-circle"
                                  />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <h6 className="fs-14 mb-0">
                                    https://www.dvdl.gov.ky/
                                  </h6>
                                </div>
                              </div>
                            </div>
                            <div
                              className="collapse border-top border-top-dashed show"
                              id="leadDiscovered3"
                            >
                              <div className="card-body">
                                <div className="mb-3">
                                  <img
                                    src="assets/images/dvdl-home.png"
                                    alt="DVDL"
                                    width="100%"
                                  />
                                </div>
                                <div className="p-3 mx-n3 bg-soft-warning rounded-top">
                                  <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                      <h5 className="mb-0 fs-14">
                                        <div className="text-dark">
                                          Website Info.
                                        </div>
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                                <div className="py-3">
                                  <div className="row gy-3">
                                    <div className="col-12">
                                      <div>
                                        <p className="text-muted mb-1">Gov.</p>
                                        <div className="badge badge-soft-success fs-6">
                                          Vehicle and Drivers' Licensing
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center mt-3">
                                    <p className="text-muted mb-0 me-2">
                                      Tech. Team :
                                    </p>
                                    <div className="avatar-group">
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Bonnie Haynes"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-7.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Della Wilson"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-8.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Add Members"
                                      >
                                        <div className="avatar-xxs">
                                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                                            +
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center mt-3">
                                    <p className="text-muted mb-0 me-2">
                                      Dev. Team :
                                    </p>
                                    <div className="avatar-group">
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Bonnie Haynes"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-7.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Add Members"
                                      >
                                        <div className="avatar-xxs">
                                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                                            +
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="card-body">
                                <div className="p-3 mx-n3 bg-soft-warning rounded-top">
                                  <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                      <h5 className="mb-0 fs-14">
                                        <div className="text-dark">
                                          Tickets Status
                                        </div>
                                      </h5>
                                    </div>
                                  </div>
                                </div>
                                <div className="py-3">
                                  <div className="row gy-3">
                                    <div className="col-6">
                                      <div>
                                        <p className="text-muted mb-1">
                                          Status
                                        </p>
                                        <div className="badge badge-soft-success fs-12">
                                          Completed
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <div>
                                        <p className="text-muted mb-1">
                                          Deadline
                                        </p>
                                        <h5 className="fs-14"> 10 Jun, 2021</h5>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center mt-3">
                                    <p className="text-muted mb-0 me-2">
                                      Tech. Team :
                                    </p>
                                    <div className="avatar-group">
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Bonnie Haynes"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-7.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Della Wilson"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-8.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Add Members"
                                      >
                                        <div className="avatar-xxs">
                                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                                            +
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center mt-3">
                                    <p className="text-muted mb-0 me-2">
                                      Dev. Team :
                                    </p>
                                    <div className="avatar-group">
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Bonnie Haynes"
                                      >
                                        <div className="avatar-xxs">
                                          <img
                                            src="assets/images/users/avatar-7.jpg"
                                            alt=""
                                            className="rounded-circle img-fluid"
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-group-item"
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="top"
                                        title=""
                                        data-bs-original-title="Add Members"
                                      >
                                        <div className="avatar-xxs">
                                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                                            +
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="d-flex mb-2">
                                    <div className="flex-grow-1">
                                      <div>Tickets</div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <div>
                                        <i className="ri-list-check align-bottom me-1 text-muted"></i>{" "}
                                        25/32
                                      </div>
                                    </div>
                                  </div>
                                  <div className="progress progress-sm animated-progress">
                                    <div
                                      className="progress-bar bg-primary"
                                      role="progressbar"
                                      aria-valuenow="75"
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                      style={{
                                        width: "75%",
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="card-footer hstack gap-2">
                                <button className="btn btn-light btn-md w-100 shadow-sm">
                                  <i className="ri-phone-line align-bottom me-1"></i>
                                  Tech. Support
                                </button>
                                <button className="btn btn-primary btn-md w-100 shadow-sm">
                                  <i className="ri-question-answer-line align-bottom me-1"></i>
                                  Message
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12  d-none">
                        <div className="row">
                          <div className="col-xl-12">
                            <div className="card border-0">
                              <div className="card-body p-0 border-0">
                                <div className="row">
                                  <div className="col-sm-8">
                                    <div className="p-3">
                                      <h5 className="fs-20 lh-base">
                                        Track application status
                                      </h5>
                                      <div className="mt-3">
                                        <div
                                          data-bs-toggle="modal"
                                          data-bs-target="#applicationstatusModal"
                                          className="btn btn-danger btn-label"
                                        >
                                          <i className="mdi mdi-arrow-right label-icon align-middle fs-16 me-2 "></i>
                                          Check Status
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-sm-4">
                                    <div className="px-3">
                                      <i
                                        className="mdi mdi-application-edit-outline"
                                        style={{
                                          fontSize: "60px",
                                          opacity: "0.1",
                                        }}
                                      ></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div
                                className="pe-2 me-n1 mb-3"
                                data-simplebar
                                style={{
                                  height: "0",
                                }}
                              >
                                <div id="upcoming-event-list"></div>
                              </div>
                              <div id="external-events" className="d-none">
                                <p className="text-muted">
                                  Drag and drop your event or click in the
                                  calendar
                                </p>
                                <div
                                  className="external-event fc-event bg-soft-success text-success"
                                  data-classname="bg-soft-success"
                                >
                                  <i className="mdi mdi-checkbox-blank-circle font-size-11 me-2"></i>
                                  New Event Planning
                                </div>
                                <div
                                  className="external-event fc-event bg-soft-info text-info"
                                  data-classname="bg-soft-info"
                                >
                                  <i className="mdi mdi-checkbox-blank-circle font-size-11 me-2"></i>
                                  Meeting
                                </div>
                                <div
                                  className="external-event fc-event bg-soft-warning text-warning"
                                  data-classname="bg-soft-warning"
                                >
                                  <i className="mdi mdi-checkbox-blank-circle font-size-11 me-2"></i>
                                  Generating Reports
                                </div>
                                <div
                                  className="external-event fc-event bg-soft-danger text-danger"
                                  data-classname="bg-soft-danger"
                                >
                                  <i className="mdi mdi-checkbox-blank-circle font-size-11 me-2"></i>
                                  Create New theme
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ clear: "both" }}></div>
                        <div
                          className="modal fade"
                          id="event-modal"
                          tabIndex="-1"
                        >
                          <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0">
                              <div className="modal-header p-3 bg-soft-info">
                                <h5 className="modal-title" id="modal-title">
                                  Event
                                </h5>
                                <button
                                  type="button"
                                  className="btn-close"
                                  data-bs-dismiss="modal"
                                  aria-hidden="true"
                                ></button>
                              </div>
                              <div className="modal-body p-4">
                                <form
                                  className="needs-validation"
                                  name="event-form"
                                  id="form-event"
                                  noValidate
                                >
                                  <div className="text-end">
                                    <div
                                      className="btn btn-sm btn-soft-primary"
                                      id="edit-event-btn"
                                      data-id="edit-event"
                                      role="button"
                                    >
                                      Edit
                                    </div>
                                  </div>
                                  <div className="event-details">
                                    <div className="d-flex mb-2">
                                      <div className="flex-grow-1 d-flex align-items-center">
                                        <div className="flex-shrink-0 me-3">
                                          <i className="ri-calendar-event-line text-muted fs-16"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                          <h6
                                            className="d-block fw-semibold mb-0"
                                            id="event-start-date-tag"
                                          ></h6>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="flex-shrink-0 me-3">
                                        <i className="ri-time-line text-muted fs-16"></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className="d-block fw-semibold mb-0">
                                          <div id="event-timepicker1-tag"></div>{" "}
                                          -{" "}
                                          <div id="event-timepicker2-tag"></div>
                                        </h6>
                                      </div>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="flex-shrink-0 me-3">
                                        <i className="ri-map-pin-line text-muted fs-16"></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className="d-block fw-semibold mb-0">
                                          {" "}
                                          <div id="event-location-tag"></div>
                                        </h6>
                                      </div>
                                    </div>
                                    <div className="d-flex mb-3">
                                      <div className="flex-shrink-0 me-3">
                                        <i className="ri-discuss-line text-muted fs-16"></i>
                                      </div>
                                      <div className="flex-grow-1">
                                        <p
                                          className="d-block text-muted mb-0"
                                          id="event-description-tag"
                                        ></p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row event-form">
                                    <div className="col-12">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Type
                                        </label>
                                        <select
                                          className="form-select d-none"
                                          name="category"
                                          id="event-category"
                                          required
                                        >
                                          <option defaultValue="bg-soft-danger">
                                            Danger
                                          </option>
                                          <option defaultValue="bg-soft-success">
                                            Success
                                          </option>
                                          <option defaultValue="bg-soft-primary">
                                            Primary
                                          </option>
                                          <option defaultValue="bg-soft-info">
                                            Info
                                          </option>
                                          <option defaultValue="bg-soft-dark">
                                            Dark
                                          </option>
                                          <option defaultValue="bg-soft-warning">
                                            Warning
                                          </option>
                                        </select>
                                        <div className="invalid-feedback">
                                          Please select a valid event category
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Event Name
                                        </label>
                                        <input
                                          className="form-control d-none"
                                          placeholder="Enter event name"
                                          type="text"
                                          name="title"
                                          id="event-title"
                                          required
                                        />
                                        <div className="invalid-feedback">
                                          Please provide a valid event name
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="mb-3">
                                        <label>Event Date</label>
                                        <div className="input-group d-none">
                                          <input
                                            type="text"
                                            id="event-start-date"
                                            className="form-control flatpickr flatpickr-input"
                                            placeholder="Select date"
                                            readOnly
                                            required
                                          />
                                          <div className="input-group-text">
                                            <i className="ri-calendar-event-line"></i>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12" id="event-time">
                                      <div className="row">
                                        <div className="col-6">
                                          <div className="mb-3">
                                            <label className="form-label">
                                              Start Time
                                            </label>
                                            <div className="input-group d-none">
                                              <input
                                                id="timepicker1"
                                                type="text"
                                                className="form-control flatpickr flatpickr-input"
                                                placeholder="Select start time"
                                                readOnly
                                              />
                                              <div className="input-group-text">
                                                <i className="ri-time-line"></i>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-6">
                                          <div className="mb-3">
                                            <label className="form-label">
                                              End Time
                                            </label>
                                            <div className="input-group d-none">
                                              <input
                                                id="timepicker2"
                                                type="text"
                                                className="form-control flatpickr flatpickr-input"
                                                placeholder="Select end time"
                                                readOnly
                                              />
                                              <div className="input-group-text">
                                                <i className="ri-time-line"></i>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="mb-3">
                                        <label htmlFor="event-location">
                                          Location
                                        </label>
                                        <div>
                                          <input
                                            type="text"
                                            className="form-control d-none"
                                            name="event-location"
                                            id="event-location"
                                            placeholder="Event location"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <input
                                      type="hidden"
                                      id="eventid"
                                      name="eventid"
                                    />
                                    <div className="col-12">
                                      <div className="mb-3">
                                        <label className="form-label">
                                          Description
                                        </label>
                                        <textarea
                                          className="form-control d-none"
                                          id="event-description"
                                          placeholder="Enter a description"
                                          rows="3"
                                          spellCheck="false"
                                        ></textarea>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="hstack gap-2 justify-content-end">
                                    <button
                                      type="button"
                                      className="btn btn-soft-danger"
                                      id="btn-delete-event"
                                    >
                                      <i className="ri-close-line align-bottom"></i>{" "}
                                      Delete
                                    </button>
                                    <button
                                      type="submit"
                                      className="btn btn-success"
                                      id="btn-save-event"
                                    >
                                      Add Event
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {ApplicationViewPermissions && (
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="card border-0">
                        <div className="card-header border-bottom">
                          <h5 className="mb-0">Recent Applications</h5>
                        </div>
                        <ActiveApplications isDashBoard={true}/>
                      </div>
                    </div>
                    </div>
                )}
                <div className="row">
                  <div className="col-9 pe-4"></div>
                  <div className="col-3"></div>
                </div>
                <div className="row d-none">
                  <div className="col-xl-6">
                    <div className="card card-height-100">
                      <div className="card-header align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                          Audiences Sessions by Country
                        </h4>
                        <div className="flex-shrink-0">
                          <div className="dropdown card-header-dropdown">
                            <div
                              className="text-reset dropdown-btn"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <div className="fw-semibold text-uppercase fs-12">
                                Sort by:{" "}
                              </div>
                              <div className="text-muted">
                                Current Week
                                <i className="mdi mdi-chevron-down ms-1"></i>
                              </div>
                            </div>
                            <div className="dropdown-menu dropdown-menu-end">
                              <div className="dropdown-item">Today</div>
                              <div className="dropdown-item">Last Week</div>
                              <div className="dropdown-item">Last Month</div>
                              <div className="dropdown-item">Current Year</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div>
                          <div
                            id="audiences-sessions-country-charts"
                            data-colors='["--vz-info", "--vz-primary"]'
                            className="apex-charts"
                            dir="ltr"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="tra_popup"
            className="modal fade zoomIn"
            tabIndex="-1"
            aria-labelledby="addAddressModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="card mb-0">
                    <div className="card-header bg-soft-success">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-0">
                            <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                            Payment Details
                          </h5>
                        </div>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive table-card">
                        <table className="table table-borderless align-middle mb-0">
                          <tbody>
                            <tr>
                              <td className="text-muted fs-13" colSpan="2">
                                Payment Mode :
                              </td>
                              <td className="fw-semibold text-end">
                                Credit Card ( VISA )
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Number :
                              </td>
                              <td className="fw-semibold text-end">
                                25425458452
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Citizen Receipt Number :{" "}
                              </td>
                              <td className="fw-semibold text-end">254500</td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Date Time :{" "}
                              </td>
                              <td className="fw-semibold text-end">
                                10 Aug, 2022 11:00 AM
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Status :{" "}
                              </td>
                              <td className="fw-semibold text-end">Success</td>
                            </tr>
                            <tr className="table-active">
                              <th colSpan="2">Total :</th>
                              <td className="text-end">
                                <div className="fw-semibold">$50.00</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="tra_f_popup"
            className="modal fade zoomIn"
            tabIndex="-1"
            aria-labelledby="addAddressModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="card mb-0">
                    <div className="card-header bg-soft-warning">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-0">
                            <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                            Payment Details
                          </h5>
                        </div>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive table-card">
                        <table className="table table-borderless align-middle mb-0">
                          <tbody>
                            <tr>
                              <td className="text-muted fs-13" colSpan="2">
                                Payment Mode :
                              </td>
                              <td className="fw-semibold text-end">
                                Credit Card ( VISA )
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Number :
                              </td>
                              <td className="fw-semibold text-end">
                                25425458452
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Citizen Receipt Number :{" "}
                              </td>
                              <td className="fw-semibold text-end">254500</td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Date Time :{" "}
                              </td>
                              <td className="fw-semibold text-end">
                                03 Aug, 2022 11:00 AM
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="2" className="text-muted fs-13">
                                Transaction Status :{" "}
                              </td>
                              <td className="fw-semibold text-end">Failed</td>
                            </tr>
                            <tr className="table-active">
                              <th colSpan="2">Total :</th>
                              <td className="text-end">
                                <div className="fw-semibold">$10.00</div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <TransactionStatusModal
          show={show}
          setShow={setShow}
          handleToggle={handleToggle}
          transactionDetails={transactionDetails}
        />
        <CreateNewTicketModal />
        <AnnouncementsAddUpdateModal
          show={showAnnouncementsModal}
          loading={loading}
          setLoading={setLoading}
          updateId={id}
          userId={userId}
          setShowAnnouncementsModal={setShowAnnouncementsModal}
        />
      </div>
    </>
  );
};

export default Dashboard;
