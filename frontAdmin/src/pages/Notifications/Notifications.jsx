import React, { useEffect, useRef, useState } from "react";
import {
    Badge,
    Col,
    Dropdown,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
} from "reactstrap";
import classnames from "classnames";
import SimpleBar from "simplebar-react";
import "./notifications.css";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import bell from "../../assets/images/svg/bell.svg";
import useAxios from "../../utils/hook/useAxios";

const Notification = () => {
    const axiosInstance = useAxios()

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;

    const [activeTab, setActiveTab] = useState("1");
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [notification, setNotification] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isReadCount, setIsReadCount] = useState(0);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(5);
    const totalPages = Math.ceil(totalCount / perPageSize);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const fetchNotifications = async (userId) => {
        try {
            const response = await axiosInstance.post(
                "notificationtService/user-notification",
                {
                    userId,
                    page: currentPage,
                    perPage: perPageSize,
                }
            );

            if (response?.data && response?.data?.data) {
                const isRead = response?.data?.data?.isReadCount;
                const { notifications, count } = response?.data?.data;
                setNotification(notifications);
                setTotalCount(count);
                setIsReadCount(isRead);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const updateNotification = async () => {
        try {
            const response = await axiosInstance.put(
                "notificationtService/update-user",
                {
                    userId,
                    isRead: "1",
                }
            );

            if (response.data && response.data.success) {
                fetchNotifications(userId);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchNotifications(userId);
    }, [userId, currentPage, perPageSize]);

    const toggleNotificationDropdown = () => {
        if (showNotifications) {
            if (notification.some((item) => item.isRead === "0")) {
                updateNotification();
            }
        }
        setShowNotifications(!showNotifications);
    };

    const handleLoadMore = () => {
        if (perPageSize < totalCount) {
            setPerPageSize((prevPage) => prevPage + 5);
        }
    };

    const timeAgo = (createdDate) => {
        const currentDate = new Date();
        const timestamp = new Date(createdDate);
        const seconds = Math.floor((currentDate - timestamp) / 1000);

        if (seconds < 60) {
            return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
        }

        const days = Math.floor(hours / 24);
        if (days < 7) {
            return `${days} day${days !== 1 ? "s" : ""} ago`;
        }

        const weeks = Math.floor(days / 7);
        if (weeks < 52) {
            return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
        }

        const years = Math.floor(weeks / 52);
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    };

    return (
        <React.Fragment>
            <Dropdown
                isOpen={showNotifications}
                toggle={toggleNotificationDropdown}
                className=" topbar-head-dropdown header-item ms-1 me-3 me-md-2"
            >
                <DropdownToggle
                    type="button"
                    tag="button"
                    className="btn btn-icon btn-topbar btn-ghost-primary rounded-circle"
                >
                    <i className="bx bx-bell fs-22 text-primary"></i>
                    {isReadCount > 0 && (
                        <Badge
                            color="danger"
                            pill
                            className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger"
                        >
                            {isReadCount > 99 ? "99+" : isReadCount}
                            <span className="visually-hidden">unread messages</span>
                        </Badge>
                    )}
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                    <div className="dropdown-head bg-primary bg-pattern rounded-top">
                        <div className="p-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="m-0 fs-16 fw-semibold text-white">
                                        {" "}
                                        Notifications{" "}
                                    </h6>
                                </Col>
                                <div className="col-auto dropdown-tabs">
                                    <span className="badge bg-light-subtle text-body fs-13">
                                        {" "}
                                        {isReadCount} New
                                    </span>
                                </div>
                            </Row>
                        </div>

                        <div className="px-2 pt-2">
                            <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({
                                            active: activeTab === "1",
                                        })}
                                        onClick={() => {
                                            toggleTab("1");
                                        }}
                                    >
                                        All ({notification.length})
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({
                                            active: activeTab === "2",
                                        })}
                                        onClick={() => {
                                            toggleTab("2");
                                        }}
                                    >
                                        Tickets
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className={classnames({
                                            active: activeTab === "3",
                                        })}
                                        onClick={() => {
                                            toggleTab("3");
                                        }}
                                    >
                                        Alerts
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </div>
                    </div>

                    <TabContent activeTab={activeTab}>
                        {notification && notification.length > 0 ? (
                            <TabPane tabId="1" >
                                <SimpleBar
                                    style={{ maxHeight: "300px" }}
                                    className=""
                                >
                                    {notification.map((item, index, arr) => (
                                        <div className="text-reset notification-item d-block dropdown-item position-relative" key={index}>
                                            <div
                                                className="d-flex"
                                                key={index}
                                            >
                                                 
                                                {item.type === "1" ? (
                                                    <div className="avatar-xs me-2 flex-shrink-0">
                                                        <span className="avatar-title bg-success-subtle text-success rounded-circle fs-16">
                                                            <i className="bx bx-badge-check"></i>
                                                        </span>
                                                    </div>
                                                ) : (
                                                        <div className="avatar-xs me-3 flex-shrink-0">
                                                        <span className="avatar-title bg-success-subtle text-success rounded-circle fs-16">
                                                            <i className="bx bx-badge-check"></i>
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className="flex-grow-1 p-1"
                                                    style={{
                                                        width: "calc(100% - 2rem)",
                                                    }}
                                                >
                                                    <div className="fs-13 text-muted">
                                                        <p className="mb-1">
                                                            {item.message}
                                                        </p>
                                                    </div>
                                                    <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                        <span>
                                                            <i className="mdi mdi-clock-outline"></i>{" "}
                                                            {timeAgo(
                                                                item.createdDate
                                                            )}
                                                            <i
                                                                className={`badge ms-1 ${
                                                                    item.type ===
                                                                    "1"
                                                                        ? "bg-warning"
                                                                        : "bg-success"
                                                                }`}
                                                            >
                                                                {item.type ===
                                                                "1"
                                                                    ? "Alert"
                                                                    : "Ticket"}
                                                            </i>

                                                            {item.isRead === "0" && (
                                                                <span className="badge fs-9 ms-1 bg-primary text-uppercase">
                                                                    new
                                                                </span>
                                                            )}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {totalPages !== currentPage &&
                                        currentPage * perPageSize <
                                            totalCount && (
                                            <div className="my-3 text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-soft-success waves-effect waves-light"
                                                    onClick={handleLoadMore}
                                                    disabled={
                                                        totalPages ===
                                                            currentPage ||
                                                        currentPage *
                                                            perPageSize >=
                                                            totalCount
                                                    }
                                                >
                                                    Load More Messages{" "}
                                                    <i className="ri-arrow-right-line align-middle"></i>
                                                </button>
                                            </div>
                                        )}
                                </SimpleBar>
                            </TabPane>
                        ) : (
                            <TabPane tabId="1" className="p-2 p-sm-4">
                                <div className="w-25 w-sm-50 pt-3 mx-auto">
                                    <img
                                        src={bell}
                                        className="img-fluid"
                                        alt="user-pic"
                                    />
                                </div>
                                <div className="text-center pb-5 mt-2">
                                    <h6 className="fs-16 fw-semibold lh-base">
                                        Hey! You have no any notifications{" "}
                                    </h6>
                                </div>
                            </TabPane>
                        )}

                        {notification &&
                        notification.filter((item) => item.type === "0")
                            .length > 0 ? (
                            <TabPane tabId="2" className="">
                                <SimpleBar
                                    style={{ maxHeight: "300px" }}
                                    className=""
                                >
                                        {notification.filter((item) => item.type === "0")
                                        .map((item, index) => (
                                            <div className="text-reset notification-item d-block dropdown-item position-relative" key={index}>
                                                <div
                                                    className="d-flex"
                                                    key={index}
                                                >
                                                    <div className="avatar-xs me-3 flex-shrink-0">
                                                        <span className="avatar-title bg-success-subtle text-success rounded-circle fs-16">
                                                            <i className="bx bx-badge-check"></i>
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="flex-grow-1 p-1"
                                                        style={{
                                                            width: "calc(100% - 2rem)",
                                                        }}
                                                    >
                                                        <div className="fs-13 text-muted">
                                                            <p className="mb-1">
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                        <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                            <span>
                                                                <i className="mdi mdi-clock-outline"></i>{" "}
                                                                {timeAgo(
                                                                    item.createdDate
                                                                )}
                                                                {item.isRead === "0" && (
                                                                    <span className="badge fs-9 ms-1 bg-primary text-uppercase">
                                                                        new
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    {notification
                                        .filter((item) => item.type === "0")
                                        .filter(
                                            (item) =>
                                                item.status === "1" ||
                                                item.status === null
                                        ).length >
                                        currentPage * perPageSize && (
                                        <div className="my-3 text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-soft-success waves-effect waves-light"
                                                onClick={handleLoadMore}
                                                disabled={
                                                    totalPages ===
                                                        currentPage ||
                                                    currentPage * perPageSize >=
                                                        totalCount
                                                }
                                            >
                                                Load More Messages{" "}
                                                <i className="ri-arrow-right-line align-middle"></i>
                                            </button>
                                        </div>
                                    )}
                                </SimpleBar>
                            </TabPane>
                        ) : (
                            <TabPane tabId="2" className="p-4">
                                <div className="w-25 w-sm-50 pt-3 mx-auto">
                                    <img
                                        src={bell}
                                        className="img-fluid"
                                        alt="user-pic"
                                    />
                                </div>
                                <div className="text-center pb-5 mt-2">
                                    <h6 className="fs-16 fw-semibold lh-base">
                                        Hey! You have no any notifications{" "}
                                    </h6>
                                </div>
                            </TabPane>
                        )}

                        {notification &&
                        notification.filter((item) => item.type === "1")
                            .length > 0 ? (
                            <TabPane tabId="3" >
                                <SimpleBar
                                    style={{ maxHeight: "300px" }}
                                    className=""
                                >
                                    {notification
                                        .filter((item) => item.type === "1")
                                        .map((item, index) => (
                                            <div className="text-reset notification-item d-block dropdown-item position-relative" key={index}>
                                                <div
                                                    className="d-flex"
                                                    key={index}
                                                >
                                                    <div className="avatar-xs me-2 flex-shrink-0">
                                                        <span className="avatar-title bg-success-subtle text-success rounded-circle fs-16">
                                                            <i className="bx bx-badge-check"></i>
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="flex-grow-1 p-1"
                                                        style={{
                                                            width: "calc(100% - 2rem)",
                                                        }}
                                                    >
                                                        <div className="fs-13 text-muted">
                                                            <p className="mb-1">
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                        <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                            <span>
                                                                <i className="mdi mdi-clock-outline"></i>{" "}
                                                                {timeAgo(
                                                                    item.createdDate
                                                                )}
                                                                {item.isRead === "0" && (
                                                                    <span className="badge fs-9 ms-1 bg-primary text-uppercase">
                                                                        new
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    {totalPages !== currentPage &&
                                        currentPage * perPageSize <
                                            totalCount && (
                                            <div className="my-3 text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-soft-success waves-effect waves-light"
                                                    onClick={handleLoadMore}
                                                    disabled={
                                                        totalPages ===
                                                            currentPage ||
                                                        currentPage *
                                                            perPageSize >=
                                                            totalCount
                                                    }
                                                >
                                                    Load More Messages{" "}
                                                    <i className="ri-arrow-right-line align-middle"></i>
                                                </button>
                                            </div>
                                        )}
                                </SimpleBar>
                            </TabPane>
                        ) : (
                            <TabPane tabId="3" className="p-4">
                                <div className="w-25 w-sm-50 pt-3 mx-auto">
                                    <img
                                        src={bell}
                                        className="img-fluid"
                                        alt="user-pic"
                                    />
                                </div>
                                <div className="text-center pb-5 mt-2">
                                    <h6 className="fs-16 fw-semibold lh-base">
                                        Hey! You have no any notifications{" "}
                                    </h6>
                                </div>
                            </TabPane>
                        )}
                    </TabContent>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default Notification;
