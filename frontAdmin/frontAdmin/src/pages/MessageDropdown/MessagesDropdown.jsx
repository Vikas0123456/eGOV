import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { Input, ListGroup, ListGroupItem, Badge } from "reactstrap";
import { FaRegImage } from "react-icons/fa6";
import { VscFilePdf } from "react-icons/vsc";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import SimpleBar from "simplebar-react";
import { io } from "socket.io-client";
import useAxios from "../../utils/hook/useAxios";
import logo from "./logo/logo-sm.png";
let socket = io(process.env.REACT_APP_BASE_URL, {
    transports: ["websocket"],
});
import { useDispatch, useSelector } from "react-redux";
import {
    setPersonalChatUnseenCountsAction,
    setGroupChatUnseenCountsAction,
    setTotalUnseenCountAction,
    setUserDataAction,
    setCurrentOtherUserAction,
} from "../../slices/layouts/reducer";

const MessagesDropdown = () => {
    const userData = useSelector((state) => state.Layout.userData);
    const personalChatUnseenCounts = useSelector(
        (state) => state.Layout.personalChatUnseenCounts
    );
    const groupChatUnseenCounts = useSelector(
        (state) => state.Layout.groupChatUnseenCounts
    );
    const totalUnseenCount = useSelector(
        (state) => state.Layout.totalUnseenCount
    );
    const userStatuses = useSelector((state) => state.Layout.userStatuses);

    const personalChatUnseenCountsRef = useRef(personalChatUnseenCounts);
    const groupChatUnseenCountsRef = useRef(groupChatUnseenCounts);

    // Keep refs in sync with Redux values
    useEffect(() => {
        personalChatUnseenCountsRef.current = personalChatUnseenCounts;
    }, [personalChatUnseenCounts]);

    useEffect(() => {
        groupChatUnseenCountsRef.current = groupChatUnseenCounts;
    }, [groupChatUnseenCounts]);

    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [userStatuses, setUserStatuses] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredChatList, setFilteredChatList] = useState([]);
    const userEncryptData = localStorage.getItem("userData");
    const data = userEncryptData
        ? decrypt({ data: userEncryptData }).data
        : null;
    const userId = userData?.id;
    const isCoreUser = userData?.isCoreTeam;
    const dropdownRef = useRef(null);
    const typingTimeouts = useRef({});

    useEffect(() => {
        if (data && !userData) {
            dispatch(setUserDataAction(data));
        }
    }, [JSON.stringify(data)]);

    useEffect(() => {
        if (userData?.id) {
            fetchChatLists();
        }
    }, [JSON.stringify(userData)]);

    const fetchChatLists = async () => {
        if (!userData?.id) return;

        try {
            const [personalChatResponse, groupChatResponse] = await Promise.all(
                [
                    axiosInstance.post(`chatservice/chat/getPersonalChatList`, {
                        userId: userData.id,
                        chatListType: "",
                    }),
                    axiosInstance.post(`chatservice/chat/getGroupChatList`, {
                        userId: userData.id,
                        isCoreUser: userData.isCoreTeam,
                        chatListType: "",
                    }),
                ]
            );

            const personalChatUnseenCounts =
                personalChatResponse?.data?.data || [];
            const groupChatUnseenCounts = groupChatResponse?.data?.data || [];

            const totalUnseenCounts = [
                ...personalChatUnseenCounts,
                ...groupChatUnseenCounts,
            ].reduce((total, chat) => total + (chat.unseenCount || 0), 0);

            const newPerChat = personalChatUnseenCounts?.map((chat) => ({
                ...chat,
                isTyping: false,
            }));
            const newGroupChat = groupChatUnseenCounts?.map((chat) => ({
                ...chat,
                isTyping: false,
                typerName: false,
            }));

            dispatch(setPersonalChatUnseenCountsAction(newPerChat));
            dispatch(setGroupChatUnseenCountsAction(newGroupChat));
            dispatch(setTotalUnseenCountAction(totalUnseenCounts));

            // setPersonalChatUnseenCounts(newPerChat);
            // setGroupChatUnseenCounts(newGroupChat);
            // setTotalUnseenCount(totalUnseenCounts);
        } catch (error) {
            console.error("Error fetching chat lists:", error.message);
        }
    };

    const filterChats = (query) => {
        setSearchQuery(query);

        const filteredPersonal = personalChatUnseenCounts.filter((chat) => {
            return chat.user?.name.toLowerCase().includes(query.toLowerCase());
        });

        const filteredGroup = groupChatUnseenCounts.filter((chat) => {
            return chat.chatName.toLowerCase().includes(query.toLowerCase());
        });

        const combinedFiltered = [...filteredPersonal, ...filteredGroup];

        const uniqueFiltered = combinedFiltered.filter((item, index) => {
            return (
                combinedFiltered.findIndex((i) => i.id === item.id) === index
            );
        });

        setFilteredChatList(uniqueFiltered);
    };

    const renderUserStatus = (userId) => {
        const status = userStatuses[userId];
        if (!status) return <span className="user-status bg-danger"></span>;

        if (status.online) {
            return <span className="user-status"></span>;
        } else if (status.away) {
            return <span className="user-status bg-danger"></span>;
        } else {
            return <span className="user-status bg-danger"></span>;
        }
    };
    useEffect(() => {
        if (userId) {
            socket.emit("setup", userId);

            const setupCompleteHandler = () => {
                socket.emit("join-chat", userId);
            };

            const notifiedMessageIds = new Set();

            socket.on("typing_status", (data) => {
                if (data && data.chatData) {
                    const { id, isGroup } = data.chatData;

                    // Clear the previous timeout for this chat if it exists
                    if (typingTimeouts.current[id]) {
                        clearTimeout(typingTimeouts.current[id]);
                    }

                    // Update typing status for group or personal chat
                    if (isGroup) {
                        if (groupChatUnseenCountsRef.current?.length > 0) {
                            const updatedGroupChatUnseenCounts =
                                groupChatUnseenCountsRef.current.map((chat) =>
                                    chat.id === id
                                        ? {
                                              ...chat,
                                              isTyping: data.isTyping,
                                              typerName: data.userName,
                                          }
                                        : chat
                                );
                            dispatch(
                                setGroupChatUnseenCountsAction(
                                    updatedGroupChatUnseenCounts
                                )
                            );
                        }
                    } else {
                        if (personalChatUnseenCountsRef.current?.length > 0) {
                            const updatedPersonalChatUnseenCounts =
                                personalChatUnseenCountsRef.current.map(
                                    (chat) =>
                                        chat.id === id
                                            ? {
                                                  ...chat,
                                                  isTyping: data.isTyping,
                                              }
                                            : chat
                                );
                            dispatch(
                                setPersonalChatUnseenCountsAction(
                                    updatedPersonalChatUnseenCounts
                                )
                            );
                        }
                    }

                    // Set a timeout to reset the typing status after 3 seconds for this chat
                    typingTimeouts.current[id] = setTimeout(() => {
                        if (isGroup) {
                            const updatedGroupChatUnseenCounts =
                                groupChatUnseenCountsRef.current.map((chat) =>
                                    chat.id === id
                                        ? { ...chat, isTyping: false }
                                        : chat
                                );
                            dispatch(
                                setGroupChatUnseenCountsAction(
                                    updatedGroupChatUnseenCounts
                                )
                            );
                        } else {
                            const updatedPersonalChatUnseenCounts =
                                personalChatUnseenCountsRef.current.map(
                                    (chat) =>
                                        chat.id === id
                                            ? { ...chat, isTyping: false }
                                            : chat
                                );
                            dispatch(
                                setPersonalChatUnseenCountsAction(
                                    updatedPersonalChatUnseenCounts
                                )
                            );
                        }
                    }, 3000);
                }
            });

            const receivedMessageHandler = (data) => {
                fetchChatLists();

                if (!notifiedMessageIds.has(data.message.id)) {
                    notifiedMessageIds.add(data.message.id);

                    if ("Notification" in window) {
                        if (Notification.permission === "granted") {
                            const notification = new Notification(
                                `New Message From ${
                                    data.chat.isGroup === 1
                                        ? data.chat.chatName + " Group"
                                        : data.senderName
                                }`,
                                {
                                    body: `${data.message.content}`,
                                    icon: logo,
                                }
                            );
                            notification.onclick = (event) => {
                                event.preventDefault();

                                if (document.hidden) {
                                    window.focus();
                                }

                                navigate("/messages", {
                                    state: {
                                        chatId: data?.chat?.id,
                                        isGroup: data?.chat?.isGroup,
                                    },
                                });
                            };
                        }
                    } else {
                        console.warn(
                            "This browser does not support notifications."
                        );
                    }
                }
            };

            const disconnectHandler = () => {
                // Handle socket disconnection
            };

            const handleVisibilityChange = () => {
                if (document.visibilityState === "visible") {
                    socket.emit("user-online", userId);
                    socket.disconnectedTemporarily = false;
                } else {
                    socket.emit("user-away", userId);
                }
            };

            const handleBeforeUnload = (event) => {
                socket.disconnectedTemporarily = true;
                socket.emit("user-offline", userId);
            };

            socket.on("chat-created", fetchChatLists);
            socket.on("chat-deleted", fetchChatLists);
            socket.on("setup-complete", setupCompleteHandler);
            socket.on("received-message", receivedMessageHandler);
            socket.on("disconnect", disconnectHandler);
            socket.on("delete-chat", (data) => {
                // Handle chat deletion
            });

            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.addEventListener("beforeunload", handleBeforeUnload);
            if ("Notification" in window) {
                if (Notification.permission !== "granted") {
                    Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                            // Notification permission granted
                        }
                    });
                }
            } else {
                console.warn("This browser does not support notifications.");
            }

            return () => {
                socket.off("setup-complete", setupCompleteHandler);
                socket.off("received-message", receivedMessageHandler);
                socket.off("disconnect", disconnectHandler);

                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
                window.removeEventListener("beforeunload", handleBeforeUnload);

                notifiedMessageIds.clear();

                // Clear all typing timeouts
                Object.values(typingTimeouts.current).forEach(clearTimeout);
                typingTimeouts.current = {}; // Reset typing timeouts object

                if (userId) {
                    socket.emit("user-offline", userId);
                }
            };
        } else {
            socket.emit("user-offline", userId);
        }
    }, [userId, socket, dispatch]);

    const handleItemClick = (callback) => {
        callback();

        setTimeout(() => {
            if (dropdownRef.current) {
                dropdownRef.current.click();
            }
        }, 100);
    };

    const handleClickUser = (chat) => {
        setSearchQuery("");
        dispatch(setCurrentOtherUserAction(chat));

        // Combine both arrays and find total unseen count
        const totalUnseenCountBeforeUpdate = [
            ...personalChatUnseenCounts,
            ...groupChatUnseenCounts,
        ].reduce((total, c) => total + c.unseenCount, 0);

        // Find unseen count for the clicked chat
        const unseenCountToRemove =
            (chat.isGroup
                ? groupChatUnseenCounts
                : personalChatUnseenCounts
            ).find((c) => c?.id === chat?.id)?.unseenCount || 0;

        // Emit 'message-seen' event if there are unseen messages
        if (unseenCountToRemove > 0) {
            socket.emit("message-seen", {
                userId,
                chatId: chat?.id,
                senderId: chat?.user?.id,
            });
        }

        // Function to update unseen counts
        const updateUnseenCounts = (list, chatId) =>
            list.map((c) => (c?.id === chatId ? { ...c, unseenCount: 0 } : c));

        // Conditionally update only the relevant chat list
        if (chat.isGroup) {
            const updatedGroupChatUnseenCounts = updateUnseenCounts(
                groupChatUnseenCounts,
                chat?.id
            );
            dispatch(
                setGroupChatUnseenCountsAction(updatedGroupChatUnseenCounts)
            );
        } else {
            const updatedPersonalChatUnseenCounts = updateUnseenCounts(
                personalChatUnseenCounts,
                chat?.id
            );
            dispatch(
                setPersonalChatUnseenCountsAction(
                    updatedPersonalChatUnseenCounts
                )
            );
        }

        // Update total unseen count after removing unseen messages
        const totalUnseenCountAfterUpdate =
            totalUnseenCountBeforeUpdate - unseenCountToRemove;
        dispatch(setTotalUnseenCountAction(totalUnseenCountAfterUpdate));

        navigate("/messages");
    };

    return (
        <Dropdown ref={dropdownRef} className="ms-sm-3 header-item topbar-user">
            <Dropdown.Toggle
                variant="ghost-secondary"
                className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                id="page-header-notifications-dropdown"
                title="Notifications"
            >
                <i className="bx bx-message-rounded fs-22 text-primary"></i>
                <div className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
                    {totalUnseenCount > 0 ? totalUnseenCount : ""}
                </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-end">
                <div className="chat-leftsidebar overflow-hidden">
                    <SimpleBar
                        style={{
                            maxHeight: "calc(90vh - 50px)",
                            overflowX: "auto",
                        }}
                    >
                        <div className="px-4 pt-4 mb-4">
                            <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                    <h5 className="mb-4">Message</h5>
                                </div>
                                <div className="flex-shrink-0">
                                    <div
                                        data-bs-toggle="tooltip"
                                        data-bs-trigger="hover"
                                        data-bs-placement="bottom"
                                        title="Add Contact"
                                    >
                                        {" "}
                                    </div>
                                </div>
                            </div>
                            <div className="search-box">
                                <Input
                                    type="text"
                                    className="bg-light border-light"
                                    placeholder="Search here..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        filterChats(e.target.value)
                                    }
                                />
                                <i className="ri-search-2-line search-icon"></i>
                            </div>

                            <ListGroup className="mt-3">
                                {searchQuery &&
                                    filteredChatList.map((chat) => (
                                        <ListGroupItem
                                            key={chat.id}
                                            onClick={() =>
                                                handleItemClick(() =>
                                                    handleClickUser(chat)
                                                )
                                            }
                                        >
                                            <div className="d-flex align-items-center cursor-pointer">
                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                    <div className="avatar-xxs">
                                                        {chat.isGroup ? (
                                                            <img
                                                                src="https://banner2.cleanpng.com/20180728/ftk/kisspng-computer-icons-icon-design-users-group-group-icon-5b5c712f527ed9.0606827715327849433379.jpg"
                                                                width="10"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={
                                                                    chat.user
                                                                        ?.profileImagePath
                                                                }
                                                                className="rounded-circle img-fluid userprofile"
                                                                alt={
                                                                    chat.user
                                                                        ?.name
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <p className="text-truncate mb-0">
                                                        {chat.user?.name &&
                                                            ` ${chat.user?.name}`}
                                                    </p>
                                                    <p className="text-truncate mb-0">
                                                        {chat.chatName &&
                                                            `${chat.chatName}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </ListGroupItem>
                                    ))}
                            </ListGroup>
                        </div>
                        <div className="chat-room-list" data-simplebar="init">
                            <div className="d-flex align-items-center px-4 mb-2">
                                <div className="flex-grow-1">
                                    <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                        Direct Messages
                                    </h4>
                                </div>
                            </div>
                            <ListGroup className="chat-message-list">
                                {personalChatUnseenCounts &&
                                    personalChatUnseenCounts.length > 0 &&
                                    personalChatUnseenCounts
                                        .filter((chat) => {
                                            let isArchiveChat = chat?.archiveBy
                                                ? JSON.parse(chat?.archiveBy)
                                                : [];
                                            return isArchiveChat?.length > 0
                                                ? isArchiveChat.includes(userId)
                                                    ? false
                                                    : true
                                                : true;
                                        })
                                        .map((user, index) => (
                                            <ListGroupItem
                                                key={index}
                                                className="d-flex align-items-center cursor-pointer"
                                                onClick={() =>
                                                    handleItemClick(() =>
                                                        handleClickUser(user)
                                                    )
                                                }
                                                action
                                            >
                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                    <div className="avatar-xxs">
                                                        <img
                                                            src={
                                                                user?.user
                                                                    ?.profileImagePath
                                                            }
                                                            className="avatar-title rounded-circle bg-info userprofile "
                                                            alt="Profile"
                                                        />
                                                    </div>
                                                    {renderUserStatus(
                                                        user?.user?.id
                                                    )}
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <p className="text-truncate mb-0">
                                                        {user?.user?.name}
                                                        <p className="text-truncate mb-0"></p>
                                                    </p>
                                                    {user?.isTyping ? (
                                                        <span className="text-success">
                                                            Typing...
                                                        </span>
                                                    ) : (
                                                        user?.lastMessage && (
                                                            <span>
                                                                {user.lastMessage ===
                                                                    "image/jpeg" ||
                                                                user.lastMessage ===
                                                                    "image/jpg" ||
                                                                user.lastMessage ===
                                                                    "image/png" ||
                                                                user.lastMessage ===
                                                                    "image/webp" ? (
                                                                    <div>
                                                                        <FaRegImage />
                                                                        Image{" "}
                                                                    </div>
                                                                ) : user.lastMessage ===
                                                                  "application/pdf" ? (
                                                                    <div>
                                                                        <VscFilePdf />{" "}
                                                                        PDF
                                                                    </div>
                                                                ) : (
                                                                    user.lastMessage
                                                                )}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Badge
                                                        className="text-light"
                                                        color="red"
                                                        pill
                                                    >
                                                        {user?.unseenCount >
                                                        0 ? (
                                                            <div className="notification-badge">
                                                                {
                                                                    user.unseenCount
                                                                }
                                                            </div>
                                                        ) : null}
                                                    </Badge>
                                                </div>
                                            </ListGroupItem>
                                        ))}
                            </ListGroup>
                            <div className="d-flex align-items-center px-4 mt-4 pt-2 mb-2">
                                <div className="flex-grow-1">
                                    <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                        Group
                                    </h4>
                                </div>
                            </div>
                            <ListGroup className="chat-message-list mb-0">
                                {groupChatUnseenCounts &&
                                    groupChatUnseenCounts.length > 0 &&
                                    groupChatUnseenCounts
                                        .filter((chat) => {
                                            let isArchiveChat = chat?.archiveBy
                                                ? JSON.parse(chat?.archiveBy)
                                                : [];
                                            return isArchiveChat?.length > 0
                                                ? isArchiveChat.includes(userId)
                                                    ? false
                                                    : true
                                                : true;
                                        })
                                        .map((group, index) => (
                                            <ListGroupItem
                                                className="d-flex align-items-center cursor-pointer"
                                                key={index}
                                                onClick={() =>
                                                    handleItemClick(() =>
                                                        handleClickUser(group)
                                                    )
                                                }
                                                action
                                            >
                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                    <div className="avatar-xxs">
                                                        <div className="avatar-title bg-light rounded-circle text-body">
                                                            {group.createdBy ===
                                                            0 ? (
                                                                "# "
                                                            ) : (
                                                                <>
                                                                    <img
                                                                        src="https://banner2.cleanpng.com/20180728/ftk/kisspng-computer-icons-icon-design-users-group-group-icon-5b5c712f527ed9.0606827715327849433379.jpg"
                                                                        width="10"
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <p className="text-truncate mb-0">
                                                        {group?.chatName}
                                                    </p>
                                                    {group?.isTyping ? (
                                                        <span className="text-success">
                                                            {`${group?.typerName?.split(
                                                                " ",
                                                                1
                                                            )} is Typing...`}
                                                        </span>
                                                    ) : (
                                                        group?.lastMessage && (
                                                            <span>
                                                                {group.lastMessage ===
                                                                    "image/jpeg" ||
                                                                group.lastMessage ===
                                                                    "image/jpg" ||
                                                                group.lastMessage ===
                                                                    "image/png" ||
                                                                group.lastMessage ===
                                                                    "image/webp" ? (
                                                                    <div>
                                                                        <FaRegImage />
                                                                        Image{" "}
                                                                    </div>
                                                                ) : group.lastMessage ===
                                                                  "application/pdf" ? (
                                                                    <div>
                                                                        <VscFilePdf />{" "}
                                                                        PDF
                                                                    </div>
                                                                ) : (
                                                                    group.lastMessage
                                                                )}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Badge
                                                        className="text-light"
                                                        color="red"
                                                        pill
                                                    >
                                                        {group?.unseenCount >
                                                        0 ? (
                                                            <div className="notification-badge">
                                                                {
                                                                    group.unseenCount
                                                                }
                                                            </div>
                                                        ) : null}
                                                    </Badge>
                                                </div>
                                            </ListGroupItem>
                                        ))}
                            </ListGroup>
                        </div>
                    </SimpleBar>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default MessagesDropdown;
