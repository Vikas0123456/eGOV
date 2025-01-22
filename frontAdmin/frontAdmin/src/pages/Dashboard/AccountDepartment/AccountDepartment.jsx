import React, { useEffect, useRef, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApexCharts from "react-apexcharts";
import Chart from "react-apexcharts";
import { Row, Col, Card, Dropdown, FormControl } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import GeolocationRevenue from "../MinistryCoreUser/GeolocationRevenue";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import { Filter } from "feather-icons-react/build/IconComponents";
import useAxios from "../../../utils/hook/useAxios";

const AccountDeptDashboard = () => {
  const axiosInstance = useAxios()

  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = useMemo(() => {
    return userEncryptData ? decrypt({ data: userEncryptData }) : {};
  }, [userEncryptData]);
  const userData = userDecryptData?.data;
  const departmentId = userData?.departmentId;
  const [dataById, setDataById] = useState([]);

  const fetchDepartmentById = async () => {
    // setIsLoading(true)
    try {
      const response = await axiosInstance.post(
        `serviceManagement/department/departmentById`,
        { departmentId: departmentId }
      );
      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setDataById(rows);
        // setIsLoading(false)
      }
    } catch (error) {
      // setIsLoading(false)
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (userData?.isCoreTeam === "0") {
      fetchDepartmentById();
    }
  }, []);

  const getCurrentFormattedDate = () => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", options);
    return dateString.replace(",", "");
  };

  const chartOptions = {
    chart: {
      type: "pie",
    },
    labels: ["Business", "Citizens/Residents", "Non-Residents"],
    colors: ["#405189", "#0ab39c", "#f7b84b"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
  };
  const chartSeries = [40, 25, 35];

  const options = {
    chart: {
      type: "line",
      height: 340,
      toolbar: {
        show: false,
      },
    },
    colors: ["#405189"],
    dataLabels: {
      enabled: true,
      // formatter: (val) => val.toFixed(2),
      style: {
        fontSize: "12px",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 400,
        colors: ["#405189"],
      },
      background: {
        enabled: true,
        foreColor: "#fff",
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#405189",
      },
    },
    stroke: {
      curve: "smooth",
      width: 5,
    },
    xaxis: {
      categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 400,
          colors: "#373d3f",
        },
      },
    },
    yaxis: {
      title: {
        text: "Revenue (in million $)",
      },
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 400,
          colors: "#373d3f",
        },
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      row: {
        colors: ["#aee5ff05", "transparent"],
        opacity: 0.5,
      },
    },
  };

  const series = [
    {
      name: "High - 2013",
      data: [100, 120, 140, 160, 180, 200],
    },
  ];

  const chartOptions1 = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [
        "Deeds And Documents Search Index",
        "Commercial Vessel Registration",
        "Business Licence",
        "Healthcare & Emergency Medical Services",
        "Emergency Food Plan Layer Production Programme",
        "Stores On Credit Programme",
        "Foreign Charter Licence",
        "Flat (fly) Fishing Licence",
        "Real Property Tax",
        "Inward Declaration And Application For Cruising Permit",
      ],
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 400,
          colors: "#373d3f",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 400,
          colors: "#373d3f",
        },
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      row: {
        colors: ["#aee5ff05", "transparent"],
        opacity: 0.5,
      },
    },
    colors: ["rgba(247, 184, 75, 0.85)"],
  };

  const chartSeries1 = [
    {
      name: "Series 1",
      data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    },
  ];

  const chartData = {
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      colors: ["rgb(64, 81, 137)", "rgb(247, 184, 75)"],
      plotOptions: {
        bar: {
          horizontal: false,
          endingShape: "flat",
          columnWidth: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["Q1", "Q2", "Q3", "Q4"],
        labels: {
          style: {
            colors: "#373d3f",
            fontSize: "12px",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        title: {
          text: "Revenue (in million $)",
          style: {
            fontSize: "12px",
            fontWeight: 900,
            fontFamily: "Helvetica, Arial, sans-serif",
            color: "#373d3f",
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 20,
        labels: {
          colors: "#373d3f",
          useSeriesColors: false,
        },
        markers: {
          width: 12,
          height: 12,
          radius: 2,
          offsetY: 2,
        },
      },
      grid: {
        borderColor: "#e0e0e0",
        strokeDashArray: 0,
        padding: {
          left: 0,
          right: 0,
        },
      },
    },
    series: [
      {
        name: "2022",
        data: [64, 70, 90, 50],
      },
      {
        name: "2023",
        data: [80, 85, 95, 60],
      },
    ],
  };

  const colors = [
    "rgb(64, 81, 137)",
    "rgb(240, 101, 72)",
    "rgb(247, 184, 75)",
    "rgb(10, 179, 156)",
  ];

  const commonOptions = {
    chart: {
      height: 350,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "70%",
        },
        track: {
          show: true,
          background: "#e7e7e7",
          strokeWidth: "100%",
        },
        dataLabels: {
          showOn: "always",
          name: {
            show: false,
          },
          value: {
            color: "#111",
            fontSize: "30px",
            show: true,
            offsetY: 5,
          },
        },
      },
    },
  };

  const series1 = [79, 95, 90, 93];
  const radialLabels = [
    "Customer Queries Resolution",
    "Collection Efficiency",
    "Payment Processing Time",
    "Invoice Accuracy",
  ];

  const chartData1 = {
    series: [
      {
        name: "Due Payments",
        data: [30, 40, 45, 50, 49, 60, 70, 91, 125, 135, 148, 159],
      },
      {
        name: "Delayed Payments",
        data: [20, 35, 45, 55, 60, 70, 80, 95, 110, 121, 135, 148],
      },
      {
        name: "Unpaid Accounts",
        data: [10, 25, 35, 45, 50, 55, 65, 75, 85, 98, 109, 123],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      colors: ["rgb(64, 81, 137)", "rgb(247, 184, 75)", "rgb(10, 179, 156)"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
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
      },
      yaxis: {
        title: {
          text: "Amount (in dollars)",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands";
          },
        },
      },
    },
  };

  const chartData2 = {
    series: [
      {
        name: "Outstanding Debts (In Thousands)",
        type: "column",
        data: [30, 40, 45, 50, 49, 60, 70, 80, 90, 100, 110, 120],
      },
      {
        name: "Collection Rate (%)",
        type: "line",
        data: [13, 140, 150, 160, 170, 180, 195, 199, 180, 200, 210, 222],
      },
    ],
    chart: {
      type: "line",
    },
    stroke: {
      width: [0, 3],
    },
    dataLabels: {
      enabled: true,
    },
    labels: [
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
    xaxis: {
      type: "labels",
      title: {
        text: "Months",
      },
    },
    yaxis: [
      {
        title: {
          text: "Amount",
        },
      },
      {
        opposite: true,
        title: {
          text: "Percentage",
        },
      },
    ],
    plotOptions: {
      bar: {
        columnWidth: "47%",
        colors: {
          ranges: [
            {
              from: 0,
              to: Infinity,
              color: "rgb(64, 81, 137)",
            },
          ],
        },
      },
    },
  };

  const chartData3 = {
    series: [
      { name: "Budget - 2023", data: [30, 40, 45, 50, 49, 60, 70, 91, 125] },
      { name: "Revenue - 2023", data: [20, 35, 45, 55, 60, 70, 80, 95, 110] },
    ],
    options: {
      chart: {
        type: "line",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        show: true,
        width: 5,
        colors: ["#405189", "#f7b84b"],
      },
      markers: {
        size: 5,
        colors: ["#405189", "#f7b84b"],
        strokeColors: ["#405189", "#f7b84b"],
        strokeWidth: 3,
      },
      xaxis: {
        categories: [
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
        ],
        title: {
          text: "Year",
        },
      },
      yaxis: {
        title: {
          text: "Amount (in million $)",
        },
      },
      fill: {
        opacity: 1,
      },
      grid: {
        borderColor: "#e0e0e0",
        strokeDashArray: 0,
        padding: {
          left: 0,
          right: 0,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
      },
    },
  };

  const series2 = [
    {
      name: "Revenue",
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
    },
  ];

  const options2 = {
    chart: {
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    colors: ["#405189", "#3bafda", "#4caf50"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal", // you can also use "vertical"
        shadeIntensity: 0.5,
        gradientToColors: ["#3bafda", "#4caf50"], // the second gradient color
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#e0e0e0",
      padding: {
        left: 0,
        right: 0,
      },
    },
    xaxis: {
      categories: [
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
        "2026",
      ],
      title: {
        text: "Year",
        style: {
          fontWeight: 900,
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          colors: "#373d3f",
          fontSize: "12px",
          fontWeight: 400,
          fontFamily: "Helvetica, Arial, sans-serif",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    markers: {
      size: 6,
      colors: ["#405189"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    legend: {
      show: false,
    },
  };

  const chartOptions11 = {
    series: [
      {
        name: "Registrar Generals Department",
        type: "column",
        data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 17],
      },
      {
        name: "Department of Inland Revenue",
        type: "line",
        data: [25, 35, 27, 16, 10, 17, 22, 35, 55, 37, 39, 48],
      },
      {
        name: "Agriculture and Marine Resources",
        type: "line",
        data: [44, 50, 41, 37, 22, 41, 20, 35, 45, 32, 25, 16],
      },
    ],
    chart: {
      type: "line",
    },
    stroke: {
      width: [0, 2, 4],
    },
    labels: [
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
    xaxis: {
      type: "labels",
    },
    yaxis: [
      {
        title: {
          text: "Revenue in $ million",
        },
      },
    ],
    plotOptions: {
      bar: {
        columnWidth: "47%",
        colors: {
          ranges: [
            {
              from: 0,
              to: Infinity,
              color: "rgb(64, 81, 137)",
            },
          ],
        },
      },
    },
  };

  const chartOptions6 = {
    chart: {
      type: "donut",
      height: 350,
    },
    labels: ["On Time", "Overdue", "Bad Debt"],
    colors: ["rgb(64, 81, 137)", "rgb(247, 184, 75)", "rgb(10, 179, 156)"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
      style: {
        fontSize: "16px",
      },
      dropShadow: {
        enabled: true,
      },
    },
  };

  const chartSeries6 = [70, 25, 5];

  document.title = "Dashboard | eGov Solution"

  return (
    <>
      <div className="main-content dashboard-ana">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
           
              <div className="col-12 mb-4" >
                <div className="d-flex align-items-sm-center flex-sm-row flex-column">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      {/* <div>
                        <p className="avatar-sm bg-primary mb-0 rounded-circle fs-20 text-white d-flex align-items-center justify-content-center">
                          {" "}
                          <img
                            src={
                              dataById.length > 0
                                ? dataById[0].imageData.documentPath
                                : ""
                            }
                            alt=""
                            className="avatar-sm rounded-circle"
                          />
                        </p>
                      </div> */}
                      <div className="ms-3">
                        {/* <h5 className="mb-0">{dataById[0]?.departmentName}</h5> */}
                        <h5 className="mb-0">Account Department</h5>
                        <p className="fs-15 mt-1 text-muted mb-0">
                          Hello, {userData?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mt-lg-0">
                    <form >
                      <div className="row g-3 mb-0 align-items-center justify-content-end">
                        <div className="col-auto">
                          <div className="flex-shrink-0">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className="dropdown card-header-dropdown d-flex align-items-center">
                                  <div
                                    className="d-flex align-items-center"
                                    href="#"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    title="Date Range"
                                  >
                                    <span className="mb-0 me-2 fs-15 text-muted current-date">
                                      {getCurrentFormattedDate()}
                                    </span>
                                  </div>
                                  <div
                                    className="dropdown-menu dropdown-menu-end shadow"
                                    data-popper-placement="bottom-end"
                                  >
                                    <span
                                      title="Yesterday"
                                      className="dropdown-item"
                                    >
                                      Yesterday
                                    </span>
                                    <span
                                      title="This Week"
                                      className="dropdown-item border-top"
                                    >
                                      This Week
                                    </span>
                                    <span
                                      title="Last Week"
                                      className="dropdown-item border-top"
                                    >
                                      Last 7 Days
                                    </span>
                                    <span
                                      title="This Month"
                                      className="dropdown-item border-top"
                                    >
                                      Last 30 Days
                                    </span>
                                    <span
                                      title="This Year"
                                      className="dropdown-item border-top"
                                    >
                                      This Year
                                    </span>
                                    <span
                                      title="Custom Range"
                                      className="dropdown-item border-top"
                                    >
                                      Custom Range
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-xl-3 col-md-6">
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                              Account Receivable
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              $
                              <span className="counter-value" data-target="75">
                                75
                              </span>
                              million
                            </h4>
                            <a href="" className="">
                              View More
                            </a>
                          </div>
                          <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title badge-soft-success bg-success-subtle rounded fs-3">
                              <i className="ri-hand-coin-line text-success"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-md-6">
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                              Overdue
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              $
                              <span className="counter-value" data-target="22">
                                22
                              </span>
                              million
                            </h4>
                            <a href="" className="">
                              View More
                            </a>
                          </div>
                          <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title badge-soft-info bg-info-subtle rounded fs-3">
                              <i className="bx ri-exchange-dollar-line text-info"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-md-6">
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                              Overdue(%)
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              <span className="counter-value" data-target="12">
                                12
                              </span>
                              %
                            </h4>
                            <a href="" className="">
                              View More
                            </a>
                          </div>
                          <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title badge-soft-warning bg-warning-subtle rounded fs-3">
                              <i className="bx ri-history-fill text-warning"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-md-6">
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                              Cash in Hand
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              $
                              <span
                                className="counter-value"
                                data-target="2500"
                              >
                                2,500
                              </span>
                              million
                            </h4>
                            <a href="" className="">
                              View More
                            </a>
                          </div>
                          <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title badge-soft-primary bg-primary-subtle rounded fs-3">
                              <i className="bx bx-wallet text-primary"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-8 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header border-0 align-items-center d-flex">
                        <h5 className=" mb-0 flex-grow-1">
                          Top 3 Earning Departments
                        </h5>
                        <div className="col-sm-auto mx-3 gap-1 row">
                          <button
                            type="button"
                            className="btn btn-soft-secondary btn-sm col"
                          >
                            VIEW ALL
                          </button>
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
                            1M
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft-secondary btn-sm col"
                          >
                            6M
                          </button>
                          <button
                            type="button"
                            className="btn btn-soft-primary btn-sm col"
                          >
                            1Y
                          </button>
                        </div>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div className="dropdown-menu dropdown-menu-end shadow-none" style={{ width: "270px" }} >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-deafult-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly="readonly"
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

                      <div className="card-header p-0 border-0 bg-light-subtle">
                        <div className="row g-0 text-center">
                          <div className="col-6 col-sm-4">
                            <div className="p-3 border border-dashed border-start-0">
                              <h5 className="mb-1">
                                $ <span className="counter-value" data-target="40" > 40 </span> m
                              </h5>
                              <p className="text-muted mb-0">
                                Registrar Generals Department
                              </p>
                            </div>
                          </div>
                          <div className="col-6 col-sm-4">
                            <div className="p-3 border border-dashed border-start-0">
                              <h5 className="mb-1">
                                $
                                <span
                                  className="counter-value"
                                  data-target="50"
                                >
                                  50
                                </span>
                                m
                              </h5>
                              <p className="text-muted mb-0">
                                Department of Inland Revenue
                              </p>
                            </div>
                          </div>
                          <div className="col-6 col-sm-4">
                            <div className="p-3 border border-dashed border-start-0">
                              <h5 className="mb-1">
                                $
                                <span
                                  className="counter-value"
                                  data-target="30"
                                >
                                  30
                                </span>
                                m
                              </h5>
                              <p className="text-muted mb-0">
                                Agriculture and Marine Resources
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-body p-0 pb-2">
                        <div className="w-100">
                          <ReactApexChart
                            options={chartOptions11}
                            series={chartOptions11.series}
                            type="line"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">
                          Revenue Breakdown by Geographical Region (Top 3)
                        </h5>
                        <div>
                          <button
                            type="button"
                            className="btn btn-soft-secondary btn-sm"
                          >
                            VIEW ALL
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {/* <div id="bs-map" style={{ height: "269px" }}></div> */}
                        <div className="bs-map d-flex justify-content-center">
                          <GeolocationRevenue />
                        </div>

                        <div className="px-2 py-2 mt-1">
                          <p className="mb-1">
                            Grand Bahama (including Freeport){" "}
                            <span className="float-end">75%</span>
                          </p>
                          <div
                            className="progress mt-2"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar progress-bar-striped bg-primary"
                              role="progressbar"
                              style={{ width: "75%" }}
                              aria-valuenow="75"
                              aria-valuemin="0"
                              aria-valuemax="75"
                            ></div>
                          </div>

                          <p className="mt-3 mb-1">
                            Abaco Islands <span className="float-end">47%</span>
                          </p>
                          <div
                            className="progress mt-2"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar progress-bar-striped bg-primary"
                              role="progressbar"
                              style={{ width: "47%" }}
                              aria-valuenow="47"
                              aria-valuemin="0"
                              aria-valuemax="47"
                            ></div>
                          </div>

                          <p className="mt-3 mb-1">
                            Andros Island <span className="float-end">82%</span>
                          </p>
                          <div
                            className="progress mt-2"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar progress-bar-striped bg-primary"
                              role="progressbar"
                              style={{ width: "82%" }}
                              aria-valuenow="82"
                              aria-valuemin="0"
                              aria-valuemax="82"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="flex-grow-1 mb-0">
                          Compliance Rates by Category
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-default-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <div id="CompRates" className="apex-charts" dir="ltr">
                          <ApexCharts
                            options={chartOptions}
                            series={chartSeries}
                            type="pie"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="flex-grow-1 mb-0">
                          Outstanding by Status
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-default-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <Chart
                          options={chartOptions6}
                          series={chartSeries6}
                          type="donut"
                          height={350}
                        />
                      </div>
                    </div>
                  </div>

                  <Col xs={12} xl={6} xxl={4} className="d-flex flex-column">
                    <Card className="flex-grow-1">
                      <Card.Header className="d-flex align-items-center">
                        <h5 className="mb-0 flex-grow-1">
                          Year-over-Year (YoY) Revenue Comparison
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-default-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly="readonly"
                                  />
                                  <div className="input-group-text bg-primary border-primary text-white">
                                    <i className="ri-calendar-2-line"></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div
                          id="yoyChart"
                          className="apex-charts"
                          style={{ minHeight: "355px" }}
                        >
                          <ApexCharts
                            options={options}
                            series={series}
                            type="line"
                            height={340}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="mb-0 flex-grow-1">
                          Top Contributors to Revenue by Services
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="btn btn-primary btn-sm me-1">
                              <span
                                className="fw-semibold text-uppercase fs-12"
                              // onClick={}
                              >
                                <Filter
                                  width="24"
                                  height="24"
                                  className="feather feather-filter icon-xs"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <ReactApexChart
                          options={chartOptions1}
                          series={chartSeries1}
                          type="bar"
                          height={350}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header  d-flex align-items-center">
                        <h5 className="mb-0 flex-grow-1">
                          Quarter-over-Quarter (QoQ) Revenue Comparison
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    defaultValue="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <Chart
                          options={chartData.options}
                          series={chartData.series}
                          type="bar"
                          height={350}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Operational Metrics Impacting Revenue
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    defaultValue="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <div className="row gy-2 gx-2">
                          {series1.map((percentage, index) => (
                            <div
                              key={index}
                              className="col-6 d-flex justify-content-center align-items-center text-center"
                            >
                              <div className="card-wrap d-flex align-items-center flex-column">
                                <ApexCharts
                                  options={{
                                    ...commonOptions,
                                    colors: [colors[index]], // Set the color for the current chart
                                  }}
                                  series={[percentage]}
                                  type="radialBar"
                                  height={180}
                                />
                                <h6 className="mt-3">{radialLabels[index]}</h6>{" "}
                                {/* Label below the chart */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Outstanding Receivables by Month
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-deafult-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <div
                          id="column_stacked_chart"
                          className="apex-charts"
                          dir="ltr"
                          style={{ minHeight: "365px" }}
                        >
                          <ReactApexChart
                            options={chartData1.options}
                            series={chartData1.series}
                            type="bar"
                            height={350}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Monthly Collection Efficiency and Outstanding Debts
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-deafult-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <div
                          id="monthlycollectionefficiency"
                          className="apex-charts"
                          dir="ltr"
                        >
                          <ReactApexChart
                            options={chartData2}
                            series={chartData2.series}
                            type="line"
                            height={350}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Budget vs Actual Revenue (2018-2023)
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-deafult-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly
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
                        <div
                          id="budvsact"
                          className="apex-charts"
                          dir="ltr"
                          style={{ minHeight: "365px" }}
                        >
                          <ReactApexChart
                            options={chartData3.options}
                            series={chartData3.series}
                            type="line"
                            height={350}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6 col-xxl-4 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Revenue Forecasting and Projections
                        </h5>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm me-1">
                                <span
                                  className="fw-semibold text-uppercase fs-12"
                                // onClick={}
                                >
                                  <Filter
                                    width="24"
                                    height="24"
                                    className="feather feather-filter icon-xs"
                                  />
                                </span>
                              </div>
                              <div
                                className="dropdown-menu dropdown-menu-end shadow-none"
                                style={{ width: "270px" }}
                              >
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control border-0 dash-filter-picker shadow flatpickr-input"
                                    data-provider="flatpickr"
                                    data-range-date="true"
                                    data-date-format="d M, Y"
                                    data-deafult-date="01 Jan 2023 to 31 Jan 2023"
                                    readOnly={true}
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
                        <ReactApexChart
                          options={options2}
                          series={series2}
                          type="line"
                          height={350}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xl-12 col-xxl-8 d-flex flex-column">
                    <div className="card flex-grow-1">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">Top 5 Ministries</h5>
                        <div>
                          <button
                            type="button"
                            className="btn btn-soft-secondary btn-sm"
                          >
                            VIEW ALL
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive scrollbar-style">
                          <table className="table align-middle table-mobile table-striped-columns mb-0 com_table">
                            <thead className="table-light">
                              <tr className="text-capitalize">
                                <th>Ministry</th>
                                <th>Commencement Date</th>
                                <th>Annual Revenue Contribution</th>
                                <th>Fiscal Budget</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Ministry of Agriculture</td>
                                <td>22 Sep 2023</td>
                                <td>$150 million</td>
                                <td>$200 million</td>
                                <td className="text-center">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#top-five-mini"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  Ministry of Education, Technology, and
                                  Vocational Training
                                </td>
                                <td>22 Sep 2023</td>
                                <td>$80 million</td>
                                <td>$120 million</td>
                                <td className="text-center">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#top-five-mini"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  Ministry of the Environment and Natural
                                  Resources
                                </td>
                                <td>22 Sep 2023</td>
                                <td>$70 million</td>
                                <td>$90 million</td>
                                <td className="text-center">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#top-five-mini"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>Ministry of Finance</td>
                                <td>22 Sep 2023</td>
                                <td>$500 million</td>
                                <td>$1 billion</td>
                                <td className="text-center">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#top-five-mini"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td>Ministry of Economic Affairs</td>
                                <td>22 Sep 2023</td>
                                <td>$200 million</td>
                                <td>$250 million</td>
                                <td className="text-center">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#top-five-mini"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-12 d-flex flex-column">
                  <div className="card flex-grow-1">
                    <div className="card-header align-items-center d-flex">
                      <h5 className="mb-0 flex-grow-1">Top 5 departments</h5>
                      <div>
                        <button
                          type="button"
                          className="btn btn-soft-secondary btn-sm"
                        >
                          VIEW ALL
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive scrollbar-style">
                        <table className="table align-middle table-mobile table-striped-columns mb-0 com_table">
                          <thead className="table-light">
                            <tr>
                              <th>Department</th>
                              <th>Annual Revenue Contribution</th>
                              <th>Fiscal Budget</th>
                              <th>Major Revenue Sources</th>
                              <th>Economic Impact</th>
                              <th>Number of Employees</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Department of Agriculture</td>
                              <td>$120 million</td>
                              <td>$150 million</td>
                              <td>Agricultural exports, Subsidies</td>
                              <td>Significant in agricultural sector</td>
                              <td>400</td>
                            </tr>
                            <tr>
                              <td>Department of Archives</td>
                              <td>$30 million</td>
                              <td>$40 million</td>
                              <td>Archival services, Historical tours</td>
                              <td>Moderate in educational sector</td>
                              <td>100</td>
                            </tr>
                            <tr>
                              <td>Office of the Auditor General</td>
                              <td>$50 million</td>
                              <td>$60 million</td>
                              <td>Audit services, Financial assessments</td>
                              <td>High in governmental accountability </td>
                              <td>150</td>
                            </tr>
                            <tr>
                              <td>
                                Bahamas Department of Correctional Services
                              </td>
                              <td>$70 million</td>
                              <td>$80 million</td>
                              <td>
                                Correctional services, Rehabilitation programs
                              </td>
                              <td>Moderate in public safety sector</td>
                              <td>300</td>
                            </tr>
                            <tr>
                              <td>Bahamas Information Services</td>
                              <td>$40 million</td>
                              <td>$55 million</td>
                              <td>
                                Information dissemination, Public relations
                              </td>
                              <td>Significant in communication sector</td>
                              <td>200</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-xl-12 d-flex flex-column">
                  <div className="card flex-grow-1">
                    <div className="card-header align-items-center d-flex">
                      <h5 className="mb-0 flex-grow-1">Top 5 services</h5>
                      <div>
                        <button
                          type="button"
                          className="btn btn-soft-secondary btn-sm"
                        >
                          VIEW ALL
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive scrollbar-style">
                        <table className="table align-middle table-mobile table-striped-columns  mb-0 com_table">
                          <thead className="table-light">
                            <tr>
                              <th>Service</th>
                              <th>Annual Revenue</th>
                              <th>Contribution to GDP</th>
                              <th>Primary Beneficiaries</th>
                              <th>Number of Transactions/Year</th>
                              <th>Growth Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Tourism and Hospitality Services</td>
                              <td>$500 million</td>
                              <td>25%</td>
                              <td>Hotels, Tour Operators</td>
                              <td>2 million</td>
                              <td>5% yearly</td>
                            </tr>
                            <tr>
                              <td>Financial Services</td>
                              <td>$300 million</td>
                              <td>15%</td>
                              <td>Banks, Investors</td>
                              <td>500,000</td>
                              <td>3% yearly</td>
                            </tr>
                            <tr>
                              <td>Import/Export Customs Services</td>
                              <td>$200 million</td>
                              <td>10%</td>
                              <td>Importers/Exporters</td>
                              <td>1 million</td>
                              <td>2% yearly</td>
                            </tr>
                            <tr>
                              <td>Real Estate and Property Services</td>
                              <td>$250 million</td>
                              <td>12%</td>
                              <td>Property Owners, Real Estate Agents</td>
                              <td>100,000</td>
                              <td>4% yearly</td>
                            </tr>
                            <tr>
                              <td>Business and Investment Services</td>
                              <td>$150 million</td>
                              <td>7%</td>
                              <td>Entrepreneurs, Foreign Investors</td>
                              <td>50,000</td>
                              <td>6% yearly</td>
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
          <ScrollToTop />
        </div>
      </div>
    </>
  );
};

export default AccountDeptDashboard;
