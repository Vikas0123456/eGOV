import React, { useEffect, useState } from "react";
import {
    Button,
    ListGroup,
    ListGroupItem,
    Badge,
    Container,
    NavItem,
    NavLink,
    Nav,
    TabContent,
    TabPane,
} from "reactstrap";
import { FaRegImage } from "react-icons/fa6";
import { VscFilePdf } from "react-icons/vsc";
import Chat from "./Chat";
import { LoaderSpin } from "../../common/Loader/Loader";
import UpdateGroup from "./Models/UpdateGroup";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import CreatePersonalChat from "./Models/CratePersonalChat";
import CreateGroupChat from "./Models/CreateGroupChat";
import { io } from "socket.io-client";
import classnames from "classnames";
import SimpleBar from "simplebar-react";
import useAxios from "../../utils/hook/useAxios";
import { useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
    setPersonalChatUnseenCountsAction,
    setGroupChatUnseenCountsAction,
    setTotalUnseenCountAction,
    setCurrentOtherUserAction,
    setUserStatusesAction,
} from "../../slices/layouts/reducer";

let socket = io(process.env.REACT_APP_BASE_URL, {
    transports: ["websocket"],
});

const Messages = () => {
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
    const currentOtherUser = useSelector(
        (state) => state.Layout.currentOtherUser
    );

    // console.log(personalChatUnseenCounts);

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const axiosInstance = useAxios();
    const [chatMessages, setChatMessages] = useState([]);
    // const [archivePersonalChatList, setArchivePersonalChatList] = useState([]);
    // const [archiveGroupChatList, setArchiveGroupChatList] = useState([]);
    // const [favPersonalChatList, setFavPersonalChatList] = useState([]);
    // const [favGroupChatList, setFavGroupChatList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsersId, setSelectedUsersId] = useState([]);
    const [newChatValue, setNewChatValue] = useState(null);
    const [isGoupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isUpdateGroupOpen, setisUpdateGroupOpen] = useState(false);
    const [oneToOneModel, setOneToOneModel] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredChatList, setFilteredChatList] = useState([]);
    const userId = userData?.id;
    const userDepartmentId = userData?.departmentId;
    const [customActiveTab, setcustomActiveTab] = useState("1");

    const chatId = location?.state?.chatId;
    const isGroup = location?.state?.isGroup;

    useEffect(() => {
        if (chatId) {
            const isGroupChat = isGroup === 1;
            const chatArray = isGroupChat
                ? groupChatUnseenCounts
                : personalChatUnseenCounts;

            const currentChat = chatArray.find((chat) => chat.id === chatId);

            if (currentChat) {
                dispatch(setCurrentOtherUserAction(currentChat));
                const unseenCountToRemove = currentChat.unseenCount;

                if (isGroupChat) {
                    // Update group chat unseen counts
                    const updatedGroupChats = groupChatUnseenCounts.map(
                        (chat) =>
                            chat.id === chatId
                                ? { ...chat, unseenCount: 0 }
                                : chat
                    );
                    dispatch(setGroupChatUnseenCountsAction(updatedGroupChats));
                } else {
                    // Update personal chat unseen counts
                    const updatedPersonalChats = personalChatUnseenCounts.map(
                        (chat) =>
                            chat.id === chatId
                                ? { ...chat, unseenCount: 0 }
                                : chat
                    );
                    dispatch(
                        setPersonalChatUnseenCountsAction(updatedPersonalChats)
                    );
                }

                socket.emit("message-seen", {
                    userId,
                    chatId: currentChat?.id,
                    senderId: currentChat?.user?.id,
                });

                dispatch(
                    setTotalUnseenCountAction(
                        totalUnseenCount - unseenCountToRemove
                    )
                );

                navigate("/messages", { state: {} });
            }
        }
    }, [
        location.state,
        chatId,
        isGroup,
        JSON.stringify(groupChatUnseenCounts),
        JSON.stringify(personalChatUnseenCounts),
    ]);

    const toggleCustom = (tab) => {
        if (customActiveTab !== tab) {
            setcustomActiveTab(tab);
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

    const toggleGroupModal = () => {
        setIsGroupModalOpen(!isGoupModalOpen);
        setGroupChatName("");
        setSelectedUsersId([]);
    };

    const toggleOneToOneModal = () => {
        setOneToOneModel(!oneToOneModel);
    };

    const toggleUpdateModal = () => {
        setisUpdateGroupOpen(!isUpdateGroupOpen);
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

            const userStatusUpdateHandler = ({ userId, status }) => {
                const updatedStatuses = {
                    ...userStatuses,
                    [userId]: status,
                };

                dispatch(setUserStatusesAction(updatedStatuses));
            };

            const receivedMessageHandler = (data) => {};

            const disconnectHandler = () => {
                // console.log("Socket disconnected");
            };

            socket.on("user-left", (data) => {
                fetchChatLists();
            });

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

            socket.on("setup-complete", setupCompleteHandler);
            socket.on("user-status-update", userStatusUpdateHandler);
            socket.on("received-message", receivedMessageHandler);

            socket.on("disconnect", disconnectHandler);
            socket.on("delete-group-chat", (data) => {
                // console.log("chat", data);
            });

            socket.on("deleted-chat", (data) => {
                // console.log("chat", data);
            });
            socket.on("leave-group-chat", (data) => {
                // console.log("chat", data);
            });
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.addEventListener("beforeunload", handleBeforeUnload);

            return () => {
                socket.off("setup-complete", setupCompleteHandler);
                socket.off("user-status-update", userStatusUpdateHandler);
                socket.off("received-message", receivedMessageHandler);
                socket.off("disconnect", disconnectHandler);
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
                window.removeEventListener("beforeunload", handleBeforeUnload);
                if (userId) {
                    socket.emit("user-offline", userId);
                }
            };
        } else {
            socket.emit("user-offline", userId);
        }
    }, [userId, socket]);

    const handleChatClick = (chat) => {
        setSearchQuery("");
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

        dispatch(setCurrentOtherUserAction(chat));
    };

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
        } catch (error) {
            console.error("Error fetching chat lists:", error.message);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUsers();
        }
    }, [userId]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const userResponse = await axiosInstance.post(
                "userService/user/view",
                {
                    departmentId: userData?.isCoreTeam ==="0"? (userData?.departmentId || "").split(',').map(id => id.trim())  :null,
                }
            );

            if (userResponse?.data) {
                const { rows, count } = userResponse?.data?.data;
                const newData = rows?.filter((user) => user?.id !== userId);
                setUsers(newData);
            }
        } catch (error) {
            console.error("Error fetching users and documents:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // const fetchArchivedChatLists = async () => {
    //   try {
    //     const [personalChatResponse, groupChatResponse] = await Promise.all([
    //       axiosInstance.post("chatservice/chat/getPersonalChatList", {
    //         userId,
    //         chatListType: "archived",
    //       }),
    //       axiosInstance.post("chatservice/chat/getGroupChatList", {
    //         userId,
    //         isCoreUser,
    //         chatListType: "archived",
    //       }),
    //     ]);

    //     const personalChatUnseenCounts = personalChatResponse?.data?.data || [];
    //     const groupChatUnseenCounts = groupChatResponse?.data?.data || [];

    //     setArchivePersonalChatList(personalChatUnseenCounts);
    //     setArchiveGroupChatList(groupChatUnseenCounts);
    //     setSearchQuery("");
    //   } catch (error) {
    //     console.error("Error fetching chat lists:", error.message);
    //   }
    // };

    // const fetchFavChatLists = async () => {
    //   try {
    //     const [personalChatResponse, groupChatResponse] = await Promise.all([
    //       axiosInstance.post("chatservice/chat/getPersonalChatList", {
    //         userId,
    //         chatListType: "favorite",
    //       }),
    //       axiosInstance.post("chatservice/chat/getGroupChatList", {
    //         userId,
    //         isCoreUser,
    //         chatListType: "favorite",
    //       }),
    //     ]);

    //     const personalChatUnseenCounts = personalChatResponse?.data?.data || [];
    //     const groupChatUnseenCounts = groupChatResponse?.data?.data || [];

    //     setFavPersonalChatList(personalChatUnseenCounts);
    //     setFavGroupChatList(groupChatUnseenCounts);
    //     setSearchQuery("");
    //   } catch (error) {
    //     console.error("Error fetching chat lists:", error.message);
    //   }
    // };

    const handleUserSelectForGroup = (userId) => {
        if (selectedUsersId?.includes(userId)) {
            setSelectedUsersId(selectedUsersId.filter((id) => id !== userId));
        } else {
            setSelectedUsersId([...selectedUsersId, userId]);
        }
        setSearchQuery("");
    };

    const handleCreateGroupChat = () => {
        const newselectedUsersId = [...selectedUsersId, userId];
        const sortedParticipants = newselectedUsersId.sort((a, b) => a - b);
        const data = {
            chatName: groupChatName,
            isGroup: 1,
            participants: sortedParticipants,
            createdBy: userId,
        };
        handleCreateChat(data);
        setSearchQuery("");
        fetchChatLists();
    };

    const handleCreateOneOnOneChat = (id) => {
        const participantIds = [id];
        const newselectedUsersId = [...participantIds, userId];
        const sortedParticipants = newselectedUsersId.sort((a, b) => a - b);

        const data = {
            chatName: null,
            isGroup: 0,
            participants: sortedParticipants,
            createdBy: userId,
        };
        handleCreateChat(data);
        setSearchQuery("");
    };

    const handleCreateChat = async (data) => {
        try {
            const response = await axiosInstance.post(
                `chatservice/chat/createChat`,
                data
            );
            if (response?.data) {
                fetchChatLists();
                if (response.data.data) {
                    setNewChatValue(response.data.data.dataValues);
                }
                socket.emit("chat-create", response.data.data.dataValues);
                setOneToOneModel(false);
                setIsGroupModalOpen(false);
                setSelectedUsersId([]);
                setGroupChatName("");
                setSearchQuery("");
                fetchChatLists();
                // fetchArchivedChatLists();
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleUpdateChatToggle = () => {
        setGroupChatName(currentOtherUser?.chatName);
        const participants = currentOtherUser?.participantsDetails;
        const participantIds = participants.map(
            (participant) => participant.id
        );
        setSelectedUsersId(participantIds);
        toggleUpdateModal();
    };

    const updateChatSubmit = () => {
        const sortedParticipants = selectedUsersId.sort((a, b) => a - b);
        const data = {
            chatId: currentOtherUser?.id,
            chatName: groupChatName,
            participants: sortedParticipants,
            createdBy: userId,
        };
        handleUpdateChat(data);
    };

    const handleUpdateChat = async (data) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `chatservice/chat/updateChat`,
                data
            );

            if (response?.data) {
                fetchChatLists();
                setIsLoading(false);
                if (response.data.data) {
                    setNewChatValue(response.data.data);
                }
                toggleUpdateModal();
                setSelectedUsersId([]);
                setGroupChatName("");
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    const deleteGroupChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This Chat and Its all message will be deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/deleteGroupChat`,
                    data
                );
                if (response?.data) {
                    toast.success("Chat delete successfully");
                    socket.emit("delete-group-chat", {
                        chatId: currentOtherUser.id,
                        participants: currentOtherUser.participants,
                        userId: userId,
                    });
                    fetchChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error deleting chat:", error.message);
            }
        }
    };

    const handleArchiveChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to archive this chat",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, archive it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                    userId: userId,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/archiveChat`,
                    data
                );
                if (response?.data) {
                    toast.success("Chat archived successfully");
                    fetchChatLists();
                    // fetchArchivedChatLists();
                    // fetchFavChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error archiving chat:", error.message);
            }
        }
    };

    const handleUnArchiveChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to unarchive this chat",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, unarchive it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                    userId: userId,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/unarchiveChat`,
                    data
                );
                if (response?.data) {
                    toast.success("Chat unarchived successfully");
                    fetchChatLists();
                    // fetchArchivedChatLists();
                    // fetchFavChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error unarchiving chat:", error.message);
            }
        }
    };

    const handleFavouriteChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to favourite this chat",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, favourite it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                    userId: userId,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/favouriteChat`,
                    data
                );
                if (response?.data) {
                    toast.success("Chat favourite successfully");
                    fetchChatLists();
                    // fetchArchivedChatLists();
                    // fetchFavChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error favouriting chat:", error.message);
            }
        }
    };

    const handleUnfavouriteChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to unfavourite this chat",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, unfavourite it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                    userId: userId,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/unfavouriteChat`,
                    data
                );
                if (response?.data) {
                    toast.success("Chat unfavourite successfully");
                    fetchChatLists();
                    // fetchArchivedChatLists();
                    // fetchFavChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error unfavouriting chat:", error.message);
            }
        }
    };

    const leavechat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to leave this chat",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, leave group!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentOtherUser.id,
                    userId: userId,
                };
                setIsLoading(true);
                const response = await axiosInstance.post(
                    `/chatservice/chat/leavechat`,
                    data
                );
                if (response?.data) {
                    toast.success("Leave chat successfully");
                    socket.emit("leave-group-chat", {
                        chatId: currentOtherUser.id,
                        userId: userId,
                    });
                    fetchChatLists();
                    setIsLoading(false);
                    dispatch(setCurrentOtherUserAction(null));
                }
            } catch (error) {
                setIsLoading(false);
                console.error("Error deleting chat:", error.message);
            }
        }
    };

    useEffect(() => {
        if (!newChatValue) return;

        const groupChatMap = new Map(
            groupChatUnseenCounts.map((chat) => [chat.id, chat])
        );
        const personalChatMap = new Map(
            personalChatUnseenCounts.map((chat) => [chat.id, chat])
        );

        const chatMap = newChatValue.isGroup ? groupChatMap : personalChatMap;
        const chat = chatMap.get(newChatValue.id);

        if (chat) {
            dispatch(setCurrentOtherUserAction(chat));
            setNewChatValue(null);
        }
    }, [newChatValue, personalChatUnseenCounts, groupChatUnseenCounts]);

    // const handleClickChat = (chat) => {
    //     setCurrentOtherUser(chat);
    //     setSearchQuery("");
    // };

    return (
        <React.Fragment>
            {isLoading ? (
                <div className="page-content">
                    <Container fluid>
                        <div className="centerloader">
                            <LoaderSpin></LoaderSpin>
                        </div>
                    </Container>
                </div>
            ) : (
                <>
                    <div className="page-content">
                        <Container fluid>
                            {/* <DepartmentUserInfo /> */}
                            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1 overflow-hidden">
                                <div className="chat-leftsidebar">
                                    <div className="px-4 pt-4 mb-4">
                                        <div className="d-flex align-items-start">
                                            <div className="flex-grow-1">
                                                <h5 className="mb-4">
                                                    Message
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="search-box">
                                            <input
                                                type="text"
                                                className="form-control bg-light border-light"
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
                                                        key={chat?.id}
                                                        onClick={() =>
                                                            handleChatClick(
                                                                chat
                                                            )
                                                        }
                                                        action>
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
                                                                                chat
                                                                                    ?.user
                                                                                    ?.profileImagePath
                                                                            }
                                                                            className="rounded-circle img-fluid userprofile"
                                                                            alt={
                                                                                chat
                                                                                    ?.user
                                                                                    ?.name
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1 overflow-hidden">
                                                                <p className="text-truncate mb-0">
                                                                    {chat?.user
                                                                        ?.name &&
                                                                        ` ${chat.user?.name}`}
                                                                </p>
                                                                <p className="text-truncate mb-0">
                                                                    {chat?.chatName &&
                                                                        `${chat?.chatName}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </ListGroupItem>
                                                ))}
                                        </ListGroup>
                                        <Nav
                                            tabs
                                            className="nav nav-tabs nav-tabs-custom nav-success nav-justified mb-3">
                                            <NavItem>
                                                <NavLink
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    className={classnames({
                                                        active:
                                                            customActiveTab ===
                                                            "1",
                                                    })}
                                                    onClick={() => {
                                                        toggleCustom("1");
                                                    }}>
                                                    All
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    className={classnames({
                                                        active:
                                                            customActiveTab ===
                                                            "2",
                                                    })}
                                                    onClick={() => {
                                                        toggleCustom("2");
                                                    }}>
                                                    Archive
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    className={classnames({
                                                        active:
                                                            customActiveTab ===
                                                            "3",
                                                    })}
                                                    onClick={() => {
                                                        toggleCustom("3");
                                                    }}>
                                                    Favourite
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent
                                            activeTab={customActiveTab}
                                            className="text-muted">
                                            <TabPane tabId="1" id="chats">
                                                <SimpleBar className="chat-room-list pt-3">
                                                    <div className="d-flex align-items-center px-4 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Direct Messages
                                                            </h4>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <Button
                                                                title="New Message"
                                                                onClick={() =>
                                                                    toggleOneToOneModal()
                                                                }
                                                                color="success"
                                                                size="sm"
                                                                className="btn btn-soft-success btn-sm shadow-none">
                                                                <i className="ri-add-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list users-list"
                                                            id="userList">
                                                            {/* {console.log(personalChatList)} */}
                                                            {personalChatUnseenCounts &&
                                                                personalChatUnseenCounts.length >
                                                                    0 &&
                                                                personalChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isArchiveChat =
                                                                                chat?.archiveBy
                                                                                    ? JSON.parse(
                                                                                          chat?.archiveBy
                                                                                      )
                                                                                    : [];
                                                                            return isArchiveChat?.length >
                                                                                0
                                                                                ? isArchiveChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? false
                                                                                    : true
                                                                                : true;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            user,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        user
                                                                                    )
                                                                                }>
                                                                                {/* {console.log(user)} */}
                                                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                                                    <div className="avatar-xxs">
                                                                                        <img
                                                                                            src={
                                                                                                user
                                                                                                    ?.user
                                                                                                    ?.profileImagePath
                                                                                            }
                                                                                            className="avatar-title rounded-circle bg-info userprofile"
                                                                                            alt="Profile"
                                                                                        />

                                                                                        {renderUserStatus(
                                                                                            user
                                                                                                ?.user
                                                                                                ?.id
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-grow-1 overflow-hidden">
                                                                                    <p className="text-truncate mb-0">
                                                                                        {
                                                                                            user
                                                                                                .user
                                                                                                ?.name
                                                                                        }
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
                                                                                    {/* {console.log(user.unseenCount)} */}
                                                                                    <Badge
                                                                                        className="text-light"
                                                                                        color="red">
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
                                                                            </li>
                                                                        )
                                                                    )}
                                                        </ul>
                                                    </div>
                                                    <div className="d-flex align-items-center px-4 mt-4 pt-2 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Group
                                                            </h4>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <Button
                                                                title="Create Group"
                                                                onClick={() =>
                                                                    toggleGroupModal()
                                                                }
                                                                color="success"
                                                                className="btn btn-soft-success btn-sm shadow-none"
                                                                size="sm">
                                                                <i className="ri-add-line align-bottom"></i>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list mb-0 users-list"
                                                            id="channelList">
                                                            {groupChatUnseenCounts &&
                                                                groupChatUnseenCounts.length >
                                                                    0 &&
                                                                groupChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isArchiveChat =
                                                                                chat?.archiveBy
                                                                                    ? JSON.parse(
                                                                                          chat?.archiveBy
                                                                                      )
                                                                                    : [];
                                                                            return isArchiveChat?.length >
                                                                                0
                                                                                ? isArchiveChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? false
                                                                                    : true
                                                                                : true;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            group,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                key={
                                                                                    index
                                                                                }
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        group
                                                                                    )
                                                                                }>
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
                                                                                        {
                                                                                            group?.chatName
                                                                                        }
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
                                                                                        color="red">
                                                                                        {group?.unseenCount >
                                                                                        0 ? (
                                                                                            <div className="notification-badge">
                                                                                                {" "}
                                                                                                {
                                                                                                    group.unseenCount
                                                                                                }{" "}
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </Badge>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    )}
                                                        </ul>
                                                    </div>
                                                </SimpleBar>
                                            </TabPane>
                                            <TabPane tabId="2" id="contacts">
                                                <SimpleBar
                                                    className="chat-room-list pt-3"
                                                    style={{
                                                        margin: "-16px 0px 0px",
                                                    }}>
                                                    <div className="d-flex align-items-center px-4 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Direct Messages
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list users-list"
                                                            id="userList">
                                                            {personalChatUnseenCounts &&
                                                            personalChatUnseenCounts.length >
                                                                0 ? (
                                                                personalChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isArchiveChat =
                                                                                chat?.archiveBy
                                                                                    ? JSON.parse(
                                                                                          chat?.archiveBy
                                                                                      )
                                                                                    : [];
                                                                            return isArchiveChat?.length >
                                                                                0
                                                                                ? isArchiveChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? true
                                                                                    : false
                                                                                : false;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            user,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        user
                                                                                    )
                                                                                }>
                                                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                                                    <div className="avatar-xxs">
                                                                                        <img
                                                                                            src={
                                                                                                user
                                                                                                    ?.user
                                                                                                    ?.profileImagePath
                                                                                            }
                                                                                            className="avatar-title rounded-circle bg-info userprofile"
                                                                                            alt="Profile"
                                                                                        />

                                                                                        {renderUserStatus(
                                                                                            user
                                                                                                ?.user
                                                                                                ?.id
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-grow-1 overflow-hidden">
                                                                                    <p className="text-truncate mb-0">
                                                                                        {
                                                                                            user
                                                                                                .user
                                                                                                ?.name
                                                                                        }
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
                                                                                    {/* {console.log(user?.unseenCount)} */}
                                                                                    <Badge
                                                                                        className="text-light"
                                                                                        color="red">
                                                                                        {user?.unseenCount >
                                                                                        0 ? (
                                                                                            <div className="notification-badge">
                                                                                                {" "}
                                                                                                {
                                                                                                    user?.unseenCount
                                                                                                }
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </Badge>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <div className="text-center text-muted mt-3">
                                                                    No archive
                                                                    chats
                                                                </div>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="d-flex align-items-center px-4 mt-4 pt-2 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Group
                                                            </h4>
                                                        </div>
                                                    </div>

                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list mb-0 users-list"
                                                            id="channelList">
                                                            {groupChatUnseenCounts &&
                                                            groupChatUnseenCounts.length >
                                                                0 ? (
                                                                groupChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isArchiveChat =
                                                                                chat?.archiveBy
                                                                                    ? JSON.parse(
                                                                                          chat?.archiveBy
                                                                                      )
                                                                                    : [];
                                                                            return isArchiveChat?.length >
                                                                                0
                                                                                ? isArchiveChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? true
                                                                                    : false
                                                                                : false;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            group,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                key={
                                                                                    index
                                                                                }
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        group
                                                                                    )
                                                                                }>
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
                                                                                        {
                                                                                            group?.chatName
                                                                                        }
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
                                                                                        color="red">
                                                                                        {group?.unseenCount >
                                                                                        0 ? (
                                                                                            <div className="notification-badge">
                                                                                                {" "}
                                                                                                {
                                                                                                    group.unseenCount
                                                                                                }{" "}
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </Badge>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <div className="text-center text-muted mt-3">
                                                                    No archive
                                                                    chats
                                                                </div>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </SimpleBar>
                                            </TabPane>
                                            <TabPane tabId="3" id="Fav">
                                                <SimpleBar className="chat-room-list pt-3">
                                                    <div className="d-flex align-items-center px-4 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Direct Messages
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list users-list"
                                                            id="userList">
                                                            {personalChatUnseenCounts &&
                                                            personalChatUnseenCounts.length >
                                                                0 ? (
                                                                personalChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isFavChat =
                                                                                chat?.favouriteBy
                                                                                    ? JSON.parse(
                                                                                          chat?.favouriteBy
                                                                                      )
                                                                                    : [];
                                                                            return isFavChat?.length >
                                                                                0
                                                                                ? isFavChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? true
                                                                                    : false
                                                                                : false;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            user,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        user
                                                                                    )
                                                                                }>
                                                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                                                    <div className="avatar-xxs">
                                                                                        <img
                                                                                            src={
                                                                                                user
                                                                                                    ?.user
                                                                                                    ?.profileImagePath
                                                                                            }
                                                                                            className="avatar-title rounded-circle bg-info userprofile"
                                                                                            alt="Profile"
                                                                                        />

                                                                                        {renderUserStatus(
                                                                                            user
                                                                                                ?.user
                                                                                                ?.id
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-grow-1 overflow-hidden">
                                                                                    <p className="text-truncate mb-0">
                                                                                        {
                                                                                            user
                                                                                                .user
                                                                                                ?.name
                                                                                        }
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
                                                                                    {/* {console.log(user?.unseenCount)} */}
                                                                                    <Badge
                                                                                        className="text-light"
                                                                                        color="red">
                                                                                        {user?.unseenCount >
                                                                                        0 ? (
                                                                                            <div className="notification-badge">
                                                                                                {" "}
                                                                                                {
                                                                                                    user?.unseenCount
                                                                                                }
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </Badge>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <div className="text-center text-muted mt-3">
                                                                    No favourite
                                                                    chats
                                                                </div>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="d-flex align-items-center px-4 mt-4 pt-2 mb-2">
                                                        <div className="flex-grow-1">
                                                            <h4 className="mb-0 fs-11 text-muted text-uppercase">
                                                                Group
                                                            </h4>
                                                        </div>
                                                    </div>

                                                    <div className="chat-message-list">
                                                        <ul
                                                            className="list-unstyled chat-list chat-user-list mb-0 users-list"
                                                            id="channelList">
                                                            {groupChatUnseenCounts &&
                                                            groupChatUnseenCounts.length >
                                                                0 ? (
                                                                groupChatUnseenCounts
                                                                    .filter(
                                                                        (
                                                                            chat
                                                                        ) => {
                                                                            let isFavChat =
                                                                                chat?.favouriteBy
                                                                                    ? JSON.parse(
                                                                                          chat?.favouriteBy
                                                                                      )
                                                                                    : [];
                                                                            return isFavChat?.length >
                                                                                0
                                                                                ? isFavChat.includes(
                                                                                      userId
                                                                                  )
                                                                                    ? true
                                                                                    : false
                                                                                : false;
                                                                        }
                                                                    )
                                                                    .map(
                                                                        (
                                                                            group,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                className="d-flex align-items-center cursor-pointer"
                                                                                key={
                                                                                    index
                                                                                }
                                                                                onClick={() =>
                                                                                    handleChatClick(
                                                                                        group
                                                                                    )
                                                                                }>
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
                                                                                        {
                                                                                            group?.chatName
                                                                                        }
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
                                                                                        color="red">
                                                                                        {group?.unseenCount >
                                                                                        0 ? (
                                                                                            <div className="notification-badge">
                                                                                                {" "}
                                                                                                {
                                                                                                    group.unseenCount
                                                                                                }{" "}
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </Badge>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <div className="text-center text-muted mt-3">
                                                                    {" "}
                                                                    No favourite
                                                                    chats{" "}
                                                                </div>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </SimpleBar>
                                            </TabPane>
                                        </TabContent>
                                    </div>
                                </div>
                                <Chat
                                    chatMessages={chatMessages}
                                    setChatMessages={setChatMessages}
                                    socket={socket}
                                    userId={userId}
                                    currentUser={currentOtherUser}
                                    handleUpdateChatToggle={
                                        handleUpdateChatToggle
                                    }
                                    userStatuses={userStatuses}
                                    deleteGroupChat={deleteGroupChat}
                                    leavechat={leavechat}
                                    handleArchiveChat={handleArchiveChat}
                                    handleUnArchiveChat={handleUnArchiveChat}
                                    handleFavouriteChat={handleFavouriteChat}
                                    handleUnfavouriteChat={
                                        handleUnfavouriteChat
                                    }
                                />
                            </div>
                        </Container>
                    </div>

                    <CreatePersonalChat
                        isOpen={oneToOneModel}
                        toggle={toggleOneToOneModal}
                        users={users}
                        handleCreateOneOnOneChat={handleCreateOneOnOneChat}
                    />
                    <CreateGroupChat
                        isOpen={isGoupModalOpen}
                        toggle={toggleGroupModal}
                        users={users}
                        groupChatName={groupChatName}
                        setGroupChatName={setGroupChatName}
                        selectedUsersId={selectedUsersId}
                        setSelectedUsersId={setSelectedUsersId}
                        handleUserSelectForGroup={handleUserSelectForGroup}
                        handleCreateGroupChat={handleCreateGroupChat}
                    />
                    <UpdateGroup
                        isOpen={isUpdateGroupOpen}
                        toggle={toggleUpdateModal}
                        users={users}
                        groupChatName={groupChatName}
                        setGroupChatName={setGroupChatName}
                        selectedUsersId={selectedUsersId}
                        setSelectedUsersId={setSelectedUsersId}
                        handleUserSelectForGroup={handleUserSelectForGroup}
                        updateChatSubmit={updateChatSubmit}
                    />
                </>
            )}
        </React.Fragment>
    );
};

export default Messages;
