import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Routes,
    Route,
    useNavigate,
    useLocation,
    Navigate,
} from "react-router-dom";
//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";

//Routes
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import ActiveApplications from "../pages/Applications/ActiveApplications/ActiveApplications.jsx";
import CompleteApplications from "../pages/Applications/CompleteApplications/CompleteApplications.jsx";
import Citizen from "../pages/Citizens/Citizen.jsx";
import Users from "../pages/AccessRights/Roles/Roles/Users.jsx";
import WorkFlow from "../pages/AccessRights/Roles/Workflow/WorkFlow.jsx";
import Directory from "../pages/Directory/Directory.jsx";
import ApplicationReport from "../pages/Reporting/ApplicationReport/ApplicationReport.jsx";
import Revenue from "../pages/Reporting/RevenueReport/Revenue.jsx";
import DepartmentPerformance from "../pages/Reporting/DepartmentPerformance/DepartmentPerformance.jsx";
import TeamPerformance from "../pages/Reporting/TeamPerformance/TeamPerformance.jsx";
import LogReport from "../pages/Reporting/LogReport/LogReport.jsx";
import SupportTickets from "../pages/TicketingSystem/Tickets/SupportTickets.jsx";
import UserReview from "../pages/Review&Feedbacks/UserReview.jsx";
import Messages from "../pages/Messages/Messages.jsx";
import ChatActivity from "../pages/Messages/ChatActivity.jsx";
import Settings from "../pages/Settings/Settings.jsx";
import AboutSystem from "../pages/AboutSystem/AboutSystem.jsx";
import TicketsDetails from "../pages/TicketingSystem/Tickets/TicketsDetails/TicketsDetails.jsx";
import Roles from "../pages/AccessRights/Roles/Roles/Roles.jsx";
import PassportApplication from "../pages/PassportApplication/PassportApplication.jsx";
import Department from "../pages/Department/Department.jsx";
import Services from "../pages/Services/Services.jsx";
import Login from "../pages/login/Login.jsx";
import UpdatePassword from "../pages/UpdatePassword/UpdatePassword.jsx";
import ResetPassword from "../pages/ResetPassword/ResetPassword.jsx";
import ValidatedOTP from "../pages/ValidateOTP/Validated.jsx";
import UserList from "../pages/AccessRights/Roles/Users/UserList.jsx";
import Banner from "../pages/Banner/Banner.jsx";
import FAQs from "../pages/FAQs/FAQs.jsx";
import UpcomingEvents from "../pages/UpcomingEvents/UpcomingEvents.jsx";
import KnowledgeBase from "../pages/KnowledgeBase/KnowledgeBase.jsx";
import PrivateRoute from "./PrivateRoute.js";
import { decrypt, encrypt } from "../utils/encryptDecrypt/encryptDecrypt";
import { hasViewPermission } from "../common/CommonFunctions/common";
import Support from "../pages/Support/Support.jsx";
import AddworkFlow from "../pages/AccessRights/Roles/Workflow/AddworkFlow.jsx";
import KnowledgeBaseModel from "../pages/KnowledgeBase/KnowledgeBaseModal.jsx";
import UpdateProfile from "../pages/MyProfile/UpdateProfile.jsx";
import BlockedIps from "../pages/BlockedIps/BlockedIps.jsx";
import AuditLog from "../pages/AuditLog/AuditLog.jsx";
import EmailTemplate from "../pages/EmailTemplate/EmailTemplate.jsx";
import SystemSupport from "../pages/Support/SystemSupport.jsx";
import AdminLogHistory from "../pages/AdminLogHistory/AdminLogHistory.jsx";
import CustomerLogHistory from "../pages/AdminLogHistory/CustomerLogHistory.jsx";
import FormBuilderList from "../pages/FormBuilder/FormBuilderList.jsx";
import FormBuilderCreate from "../pages/FormBuilder/FormBuilder.jsx";
import EmailLog from "../pages/EmailLog/EmailLog.jsx";
import PageNotFound from "../pages/Pages/PageNotFound/PageNotFound.js";
import Offlinepage from "../pages/Pages/Offline/OfflinePage.js";
import MasterDocumentList from "../pages/MasterDocumentList/MasterDocumentList.jsx";
import DepartmentAgentDashboard from "../pages/Dashboard/DepartmentAgentDashboard/DepartmentAgentDashboard.jsx";
import AccountDeptDashboard from "../pages/Dashboard/AccountDepartment/AccountDepartment.jsx";
import DeptHeadDashboard from "../pages/Dashboard/DepartmentHeadDashboard/DepartmentHeadDashboard.jsx";
import MinistryCoreUserDashboard from "../pages/Dashboard/MinistryCoreUser/MinistryCoreUser.jsx";
import ServiceDetailedView from "../pages/ApplicationsDetailedView/ServiceDetailedView.jsx";
import DepartmentServices from "../pages/DepartmentServices/DepartmentServices.jsx";
import Logout from "../pages/Authentication/Logout.js";
import useAxios from "../utils/hook/useAxios.jsx";
import ServicePerformanceByUser from "../pages/Reporting/ServicePerformanceByUser/ServicePerformanceByUser.jsx";
import TicketPerformanceByUser from "../pages/Reporting/TicketPerformaceByUser/TicketPerformaceByUser.jsx";
import CredentialDetails from "../pages/CredentialDetails/CredentialDetails.jsx";
import DeletecustomerData from "../pages/CredentialDetails/DeletecustomerData.jsx";
import Flow from "../pages/AccessRights/Roles/Workflow/Flow.js";
import CitizensDetailedView from "../pages/CitizensDetailedView/CitizensDetailedView.jsx";

