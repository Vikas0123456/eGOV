import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import UpdateStatusModal from "./UpdateStatusModal";
import ActiveApplications from "../../Applications/ActiveApplications/ActiveApplications";
import SupportTickets from "../../TicketingSystem/Tickets/SupportTickets";
import DashboardSvg from "../../../assets/svg/DashboardSvg";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import AnnouncementCarousel from "../AnnouncementCarousel";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import useAxios from "../../../utils/hook/useAxios";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css"; // Ensure you import necessary CSS files
import "react-resizable/css/styles.css"; // For resizable
import { ImCross } from "react-icons/im";
import { setTableColumnConfig } from "../../../slices/layouts/reducer";
import { useDispatch, useSelector } from "react-redux";
import SimpleBar from "simplebar-react";
import { Button, Input } from "reactstrap";
import Select from "react-select";
import Swal from "sweetalert2";

const defaultCardsDatas = {
    announcements: true,
    tickets: true,
    applications: true,
    ticketsListing: true,
};

const defaultLayout = [
    {
        w: 9,
        h: 1.5,
        minH: 1.5,
        minW: 9,
        x: 0,
        y: 0,
        i: "announcements",
        moved: false,
        static: false,
    },

    {
        w: 3,
        h: 1.5,
        minH: 1.5,
        minW: 1,
        x: 9,
        y: 0,
        i: "tickets",
        moved: false,
        static: false,
    },
    {
        w: 12,
        h: 4,
        minH: 4,
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
        h: 3.75,
        minH: 3.75,
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
};

const DepartmentAgentDashboard = () => {
    const axiosInstance = useAxios();
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const departmentId = userData?.departmentId;
    const dispatch = useDispatch();
    const tableName = "departmentAgentDashboard";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );

    const tableConfigLoading = useSelector(
        (state) => state?.Layout?.configDataLoading
    );

    const [ticketCount, setTicketCount] = useState();
    const [ticketCountPercentage, setTicketCountPercentage] = useState();
    const [data, setData] = useState("");
    const visibleRecords = 5;
    const navigate = useNavigate();
    // const [dataById, setDataById] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcementloading, setAnnouncementLoading] = useState(true);

    const [isOpen, setIsopen] = useState(false);

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };

    const slugsToCheck = ["announcements", "applications", "tickets"];

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
    const applicationsViewPermission = permissions["applications"];
    const ticketsViewPermission = permissions["tickets"];

    const defaultCardsData = Object.keys(defaultCardsDatas).reduce(
        (acc, key) => {
            switch (key) {
                case "announcements":
                    acc[key] = announcementsViewPermission;
                    break;
                case "applications":
                    acc[key] = applicationsViewPermission;
                    break;
                case "tickets":
                    acc[key] = ticketsViewPermission;
                    break;
                case "ticketsListing":
                    acc[key] = ticketsViewPermission;
                default:
                    acc[key] = defaultCardsDatas[key];
            }
            return acc;
        },
        {}
    );

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

            const updatedCardsData = Object.keys(selectedConfig?.cardsData || {}).reduce(
                (acc, key) => {
                    if (selectedConfig.cardsData?.[key] === false) {
                        acc[key] = false;
                    } else {
                        switch (key) {
                            case "announcements":
                                acc[key] = announcementsViewPermission;
                                break;
                            case "applications":
                                acc[key] = applicationsViewPermission;
                                break;
                            case "tickets":
                            case "ticketsListing":
                                acc[key] = ticketsViewPermission;
                                break;
                            default:
                                acc[key] = defaultCardsData[key];
                        }
                    }
                    return acc;
                },
                {}
            );            

            if (selectedConfig) {
                setCurrentLayoutName(selectedConfig.layoutName);
                return {
                    memoizedLayoutData: selectedConfig.layoutData,
                    memoizedCardsData: updatedCardsData,
                };
            }
        } else if (!isNewLayout) {
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
    }, [tableColumnConfig, isNewLayout, announcementsViewPermission, applicationsViewPermission, ticketsViewPermission]);

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
        if (layoutId === "newLayout") {
            setIsNewLayout(true);
            setUpdateLayout(true);
            setSelectedLayout(null)
            setLayout(defaultLayout);
            setCardsData(defaultCardsData);
            setCurrentLayoutName("")
        } else {
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

                if (response) {
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
            const response = await axiosInstance.post(`userService/table/update-table-config`, {
                userId,
                tableName,
                tableConfig: JSON.stringify(updatedTableConfig),
            });

            if (response) {
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

                if (updatedLayouts?.length === 0) {
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
                    if (response) {
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
            if (tableColumnConfig?.tableConfig && tableColumnConfig?.tableConfig?.layouts) {
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

    // const fetchDepartmentById = async () => {
    //     // setIsLoading(true)
    //     try {
    //         const response = await axiosInstance.post(
    //             `serviceManagement/department/departmentById`,
    //             { departmentId: departmentId }
    //         );
    //         if (response?.data) {
    //             const { rows, count } = response?.data?.data;
    //             setDataById(rows);
    //             // setIsLoading(false)
    //         }
    //     } catch (error) {
    //         // setIsLoading(false)
    //         console.error(error.message);
    //     }
    // };
    const fetchTicketCount = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `ticketService/ticket/statusCount`,
                { departmentId: departmentId }
            );
            if (response?.data) {
                const data = response?.data?.data;
                setTicketCount(data);
                // setIsLoading(false)
                if (data) {
                    let percentage = calculatePercentages(data);
                    setTicketCountPercentage(percentage);
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    // useEffect(() => {
    //     if (userData?.isCoreTeam === "0") {
    //         fetchDepartmentById();
    //     }
    // }, []);
    useEffect(() => {
        if (userData?.departmentId) {
            fetchTicketCount();
        }
    }, []);

    function toggleCardVisibility(cardId) {
        const card = document.getElementById(cardId);
        if (card) {
            card.classList.toggle("d-none");
        }
    }

    const getCurrentFormattedDate = () => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        const today = new Date();
        const dateString = today.toLocaleDateString("en-US", options);
        return dateString.replace(",", "");
    };

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

    document.title = "Dashboard | eGov Solution";

    const menuItems = [
        {
            title: "Announcement",
            icon: "ri-bar-chart-2-line",
            cardValue: "announcements",
            onClick: () => setTrueIfFalse("announcements"),
            viewPermission: announcementsViewPermission,
        },
        {
            title: "Tickets",
            icon: "ri-coupon-line",
            style: { transform: "rotate(90deg)" },
            cardValue: "tickets",
            onClick: () => setTrueIfFalse("tickets"),
            viewPermission: ticketsViewPermission,
        },
        {
            title: "Recent Applications",
            icon: "mdi mdi-sitemap-outline",
            cardValue: "applications",
            onClick: () => setTrueIfFalse("applications"),
            viewPermission: applicationsViewPermission,
        },
        {
            title: "Recent Tickets",
            icon: "ri-customer-service-line",
            cardValue: "ticketsListing",
            onClick: () => setTrueIfFalse("ticketsListing"),
            viewPermission: ticketsViewPermission,
        },
    ].map((menu) => ({
        ...menu,
        cardAdded: cardsData[menu.cardValue] || false,
    }));
    

    return (
        <>
            <div className="main-content dashboard-ana">
                <div
                    className={`page-content custom-sidebar ${updateLayout ? "menu--open" : ""
                        } px-0  `}>
                    {
                        !updateLayout && !isMobile && (
                            <Button onClick={() => setUpdateLayout(true)} className="edit-layout bg-primary" size="sm" varian="secondary" title="Edit Layout">
                                <i className="mdi mdi-cog-outline fs-16 align-middle me-1 rotating-icon"></i>
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
                                                        <div
                                                            className="card-body"
                                                            style={{
                                                                height: "",
                                                                padding:
                                                                    "35px 20px",
                                                            }}>
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
                                                    <>
                                                        <div
                                                            className="card-body"
                                                            style={{
                                                                height: "",
                                                                padding:
                                                                    "35px 20px",
                                                            }}>
                                                            <AnnouncementCarousel
                                                                items={data}
                                                                announcementsViewPermission={
                                                                    announcementsViewPermission
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-3">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card border-0">
                                                <div className="card-header">
                                                    <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold">
                                                        Tickets
                                                    </h4>
                                                </div>

                                                {loading ? (
                                                    <div className="card-body border-0 pb-2 pt-2 draggableHandle">
                                                        <LoaderSpin
                                                            height={"300px"}
                                                        />
                                                    </div>
                                                ) : !loading &&
                                                    ticketsViewPermission?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Ticket Data
                                                            found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        New
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.new ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
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
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="49"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        In
                                                                        Progress
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.inProgress ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#b15444",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.inProgress ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Escalated
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.escalated ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f7b84b",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.escalated ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>

                                                        <div className="card-body border-0">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Closed
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.closed ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
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
                                                                    }}
                                                                    aria-valuenow="10"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Reopened
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.reopened ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#b15444",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.reopened ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div> */}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {applicationsViewPermission && (
                                <div className="row ">
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
                                </div>
                            )}

                            {ticketsViewPermission && (
                                <div className="row">
                                    <div className="col-lg-12">
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
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="container-fluid">
                            {/* <div className="row"> */}

                            <DepartmentUserInfo />
                            <div className="d-flex align-items-center justify-content-end me-4">
                                <Select
                                    className="bg-choice text-start border border-1 border-primary rounded border-opacity-10 z-2"
                                    value={layoutOptions?.length > 0 ? layoutOptions.find(option => option.value === selectedLayout) : null}
                                    onChange={(layout) => {
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
                            {
                                tableConfigLoading && (
                                    <div>
                                        <LoaderSpin />
                                    </div>
                                )
                            }
                            {
                                layoutReady && processedLayout?.length === 0 && (
                                    <div className="text-center dashboard-blank">
                                        <DashboardSvg />
                                        <h5 className="mt-4">
                                            Nothing to show please update the layout
                                        </h5>
                                    </div>
                                )
                            }
                            {
                                layoutReady && processedLayout?.length > 0 && (
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
                                            <div key="announcements" className={
                                                updateLayout
                                                    ? "card cursor-grab "
                                                    : "card "
                                            }>
                                                {updateLayout && (
                                                    <button
                                                        title="Remove This block"
                                                        type="button"
                                                        className="grid-close-btn"
                                                        onClick={() =>
                                                            setFalse(
                                                                "announcements"
                                                            )
                                                        }>
                                                        <ImCross size="10px" />
                                                    </button>
                                                )}
                                                <div className="card-header d-flex align-items-center draggableHandle">
                                                    <h5 className={`flex-grow-1 mb-0 ${updateLayout ? "user-select-none" : ""}`}>
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

                                        {cardsData?.tickets && (
                                            <div
                                                key="tickets"
                                                className={
                                                    updateLayout
                                                        ? "card cursor-grab "
                                                        : "card "
                                                }>
                                                {updateLayout && (
                                                    <div className="mx-4 flex-shrink-0">
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
                                                    </div>
                                                )}
                                                <div className="card-header align-items-center d-flex flex-wrap justify-content-between draggableHandle">
                                                    <h4 className={`card-title mb-0 flex-grow-1 fs-18 fw-semibold ${updateLayout ? "user-select-none" : ""}`}>
                                                        Tickets
                                                    </h4>
                                                </div>

                                                {loading ? (
                                                    <div className="card-body border-0 pb-2 pt-2 draggableHandle">
                                                        <LoaderSpin height={"300px"} />
                                                    </div>
                                                ) : !loading &&
                                                    ticketsViewPermission?.length ===
                                                    0 ? (
                                                    <div className="text-center">
                                                        <p className="text-muted">
                                                            No Ticket Data found.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        New
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.new ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
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
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="49"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        In
                                                                        Progress
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.inProgress ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#b15444",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.inProgress ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Escalated
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.escalated ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#f7b84b",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.escalated ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>

                                                        <div className="card-body border-0">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Closed
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.closed ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
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
                                                                    }}
                                                                    aria-valuenow="10"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="card-body border-0 pb-2 pt-2">
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="mb-1 text-muted">
                                                                        Reopened
                                                                    </h6>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <h6 className="mb-0">
                                                                        {ticketsViewPermission
                                                                            ? ticketCount?.reopened ||
                                                                            null
                                                                            : null}
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="progress animated-progress progress-sm bg-soft-secondary"
                                                                style={{
                                                                    borderRadius:
                                                                        "10px",
                                                                }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#b15444",
                                                                        width: `${ticketsViewPermission
                                                                            ? ticketCountPercentage?.reopened ||
                                                                            null
                                                                            : null
                                                                            }%`,
                                                                        borderRadius:
                                                                            "10px",
                                                                    }}
                                                                    role="progressbar"
                                                                    aria-valuenow="90"
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"></div>
                                                            </div>
                                                        </div> */}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {cardsData?.applications && (
                                            <div
                                                key="applications"
                                                className={`card ${updateLayout ? "cursor-grab " : ""
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
                                                    <h5 className="mb-0">
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
                                                            type="button"
                                                            className="grid-close-btn"
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
                                                    <h5 className="mb-0 ">
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
                                    onClick={() => {
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
                                    item.viewPermission && (
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
                                    )
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

                <UpdateStatusModal />
            </div>
        </>
    );
};

export default DepartmentAgentDashboard;
