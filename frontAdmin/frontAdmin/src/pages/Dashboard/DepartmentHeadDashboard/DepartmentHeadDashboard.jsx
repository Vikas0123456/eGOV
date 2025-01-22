import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import netclues from "../../../assets/images/netcluesCopy.png";
import { useDispatch, useSelector } from "react-redux";
import { FiFilter } from "react-icons/fi";
import { Autoplay, Pagination } from "swiper/modules";
import ApexChart from "./ServiceChart";
import TeamvsTicketChart from "./TeamvsTicketChart";
import "swiper/css";
import "swiper/css/pagination";
import DashboardSvg from "../../../assets/svg/DashboardSvg";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import SupportTickets from "../../TicketingSystem/Tickets/SupportTickets";
import ActiveApplications from "../../Applications/ActiveApplications/ActiveApplications";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import AnnouncementCarousel from "../AnnouncementCarousel";
import { Dropdown, DropdownButton } from "react-bootstrap";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import useAxios from "../../../utils/hook/useAxios";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css"; // Ensure you import necessary CSS files
import "react-resizable/css/styles.css"; // For resizable
import { ImCross } from "react-icons/im";
import { setTableColumnConfig } from "../../../slices/layouts/reducer";
import SimpleBar from "simplebar-react";
import { Button,Input } from "reactstrap";
import Select  from "react-select";
import Swal from "sweetalert2";

const defaultCardsData = {
    announcements: true,
    serviceRequestRevenue: true,
    teamRequestTickets: true,
    servicesRequest: true,
    tickets: true,
    applications: true,
    ticketsListing: true,
};

const defaultLayout = [
    {
        w: 12,
        h: 1.25,
        minW: 6,
        x: 0,
        y: 0,
        i: "announcements",
        moved: false,
        static: false,
    },
    {
        w: 12,
        h: 3,
        minH: 3,
        minW: 4,
        x: 0,
        y: 4.2,
        i: "serviceRequestRevenue",
        moved: false,
        static: false,
    },
    {
        w: 4,
        h: 3,
        minH: 3,
        minW: 3,
        x: 4,
        y: 1.2,
        i: "teamRequestTickets",
        moved: false,
        static: false,
    },
    {
        w: 4,
        h: 3,
        minH: 1,
        minW: 2,
        x: 0,
        y: 1.2,
        i: "servicesRequest",
        moved: false,
        static: false,
    },
    {
        w: 4,
        h: 3,
        minH: 2,
        minW: 1,
        x: 8,
        y: 1.2,
        i: "tickets",
        moved: false,
        static: false,
    },
    {
        w: 12,
        h: 3,
        minH: 3,
        minW: 12,
        maxH: 10,
        x: 0,
        y: 12,
        i: "applications",
        moved: false,
        static: false,
        isResizable: false,
    },
    {
        w: 12,
        h: 3,
        minH: 3,
        minW: 12,
        maxH: 10,
        x: 0,
        y: 12,
        i: "ticketsListing",
        moved: false,
        static: false,
        isResizable: false,
    },
];

