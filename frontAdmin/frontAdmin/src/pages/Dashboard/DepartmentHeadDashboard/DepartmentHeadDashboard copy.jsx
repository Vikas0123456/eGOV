import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import netclues from "../../../assets/images/netcluesCopy.png";
import { useSelector } from "react-redux";
import { FiFilter } from "react-icons/fi";
import { Autoplay, Pagination } from "swiper/modules";
import ApexChart from "./ServiceChart";
import TeamvsTicketChart from "./TeamvsTicketChart";
import "swiper/css";
import "swiper/css/pagination";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import SupportTickets from "../../TicketingSystem/Tickets/SupportTickets";
import ActiveApplications from "../../Applications/ActiveApplications/ActiveApplications";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import AnnouncementCarousel from "../AnnouncementCarousel";
import { Dropdown, DropdownButton } from 'react-bootstrap';
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import useAxios from "../../../utils/hook/useAxios";

function calculatePercentages(statuses) {
  // Destructure the statuses object to get the counts
  const { completed, inProgress, new: newStatus, pending } = statuses;

  // Calculate the total number of items
  const total = completed + inProgress + newStatus + pending;

  // Calculate percentages
  const percentages = {
    completed: (total === 0) ? 0 : (completed / total) * 100,
    inProgress: (total === 0) ? 0 : (inProgress / total) * 100,
    new: (total === 0) ? 0 : (newStatus / total) * 100,
    pending: (total === 0) ? 0 : (pending / total) * 100
  };

  return percentages;
}
function formatDateString(inputDateString) {
  const dateObject = new Date(inputDateString);
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObject.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
const DeptHeadDashboard = () => {
  const axiosInstance = useAxios()
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = useMemo(() => {
    return userEncryptData ? decrypt({ data: userEncryptData }) : {};
  }, [userEncryptData]);
  const userData = userDecryptData?.data;
  const departmentId = userData?.departmentId;
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const dashboardType = useSelector((state) => state.dashboardType);
  const [ticketCount, setTicketCount] = useState()
  const [ticketCountPercentage, setTicketCountPercentage] = useState()
  const [serviceRequest, setSericeRequest] = useState()
  const [serviceRequestDuration, setSericeRequestDuration] = useState("")
  const [serviceRevenueDuration, setSericeRevenueDuration] = useState("")
  const [serviceRevenueData, setSericeRevenueData] = useState([])
  const [selectStartDate, setSelectStartDate] = useState();
  const [selectEndDate, setSelectEndDate] = useState();
  const [dateStart, setDateStart] = useState();
  const [dateEnd, setDateEnd] = useState();
  const [isServiceDaterange, setIsServiceDaterange] = useState(false)
  const [serviceCountPercentage, setServiceCountPercentage] = useState()
  const [teamVsTicketduration, setTeamVsTicketduration] = useState("");
  const [dataById, setDataById] = useState([]);
  const [ticketvsteamData, setTicketvsteamData] = useState([])
  const [selectStartDateTeamvsTicket, setSelectStartDateTeamvsTicket] = useState();
  const [selectEndDateTeamvsTicket, setSelectEndDateTeamvsTicket] = useState();
  const [dateStartTeamvsTicket, setDateStartTeamvsTicket] = useState();
  const [dateEndTeamvsTicket, setDateEndTeamvsTicket] = useState();
  const [isDaterangeTeamvsTicket, setIsDaterangeTeamvsTicket] = useState(false)
  const [selectedServicesRequest, setSelectedServicesRequest] = useState("All");
  const [teamRequestLoading, setTeamRequestLoading] = useState(true);
  const [serviceRequestLoading,setServiceRequestLoading] = useState(true)
  const [serviceRevenueLoading,setServiceRevenueLoading] = useState(true)
  const [announcementloading,setAnnouncementLoading] = useState(true)
  const [ticketloading,setTicketloading] = useState(true);

  const [showServiceRequestsDateRange, setShowServiceRequestsDateRange] = useState(false);
  const [selectServiceRequestsStartDate, setSelectServiceRequestsStartDate] =
    useState(null);
  const [selectServiceRequestsEndDate, setSelectServiceRequestsEndDate] = useState(null);
  const [dateStartServiceRequests, setDateStartServiceRequests] = useState(null);
  const [dateEndServiceRequests, setDateEndServiceRequests] = useState(null);

  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  
  const slugsToCheck = ["announcements", "revenue", "services", "applications", "tickets"];
  
  const getPermission = (slug) => {
    const permission = userPermissionsDecryptData?.data?.find(
      (module) => module.slug === slug
    );
    return permission ? hasViewPermission(permission) : false;
  };
  
  const permissions = {};
  
  slugsToCheck.forEach((slug) => {
    permissions[slug] = getPermission(slug);
  });
  
  const announcementsViewPermission = permissions["announcements"];
  const revenueViewPermission = permissions["revenue"];
  const servicesViewPermission = permissions["services"];
  const applicationsViewPermission = permissions["applications"];
  const ticketsViewPermission = permissions["tickets"];

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
    // setIsServiceDaterange(false)
  }
  function onChangeHandlerTeamvsTicket(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectStartDateTeamvsTicket(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectEndDateTeamvsTicket(formattedendDate);
    }
    setDateStartTeamvsTicket(value[0]);
    setDateEndTeamvsTicket(value[1]);
    // setIsServiceDaterange(false)
  }

  function onChangeServiceRequestsHandler(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectServiceRequestsStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectServiceRequestsEndDate(formattedendDate);
    }
    setDateStartServiceRequests(value[0]);
    setDateEndServiceRequests(value[1]);

    if (formattedstartDate && formattedendDate) {
      setSericeRequestDuration("Custom");
    }
    setShowServiceRequestsDateRange(false);
  }

  const handleDateRangeSeviceRevenueOpen = () => {
    setIsServiceDaterange(!isServiceDaterange)
  }
  const handleDateRangeTeamvsTicket = () => {
    setIsDaterangeTeamvsTicket(!isDaterangeTeamvsTicket)
  }
  const fetchDepartmentById = async () => {
    
    try {
     
      const response = await axiosInstance.post(
        `serviceManagement/department/departmentById`,
        { departmentId: departmentId }
      );
      if (response?.data) {
        const { rows, count } = response?.data?.data;

        setDataById(rows);
       
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  const fetchTicketCount = async () => {
    try {
      setTicketloading(true);
      const response = await axiosInstance.post(
        `ticketService/ticket/statusCount`,
        { departmentId: departmentId }
      );
      if (response?.data) {
        const data = response?.data?.data;
        setTicketCount(data)
        setTicketloading(false);
        if (data) {
          let percentage = calculatePercentages(data)
          setTicketCountPercentage(percentage)
        }
      }
    } catch (error) {
      setTicketloading(false);
      console.error(error.message);
    }
  }
  const fetchServiceRequest = async () => {
    try {
      setServiceRequestLoading(true);
      const response = await axiosInstance.post(
        `businessLicense/application/serviceRequests`,
        {
          dateRangeOption: serviceRequestDuration,
          departmentId: userData?.isCoreTeam === "0" ? (userData?.departmentId || "").split(',').map(id => id.trim()) : null,
          dateRange: {
            startDate: selectServiceRequestsStartDate,
            endDate: selectServiceRequestsEndDate,
          },
        }
      );
      if (response?.data) {

        const data = response?.data?.data?.rows;
        setSericeRequest(data)
        setServiceRequestLoading(false);
        if (data) {
          let percentage = calculatePercentages(data)
          setServiceCountPercentage(percentage)
        }
      }
    } catch (error) {
      setServiceRequestLoading(false);
      console.error(error.message);
    }
  }
  const fetchServiceRevenue = async () => {
    try {
      setServiceRevenueLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/serviceRevenue`,
        {
          departmentId: departmentId,
          dateRangeOption: serviceRevenueDuration,
          dateRange: {
            startDate: selectStartDate,
            endDate: selectEndDate,
          }
        }
      );
      if (response?.data) {

        const data = response?.data?.data;
        setSericeRevenueData(data)
        setServiceRevenueLoading(false);
      }
    } catch (error) {
      setServiceRevenueLoading(false);
      console.error(error.message);
    }
  }
  const fetchTeamvsTicket = async () => {
    try {
      setTeamRequestLoading(true);
      const response = await axiosInstance.post(
        `departmentReport/ticket/teamvsticket`,
        {
          departmentId: departmentId,
          dateRangeOption: teamVsTicketduration,
          dateRange: {
            startDate: selectStartDateTeamvsTicket,
            endDate: selectEndDateTeamvsTicket,
          }
        }
      );
      if (response?.data) {
        const data = response?.data?.data;
        setTicketvsteamData(data)
        setTeamRequestLoading(false);
      }
    } catch (error) {
      setTeamRequestLoading(false);
      console.error(error.message);
    }
  }
  useEffect(() => {
    if (userData?.departmentId) {
      fetchTeamvsTicket();
    }
  }, [teamVsTicketduration, selectStartDateTeamvsTicket, selectEndDateTeamvsTicket])
  useEffect(() => {
    if (userData?.departmentId) {
      fetchTicketCount();
    }
  }, [])
  useEffect(() => {
    if (userData?.departmentId) {
      fetchServiceRequest()
    }
  }, [serviceRequestDuration, selectServiceRequestsStartDate, selectServiceRequestsEndDate])

  useEffect(() => {
    if (userData?.departmentId) {
      fetchServiceRevenue()
    }
  }, [serviceRevenueDuration, selectStartDate,
    selectEndDate,])


  useEffect(() => {
    if (userData?.isCoreTeam === "0") {
      fetchDepartmentById();
    }
  }, []);

  const listOfAnnouncements = async () => {
    try {
      setAnnouncementLoading(true)
      const response = await axiosInstance.post(
        `userService/announcement/view`,
        {}
      );
      if (response?.data) {
        const { rows } = response?.data?.data;
        setData(rows);
        setAnnouncementLoading(false)
      }
    } catch (error) {
      setAnnouncementLoading(false)
      console.error("No results found.");
    }
  };

  useEffect(() => {
    listOfAnnouncements();
  }, []);
  
  const LinewithDataLabels = ({
    serviceRevenueData,
    dataColors,
    year,
    revenueViewPermission,
    servicesViewPermission,
  }) => {
    // Extracting serviceCount and revenue data from serviceRevenueData
    const serviceCountData = serviceRevenueData && serviceRevenueData.map(item => item.serviceCount);
    const revenueData = serviceRevenueData && serviceRevenueData.map(item => item.revenue);
  
    const series = [
      {
        name: "Service Request",
        data: serviceCountData,
      },
      {
        name: "Revenue",
        data: revenueData,
      },
    ];
  
    const options = {
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
      colors: dataColors || ["#00bd9d", "#405189"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [3, 3],
        curve: "smooth",
      },
      title: {
        text: `Service Requests and Revenue`,
        align: "left",
        style: {
          fontWeight: 500,
        },
      },
      grid: {
        row: {
          colors: ["transparent", "transparent"],
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
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Service Request / Revenue",
        },
        min: 0,
        max: Math.max(...serviceCountData, ...revenueData) + 10,
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
  
    const blankOptions = {
      chart: {
        height: 380,
        type: "line",
      },
      colors: ["#cccccc", "#cccccc"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [3, 3],
        curve: "smooth",
      },
      title: {
        text: "No Data Available",
        align: "left",
        style: {
          fontWeight: 500,
          color: "#cccccc",
        },
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Service Request / Revenue",
        },
        min: 0,
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
  
    if (!revenueViewPermission && !servicesViewPermission) {
      return (
        <ReactApexChart
          dir="ltr"
          options={blankOptions}
          series={[{ name: "No Data", data: [] }]}
          type="line"
          height="380"
          className="apex-charts"
        />
      );
    }
  
    return (
      <ReactApexChart
        dir="ltr"
        options={options}
        series={series}
        type="line"
        height="380"
        className="apex-charts"
      />
    );
  }; 
  const handleRequestvsTicketsfilter = (value) => {
    if (value) {
      setTeamVsTicketduration(value);
    }
    setIsDaterangeTeamvsTicket(false)
    setSelectStartDateTeamvsTicket()
    setSelectEndDateTeamvsTicket()
    setDateStartTeamvsTicket()
    setDateEndTeamvsTicket()
    setIsServiceDaterange(false)
    setSelectStartDate()
    setSelectEndDate()
    setDateStart()
    setDateEnd()
  };

  // const handleServiceRequestDuration = (value) => {
  //   if (value) {
  //     setSericeRequestDuration(value);
  //   }
  //   setSelectedServicesRequest(value);
  // };

  const handleServiceRequestDuration = (value) => {
    if (value !== "Custom") {
      setSericeRequestDuration(value);
      setSelectedServicesRequest(value);
      setShowServiceRequestsDateRange(false);
    } else {
      setShowServiceRequestsDateRange(true);
      setSelectedServicesRequest(value);
    }

    if (value !== "Custom") {
    setSelectServiceRequestsStartDate(null);
    setSelectServiceRequestsEndDate(null);
    setDateStartServiceRequests(null);
    setDateEndServiceRequests(null);
    }
  };

  const handleServiceRevenueDuration = (value) => {
    if (value) {
      setSericeRevenueDuration(value);
      setIsServiceDaterange(false)
      setSelectStartDate()
      setSelectEndDate()
      setDateStart()
      setDateEnd()
      setIsDaterangeTeamvsTicket(false)
      setSelectStartDateTeamvsTicket()
      setSelectEndDateTeamvsTicket()
      setDateStartTeamvsTicket()
      setDateEndTeamvsTicket()
    }
  };



  document.title = "Dashboard | eGov Solution";
  return (
    <div id="layout-wrapper">
      <div className="main-content dashboard-ana">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
            
              <DepartmentUserInfo />

              <div className="col-lg-9">
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex align-items-center">
                        <h5 className="flex-grow-1 mb-0">
                          Announcements
                        </h5>
                      </div>
                      {announcementloading ? (
                       <>
                      <div className="card-body p-3" >
                      <LoaderSpin/>
                       </div>
                       </>
                       ): !announcementloading && data.length===0 ? (
                      <>
                       <div className="text-center">
                       <p className="text-muted">No Announcement found.</p>
                       </div>
                       </>
                       ):(
                        <div className="card-body p-3" >
                        <AnnouncementCarousel 
                        items={data}
                         announcementsViewPermission={announcementsViewPermission}
                         />
                          </div>
                       )}
                     
                    </div>
                  </div>
                  <div className="col-xl-7">
                    <div className="card border-0 p-0 ">
                      <div className="card-header align-items-center d-flex flex-wrap ">
                        <h5 className="mb-0 flex-grow-1 title-sr">
                          Service Request vs. Revenue
                        </h5>
                        <div className="col-sm-auto mx-3 ">
                          <button type="button" className={serviceRevenueDuration === "All" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("All")}> ALL </button>
                          <button type="button" className={serviceRevenueDuration === "1w" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("1w")}> 1W </button>
                          <button type="button" className={serviceRevenueDuration === "1m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("1m")}> 1M </button>
                          <button type="button" className={serviceRevenueDuration === "3m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("3m")}> 3M </button>
                          <button type="button" className={serviceRevenueDuration === "6m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("6m")}> 6M </button>
                          <button type="button" className={serviceRevenueDuration === "1y" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceRevenueDuration("1y")}> 1Y </button>
                        </div>
                        <div className="col-sm-auto btn-card-inline">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Date Range" >
                                <div className="fw-semibold text-uppercase fs-12" onClick={handleDateRangeSeviceRevenueOpen}>
                                  <FiFilter style={{ color: "white", fontSize: "15px", }} />
                                </div>
                              </div>

                              <div
                                className={isServiceDaterange ? `dropdown-menu dropdown-menu-end shadow-none show` : `dropdown-menu dropdown-menu-end shadow-none `}
                                style={{
                                  width: '270px',
                                  position: 'absolute',
                                  inset: '0px 0px auto auto',
                                  margin: '0px',
                                  transform: 'translate3d(0px, 30px, 0px)',
                                }}
                                data-popper-placement="bottom-end"
                              >
                                <div className="input-group">
                                  <DateRangePopup dateStart={dateStart} dateEnd={dateEnd} onChangeHandler={onChangeHandler} />
                                  <div className="input-group-text bg-primary border-primary text-white">
                                    <i className="ri-calendar-2-line"></i>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                      {serviceRevenueLoading ? (
                        <div className="card-body">
                        <LoaderSpin height={"300px"} />
                      </div>
                      ) : !serviceRevenueLoading && serviceRevenueData?.length===0 ?(
                        <div className="text-center">
                              <p className="text-muted">No Service Revenue found.</p>
                            </div>
                      ):(
                        <div className="card-body">
                        <LinewithDataLabels
                          serviceRevenueData={serviceRevenueData}
                          revenueViewPermission={revenueViewPermission}
                          servicesViewPermission={servicesViewPermission}
                        />
                      </div>
                      )}
                      
                    </div>
                  </div>
                  <div className="col-xl-5 col-12">
                    <div className="card border-0 p-0 ">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">
                          Team Request vs. Tickets
                        </h5>
                        <div className="col-sm-auto mx-3">
                          <button type="button" className={teamVsTicketduration === "All" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("All")} > ALL </button>
                          <button type="button" className={teamVsTicketduration === "1w" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("1w")} > 1W </button>
                          <button type="button" className={teamVsTicketduration === "1m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("1m")} > 1M </button>
                          <button type="button" className={teamVsTicketduration === "3m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("3m")} > 3M </button>
                          <button type="button" className={teamVsTicketduration === "6m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("6m")} > 6M </button>
                          <button type="button" className={teamVsTicketduration === "1y" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleRequestvsTicketsfilter("1y")} > 1Y </button>
                        </div>
                        <div className="col-sm-auto">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm btn-card-inline" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Date Range" >
                                <div className="fw-semibold text-uppercase fs-12" onClick={handleDateRangeTeamvsTicket}>
                                  <FiFilter />
                                </div>
                              </div>
                              <div
                                className={isDaterangeTeamvsTicket ? `dropdown-menu dropdown-menu-end shadow-none show` : `dropdown-menu dropdown-menu-end shadow-none `}
                                style={{
                                  width: '270px',
                                  position: 'absolute',
                                  inset: '0px 0px auto auto',
                                  margin: '0px',
                                  transform: 'translate3d(0px, 30px, 0px)',
                                }}
                                data-popper-placement="bottom-end"
                              >
                                <div className="input-group">
                                  <DateRangePopup dateStart={dateStartTeamvsTicket} dateEnd={dateEndTeamvsTicket} onChangeHandler={onChangeHandlerTeamvsTicket} />
                                  <div className="input-group-text bg-primary border-primary text-white">
                                    <i className="ri-calendar-2-line"></i>
                                  </div>
                                </div>
                              </div>
                              <div className="dropdown-menu dropdown-menu-end">
                                <div className="dropdown-item"> Request </div>
                                <div className="dropdown-item"> Tickets </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {
                        teamRequestLoading? (<div className="card-body  p-3">
                          <LoaderSpin height={"300px"} />
                        </div>): !teamRequestLoading && ticketvsteamData?.length===0 ?(
                        <div className="text-center">
                              <p className="text-muted">No Ticket Team found.</p>
                            </div>):(
                               <div className="card-body p-3" >
                               <TeamvsTicketChart
                                 data={ticketvsteamData}
                                 ticketsViewPermission={ticketsViewPermission}
                               />
                             </div>
                            )
                      }
                     
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="row">
                  <div className="col-12">
                    <div className="card border-0">
                      <div className="card-header align-items-center d-flex">
                        <div className="d-flex align-items-center flex-grow-1">
                          <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold">
                            Services Request
                          </h4>
                        </div>
                        <div className="flex-shrink-0">
                          <DropdownButton
                            id="dropdown-basic-button"
                            title={<FiFilter />}
                            variant="primary"
                            align="end"
                          >
                            {[
                              { label: "All", value: "All" },
                              { label: "One Week", value: "1w" },
                              { label: "One Month", value: "1m" },
                              { label: "Three Months", value: "3m" },
                              { label: "Six Months", value: "6m" },
                              { label: "One Year", value: "1y" },
                              { label: "Custom", value: "Custom" },
                            ].map((option) => (
                              <Dropdown.Item
                                key={option.value}
                                onClick={() => handleServiceRequestDuration(option.value)}
                                active={selectedServicesRequest === option.value}
                              >
                                {option.label}
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
                        </div>
                      </div>
                        {showServiceRequestsDateRange && (
                        <div className="input-group">
                          <DateRangePopup
                            dateStart={dateStartServiceRequests}
                            dateEnd={dateEndServiceRequests}
                            onChangeHandler={onChangeServiceRequestsHandler}
                          />
                          <div className="input-group-text bg-primary border-primary text-white">
                            <i className="ri-calendar-2-line"></i>
                          </div>
                        </div>
                      )}
                      {serviceRequestLoading? (
                        <div className="card-body p-0 border-0">
                        <LoaderSpin height={"300px"} />
                      </div>
                      ):!serviceRequestLoading && serviceRequest?.length===0 ?(
                        <div className="text-center">
                              <p className="text-muted">No Service Request found .</p>
                            </div>

                      ):(
                        <div className="card-body p-0 border-0">
                        <ApexChart
                          data={serviceRequest}
                          servicesViewPermission={servicesViewPermission}
                        />
                      </div>
                      )}
                      
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card border-0">
                      <div className="card-header">
                        <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold "> Tickets </h4>
                      </div>

                      {ticketloading ? (
                          <div className="card-body border-0 py-2">
                          <LoaderSpin height={"300px"} />
                        </div>
                      ): !ticketloading && !ticketsViewPermission?.length === 0 ?(
                        <div className="text-center">
                              <p className="text-muted">No Ticket found .</p>
                            </div>
                      ):(
                        <>
                        <div className={dashboardType !== "Department Agent" ? "card-body border-0 py-2" : "card-body border-0 pb-0"} >
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-muted">New</h6>
                          </div>
                          <div className="flex-shrink-0">
                            <h6 className="mb-0"> {ticketsViewPermission ? ticketCount?.new || null : null} </h6>
                          </div>
                        </div>
                        <div className="progress animated-progress progress-xl bg-soft-secondary" style={{ borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} >
                          <div className="progress-bar" style={{ backgroundColor: "#405189", width: `${ticketsViewPermission ? ticketCountPercentage?.new || null : null}%`, borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} role="progressbar" aria-valuenow={ticketsViewPermission ? ticketCountPercentage?.new || null : null} aria-valuemin="0" aria-valuemax="100" ></div>
                        </div>
                      </div>
                      <div className={dashboardType !== "Department Agent" ? "card-body border-0 py-2" : "card-body border-0 pb-0"} >
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-muted"> Pending </h6>
                          </div>
                          <div className="flex-shrink-0">
                            <h6 className="mb-0"> {ticketsViewPermission ? ticketCount?.pending || null : null} </h6>
                          </div>
                        </div>
                        <div className="progress animated-progress progress-xl bg-soft-secondary" style={{ borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} >
                          <div className="progress-bar" style={{ backgroundColor: "#f06548", width: `${ticketsViewPermission ? ticketCountPercentage?.pending || null : null}%`, borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} role="progressbar" aria-valuenow={ticketsViewPermission ? ticketCountPercentage?.pending || null : null} aria-valuemin="0" aria-valuemax="100" ></div>
                        </div>
                      </div>
                      <div className={dashboardType !== "Department Agent" ? "card-body border-0 py-2" : "card-body border-0 pb-0"} >
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-muted"> In-Progress </h6>
                          </div>
                          <div className="flex-shrink-0">
                            <h6 className="mb-0"> {ticketsViewPermission ? ticketCount?.inProgress || null : null} </h6>
                          </div>
                        </div>
                        <div className="progress animated-progress progress-xl bg-soft-secondary" style={{ borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} >
                          <div className="progress-bar" style={{ backgroundColor: "#F7B84B", width: `${ticketsViewPermission ? ticketCountPercentage?.inProgress || null : null}%`, borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} role="progressbar" aria-valuenow={ticketsViewPermission ? ticketCountPercentage?.inProgress || null : null} aria-valuemin="0" aria-valuemax="100" ></div>
                        </div>
                      </div>
                      <div className="card-body border-0 pt-2 pb-3">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-muted"> Completed </h6>
                          </div>
                          <div className="flex-shrink-0">
                            <h6 className="mb-0"> {ticketsViewPermission ? ticketCount?.completed || null : null} </h6>
                          </div>
                        </div>
                        <div className="progress animated-progress progress-xl bg-soft-secondary" style={{ borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} >
                          <div className="progress-bar" style={{ backgroundColor: "#0ab39c", width: `${ticketsViewPermission ? ticketCountPercentage?.completed || null : null}%`, borderRadius: "10px", height: dashboardType !== "Department Agent" ? "10px" : "8px", }} role="progressbar" aria-valuenow={ticketsViewPermission ? ticketCountPercentage?.completed || null : null} aria-valuemin="0" aria-valuemax="100" ></div>
                        </div>
                      </div>
                      </>
                      )}
                      
                    </div>
                  </div>
                </div>
              </div>
              {applicationsViewPermission && (
              <div className="col-lg-12">
                <div className="card border-0">
                  <div className="card-header border-bottom">
                    <h5 className="mb-0">Recent Applications</h5>
                  </div>
                  <ActiveApplications
                    isDashBoard={true}
                  />
                </div>
              </div>
              )}

              {ticketsViewPermission && (
                <div className="col-lg-12 ">
                  <div className="card mb-0 border-0">
                    <div className="card-header border-bottom">
                      <h5 className="mb-0">Recent Tickets</h5>
                    </div>
                    <SupportTickets isDashBoard={true} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DeptHeadDashboard;
