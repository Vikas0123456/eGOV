import React, { useEffect, useState, useMemo, useCallback } from "react";
import DeptvsRevenueChart from "./DeptvsRevenueChart";
import ServicevsRevenueChart from "./ServicevsRevenueChart";
import UsersSvg from "../../../assets/svg/UsersSvg";
import RevenueSvg from "../../../assets/svg/RevenueSvg";
import ActiveTicketsSvg from "../../../assets/svg/ActiveTicketsSvg";
import ActiveRequestSvg from "../../../assets/svg/ActiveRequestSvg";
import ResetLayoutSvg from "../../../assets/svg/ResetLayoutSvg";
import ActiveUsersSvg from "../../../assets/svg/ActiveUsersSvg";
import ServicesSvg from "../../../assets/svg/ServicesSvg";
import DepartmentsSvg from "../../../assets/svg/DepartmentsSvg";
import DashboardSvg from "../../../assets/svg/DashboardSvg";
import RequestAnalysChart from "./RequestAnalysChart";
import SlotCounter from "react-slot-counter";
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
import { useDispatch, useSelector } from "react-redux";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css"; // Ensure you import necessary CSS files
import "react-resizable/css/styles.css"; // For resizable
import { ImCross } from "react-icons/im";
import { setTableColumnConfig } from "../../../slices/layouts/reducer";
import { Button, Card, Input } from "reactstrap";
import Select  from "react-select";
import Swal from "sweetalert2";

const defaultCardsData = {
    departmentVsRevenue: true,
    serviceVsRevenue: true,
    topEarningDepartment: true,
    topEarningService: true,
    revenue: true,
    departments: true,
    services: true,
    users: true,
    activeRequests: true,
    activeUsers: true,
    activeTickets: true,
    // regionWiseRevenue: true,
    requestAnalysis: true,
    citizens: true,
    departmentEfficiency: true,
    topRatedServices: true,
};

const defaultLayout = [
    {
        w: 5,
        h: 2.3,
        minH: 2.3,
        minW: 5,
        x: 0,
        y: 0,
        i: "departmentVsRevenue",
        moved: false,
        static: false,
    },
    {
        w: 5,
        h: 2.3,
        minH: 2.3,
        minW: 5,
        x: 5,
        y: 0,
        i: "serviceVsRevenue",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .8,
        minH: .8,
        minW: 2,
        x: 11,
        y: 0,
        i: "topEarningDepartment",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .8,
        minH: .8,
        minW: 2,
        x: 11,
        y: 1,
        i: "topEarningService",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: 0.68,
        minH: 0.68,
        minW: 2,
        x: 11,
        y: 2,
        i: "revenue",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 0,
        y: 9,
        i: "departments",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 2,
        y: 9,
        i: "services",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 4,
        y: 9,
        i: "users",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 6,
        y: 9,
        i: "activeRequests",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 8,
        y: 9,
        i: "activeUsers",
        moved: false,
        static: false,
    },
    {
        w: 2,
        h: .7,
        minH: .7,
        minW: 2,
        x: 10,
        y: 9,
        i: "activeTickets",
        moved: false,
        static: false,
    },

    // {
    //     w: 4,
    //     h: 3,
    //     minH: 3,
    //     minW: 4,
    //     x: 0,
    //     y: 10,
    //     i: "regionWiseRevenue",
    //     moved: false,
    //     static: false,
    // },
    {
        w: 4,
        h: 2.5,
        minH: 2.5,
        minW: 4,
        x: 0,
        y: 10,
        i: "requestAnalysis",
        moved: false,
        static: false,
    },
    {
        w: 4,
        h: 2.5,
        minH: 2.5,
        minW: 4,
        x: 4,
        y: 10,
        i: "citizens",
        moved: false,
        static: false,
    },
    {
        w: 12,
        h: 2.2,
        minH: 2.2,
        minW: 6,
        x: 0,
        y: 11,
        i: "departmentEfficiency",
        moved: false,
        static: false,
    },
    {
        w: 4,
        h: 2.5,
        minH: 2.5,
        minW: 4,
        x: 9,
        y: 10,
        i: "topRatedServices",
        moved: false,
        static: false,
    },
];

