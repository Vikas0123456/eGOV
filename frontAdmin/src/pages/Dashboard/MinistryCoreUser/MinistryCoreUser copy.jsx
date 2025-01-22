import React, { useEffect, useState, useMemo } from "react";
import DeptvsRevenueChart from "./DeptvsRevenueChart";
import ServicevsRevenueChart from "./ServicevsRevenueChart";
import UsersSvg from "../../../assets/svg/UsersSvg";
import RevenueSvg from "../../../assets/svg/RevenueSvg";
import ActiveTicketsSvg from "../../../assets/svg/ActiveTicketsSvg";
import ActiveRequestSvg from "../../../assets/svg/ActiveRequestSvg";
import ActiveUsersSvg from "../../../assets/svg/ActiveUsersSvg";
import ServicesSvg from "../../../assets/svg/ServicesSvg";
import DepartmentsSvg from "../../../assets/svg/DepartmentsSvg";
import RequestAnalysChart from "./RequestAnalysChart";
import SlotCounter from 'react-slot-counter';
import PieChart from "./PieChart";
import PyramidChart from "./PyramidChart";
import GeolocationRevenue from "./GeolocationRevenue";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import AnnouncementsAddUpdateModal from "./AnnouncementsAddUpdateModal";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { Filter } from "feather-icons-react/build/IconComponents";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import RequestAssignedSvg from "../../../assets/svg/RequestAssignedSvg";
import ClockIconSvg from "../../../assets/svg/ClockIconSvg";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import SimpleBar from "simplebar-react";
import AnnouncementsSvg from "../../../assets/svg/AnnouncementsSvg";
import useAxios from "../../../utils/hook/useAxios";
import SettingsIconSvg from "../../../assets/svg/SettingsIconSvg";