const Index = () => {
    const [ok, setOk] = useState(false);
    const axiosInstance = useAxios()
    const [permissions, setPermissions] = useState({});
    const userEncryptData = localStorage.getItem("userData");
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const navigate = useNavigate();
    const location = useLocation();

    const getOnlineStatus = () => {
        return typeof navigator !== "undefined" &&
            typeof navigator.onLine === "boolean"
            ? navigator.onLine
            : true;
    };

    const [connectStatus, setConnectStatus] = useState(getOnlineStatus());

    const setOnline = () => setConnectStatus(true);
    const setOffline = () => setConnectStatus(false);

    useEffect(() => {
        window.addEventListener("online", setOnline);
        window.addEventListener("offline", setOffline);

        return () => {
            window.removeEventListener("online", setOnline);
            window.removeEventListener("offline", setOffline);
        };
    }, []);

    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);

    const token = userDecryptData?.data?.token;

    const userPermissionsDecryptData = useMemo(() => {
        return userPermissionsEncryptData
            ? decrypt({ data: userPermissionsEncryptData })
            : { data: [] };
    }, [userPermissionsEncryptData]);

    const findModulePermission = useCallback(
        (slug) =>
            userPermissionsDecryptData.data.find(
                (module) => module.slug === slug
            ),
        [userPermissionsDecryptData]
    );

    useEffect(() => {
        const authCheck = async () => {
            if (!token) {
                setOk(false);
            } else {
                setOk(true);
            }
        };

        authCheck();
    }, [token]);

    useEffect(() => {
        if (!userPermissionsDecryptData || !userPermissionsDecryptData.data)
            return;

        const permissionsMap = {};
        const slugs = [
            "users",
            "roles",
            "applications",
            "citizens",
            "directory",
            "banners",
            "faqs",
            "upcomingevents",
            "reviewfeedback",
            "knowledgebase",
            "support",
            "workflow",
            "tickets",
            "knowledgebase",
            "blockedIps",
            "auditLog",
            "emailtemplate",
            "revenue",
            "departmentperformance",
            "teamperformance",
            "adminLogHistory",
            "customerLogHistory",
            "formbuilder",
            "emailLog",
            "generalsetting",
            "citizensdetailedview"
        ];

        slugs.forEach((slug) => {
            const permissions = findModulePermission(slug);
            permissionsMap[slug] = permissions
                ? hasViewPermission(permissions)
                : false;
        });

        setPermissions(permissionsMap);
    }, [userPermissionsDecryptData, findModulePermission]);

    useEffect(() => {
        if (ok && token && location.pathname === "/") {
            navigate("/dashboard");
        }
    }, [ok, token, location.pathname, navigate]);

    const userPermissions = async () => {
        if (userDecryptData?.data?.roleId) {
            try {
                const response = await axiosInstance.post(
                    `userService/roles/userPermissions`,
                    {
                        roleId: userDecryptData?.data?.roleId,
                    }
                );

                if (response) {
                    const { rows } = response?.data?.data;
                    const userData = encrypt({ data: rows });
                    localStorage.setItem("userPermissions", userData?.data);

                    const permissionsMap = {};
                    rows.forEach((module) => {
                        permissionsMap[module.slug] = hasViewPermission(module);
                    });

                    setPermissions(permissionsMap);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        userPermissions();
        const intervalId = setInterval(() => {
            userPermissions();
        }, 360000);

        return () => clearInterval(intervalId);
    }, [
        userEncryptData,
        userDecryptData?.data?.roleId,
        userPermissionsDecryptData,
    ]);

    const roleNameToComponentMap = {
        // 'Admin': Dashboard,
        'Department Agent': DepartmentAgentDashboard,
        'Accountant': AccountDeptDashboard,
        'Department Admin': DeptHeadDashboard,
        'Super Admin Corea Team': MinistryCoreUserDashboard,
        'Super controller': MinistryCoreUserDashboard,
        'Support Team': DepartmentAgentDashboard,
      };

      const roleName = userDecryptData?.data?.role?.roleName;
      const DashboardComponent = roleNameToComponentMap[roleName] || Dashboard;

    const authProtectedRoutes = [
        { path: "/dashboard", component: <DashboardComponent />, permission: true },
        {
            path: "/applications",
            component: <ActiveApplications />,
            permission: permissions?.applications,
        },
        {
            path: "/complete-applications",
            component: <CompleteApplications />,
            permission: false,
        },
        {
            path: "/citizen",
            component: <Citizen />,
            permission: permissions?.citizens,
        },
        {
            path: "/citizens-detailed-view",
            component: <CitizensDetailedView />,
            permission: true,
        },
        {
            path: "/user-list",
            component: <Users />,
            permission: permissions?.users,
        },
        {
            path: "/users",
            component: <UserList />,
            permission: permissions?.users,
        },
        { path: "/work-flow", component: <WorkFlow />, permission: false },
        {
            path: "/directory",
            component: <Directory />,
            permission: permissions?.directory,
        },
        {
            path: "/application-report",
            component: <ApplicationReport />,
            permission: permissions?.revenue,
        },
        {
            path: "/revenue",
            component: <Revenue />,
            permission: permissions?.revenue,
        },
        {
            path: "/department-performance",
            component: <DepartmentPerformance />,
            permission: permissions?.departmentperformance,
        },
        {
            path: "/team-performance",
            component: <TeamPerformance />,
            permission: permissions?.teamperformance,
        },
        { path: "/log-report", component: <LogReport />, permission: false },
        {
            path: "/support-tickets",
            component: <SupportTickets />,
            permission: permissions?.tickets,
        },
        {
            path: "/user-review",
            component: <UserReview />,
            permission: permissions?.reviewfeedback,
        },
        { path: "/messages", component: <Messages />, permission: true },
        {
            path: "/chat-activity",
            component: <ChatActivity />,
            permission: false,
        },
        { path: "/settings", component: <Settings />, permission: permissions?.generalsetting },
        { path: "/my-profile", component: <UpdateProfile />, permission: true },
        {
            path: "/about-system",
            component: <AboutSystem />,
            permission: false,
        },
        {
            path: "/application-detailed-view",
            component: <ServiceDetailedView />,
            permission: permissions?.applications,
        },
        
        {
            path: "/knowledgebase-model",
            component: <KnowledgeBaseModel />,
            permission: permissions?.knowledgebase,
        },
        {
            path: "/tickets-details",
            component: <TicketsDetails />,
            permission: permissions?.tickets,
        },
        {
            path: "/roles",
            component: <Roles />,
            permission: permissions?.roles,
        },
        {
            path: "/passport-application",
            component: <PassportApplication />,
            permission: false,
        },
        { path: "/department", component: <Department />, permission: true },
        {
            path: "/banner",
            component: <Banner />,
            permission: permissions?.banners,
        },
        { path: "/faq", component: <FAQs />, permission: permissions?.faqs },
        { path: "/services", component: <Services />, permission: true },
        {
            path: "/upcoming-events",
            component: <UpcomingEvents />,
            permission: permissions?.upcomingevents,
        },
        {
            path: "/knowledge-base",
            component: <KnowledgeBase />,
            permission: permissions?.knowledgebase,
        },
        {
            path: "/support",
            component: <Support />,
            permission: permissions?.support,
        },

        {
            path: "/formbuilder",
            component: <FormBuilderCreate />,
            permission: permissions?.formbuilder,
        },
        {
            path: "/formbuilder/list",
            component: <FormBuilderList />,
            permission: permissions?.formbuilder,
        },

        {
            path: "/workflow",
            component: <WorkFlow />,
            permission: permissions?.workflow,
        },
        {
            path: "/add-workflow",
            component: <Flow />,
            permission: permissions?.workflow,
        },
        {
            path: "/blockedIps",
            component: <BlockedIps />,
            permission: permissions?.blockedIps,
        },
        {
            path: "/audit-log",
            component: <AuditLog />,
            permission: permissions?.auditLog,
        },
        {
            path: "/email-template",
            component: <EmailTemplate />,
            permission: permissions?.emailtemplate,
        },
        {
            path: "/admin-log-report",
            component: <AdminLogHistory />,
            permission: permissions?.adminLogHistory,
        },
        {
            path: "/customer-log-report",
            component: <CustomerLogHistory />,
            permission: permissions?.customerLogHistory,
        },
        {
            path: "/email-log",
            component: <EmailLog />,
            permission: permissions?.emailLog,
        },
        {
            path: "/master-document-list",
            component: <MasterDocumentList />,
            permission: true,
        },
        {
            path: "/user-performance",
            component: <ServicePerformanceByUser />,
            permission: permissions?.departmentperformance,
        },
        {
            path: "/user-ticket-performance",
            component: <TicketPerformanceByUser />,
            permission: permissions?.departmentperformance,
        },
        // {
        //     path:"/new-workflow",
        //     component:<Flow/>,
        //     permission:true
        // }
    ];
    
    const publicRoutes = [
        { path: "/", component: <Login /> },
        {path: "/logout", component: <Logout /> },
        {
            path: "/auth-pass-reset-cover/:userId",
            component: <UpdatePassword />,
        },
        { path: "/reset-password", component: <ResetPassword /> },
        { path: "/credentials-details", component: <CredentialDetails />},
        { path: "/delete-customer-data", component: <DeletecustomerData />},
    ];

    let pathArr = publicRoutes.map((ele) => ele.path);

    return (
        <React.Fragment>
            <Routes>
                {!connectStatus && (
                    <Route
                        path={location?.pathname}
                        element={<Offlinepage />}
                    />
                )}
                {connectStatus && (
                    <>
                        <Route>
                            {publicRoutes.map((route, idx) => (
                                <Route
                                    path={route.path}
                                    element={
                                        <NonAuthLayout>
                                            {route.component}
                                        </NonAuthLayout>
                                    }
                                    key={idx}
                                    exact={true}
                                />
                            ))}
                        </Route>
                        <Route element={<PrivateRoute ok={ok} />}>
                            {authProtectedRoutes.map((route, idx) =>
                                route.permission ? (
                                    <Route
                                        path={route.path}
                                        element={
                                            <VerticalLayout>
                                                {route.component}
                                            </VerticalLayout>
                                        }
                                        key={idx}
                                        exact={true}
                                    />
                                ) : (
                                    <Route
                                        path={route.path}
                                        element={<Navigate to="/dashboard" />}
                                        key={idx}
                                        exact={true}
                                    />
                                )
                            )}
                        </Route>
                        <Route path="*" element={<PageNotFound />} />
                    </>
                )}
            </Routes>
        </React.Fragment>
    );
};

export default Index;