const MinistryCoreUserDashborad = () => {
    const axiosInstance = useAxios();
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const roleName = userData?.role?.roleName;
    
    const dispatch = useDispatch();
    const tableName = "coreUserDashboard";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    
    const tableConfigLoading = useSelector(
        (state) => state?.Layout?.configDataLoading
    );

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };

    const slugsToCheck = [
        "citizens",
        "departments",
        "revenue",
        "services",
        "reviewfeedback",
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
    const [topRatedServicesLoading, setTopRatedServicesLoading] =
        useState(true);
    const [departmentReportLoading, setDepartmentReportLoading] =
        useState(true);
    const [departmentVSRevenueLoading, setDepartmentVSRevenueLoading] =
        useState(true);
    const [serviceVSRevenueLoading, setServiceVSRevenueLoading] =
        useState(true);
    const [topEarningServiceLoading, setTopEarningServiceLoading] =
        useState(true);
    const [topEarningDepartmentLoading, setTopEarningDepartmentLoading] =
        useState(true);
    const [totalRevenueListLoading, setTotalRevenueListLoading] =
        useState(true);
    const [serviceDepartmentCountLoading, setServiceDepartmentCountLoading] =
        useState(true);
    const [customerAndGenderDataLoading, setCustomerAndGenderDataLoading] =
        useState(true);
    const [activeApplicationListLoading, setActiveApplicationListLoading] =
        useState(true);
    const [activeTicketsLoading, setActiveTicketsLoading] = useState(true);
    const [serviceRequestsLoading, setServiceRequestsLoading] = useState(true);

    const [selectStartDate, setSelectStartDate] = useState(null);
    const [
        selectServiceVSRevenueStartDate,
        setSelectServiceVSRevenueStartDate,
    ] = useState(null);
    const [selectEndDate, setSelectEndDate] = useState(null);
    const [selectServiceVSRevenueEndDate, setSelectServiceVSRevenueEndDate] =
        useState(null);
    const [dateStart, setDateStart] = useState(null);
    const [serviceVSRevenueDateStart, setServiceVSRevenueDateStart] =
        useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [serviceVSRevenueDateEnd, setServiceVSRevenueDateEnd] =
        useState(null);
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
    const [selectedRequestAnalysis, setSelectedRequestAnalysis] =
        useState("All");

    const [showCustomDateRange, setShowCustomDateRange] = useState(false);
    const [selectTopEarningDeptStartDate, setSelectTopEarningDeptStartDate] =
        useState(null);
    const [selectTopEarningDeptEndDate, setSelectTopEarningDeptEndDate] =
        useState(null);
    const [dateStartTopEarningDept, setDateStartTopEarningDept] =
        useState(null);
    const [dateEndTopEarningDept, setDateEndTopEarningDept] = useState(null);

    const [showCustomServiceDateRange, setShowCustomServiceDateRange] =
        useState(false);
    const [
        selectTopEarningServiceStartDate,
        setSelectTopEarningServiceStartDate,
    ] = useState(null);
    const [selectTopEarningServiceEndDate, setSelectTopEarningServiceEndDate] =
        useState(null);
    const [dateStartTopEarningService, setDateStartTopEarningService] =
        useState(null);
    const [dateEndTopEarningService, setDateEndTopEarningService] =
        useState(null);

    const [showCustomRevenueDateRange, setShowCustomRevenueDateRange] =
        useState(false);
    const [selectRevenueStartDate, setSelectRevenueStartDate] = useState(null);
    const [selectRevenueEndDate, setSelectRevenueEndDate] = useState(null);
    const [dateStartRevenue, setDateStartRevenue] = useState(null);
    const [dateEndRevenue, setDateEndRevenue] = useState(null);

    const [showServiceRequestsDateRange, setShowServiceRequestsDateRange] =
        useState(false);
    const [selectServiceRequestsStartDate, setSelectServiceRequestsStartDate] =
        useState(null);
    const [selectServiceRequestsEndDate, setSelectServiceRequestsEndDate] =
        useState(null);
    const [dateStartServiceRequests, setDateStartServiceRequests] =
        useState(null);
    const [dateEndServiceRequests, setDateEndServiceRequests] = useState(null);
    const [isOpen, setIsopen] = useState(false);

    const [commonDateStart, setCommonDateStart] = useState(null)
    const [commonDateEnd, setCommonDateEnd] = useState(null)
    const [selectCommonDateStart, setSelectCommonDateStart] = useState(null)
    const [selectCommonDateEnd, setSelectCommonDateEnd] = useState(null)

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeCard, setActiveCard] = useState(null);

    const handleDropdownOpen = (cardKey) => {
        setActiveCard(cardKey);
    };

    const handleDropdownClose = () => {
        setActiveCard(null);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
        () => window.innerWidth - (updateLayout ? (280) : 80),
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

                if(updatedLayouts?.length === 0){
                    setCurrentLayoutName("Default Layout")
                }

                const updatedTableConfig = {
                    ...tableColumnConfig?.tableConfig,
                    layouts: updatedLayouts,
                    selectedLayout: updatedLayouts[updatedLayouts?.length - 1]?.layoutId,
                };

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
        }
        setCommonDateStart(value[0]);
        setCommonDateEnd(value[1]);

        setServiceManagementDateRangeOption("")
        DepartmentVSRevenueForDepartmentVSRevenue("")
        setActiveCard(null)
        setTopEarningDepartmentDuration("");
        setSelectedTopEarningDepartmentOption("");
        setTopEarningServiceDuration("");
        setSelectedTopEarningService("");
        setRevenueFilter("");
        setSelectedRevenueOption("");
        setSericeRequestDuration("");
        setSelectedRequestAnalysis("");
    }

    const resetCommonFilter = ()=>{
        setCommonDateStart(null)
        setCommonDateEnd(null)
        setSelectCommonDateStart(null)
        setSelectCommonDateEnd(null)
    }

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
        // Validate input
        if (!rating || rating < 0 || !maxRating || maxRating <= 0) {
            return (
                <div className="fs-16 align-middle text-warning">
                    {[...Array(5)].map((_, index) => (
                        <i key={index} className="ri-star-line"></i>
                    ))}
                </div>
            );
        }
    
        // Calculate stars
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
                        startDate: selectStartDate ? selectStartDate:  selectCommonDateStart,
                        endDate: selectEndDate? selectEndDate : selectCommonDateEnd ,
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
    }, [dateRangeOptionForDepartmentVSRevenue, selectStartDate, selectEndDate, selectCommonDateStart, selectCommonDateEnd]);

    const getDepartmentRevenueList = async () => {
        try {
            setTopEarningDepartmentLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/maximumRevenue`,
                {
                    dateRangeOption: topEarningDepartmentDuration,
                    dateRange: {
                        startDate: selectTopEarningDeptStartDate ?selectTopEarningDeptStartDate : selectCommonDateStart,
                        endDate: selectTopEarningDeptEndDate? selectTopEarningDeptEndDate : selectCommonDateEnd ,
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
    }, [
        topEarningDepartmentDuration,
        selectTopEarningDeptStartDate,
        selectTopEarningDeptEndDate,
        selectCommonDateStart,
        selectCommonDateEnd
    ]);

    const getServiceRevenueList = async () => {
        try {
            setTopEarningServiceLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/maximumRevenue`,
                {
                    dateRangeOption: topEarningServiceDuration,
                    dateRange: {
                        startDate: selectTopEarningServiceStartDate ?selectTopEarningServiceStartDate : selectCommonDateStart,
                        endDate: selectTopEarningServiceEndDate? selectTopEarningServiceEndDate : selectCommonDateEnd ,
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
    }, [
        topEarningServiceDuration,
        selectTopEarningServiceStartDate,
        selectTopEarningServiceEndDate,
        selectCommonDateStart,
        selectCommonDateEnd
    ]);

    const getTotalRevenueList = async () => {
        try {
            setTotalRevenueListLoading(true);
            const response = await axiosInstance.post(
                `paymentService/customerDetails/totalRevenue`,
                {
                    dateRangeOption: revenueFilter,
                    dateRange: {
                        startDate: selectRevenueStartDate ?selectRevenueStartDate : selectCommonDateStart,
                        endDate: selectRevenueEndDate? selectRevenueEndDate : selectCommonDateEnd ,
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
    }, [revenueFilter, selectRevenueStartDate, selectRevenueEndDate, selectCommonDateEnd, selectCommonDateStart]);

    const fetchServiceRequest = async () => {
        try {
            setServiceRequestsLoading(true);
            const response = await axiosInstance.post(
                "businessLicense/application/serviceRequests",
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
                setServiceRequestsLoading(false);
            }
        } catch (error) {
            setServiceRequestsLoading(false);
            console.error(error.message);
        }
    };
    useEffect(() => {
        fetchServiceRequest();
    }, [
        serviceRequestDuration,
        selectServiceRequestsStartDate,
        selectServiceRequestsEndDate,
        selectCommonDateEnd,
        selectCommonDateStart
    ]);

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
            setTopEarningServiceDuration(value);
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
                        startDate: selectServiceVSRevenueStartDate ? selectServiceVSRevenueStartDate : selectCommonDateStart,
                        endDate: selectServiceVSRevenueEndDate? selectServiceVSRevenueEndDate : selectCommonDateEnd,
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
        selectCommonDateStart,
        selectCommonDateEnd
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

    const ToggleSidebar = () => {
        isOpen === true ? setIsopen(false) : setIsopen(true);
    };

    const menuItems = [
        {
            title: "Department vs. Revenue",
            icon: "ri-bar-chart-2-line",
            cardValue: "departmentVsRevenue",
            onClick: () => setTrueIfFalse("departmentVsRevenue"),
        },
        {
            title: "Service Vs. Revenue",
            icon: "ri-bar-chart-2-line",
            style: { transform: "rotate(90deg)" },
            cardValue: "serviceVsRevenue",
            onClick: () => setTrueIfFalse("serviceVsRevenue"),
        },
        {
            title: "Top Earning Department",
            icon: "las la-donate",
            cardValue: "topEarningDepartment",
            onClick: () => setTrueIfFalse("topEarningDepartment"),
        },
        {
            title: "Top Earning Service",
            icon: "las la-file-invoice-dollar",
            cardValue: "topEarningService",
            onClick: () => setTrueIfFalse("topEarningService"),
        },
        {
            title: "Revenue",
            icon: "ri-money-dollar-circle-line",
            cardValue: "revenue",
            onClick: () => setTrueIfFalse("revenue"),
        },
        {
            title: "Departments",
            icon: "mdi mdi-sitemap-outline",
            cardValue: "departments",
            onClick: () => setTrueIfFalse("departments"),
        },
        {
            title: "Services",
            icon: "ri-customer-service-line",
            cardValue: "services",
            onClick: () => setTrueIfFalse("services"),
        },
        {
            title: "Users",
            icon: "ri-group-line",
            cardValue: "users",
            onClick: () => setTrueIfFalse("users"),
        },
        {
            title: "Active Requests",
            icon: "ri-list-check-2",
            cardValue: "activeRequests",
            onClick: () => setTrueIfFalse("activeRequests"),
        },
        {
            title: "Active Users",
            icon: "ri-user-follow-line",
            cardValue: "activeUsers",
            onClick: () => setTrueIfFalse("activeUsers"),
        },
        {
            title: "Active Tickets",
            icon: "ri-coupon-line",
            cardValue: "activeTickets",
            onClick: () => setTrueIfFalse("activeTickets"),
        },
        // {
        //     title: "Region Wise Revenue",
        //     icon: "mdi mdi-map-marker-star-outline",
        //     onClick: () => setTrueIfFalse("regionWiseRevenue"),
        // },
        {
            title: "Request Analysis",
            icon: "ri-file-search-line",
            cardValue: "requestAnalysis",
            onClick: () => setTrueIfFalse("requestAnalysis"),
        },
        {
            title: "Citizens",
            icon: "ri-team-line",
            cardValue: "citizens",
            onClick: () => setTrueIfFalse("citizens"),
        },
        {
            title: "Department Efficiency",
            icon: "ri-dashboard-2-line",
            cardValue: "departmentEfficiency",
            onClick: () => setTrueIfFalse("departmentEfficiency"),
        },
        {
            title: "Top Rated Services",
            icon: "ri-star-s-line",
            cardValue: "topRatedServices",
            onClick: () => setTrueIfFalse("topRatedServices"),
        },
    ].map((menu) => ({
        ...menu,
        cardAdded: cardsData[menu.cardValue] || false,
    }));

    return (
        <>
            {/* <Loader isLoading={loading}> */}
            <div className={`page-content custom-sidebar ${updateLayout ? " menu--open" : ""} px-0 `}>
                {
                    !updateLayout && !isMobile && (
                        <Button className="edit-layout bg-primary" onClick={() => setUpdateLayout(true)} varian="secondary" title="Edit Layout">
                            <i className="mdi mdi-cog-outline fs-20 align-middle me-1 rotating-icon"></i>
                        </Button>
                    )
                }
                <button type="button" className="btn btn-warning announcement-btn "
                    data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal"
                    onClick={() => setShowAnnouncementsModal(true)}>
                    {/* <i className="mdi mdi-microphone-outline fs-3 align-middle me-1 "></i> */}
                    <AnnouncementsSvg />

                </button>
                {isMobile ? (
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 mt-sm-0 mt-4">
                                <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <h5 className="mb-0">
                                                    {roleName}
                                                </h5>{" "}
                                                <p className="fs-15 mt-1 text-muted mb-0">
                                                    {" "}
                                                    Hello, {
                                                        userData?.name
                                                    }!{" "}
                                                </p>
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
                                                    {/* <button
                                                        type="button"
                                                        className="btn btn-primary d-flex align-items-center justify-content-center ms-auto"
                                                        data-bs-toggle="modal"
                                                        id="create-btn"
                                                        data-bs-target="#showModal"
                                                        onClick={() =>
                                                            setShowAnnouncementsModal(
                                                                true
                                                            )
                                                        }>
                                                        <AnnouncementsSvg />
                                                        <span>
                                                            Add Announcements
                                                        </span>
                                                    </button> */}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 ">
                                <div className="row mt-3">
                                    <div className="col-12 col-xxl-5 col-xl-6 col-lg-6 d-flex">
                                        <div className="card border-0 p-0 col-12 service-chart">
                                            <div className="card-header align-items-center d-md-flex department-calander">
                                                <h5 className="mb-0 flex-grow-1 mb-3 mb-md-0">
                                                    Department vs. Revenue
                                                </h5>
                                                <div className="flex-shrink-0 row">
                                                    <div className=" col-auto ">
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "All"
                                                                )
                                                            }>
                                                            ALL
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1w"
                                                                )
                                                            }>
                                                            1W
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1m"
                                                                )
                                                            }>
                                                            1M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "3m"
                                                                )
                                                            }>
                                                            3M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "6m"
                                                                )
                                                            }>
                                                            6M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1y"
                                                                )
                                                            }>
                                                            1Y
                                                        </button>
                                                    </div>
                                                    <div className="col-auto ms-auto">
                                                        <div className="dropdown card-header-dropdown">
                                                            <div className="btn btn-primary btn-sm"
                                                                onClick={
                                                                    toggleDateDepartmentVSRevenue
                                                                }
                                                            >
                                                                <span
                                                                    className="fw-semibold text-uppercase fs-12"
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
                                                                    isDepartmentVSRevenueDropdownOpen
                                                                        ? `dropdown-menu dropdown-menu-end show bg-white p-2 position-absolute end-0`
                                                                        : `dropdown-menu dropdown-menu-end shadow-none `
                                                                }
                                                                style={{
                                                                    width: "200px",
                                                                    top: "30px",
                                                                }}
                                                                data-popper-placement="bottom-end">
                                                                <div className="input-group p-0">
                                                                    <DateRangePopup
                                                                        dateStart={
                                                                            dateStart
                                                                        }
                                                                        dateEnd={
                                                                            dateEnd
                                                                        }
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
                                            {departmentVSRevenueLoading ? (
                                                <div className="card-body">
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="card-body">
                                                    <DeptvsRevenueChart
                                                        departmentVSRevenueList={
                                                            departmentVSRevenueList
                                                        }
                                                        departmentsViewPermission={
                                                            departmentsViewPermission
                                                        }
                                                        revenueViewPermission={
                                                            revenueViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
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
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "All"
                                                                )
                                                            }>
                                                            ALL
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1w"
                                                                )
                                                            }>
                                                            1W
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1m"
                                                                )
                                                            }>
                                                            1M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "3m"
                                                                )
                                                            }>
                                                            3M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "6m"
                                                                )
                                                            }>
                                                            6M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1y"
                                                                )
                                                            }>
                                                            1Y
                                                        </button>
                                                    </div>
                                                    <div className="col-auto ms-auto">
                                                        <div className="flex-shrink-0">
                                                            <div className="dropdown card-header-dropdown">
                                                                <div className="btn btn-primary btn-sm me-1">
                                                                    <span
                                                                        className="fw-semibold text-uppercase fs-12"
                                                                        onClick={
                                                                            toggleDateServiceVSRevenue
                                                                        }>
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
                                                                    style={{
                                                                        width: "200px",
                                                                        top: "30px",
                                                                    }}
                                                                    data-popper-placement="bottom-end">
                                                                    <div className="input-group p-0">
                                                                        <DateRangePopup
                                                                            dateStart={
                                                                                serviceVSRevenueDateStart
                                                                            }
                                                                            dateEnd={
                                                                                serviceVSRevenueDateEnd
                                                                            }
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
                                            {serviceVSRevenueLoading ? (
                                                <div className="card-body">
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="card-body">
                                                    <ServicevsRevenueChart
                                                        serviceManagement={
                                                            serviceManagement
                                                        }
                                                        servicesViewPermission={
                                                            servicesViewPermission
                                                        }
                                                        revenueViewPermission={
                                                            revenueViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
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
                                                                    Top Earning
                                                                    Department
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
                                                                    ].map(
                                                                        (
                                                                            option
                                                                        ) => (
                                                                            <Dropdown.Item
                                                                                key={
                                                                                    option?.value
                                                                                }
                                                                                onClick={() =>
                                                                                    handleTopEarningDeptFilter(
                                                                                        option?.value
                                                                                    )
                                                                                }
                                                                                active={
                                                                                    selectedTopEarningDepartmentOption ===
                                                                                    option?.value
                                                                                }>
                                                                                {
                                                                                    option?.label
                                                                                }
                                                                            </Dropdown.Item>
                                                                        )
                                                                    )}
                                                                </DropdownButton>
                                                            </div>
                                                        </div>
                                                        {topEarningDepartmentLoading ? (
                                                            <div className="card-body">
                                                                <LoaderSpin
                                                                    height={
                                                                        "28px"
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-2 pt-1">
                                                                <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0">
                                                                    $
                                                                    <span>
                                                                        <SlotCounter
                                                                            value={
                                                                                departmentsViewPermission
                                                                                    ? topEarningDepartment[0]
                                                                                        ?.totalRevenueDepartment ||
                                                                                    0
                                                                                    : 0
                                                                            }
                                                                        />
                                                                    </span>
                                                                </h4>
                                                                {departmentsViewPermission ? (
                                                                    <p className="mt-2 mb-0 text-muted">
                                                                        {
                                                                            topEarningDepartment[0]
                                                                                ?.departmentName
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {showCustomDateRange && (
                                                        <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                            <DateRangePopup
                                                                dateStart={
                                                                    dateStartTopEarningDept
                                                                }
                                                                dateEnd={
                                                                    dateEndTopEarningDept
                                                                }
                                                                onChangeHandler={
                                                                    onChangeTopEarningDepartmentHandler
                                                                }
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
                                                                    Top Earning
                                                                    Service
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
                                                                    ].map(
                                                                        (
                                                                            option
                                                                        ) => (
                                                                            <Dropdown.Item
                                                                                key={
                                                                                    option?.value
                                                                                }
                                                                                onClick={() =>
                                                                                    handleTopEarningServicesFilter(
                                                                                        option?.value
                                                                                    )
                                                                                }
                                                                                active={
                                                                                    selectedTopEarningService ===
                                                                                    option?.value
                                                                                }>
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </Dropdown.Item>
                                                                        )
                                                                    )}
                                                                </DropdownButton>
                                                            </div>
                                                        </div>
                                                        {topEarningServiceLoading ? (
                                                            <LoaderSpin
                                                                height={"60px"}
                                                            />
                                                        ) : (
                                                            <div className="mt-2 pt-1">
                                                                <h4 className="fs-22 fw-semibold d-flex align-items-center ff-secondary mb-0">
                                                                    $
                                                                    <span>
                                                                        <SlotCounter
                                                                            value={
                                                                                servicesViewPermission
                                                                                    ? topEarningService[0]
                                                                                        ?.serviceWithMaxRevenue
                                                                                        ?.totalRevenueService ||
                                                                                    0
                                                                                    : 0
                                                                            }
                                                                        />
                                                                    </span>
                                                                </h4>
                                                                {servicesViewPermission ? (
                                                                    <p className="mt-2 mb-0 text-muted">
                                                                        {
                                                                            topEarningService[0]
                                                                                ?.serviceWithMaxRevenue
                                                                                ?.serviceName
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {showCustomServiceDateRange && (
                                                        <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                            <DateRangePopup
                                                                dateStart={
                                                                    dateStartTopEarningService
                                                                }
                                                                dateEnd={
                                                                    dateEndTopEarningService
                                                                }
                                                                onChangeHandler={
                                                                    onChangeTopEarningServiceHandler
                                                                }
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
                                                                <h5 className="fs-13 mb-0">
                                                                    Revenue
                                                                </h5>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <DropdownButton
                                                                    className="dots-vertical"
                                                                    id="dropdown-basic-button"
                                                                    title={
                                                                        <i className="las la-ellipsis-v ms-1 fs-18"></i>
                                                                    }
                                                                    variant="white"
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
                                                                    ].map(
                                                                        (
                                                                            option
                                                                        ) => (
                                                                            <Dropdown.Item
                                                                                key={
                                                                                    option?.value
                                                                                }
                                                                                onClick={() =>
                                                                                    handleRevenueFilter(
                                                                                        option?.value
                                                                                    )
                                                                                }
                                                                                active={
                                                                                    selectedRevenueOption ===
                                                                                    option?.value
                                                                                }>
                                                                                {
                                                                                    option?.label
                                                                                }
                                                                            </Dropdown.Item>
                                                                        )
                                                                    )}
                                                                </DropdownButton>
                                                            </div>
                                                        </div>

                                                        {totalRevenueListLoading ? (
                                                            <LoaderSpin
                                                                height={"40px"}
                                                            />
                                                        ) : (
                                                            <div className="mt-2 pt-1">
                                                                <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0 mb-3 pb-1 mb-lg-0 pb-lg-0">
                                                                    $
                                                                    <span>
                                                                        <SlotCounter
                                                                            value={
                                                                                revenueViewPermission
                                                                                    ? totalRevenueList?.totalRevenue ||
                                                                                    0
                                                                                    : 0
                                                                            }
                                                                        />
                                                                    </span>
                                                                </h4>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {showCustomRevenueDateRange && (
                                                        <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                            <DateRangePopup
                                                                dateStart={
                                                                    dateStartRevenue
                                                                }
                                                                dateEnd={
                                                                    dateEndRevenue
                                                                }
                                                                onChangeHandler={
                                                                    onChangeRevenueHandler
                                                                }
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
                                                {serviceDepartmentCountLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <DepartmentsSvg />
                                                            <p className="text-muted mb-0">
                                                                Departments
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    departmentsViewPermission
                                                                        ? serviceDepartmentCount?.departmentCount ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                            {/* {departmentsViewPermission ? serviceDepartmentCount?.departmentCount || "-" : "-"} */}
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4 col-xl-2">
                                            <div className="card rounded">
                                                {serviceDepartmentCountLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <ServicesSvg />
                                                            <p className="text-muted mb-0">
                                                                Services
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    servicesViewPermission
                                                                        ? serviceDepartmentCount?.serviceCount ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4 col-xl-2">
                                            <div className="card rounded">
                                                {customerAndGenderDataLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <UsersSvg />
                                                            <p className="text-muted mb-0">
                                                                Users
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    citizensViewPermission
                                                                        ? customerAndGenderData?.totalCustomers ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4 col-xl-2">
                                            <div className="card rounded">
                                                {activeApplicationListLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <ActiveRequestSvg />
                                                            <p className="text-muted mb-0">
                                                                Active Requests
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    applicationsViewPermission
                                                                        ? activeApplicationList?.count ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4 col-xl-2">
                                            <div className="card rounded">
                                                {customerAndGenderDataLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <ActiveUsersSvg />
                                                            <p className="text-muted mb-0">
                                                                Active Users
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    citizensViewPermission
                                                                        ? customerAndGenderData?.activeCustomerCount ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4 col-xl-2">
                                            <div className="card rounded">
                                                {activeTicketsLoading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"70px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="card-body rounded p-3">
                                                        <div className="d-flex align-items-center">
                                                            <ActiveTicketsSvg />
                                                            <p className="text-muted mb-0">
                                                                Active Tickets
                                                            </p>
                                                        </div>
                                                        <h2 className="mb-0 mt-3">
                                                            <SlotCounter
                                                                value={
                                                                    ticketsViewPermission
                                                                        ? activeTickes?.ticketCount ||
                                                                        "-"
                                                                        : "-"
                                                                }
                                                            />
                                                        </h2>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    {/* <div className="col-12 col-sm-12 col-xxl-4 col-12 mb-4">
                                        <div className="card border-0 p-0 mb-0 h-100">
                                            <div className="card-header align-items-center d-flex ">
                                                <h5 className="mb-0 flex-grow-1">
                                                    Region Wise Revenue
                                                </h5>
                                            </div>
                                            <div className="p-1">
                                                {loading ? (
                                                    <div className="card-body rounded p-3">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <GeolocationRevenue />
                                                )}
                                            </div>
                                        </div>
                                    </div> */}
                                    <div className="col-12 col-md-6 col-lg-6 col-xl-6 col-xxl-4 mb-4">
                                        <div className="card border-0 p-0 h-100 mb-0">
                                            <div className="card-header align-items-center d-flex">
                                                <h5 className="mb-0 flex-grow-1">
                                                    Request Analysis
                                                </h5>
                                                <div className="flex-shrink-0">
                                                    <DropdownButton
                                                        className="dots-vertical"
                                                        id="dropdown-basic-button"
                                                        title={
                                                            <i className="las la-ellipsis-v ms-1 fs-18"></i>
                                                        }
                                                        variant="white"
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
                                                                    selectedRequestAnalysis ===
                                                                    option.value
                                                                }>
                                                                {option.label}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </div>
                                            </div>
                                            {showServiceRequestsDateRange && (
                                                <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                    <DateRangePopup
                                                        className=""
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
                                            {serviceRequestsLoading ? (
                                                <div className="card-body">
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="card-body card-c-chart border-0">
                                                    <RequestAnalysChart
                                                        data={serviceRequest}
                                                        applicationsViewPermission={
                                                            applicationsViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-6 col-xl-6 col-xxl-4 mb-4 ">
                                        <div className="card border-0 p-0 h-100 mb-0">
                                            <div className="card-header align-items-center d-flex">
                                                <h5 className="mb-0 flex-grow-1">
                                                    Citizens
                                                </h5>
                                            </div>
                                            {customerAndGenderDataLoading ? (
                                                <div className="card-body text-center mx-auto card-c-chart border-0">
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="card-body text-center mx-auto card-c-chart border-0">
                                                    <PieChart
                                                        data={
                                                            customerAndGenderData?.gender
                                                        }
                                                        citizensViewPermission={
                                                            citizensViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-sm-12 col-xl-9 ">
                                        <div className="card border-0 p-0">
                                            <div className="card-header align-items-center d-flex">
                                                <h5 className="mb-0 flex-grow-1">
                                                    Department Efficiency
                                                </h5>
                                            </div>
                                            {departmentReportLoading ? (
                                                <div className="card-body">
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                </div>
                                            ) : departmentReportList.length ===
                                                0 ? (
                                                <div className="text-center">
                                                    <p className="text-muted">
                                                        No questions found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-3 col-xl-4">
                                                            <PyramidChart
                                                                departmentReportList={
                                                                    departmentReportList
                                                                }
                                                                colorMap={
                                                                    colorMap
                                                                }
                                                                departmentsViewPermission={
                                                                    departmentsViewPermission
                                                                }
                                                            />
                                                        </div>
                                                        <div className="col-12 col-sm-9 col-xl-8">
                                                            <div className="table-responsive table-card">
                                                               {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }}> */}
                                                                    <table className="table table-borderless table-sm table-centered align-middle table-nowrap mt-2">
                                                                        <thead className="">
                                                                            <tr>
                                                                                <th>
                                                                                    Department
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "150px",
                                                                                    }}>
                                                                                    Request
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "120px",
                                                                                    }}>
                                                                                    TAT
                                                                                    (days)
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "120px",
                                                                                    }}>
                                                                                    Efficiency
                                                                                    (%)
                                                                                </th>
                                                                                <th>
                                                                                    Avg.
                                                                                    Time
                                                                                </th>
                                                                            </tr>
                                                                        </thead>

                                                                        {departmentsViewPermission &&
                                                                            departmentReportList && (
                                                                                <tbody>
                                                                                    {departmentReportList.map(
                                                                                        (
                                                                                            data,
                                                                                            index
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    index
                                                                                                }>
                                                                                                <td>
                                                                                                    <div className="align-items-center d-flex">
                                                                                                        <span
                                                                                                            className="rounded-circle icon-xs me-2"
                                                                                                            style={{
                                                                                                                height: "11px",
                                                                                                                width: "11px",
                                                                                                                backgroundColor:
                                                                                                                    colorMap[
                                                                                                                    data
                                                                                                                        .departmentName
                                                                                                                    ],
                                                                                                            }}></span>
                                                                                                        <span>
                                                                                                            {
                                                                                                                data?.departmentName
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <RequestAssignedSvg />
                                                                                                        <span>
                                                                                                            {
                                                                                                                data?.RequestAssigned
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <span
                                                                                                        className="badge"
                                                                                                        style={{
                                                                                                            backgroundColor:
                                                                                                                colorMap[
                                                                                                                data
                                                                                                                    .departmentName
                                                                                                                ],
                                                                                                        }}>
                                                                                                        {
                                                                                                            data?.TotalTATDays
                                                                                                        }
                                                                                                    </span>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <SettingsIconSvg />
                                                                                                        <span>
                                                                                                            {data?.completedDays >
                                                                                                                0
                                                                                                                ? calculateEfficiency(
                                                                                                                    data?.RequestCompleted,
                                                                                                                    data?.RequestAssigned
                                                                                                                )
                                                                                                                : 0}
                                                                                                            %
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <ClockIconSvg />
                                                                                                        <span>
                                                                                                            {data?.completedDays >
                                                                                                                0
                                                                                                                ? calculateAverageTimePerRequest(
                                                                                                                    data?.RequestCompleted,
                                                                                                                    data?.completedDays
                                                                                                                )
                                                                                                                : 0}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                                </tbody>
                                                                            )}
                                                                    </table>
                                                                {/* </SimpleBar> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
                                                {topRatedServicesLoading ? (
                                                    <LoaderSpin
                                                        height={"300px"}
                                                    />
                                                ) : services.length === 0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No top-rated
                                                            services available.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    services.map(
                                                        (service, index) => (
                                                            <div
                                                                key={index}
                                                                className="row align-items-center g-2 mb-3">
                                                                <div className="col-6">
                                                                    <div className="p-1">
                                                                        <h6 className="mb-0">
                                                                            {service.serviceName ||
                                                                                "Unnamed Service"}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                                <div className="col">
                                                                    <div className="flex-grow-1">
                                                                        {calculateStars(
                                                                            service.totalRatings ||
                                                                            0,
                                                                            maxRating
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div className="p-1">
                                                                        <h6 className="mb-0 text-muted">
                                                                            {service.totalRatings !==
                                                                                null &&
                                                                                service.totalRatings !==
                                                                                undefined
                                                                                ? service.totalRatings
                                                                                : "N/A"}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 mt-sm-0 mt-4">
                                <div className="d-flex align-items-lg-center flex-lg-row flex-column mx-4">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <h5 className="mb-0">{roleName}</h5>{" "}
                                                <p className="fs-15 mt-1 text-muted mb-0">
                                                    {" "}
                                                    Hello, {userData?.name}!{" "}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 mt-lg-0 d-flex align-items-center justify-content-center">

                                        <form>
                                            <div className="row g-3 mb-0 align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <div className="p-0 me-2">
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
                                                        className="bg-choice text-start border border-1 border-primary rounded border-opacity-10 z-2"
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
                                                    {/* <div className="flex-shrink-0">
                                                        <div className="dropdown card-header-dropdown d-flex align-items-center">
                                                            <span className="mb-0 me-2 fs-15 text-muted current-date">
                                                                {formattedDate}
                                                            </span>
                                                        </div>
                                                    </div> */}
                                                    

                                                </div>
                                            </div>
                                        </form>
                                        {/* <div>
                                        <button
                                            onClick={toggleUpdateLayout}
                                            className="btn btn-primary d-flex align-items-center justify-content-center ms-3"
                                            type="button">
                                            {updateLayout
                                                ? "Save Layout"
                                                : "Edit Layout"}
                                        </button>
                                    </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 ">
                            {
                                tableConfigLoading && (
                                    <div>
                                        <LoaderSpin height="100vh" />
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
                                layoutReady && processedLayout?.length > 0 && (
                                <GridLayout
                                    onLayoutChange={handleLayoutChange} className="layout" layout={processedLayout}
                                    width={gridWidth} margin={[20, 20]}
                                    useCSSTransforms={true} draggableHandle={updateLayout ? ".draggableHandle" : ""}
                                    isResizable={updateLayout} isDraggable={updateLayout}>

                                    {cardsData?.departmentVsRevenue && (
                                        <div key="departmentVsRevenue" className={updateLayout ? "card border-0 p-0 service-chart cursor-grab" : "card border-0 p-0 service-chart"}>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "departmentVsRevenue"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-md-flex department-calander draggableHandle">
                                                <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Department vs. Revenue
                                                </h5>

                                                <div className="flex-shrink-0 row">
                                                    <div className=" col-auto ">
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "All"
                                                                )
                                                            }>
                                                            ALL
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1w"
                                                                )
                                                            }>
                                                            1W
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1m"
                                                                )
                                                            }>
                                                            1M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "3m"
                                                                )
                                                            }>
                                                            3M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "6m"
                                                                )
                                                            }>
                                                            6M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                dateRangeOptionForDepartmentVSRevenue ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleDeptVSrevenueFilter(
                                                                    "1y"
                                                                )
                                                            }>
                                                            1Y
                                                        </button>
                                                    </div>
                                                    <div className="col-auto ms-auto">
                                                        <div className="dropdown card-header-dropdown">
                                                            <div className="btn btn-primary btn-sm "
                                                                onClick={
                                                                    toggleDateDepartmentVSRevenue
                                                                }
                                                            >
                                                                <span
                                                                    className="fw-semibold text-uppercase fs-12"
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
                                                                    isDepartmentVSRevenueDropdownOpen
                                                                        ? `dropdown-menu dropdown-menu-end show bg-white p-2 position-absolute end-0`
                                                                        : `dropdown-menu dropdown-menu-end shadow-none `
                                                                }
                                                                style={{
                                                                    width: "200px",
                                                                    top: "30px",
                                                                }}
                                                                data-popper-placement="bottom-end">
                                                                <div className="input-group p-0">
                                                                    <DateRangePopup
                                                                        dateStart={
                                                                            dateStart
                                                                        }
                                                                        dateEnd={
                                                                            dateEnd
                                                                        }
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
                                            {departmentVSRevenueLoading ? (
                                                <div className="card-body draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body draggableHandle">
                                                    <DeptvsRevenueChart
                                                        departmentVSRevenueList={
                                                            departmentVSRevenueList
                                                        }
                                                        departmentsViewPermission={
                                                            departmentsViewPermission
                                                        }
                                                        revenueViewPermission={
                                                            revenueViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.serviceVsRevenue && (
                                        <div key="serviceVsRevenue"
                                            className={updateLayout ? "card border-0 p-0 service-chart cursor-grab " : "card border-0 p-0 service-chart"}>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    className="grid-close-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        setFalse(
                                                            "serviceVsRevenue"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-md-flex department-calander draggableHandle">
                                            <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Service vs. Revenue
                                                </h5>

                                                <div className="flex-shrink-0 row">
                                                    <div className=" col-auto">
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "All"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "All"
                                                                )
                                                            }>
                                                            ALL
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1w"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1w"
                                                                )
                                                            }>
                                                            1W
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1m"
                                                                )
                                                            }>
                                                            1M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "3m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "3m"
                                                                )
                                                            }>
                                                            3M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "6m"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "6m"
                                                                )
                                                            }>
                                                            6M
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={
                                                                serviceManagementDateRangeOption ===
                                                                    "1y"
                                                                    ? "btn btn-primary btn-sm me-1"
                                                                    : "btn btn-soft-secondary btn-sm me-1"
                                                            }
                                                            onClick={() =>
                                                                handleServiceVSrevFilter(
                                                                    "1y"
                                                                )
                                                            }>
                                                            1Y
                                                        </button>
                                                    </div>
                                                    <div className="col-auto ms-auto">
                                                        <div className="flex-shrink-0">
                                                            <div className="dropdown card-header-dropdown">
                                                                <div className="btn btn-primary btn-sm me-1"
                                                                    onClick={
                                                                        toggleDateServiceVSRevenue
                                                                    }
                                                                >
                                                                    <span
                                                                        className="fw-semibold text-uppercase fs-12"
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
                                                                    style={{
                                                                        width: "200px",
                                                                        top: "30px",
                                                                    }}
                                                                    data-popper-placement="bottom-end">
                                                                    <div className="input-group p-0">
                                                                        <DateRangePopup
                                                                            dateStart={
                                                                                serviceVSRevenueDateStart
                                                                            }
                                                                            dateEnd={
                                                                                serviceVSRevenueDateEnd
                                                                            }
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
                                            {serviceVSRevenueLoading ? (
                                                <div className="card-body">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body draggableHandle">
                                                    <ServicevsRevenueChart
                                                        serviceManagement={
                                                            serviceManagement
                                                        }
                                                        servicesViewPermission={
                                                            servicesViewPermission
                                                        }
                                                        revenueViewPermission={
                                                            revenueViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.topEarningDepartment && (
                                        <div key="topEarningDepartment" className={
                                            updateLayout
                                                ? "card border-warning cursor-grab mb-0 "
                                                : "card border-warning mb-0"
                                        }
                                            style={{ overflow: 'visible', position: 'relative', zIndex: activeCard === 'topEarningDepartment' ? 10 : 1 }}
                                        >
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "topEarningDepartment"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-body draggableHandle">
                                                <div className="d-flex align-items-center">
                                                    <i className="bx bx-dollar-circle text-warning fs-24"></i>
                                                    <div className="flex-grow-1 ps-3">
                                                        <h5 className="fs-13 mb-0 ">
                                                            Top Earning Department
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
                                                            onToggle={(isOpen) => {
                                                                if (isOpen) handleDropdownOpen('topEarningDepartment');
                                                                else handleDropdownClose();
                                                            }}
                                                        >
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
                                                                    key={
                                                                        option?.value
                                                                    }
                                                                    onClick={() =>
                                                                        handleTopEarningDeptFilter(
                                                                            option?.value
                                                                        )
                                                                    }
                                                                    active={
                                                                        selectedTopEarningDepartmentOption ===
                                                                        option?.value
                                                                    }>
                                                                    {option?.label}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </DropdownButton>
                                                    </div>
                                                </div>
                                                {topEarningDepartmentLoading ? (
                                                    <div className="card-body">
                                                        <LoaderSpin
                                                            height={"28px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 pt-1">
                                                        <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0">
                                                            $
                                                            <span>
                                                                <SlotCounter
                                                                    value={
                                                                        departmentsViewPermission
                                                                            ? topEarningDepartment[0]
                                                                                ?.totalRevenueDepartment ||
                                                                            0
                                                                            : 0
                                                                    }
                                                                />
                                                            </span>
                                                        </h4>
                                                        {departmentsViewPermission ? (
                                                            <p className="mt-2 mb-0 text-muted">
                                                                {
                                                                    topEarningDepartment[0]
                                                                        ?.departmentName
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            {showCustomDateRange && (
                                                <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                    <DateRangePopup
                                                        dateStart={
                                                            dateStartTopEarningDept
                                                        }
                                                        dateEnd={
                                                            dateEndTopEarningDept
                                                        }
                                                        onChangeHandler={
                                                            onChangeTopEarningDepartmentHandler
                                                        }
                                                    />
                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                        <i className="ri-calendar-2-line"></i>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.topEarningService && (
                                        <div key="topEarningService" className={
                                            updateLayout
                                                ? "card border-success cursor-grab mb-0 "
                                                : "card border-success mb-0"
                                        }
                                            style={{ overflow: 'visible', position: 'relative', zIndex: activeCard === 'topEarningService' ? 10 : 1 }}
                                        >
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "topEarningService"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-body draggableHandle">
                                                <div className="d-flex align-items-center">
                                                    <i className="bx bx-dollar-circle text-success fs-24"></i>
                                                    <div className="flex-grow-1 ps-3">
                                                        <h5 className="fs-13 mb-0 ">
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
                                                            onToggle={(isOpen) => {
                                                                if (isOpen) handleDropdownOpen('topEarningService');
                                                                else handleDropdownClose();
                                                            }}
                                                        >
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
                                                                    key={
                                                                        option?.value
                                                                    }
                                                                    onClick={() =>
                                                                        handleTopEarningServicesFilter(
                                                                            option?.value
                                                                        )
                                                                    }
                                                                    active={
                                                                        selectedTopEarningService ===
                                                                        option?.value
                                                                    }>
                                                                    {option.label}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </DropdownButton>
                                                    </div>
                                                </div>
                                                {topEarningServiceLoading ? (
                                                    <LoaderSpin height={"60px"} />
                                                ) : (
                                                    <div className="mt-2 pt-1">
                                                        <h4 className="fs-22 fw-semibold d-flex align-items-center ff-secondary mb-0">
                                                            $
                                                            <span>
                                                                <SlotCounter
                                                                    value={
                                                                        servicesViewPermission
                                                                            ? topEarningService[0]
                                                                                ?.serviceWithMaxRevenue
                                                                                ?.totalRevenueService ||
                                                                            0
                                                                            : 0
                                                                    }
                                                                />
                                                            </span>
                                                        </h4>
                                                        {servicesViewPermission ? (
                                                            <p className="mt-2 mb-0 text-muted">
                                                                {
                                                                    topEarningService[0]
                                                                        ?.serviceWithMaxRevenue
                                                                        ?.serviceName
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            {showCustomServiceDateRange && (
                                                <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                    <DateRangePopup
                                                        dateStart={
                                                            dateStartTopEarningService
                                                        }
                                                        dateEnd={
                                                            dateEndTopEarningService
                                                        }
                                                        onChangeHandler={
                                                            onChangeTopEarningServiceHandler
                                                        }
                                                    />
                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                        <i className="ri-calendar-2-line"></i>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.revenue && (
                                        <div key="revenue" className={
                                            updateLayout
                                                ? "card border-info cursor-grab mb-0 "
                                                : "card border-info mb-0"
                                        }
                                            style={{ overflow: 'visible', position: 'relative', zIndex: activeCard === 'revenue' ? 10 : 1 }}
                                        >
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse("revenue")
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-body draggableHandle">
                                                <div className="d-flex align-items-center">
                                                    <RevenueSvg />
                                                    <div className="flex-grow-1 ps-3">
                                                        <h5 className="fs-13 mb-0 ">
                                                            Revenue
                                                        </h5>
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
                                                            onToggle={(isOpen) => {
                                                                if (isOpen) handleDropdownOpen('revenue');
                                                                else handleDropdownClose();
                                                            }}
                                                        >
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
                                                                    key={
                                                                        option?.value
                                                                    }
                                                                    onClick={() =>
                                                                        handleRevenueFilter(
                                                                            option?.value
                                                                        )
                                                                    }
                                                                    active={
                                                                        selectedRevenueOption ===
                                                                        option?.value
                                                                    }>
                                                                    {option?.label}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </DropdownButton>
                                                    </div>
                                                </div>

                                                {totalRevenueListLoading ? (
                                                    <LoaderSpin height={"40px"} />
                                                ) : (
                                                    <div className="mt-2 pt-1">
                                                        <h4 className="fs-22 fw-semibold ff-secondary d-flex align-items-center mb-0 mb-3 pb-1 mb-lg-0 pb-lg-0">
                                                            $
                                                            <span>
                                                                <SlotCounter
                                                                    value={
                                                                        revenueViewPermission
                                                                            ? totalRevenueList?.totalRevenue ||
                                                                            0
                                                                            : 0
                                                                    }
                                                                />
                                                            </span>
                                                        </h4>
                                                    </div>
                                                )}
                                            </div>
                                            {showCustomRevenueDateRange && (
                                                <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                    <DateRangePopup
                                                        dateStart={dateStartRevenue}
                                                        dateEnd={dateEndRevenue}
                                                        onChangeHandler={
                                                            onChangeRevenueHandler
                                                        }
                                                    />
                                                    <div className="input-group-text bg-primary border-primary text-white">
                                                        <i className="ri-calendar-2-line"></i>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.departments && (
                                        <div
                                            key="departments"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "departments"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {serviceDepartmentCountLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0 ">
                                                            <DepartmentsSvg />
                                                            Departments
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                departmentsViewPermission
                                                                    ? serviceDepartmentCount?.departmentCount ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                        {/* {departmentsViewPermission ? serviceDepartmentCount?.departmentCount || "-" : "-"} */}
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.services && (
                                        <div
                                            key="services"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "services"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {serviceDepartmentCountLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0 ">
                                                            {" "}
                                                            <ServicesSvg />
                                                            Services
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                servicesViewPermission
                                                                    ? serviceDepartmentCount?.serviceCount ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.users && (
                                        <div key="users"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "users"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {customerAndGenderDataLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0 ">
                                                            <UsersSvg />
                                                            Users
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                citizensViewPermission
                                                                    ? customerAndGenderData?.totalCustomers ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.activeRequests && (
                                        <div key="activeRequests"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "activeRequests"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {activeApplicationListLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0">
                                                            <ActiveRequestSvg />
                                                            Active Requests
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                applicationsViewPermission
                                                                    ? activeApplicationList?.count ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.activeUsers && (
                                        <div key="activeUsers"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "activeUsers"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {customerAndGenderDataLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0 ">
                                                            <ActiveUsersSvg />
                                                            Active Users
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                citizensViewPermission
                                                                    ? customerAndGenderData?.activeCustomerCount ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.activeTickets && (
                                        <div key="activeTickets"
                                            className={
                                                updateLayout
                                                    ? "card rounded cursor-grab "
                                                    : "card rounded"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "activeTickets"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            {activeTicketsLoading ? (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <LoaderSpin height={"70px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body rounded p-3 draggableHandle">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="text-muted mb-0 ">
                                                            <ActiveTicketsSvg />
                                                            Active Tickets
                                                        </p>

                                                    </div>
                                                    <h2 className="mb-0 mt-3">
                                                        <SlotCounter
                                                            value={
                                                                ticketsViewPermission
                                                                    ? activeTickes?.ticketCount ||
                                                                    "-"
                                                                    : "-"
                                                            }
                                                        />
                                                    </h2>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* {cardsData?.regionWiseRevenue && (
                                        <div key="regionWiseRevenue"
                                            className={
                                                updateLayout
                                                    ? "card border-0 p-0 mb-0 cursor-grab "
                                                    : "card border-0 p-0 mb-0"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "regionWiseRevenue"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex ">
                                                <h5 className="mb-0 flex-grow-1">
                                                    Region Wise Revenue
                                                </h5>

                                            </div>
                                            <div className="p-1 draggableHandle">
                                                {loading ? (
                                                    <div className="card-body rounded p-3 ">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <GeolocationRevenue  />
                                                )}
                                            </div>
                                        </div>
                                    )} */}

                                    {cardsData?.requestAnalysis && (
                                        <div key="requestAnalysis"
                                            className={
                                                updateLayout
                                                    ? "card border-0 p-0 mb-0 cursor-grab "
                                                    : "card border-0 p-0 mb-0"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "requestAnalysis"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                                <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Request Analysis
                                                </h5>

                                                <div className="flex-shrink-0">
                                                    <DropdownButton
                                                        className="dots-vertical"
                                                        id="dropdown-basic-button"
                                                        title={
                                                            <i className="las la-ellipsis-v ms-1 fs-18"></i>
                                                        }
                                                        variant="white"
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
                                                                    selectedRequestAnalysis ===
                                                                    option.value
                                                                }>
                                                                {option.label}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </div>
                                            </div>
                                            {showServiceRequestsDateRange && (
                                                <div className="input-group shadow-sm bg-white p-2 rounded date-range-popup">
                                                    <DateRangePopup
                                                        className=""
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
                                            {serviceRequestsLoading ? (
                                                <div className="card-body draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body card-c-chart border-0 draggableHandle">
                                                    <RequestAnalysChart
                                                        data={serviceRequest}
                                                        applicationsViewPermission={
                                                            applicationsViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {cardsData?.citizens && (
                                        <div key="citizens" className={
                                            updateLayout
                                                ? "card border-0 p-0 mb-0 cursor-grab "
                                                : "card border-0 p-0 mb-0"
                                        }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    className="grid-close-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        setFalse("citizens")
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                            <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Citizens
                                            </h5>

                                            </div>
                                            {customerAndGenderDataLoading ? (
                                                <div className="card-body text-center mx-auto card-c-chart border-0 draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : (
                                                <div className="card-body text-center mx-auto card-c-chart border-0 draggableHandle">
                                                    <PieChart
                                                        data={
                                                            customerAndGenderData?.gender
                                                        }
                                                        citizensViewPermission={
                                                            citizensViewPermission
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {cardsData?.departmentEfficiency && (
                                        <div
                                            key="departmentEfficiency"
                                            className={
                                                updateLayout
                                                    ? "card border-0 p-0 mb-0 cursor-grab "
                                                    : "card border-0 p-0 mb-0"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    className="grid-close-btn"
                                                    type="button"
                                                    onClick={() =>
                                                        setFalse(
                                                            "departmentEfficiency"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                            <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Department Efficiency
                                                </h5>

                                            </div>
                                            {departmentReportLoading ? (
                                                <div className="card-body draggableHandle">
                                                    <LoaderSpin height={"300px"} />
                                                </div>
                                            ) : departmentReportList.length ===
                                                0 ? (
                                                <div className="text-center">
                                                    <p className="text-muted">
                                                        No questions found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="card-body draggableHandle">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-3 col-xl-4">
                                                            <PyramidChart
                                                                departmentReportList={
                                                                    departmentReportList
                                                                }
                                                                colorMap={colorMap}
                                                                departmentsViewPermission={
                                                                    departmentsViewPermission
                                                                }
                                                            />
                                                        </div>
                                                        <div className="col-12 col-sm-9 col-xl-8">
                                                            <div className="table-responsive table-card">
                                                                {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }}> */}
                                                                    <table className="table table-borderless table-sm table-centered align-middle table-nowrap mt-2">
                                                                        <thead className="">
                                                                            <tr>
                                                                                <th>
                                                                                    Department
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "150px",
                                                                                    }}>
                                                                                    Request
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "120px",
                                                                                    }}>
                                                                                    TAT
                                                                                    (days)
                                                                                </th>
                                                                                <th
                                                                                    style={{
                                                                                        width: "120px",
                                                                                    }}>
                                                                                    Efficiency
                                                                                    (%)
                                                                                </th>
                                                                                <th>
                                                                                    Avg.
                                                                                    Time
                                                                                </th>
                                                                            </tr>
                                                                        </thead>

                                                                        {departmentsViewPermission &&
                                                                            departmentReportList && (
                                                                                <tbody>
                                                                                    {departmentReportList.map(
                                                                                        (
                                                                                            data,
                                                                                            index
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    index
                                                                                                }>
                                                                                                <td>
                                                                                                    <div className="align-items-center d-flex">
                                                                                                        <span
                                                                                                            className="rounded-circle icon-xs me-2"
                                                                                                            style={{
                                                                                                                height: "11px",
                                                                                                                width: "11px",
                                                                                                                backgroundColor:
                                                                                                                    colorMap[
                                                                                                                    data
                                                                                                                        .departmentName
                                                                                                                    ],
                                                                                                            }}></span>
                                                                                                        <span>
                                                                                                            {
                                                                                                                data?.departmentName
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <RequestAssignedSvg />
                                                                                                        <span>
                                                                                                            {
                                                                                                                data?.RequestAssigned
                                                                                                            }
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <span
                                                                                                        className="badge"
                                                                                                        style={{
                                                                                                            backgroundColor:
                                                                                                                colorMap[
                                                                                                                data
                                                                                                                    .departmentName
                                                                                                                ],
                                                                                                        }}>
                                                                                                        {
                                                                                                            data?.TotalTATDays
                                                                                                        }
                                                                                                    </span>
                                                                                                </td>

                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <SettingsIconSvg />
                                                                                                        <span>
                                                                                                            {data?.completedDays >
                                                                                                                0
                                                                                                                ? calculateEfficiency(
                                                                                                                    data?.RequestCompleted,
                                                                                                                    data?.RequestAssigned
                                                                                                                )
                                                                                                                : 0}
                                                                                                            %
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td>
                                                                                                    <div className="d-flex align-items-center">
                                                                                                        <ClockIconSvg />
                                                                                                        <span>
                                                                                                            {data?.completedDays >
                                                                                                                0
                                                                                                                ? calculateAverageTimePerRequest(
                                                                                                                    data?.RequestCompleted,
                                                                                                                    data?.completedDays
                                                                                                                )
                                                                                                                : 0}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                                </tbody>
                                                                            )}
                                                                    </table>
                                                                {/* </SimpleBar> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {cardsData?.topRatedServices && (
                                        <div
                                            key="topRatedServices"
                                            className={
                                                updateLayout
                                                    ? "card border-0 p-0 mb-0 cursor-grab "
                                                    : "card border-0 p-0 mb-0"
                                            }>
                                            {updateLayout && (
                                                <button
                                                    title="Remove This block"
                                                    type="button"
                                                    className="grid-close-btn"
                                                    onClick={() =>
                                                        setFalse(
                                                            "topRatedServices"
                                                        )
                                                    }>
                                                    <ImCross size="10px" />
                                                </button>
                                            )}
                                            <div className="card-header align-items-center d-flex draggableHandle">
                                            <h5 className={`mb-0 flex-grow-1 mb-3 mb-md-0 ${updateLayout ? "user-select-none": ""}`}>
                                                    Top Rated Services
                                            </h5>

                                            </div>
                                            <div className="card-body draggableHandle">
                                                {topRatedServicesLoading ? (
                                                    <LoaderSpin height={"300px"} />
                                                ) : services.length === 0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No top-rated services
                                                            available.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    services.map(
                                                        (service, index) => (
                                                            <div
                                                                key={index}
                                                                className="row align-items-center g-2 mb-3">
                                                                <div className="col-6">
                                                                    <div className="p-1">
                                                                        <h6 className="mb-0">
                                                                            {service.serviceName ||
                                                                                "Unnamed Service"}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                                <div className="col">
                                                                    <div className="flex-grow-1">
                                                                        {calculateStars(
                                                                            service.totalRatings ||
                                                                            0,
                                                                            maxRating
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div className="p-1">
                                                                        <h6 className="mb-0 text-muted">
                                                                            {service.totalRatings !==
                                                                                null &&
                                                                                service.totalRatings !==
                                                                                undefined
                                                                                ? service.totalRatings
                                                                                : "N/A"}
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </GridLayout>
                                )
                            }
                            </div>
                        </div>
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


                <ScrollToTop />

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

export default MinistryCoreUserDashborad;