const MinistryCoreUserDashborad = () => {
  const axiosInstance = useAxios()
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = useMemo(() => {
    return userEncryptData ? decrypt({ data: userEncryptData }) : {};
  }, [userEncryptData]);
  const userData = userDecryptData?.data;
  const userId = userData?.id;


  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };

  const slugsToCheck = ["citizens", "departments", "revenue", "services", "reviewfeedback", "applications", "tickets"];

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

  const citizensViewPermission = permissions["citizens"];
  const departmentsViewPermission = permissions["departments"];
  const revenueViewPermission = permissions["revenue"];
  const servicesViewPermission = permissions["services"];
  const reviewfeedbackViewPermission = permissions["reviewfeedback"];
  const applicationsViewPermission = permissions["applications"];
  const ticketsViewPermission = permissions["tickets"];


  const [id, setId] = useState();
  const [serviceRequest, setSericeRequest] = useState();
  const [serviceRequestDuration, setSericeRequestDuration] = useState("");
  const [
    serviceManagementDateRangeOption,
    setServiceManagementDateRangeOption,
  ] = useState("");
  const [topEarningServiceDuration, setTopEarningServiceDuration] =
    useState("");
  const [topEarningDepartmentDuration, setTopEarningDepartmentDuration] =
    useState("");
  const [topEarningDepartment, setTopEarningDepartment] = useState("");
  const [topEarningService, setTopEarningService] = useState("");
  const [totalRevenueList, setTotalRevenueList] = useState("");
  const [departmentReportList, setDepartmentReportList] = useState([]);

  const [activeApplicationList, setActiveApplicationList] = useState("");
  const [revenueFilter, setRevenueFilter] = useState("");
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [
    dateRangeOptionForDepartmentVSRevenue,
    DepartmentVSRevenueForDepartmentVSRevenue,
  ] = useState("");
  const [departmentVSRevenueList, setDepartmentVSRevenueList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceManagement, setServiceManagement] = useState([]);
  const [serviceDepartmentCount, setServiceDepartmentCount] = useState(null);
  const [customerAndGenderData, setCustomerAndGenderData] = useState([]);
  const [activeTickes, setActiveTickes] = useState([]);
  const [topRatedServices, setTopRatedServices] = useState([]);

  // all loaders 
  const [topRatedServicesLoading, setTopRatedServicesLoading] = useState(true);
  const [departmentReportLoading, setDepartmentReportLoading] = useState(true);
  const [departmentVSRevenueLoading, setDepartmentVSRevenueLoading] = useState(true);
  const [serviceVSRevenueLoading, setServiceVSRevenueLoading] = useState(true);
  const [topEarningServiceLoading, setTopEarningServiceLoading] = useState(true);
  const [topEarningDepartmentLoading, setTopEarningDepartmentLoading] = useState(true);
  const [totalRevenueListLoading, setTotalRevenueListLoading] = useState(true);
  const [serviceDepartmentCountLoading, setServiceDepartmentCountLoading] = useState(true);
  const [customerAndGenderDataLoading, setCustomerAndGenderDataLoading] = useState(true);
  const [activeApplicationListLoading, setActiveApplicationListLoading] = useState(true);
  const [activeTicketsLoading, setActiveTicketsLoading] = useState(true);
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(true);


  const [selectStartDate, setSelectStartDate] = useState(null);
  const [selectServiceVSRevenueStartDate, setSelectServiceVSRevenueStartDate] =
    useState(null);
  const [selectEndDate, setSelectEndDate] = useState(null);
  const [selectServiceVSRevenueEndDate, setSelectServiceVSRevenueEndDate] =
    useState(null);
  const [dateStart, setDateStart] = useState(null);
  const [serviceVSRevenueDateStart, setServiceVSRevenueDateStart] =
    useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [serviceVSRevenueDateEnd, setServiceVSRevenueDateEnd] = useState(null);
  const [
    isDepartmentVSRevenueDropdownOpen,
    setIsDepartmentVSRevenueDropdownOpen,
  ] = useState(false);
  const [isServiceVSRevenueDropdownOpen, setIsServiceVSRevenueDropdownOpen] =
    useState(false);
  const [
    selectedTopEarningDepartmentOption,
    setSelectedTopEarningDepartmentOption,
  ] = useState("All");
  const [selectedTopEarningService, setSelectedTopEarningService] =
    useState("All");
  const [selectedRevenueOption, setSelectedRevenueOption] = useState("All");
  const [selectedRequestAnalysis, setSelectedRequestAnalysis] = useState("All");

  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [selectTopEarningDeptStartDate, setSelectTopEarningDeptStartDate] =
    useState(null);
  const [selectTopEarningDeptEndDate, setSelectTopEarningDeptEndDate] = useState(null);
  const [dateStartTopEarningDept, setDateStartTopEarningDept] = useState(null);
  const [dateEndTopEarningDept, setDateEndTopEarningDept] = useState(null);

  const [showCustomServiceDateRange, setShowCustomServiceDateRange] = useState(false);
  const [selectTopEarningServiceStartDate, setSelectTopEarningServiceStartDate] =
    useState(null);
  const [selectTopEarningServiceEndDate, setSelectTopEarningServiceEndDate] = useState(null);
  const [dateStartTopEarningService, setDateStartTopEarningService] = useState(null);
  const [dateEndTopEarningService, setDateEndTopEarningService] = useState(null);

  const [showCustomRevenueDateRange, setShowCustomRevenueDateRange] = useState(false);
  const [selectRevenueStartDate, setSelectRevenueStartDate] =
    useState(null);
  const [selectRevenueEndDate, setSelectRevenueEndDate] = useState(null);
  const [dateStartRevenue, setDateStartRevenue] = useState(null);
  const [dateEndRevenue, setDateEndRevenue] = useState(null);

  const [showServiceRequestsDateRange, setShowServiceRequestsDateRange] = useState(false);
  const [selectServiceRequestsStartDate, setSelectServiceRequestsStartDate] =
    useState(null);
  const [selectServiceRequestsEndDate, setSelectServiceRequestsEndDate] = useState(null);
  const [dateStartServiceRequests, setDateStartServiceRequests] = useState(null);
  const [dateEndServiceRequests, setDateEndServiceRequests] = useState(null);

  const getCurrentFormattedDate = () => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const currentDate = new Date().toLocaleDateString("en-GB", options);
    const parts = currentDate.split(" ");
    return `${parts[0]} ${parts[1]}, ${parts[2]}`;
  };
  const formattedDate = getCurrentFormattedDate();

  function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const calculateAverageTimePerRequest = (
    RequestCompleted,
    completedDays
  ) => {
    const totalMinutes = parseInt(completedDays, 10);

    if (RequestCompleted > 0) {
      const averageTimeInMinutes = totalMinutes / RequestCompleted;

      const days = Math.floor(averageTimeInMinutes / (60 * 24));
      const hours = Math.floor((averageTimeInMinutes % (60 * 24)) / 60);
      const minutes = Math.floor(averageTimeInMinutes % 60);

      let result = "";

      if (days > 0) {
        result += `${days} day${days > 1 ? "s" : ""}`;
      } else {
        if (hours > 0) {
          result += `${hours} hour${hours > 1 ? "s" : ""} `;
        }
        if (minutes > 0) {
          result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
        }
      }

      if (result.trim() === "") {
        return "_";
      }

      return result.trim();
    }

    return "_";
  };

  const calculateEfficiency = (RequestCompleted, RequestAssigned) => {
    if (RequestAssigned > 0) {
      return ((RequestCompleted / RequestAssigned) * 100).toFixed(2);
    }
    return "0";
  };

  function onChangeDepartmentVSRevenueHandler(value) {
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

    setIsDepartmentVSRevenueDropdownOpen(false);
    DepartmentVSRevenueForDepartmentVSRevenue();
  }

  function onChangeTopEarningDepartmentHandler(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectTopEarningDeptStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectTopEarningDeptEndDate(formattedendDate);
    }
    setDateStartTopEarningDept(value[0]);
    setDateEndTopEarningDept(value[1]);

    if (formattedstartDate && formattedendDate) {
      setTopEarningDepartmentDuration("Custom");
    }

    setShowCustomDateRange(false);
  }

  function onChangeTopEarningServiceHandler(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectTopEarningServiceStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectTopEarningServiceEndDate(formattedendDate);
    }
    setDateStartTopEarningService(value[0]);
    setDateEndTopEarningService(value[1]);

    if (formattedstartDate && formattedendDate) {
      setTopEarningServiceDuration("Custom");
    }

    setShowCustomServiceDateRange(false);
  }

  function onChangeRevenueHandler(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectRevenueStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectRevenueEndDate(formattedendDate);
    }
    setDateStartRevenue(value[0]);
    setDateEndRevenue(value[1]);

    if (formattedstartDate && formattedendDate) {
      setRevenueFilter("Custom");
    }
    setShowCustomRevenueDateRange(false);
  }

  function onChangeServiceVSRevenueHandler(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectServiceVSRevenueStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectServiceVSRevenueEndDate(formattedendDate);
    }
    setServiceVSRevenueDateStart(value[0]);
    setServiceVSRevenueDateEnd(value[1]);

    setIsServiceVSRevenueDropdownOpen(false);
    setServiceManagementDateRangeOption();
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

  const toggleDateDepartmentVSRevenue = () => {
    setIsDepartmentVSRevenueDropdownOpen((prevState) => !prevState);
  };

  const toggleDateServiceVSRevenue = () => {
    setIsServiceVSRevenueDropdownOpen((prevState) => !prevState);
  };

  const getMaxRating = (services) => {
    return Math.max(...services.map((item) => item.totalRatings || 0));
  };

  const calculateStars = (rating, maxRating) => {
    const fullStars = Math.floor((rating / maxRating) * 5); // Count of fully filled stars
    const hasHalfStar = (rating / maxRating) * 5 - fullStars >= 0.5; // Check if we need a half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <div className="fs-16 align-middle text-warning">
        {[...Array(fullStars)].map((_, index) => (
          <i key={index} className="ri-star-fill"></i>
        ))}
        {hasHalfStar && <i className="ri-star-half-fill"></i>}
        {[...Array(emptyStars)].map((_, index) => (
          <i key={index} className="ri-star-line"></i>
        ))}
      </div>
    );
  };

  const services = topRatedServices.rows || [];
  const maxRating = getMaxRating(services);

  const DepartmentVSRevenue = async () => {
    try {
      setDepartmentVSRevenueLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/dashboardRevenueReport`,
        {
          dateRangeOption: dateRangeOptionForDepartmentVSRevenue,
          dateRange: {
            startDate: selectStartDate,
            endDate: selectEndDate,
          },
        }
      );
      if (response) {
        const { data } = response?.data;
        setDepartmentVSRevenueList(data);
        setDepartmentVSRevenueLoading(false);
      }
    } catch (error) {
      console.error(error.message);
      setDepartmentVSRevenueLoading(false);
    } finally {
      setDepartmentVSRevenueLoading(false);
    }
  };

  useEffect(() => {
    DepartmentVSRevenue();
  }, [dateRangeOptionForDepartmentVSRevenue, selectStartDate, selectEndDate]);

  const getDepartmentRevenueList = async () => {
    try {
      setTopEarningDepartmentLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/maximumRevenue`,
        {
          dateRangeOption: topEarningDepartmentDuration,
          dateRange: {
            startDate: selectTopEarningDeptStartDate,
            endDate: selectTopEarningDeptEndDate,
          },
        }
      );
      if (response) {
        const { data } = response?.data;
        setTopEarningDepartment(data);
        setTopEarningDepartmentLoading(false);
      }
    } catch (error) {
      setTopEarningDepartmentLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    getDepartmentRevenueList();
  }, [topEarningDepartmentDuration, selectTopEarningDeptStartDate, selectTopEarningDeptEndDate]);

  const getServiceRevenueList = async () => {
    try {
      setTopEarningServiceLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/maximumRevenue`,
        {
          dateRangeOption: topEarningServiceDuration,
          dateRange: {
            startDate: selectTopEarningServiceStartDate,
            endDate: selectTopEarningServiceEndDate,
          },
        }
      );
      if (response) {
        const { data } = response?.data;
        setTopEarningService(data);
        setTopEarningServiceLoading(false);
      }
    } catch (error) {
      setTopEarningServiceLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    getServiceRevenueList();
  }, [topEarningServiceDuration, selectTopEarningServiceStartDate, selectTopEarningServiceEndDate]);

  const getTotalRevenueList = async () => {
    try {
      setTotalRevenueListLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/totalRevenue`,
        {
          dateRangeOption: revenueFilter,
          dateRange: {
            startDate: selectRevenueStartDate,
            endDate: selectRevenueEndDate,
          },
        }
      );
      if (response) {
        const { data } = response?.data;
        setTotalRevenueList(data);
        setTotalRevenueListLoading(false);
      }
    } catch (error) {
      setTotalRevenueListLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    getTotalRevenueList();
  }, [revenueFilter, selectRevenueStartDate, selectRevenueEndDate]);

  const fetchServiceRequest = async () => {
    try {
      setServiceRequestsLoading(true)
      const response = await axiosInstance.post("businessLicense/application/serviceRequests",
        {
          dateRangeOption: serviceRequestDuration,
          departmentId: userData?.isCoreTeam === "0" ? userData?.departmentId : null,
          dateRange: {
            startDate: selectServiceRequestsStartDate,
            endDate: selectServiceRequestsEndDate,
          },
        },
      );
      if (response?.data) {
        const data = response?.data?.data?.rows;
        setSericeRequest(data);
        setServiceRequestsLoading(false);
      }
    } catch (error) {
      setServiceRequestsLoading(false);
      console.error(error.message);
    }
  };
  useEffect(() => {
    fetchServiceRequest();
  }, [serviceRequestDuration, selectServiceRequestsStartDate, selectServiceRequestsEndDate]);

  const handleTopEarningDeptFilter = (value) => {
    if (value !== "Custom") {
      setTopEarningDepartmentDuration(value);
      setSelectedTopEarningDepartmentOption(value);
      setShowCustomDateRange(false);
    } else {
      setShowCustomDateRange(true);
      setSelectedTopEarningDepartmentOption(value);
    }

    if (value !== "Custom") {
      setSelectTopEarningDeptStartDate(null);
      setSelectTopEarningDeptEndDate(null);
      setDateStartTopEarningDept(null);
      setDateEndTopEarningDept(null);
    }
  };

  const handleTopEarningServicesFilter = (value) => {
    if (value !== "Custom") {
      setTopEarningServiceDuration(value)
      setSelectedTopEarningService(value);
      setShowCustomServiceDateRange(false);
    } else {
      setShowCustomServiceDateRange(true);
      setSelectedTopEarningService(value);
    }

    if (value !== "Custom") {
      setSelectTopEarningServiceStartDate(null);
      setSelectTopEarningServiceEndDate(null);
      setDateStartTopEarningService(null);
      setDateEndTopEarningService(null);
    }
  };

  const handleRevenueFilter = (value) => {
    if (value !== "Custom") {
      setRevenueFilter(value);
      setSelectedRevenueOption(value);
      setShowCustomRevenueDateRange(false);
    } else {
      setShowCustomRevenueDateRange(true);
      setSelectedRevenueOption(value);
    }
    if (value !== "Custom") {
      setSelectRevenueStartDate(null);
      setSelectRevenueEndDate(null);
      setDateStartRevenue(null);
      setDateEndRevenue(null);
    }
  };
  const handleDeptVSrevenueFilter = (value) => {
    if (value) {
      DepartmentVSRevenueForDepartmentVSRevenue(value);
    }
    setSelectStartDate();
    setSelectEndDate();
    setDateStart();
    setDateEnd();
  };
  const handleServiceVSrevFilter = (value) => {
    if (value) {
      setServiceManagementDateRangeOption(value);
    }
    setSelectServiceVSRevenueStartDate();
    setSelectServiceVSRevenueEndDate();
    setServiceVSRevenueDateStart();
    setServiceVSRevenueDateEnd();
  };

  // const handleServiceRequestDuration = (value) => {
  //   if (value) {
  //     setSericeRequestDuration(value);
  //   }
  //   setSelectedRequestAnalysis(value);
  // };

  const handleServiceRequestDuration = (value) => {
    if (value !== "Custom") {
      setSericeRequestDuration(value);
      setSelectedRequestAnalysis(value);
      setShowServiceRequestsDateRange(false);
    } else {
      setShowServiceRequestsDateRange(true);
      setSelectedRequestAnalysis(value);
    }

    if (value !== "Custom") {
      setSelectServiceRequestsStartDate(null);
      setSelectServiceRequestsEndDate(null);
      setDateStartServiceRequests(null);
      setDateEndServiceRequests(null);
    }
  };

  document.title = "Dashboard | eGov Solution";

  const getActiveApplicationList = async () => {
    try {
      setActiveApplicationListLoading(true);
      const response = await axiosInstance.post(
        `departmentReport/activeApplication/list`,
        {}
      );
      if (response) {
        const { data } = response?.data;
        setActiveApplicationList(data);
        setActiveApplicationListLoading(false);
      }
    } catch (error) {
      setActiveApplicationListLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    getActiveApplicationList();
  }, []);

  const getDepartmentReport = async (values) => {
    try {
      setDepartmentReportLoading(true);
      const response = await axiosInstance.post(
        `departmentReport/deptperformance/list`,
        {
          dateRangeOption: dateRangeOptionForDepartmentVSRevenue,
        }
      );
      if (response?.data) {
        const { data } = response?.data;

        setDepartmentReportList(data.application);
        setDepartmentReportLoading(false);
      }
    } catch (error) {
      setDepartmentReportLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    getDepartmentReport();
  }, []);

  const serviceVSRevenueData = async () => {
    try {
      setServiceVSRevenueLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/revenue/data`,
        {
          dateRangeOption: serviceManagementDateRangeOption,
          dateRange: {
            startDate: selectServiceVSRevenueStartDate,
            endDate: selectServiceVSRevenueEndDate,
          },
        }
      );
      if (response?.data) {
        const { data } = response?.data;

        setServiceManagement(data);
        setServiceVSRevenueLoading(false);
      }
    } catch (error) {
      setServiceVSRevenueLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    serviceVSRevenueData();
  }, [
    serviceManagementDateRangeOption,
    selectServiceVSRevenueStartDate,
    selectServiceVSRevenueEndDate,
  ]);

  const serviceAndDepartmentCount = async () => {
    try {
      setServiceDepartmentCountLoading(true);
      const response = await axiosInstance.post(
        `serviceManagement/service/serviceDepartment/count`
      );

      if (response?.data?.data) {
        const { serviceCount, departmentCount } = response.data.data;
        setServiceDepartmentCount({ serviceCount, departmentCount });
        setServiceDepartmentCountLoading(false);
      }
    } catch (error) {
      setServiceDepartmentCountLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    serviceAndDepartmentCount();
  }, []);

  const customerAndGenderList = async () => {
    try {
      setCustomerAndGenderDataLoading(true);
      const response = await axiosInstance.post(
        `userService/customer/customerAndGender/list`,
        {}
      );
      if (response?.data) {
        const { data } = response?.data;
        setCustomerAndGenderData(data);
        setCustomerAndGenderDataLoading(false);
      }
    } catch (error) {
      setCustomerAndGenderDataLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    customerAndGenderList();
  }, []);

  const activeTickesCount = async () => {
    try {
      setActiveTicketsLoading(true);
      const response = await axiosInstance.post(
        `ticketService/ticket/getAllTickets`,
        {}
      );
      if (response?.data) {
        const { data } = response?.data;
        setActiveTickes(data);
        setActiveTicketsLoading(false);
      }
    } catch (error) {
      setActiveTicketsLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    activeTickesCount();
  }, []);

  const topRatedServicesData = async () => {
    try {
      setTopRatedServicesLoading(true);
      const response = await axiosInstance.post(
        "businessLicense/application/topRatedServices",
        {}
      );
      if (response?.data) {
        setTopRatedServices(response.data.data);
        setTopRatedServicesLoading(false);
      }
    } catch (error) {
      console.error(error.message);
      setTopRatedServicesLoading(false);
    } finally {
      setTopRatedServicesLoading(false);
    }
  };

  useEffect(() => {
    topRatedServicesData();
  }, []);

  const generateColor = (index) => {
    const colors = [
      "#33416d",
      "#ff9999",
      "#f3c77b",
      "#49d0bd",
      "#779cda",
      "#a4b2e1",
      "#ff99ff",
      "#c65353",
      "#a6a6a6",
      "#d580ff",
    ];
    return colors[index % colors.length];
  };

  const colorMap = departmentReportList.reduce((acc, department, index) => {
    acc[department.departmentName] = generateColor(index);
    return acc;
  }, {});

  const [isOpen, setIsopen] = useState(false);

  const ToggleSidebar = () => {
      isOpen === true ? setIsopen(false) : setIsopen(true);
  };

  return (
    <>
      {/* <Loader isLoading={loading}> */}
      <div className={`page-content custom-sidebar px-0  ${isOpen == true ? 'menu--open' : ''}`}>
       
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 mt-sm-0 mt-4">
                <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div>
                        <h5 className="mb-0">Ministry - Core User</h5> <p className="fs-15 mt-1 text-muted mb-0"> Hello, {userData?.name}! </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 mt-lg-0">
                    <form>
                      <div className="row g-3 mb-0 align-items-center">

                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="dropdown card-header-dropdown d-flex align-items-center">
                              <span className="mb-0 me-2 fs-15 text-muted current-date">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                          <button type="button" className="btn btn-primary d-flex align-items-center justify-content-center ms-auto" data-bs-toggle="modal" id="create-btn"
                            data-bs-target="#showModal" onClick={() => setShowAnnouncementsModal(true)} >
                            <AnnouncementsSvg />
                            <span>Add Announcements</span>
                          </button>
                        </div>

                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="row mt-3" >
                  <div className="col-12 col-xxl-5 col-xl-6 col-lg-6 d-flex">
                    <div className="card border-0 p-0 col-12 service-chart">
                      <div className="card-header align-items-center d-md-flex department-calander">
                        <h5 className="mb-0 flex-grow-1 mb-3 mb-md-0">
                          Department vs. Revenue
                        </h5>
                        <div className="flex-shrink-0 row">
                          <div className=" col-auto ">
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "All" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("All")} >
                              ALL
                            </button>
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "1w" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("1w")} >
                              1W
                            </button>
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "1m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("1m")} >
                              1M
                            </button>
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "3m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("3m")} >
                              3M
                            </button>
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "6m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("6m")} >
                              6M
                            </button>
                            <button type="button" className={dateRangeOptionForDepartmentVSRevenue === "1y" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleDeptVSrevenueFilter("1y")} >
                              1Y
                            </button>
                          </div>
                          <div className="col-auto ms-auto">
                            <div className="dropdown card-header-dropdown">
                              <div className="btn btn-primary btn-sm ">
                                <span className="fw-semibold text-uppercase fs-12" onClick={toggleDateDepartmentVSRevenue} >
                                  <Filter width="24" height="24" className="feather feather-filter icon-xs" />
                                </span>
                              </div>
                              <div className={isDepartmentVSRevenueDropdownOpen ? `dropdown-menu dropdown-menu-end show bg-white p-2 position-absolute end-0` : `dropdown-menu dropdown-menu-end shadow-none `}
                                style={{ width: "200px", top: '30px', }}
                                data-popper-placement="bottom-end"
                              >
                                <div className="input-group p-0">
                                  <DateRangePopup
                                    dateStart={dateStart}
                                    dateEnd={dateEnd}
                                    onChangeHandler={
                                      onChangeDepartmentVSRevenueHandler
                                    }
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
                      {
                        departmentVSRevenueLoading ? (
                          <div className="card-body">
                            <LoaderSpin height={"300px"} />
                          </div>
                        ) :
                          (
                            <div className="card-body">
                              <DeptvsRevenueChart
                                departmentVSRevenueList={departmentVSRevenueList}
                                departmentsViewPermission={departmentsViewPermission}
                                revenueViewPermission={revenueViewPermission}
                              />
                            </div>
                          )

                      }
                    </div>
                  </div>
                  <div className="col-12 col-xxl-5 col-xl-6 col-lg-6 d-flex">
                    <div className="card border-0 p-0 col-12 service-chart">
                      <div className="card-header align-items-center d-md-flex department-calander">
                        <h5 className="mb-0 flex-grow-1 mb-3 mb-md-0">
                          Service vs. Revenue
                        </h5>
                        <div className="flex-shrink-0 row">
                          <div className=" col-auto">
                            <button type="button" className={serviceManagementDateRangeOption === "All" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("All")} >
                              ALL
                            </button>
                            <button type="button" className={serviceManagementDateRangeOption === "1w" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("1w")} >
                              1W
                            </button>
                            <button type="button" className={serviceManagementDateRangeOption === "1m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("1m")} >
                              1M
                            </button>
                            <button type="button" className={serviceManagementDateRangeOption === "3m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("3m")} >
                              3M
                            </button>
                            <button type="button" className={serviceManagementDateRangeOption === "6m" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("6m")} >
                              6M
                            </button>
                            <button type="button" className={serviceManagementDateRangeOption === "1y" ? "btn btn-primary btn-sm me-1" : "btn btn-soft-secondary btn-sm me-1"} onClick={() => handleServiceVSrevFilter("1y")} >
                              1Y
                            </button>
                          </div>
                          <div className="col-auto ms-auto">
                            <div className="flex-shrink-0">
                              <div className="dropdown card-header-dropdown">
                                <div className="btn btn-primary btn-sm me-1">
                                  <span
                                    className="fw-semibold text-uppercase fs-12"
                                    onClick={toggleDateServiceVSRevenue}
                                  >
                                    <Filter
                                      width="24"
                                      height="24"
                                      className="feather feather-filter icon-xs"
                                    />
                                  </span>
                                </div>
                                <div
                                  className={
                                    isServiceVSRevenueDropdownOpen
                                      ? `dropdown-menu dropdown-menu-end show bg-white p-2 position-absolute end-0`
                                      : `dropdown-menu dropdown-menu-end shadow-none `
                                  }
                                  style={{ width: "200px", top: "30px" }}
                                  data-popper-placement="bottom-end"
                                >
                                  <div className="input-group p-0">
                                    <DateRangePopup
                                      dateStart={serviceVSRevenueDateStart}
                                      dateEnd={serviceVSRevenueDateEnd}
                                      onChangeHandler={
                                        onChangeServiceVSRevenueHandler
                                      }
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
                      </div>
                      {
                        serviceVSRevenueLoading ? (
                          <div className="card-body">
                            <LoaderSpin height={"300px"} />
                          </div>
                        ) :
                          (
                            <div className="card-body">
                              <ServicevsRevenueChart
                                serviceManagement={serviceManagement}
                                servicesViewPermission={servicesViewPermission}
                                revenueViewPermission={revenueViewPermission}
                              />
                            </div>
                          )
                      }
                    </div>
                  </div>
                  <div className="col-12 col-xxl-2 ">
                    <div className="row ">
                      <div className="col-12 col-md-4 col-xxl-12 col-lg-4 mb-4">
                        <div className="card border-warning mb-0">

                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <i className="bx bx-dollar-circle text-warning fs-24"></i>
                              <div className="flex-grow-1 ps-3">
                                <h5 className="fs-13 mb-0">
                                  Top Earning Department
                                </h5>
                              </div>
                              <div className="flex-shrink-0">
                                <DropdownButton
                                  id="dropdown-basic-button"
                                  className="dots-vertical"
                                  title={<i className="las la-ellipsis-v ms-1 fs-18"></i>}
                                  variant="white"
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
                                      key={option?.value}
                                      onClick={() => handleTopEarningDeptFilter(option?.value)}
                                      active={selectedTopEarningDepartmentOption === option?.value}
                                    >
                                      {option?.label}
                                    </Dropdown.Item>
                                  ))}
                                </DropdownButton>

                              </div>
                            </div>
                            {

                              topEarningDepartmentLoading ? (
                                <div className="card-body">
                                  <LoaderSpin height={"28px"} />
                                </div>
                              ) :
                                (
                                  <div className="mt-2 pt-1">
                                    <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0">
                                      $
                                      <span>
                                        <SlotCounter value={departmentsViewPermission
                                          ? topEarningDepartment[0]?.totalRevenueDepartment || 0
                                          : 0} />
                                      </span>
                                    </h4>
                                    {departmentsViewPermission ? (
                                      <p className="mt-2 mb-0 text-muted">
                                        {topEarningDepartment[0]?.departmentName}
                                      </p>
                                    ) : null}
                                  </div>
                                )
                            }
                          </div>
                          {showCustomDateRange && (
                            <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                              <DateRangePopup
                                dateStart={dateStartTopEarningDept}
                                dateEnd={dateEndTopEarningDept}
                                onChangeHandler={onChangeTopEarningDepartmentHandler}
                              />
                              <div className="input-group-text bg-primary border-primary text-white">
                                <i className="ri-calendar-2-line"></i>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-md-4 col-xxl-12 col-lg-4 mb-4">
                        <div className="card border-success mb-0">

                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <i className="bx bx-dollar-circle text-success fs-24"></i>
                              <div className="flex-grow-1 ps-3">
                                <h5 className="fs-13 mb-0">
                                  Top Earning Service
                                </h5>
                              </div>
                              <div className="flex-shrink-0">
                                <DropdownButton
                                  id="dropdown-basic-button"
                                  className="dots-vertical"
                                  title={
                                    <i className="las la-ellipsis-v ms-1 fs-18"></i>
                                  }
                                  variant="white"
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
                                      key={option?.value}
                                      onClick={() =>
                                        handleTopEarningServicesFilter(option?.value)
                                      }
                                      active={
                                        selectedTopEarningService === option?.value
                                      }
                                    >
                                      {option.label}
                                    </Dropdown.Item>
                                  ))}
                                </DropdownButton>
                              </div>
                            </div>
                            {
                              topEarningServiceLoading ? (
                                <LoaderSpin height={"60px"} />
                              ) :
                                (
                                  <div className="mt-2 pt-1">
                                    <h4 className="fs-22 fw-semibold d-flex align-items-center ff-secondary mb-0">
                                      $
                                      <span>
                                        <SlotCounter value={servicesViewPermission
                                          ? topEarningService[0]?.serviceWithMaxRevenue?.totalRevenueService || 0
                                          : 0} />
                                      </span>
                                    </h4>
                                    {servicesViewPermission ? (
                                      <p className="mt-2 mb-0 text-muted">
                                        {topEarningService[0]?.serviceWithMaxRevenue?.serviceName}
                                      </p>
                                    ) : null}
                                  </div>
                                )
                            }
                          </div>
                          {showCustomServiceDateRange && (
                            <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                              <DateRangePopup
                                dateStart={dateStartTopEarningService}
                                dateEnd={dateEndTopEarningService}
                                onChangeHandler={onChangeTopEarningServiceHandler}
                              />
                              <div className="input-group-text bg-primary border-primary text-white">
                                <i className="ri-calendar-2-line"></i>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-12 col-md-4 col-xxl-12 col-lg-4 mb-4">
                        <div className="card border-info mb-0 h-100">

                          <div className="card-body ">
                            <div className="d-flex align-items-center">
                              <RevenueSvg />
                              <div className="flex-grow-1 ps-3">
                                <h5 className="fs-13 mb-0">Revenue</h5>
                              </div>
                              <div className="flex-shrink-0">
                                <DropdownButton
                                  className="dots-vertical"
                                  id="dropdown-basic-button"
                                  title={
                                    <i className="las la-ellipsis-v ms-1 fs-18"></i>
                                  }
                                  variant="white"
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
                                      key={option?.value}
                                      onClick={() =>
                                        handleRevenueFilter(option?.value)
                                      }
                                      active={
                                        selectedRevenueOption === option?.value
                                      }
                                    >
                                      {option?.label}
                                    </Dropdown.Item>
                                  ))}
                                </DropdownButton>
                              </div>
                            </div>

                            {
                              totalRevenueListLoading ? (
                                <LoaderSpin height={"40px"} />
                              ) :
                                (
                                  <div className="mt-2 pt-1">
                                    <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0 mb-3 pb-1 mb-lg-0 pb-lg-0">
                                      $
                                      <span>
                                        <SlotCounter value={revenueViewPermission ? totalRevenueList?.totalRevenue || 0 : 0} />
                                      </span>
                                    </h4>
                                  </div>
                                )
                            }
                          </div>
                          {showCustomRevenueDateRange && (
                            <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                              <DateRangePopup
                                dateStart={dateStartRevenue}
                                dateEnd={dateEndRevenue}
                                onChangeHandler={onChangeRevenueHandler}
                              />
                              <div className="input-group-text bg-primary border-primary text-white">
                                <i className="ri-calendar-2-line"></i>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 ">
                  <div className="row">
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          serviceDepartmentCountLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (

                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <DepartmentsSvg />
                                <p className="text-muted mb-0">Departments</p>
                              </div>
                              <h2 className="mb-0 mt-3" >
                                <SlotCounter value={departmentsViewPermission ? serviceDepartmentCount?.departmentCount || "-" : "-"} />
                                {/* {departmentsViewPermission ? serviceDepartmentCount?.departmentCount || "-" : "-"} */}
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          serviceDepartmentCountLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (
                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <ServicesSvg />
                                <p className="text-muted mb-0">Services</p>
                              </div>
                              <h2 className="mb-0 mt-3">
                                <SlotCounter value={servicesViewPermission ? serviceDepartmentCount?.serviceCount || "-" : "-"} />
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          customerAndGenderDataLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (
                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <UsersSvg />
                                <p className="text-muted mb-0">Users</p>
                              </div>
                              <h2 className="mb-0 mt-3">
                                <SlotCounter value={citizensViewPermission ? customerAndGenderData?.totalCustomers || "-" : "-"} />
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          activeApplicationListLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (

                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <ActiveRequestSvg />
                                <p className="text-muted mb-0">Active Requests</p>
                              </div>
                              <h2 className="mb-0 mt-3">
                                <SlotCounter value={applicationsViewPermission ? activeApplicationList?.count || "-" : "-"} />
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          customerAndGenderDataLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (
                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <ActiveUsersSvg />
                                <p className="text-muted mb-0">Active Users</p>
                              </div>
                              <h2 className="mb-0 mt-3">
                                <SlotCounter value={citizensViewPermission ? customerAndGenderData?.activeCustomerCount || "-" : "-"} />
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div className="col-6 col-md-4 col-xl-2">
                      <div className="card rounded">
                        {
                          activeTicketsLoading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"70px"} />
                            </div>
                          ) : (
                            <div className="card-body rounded p-3">
                              <div className="d-flex align-items-center">
                                <ActiveTicketsSvg />
                                <p className="text-muted mb-0">Active Tickets</p>
                              </div>
                              <h2 className="mb-0 mt-3">
                                <SlotCounter value={ticketsViewPermission ? activeTickes?.ticketCount || "-" : "-"} />
                              </h2>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-sm-12 col-xxl-4 col-12 mb-4">
                    <div className="card border-0 p-0 mb-0 h-100">
                      <div className="card-header align-items-center d-flex ">
                        <h5 className="mb-0 flex-grow-1">
                          Region Wise Revenue
                        </h5>
                      </div>
                      <div className="p-1">
                        {
                          loading ? (
                            <div className="card-body rounded p-3">
                              <LoaderSpin height={"300px"} />
                            </div>
                          ) : (
                            <GeolocationRevenue />
                          )
                        }

                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-6 col-xl-6 col-xxl-4 mb-4">
                    <div className="card border-0 p-0 h-100 mb-0">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">Request Analysis</h5>
                        <div className="flex-shrink-0">
                          <DropdownButton className="dots-vertical" id="dropdown-basic-button"
                            title={<i className="las la-ellipsis-v ms-1 fs-18"></i>} variant="white" align="end"
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
                              <Dropdown.Item key={option.value} onClick={() => handleServiceRequestDuration(option.value)}
                                active={selectedRequestAnalysis === option.value} >
                                {option.label}
                              </Dropdown.Item>
                            ))}
                          </DropdownButton>
                        </div>
                      </div>
                      {showServiceRequestsDateRange && (
                        <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup" >
                          <DateRangePopup className=""
                            dateStart={dateStartServiceRequests}
                            dateEnd={dateEndServiceRequests}
                            onChangeHandler={onChangeServiceRequestsHandler}
                          />
                          <div className="input-group-text bg-primary border-primary text-white">
                            <i className="ri-calendar-2-line"></i>
                          </div>
                        </div>
                      )}
                      {
                        serviceRequestsLoading ? (
                          <div className="card-body">
                            <LoaderSpin height={"300px"} />
                          </div>
                        ) : (
                          <div className="card-body card-c-chart border-0">
                            <RequestAnalysChart
                              data={serviceRequest}
                              applicationsViewPermission={applicationsViewPermission}
                            />
                          </div>
                        )
                      }
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-6 col-xl-6 col-xxl-4 mb-4 ">
                    <div className="card border-0 p-0 h-100 mb-0">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">Citizens</h5>
                      </div>
                      {
                        customerAndGenderDataLoading ? (
                          <div className="card-body text-center mx-auto card-c-chart border-0">
                            <LoaderSpin height={"300px"} />
                          </div>
                        ) : (
                          <div className="card-body text-center mx-auto card-c-chart border-0">
                            <PieChart
                              data={customerAndGenderData?.gender}
                              citizensViewPermission={citizensViewPermission}
                            />
                          </div>
                        )
                      }
                    </div>
                  </div>
                  <div className="col-12 col-sm-12 col-xl-9 ">
                    <div className="card border-0 p-0">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">
                          Department Efficiency
                        </h5>
                      </div>
                      {
                        departmentReportLoading ? (
                          <div className="card-body">
                            <LoaderSpin height={"300px"} />
                          </div>
                        ) : departmentReportList.length === 0 ? (
                          <div className="text-center">
                            <p className="text-muted">No questions found.</p>
                          </div>
                        ) :
                          (
                            <div className="card-body">
                              <div className="row">
                                <div className="col-12 col-sm-3 col-xl-4">
                                  <PyramidChart
                                    departmentReportList={departmentReportList}
                                    colorMap={colorMap}
                                    departmentsViewPermission={departmentsViewPermission}
                                  />
                                </div>
                                <div className="col-12 col-sm-9 col-xl-8">
                                  <div className="table-responsive table-card">
                                    <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}>
                                      <table className="table table-borderless table-sm table-centered align-middle table-nowrap mt-2">
                                        <thead className="">
                                          <tr>
                                            <th>Department</th>
                                            <th style={{ width: "150px" }}>
                                              Request
                                            </th>
                                            <th style={{ width: "120px" }}>
                                              TAT (days)
                                            </th>
                                            <th style={{ width: "120px" }}>Efficiency (%)</th>
                                            <th>Avg. Time</th>
                                          </tr>
                                        </thead>

                                        {departmentsViewPermission && departmentReportList && (
                                          <tbody>
                                            {departmentReportList.map((data, index) => (
                                              <tr key={index}>
                                                <td>
                                                  <div className="align-items-center d-flex">
                                                    <span
                                                      className="rounded-circle icon-xs me-2"
                                                      style={{
                                                        height: "11px",
                                                        width: "11px",
                                                        backgroundColor: colorMap[data.departmentName],
                                                      }}
                                                    ></span>
                                                    <span>{data?.departmentName}</span>
                                                  </div>
                                                </td>

                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <RequestAssignedSvg />
                                                    <span>{data?.RequestAssigned}</span>
                                                  </div>
                                                </td>

                                                <td>
                                                  <span
                                                    className="badge"
                                                    style={{ backgroundColor: colorMap[data.departmentName] }}
                                                  >
                                                    {data?.TotalTATDays}
                                                  </span>
                                                </td>

                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <SettingsIconSvg />
                                                    <span>
                                                      {data?.completedDays > 0
                                                        ? calculateEfficiency(data?.RequestCompleted, data?.RequestAssigned) : 0}%
                                                    </span>
                                                  </div>
                                                </td>
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <ClockIconSvg />
                                                    <span>
                                                      {data?.completedDays > 0
                                                        ? calculateAverageTimePerRequest(data?.RequestCompleted, data?.completedDays) : 0}
                                                    </span>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        )}
                                      </table>
                                    </SimpleBar>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                      }
                    </div>
                  </div>
                  <div className="col-12 col-sm-12 col-xl-3">
                    <div className="card border-0 p-0">
                      <div className="card-header align-items-center d-flex">
                        <h5 className="mb-0 flex-grow-1">
                          Top Rated Services
                        </h5>
                      </div>
                      <div className="card-body">
                        {
                          topRatedServicesLoading ? (
                            <LoaderSpin height={"300px"} />
                          ) : services.length === 0 ? (
                            <div className="text-center">
                              <p className="text-muted">No top-rated services available.</p>
                            </div>
                          ) : (
                            services.map((service, index) => (
                              <div key={index} className="row align-items-center g-2 mb-3">
                                <div className="col-6">
                                  <div className="p-1">
                                    <h6 className="mb-0">
                                      {service.serviceName || "Unnamed Service"}
                                    </h6>
                                  </div>
                                </div>
                                <div className="col">
                                  <div className="flex-grow-1">
                                    {calculateStars(service.totalRatings || 0, maxRating)}
                                  </div>
                                </div>
                                <div className="col-auto">
                                  <div className="p-1">
                                    <h6 className="mb-0 text-muted">
                                      {service.totalRatings !== null && service.totalRatings !== undefined
                                        ? service.totalRatings
                                        : "N/A"}
                                    </h6>
                                  </div>
                                </div>
                              </div>
                            )
                            )
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="custom-sidebar-menu ">
            <div onClick={ToggleSidebar} className="menu-toggle sidebar ">
              <svg width="30" height="20" viewBox="0 0 30 20" fill="#fff">
                <rect x="10" y="5" width="11" height="1"></rect>
                <rect x="10" y="15" width="11" height="1"></rect>
                <polygon points="29.48 10.27 24.23 5.03 23.52 5.73 27.79 10 10 10 10 11 27.79 11 23.52 15.27 24.23 15.97 29.48 10.73 29.7 10.5 29.48 10.27"></polygon>
              </svg>
            </div>
            <div className="menu-item" title="Grid">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <path d="M57,5H7A2,2,0,0,0,5,7v7H59V7A2,2,0,0,0,57,5Zm1,19V23H46V15H45v8H33V15H32v8H19V15H18v8H6v1H18v7H6v1H18v8H6v1H18v8H6v1H18v8h1V50H32v8h1V50H45v8h1V50H58V49H46V41H58V40H46V32H58V31H46V24ZM19,24H32v7H19Zm0,8H32v8H19Zm0,17V41H32v8Zm26,0H33V41H45Zm0-9H33V32H45Zm0-9H33V24H45Z"
                  fill="#bbdefb"></path>
                <path d="M57,5H7A2,2,0,0,0,5,7V57a2,2,0,0,0,2,2H57a2,2,0,0,0,2-2V7A2,2,0,0,0,57,5ZM7,6H57a1,1,0,0,1,1,1v7H6V7A1,1,0,0,1,7,6ZM57,58H7a1,1,0,0,1-1-1V15H58V57A1,1,0,0,1,57,58Z" fill="#8e99f3"></path>
              </svg>
              <div className="menu-item-name">Department vs. Revenue</div>
            </div>
            <div className="menu-item" title="Radial Gauge">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="4" fill="#ffca28"></circle>
                <path d="M32,6A26,26,0,1,1,6,32,26,26,0,0,1,32,6m0-1A27,27,0,1,0,59,32,27,27,0,0,0,32,5ZM43.37,20.63a1.49,1.49,0,0,0-2.12,0l-6.84,6.84a6.51,6.51,0,0,1,2.12,2.12l6.84-6.84A1.49,1.49,0,0,0,43.37,20.63Z" fill="#8e99f3"></path>
                <path d="M34,11a2,2,0,1,1-2-2A2,2,0,0,1,34,11ZM17,15a2,2,0,1,0,2,2A2,2,0,0,0,17,15Zm30,0a2,2,0,1,0,2,2A2,2,0,0,0,47,15ZM11,28a2,2,0,1,0,2,2A2,2,0,0,0,11,28Zm42,.91a2,2,0,1,0,2,2A2,2,0,0,0,53,28.91ZM32,40.76A25.87,25.87,0,0,0,14.09,48a23.95,23.95,0,0,0,35.83,0A25.88,25.88,0,0,0,32,40.76Z"
                  fill="#bbdefb"></path>
              </svg>
              <div className="menu-item-name">Radial Gauge</div>
            </div>
            <div className="menu-item" title="Linear Gauge">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <path d="M29.5,19A4.5,4.5,0,1,1,34,23.5,4.49,4.49,0,0,1,29.5,19Zm-1.15-2H11a2,2,0,0,0-1.9,2.65,2,2,0,0,0,2,1.35H28.21A5.72,5.72,0,0,1,28,19.5c0-.08,0-.15,0-.23s0-.18,0-.27A6,6,0,0,1,28.35,17ZM54.9,18.35a2,2,0,0,0-2-1.35H39.65a5.89,5.89,0,0,1,0,4H53A2,2,0,0,0,54.9,18.35Z"
                  fill="#5c6bc0"></path>
                <path d="M53,36H29.05a6,6,0,0,0,.29-1.85,6.13,6.13,0,0,0-.4-2.15h24a2,2,0,0,1,2,1.35A2,2,0,0,1,53,36ZM17.74,32H11a2,2,0,0,0-1.9,2.65,2,2,0,0,0,2,1.35h6.55a6.28,6.28,0,0,1-.29-1.85A6.13,6.13,0,0,1,17.74,32Zm5.6,6.65a4.5,4.5,0,1,0-4.5-4.5A4.5,4.5,0,0,0,23.34,38.65Z"
                  fill="#bbdefb"></path>
                <path d="M38.34,49.15A6.28,6.28,0,0,0,38.63,51H11.08a2,2,0,0,1-2-1.35A2,2,0,0,1,11,47H38.74A6.13,6.13,0,0,0,38.34,49.15Zm16.56-.8a2,2,0,0,0-2-1.35h-3a6.13,6.13,0,0,1,.4,2.15A6,6,0,0,1,50.05,51h3A2,2,0,0,0,54.9,48.35Zm-10.56,5.3a4.5,4.5,0,1,0-4.5-4.5A4.5,4.5,0,0,0,44.34,53.65Z"
                  fill="#ffca28"></path>
              </svg>
              <div className="menu-item-name">Linear Gauge</div>
            </div>
            <div className="menu-item" title="Bar Chart">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <rect x="12" y="34" width="40" height="7" fill="#ffca28"></rect>
                <rect x="12" y="46" width="33" height="7" fill="#5c6bc0"></rect>
                <rect x="12" y="11" width="32" height="7" fill="#bbdefb"></rect>
                <path d="M36,22v7H12V22ZM10,14H8v1h2Zm0,11H8v1h2Zm0,12H8v1h2Zm0,12H8v1h2Zm49,9H7a.94.94,0,0,1-1-1V5H5V57a2,2,0,0,0,2,2H59Z" fill="#8e99f3"></path>
              </svg>
              <div className="menu-item-name">Bar Chart</div>
            </div>
            <div className="menu-item" title="Column Chart">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <rect x="23" y="12.02" width="7" height="40" fill="#ffca28"></rect>
                <rect x="11" y="19.02" width="7" height="33" fill="#5c6bc0"></rect>
                <rect x="46" y="20.02" width="7" height="32" fill="#bbdefb"></rect>
                <path d="M41,52H34V26h7Zm8,2v2h1V54ZM37,54v2h1V54ZM26,54v2h1V54ZM14,54v2h1V54ZM5,5V57a2,2,0,0,0,2,2H58V58H7a1,1,0,0,1-1-1V5Z" fill="#8e99f3"></path>
              </svg>
              <div className="menu-item-name">Column Chart</div>
            </div>
            <div className="menu-item" title="Line Chart">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <polygon points="51 20.41 49.59 19 32.5 36.97 27.5 31.97 11 48.48 12.5 49.98 27.5 34.97 32.5 39.97 51 20.41" fill="#bbdefb"></polygon>
                <path d="M6,5V57a1,1,0,0,0,1,1H58v1H7a2,2,0,0,1-2-2V5Z" fill="#8e99f3"></path>
                <polygon points="34.92 30.42 27.5 23 11 39.51 12.5 41.01 27.5 26 33.42 31.92 34.92 30.42" fill="#5c6bc0"></polygon>
                <polygon points="40.58 36.08 39.08 37.58 45.97 44.47 47.38 42.88 40.58 36.08" fill="#5c6bc0"></polygon>
              </svg>
              <div className="menu-item-name">Line Chart</div>
            </div>
            <div className="menu-item" title="Bubble Chart">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <path d="M59,58H7a.94.94,0,0,1-1-1V5H5V57a2,2,0,0,0,2,2H59Z" fill="#8e99f3"></path>
                <path d="M36,23a2,2,0,1,1,2,2A2,2,0,0,1,36,23ZM13.63,29.07a2,2,0,1,0-2-2A2,2,0,0,0,13.63,29.07Zm9,12a2,2,0,1,0-2-2A2,2,0,0,0,22.63,41.07Zm24-5a2,2,0,1,0-2-2A2,2,0,0,0,46.63,36.07Zm-2.5,17a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,44.13,53.07Z"
                  fill="#5c6bc0"></path>
                <path d="M19,12a4,4,0,1,1,4,4A4,4,0,0,1,19,12Zm6.63,16.07a3,3,0,1,0-3-3A3,3,0,0,0,25.63,28.07Zm11.5,8a3.5,3.5,0,1,0-3.5-3.5A3.5,3.5,0,0,0,37.13,36.07Zm-1,10a2.5,2.5,0,1,0-2.5-2.5A2.5,2.5,0,0,0,36.13,46.07Zm14,0a2.5,2.5,0,1,0-2.5-2.5A2.5,2.5,0,0,0,50.13,46.07Z"
                  fill="#bbdefb"></path>
              </svg>
              <div className="menu-item-name">Bubble Chart</div>
            </div>
            <div className="menu-item" title="Bullet Graph">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <rect x="41" y="17" width="14" height="11" fill="#5c6bc0"></rect>
                <rect x="40.89" y="33.96" width="14" height="11" fill="#5c6bc0"></rect>
                <polygon points="25 17 25 19 34 19 34 26 25 26 25 28 39 28 39 17 25 17" fill="#ffca28"></polygon>
                <polygon points="25 36 29 36 29 43 25 43 25 45 39 45 39 34 25 34 25 36" fill="#ffca28"></polygon>
                <rect x="9" y="26" width="14" height="2" fill="#bbdefb"></rect>
                <rect x="9" y="17" width="14" height="2" fill="#bbdefb"></rect>
                <rect x="9" y="34" width="14" height="2" fill="#bbdefb"></rect>
                <rect x="9" y="43" width="14" height="2" fill="#bbdefb"></rect>
                <path d="M49,53v2h1V53ZM37,53v2h1V53ZM26,53v2h1V53ZM14,53v2h1V53ZM31,24H9V21H31ZM26,41H9V38H26ZM60,58H6V57H60Z" fill="#8e99f3"></path>
              </svg>
              <div className="menu-item-name">Bullet Graph</div>
            </div>
            <div className="menu-item" title="Blank">
              <svg width="50" height="50" viewBox="0 0 64 64">
                <path d="M40,5V6H33V5ZM24,6h7V5H24ZM15,6h7V5H15Zm7,53V58H15v1Zm9-1H24v1h7ZM6,49V42H5v7ZM5,22H6V15H5ZM51,6h6a1,1,0,0,1,1,1v6h1V7a2,2,0,0,0-2-2H51ZM6,31V24H5v7Zm0,9V33H5v7ZM58,15v7h1V15ZM6,13V7A1,1,0,0,1,7,6h6V5H7A2,2,0,0,0,5,7v6ZM58,51v6a1,1,0,0,1-1,1H51v1h6a2,2,0,0,0,2-2V51ZM13,58H7a1,1,0,0,1-1-1V51H5v6a2,2,0,0,0,2,2h6ZM58,24v7h1V24Zm1,18H58v7h1ZM49,58H42v1h7ZM42,5V6h7V5ZM40,58H33v1h7ZM58,33v7h1V33Z"
                  fill="#8e99f3"></path>
              </svg>
              <div className="menu-item-name">Blank</div>
            </div>
          </div>
       
        <ScrollToTop />

        <AnnouncementsAddUpdateModal show={showAnnouncementsModal} loading={loading} setLoading={setLoading} updateId={id} userId={userId} setShowAnnouncementsModal={setShowAnnouncementsModal} />
      </div>
    </>
  );
};

export default MinistryCoreUserDashborad;
