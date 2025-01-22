import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
//import images
import logoLight from "../assets/images/logo-light.png";
//import Components
import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
import NotificationDropdown from "../Components/Common/NotificationDropdown";
import LightDark from "../Components/Common/LightDark";
import { changeSidebarVisibility } from "../slices/thunks";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import logoSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark-d.png";
import logoBs from "../assets/images/bs.jpg";
import { Card, Offcanvas } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import { decrypt } from "../utils/encryptDecrypt/encryptDecrypt";
import { hasViewPermission } from "../common/CommonFunctions/common";
import { detect } from "detect-browser";
import Notification from "../pages/Notifications/Notifications";
import MessagesDropdown from "../pages/MessageDropdown/MessagesDropdown";
import ProfileDropdown from "../pages/ProfileDropdown/ProfileDropdown";
import { useParams } from "react-router-dom";
import useAxios from "../utils/hook/useAxios";
import Loader, { LoaderSpin } from "../common/Loader/Loader";
import axios  from 'axios';
import { setIPdataAction, setTableColumnConfig, setTableConfigDataLoading, setDepartmentUserInfo } from "../slices/layouts/reducer";

const Header = ({ onChangeLayoutMode, layoutModeType, headerClass }) => {
    const axiosInstance = useAxios();
    const browser = detect();
    const dispatch= useDispatch()
    const [ip, setIp] = useState("");
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const toggleMenuItem = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };
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
    const departmentId = userData?.departmentId;
    const token = userData?.token;
    const [show, setShow] = useState(false);
    const [fullName, setFullName] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [errors, setErrors] = useState("");
    const [coreRoledropdown, setCoreRoledropdown] = useState(false);
    const [departmentsdropdown, setDepartmentdropdown] = useState(false);
    const [reportingDropdown, setReportiongDropdown] = useState(false);
    const [showAccessDropdown, setShowdropdownAceess] = useState(false);
    const [sidebarShow, setShowSidebar] = useState(false);
    const [tabletView, setTabletView] = useState(false);
    const [userImageData, setUserImageData] = useState(null);
    const [isLoading, setIsloading] = useState(false);

    const findIP = async () => {
        try {
            const response = await axios.get("https://api.ipify.org?format=json");
            if (response && response.status === 200) {
                const result = response.data;
                dispatch(setIPdataAction(result))
                setIp(result?.ip);
            }
        } catch (error) {
            console.error("Error fetching IP information:", error.message);
        }
    };
    useEffect(() => {
        findIP();
    }, []);

    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            fetchDepartmentById();
        }
    }, []);

    const fetchDepartmentById = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/departmentById`,
                { departmentId: departmentId }
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                dispatch(setDepartmentUserInfo(rows?.[0] || {}))
            }
        } catch (error) {
            console.error(error.message);
        }
    };
    
    const fetchProfileImage = async () => {
        try {
            if (userData && userData?.profileImageId) {
                const imageResponse = await axiosInstance.post(
                    `documentService/view`,
                    {
                        documentId: userData?.profileImageId,
                    }
                );

                if (
                    imageResponse &&
                    imageResponse.data &&
                    imageResponse.data.data
                ) {
                    const loggedInUserImage = imageResponse.data.data?.rows[0];
                    if (loggedInUserImage) {
                        setUserImageData(loggedInUserImage);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching profile image:", error.message);
        }
    };
    const fetchTableConfigData = async () => {
        try {
            if (userId) {
                const response = await axiosInstance.post(
                    `userService/table/get-table-config`,
                    {
                        userId: userId,
                    }
                );

               if(response){
                const data= response?.data?.data
                dispatch(setTableColumnConfig(data))
                dispatch(setTableConfigDataLoading(false))
               }
            }
        } catch (error) {
            dispatch(setTableConfigDataLoading(false))
            console.error("Error fetching profile image:", error.message);
        } finally{
            dispatch(setTableConfigDataLoading(false))
        }
    };
    useEffect(() => {
        if (userId) {
            fetchProfileImage();
            fetchTableConfigData()
        }
    }, [userId]);

    useEffect(() => {
        const handleResize = () => {
            // Check the window width and update setShow accordingly
            if (window.innerWidth > 1023) {
                setActiveMenu(null);
                setShowSidebar(false);
                setTabletView(false);
                setCoreRoledropdown(false);
                setDepartmentdropdown(false);
                setReportiongDropdown(false);
                setShowdropdownAceess(false);
            } else {
                setTabletView(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleClose = () => {
        setShow(false);
        setErrors("");
    };

    const handleLogout = async () => {
        try {
            setIsloading(true);
            const response = await axiosInstance.put(
                `userService/user/logout`,
                {
                    userId: userId,
                    ip: ip,
                    browserName: browser.name,
                    token: token,
                }
            );
            if (response) {
                localStorage.clear();
                navigate("/");
                setIsloading(false);
            }
        } catch (error) {
            localStorage.clear();
            navigate("/");
            setIsloading(false);
        }
    };

    const selectDashboardData = createSelector(
        (state) => state.Layout,
        (sidebarVisibilitytype) => sidebarVisibilitytype.sidebarVisibilitytype
    );
    // Inside your component
    const sidebarVisibilitytype = useSelector(selectDashboardData);

    const [search, setSearch] = useState(false);
    const toogleSearch = () => {
        setSearch(!search);
    };

    const toogleMenuBtn = () => {
        setActiveMenu(null);
        var windowSize = document.documentElement.clientWidth;
        //if (windowSize > 0)
        document.querySelector(".hamburger-icon").classList.toggle("open");

        //For collapse horizontal menu
        if (
            document.documentElement.getAttribute("data-layout") ===
            "horizontal"
        ) {
            document.body.classList.contains("menu")
                ? document.body.classList.remove("menu")
                : document.body.classList.add("menu");
        }

        //For collapse vertical and semibox menu
        if (
            sidebarVisibilitytype === "show" &&
            (document.documentElement.getAttribute("data-layout") ===
                "vertical" ||
                document.documentElement.getAttribute("data-layout") ===
                    "semibox")
        ) {
            if (windowSize < 1025 && windowSize > 767) {
                document.body.classList.remove("vertical-sidebar-enable");
                document.documentElement.getAttribute("data-sidebar-size") ===
                "sm"
                    ? document.documentElement.setAttribute(
                          "data-sidebar-size",
                          ""
                      )
                    : document.documentElement.setAttribute(
                          "data-sidebar-size",
                          "sm"
                      );
            } else if (windowSize > 1025) {
                document.body.classList.remove("vertical-sidebar-enable");
                document.documentElement.getAttribute("data-sidebar-size") ===
                "lg"
                    ? document.documentElement.setAttribute(
                          "data-sidebar-size",
                          "sm"
                      )
                    : document.documentElement.setAttribute(
                          "data-sidebar-size",
                          "lg"
                      );
            } else if (windowSize <= 767) {
                document.body.classList.add("vertical-sidebar-enable");
                document.documentElement.setAttribute(
                    "data-sidebar-size",
                    "lg"
                );
            }
        }

        //Two column menu
        if (
            document.documentElement.getAttribute("data-layout") === "twocolumn"
        ) {
            document.body.classList.contains("twocolumn-panel")
                ? document.body.classList.remove("twocolumn-panel")
                : document.body.classList.add("twocolumn-panel");
        }
    };

    const getPermission = (data, slug) => {
        const permission = data?.find((module) => module.slug === slug);
        return permission ? hasViewPermission(permission) : false;
    };

    const userPermissionsData = userPermissionsDecryptData?.data || [];
    const UserViewPermissions = getPermission(userPermissionsData, "users");
    const DepartmentViewPermissions = getPermission(
        userPermissionsData,
        "departments"
    );
    const ServicesViewPermissions = getPermission(
        userPermissionsData,
        "services"
    );
    const RoleViewPermissions = getPermission(userPermissionsData, "roles");
    const WorkflowViewPermissions = getPermission(
        userPermissionsData,
        "workflow"
    );
    const ApplicationViewPermissions = getPermission(
        userPermissionsData,
        "applications"
    );
    const CitizenViewPermissions = getPermission(
        userPermissionsData,
        "citizens"
    );
    const DirectoryViewPermissions = getPermission(
        userPermissionsData,
        "directory"
    );
    const TicketViewPermissions = getPermission(userPermissionsData, "tickets");
    const BannerViewPermissions = getPermission(userPermissionsData, "banners");
    const FAQsViewPermissions = getPermission(userPermissionsData, "faqs");
    const UpcomingEventsViewPermissions = getPermission(
        userPermissionsData,
        "upcomingevents"
    );
    const MessagesViewPermissions = getPermission(
        userPermissionsData,
        "messages"
    );
    const ReviewFeedbackViewPermissions = getPermission(
        userPermissionsData,
        "reviewfeedback"
    );
    const RevenueViewPermissions = getPermission(
        userPermissionsData,
        "revenue"
    );
    const DeptPerformanceViewPermissions = getPermission(
        userPermissionsData,
        "departmentperformance"
    );
    const TeamPerformanceViewPermissions = getPermission(
        userPermissionsData,
        "teamperformance"
    );
    const KnowledgeBaseViewPermissions = getPermission(
        userPermissionsData,
        "knowledgebase"
    );
    const SupportViewPermissions = getPermission(
        userPermissionsData,
        "support"
    );
    const AuditLogViewPermissions = getPermission(
        userPermissionsData,
        "auditLog"
    );
    const LoginHistoryViewPermissions = getPermission(
        userPermissionsData,
        "adminLogHistory"
    );
    const FormBuilderViewPermissions = getPermission(
        userPermissionsData,
        "formbuilder"
    );
    const EmailLogViewPermissions = getPermission(
        userPermissionsData,
        "emailLog"
    );
    const AnnouncementsViewPermissions = getPermission(
        userPermissionsData,
        "announcements"
    );
    const ReportingViewPermissions = getPermission(
        userPermissionsData,
        "reporting"
    );
    const EmailtemplateViewPermissions = getPermission(
        userPermissionsData,
        "emailtemplate"
    );
    const BlockedIpsViewPermissions = getPermission(
        userPermissionsData,
        "blockedIps"
    );
    const SettingViewPermissions = getPermission(
        userPermissionsData,
        "generalsetting"
    );

    return (
        <React.Fragment>
            <header id="page-topbar" className={headerClass}>
                <div className="layout-width ">
                    <div className="navbar-header">
                        <div className="d-flex">
                            <div className="navbar-brand-box horizontal-logo">
                                <Link
                                    to="/dashboard"
                                    className="logo logo-dark"
                                >
                                    <span className="logo-sm">
                                        <img src={logoSm} alt="" height="22" />
                                    </span>
                                    <span className="logo-lg">
                                        <img
                                            src={logoDark}
                                            alt=""
                                            height="17"
                                        />
                                    </span>
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="logo logo-light"
                                >
                                    <span className="logo-sm">
                                        <img src={logoSm} alt="" height="22" />
                                    </span>
                                    <span className="logo-lg">
                                        <img
                                            src={logoLight}
                                            alt=""
                                            height="17"
                                        />
                                    </span>
                                </Link>
                            </div>
                            <button
                                onClick={toogleMenuBtn}
                                type="button"
                                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                                id="topnav-hamburger-icon"
                            >
                                <span className="hamburger-icon">
                                    {" "}
                                    <span></span> <span></span> <span></span>{" "}
                                </span>
                            </button>
                        </div>
                        <div className="d-flex align-items-center w-100 justify-content-xxl-start justify-content-end">
                            <div className="app-menu navbar-menu  position-static m-0 bg-transparent shadow-none">
                                <div id="scrollbar" className="sidebar-menu">
                                    <ul className="navbar-nav" id="navbar-nav">
                                        <li
                                            className="nav-item"
                                            onClick={toogleMenuBtn}
                                        >
                                            <Link
                                                to="/dashboard"
                                                className={`nav-link menu-link ${
                                                    currentPath === "/dashboard"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                title="Dashboard"
                                            >
                                                <i className="bx bx-transfer"></i>
                                                <div data-key="t-tables">
                                                    Dashboard
                                                </div>
                                            </Link>
                                        </li>
                                        {ApplicationViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/applications"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                            "/applications" ||
                                                        currentPath ===
                                                            "/application-detailed-view"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Applications"
                                                >
                                                    <i className="bx bx-transfer"></i>
                                                    <div data-key="t-tables">
                                                        Applications
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {CitizenViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/citizen"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                        "/citizen"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Citizens"
                                                >
                                                    <i
                                                        data-feather="tag"
                                                        className="icon-dual"
                                                    ></i>
                                                    <div data-key="t-dashboards">
                                                        Citizens
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {(UserViewPermissions ||
                                            RoleViewPermissions ||
                                            WorkflowViewPermissions) && (
                                            <li className="nav-item">
                                                <span
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                            "/users" ||
                                                        currentPath ===
                                                            "/roles" ||
                                                        currentPath ===
                                                            "/workflow" ||
                                                        currentPath ===
                                                            "/services" ||
                                                        currentPath ===
                                                            "/department" ||
                                                        currentPath ===
                                                            "/add-workflow"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    data-bs-toggle="collapse"
                                                    role="button"
                                                    aria-expanded={
                                                        activeMenu ===
                                                        "accessRights"
                                                    }
                                                    aria-controls="sidebarMultilevel"
                                                    title="Access Rights"
                                                    onClick={() =>
                                                        toggleMenuItem(
                                                            "accessRights"
                                                        )
                                                    }
                                                >
                                                    <i
                                                        data-feather="user"
                                                        className="icon-dual"
                                                    ></i>
                                                    <div data-key="t-multi-level">
                                                        Access Rights
                                                    </div>
                                                </span>
                                                <div
                                                    className={`collapse menu-dropdown ${
                                                        activeMenu ===
                                                        "accessRights"
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarMultilevel"
                                                >
                                                    <ul className="nav nav-sm flex-column">
                                                        {RoleViewPermissions && (
                                                            <li
                                                                className="nav-item "
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/roles"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/roles"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.2"
                                                                >
                                                                    Roles
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {UserViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/users"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/users"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Users
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {WorkflowViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/workflow"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                            "/workflow" ||
                                                                        currentPath ===
                                                                            "/add-workflow"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Workflow
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {DepartmentViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/department"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/department"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Departments
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {ServicesViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/services"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/services"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Services
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </li>
                                        )}
                                        {DirectoryViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/directory"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                        "/directory"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Directory"
                                                >
                                                    <i
                                                        data-feather="folder"
                                                        className="feather feather-home icon-dual text-primary"
                                                    ></i>
                                                    <div data-key="t-tables">
                                                        Directory
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {TicketViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/support-tickets"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                            "/support-tickets" ||
                                                        currentPath ===
                                                            "/tickets-details"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="support-tickets"
                                                >
                                                    <i
                                                        data-feather="folder"
                                                        className="feather feather-home icon-dual text-primary"
                                                    ></i>
                                                    <div data-key="t-tables">
                                                        Tickets
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {(RevenueViewPermissions ||
                                            DeptPerformanceViewPermissions ||
                                            TeamPerformanceViewPermissions) && (
                                            <li className="nav-item">
                                                <span
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                            "/revenue" ||
                                                        currentPath ===
                                                            "/application-transaction-report" ||
                                                        currentPath ===
                                                            "/department-performance" ||
                                                        currentPath ===
                                                            "/team-performance" ||
                                                        currentPath ===
                                                            "/admin-log-report" ||
                                                        currentPath ===
                                                            "/customer-log-report" ||
                                                        currentPath ===
                                                            "/application-report"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    data-bs-toggle="collapse"
                                                    role="button"
                                                    aria-expanded={
                                                        activeMenu ===
                                                        "reporting"
                                                    }
                                                    aria-controls="sidebarreport"
                                                    title="Reporting"
                                                    onClick={() =>
                                                        toggleMenuItem(
                                                            "reporting"
                                                        )
                                                    }
                                                >
                                                    <i
                                                        data-feather="pie-chart"
                                                        className="icon-dual"
                                                    ></i>
                                                    <div data-key="t-tables">
                                                        Reporting
                                                    </div>
                                                </span>
                                                <div
                                                    className={`collapse menu-dropdown ${
                                                        activeMenu ===
                                                        "reporting"
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarreport"
                                                >
                                                    <ul className="nav nav-sm flex-column">
                                                        {RevenueViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/revenue"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                            "/revenue" ||
                                                                        currentPath ===
                                                                            "/application-report"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-basic-tables"
                                                                    title="Revenue Report"
                                                                >
                                                                    Revenue
                                                                    Report
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {DeptPerformanceViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/department-performance"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/department-performance"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-basic-tables"
                                                                    title="Department Performance"
                                                                >
                                                                    Department
                                                                    Performance
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {TeamPerformanceViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/team-performance"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/team-performance"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-basic-tables"
                                                                    title="Team Performance"
                                                                >
                                                                    Team
                                                                    Performance
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {LoginHistoryViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/admin-log-report"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                            "/admin-log-report" ||
                                                                        currentPath ===
                                                                            "/customer-log-report"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-basic-tables"
                                                                    title="Log Report"
                                                                >
                                                                    Log Report
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </li>
                                        )}
                                        {UpcomingEventsViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/upcoming-events"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                        "/upcoming-events"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Upcoming Events"
                                                >
                                                    <i
                                                        data-feather="tag"
                                                        className="icon-dual"
                                                    ></i>
                                                    <div data-key="t-dashboards">
                                                        Upcoming Events
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {MessagesViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/messages"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                        "/messages"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Messages"
                                                >
                                                    <i
                                                        data-feather="message-square"
                                                        className="feather feather-home icon-dual text-primary"
                                                    ></i>
                                                    <div data-key="t-tables">
                                                        Messages
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                        {(SupportViewPermissions ||
                                            KnowledgeBaseViewPermissions ||
                                            FAQsViewPermissions ||
                                            ReviewFeedbackViewPermissions ||
                                            BannerViewPermissions) && (
                                            <li className="nav-item">
                                                <span
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                            "/banner" ||
                                                        currentPath ===
                                                            "/faq" ||
                                                        currentPath ===
                                                            "/support" ||
                                                        currentPath ===
                                                            "/knowledge-base" ||
                                                        currentPath ===
                                                            "/user-review" ||
                                                        currentPath ===
                                                            "/knowledgebase-model"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    data-bs-toggle="collapse"
                                                    role="button"
                                                    aria-expanded={
                                                        activeMenu ===
                                                        "helpSupport"
                                                    }
                                                    aria-controls="sidebarMultilevel"
                                                    title="Help & Support"
                                                    onClick={() =>
                                                        toggleMenuItem(
                                                            "helpSupport"
                                                        )
                                                    }
                                                >
                                                    <i
                                                        data-feather="user"
                                                        className="icon-dual"
                                                    ></i>
                                                    <div data-key="t-multi-level">
                                                        Help & Support
                                                    </div>
                                                </span>
                                                <div
                                                    className={`collapse menu-dropdown ${
                                                        activeMenu ===
                                                        "helpSupport"
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarMultilevel"
                                                >
                                                    <ul className="nav nav-sm flex-column">
                                                        {BannerViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/banner"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/banner"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Banner
                                                                </Link>
                                                            </li>
                                                        )}

                                                        {FAQsViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/faq"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/faq"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    FAQs
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {SupportViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/support"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/support"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Support
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {KnowledgeBaseViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/knowledge-base"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                            "/knowledge-base" ||
                                                                        currentPath ===
                                                                            "/knowledgebase-model"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.2"
                                                                >
                                                                    Knowledge
                                                                    Base
                                                                </Link>
                                                            </li>
                                                        )}
                                                        {ReviewFeedbackViewPermissions && (
                                                            <li
                                                                className="nav-item"
                                                                onClick={
                                                                    toogleMenuBtn
                                                                }
                                                            >
                                                                <Link
                                                                    to="/user-review"
                                                                    className={`nav-link ${
                                                                        currentPath ===
                                                                        "/user-review"
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    data-key="t-level-2.3"
                                                                >
                                                                    Review &
                                                                    Feedbacks
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </li>
                                        )}
                                        {AuditLogViewPermissions && (
                                            <li
                                                className="nav-item"
                                                onClick={toogleMenuBtn}
                                            >
                                                <Link
                                                    to="/audit-log"
                                                    className={`nav-link menu-link ${
                                                        currentPath ===
                                                        "/audit-log"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    title="Audit Log"
                                                >
                                                    <i
                                                        data-feather="star"
                                                        className="feather feather-home icon-dual text-primary"
                                                    ></i>
                                                    <div data-key="t-tables">
                                                        Audit Log
                                                    </div>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            {/* NotificationDropdown */}
                            <Notification />
                            <MessagesDropdown />
                            {/* ProfileDropdown */}
                            <ProfileDropdown
                                currentPath={currentPath}
                                userData={userData}
                                userImageData={userImageData}
                                handleLogout={handleLogout}
                                BlockedIpsView={BlockedIpsViewPermissions}
                                emailLogView={EmailLogViewPermissions}
                                formBuilderView={FormBuilderViewPermissions}
                                emailTemplateView={EmailtemplateViewPermissions}
                                settingView={SettingViewPermissions}
                            />
                        </div>
                    </div>
                </div>
            </header>
            {isLoading && (
                <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    // style={{ height: "100vh" }}
                >
                    <Loader isLoading={isLoading} />
                </div>
            )}
        </React.Fragment>
    );
};

export default Header;