const calculatePercentages = (statuses) => {
    const { new: newTickets, inProgress, escalated, closed, reopened } = statuses;

    const total = newTickets + inProgress + escalated + closed + reopened;

    const percentages = {
        closed: total === 0 ? 0 : (closed / total) * 100,
        inProgress: total === 0 ? 0 : (inProgress / total) * 100,
        escalated: total === 0 ? 0 : (escalated / total) * 100,
        new: total === 0 ? 0 : (newTickets / total) * 100,
        reopened: total === 0 ? 0 : (reopened / total) * 100,
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
    document.title = "Dashboard | eGov Solution";
    const axiosInstance = useAxios();
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const departmentId = userData?.departmentId;

    const dispatch = useDispatch();
    const tableName = "departmentHeadDashboard";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );

    const tableConfigLoading = useSelector(
        (state) => state?.Layout?.configDataLoading
    );

    const navigate = useNavigate();
    const [data, setData] = useState("");
    const dashboardType = useSelector((state) => state.dashboardType);
    const [ticketCount, setTicketCount] = useState();
    const [ticketCountPercentage, setTicketCountPercentage] = useState();
    const [serviceRequest, setSericeRequest] = useState();
    const [serviceRequestDuration, setSericeRequestDuration] = useState("");
    const [serviceRevenueDuration, setSericeRevenueDuration] = useState("");
    const [serviceRevenueData, setSericeRevenueData] = useState([]);
    const [selectStartDate, setSelectStartDate] = useState(null);
    const [selectEndDate, setSelectEndDate] = useState(null);
    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [isServiceDaterange, setIsServiceDaterange] = useState(false);
    const [isServiceRevenueDaterange, setIsServiceRevenueDaterange] = useState(false);
    const [serviceCountPercentage, setServiceCountPercentage] = useState();
    const [teamVsTicketduration, setTeamVsTicketduration] = useState("");
    const [dataById, setDataById] = useState([]);
    const [ticketvsteamData, setTicketvsteamData] = useState([]);
    const [selectStartDateTeamvsTicket, setSelectStartDateTeamvsTicket] =
        useState();
    const [selectEndDateTeamvsTicket, setSelectEndDateTeamvsTicket] =
        useState();
    const [dateStartTeamvsTicket, setDateStartTeamvsTicket] = useState();
    const [dateEndTeamvsTicket, setDateEndTeamvsTicket] = useState();
    const [isDaterangeTeamvsTicket, setIsDaterangeTeamvsTicket] =
        useState(false);
    const [selectedServicesRequest, setSelectedServicesRequest] =
        useState("All");
    const [teamRequestLoading, setTeamRequestLoading] = useState(true);
    const [serviceRequestLoading, setServiceRequestLoading] = useState(true);
    const [serviceRevenueLoading, setServiceRevenueLoading] = useState(true);
    const [announcementloading, setAnnouncementLoading] = useState(true);
    const [ticketloading, setTicketloading] = useState(true);
    
    const [isOpen, setIsopen] = useState(false);
    
    const [showServiceRequestsDateRange, setShowServiceRequestsDateRange] =
    useState(false);
    const [selectServiceRequestsStartDate, setSelectServiceRequestsStartDate] =
    useState(null);
    const [selectServiceRequestsEndDate, setSelectServiceRequestsEndDate] =
    useState(null);
    const [dateStartServiceRequests, setDateStartServiceRequests] =
    useState(null);
    const [dateEndServiceRequests, setDateEndServiceRequests] = useState(null);
    
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };

    //states for common 
    const [commonDateStart, setCommonDateStart] = useState(null)
    const [commonDateEnd, setCommonDateEnd] = useState(null)
    const [selectCommonDateStart, setSelectCommonDateStart] = useState(null)
    const [selectCommonDateEnd, setSelectCommonDateEnd] = useState(null)
    
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener("resize", handleResize);
        
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    //Layout States and logic
    const [updateLayout, setUpdateLayout] = useState(false);
    const [layoutReady, setLayoutReady] = useState(false);

    const [selectedLayout, setSelectedLayout] = useState("default");
    const [currentLayoutName, setCurrentLayoutName] = useState("Default Layout");
    const [cardsData, setCardsData] = useState({});
    const [layout, setLayout] = useState([]);
    const [layoutOptions, setLayoutOptions] = useState([]);
    const [isNewLayout, setIsNewLayout] = useState(false);

    const { memoizedLayoutData, memoizedCardsData } = useMemo(() => {
        const hasValidConfig =
            tableColumnConfig?.tableConfig &&
            Object.keys(tableColumnConfig.tableConfig).length > 0;

        if (hasValidConfig && !isNewLayout) {
            let layoutOpt = [{
                value: "newLayout",
                label: "Create New Layout",
            }]
            tableColumnConfig?.tableConfig?.layouts?.map((item) => {
                return layoutOpt.push({
                    value: item.layoutId,
                    label: item.layoutName,
                });
            });

            setLayoutOptions(layoutOpt);
            setSelectedLayout(tableColumnConfig?.tableConfig?.selectedLayout)
            // Extract selected layout data
            const selectedConfig = tableColumnConfig.tableConfig.layouts?.find(
                (layoutConfig) => layoutConfig.layoutId === tableColumnConfig.tableConfig.selectedLayout
            );

            if (selectedConfig) {
                setCurrentLayoutName(selectedConfig.layoutName);
                return {
                    memoizedLayoutData: selectedConfig.layoutData,
                    memoizedCardsData: selectedConfig.cardsData,
                };
            }
        } else if(!isNewLayout) {
            setLayoutOptions([{
                value: "newLayout",
                label: "Create New Layout",
            },
            {
                value: "default",
                label: "Default Layout",
            }]);
        }

        return {
            memoizedLayoutData: defaultLayout,
            memoizedCardsData: defaultCardsData,
        };
        // Return defaults if no valid data is found
    }, [tableColumnConfig, isNewLayout]);

    // Update states when memoized data changes
    useEffect(() => {
        if (memoizedLayoutData) setLayout(memoizedLayoutData);
        if (memoizedCardsData) setCardsData(memoizedCardsData);
    }, [memoizedLayoutData, memoizedCardsData]);

    // Memoize layout processing
    const processedLayout = useMemo(() => {
        if (!Object.keys(cardsData || {}).length) {
            return defaultLayout;
        }

        return defaultLayout
            .filter((item) => cardsData[item.i])
            .map((item) => {
                const existingItem = layout?.find(
                    (layoutItem) => layoutItem.i === item.i
                );
                return existingItem || item;
            });
    }, [cardsData, layout, defaultLayout]);

    const isLayoutReady = !!processedLayout;
    useEffect(() => {
        if (isLayoutReady && !tableConfigLoading) {
            setLayoutReady(true);
        }
    }, [isLayoutReady, tableConfigLoading]);

    // Memoize width calculation
    const gridWidth = useMemo(
        () => window.innerWidth - (updateLayout ? 280 : 80),
        [updateLayout, isOpen]
    );

    // Optimize layout change handler
    const handleLayoutChange = useCallback(
        (newLayout) => {
            const hasLayoutChanged = layout?.some((item, index) => {
                const newItem = newLayout[index];
                return (
                    item?.x !== newItem?.x ||
                    item?.y !== newItem?.y ||
                    item?.w !== newItem?.w ||
                    item?.h !== newItem?.h
                );
            });

            if (hasLayoutChanged) {
                setLayout(newLayout);
            }
        },
        [layout]
    );

    const toggleUpdateLayout = () => {
        if (updateLayout) {
            setUpdateLayout(false);
            updateTableConfig();
        }
    };

    const hanldeResetLayout = () => {
            setUpdateLayout(false);
            resetLayoutTable();
    };

    const setTrueIfFalse = (key) => {
        setCardsData((prevData) => ({
            ...prevData,
            [key]: !prevData[key],
        }));
    };

    const setFalse = (key) => {
        setCardsData((prevData) => ({
            ...prevData,
            [key]: false,
        }));
    };

    const ToggleSidebar = () => {
        setIsopen(!isOpen);
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

                if (response) {
                    const data = response?.data?.data;
                    dispatch(setTableColumnConfig(data));
                }
            }
        } catch (error) {
            console.error("Error fetching profile image:", error.message);
        }
    };

    const handleLayoutVersionChange = async (layoutId) => {
        if(layoutId === "newLayout"){
            setIsNewLayout(true);
            setUpdateLayout(true);
            setSelectedLayout(null)
            setLayout(defaultLayout);
            setCardsData(defaultCardsData);
            setCurrentLayoutName("")
        }else{
            setIsNewLayout(false);
            const updatedTableConfig = {
                ...tableColumnConfig?.tableConfig,
                selectedLayout: layoutId,
            };
    
            try {
                const response = await axiosInstance.post(`userService/table/update-table-config`, {
                    userId,
                    tableName,
                    tableConfig: JSON.stringify(updatedTableConfig)
                });
    
                if(response){
                    fetchTableConfigData()
                }
            } catch (error) {
                console.error("Failed to update", error);
            }
        }

    };

    const addNewLayout = async () => {
        const newLayoutId = `custom_${Date.now()}`;
        const newLayout = {
            layoutId: newLayoutId,
            layoutName: currentLayoutName || `Layout ${tableColumnConfig?.tableConfig?.layouts?.length || 0 + 1}`,
            layoutData: layout,
            cardsData: cardsData,
        };

        const updatedTableConfig = {
            ...tableColumnConfig?.tableConfig,
            layouts: [
                ...(tableColumnConfig?.tableConfig?.layouts || [{
                    layoutId: "default",
                    layoutName: "Default Dashboard",
                    cardsData: defaultCardsData,
                    layoutData: defaultLayout,
                }]),
                newLayout,
            ],
            selectedLayout: newLayoutId,
        };

        try {
            const response =await axiosInstance.post(`userService/table/update-table-config`, {
                userId,
                tableName,
                tableConfig: JSON.stringify(updatedTableConfig),
            });

            if(response){
                fetchTableConfigData();
                setIsNewLayout(false);
                setUpdateLayout(false);
            }
        } catch (error) {
            console.error("Failed to add a new layout", error);
        }
    };

    const deleteLayout = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this layout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedLayouts = tableColumnConfig?.tableConfig?.layouts?.filter(
                    (layoutConfig) => layoutConfig.layoutId !== selectedLayout
                );

                const updatedTableConfig = {
                    ...tableColumnConfig?.tableConfig,
                    layouts: updatedLayouts,
                    selectedLayout: updatedLayouts[updatedLayouts?.length - 1]?.layoutId,
                };

                if(updatedLayouts?.length === 0){
                    setCurrentLayoutName("Default Layout")
                }

                try {
                    const response = await axiosInstance.post(
                        `userService/table/update-table-config`,
                        {
                            userId: userId,
                            tableName: tableName,
                            tableConfig: JSON.stringify(updatedTableConfig),
                        }
                        );
                        if(response){
                            fetchTableConfigData();
                            setUpdateLayout(false);
                            setIsNewLayout(false);
                        }
                } catch (error) {
                    console.error("Failed to delete layout", error);
                }
            }
        });
       
    };

    const updateTableConfig = async () => {
        try {
            let updatedTableConfig
            if(tableColumnConfig?.tableConfig && tableColumnConfig?.tableConfig?.layouts){
                const updatedLayouts = tableColumnConfig?.tableConfig?.layouts?.map(
                    (layoutConfig) =>
                        layoutConfig.layoutId === selectedLayout
                            ? { ...layoutConfig, layoutData: layout, cardsData, layoutName: currentLayoutName || "Default Layout" }
                            : layoutConfig
                );
        
                updatedTableConfig = {
                    ...tableColumnConfig?.tableConfig,
                    layouts: updatedLayouts,
                };
            } else {
                updatedTableConfig = {
                    ...tableColumnConfig?.tableConfig,
                    layouts: [
                        {
                            layoutId: "default",
                            layoutName: "Default Dashboard",
                            cardsData: cardsData,
                            layoutData: layout,
                        },
                    ],
                    selectedLayout: "default",
                };
            }

            const response = await axiosInstance.post(
                `userService/table/update-table-config`,
                {
                    userId: userId,
                    tableName: tableName,
                    tableConfig: JSON.stringify(updatedTableConfig),
                }
            );
            if (response) {
                fetchTableConfigData();
                setUpdateLayout(false);
                setIsNewLayout(false);
            }
        } catch (error) {
            console.error("Something went wrong while update");
        }
    };

    const resetLayoutTable = async () => {
        try {
            const updatedLayouts = tableColumnConfig?.tableConfig?.layouts?.map(
                (layoutConfig) =>
                    layoutConfig.layoutId === selectedLayout
                        ? { ...layoutConfig, layoutData: defaultLayout, cardsData: defaultCardsData }
                        : layoutConfig
            );
    
            const updatedTableConfig = {
                ...tableColumnConfig?.tableConfig,
                layouts: updatedLayouts,
            };

            const response = await axiosInstance.post(
                `userService/table/update-table-config`,
                {
                    userId: userId,
                    tableName: tableName,
                    selectedLayout: defaultLayout,
                    tableConfig: JSON.stringify(updatedTableConfig),
                }
            );
            if (response) {
                fetchTableConfigData();
            }
        } catch (error) {
            console.error("Something went wrong while update");
        }
    };

    const slugsToCheck = [
        "announcements",
        "revenue",
        "services",
        "applications",
        "tickets",
    ];

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

    function commonOnChangeHandeler(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectCommonDateStart(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectCommonDateEnd(formattedendDate);
            setSericeRevenueDuration("")
            setTeamVsTicketduration("")
            setSericeRequestDuration("");
            setSelectedServicesRequest("");
            setSelectServiceRequestsEndDate("")
            setSelectServiceRequestsStartDate("")
            setSelectStartDateTeamvsTicket("")
            setSelectEndDateTeamvsTicket("")
            setSelectEndDate("")
            setSelectEndDate("")
        }
        setCommonDateStart(value[0]);
        setCommonDateEnd(value[1]);
    }

    const resetCommonFilter = ()=>{
        setCommonDateStart(null)
        setCommonDateEnd(null)
        setSelectCommonDateStart(null)
        setSelectCommonDateEnd(null)
    }

    function onChangeServiceRevenueHandler(value) {
        const inputstartDateString = value[0];
        const inputEndDateString = value[1];

        const formattedstartDate = formatDateString(inputstartDateString);
        const formattedendDate = formatDateString(inputEndDateString);

        if (formattedstartDate) {
            setSelectStartDate(formattedstartDate);
        }
        if (formattedendDate >= formattedstartDate) {
            setSelectEndDate(formattedendDate);
            setSericeRevenueDuration("")
        }
        setDateStart(value[0]);
        setDateEnd(value[1]);

        setIsServiceRevenueDaterange(false);
        setSericeRevenueDuration();

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
            setTeamVsTicketduration("")
            setIsDaterangeTeamvsTicket(false)
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
            setSericeRequestDuration("");

        }
        setDateStartServiceRequests(value[0]);
        setDateEndServiceRequests(value[1]);

        // if (formattedstartDate && formattedendDate) {
        //     setSericeRequestDuration("Custom");
        // }
        setShowServiceRequestsDateRange(false);
    }

    const handleDateRangeSeviceRevenueOpen = () => {
        setIsServiceRevenueDaterange((prevState) => !prevState);
    };
    const handleDateRangeTeamvsTicket = () => {
        setIsDaterangeTeamvsTicket(!isDaterangeTeamvsTicket);
    };
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
                setTicketCount(data);
                setTicketloading(false);
                if (data) {
                    let percentage = calculatePercentages(data);
                    setTicketCountPercentage(percentage);
                }
            }
        } catch (error) {
            setTicketloading(false);
            console.error(error.message);
        }
    };

    const fetchServiceRequest = async () => {
        try {
            setServiceRequestLoading(true);
            const response = await axiosInstance.post(
                `businessLicense/application/serviceRequests`,
                {
                    dateRangeOption: serviceRequestDuration,
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : null,
                    dateRange: {
                        startDate: selectServiceRequestsStartDate ? selectServiceRequestsStartDate : selectCommonDateStart,
                        endDate: selectServiceRequestsEndDate? selectServiceRequestsEndDate : selectCommonDateEnd,
                    },
                }
            );
            if (response?.data) {
                const data = response?.data?.data?.rows;
                setSericeRequest(data);
                setServiceRequestLoading(false);
            }
        } catch (error) {
            setServiceRequestLoading(false);
            console.error(error.message);
        }
    };
    const fetchServiceRevenue = async () => {
        try {
            setServiceRevenueLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/serviceRevenue`,
                {
                    departmentId: departmentId,
                    dateRangeOption: serviceRevenueDuration,
                    dateRange: {
                        startDate: selectStartDate ? selectStartDate: selectCommonDateStart,
                        endDate: selectEndDate? selectEndDate: selectCommonDateEnd,
                    },
                }
            );
            if (response?.data) {
                const data = response?.data?.data;
                setSericeRevenueData(data);
                setServiceRevenueLoading(false);
            }
        } catch (error) {
            setServiceRevenueLoading(false);
            console.error(error.message);
        }
    };
    const fetchTeamvsTicket = async () => {
        try {
            setTeamRequestLoading(true);
            const response = await axiosInstance.post(
                `departmentReport/ticket/teamvsticket`,
                {
                    departmentId: departmentId,
                    dateRangeOption: teamVsTicketduration,
                    dateRange: {
                        startDate: selectStartDateTeamvsTicket ? selectStartDateTeamvsTicket : selectCommonDateStart ,
                        endDate: selectEndDateTeamvsTicket? selectEndDateTeamvsTicket : selectCommonDateEnd ,
                    },
                }
            );
            if (response?.data) {
                const data = response?.data?.data;
                setTicketvsteamData(data);
                setTeamRequestLoading(false);
            }
        } catch (error) {
            setTeamRequestLoading(false);
            console.error(error.message);
        }
    };
    useEffect(() => {
        if (userData?.departmentId) {
            fetchTeamvsTicket();
        }
    }, [
        teamVsTicketduration,
        selectStartDateTeamvsTicket,
        selectEndDateTeamvsTicket,
        selectCommonDateEnd,
        selectCommonDateStart
    ]);
    useEffect(() => {
        if (userData?.departmentId) {
            fetchTicketCount();
        }
    }, []);
    useEffect(() => {
        if (userData?.departmentId) {
            fetchServiceRequest();
        }
    }, [
        serviceRequestDuration,
        selectServiceRequestsStartDate,
        selectServiceRequestsEndDate,
        selectCommonDateEnd, 
        selectCommonDateStart
    ]);

    useEffect(() => {
        if (userData?.departmentId) {
            fetchServiceRevenue();
        }
    }, [serviceRevenueDuration, selectStartDate, selectEndDate, selectCommonDateEnd, selectCommonDateStart]);

    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            fetchDepartmentById();
        }
    }, []);

    const listOfAnnouncements = async () => {
        try {
            setAnnouncementLoading(true);
            const response = await axiosInstance.post(
                `userService/announcement/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setData(rows);
                setAnnouncementLoading(false);
            }
        } catch (error) {
            setAnnouncementLoading(false);
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
        const serviceCountData =
            serviceRevenueData &&
            serviceRevenueData.map((item) => item.serviceCount);
        const revenueData =
            serviceRevenueData &&
            serviceRevenueData.map((item) => item.revenue);

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
        if (value !== "Custom") {
            setTeamVsTicketduration(value);
            setIsDaterangeTeamvsTicket(false);
        } else{
            setIsDaterangeTeamvsTicket(true);
        }
        setSelectStartDateTeamvsTicket();
        setSelectEndDateTeamvsTicket();
        setDateStartTeamvsTicket();
        setDateEndTeamvsTicket();
        setIsServiceDaterange(false);
        setSelectStartDate();
        setSelectEndDate();
        setDateStart();
        setDateEnd();
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
        }
            // setIsServiceDaterange(false);
            setSelectStartDate();
            setSelectEndDate();
            setDateStart();
            setDateEnd();
            // setIsDaterangeTeamvsTicket(false);
            // setSelectStartDateTeamvsTicket();
            // setSelectEndDateTeamvsTicket();
            // setDateStartTeamvsTicket();
            // setDateEndTeamvsTicket();
    };

    const menuItems = [
        {
            title: "Announcement",
            icon: "ri-bar-chart-2-line",
            cardValue: "announcements",
            onClick: () => setTrueIfFalse("announcements"),
        },
        {
            title: "Service Request",
            icon: "ri-bar-chart-2-line",
            style: { transform: "rotate(90deg)" },
            cardValue: "servicesRequest",
            onClick: () => setTrueIfFalse("servicesRequest"),
        },
        {
            title: "Team Request vs. Tickets",
            icon: "ri-coupon-line",
            cardValue: "teamRequestTickets",
            onClick: () => setTrueIfFalse("teamRequestTickets"),
        },
        {
            title: "Tickets",
            icon: "ri-coupon-line",
            style: { transform: "rotate(90deg)" },
            cardValue: "tickets",
            onClick: () => setTrueIfFalse("tickets"),
        },
        {
            title: "Service Requests vs. Revenue",
            icon: "ri-money-dollar-circle-line",
            cardValue: "serviceRequestRevenue",
            onClick: () => setTrueIfFalse("serviceRequestRevenue"),
        },
        {
            title: "Recent Applications",
            icon: "mdi mdi-sitemap-outline",
            cardValue: "applications",
            onClick: () => setTrueIfFalse("applications"),
        },
        {
            title: "Recent Tickets",
            icon: "ri-customer-service-line",
            cardValue: "ticketsListing",
            onClick: () => setTrueIfFalse("ticketsListing"),
        },
    ].map((menu) => ({
        ...menu,
        cardAdded: cardsData[menu.cardValue] || false,
    }));

    return (
        <div id="layout-wrapper">
            <div className="main-content dashboard-ana">
                <div
                    className={`page-content custom-sidebar ${updateLayout ? "menu--open" : ""
                        } px-0 `}>
                    {
                        !updateLayout && !isMobile && (
                            <Button onClick={() => setUpdateLayout(true)} size="sm" className="edit-layout bg-primary" varian="secondary" title="Edit Layout">
                                <i className="mdi mdi-cog-outline fs-20 align-middle me-1 rotating-icon"></i>
                            </Button>
                        )
                    }
                    {isMobile ? (
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
                                                        <div className="card-body p-3">
                                                            <LoaderSpin />
                                                        </div>
                                                    </>
                                                ) : !announcementloading &&
                                                    data.length === 0 ? (
                                                    <>
                                                        <div className="text-center">
                                                            <p className="text-muted">
                                                                No Announcement
                                                                found.
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="card-body p-3">
                                                        <AnnouncementCarousel
                                                            items={data}
                                                            announcementsViewPermission={
                                                                announcementsViewPermission
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-xl-7">
                                            <div className="card border-0 p-0 ">
                                                <div className="card-header align-items-center d-flex flex-wrap ">
                                                    <h5 className="mb-0 flex-grow-1 title-sr">
                                                        Service Request vs.
                                                        Revenue
                                                    </h5>
                                                    <div className="col-sm-auto mx-3 ">
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "All"
                                                                )
                                                            }>
                                                            {" "}
                                                            ALL{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "1w"
                                                                )
                                                            }>
                                                            {" "}
                                                            1W{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "1m"
                                                                )
                                                            }>
                                                            {" "}
                                                            1M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "3m"
                                                                )
                                                            }>
                                                            {" "}
                                                            3M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "6m"
                                                                )
                                                            }>
                                                            {" "}
                                                            6M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceRevenueDuration ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceRevenueDuration(
                                                                    "1y"
                                                                )
                                                            }>
                                                            {" "}
                                                            1Y{" "}
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
                                                                    title="Date Range">
                                                                    <div
                                                                        className="fw-semibold text-uppercase fs-12"
                                                                        onClick={
                                                                            handleDateRangeSeviceRevenueOpen
                                                                        }>
                                                                        <FiFilter
                                                                            style={{
                                                                                color: "white",
                                                                                fontSize:
                                                                                    "15px",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        isServiceRevenueDaterange
                                                                            ? `dropdown-menu dropdown-menu-end shadow-none show`
                                                                            : `dropdown-menu dropdown-menu-end shadow-none `
                                                                    }
                                                                    style={{
                                                                        width: "270px",
                                                                        position:
                                                                            "absolute",
                                                                        inset: "0px 0px auto auto",
                                                                        margin: "0px",
                                                                        transform:
                                                                            "translate3d(0px, 30px, 0px)",
                                                                    }}
                                                                    data-popper-placement="bottom-end">
                                                                    <div className="input-group">
                                                                        <DateRangePopup
                                                                            dateStart={
                                                                                dateStart
                                                                            }
                                                                            dateEnd={
                                                                                dateEnd
                                                                            }
                                                                            onChangeHandler={
                                                                                onChangeServiceRevenueHandler
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
                                                {serviceRevenueLoading ? (
                                                    <div className="card-body">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : !serviceRevenueLoading &&
                                                    serviceRevenueData?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Service Revenue
                                                            found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="card-body">
                                                        <LinewithDataLabels
                                                            serviceRevenueData={
                                                                serviceRevenueData
                                                            }
                                                            revenueViewPermission={
                                                                revenueViewPermission
                                                            }
                                                            servicesViewPermission={
                                                                servicesViewPermission
                                                            }
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
                                                    {/* <div className="col-sm-auto mx-3">
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "All"
                                                                )
                                                            }>
                                                            {" "}
                                                            ALL{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "1w"
                                                                )
                                                            }>
                                                            {" "}
                                                            1W{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "1m"
                                                                )
                                                            }>
                                                            {" "}
                                                            1M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "3m"
                                                                )
                                                            }>
                                                            {" "}
                                                            3M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "6m"
                                                                )
                                                            }>
                                                            {" "}
                                                            6M{" "}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                teamVsTicketduration ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleRequestvsTicketsfilter(
                                                                    "1y"
                                                                )
                                                            }>
                                                            {" "}
                                                            1Y{" "}
                                                        </button>
                                                    </div> */}
                                                    <div className="col-sm-auto">
                                                        <div className="flex-shrink-0">
                                                            <div className="dropdown card-header-dropdown">
                                                                <div
                                                                    className="btn btn-primary btn-sm btn-card-inline"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-haspopup="true"
                                                                    aria-expanded="false"
                                                                    title="Date Range">
                                                                    <div
                                                                        className="fw-semibold text-uppercase fs-12"
                                                                        onClick={
                                                                            handleDateRangeTeamvsTicket
                                                                        }>
                                                                        <FiFilter />
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className={
                                                                        isDaterangeTeamvsTicket
                                                                            ? `dropdown-menu dropdown-menu-end shadow-none show`
                                                                            : `dropdown-menu dropdown-menu-end shadow-none `
                                                                    }
                                                                    style={{
                                                                        width: "270px",
                                                                        position:
                                                                            "absolute",
                                                                        inset: "0px 0px auto auto",
                                                                        margin: "0px",
                                                                        transform:
                                                                            "translate3d(0px, 30px, 0px)",
                                                                    }}
                                                                    data-popper-placement="bottom-end">
                                                                    <div className="input-group">
                                                                        <DateRangePopup
                                                                            dateStart={
                                                                                dateStartTeamvsTicket
                                                                            }
                                                                            dateEnd={
                                                                                dateEndTeamvsTicket
                                                                            }
                                                                            onChangeHandler={
                                                                                onChangeHandlerTeamvsTicket
                                                                            }
                                                                        />
                                                                        <div className="input-group-text bg-primary border-primary text-white">
                                                                            <i className="ri-calendar-2-line"></i>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="dropdown-menu dropdown-menu-end">
                                                                    <div className="dropdown-item">
                                                                        {" "}
                                                                        Request{" "}
                                                                    </div>
                                                                    <div className="dropdown-item">
                                                                        {" "}
                                                                        Tickets{" "}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {teamRequestLoading ? (
                                                    <div className="card-body  p-3">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : !teamRequestLoading &&
                                                    ticketvsteamData?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Ticket Team
                                                            found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="card-body p-3">
                                                        <TeamvsTicketChart
                                                            data={
                                                                ticketvsteamData
                                                            }
                                                            ticketsViewPermission={
                                                                ticketsViewPermission
                                                            }
                                                        />
                                                    </div>
                                                )}
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
                                                            align="end">
                                                            {[
                                                                {
                                                                    label: "All",
                                                                    value: "All",
                                                                },
                                                                {
                                                                    label: "One Week",
                                                                    value: "1w",
                                                                },
                                                                {
                                                                    label: "One Month",
                                                                    value: "1m",
                                                                },
                                                                {
                                                                    label: "Three Months",
                                                                    value: "3m",
                                                                },
                                                                {
                                                                    label: "Six Months",
                                                                    value: "6m",
                                                                },
                                                                {
                                                                    label: "One Year",
                                                                    value: "1y",
                                                                },
                                                                {
                                                                    label: "Custom",
                                                                    value: "Custom",
                                                                },
                                                            ].map((option) => (
                                                                <Dropdown.Item
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    onClick={() =>
                                                                        handleServiceRequestDuration(
                                                                            option.value
                                                                        )
                                                                    }
                                                                    active={
                                                                        selectedServicesRequest ===
                                                                        option.value
                                                                    }>
                                                                    {
                                                                        option.label
                                                                    }
                                                                </Dropdown.Item>
                                                            ))}
                                                        </DropdownButton>
                                                    </div>
                                                </div>
                                                {showServiceRequestsDateRange && (
                                                    <div className="input-group">
                                                        <DateRangePopup
                                                            dateStart={
                                                                dateStartServiceRequests
                                                            }
                                                            dateEnd={
                                                                dateEndServiceRequests
                                                            }
                                                            onChangeHandler={
                                                                onChangeServiceRequestsHandler
                                                            }
                                                        />
                                                        <div className="input-group-text bg-primary border-primary text-white">
                                                            <i className="ri-calendar-2-line"></i>
                                                        </div>
                                                    </div>
                                                )}
                                                {serviceRequestLoading ? (
                                                    <div className="card-body p-0 border-0">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : !serviceRequestLoading &&
                                                    serviceRequest?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Service Request
                                                            found .
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="card-body p-0 border-0">
                                                        <ApexChart
                                                            data={
                                                                serviceRequest
                                                            }
                                                            servicesViewPermission={
                                                                servicesViewPermission
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="card border-0">
                                                <div className="card-header">
                                                    <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold ">
                                                        {" "}
                                                        Tickets{" "}
                                                    </h4>
                                                </div>

                                                {ticketloading ? (
                                                    <div className="card-body border-0 py-2">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : !ticketloading &&
                                                    !ticketsViewPermission?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Ticket found .
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        New
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.new ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#405189",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.new ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.new ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        In-Progress{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.inProgress ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f06548",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.inProgress ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.inProgress ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        Escalated{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.escalated ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#F7B84B",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.escalated ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.escalated ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pt-2 pb-3">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        Closed{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.closed ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#0ab39c",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.closed ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.closed ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                       Reopened{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.reopened ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f06548",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.reopened ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.reopened ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
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
                                                <h5 className="mb-0">
                                                    Recent Applications
                                                </h5>
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
                                                <h5 className="mb-0">
                                                    Recent Tickets
                                                </h5>
                                            </div>
                                            <SupportTickets
                                                isDashBoard={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="container-fluid">
                            {/* <div className="row"> */}
                            
                            <DepartmentUserInfo />
                            <div className="d-flex align-items-center justify-content-end me-4">
                                <div className="p-0 me-3">
                                    <DateRangePopup
                                        dateStart={
                                            commonDateStart
                                        }
                                        dateEnd={
                                            commonDateEnd
                                        }
                                        onChangeHandler={
                                            commonOnChangeHandeler
                                        }
                                    />
                                    
                                </div>
                               <Button
                                color="primary" className="me-3  btn-icon waves-effect waves-light btn btn-primary"
                                    type="button"
                                    
                                    onClick={resetCommonFilter}
                                    title="Reset Date"
                                >

                                    <i className="mdi  mdi-update fs-20"></i>
                                    
                                </Button>
                                <Select
                                    className="bg-choice text-start me-2"
                                    value={layoutOptions?.length > 0 ? layoutOptions.find(option => option.value === selectedLayout) : null }
                                    onChange={(layout)=> {
                                        handleLayoutVersionChange(layout?.value)
                                    }}
                                    options={layoutOptions}
                                    styles={{
                                        control: (
                                            provided
                                        ) => ({
                                            ...provided,
                                            cursor: "pointer",
                                        }),
                                        menu: (
                                            provided
                                        ) => ({
                                            ...provided,
                                            cursor: "pointer",
                                        }),
                                        option: (
                                            provided
                                        ) => ({
                                            ...provided,
                                            cursor: "pointer",
                                        }),
                                    }}
                                    placeholder="Select Layout*"
                                />
                                <Button onClick={() => hanldeResetLayout()} title="Reset Layout"
                                    color="primary" className="ms-2  btn-icon waves-effect waves-light btn btn-primary">
                                            <i className="mdi mdi-cog-refresh-outline fs-20"></i>
                                    
                                </Button>
                            </div>
                       
                            {/* <div>
                                <button
                                    onClick={toggleUpdateLayout}
                                    className="btn btn-primary d-flex align-items-center justify-content-center ms-auto"
                                    type="button">
                                    {updateLayout
                                        ? "Save Layout"
                                        : "Edit Layout"}
                                </button>
                            </div> */}
                            <div className="col-12 ">
                            {
                                tableConfigLoading && (
                                    <div>
                                        <LoaderSpin/>
                                    </div>
                                )
                            }
                            {
                                layoutReady && processedLayout?.length === 0 && (
                                    <div className="text-center dashboard-blank">
                                        <DashboardSvg/>
                                        <h5 className="mt-4">
                                            Nothing to show please update the layout
                                        </h5>
                                    </div>
                                )
                            }
                            {
                                layoutReady && layout?.length > 0 && (
                                <GridLayout
                                    onLayoutChange={handleLayoutChange}
                                    className="layout"
                                    layout={processedLayout}
                                    cols={12}
                                    width={gridWidth}
                                    margin={[20, 20]}
                                    useCSSTransforms={true}
                                    draggableHandle={
                                        updateLayout ? ".draggableHandle" : ""
                                    }
                                    isResizable={updateLayout}
                                    isDraggable={updateLayout}>
                                    {cardsData?.announcements && (
                                        <div key="announcements" className={updateLayout ? "card cursor-grab " : "card"}>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    className="grid-close-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        setFalse(
                                                            "announcements"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header d-flex align-items-center">
                                                <h5 className="flex-grow-1 mb-0 draggableHandle">
                                                    Announcements
                                                </h5>
                                            </div>
                                            {announcementloading ? (
                                                <>
                                                    <div className="card-body p-3">
                                                        <LoaderSpin height="100px" />
                                                    </div>
                                                </>
                                            ) : !announcementloading &&
                                                data.length === 0 ? (
                                                <>
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Announcement found.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="card-body p-3 draggableHandle">
                                                    <AnnouncementCarousel
                                                        items={data}
                                                        announcementsViewPermission={
                                                            announcementsViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.serviceRequestRevenue && (
                                        <div
                                            key="serviceRequestRevenue"
                                            className={updateLayout ? "card border-0 p-0 cursor-grab " : "card border-0 p-0"}>
                                            {updateLayout && (
                                                <button
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse("serviceRequestRevenue")
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex flex-wrap draggableHandle">
                                                <h5 className="mb-0 flex-grow-1 title-sr">
                                                    Service Request vs. Revenue
                                                </h5>
                                                <div className="col-sm-auto mx-3 ">
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "All"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "All"
                                                            )
                                                        }>
                                                        {" "}
                                                        ALL{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "1w"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "1w"
                                                            )
                                                        }>
                                                        {" "}
                                                        1W{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "1m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "1m"
                                                            )
                                                        }>
                                                        {" "}
                                                        1M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "3m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "3m"
                                                            )
                                                        }>
                                                        {" "}
                                                        3M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "6m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "6m"
                                                            )
                                                        }>
                                                        {" "}
                                                        6M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            serviceRevenueDuration ===
                                                                "1y"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleServiceRevenueDuration(
                                                                "1y"
                                                            )
                                                        }>
                                                        {" "}
                                                        1Y{" "}
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
                                                                onClick={
                                                                    handleDateRangeSeviceRevenueOpen
                                                                }
                                                                >
                                                                <div
                                                                    className="fw-semibold text-uppercase fs-12"
                                                                    >
                                                                    <FiFilter
                                                                        style={{
                                                                            color: "white",
                                                                            fontSize:
                                                                                "15px",
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div
                                                                className={
                                                                    isServiceRevenueDaterange
                                                                        ? `dropdown-menu dropdown-menu-end shadow-none show`
                                                                        : `dropdown-menu dropdown-menu-end shadow-none `
                                                                }
                                                                style={{
                                                                    width: "270px",
                                                                    position:
                                                                        "absolute",
                                                                    inset: "0px 0px auto auto",
                                                                    margin: "0px",
                                                                    transform:
                                                                        "translate3d(0px, 30px, 0px)",
                                                                }}
                                                                data-popper-placement="bottom-end">
                                                                <div className="input-group">
                                                                    <DateRangePopup
                                                                        dateStart={
                                                                            dateStart
                                                                        }
                                                                        dateEnd={
                                                                            dateEnd
                                                                        }
                                                                        onChangeHandler={
                                                                            onChangeServiceRevenueHandler
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
                                            {serviceRevenueLoading ? (
                                                <div className="card-body draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : !serviceRevenueLoading &&
                                                serviceRevenueData?.length === 0 ? (
                                                <div className="text-center">
                                                    <p className="text-muted">
                                                        No Service Revenue found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="card-body draggableHandle">
                                                    <LinewithDataLabels
                                                        serviceRevenueData={
                                                            serviceRevenueData
                                                        }
                                                        revenueViewPermission={
                                                            revenueViewPermission
                                                        }
                                                        servicesViewPermission={
                                                            servicesViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.teamRequestTickets && (
                                        <div
                                            key="teamRequestTickets"
                                            className={updateLayout ? "card border-0 cursor-grab " : "card border-0"}
                                            style={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                            }}>
                                            {updateLayout && (
                                                <button
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "teamRequestTickets"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                                <div className="d-flex align-items-center flex-grow-1">
                                                    <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold ">
                                                        Team Request vs. Tickets
                                                    </h4>
                                                </div>
                                                {/* <div className="col-sm-auto mx-3">
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "All"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "All"
                                                            )
                                                        }>
                                                        {" "}
                                                        ALL{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "1w"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "1w"
                                                            )
                                                        }>
                                                        {" "}
                                                        1W{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "1m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "1m"
                                                            )
                                                        }>
                                                        {" "}
                                                        1M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "3m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "3m"
                                                            )
                                                        }>
                                                        {" "}
                                                        3M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "6m"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "6m"
                                                            )
                                                        }>
                                                        {" "}
                                                        6M{" "}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            teamVsTicketduration ===
                                                                "1y"
                                                                ? "btn btn-primary btn-sm me-1"
                                                                : "btn btn-soft-secondary btn-sm me-1"
                                                        }
                                                        onClick={() =>
                                                            handleRequestvsTicketsfilter(
                                                                "1y"
                                                            )
                                                        }>
                                                        {" "}
                                                        1Y{" "}
                                                    </button>
                                                </div> */}
                                                <div className="flex-shrink-0">
                                                    <DropdownButton
                                                        id="dropdown-basic-button"
                                                        title={<FiFilter />}
                                                        variant="primary"
                                                        align="end">
                                                        {[
                                                            {
                                                                label: "All",
                                                                value: "All",
                                                            },
                                                            {
                                                                label: "1W",
                                                                value: "1w",
                                                            },
                                                            {
                                                                label: "1M",
                                                                value: "1m",
                                                            },
                                                            {
                                                                label: "3M",
                                                                value: "3m",
                                                            },
                                                            {
                                                                label: "6M",
                                                                value: "6m",
                                                            },
                                                            {
                                                                label: "1Y",
                                                                value: "1y",
                                                            },
                                                            {
                                                                label: "Custom",
                                                                value: "Custom",
                                                            },
                                                        ].map((option) => (
                                                            <Dropdown.Item
                                                                key={option.value}
                                                                onClick={() =>
                                                                    handleRequestvsTicketsfilter(
                                                                        option.value
                                                                    )
                                                                }
                                                                active={
                                                                    teamVsTicketduration ===
                                                                    option.value
                                                                }>
                                                                {option.label}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </div>


                                            </div>

                                            {isDaterangeTeamvsTicket && (
                                                <div className="input-group">
                                                    <DateRangePopup
                                                        dateStart={
                                                            dateStartTeamvsTicket
                                                        }
                                                        dateEnd={
                                                            dateEndTeamvsTicket
                                                        }
                                                        onChangeHandler={
                                                            onChangeHandlerTeamvsTicket
                                                        }
                                                    />
                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                        <i className="ri-calendar-2-line"></i>
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className="card-body p-0 border-0 draggableHandle"
                                                style={{
                                                    flexGrow: 1,
                                                    height: "100%",
                                                }}>
                                                {teamRequestLoading ? (
                                                    <LoaderSpin height={"300px"} />
                                                ) : !teamRequestLoading &&
                                                    ticketvsteamData?.length === 0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Ticket Team found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div style={{ height: "100%" }}>
                                                        {/* Full height for chart */}
                                                        <TeamvsTicketChart
                                                            data={ticketvsteamData}
                                                            ticketsViewPermission={
                                                                ticketsViewPermission
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {cardsData?.servicesRequest && (
                                        <div
                                            key="servicesRequest"
                                            className={updateLayout ? "card border-0 cursor-grab " : "card border-0"}
                                            style={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                            }}>
                                            {updateLayout && (
                                                <button
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "servicesRequest"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                                <div className="d-flex align-items-center flex-grow-1">
                                                    <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold ">
                                                        Services Request
                                                    </h4>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <DropdownButton
                                                        id="dropdown-basic-button"
                                                        title={<FiFilter />}
                                                        variant="primary"
                                                        align="end">
                                                        {[
                                                            {
                                                                label: "All",
                                                                value: "All",
                                                            },
                                                            {
                                                                label: "1W",
                                                                value: "1w",
                                                            },
                                                            {
                                                                label: "1M",
                                                                value: "1m",
                                                            },
                                                            {
                                                                label: "3M",
                                                                value: "3m",
                                                            },
                                                            {
                                                                label: "6M",
                                                                value: "6m",
                                                            },
                                                            {
                                                                label: "1Y",
                                                                value: "1y",
                                                            },
                                                            {
                                                                label: "Custom",
                                                                value: "Custom",
                                                            },
                                                        ].map((option) => (
                                                            <Dropdown.Item
                                                                key={option.value}
                                                                onClick={() =>
                                                                    handleServiceRequestDuration(
                                                                        option.value
                                                                    )
                                                                }
                                                                active={
                                                                    selectedServicesRequest ===
                                                                    option.value
                                                                }>
                                                                {option.label}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </div>

                                            </div>

                                            {showServiceRequestsDateRange && (
                                                <div className="input-group">
                                                    <DateRangePopup
                                                        dateStart={
                                                            dateStartServiceRequests
                                                        }
                                                        dateEnd={
                                                            dateEndServiceRequests
                                                        }
                                                        onChangeHandler={
                                                            onChangeServiceRequestsHandler
                                                        }
                                                    />
                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                        <i className="ri-calendar-2-line"></i>
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className="card-body p-0 border-0 draggableHandle"
                                                style={{
                                                    flexGrow: 1,
                                                    height: "100%",
                                                }}>
                                                {serviceRequestLoading ? (
                                                    <LoaderSpin height={"300px"} />
                                                ) : !serviceRequestLoading &&
                                                    serviceRequest?.length === 0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Service Request
                                                            found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div style={{ height: "100%" }}>
                                                        {" "}
                                                        {/* Full height for chart */}
                                                        <ApexChart
                                                            data={serviceRequest}
                                                            servicesViewPermission={
                                                                servicesViewPermission
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {cardsData?.tickets && (
                                        <div
                                            key="tickets"
                                            className={updateLayout ? "card border-0 cursor-grab " : "card border-0"}
                                        >
                                            {updateLayout && (
                                                <button
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "tickets",
                                                            cardsData
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex flex-wrap justify-content-between draggableHandle">
                                                <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold ">
                                                    {" "}
                                                    Tickets{" "}
                                                </h4>
                                            </div>

                                            {ticketloading ? (
                                                <div className="card-body border-0 py-2 draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : !ticketloading &&
                                                !ticketsViewPermission?.length ===
                                                0 ? (
                                                <div className="text-center">
                                                    <p className="text-muted">
                                                        No Ticket found .
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        New{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.new ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#405189",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.new ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.new ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        In-Progress{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.inProgress ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f06548",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.inProgress ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.inProgress ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        Escalated{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.escalated ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#F7B84B",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.escalated ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.escalated ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pt-2 pb-3">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                        Closed{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.closed ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#0ab39c",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.closed ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.closed ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                dashboardType !==
                                                                    "Department Agent"
                                                                    ? "card-body border-0 py-2"
                                                                    : "card-body border-0 pb-0"
                                                            }>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        {" "}
                                                                       Reopened{" "}
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {" "}
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.reopened ||
                                                                            null
                                                                            : null}{" "}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-xl bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                    height:
                                                                        dashboardType !==
                                                                            "Department Agent"
                                                                            ? "10px"
                                                                            : "8px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f06548",
                                                                        width: `${ticketsViewPermission
                                                                                ? ticketCountPercentage?.reopened ||
                                                                                null
                                                                                : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                        height:
                                                                            dashboardType !==
                                                                                "Department Agent"
                                                                                ? "10px"
                                                                                : "8px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow={
                                                                        ticketsViewPermission
                                                                            ? ticketCountPercentage?.reopened ||
                                                                            null
                                                                            : null
                                                                    }
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {cardsData?.applications && (
                                        <div
                                            key="applications"
                                            className={`${applicationsViewPermission
                                                    ? "card border-0"
                                                    : "d-none"
                                                } ${updateLayout ? "cursor-grab " : ""
                                                }`}>
                                            {updateLayout && (
                                                <button
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse("applications")
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header border-bottom align-items-center d-flex flex-wrap justify-content-between draggableHandle">
                                                <h5 className="mb-0 ">
                                                    Recent Applications
                                                </h5>
                                            </div>
                                            <ActiveApplications className="draggableHandle"
                                                isDashBoard={true}
                                            />
                                        </div>
                                    )}
                                    {cardsData?.ticketsListing && (
                                        <div
                                            key="ticketsListing"
                                            className={`${ticketsViewPermission
                                                    ? "card border-0"
                                                    : "d-none"
                                                } ${updateLayout ? "cursor-grab " : ""
                                                }`}>
                                            {updateLayout && (
                                                <div className="mx-4 flex-shrink-0">
                                                    <button
                                                        className="grid-close-btn"
                                                        type="button"
                                                        onClick={() =>
                                                            setFalse(
                                                                "ticketsListing",
                                                                cardsData
                                                            )
                                                        }>
                                                        <ImCross size="10px" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="card-header border-bottom align-items-center d-flex flex-wrap justify-content-between draggableHandle">
                                                <h5 className="mb-0">
                                                    Recent Tickets
                                                </h5>

                                            </div>
                                            <SupportTickets isDashBoard={true} className="draggableHandle" />
                                        </div>
                                    )}
                                </GridLayout>
                                )
                            }
                            </div>

                            {/* </div> */}
                        </div>
                    )}

                   
                        <div className="custom-sidebar-menu bg-primary">
                        <div>
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                {/* <Button onClick={() => hanldeResetLayout()} size="sm" color="secondary">
                                    Reset
                                </Button> */}
                                {
                                    tableColumnConfig?.tableConfig?.layouts?.length > 0 && selectedLayout !== "default" && (
                                        <button
                                            title="Delete Layout"
                                            type="button"
                                            className="sidebar-dash-close-btn btn btn-sm btn-danger"
                                            onClick={deleteLayout}
                                        >
                                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" className=" cursor-pointer" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
                                        </button>
                                    )
                                }
                                <Button
                                    onClick={()=> {
                                        isNewLayout ? addNewLayout() : updateTableConfig()
                                    }}
                                    size="sm" color="success"
                                >
                                    {isNewLayout ? "Add Layout" : "Update Layout"}
                                </Button>
                                <button
                                    title="Close"
                                    type="button"
                                    className="sidebar-dash-close-btn btn btn-sm btn-danger"
                                    onClick={() => {
                                        setUpdateLayout(false)
                                        setIsNewLayout(false)
                                    }}>
                                    <ImCross size="10px" />
                                </button>
                            </div>
                            <div className="mt-3 px-3">
                                <Input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Layout Name"
                                    value={currentLayoutName}
                                    onChange={(e) => setCurrentLayoutName(e.target.value)}
                                />
                            </div>
                            </div>
                        <div className="" >
                                <SimpleBar style={{ maxHeight: 'calc(90vh - 80px)', overflowX: 'auto' }}>
                                    {menuItems.map((item, index) => (
                                        <div key={index} className={item?.cardAdded ? "menu-item active" : "menu-item"} title={item.title} onClick={item.onClick}>
                                            <div className="menu-toggle-icon">
                                                <i className={`${item.icon} fs-20 text-white`} style={item.style || {}}></i>
                                            </div>
                                            <div className="menu-item-name cursor-pointer">{item.title}
                                                 <div className="menu-item-check-box">
                                            <i className="ri-checkbox-blank-circle-line"></i>
                                            <i className="ri-radio-button-line"></i>
                                        </div>
                                            </div>
                                        </div>
                                    ))}
                                </SimpleBar>
                            </div>
                            {/* <div
                            onClick={ToggleSidebar}
                            className="menu-toggle sidebar ">
                            <i className="ri-menu-2-line fs-20 text-white"></i>
                            <i className="ri-close-line fs-20 text-white"></i>
                        </div> */}
                        </div>
                   
                </div>
            </div>
        </div>
    );
};

export default DeptHeadDashboard;
