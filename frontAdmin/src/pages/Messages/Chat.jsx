import React, { useState, useEffect, useRef, useContext } from "react";
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Input,
    Row,
    Col,
} from "reactstrap";

import { Formik } from "formik";
import ProfileModal from "./Models/ProfileModel";
import GroupInfoModel from "./Models/GroupInfoModel";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { MdAttachFile } from "react-icons/md";
import { IoDocumentTextSharp } from "react-icons/io5";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import SimpleBar from "simplebar-react";
import Picker from "emoji-picker-react";
import { Fancybox } from "@fancyapps/ui";
import { Info, MoreVertical } from "feather-icons-react/build/IconComponents";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import {
    setPersonalChatUnseenCountsAction,
    setGroupChatUnseenCountsAction,
    setCurrentOtherUserAction
} from "../../slices/layouts/reducer";

function debounce(func, wait) {
    let timeout;
    function debounced(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    }
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
}

const validationSchema = Yup.object({
    messageInput: Yup.string().required("Please enter a message"),
    file: Yup.mixed()
        .nullable()
        .test(
            "fileSize",
            "File size is too large",
            (value) => !value || (value && value.size <= 5242880)
        )
        .test(
            "fileFormat",
            "Unsupported File Format",
            (value) =>
                !value ||
                [
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "application/pdf",
                ].includes(value?.type)
        ),
});

const Chat = ({
    chatMessages,
    setChatMessages,
    socket,
    userId,
    currentUser,
    handleUpdateChatToggle,
    deleteGroupChat,
    leavechat,
    userStatuses,
    handleArchiveChat,
    handleUnArchiveChat,
    handleFavouriteChat,
    handleUnfavouriteChat,
}) => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch()
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [copiedMessage, setCopiedMessage] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [search_Menu, setsearch_Menu] = useState(false);
    const [currentMessageId, setCurrentMessageId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const prevUserIdRef = useRef();

    // const {
    //     // setPersonalChatUnseenCounts,
    //     // personalChatUnseenCounts,
    //     // setGroupChatUnseenCounts,
    //     // groupChatUnseenCounts,
    //     // userData
    // } = useContext(UnseenMessageContext);

    const userData = useSelector((state)=>( state.Layout.userData))
    const personalChatUnseenCounts = useSelector((state)=>( state.Layout.personalChatUnseenCounts))
    const groupChatUnseenCounts = useSelector((state)=>( state.Layout.groupChatUnseenCounts))

    const [dropdownOpen, setDropdownOpen] = useState({});

    const [showReply, setShowReply] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const chatContainerRef = useRef(null);
    const simpleBarRef = useRef(null);
    const [emojiPicker, setemojiPicker] = useState(false);
    const [emojiArray, setemojiArray] = useState("");
    const typingTimeoutRef = useRef(null);
    const typingDebounceRef = useRef(null);

    const [dropdownOpen2, setDropdownOpen2] = useState(false);
    const toggleDropdown2 = () => setDropdownOpen2((prevState) => !prevState);

    const renderUserStatus = (userId) => {
        const status = userStatuses[userId];
        if (!status) return <small className="text-warning">Offline</small>;

        if (status.online) {
            return <small className="text-success">Online</small>;
        } else if (status.away) {
            return <small className="text-warning">Offline</small>;
        } else{
            return <small className="text-warning">Offline</small>;
        }
    };

    useEffect(() => {
        // Initialize FancyBox with custom options
        Fancybox.bind('[data-fancybox="gallery"]', {
            loop: true,
            arrows: true,
            infobar: true,
            toolbar: true,
            // Custom toolbar button for download
            buttons: [
                "zoom",
                "slideShow",
                "fullScreen",
                "download", // Add download button
                "close",
            ],
            download: {
                // Custom download button
                title: "Download",
                click: (instance) => {
                    const downloadLink = instance.current.$slide
                        .find("[data-download-url]")
                        .attr("data-download-url");
                    if (downloadLink) {
                        window.open(downloadLink, "_blank");
                    }
                },
            },
        });
    }, []);

    const highlightSearchTerm = (content) => {
        if (!searchTerm.trim()) {
            return content;
        }

        const regex = new RegExp(`(${searchTerm})`, "gi");

        const parts = content.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} style={{ backgroundColor: "yellow" }}>
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const toggleSearch = () => {
        setsearch_Menu(!search_Menu);
    };

    useEffect(() => {
        const scrollToBottom = () => {
            if (simpleBarRef.current) {
                const scrollElement = simpleBarRef.current.getScrollElement();
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        };

        const timeoutId = setTimeout(scrollToBottom, 100);

        return () => clearTimeout(timeoutId);
    }, [chatMessages]);

    useEffect(() => {
        if (socket && currentUser) {
            const handleReceivedMessage = (data) => {
                if (data.chat.id === currentUser.id) {
                    if (data.message.content === null) {
                        debouncedFetchChatMessages();
                    } else {
                        setChatMessages((prevMessages) => [
                            ...prevMessages,
                            data.message,
                        ]);

                        // socket.emit("message-seen", {
                        //     userId,
                        //     chatId: currentUser.id,
                        //     senderId: data.message.senderId,
                        // });
                    }
                    handleMessageView();
                }
            };

            const handleMessagesSeenUpdated = ({ chatId, senderId }) => {
                if (chatId === currentUser.id && userId === senderId) {
                    debouncedFetchChatMessages();
                }
            };

            socket.on("received-message", handleReceivedMessage);

            socket.on("message-deleted", (data)=>{
                console.log(data, "delete");
                
                if (data?.chatData?.id === currentUser.id) {
                    fetchChatMessages();
                }
            });

            socket.on("messages-seen-updated", handleMessagesSeenUpdated);

            const debouncedFetchChatMessages = debounce(fetchChatMessages, 200);

            return () => {
                socket.off("received-message", handleReceivedMessage);
                socket.off("messages-seen-updated", handleMessagesSeenUpdated);
                debouncedFetchChatMessages.cancel();
            };
        }
    }, [currentUser?.id]);

    const handleImageClick = () => {
        setIsImageOpen(!isImageOpen);
    };

    const handleDownload = (url, filename) => {
        const fileExtension = url.substring(url.lastIndexOf(".") + 1);
        const downloadedFileName = `${
            filename ? filename : "file"
        }.${fileExtension}`;

        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", downloadedFileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch((error) => console.error("Error downloading file:", error));
    };

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            sendFileMessage(event.target.files[0]);

            event.target.value = "";
        }
    };

    const handleIconClick = (event) => {
        event.preventDefault();
        fileInputRef.current.click();
    };

    const togglereply = (message) => {
        setShowReply(true);
        setReplyMessage(message);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 0);
    };

    useEffect(() => {
        if (searchTerm.trim()) {
            const results = chatMessages
                .map((message, index) => ({ ...message, index }))
                .filter(
                    (message) =>
                        message.content &&
                        message.content
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                );

            setSearchResults(results);
            setCurrentSearchIndex(results.length > 0 ? 0 : -1);
        } else {
            setSearchResults([]);
            setCurrentSearchIndex(-1);
        }
    }, [searchTerm, chatMessages]);

    useEffect(() => {
        if (currentSearchIndex !== -1 && searchResults.length > 0) {
            const messageIndex = searchResults[currentSearchIndex].index;
            const messageElement = document.getElementById(
                `message-${messageIndex}`
            );

            if (messageElement && simpleBarRef.current) {
                const simpleBarInstance =
                    simpleBarRef.current.getScrollElement();

                const elementTop = messageElement.offsetTop;
                const containerTop = simpleBarInstance.scrollTop;
                const elementHeight = messageElement.offsetHeight;
                const containerHeight = simpleBarInstance.clientHeight;

                // Ensure the element is scrolled into view
                if (elementTop < containerTop) {
                    simpleBarInstance.scrollTop = elementTop; // Scroll up
                } else if (
                    elementTop + elementHeight >
                    containerTop + containerHeight
                ) {
                    simpleBarInstance.scrollTop =
                        elementTop - containerHeight + elementHeight; // Scroll down
                }
            }
        }
    }, [currentSearchIndex, searchResults]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowDown") {
                setCurrentSearchIndex((prevIndex) =>
                    Math.min(prevIndex + 1, searchResults.length - 1)
                );
            } else if (event.key === "ArrowUp") {
                setCurrentSearchIndex((prevIndex) =>
                    Math.max(prevIndex - 1, 0)
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [searchResults]);

    const handleClose = () => {
        setShowReply(false);
        setReplyMessage("");
    };

    const toggleDropdown = (index) => {
        setDropdownOpen((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const toggleGroup = () => {
        setIsGroupOpen(!isGroupOpen);
    };

    const handleUpdateChat = (from) => {
        if (!from) {
            toggleGroup();
        }
        handleUpdateChatToggle();
    };
    const handleDeleChat = (from) => {
        if (!from) {
            toggleGroup();
        }
        deletePersonalChat();
    };

    const archive = () => {
        handleArchiveChat();
    };

    const unarchive = () => {
        handleUnArchiveChat();
    };

    const favchat = () => {
        handleFavouriteChat();
    };

    const unfavchat = () => {
        handleUnfavouriteChat();
    };
    const handleDeleteGroupChat = (from) => {
        if (!from) {
            toggleGroup();
        }
        deleteGroupChat();
    };

    const handleLeaveGroupChat = (from) => {
        if (!from) {
            toggleGroup();
        }
        leavechat();
    };

    const handleEditClick = (message) => {
        setNewMessage(message.content);
        setCurrentMessageId(message.id);
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setNewMessage("");
        setCurrentMessageId(null);
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        await sendTextMessage();
        await fetchChatMessages();
        await sendFileMessage();
        setemojiPicker(false);
    };

    const sendFileMessage = async (file) => {
        if (!file) {
            return;
        }
        try {
            const formData = new FormData();
            formData.append("viewDocumentName", file.name);
            formData.append("documentFile", file);
            formData.append("isGenerated", "0");
            formData.append("isShowInDocument", "0");

            const fileResponse = await axiosInstance.post(
                "documentService/uploading",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const uploadedFile = fileResponse.data.data[0];
            const attachmentId = uploadedFile.id;
            const attachmentType = uploadedFile.documentType;

            const data = {
                chatId: currentUser.id,
                senderId: userId,
                attachmentId,
                attachmentType,
                seenBy: null,
                replyMessage: showReply ? replyMessage.id : null,
            };

            const response = await axiosInstance.post(
                "/chatservice/chat/createChatMessage",
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data) {
                const newMessage = response.data.data;

                const message = {
                    chat: currentUser,
                    message: newMessage,
                    senderName: userData?.name
                };

                fetchChatMessages();
                setMessageInput("");
                setShowReply(false);
                setReplyMessage("");

                socket.emit("new-message", message);

                if (currentUser.isGroup) {
                    const updatedGroupChatUnseenCounts = groupChatUnseenCounts?.map((chat) =>
                        chat.id === currentUser.id
                            ? { ...chat, lastMessage: newMessage?.attachmentType }
                            : chat
                    );
                    dispatch(setGroupChatUnseenCountsAction(updatedGroupChatUnseenCounts));
                } else {
                    const updatedPersonalChatUnseenCounts = personalChatUnseenCounts?.map((chat) =>
                        chat.id === currentUser.id
                            ? { ...chat, lastMessage: newMessage?.attachmentType }
                            : chat
                    );
                    dispatch(setPersonalChatUnseenCountsAction(updatedPersonalChatUnseenCounts));
                }
                
            } else {
                throw new Error("Failed to create chat message");
            }
        } catch (error) {
            console.error("Error sending file:", error.message);
            toast.error("Failed to send file");
        }
    };

    const sendTextMessage = async () => {
        if (!messageInput.trim()) {
            return;
        }
        try {
            const data = {
                chatId: currentUser.id,
                senderId: userId,
                content: messageInput,
                seenBy: null,
                replyMessage: showReply ? replyMessage.id : null,
            };

            const response = await axiosInstance.post(
                "/chatservice/chat/createChatMessage",
                data
            );

            if (response?.data) {
                const newMessage = response.data.data;

                const message = {
                    chat: currentUser,
                    message: newMessage,
                    senderName: userData?.name
                };

                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    newMessage,
                ]);

                socket.emit("new-message", message);
                setMessageInput("");
                setShowReply(false);
                setReplyMessage("");

                const updatedChat = {
                    ...currentUser,
                    lastMessage: newMessage?.content,
                    unseenCount: 0,
                };
                
                if (currentUser.isGroup) {
                    // Remove the old chat and update the group chat unseen counts
                    const updatedGroupChatUnseenCounts = groupChatUnseenCounts?.filter(
                        (chat) => chat.id !== currentUser.id
                    );
                
                    dispatch(setGroupChatUnseenCountsAction([
                        updatedChat,
                        ...updatedGroupChatUnseenCounts,
                    ]));
                } else {
                    // Remove the old chat and update the personal chat unseen counts
                    const updatedPersonalChatUnseenCounts = personalChatUnseenCounts?.filter(
                        (chat) => chat.id !== currentUser.id
                    );
                
                    dispatch(setPersonalChatUnseenCountsAction([
                        updatedChat,
                        ...updatedPersonalChatUnseenCounts,
                    ]));
                }
                
            } else {
                console.error(
                    "Failed to send message:",
                    response?.data.message
                );
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error.message);
            toast.error("Failed to send message");
        }
    };

    const fetchChatMessages = async () => {
        try {
            const data = {
                chatId: currentUser.id,
                userId: userId,
            };

            const response = await axiosInstance.post(
                "/chatservice/chat/getChatMessage",
                data
            );

            if (response?.data) {
                const { data } = response.data;
                setChatMessages(data);
                setLoading(false);
                // handleMessageView();
            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching messages:", error.message);
        }
    };

    const deleteMessage = async (messageId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This message will be deleted for all users",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    messageId: messageId,
                    userId: userId,
                };
                const response = await axiosInstance.post(
                    "/chatservice/chat/deleteChatMessage",
                    data
                );

                if (response?.data) {
                    toast.success("message deleted");
                    fetchChatMessages();
                    socket?.emit("message-delete", {chatData: currentUser, userId})
                } else {
                    console.error(
                        "Failed to fetch messages:",
                        response.data.message
                    );
                }
            } catch (error) {
                console.error("Error fetching messages:", error.message);
            }
        }
    };

    const deletePersonalChat = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "All messages will be clear!!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, clear it!",
        });

        if (result.isConfirmed) {
            try {
                const data = {
                    chatId: currentUser.id,
                    userId: userId,
                };

                setLoading(true);

                const response = await axiosInstance.post(
                    `/chatservice/chat/deleteChat`,
                    data
                );

                if (response?.data) {
                    toast.success("Chat cleared successfully");

                    socket.emit("deleted-chat", {
                        chatId: currentUser.id,
                        participants: currentUser.participants,
                        userId: userId,
                    });
                    setChatMessages([]);
                    if (currentUser.isGroup) {
                        // Update group chat unseen counts by setting lastMessage to null
                        const updatedGroupChatUnseenCounts = groupChatUnseenCounts?.map((chat) =>
                            chat.id === currentUser.id ? { ...chat, lastMessage: null } : chat
                        );
                        dispatch(setGroupChatUnseenCountsAction(updatedGroupChatUnseenCounts));
                    } else {
                        // Update personal chat unseen counts by setting lastMessage to null
                        const updatedPersonalChatUnseenCounts = personalChatUnseenCounts?.map((chat) =>
                            chat.id === currentUser.id ? { ...chat, lastMessage: null } : chat
                        );
                        dispatch(setPersonalChatUnseenCountsAction(updatedPersonalChatUnseenCounts));
                    }
                    
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
                console.error("Error deleting chat:", error.message);
            }
        }
    };

    const updateMessage = async (currentMessageId, newMessage) => {
        if (!newMessage.trim()) {
            return;
        }
        try {
            const data = {
                messageId: currentMessageId,
                content: newMessage,
                userId: userId,
                chatId: currentUser.id,
            };
            const response = await axiosInstance.post(
                "/chatservice/chat/updateChatMessage",
                data
            );

            if (response?.data) {
                fetchChatMessages();
                setNewMessage("");
                setIsEditing(false);
                setCurrentMessageId(null);
                toast.success("message updated");
            }
        } catch (error) {
            console.error("Error fetching messages:", error.message);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessage("Message copied to clipboard");
            setTimeout(() => setCopiedMessage(null), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.id) {
            if (prevUserIdRef.current !== currentUser.id) {
                fetchChatMessages();
                handleMessageView();
                prevUserIdRef.current = currentUser.id;
            }
        }
    }, [currentUser?.id]);

    const handleMessageView = () => {
        if (socket && currentUser) {
            socket.emit("message-seen", {
                userId,
                chatId: currentUser.id,
                senderId: userId,
            });
        }
    };

    const handleTyping = (e) => {
        setMessageInput(e.target.value);
    
        // Clear any existing typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    
        // Clear the debounce to avoid unnecessary emits
        if (typingDebounceRef.current) {
            clearTimeout(typingDebounceRef.current);
        }
    
        // Set a debounce to emit "isTyping: true" after 1 second
        typingDebounceRef.current = setTimeout(() => {
            socket.emit("typing", {
                userId: userId,
                userName: userData?.name,
                chatData: currentUser,
                isTyping: true,
            });
    
            // Set a timeout to emit "isTyping: false" after 3 seconds of no typing
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", {
                    userId: userId,
                    userName: userData?.name,
                    chatData: currentUser,
                    isTyping: false,
                });
            }, 3000); // No typing for 3 seconds
        }, 500); // Emit typing status after 1 second delay
    };

    const onEmojiClick = (event, emojiObject) => {
        setemojiArray([...emojiArray, emojiObject.emoji]);
        let emoji = [...emojiArray, emojiObject.emoji].join(" ");
        setMessageInput((prevInput) => prevInput + event.emoji);
    };
    return (
        <>
            {currentUser !== null && currentUser !== undefined ? (
                currentUser.isGroup === 0 ? (
                    <>
                        <div className="user-chat w-100 overflow-hidden user-chat-show">
                            <div className="chat-content d-lg-flex">
                                <div className="w-100 overflow-hidden position-relative">
                                    <div className="position-relative">
                                        <div className="p-3 user-chat-topbar bg-light">
                                            <Row className="align-items-center">
                                                <Col sm={4} xs={8}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0 d-block d-lg-none me-3">
                                                            <div className="user-chat-remove fs-18 p-1">
                                                                <span
                                                                    onClick={() =>dispatch(setCurrentOtherUserAction(null))}
                                                                    className="user-chat-remove fs-18 p-1 cursor-pointer">
                                                                    <i className="ri-arrow-left-s-line align-bottom"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-grow-1 overflow-hidden">
                                                            <div className="d-flex align-items-center">
                                                                <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                                    <img
                                                                        src={
                                                                            currentUser
                                                                                ?.user
                                                                                ?.profileImagePath
                                                                        }
                                                                        className="rounded-circle avatar-xs"
                                                                        alt=""
                                                                    />
                                                                    {/* <div className="user-status"></div> */}
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <h5 className="text-truncate mb-0 fs-16 cursor-pointer">
                                                                        <div
                                                                            className="text-reset username"
                                                                            onClick={
                                                                                toggleProfile
                                                                            }>
                                                                            {
                                                                                currentUser
                                                                                    ?.user
                                                                                    ?.name
                                                                            }
                                                                        </div>
                                                                    </h5>
                                                                    <p className="text-truncate text-muted fs-14 mb-0 userStatus">
                                                                        {renderUserStatus(
                                                                            currentUser
                                                                                ?.user
                                                                                ?.id
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col sm={8} xs={4}>
                                                    <ul className="list-inline user-chat-nav text-end mb-0">
                                                        <li className="list-inline-item m-0">
                                                            <Dropdown
                                                                isOpen={
                                                                    search_Menu
                                                                }
                                                                toggle={
                                                                    toggleSearch
                                                                }>
                                                                <DropdownToggle
                                                                    className="btn btn-ghost-secondary btn-icon"
                                                                    tag="button">
                                                                    <FeatherIcon
                                                                        icon="search"
                                                                        className="icon-sm"
                                                                    />
                                                                </DropdownToggle>
                                                                <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
                                                                    <div className="p-2">
                                                                        <div className="search-box">
                                                                            <Input
                                                                                value={
                                                                                    searchTerm
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setSearchTerm(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                type="text"
                                                                                className="form-control bg-light border-light"
                                                                                placeholder="Search here..."
                                                                                id="searchMessage"
                                                                            />
                                                                            <i className="ri-search-2-line search-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </li>
                                                        <li className="list-inline-item d-none d-lg-inline-block m-0">
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost-secondary btn-icon"
                                                                onClick={
                                                                    toggleProfile
                                                                }>
                                                                <Info
                                                                    width="24"
                                                                    height="24"
                                                                    className="feather feather-info icon-sm"
                                                                />
                                                            </button>
                                                        </li>
                                                        <li className="list-inline-item m-0">
                                                            <Dropdown
                                                                isOpen={
                                                                    dropdownOpen2
                                                                }
                                                                toggle={
                                                                    toggleDropdown2
                                                                }>
                                                                <DropdownToggle
                                                                    className="btn btn-ghost-secondary btn-icon"
                                                                    tag="button"
                                                                    data-bs-toggle="dropdown">
                                                                    <MoreVertical
                                                                        width="24"
                                                                        height="24"
                                                                        className="feather feather-more-vertical icon-sm"
                                                                    />
                                                                </DropdownToggle>
                                                                <DropdownMenu
                                                                    end>
                                                                    {(() => {
                                                                        const isFavourite =
                                                                            currentUser &&
                                                                            currentUser.favouriteBy
                                                                                ? currentUser.favouriteBy.includes(
                                                                                      userId
                                                                                  )
                                                                                : false;
                                                                        const isArchived =
                                                                            currentUser &&
                                                                            currentUser.archiveBy
                                                                                ? currentUser.archiveBy.includes(
                                                                                      userId
                                                                                  )
                                                                                : false;
                                                                        if (
                                                                            isFavourite
                                                                        ) {
                                                                            return null;
                                                                        }
                                                                        return isArchived ? (
                                                                            <DropdownItem
                                                                                onClick={() =>
                                                                                    unarchive(
                                                                                        true
                                                                                    )
                                                                                }>
                                                                                <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>{" "}
                                                                                UnArchive
                                                                            </DropdownItem>
                                                                        ) : (
                                                                            <DropdownItem
                                                                                onClick={() =>
                                                                                    archive(
                                                                                        true
                                                                                    )
                                                                                }>
                                                                                {" "}
                                                                                <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>{" "}
                                                                                Archive
                                                                            </DropdownItem>
                                                                        );
                                                                    })()}
                                                                    <DropdownItem
                                                                        onClick={() =>
                                                                            handleDeleChat(
                                                                                true
                                                                            )
                                                                        }>
                                                                        <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                                                                        Clear
                                                                        chat
                                                                    </DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </li>
                                                    </ul>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div
                                            className="position-relative"
                                            id="users-chat">
                                            {copiedMessage && (
                                                <div> {copiedMessage} </div>
                                            )}
                                            <div
                                                ref={chatContainerRef}
                                                className="chat-conversation p-3 p-lg-4 "
                                                id="chat-conversation">
                                                <SimpleBar ref={simpleBarRef}>
                                                    <ul
                                                        className="list-unstyled chat-conversation-list me-3 position-relative"
                                                        id="users-conversation">
                                                        {chatMessages.length >
                                                            0 &&
                                                            chatMessages.map(
                                                                (
                                                                    message,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        id={`message-${index}`}
                                                                        className={`chat-list ${
                                                                            message.senderId ===
                                                                            userId
                                                                                ? "right"
                                                                                : "left"
                                                                        }`}>
                                                                        <div className="conversation-list">
                                                                            {message.senderId !==
                                                                                userId && (
                                                                                <div className="chat-avatar">
                                                                                    <img
                                                                                        src={
                                                                                            currentUser
                                                                                                ?.user
                                                                                                ?.profileImagePath
                                                                                        }
                                                                                        alt="profile"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="user-chat-content">
                                                                                <div className="ctext-wrap">
                                                                                    {isEditing &&
                                                                                    currentMessageId ===
                                                                                        message.id ? (
                                                                                        <div>
                                                                                            <Input
                                                                                                type="text"
                                                                                                value={
                                                                                                    newMessage
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    setNewMessage(
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    )
                                                                                                }
                                                                                                className="mb-2"
                                                                                            />
                                                                                            <Button
                                                                                                color="primary"
                                                                                                onClick={() => {
                                                                                                    updateMessage(
                                                                                                        currentMessageId,
                                                                                                        newMessage
                                                                                                    );
                                                                                                }}
                                                                                                disabled={
                                                                                                    message.content ==
                                                                                                    newMessage
                                                                                                }
                                                                                                className="me-2">
                                                                                                Save
                                                                                            </Button>
                                                                                            <Button
                                                                                                color="secondary"
                                                                                                onClick={() =>
                                                                                                    handleCancelClick()
                                                                                                }>
                                                                                                {" "}
                                                                                                Cancel{" "}
                                                                                            </Button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            {message.replyMessage && (
                                                                                                <div className="ctext-wrap-content">
                                                                                                    <div className="replymessage-block mb-0 d-flex align-items-start">
                                                                                                        <div className="flex-grow-1">
                                                                                                            {chatMessages.find(
                                                                                                                (
                                                                                                                    msg
                                                                                                                ) =>
                                                                                                                    msg.id.toString() ===
                                                                                                                    message.replyMessage
                                                                                                            ) && (
                                                                                                                <>
                                                                                                                    {(() => {
                                                                                                                        const replyMsg =
                                                                                                                            chatMessages.find(
                                                                                                                                (
                                                                                                                                    msg
                                                                                                                                ) =>
                                                                                                                                    msg.id.toString() ===
                                                                                                                                    message.replyMessage
                                                                                                                            );

                                                                                                                        if (
                                                                                                                            replyMsg.content
                                                                                                                        ) {
                                                                                                                            return (
                                                                                                                                <p className="mb-0 ctext-content">
                                                                                                                                    {" "}
                                                                                                                                    {
                                                                                                                                        replyMsg.content
                                                                                                                                    }{" "}
                                                                                                                                </p>
                                                                                                                            );
                                                                                                                        } else if (
                                                                                                                            replyMsg.attachmentType
                                                                                                                        ) {
                                                                                                                            if (
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/jpeg" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/png" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/jpg" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/webp"
                                                                                                                            ) {
                                                                                                                                return (
                                                                                                                                    <div className="message-img mb-0">
                                                                                                                                        <div className="message-img-list">
                                                                                                                                            <a
                                                                                                                                                className="attachment popup-img d-inline-block"
                                                                                                                                                href={
                                                                                                                                                    message.documentUrl
                                                                                                                                                }
                                                                                                                                                data-fancybox="gallery"
                                                                                                                                                data-caption={
                                                                                                                                                    message.documentName
                                                                                                                                                }
                                                                                                                                                data-download-url={
                                                                                                                                                    message.documentUrl
                                                                                                                                                }
                                                                                                                                                data-download-name={
                                                                                                                                                    message.documentName
                                                                                                                                                }>
                                                                                                                                                <img
                                                                                                                                                    src={
                                                                                                                                                        replyMsg.documentUrl
                                                                                                                                                    }
                                                                                                                                                    className="rounded border"
                                                                                                                                                    alt="Attachment"
                                                                                                                                                />
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                );
                                                                                                                            } else {
                                                                                                                                return (
                                                                                                                                    <div className="">
                                                                                                                                        <a
                                                                                                                                            href={
                                                                                                                                                replyMsg.documentUrl
                                                                                                                                            }
                                                                                                                                            target="_blank"
                                                                                                                                            rel="noopener noreferrer">
                                                                                                                                            <IoDocumentTextSharp />{" "}
                                                                                                                                            {replyMsg.documentName ||
                                                                                                                                                "Attachment"}
                                                                                                                                        </a>
                                                                                                                                    </div>
                                                                                                                                );
                                                                                                                            }
                                                                                                                        }
                                                                                                                        return null;
                                                                                                                    })()}
                                                                                                                </>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {message.attachmentType &&
                                                                                                    (message.attachmentType ===
                                                                                                        "image/jpeg" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/png" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/jpg" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/webp" ||
                                                                                                        message.attachmentType ===
                                                                                                            "application/pdf") ? (
                                                                                                        <div className="attachment">
                                                                                                            {message.attachmentType ===
                                                                                                                "image/jpeg" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/png" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/jpg" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/webp" ? (
                                                                                                                <>
                                                                                                                    <img
                                                                                                                        src={
                                                                                                                            message.documentUrl
                                                                                                                        }
                                                                                                                        alt="Attachment"
                                                                                                                        className="img-fluid"
                                                                                                                        onClick={
                                                                                                                            handleImageClick
                                                                                                                        }
                                                                                                                    />

                                                                                                                    {isImageOpen && (
                                                                                                                        <div
                                                                                                                            className="image-overlay"
                                                                                                                            onClick={
                                                                                                                                handleImageClick
                                                                                                                            }>
                                                                                                                            <img
                                                                                                                                src={
                                                                                                                                    message.documentUrl
                                                                                                                                }
                                                                                                                                alt="Attachment"
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </>
                                                                                                            ) : (
                                                                                                                <a
                                                                                                                    href={
                                                                                                                        message.documentUrl
                                                                                                                    }
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer">
                                                                                                                    {" "}
                                                                                                                    <IoDocumentTextSharp />{" "}
                                                                                                                    {
                                                                                                                        message.documentName
                                                                                                                    }
                                                                                                                </a>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="">
                                                                                                            <p className="mb-0 ctext-content">
                                                                                                                {highlightSearchTerm(
                                                                                                                    message.content
                                                                                                                )}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}

                                                                                            {!message.replyMessage && (
                                                                                                <div>
                                                                                                    {message.attachmentType &&
                                                                                                    [
                                                                                                        "image/jpeg",
                                                                                                        "image/png",
                                                                                                        "image/jpg",
                                                                                                        "image/webp",
                                                                                                        "application/pdf",
                                                                                                    ].includes(
                                                                                                        message.attachmentType
                                                                                                    ) ? (
                                                                                                        <div className="message-img mb-0">
                                                                                                            <div className="message-img-list">
                                                                                                                {[
                                                                                                                    "image/jpeg",
                                                                                                                    "image/png",
                                                                                                                    "image/jpg",
                                                                                                                    "image/webp",
                                                                                                                ].includes(
                                                                                                                    message.attachmentType
                                                                                                                ) ? (
                                                                                                                    <a
                                                                                                                        className="attachment popup-img d-inline-block"
                                                                                                                        href={
                                                                                                                            message.documentUrl
                                                                                                                        }
                                                                                                                        data-fancybox="gallery"
                                                                                                                        data-caption={
                                                                                                                            message.documentName
                                                                                                                        }
                                                                                                                        data-download-url={
                                                                                                                            message.documentUrl
                                                                                                                        }
                                                                                                                        data-download-name={
                                                                                                                            message.documentName
                                                                                                                        }>
                                                                                                                        <img
                                                                                                                            src={
                                                                                                                                message.documentUrl
                                                                                                                            }
                                                                                                                            alt="Attachment"
                                                                                                                            className="rounded border"
                                                                                                                        />
                                                                                                                    </a>
                                                                                                                ) : (
                                                                                                                    <div className="ctext-wrap-content">
                                                                                                                        <a
                                                                                                                            href={
                                                                                                                                message.documentUrl
                                                                                                                            }
                                                                                                                            target="_blank"
                                                                                                                            rel="noopener noreferrer">
                                                                                                                            <IoDocumentTextSharp />{" "}
                                                                                                                            {
                                                                                                                                message.documentName
                                                                                                                            }
                                                                                                                        </a>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="ctext-wrap-content">
                                                                                                            <p className="mb-0 ctext-content">
                                                                                                                {" "}
                                                                                                                {highlightSearchTerm(
                                                                                                                    message.content
                                                                                                                )}{" "}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}

                                                                                            <div className="dropdown align-self-start message-box-drop">
                                                                                                <Dropdown
                                                                                                    isOpen={
                                                                                                        dropdownOpen[
                                                                                                            index
                                                                                                        ] ||
                                                                                                        false
                                                                                                    }
                                                                                                    toggle={() =>
                                                                                                        toggleDropdown(
                                                                                                            index
                                                                                                        )
                                                                                                    }>
                                                                                                    <DropdownToggle
                                                                                                        tag="div"
                                                                                                        className="dropdown-toggle cursor-pointer"
                                                                                                        aria-expanded={
                                                                                                            dropdownOpen[
                                                                                                                index
                                                                                                            ]
                                                                                                        }>
                                                                                                        <i className="ri-more-2-fill"></i>
                                                                                                    </DropdownToggle>
                                                                                                    <DropdownMenu
                                                                                                        end>
                                                                                                        <DropdownItem
                                                                                                            onClick={() =>
                                                                                                                togglereply(
                                                                                                                    message
                                                                                                                )
                                                                                                            }>
                                                                                                            <i className="ri-reply-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                            Reply
                                                                                                        </DropdownItem>
                                                                                                        {message.content && (
                                                                                                            <DropdownItem
                                                                                                                onClick={() =>
                                                                                                                    copyToClipboard(
                                                                                                                        message?.content
                                                                                                                    )
                                                                                                                }>
                                                                                                                <i className="ri-file-copy-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                Copy
                                                                                                            </DropdownItem>
                                                                                                        )}
                                                                                                        {message.senderId ===
                                                                                                            userId &&
                                                                                                            message.content && (
                                                                                                                <DropdownItem
                                                                                                                    onClick={() =>
                                                                                                                        handleEditClick(
                                                                                                                            message
                                                                                                                        )
                                                                                                                    }>
                                                                                                                    <i className="ri-edit-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                    Edit
                                                                                                                </DropdownItem>
                                                                                                            )}
                                                                                                        {message.senderId ===
                                                                                                            userId && (
                                                                                                            <DropdownItem
                                                                                                                onClick={() =>
                                                                                                                    deleteMessage(
                                                                                                                        message.id
                                                                                                                    )
                                                                                                                }>
                                                                                                                <i className="ri-delete-bin-5-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                Delete
                                                                                                            </DropdownItem>
                                                                                                        )}
                                                                                                        {message.attachmentType && (
                                                                                                            <DropdownItem
                                                                                                                onClick={() =>
                                                                                                                    handleDownload(
                                                                                                                        message.documentUrl,
                                                                                                                        message.documentName
                                                                                                                    )
                                                                                                                }>
                                                                                                                <i className="ri-download-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                Download
                                                                                                            </DropdownItem>
                                                                                                        )}
                                                                                                    </DropdownMenu>
                                                                                                </Dropdown>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                <div className="conversation-name">
                                                                                    <small className="text-muted time">
                                                                                        {(() => {
                                                                                            const createdDate =
                                                                                                new Date(
                                                                                                    message.createdDate
                                                                                                );
                                                                                            const today =
                                                                                                new Date();
                                                                                            const yesterday =
                                                                                                new Date(
                                                                                                    today
                                                                                                );
                                                                                            yesterday.setDate(
                                                                                                today.getDate() -
                                                                                                    1
                                                                                            );

                                                                                            const oneWeekAgo =
                                                                                                new Date(
                                                                                                    today
                                                                                                );
                                                                                            oneWeekAgo.setDate(
                                                                                                today.getDate() -
                                                                                                    7
                                                                                            );

                                                                                            const time =
                                                                                                createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );
                                                                                            const dayAndTime =
                                                                                                createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        weekday:
                                                                                                            "long",
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );

                                                                                            if (
                                                                                                createdDate.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                ) ===
                                                                                                today.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                )
                                                                                            ) {
                                                                                                return time;
                                                                                            } else if (
                                                                                                createdDate.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                ) ===
                                                                                                yesterday.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                )
                                                                                            ) {
                                                                                                return `Yesterday ${time}`;
                                                                                            } else if (
                                                                                                createdDate >=
                                                                                                oneWeekAgo
                                                                                            ) {
                                                                                                return dayAndTime;
                                                                                            } else {
                                                                                                return createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        day: "2-digit",
                                                                                                        month: "2-digit",
                                                                                                        year: "2-digit",
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        })()}
                                                                                    </small>{" "}
                                                                                    <span className="text-success check-message-icon">
                                                                                        {(() => {
                                                                                            const seen =
                                                                                                message.seenBy &&
                                                                                                JSON.parse(
                                                                                                    message?.seenBy
                                                                                                );

                                                                                            if (
                                                                                                Array.isArray(
                                                                                                    seen
                                                                                                ) &&
                                                                                                seen.length >
                                                                                                    0 &&
                                                                                                seen !==
                                                                                                    null
                                                                                            ) {
                                                                                                return (
                                                                                                    <i className="ri-check-double-line align-bottom"></i>
                                                                                                );
                                                                                            } else {
                                                                                                return (
                                                                                                    <i className="ri-check-line align-bottom"></i>
                                                                                                );
                                                                                            }
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </SimpleBar>
                                            </div>
                                            {emojiPicker && (
                                                <div className="alert pickerEmoji">
                                                    <Picker
                                                        disableSearchBar={true}
                                                        onEmojiClick={
                                                            onEmojiClick
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="chat-input-section p-3 p-lg-4">
                                            {showReply && (
                                                <>
                                                    <div className="replyCard show">
                                                        <div className="card mb-0">
                                                            <div className="card-body py-3">
                                                                <div className="replymessage-block mb-0 d-flex align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <h5 className="conversation-name">
                                                                            {
                                                                                currentUser
                                                                                    ?.user
                                                                                    ?.name
                                                                            }
                                                                        </h5>

                                                                        {replyMessage.content ? (
                                                                            <p className="mb-0">
                                                                                {" "}
                                                                                {
                                                                                    replyMessage.content
                                                                                }{" "}
                                                                            </p>
                                                                        ) : replyMessage.attachmentType ? (
                                                                            <div className="attachment">
                                                                                {replyMessage.attachmentType.startsWith(
                                                                                    "image/"
                                                                                ) ? (
                                                                                    <img
                                                                                        src={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        alt="Image Attachment"
                                                                                        className="avatar-sm rounded border"
                                                                                    />
                                                                                ) : replyMessage.attachmentType ===
                                                                                  "application/pdf" ? (
                                                                                    <a
                                                                                        href={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer">
                                                                                        <IoDocumentTextSharp />{" "}
                                                                                        {replyMessage.documentName ||
                                                                                            "Attachment"}
                                                                                    </a>
                                                                                ) : (
                                                                                    <a
                                                                                        href={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer">
                                                                                        <IoDocumentTextSharp />{" "}
                                                                                        Pdf
                                                                                        document
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="mb-0">
                                                                                {" "}
                                                                                No
                                                                                content
                                                                                available{" "}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                handleClose
                                                                            }
                                                                            className="btn btn-sm btn-link mt-n2 me-n3 fs-18">
                                                                            <i className="bx bx-x align-middle"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Formik
                                                        validationSchema={
                                                            validationSchema
                                                        }>
                                                        <form
                                                            id="chatinput-form"
                                                            onSubmit={
                                                                sendMessage
                                                            }>
                                                            <Row className="g-0 align-items-center">
                                                                <div className="col-auto">
                                                                    <div className="chat-input-links me-2">
                                                                        <div className="links-list-item">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link text-decoration-none emoji-btn"
                                                                                id="emoji-btn"
                                                                                onClick={() =>
                                                                                    setemojiPicker(
                                                                                        !emojiPicker
                                                                                    )
                                                                                }>
                                                                                <i className="bx bx-smile align-middle"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col">
                                                                    <div className="chat-input-feedback">
                                                                        {" "}
                                                                        Please
                                                                        Enter a
                                                                        Message{" "}
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control chat-input bg-light border-light"
                                                                        placeholder="Type your message..."
                                                                        value={
                                                                            messageInput
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setMessageInput(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        ref={
                                                                            inputRef
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div>
                                                                        <input
                                                                            type="file"
                                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                                            ref={
                                                                                fileInputRef
                                                                            }
                                                                            onChange={
                                                                                handleFileChange
                                                                            }
                                                                            style={{
                                                                                display:
                                                                                    "none",
                                                                            }}
                                                                        />
                                                                        <button
                                                                            onClick={
                                                                                handleIconClick
                                                                            }
                                                                            type="button"
                                                                            className="btn bg-white border-0 fs-22 py-0">
                                                                            <MdAttachFile />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div className="chat-input-links ms-md-2">
                                                                        <ul className="list-inline mb-0">
                                                                            <li className="list-inline-item">
                                                                                <button
                                                                                    type="submit"
                                                                                    className="btn btn-success chat-send waves-effect waves-light">
                                                                                    <i className="ri-send-plane-2-fill"></i>
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </Row>
                                                        </form>
                                                    </Formik>
                                                </>
                                            )}
                                            {!showReply && (
                                                <Formik
                                                    validationSchema={
                                                        validationSchema
                                                    }>
                                                    <form
                                                        id="chatinput-form"
                                                        onSubmit={sendMessage}>
                                                        <Row className="g-0 align-items-center">
                                                            <div className="col-auto">
                                                                <div className="chat-input-links me-2">
                                                                    <div className="links-list-item">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link text-decoration-none emoji-btn"
                                                                            id="emoji-btn"
                                                                            onClick={() =>
                                                                                setemojiPicker(
                                                                                    !emojiPicker
                                                                                )
                                                                            }>
                                                                            <i className="bx bx-smile align-middle"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div className="chat-input-feedback">
                                                                    {" "}
                                                                    Please Enter
                                                                    a Message{" "}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="form-control chat-input bg-light border-light"
                                                                    placeholder="Type your message..."
                                                                    value={
                                                                        messageInput
                                                                    }
                                                                    onChange={handleTyping}
                                                                />
                                                            </div>
                                                            <div className="col-auto">
                                                                <div>
                                                                    <input
                                                                        type="file"
                                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                                        ref={
                                                                            fileInputRef
                                                                        }
                                                                        onChange={
                                                                            handleFileChange
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={
                                                                            handleIconClick
                                                                        }
                                                                        type="button"
                                                                        className="btn bg-white border-0 fs-22 py-0">
                                                                        <MdAttachFile />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div className="chat-input-links">
                                                                    <ul className="list-inline mb-0">
                                                                        <li className="list-inline-item">
                                                                            <button
                                                                                type="submit"
                                                                                className="btn btn-success chat-send waves-effect waves-light">
                                                                                <i className="ri-send-plane-2-fill"></i>
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </Row>
                                                    </form>
                                                </Formik>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ProfileModal
                            currentUser={currentUser}
                            isOpen={isProfileOpen}
                            toggle={toggleProfile}
                            handleDeleChat={handleDeleChat}
                            archive={archive}
                            unarchive={unarchive}
                            userId={userId}
                            favchat={favchat}
                            unfavchat={unfavchat}
                        />
                    </>
                ) : (
                    <>
                        <div className="user-chat w-100 overflow-hidden user-chat-show">
                            <div className="chat-content d-lg-flex">
                                <div className="w-100 overflow-hidden position-relative">
                                    <div className="position-relative">
                                        <div className="p-3 user-chat-topbar bg-light">
                                            <Row className="align-items-center">
                                                <Col sm={4} xs={8}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0 d-block d-lg-none me-3">
                                                            <div className="user-chat-remove fs-18 p-1">
                                                                <span
                                                                    onClick={() =>dispatch(setCurrentOtherUserAction(null))}
                                                                    className="user-chat-remove fs-18 p-1 cursor-pointer">
                                                                    <i className="ri-arrow-left-s-line align-bottom"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-grow-1 overflow-hidden">
                                                            <div className="d-flex align-items-center">
                                                                <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                                    {currentUser.createdBy ===
                                                                    0 ? (
                                                                        "#"
                                                                    ) : (
                                                                        <img
                                                                            src="https://banner2.cleanpng.com/20180728/ftk/kisspng-computer-icons-icon-design-users-group-group-icon-5b5c712f527ed9.0606827715327849433379.jpg"
                                                                            className="rounded-circle avatar-xs"
                                                                            alt=""
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <h5 className="text-truncate mb-0 fs-16 cursor-pointer">
                                                                        <div
                                                                            className="text-reset username"
                                                                            onClick={
                                                                                toggleGroup
                                                                            }>
                                                                            {" "}
                                                                            {
                                                                                currentUser?.chatName
                                                                            }{" "}
                                                                        </div>
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <div className="col-sm-8 col-4">
                                                    <ul className="list-inline user-chat-nav text-end mb-0">
                                                        <li className="list-inline-item m-0">
                                                            <Dropdown
                                                                isOpen={
                                                                    search_Menu
                                                                }
                                                                toggle={
                                                                    toggleSearch
                                                                }>
                                                                <DropdownToggle
                                                                    className="btn btn-ghost-secondary btn-icon"
                                                                    tag="button">
                                                                    <FeatherIcon
                                                                        icon="search"
                                                                        className="icon-sm"
                                                                    />
                                                                </DropdownToggle>
                                                                <DropdownMenu className="p-0 dropdown-menu-end dropdown-menu-lg">
                                                                    <div className="p-2">
                                                                        <div className="search-box">
                                                                            <Input
                                                                                value={
                                                                                    searchTerm
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setSearchTerm(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                type="text"
                                                                                className="form-control bg-light border-light"
                                                                                placeholder="Search here..."
                                                                                id="searchMessage"
                                                                            />
                                                                            <i className="ri-search-2-line search-icon"></i>
                                                                        </div>
                                                                    </div>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </li>
                                                        <li className="list-inline-item d-none d-lg-inline-block m-0">
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost-secondary btn-icon"
                                                                onClick={
                                                                    toggleGroup
                                                                }>
                                                                <Info
                                                                    width="24"
                                                                    height="24"
                                                                    className="feather feather-info icon-sm"
                                                                />
                                                            </button>
                                                        </li>
                                                        <li className="list-inline-item m-0">
                                                            {currentUser.createdBy !==
                                                                0 && (
                                                                <Dropdown
                                                                    isOpen={
                                                                        dropdownOpen2
                                                                    }
                                                                    toggle={
                                                                        toggleDropdown2
                                                                    }>
                                                                    <DropdownToggle
                                                                        className="btn btn-ghost-secondary btn-icon"
                                                                        tag="button"
                                                                        data-bs-toggle="dropdown">
                                                                        <MoreVertical
                                                                            width="24"
                                                                            height="24"
                                                                            className="feather feather-more-vertical icon-sm"
                                                                        />
                                                                    </DropdownToggle>
                                                                    <DropdownMenu
                                                                        end>
                                                                        {(() => {
                                                                            const isFavourite =
                                                                                currentUser &&
                                                                                currentUser.favouriteBy
                                                                                    ? currentUser.favouriteBy.includes(
                                                                                          userId
                                                                                      )
                                                                                    : false;
                                                                            const isArchived =
                                                                                currentUser &&
                                                                                currentUser.archiveBy
                                                                                    ? currentUser.archiveBy.includes(
                                                                                          userId
                                                                                      )
                                                                                    : false;
                                                                            if (
                                                                                isFavourite
                                                                            ) {
                                                                                return null;
                                                                            }
                                                                            return isArchived ? (
                                                                                <DropdownItem
                                                                                    onClick={() =>
                                                                                        unarchive(
                                                                                            true
                                                                                        )
                                                                                    }>
                                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>{" "}
                                                                                    UnArchive
                                                                                </DropdownItem>
                                                                            ) : (
                                                                                <DropdownItem
                                                                                    onClick={() =>
                                                                                        archive(
                                                                                            true
                                                                                        )
                                                                                    }>
                                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>{" "}
                                                                                    Archive
                                                                                </DropdownItem>
                                                                            );
                                                                        })()}
                                                                        {currentUser.createdBy ===
                                                                        userId ? (
                                                                            <DropdownItem
                                                                                onClick={
                                                                                    handleDeleteGroupChat
                                                                                }>
                                                                                <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                                                                                Delete
                                                                                Group
                                                                            </DropdownItem>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                        <DropdownItem
                                                                            onClick={() =>
                                                                                handleDeleChat(
                                                                                    true
                                                                                )
                                                                            }>
                                                                            <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>{" "}
                                                                            Clear
                                                                            Chat
                                                                        </DropdownItem>
                                                                    </DropdownMenu>
                                                                </Dropdown>
                                                            )}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Row>
                                        </div>
                                        <div
                                            className="position-relative"
                                            id="users-chat">
                                            {copiedMessage && (
                                                <div> {copiedMessage} </div>
                                            )}
                                            <div
                                                ref={chatContainerRef}
                                                className="chat-conversation p-3 p-lg-4 "
                                                id="chat-conversation">
                                                <SimpleBar ref={simpleBarRef}>
                                                    <ul
                                                        className="list-unstyled chat-conversation-list me-3"
                                                        id="users-conversation">
                                                        {chatMessages &&
                                                            chatMessages.map(
                                                                (
                                                                    message,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={`chat-list ${
                                                                            message.senderId ===
                                                                            userId
                                                                                ? "right"
                                                                                : "left"
                                                                        }`}>
                                                                        <div className="conversation-list">
                                                                            {message.senderId !==
                                                                                userId && (
                                                                                <div className="chat-avatar">
                                                                                    <img
                                                                                        src={
                                                                                            message
                                                                                                ?.senderProfile
                                                                                                ?.profilePic
                                                                                        }
                                                                                        alt="profile"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="user-chat-content">
                                                                                <div className="ctext-wrap">
                                                                                    {isEditing &&
                                                                                    currentMessageId ===
                                                                                        message.id ? (
                                                                                        <div>
                                                                                            <Input
                                                                                                type="text"
                                                                                                value={
                                                                                                    newMessage
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    setNewMessage(
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                    )
                                                                                                }
                                                                                                className="mb-2"
                                                                                            />
                                                                                            <Button
                                                                                                color="primary"
                                                                                                onClick={() => {
                                                                                                    updateMessage(
                                                                                                        currentMessageId,
                                                                                                        newMessage
                                                                                                    );
                                                                                                }}
                                                                                                disabled={
                                                                                                    message.content ==
                                                                                                    newMessage
                                                                                                }
                                                                                                className="me-2">
                                                                                                {" "}
                                                                                                Save{" "}
                                                                                            </Button>
                                                                                            <Button
                                                                                                color="secondary"
                                                                                                onClick={() =>
                                                                                                    handleCancelClick()
                                                                                                }>
                                                                                                {" "}
                                                                                                Cancel{" "}
                                                                                            </Button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            {message.replyMessage && (
                                                                                                <div className="ctext-wrap-content">
                                                                                                    <div className="replymessage-block mb-0 d-flex align-items-start">
                                                                                                        <div className="flex-grow-1">
                                                                                                            {chatMessages.find(
                                                                                                                (
                                                                                                                    msg
                                                                                                                ) =>
                                                                                                                    msg.id.toString() ===
                                                                                                                    message.replyMessage
                                                                                                            ) && (
                                                                                                                <>
                                                                                                                    {(() => {
                                                                                                                        const replyMsg =
                                                                                                                            chatMessages.find(
                                                                                                                                (
                                                                                                                                    msg
                                                                                                                                ) =>
                                                                                                                                    msg.id.toString() ===
                                                                                                                                    message.replyMessage
                                                                                                                            );
                                                                                                                        if (
                                                                                                                            replyMsg.content
                                                                                                                        ) {
                                                                                                                            return (
                                                                                                                                <p className="mb-0 ctext-content">
                                                                                                                                    {" "}
                                                                                                                                    {
                                                                                                                                        replyMsg.content
                                                                                                                                    }{" "}
                                                                                                                                </p>
                                                                                                                            );
                                                                                                                        } else if (
                                                                                                                            replyMsg.attachmentType
                                                                                                                        ) {
                                                                                                                            if (
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/jpeg" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/png" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/jpg" ||
                                                                                                                                replyMsg.attachmentType ===
                                                                                                                                    "image/webp"
                                                                                                                            ) {
                                                                                                                                return (
                                                                                                                                    <div className="message-img mb-0">
                                                                                                                                        <div className="message-img-list">
                                                                                                                                            <img
                                                                                                                                                src={
                                                                                                                                                    replyMsg.documentUrl
                                                                                                                                                }
                                                                                                                                                alt="Attachment"
                                                                                                                                            />
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                );
                                                                                                                            } else {
                                                                                                                                return (
                                                                                                                                    <a
                                                                                                                                        href={
                                                                                                                                            replyMsg.documentUrl
                                                                                                                                        }
                                                                                                                                        target="_blank"
                                                                                                                                        rel="noopener noreferrer">
                                                                                                                                        {" "}
                                                                                                                                        <IoDocumentTextSharp />{" "}
                                                                                                                                        {replyMsg.documentName ||
                                                                                                                                            "Attachment"}{" "}
                                                                                                                                    </a>
                                                                                                                                );
                                                                                                                            }
                                                                                                                        }
                                                                                                                        return null;
                                                                                                                    })()}
                                                                                                                </>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    {message.attachmentType &&
                                                                                                    (message.attachmentType ===
                                                                                                        "image/jpeg" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/png" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/jpg" ||
                                                                                                        message.attachmentType ===
                                                                                                            "image/webp" ||
                                                                                                        message.attachmentType ===
                                                                                                            "application/pdf") ? (
                                                                                                        <div className="attachment">
                                                                                                            {message.attachmentType ===
                                                                                                                "image/jpeg" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/png" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/jpg" ||
                                                                                                            message.attachmentType ===
                                                                                                                "image/webp" ? (
                                                                                                                <div className="message-img mb-0">
                                                                                                                    <div className="message-img-list">
                                                                                                                        <img
                                                                                                                            src={
                                                                                                                                message.documentUrl
                                                                                                                            }
                                                                                                                            alt="Attachment"
                                                                                                                            className=" rounded border"
                                                                                                                        />
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <a
                                                                                                                    href={
                                                                                                                        message.documentUrl
                                                                                                                    }
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer">
                                                                                                                    {" "}
                                                                                                                    <IoDocumentTextSharp />{" "}
                                                                                                                    {
                                                                                                                        message.documentName
                                                                                                                    }
                                                                                                                </a>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <p className="mb-0 ctext-content">
                                                                                                            {highlightSearchTerm(
                                                                                                                message.content
                                                                                                            )}
                                                                                                        </p>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}

                                                                                            {!message.replyMessage && (
                                                                                                <div>
                                                                                                    {message.attachmentType &&
                                                                                                    [
                                                                                                        "image/jpeg",
                                                                                                        "image/png",
                                                                                                        "image/jpg",
                                                                                                        "image/webp",
                                                                                                        "application/pdf",
                                                                                                    ].includes(
                                                                                                        message.attachmentType
                                                                                                    ) ? (
                                                                                                        <div className="attachment">
                                                                                                            {[
                                                                                                                "image/jpeg",
                                                                                                                "image/png",
                                                                                                                "image/jpg",
                                                                                                                "image/webp",
                                                                                                            ].includes(
                                                                                                                message.attachmentType
                                                                                                            ) ? (
                                                                                                                <div className="message-img mb-0">
                                                                                                                    <div className="message-img-list">
                                                                                                                        <a
                                                                                                                            href={
                                                                                                                                message.documentUrl
                                                                                                                            }
                                                                                                                            data-fancybox="gallery"
                                                                                                                            data-caption={
                                                                                                                                message.documentName
                                                                                                                            }
                                                                                                                            data-download-url={
                                                                                                                                message.documentUrl
                                                                                                                            }
                                                                                                                            data-download-name={
                                                                                                                                message.documentName
                                                                                                                            }>
                                                                                                                            <img
                                                                                                                                src={
                                                                                                                                    message.documentUrl
                                                                                                                                }
                                                                                                                                alt="Attachment"
                                                                                                                                className="rounded border"
                                                                                                                            />
                                                                                                                        </a>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="ctext-wrap-content">
                                                                                                                    <a
                                                                                                                        href={
                                                                                                                            message.documentUrl
                                                                                                                        }
                                                                                                                        target="_blank"
                                                                                                                        rel="noopener noreferrer">
                                                                                                                        <IoDocumentTextSharp />{" "}
                                                                                                                        {
                                                                                                                            message.documentName
                                                                                                                        }
                                                                                                                    </a>
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="ctext-wrap-content">
                                                                                                            <p className="mb-0 ctext-content">
                                                                                                                {" "}
                                                                                                                {highlightSearchTerm(
                                                                                                                    message.content
                                                                                                                )}{" "}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}

                                                                                            <div className="dropdown align-self-start message-box-drop">
                                                                                                <Dropdown
                                                                                                    isOpen={
                                                                                                        dropdownOpen[
                                                                                                            index
                                                                                                        ] ||
                                                                                                        false
                                                                                                    }
                                                                                                    toggle={() =>
                                                                                                        toggleDropdown(
                                                                                                            index
                                                                                                        )
                                                                                                    }>
                                                                                                    <DropdownToggle
                                                                                                        tag="div"
                                                                                                        className="dropdown-toggle cursor-pointer"
                                                                                                        aria-expanded={
                                                                                                            dropdownOpen[
                                                                                                                index
                                                                                                            ]
                                                                                                        }>
                                                                                                        <i className="ri-more-2-fill"></i>
                                                                                                    </DropdownToggle>
                                                                                                    <DropdownMenu
                                                                                                        end>
                                                                                                        <DropdownItem
                                                                                                            onClick={() =>
                                                                                                                togglereply(
                                                                                                                    message
                                                                                                                )
                                                                                                            }>
                                                                                                            <i className="ri-reply-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                            Reply
                                                                                                        </DropdownItem>
                                                                                                        {message.content && (
                                                                                                            <DropdownItem
                                                                                                                onClick={() =>
                                                                                                                    copyToClipboard(
                                                                                                                        message?.content
                                                                                                                    )
                                                                                                                }>
                                                                                                                <i className="ri-file-copy-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                Copy
                                                                                                            </DropdownItem>
                                                                                                        )}
                                                                                                        {currentUser.createdBy !==
                                                                                                            0 &&
                                                                                                            message.senderId ===
                                                                                                                userId &&
                                                                                                            message.content && (
                                                                                                                <DropdownItem
                                                                                                                    onClick={() =>
                                                                                                                        handleEditClick(
                                                                                                                            message
                                                                                                                        )
                                                                                                                    }>
                                                                                                                    <i className="ri-edit-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                    Edit
                                                                                                                </DropdownItem>
                                                                                                            )}
                                                                                                        {currentUser.createdBy !==
                                                                                                            0 &&
                                                                                                            message.senderId ===
                                                                                                                userId && (
                                                                                                                <DropdownItem
                                                                                                                    onClick={() =>
                                                                                                                        deleteMessage(
                                                                                                                            message.id
                                                                                                                        )
                                                                                                                    }>
                                                                                                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                    Delete
                                                                                                                </DropdownItem>
                                                                                                            )}
                                                                                                        {message.attachmentType && (
                                                                                                            <DropdownItem
                                                                                                                onClick={() =>
                                                                                                                    handleDownload(
                                                                                                                        message.documentUrl,
                                                                                                                        message.documentName
                                                                                                                    )
                                                                                                                }>
                                                                                                                <i className="ri-download-line me-2 text-muted align-bottom"></i>{" "}
                                                                                                                Download
                                                                                                            </DropdownItem>
                                                                                                        )}
                                                                                                    </DropdownMenu>
                                                                                                </Dropdown>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                <div className="conversation-name">
                                                                                    <small className="text-muted time">
                                                                                        {(() => {
                                                                                            const createdDate =
                                                                                                new Date(
                                                                                                    message.createdDate
                                                                                                );
                                                                                            const today =
                                                                                                new Date();
                                                                                            const yesterday =
                                                                                                new Date(
                                                                                                    today
                                                                                                );
                                                                                            yesterday.setDate(
                                                                                                today.getDate() -
                                                                                                    1
                                                                                            );

                                                                                            const oneWeekAgo =
                                                                                                new Date(
                                                                                                    today
                                                                                                );
                                                                                            oneWeekAgo.setDate(
                                                                                                today.getDate() -
                                                                                                    7
                                                                                            );

                                                                                            const time =
                                                                                                createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );
                                                                                            const dayAndTime =
                                                                                                createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        weekday:
                                                                                                            "long",
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );

                                                                                            if (
                                                                                                createdDate.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                ) ===
                                                                                                today.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                )
                                                                                            ) {
                                                                                                return time;
                                                                                            } else if (
                                                                                                createdDate.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                ) ===
                                                                                                yesterday.setHours(
                                                                                                    0,
                                                                                                    0,
                                                                                                    0,
                                                                                                    0
                                                                                                )
                                                                                            ) {
                                                                                                return `Yesterday ${time}`;
                                                                                            } else if (
                                                                                                createdDate >=
                                                                                                oneWeekAgo
                                                                                            ) {
                                                                                                return dayAndTime;
                                                                                            } else {
                                                                                                return createdDate.toLocaleString(
                                                                                                    [],
                                                                                                    {
                                                                                                        day: "2-digit",
                                                                                                        month: "2-digit",
                                                                                                        year: "2-digit",
                                                                                                        hour: "2-digit",
                                                                                                        minute: "2-digit",
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        })()}
                                                                                    </small>{" "}
                                                                                    <div className="text-success check-message-icon">
                                                                                        {(() => {
                                                                                            const allParticipants =
                                                                                                JSON.parse(
                                                                                                    currentUser.participants
                                                                                                );
                                                                                            const senderId =
                                                                                                message.senderId;
                                                                                            const seen =
                                                                                                message.seenBy
                                                                                                    ? JSON.parse(
                                                                                                          message.seenBy
                                                                                                      )
                                                                                                    : [];
                                                                                            const participantsExcludingSender =
                                                                                                allParticipants.filter(
                                                                                                    (
                                                                                                        participant
                                                                                                    ) =>
                                                                                                        participant !==
                                                                                                        senderId
                                                                                                );
                                                                                            const allSeen =
                                                                                                Array.isArray(
                                                                                                    seen
                                                                                                ) &&
                                                                                                participantsExcludingSender.every(
                                                                                                    (
                                                                                                        participant
                                                                                                    ) =>
                                                                                                        seen.includes(
                                                                                                            participant
                                                                                                        )
                                                                                                );
                                                                                            if (
                                                                                                allSeen
                                                                                            ) {
                                                                                                return (
                                                                                                    <i className="ri-check-double-line align-bottom"></i>
                                                                                                );
                                                                                            } else {
                                                                                                return (
                                                                                                    <i className="ri-check-line align-bottom"></i>
                                                                                                );
                                                                                            }
                                                                                        })()}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </SimpleBar>
                                            </div>
                                            {emojiPicker && (
                                                <div className="alert pickerEmoji z-3">
                                                    <Picker
                                                        disableSearchBar={true}
                                                        onEmojiClick={
                                                            onEmojiClick
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="chat-input-section p-3 p-lg-4">
                                            {showReply && (
                                                <>
                                                    <div className="replyCard show">
                                                        <div className="card mb-0">
                                                            <div className="card-body py-3">
                                                                <div className="replymessage-block mb-0 d-flex align-items-start">
                                                                    <div className="flex-grow-1">
                                                                        <h5 className="conversation-name">
                                                                            {
                                                                                currentUser
                                                                                    ?.user
                                                                                    ?.name
                                                                            }
                                                                        </h5>
                                                                        {replyMessage.content ? (
                                                                            <p className="mb-0">
                                                                                {" "}
                                                                                {
                                                                                    replyMessage.content
                                                                                }{" "}
                                                                            </p>
                                                                        ) : replyMessage.attachmentType ? (
                                                                            <div className="attachment">
                                                                                {replyMessage.attachmentType.startsWith(
                                                                                    "image/"
                                                                                ) ? (
                                                                                    <img
                                                                                        src={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        alt="Image Attachment"
                                                                                        className="avatar-sm rounded border"
                                                                                    />
                                                                                ) : replyMessage.attachmentType ===
                                                                                  "application/pdf" ? (
                                                                                    <a
                                                                                        href={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer">
                                                                                        <IoDocumentTextSharp />
                                                                                        {replyMessage.documentName ||
                                                                                            "Attachment"}
                                                                                    </a>
                                                                                ) : (
                                                                                    <a
                                                                                        href={
                                                                                            replyMessage.documentUrl
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer">
                                                                                        <IoDocumentTextSharp />{" "}
                                                                                        Pdf
                                                                                        document
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="mb-0">
                                                                                {" "}
                                                                                No
                                                                                content
                                                                                available{" "}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                handleClose
                                                                            }
                                                                            className="btn btn-sm btn-link mt-n2 me-n3 fs-18">
                                                                            <i className="bx bx-x align-middle"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Formik
                                                        validationSchema={
                                                            validationSchema
                                                        }>
                                                        <form
                                                            id="chatinput-form"
                                                            onSubmit={
                                                                sendMessage
                                                            }>
                                                            <Row className="g-0 align-items-center">
                                                                <div className="col-auto">
                                                                    <div className="chat-input-links me-2">
                                                                        <div className="links-list-item">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link text-decoration-none emoji-btn"
                                                                                id="emoji-btn"
                                                                                onClick={() =>
                                                                                    setemojiPicker(
                                                                                        !emojiPicker
                                                                                    )
                                                                                }>
                                                                                <i className="bx bx-smile align-middle"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col">
                                                                    <div>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control chat-input bg-light border-light"
                                                                            placeholder="Type your message..."
                                                                            value={
                                                                                messageInput
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setMessageInput(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            ref={
                                                                                inputRef
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div>
                                                                        <input
                                                                            type="file"
                                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                                            ref={
                                                                                fileInputRef
                                                                            }
                                                                            onChange={
                                                                                handleFileChange
                                                                            }
                                                                            style={{
                                                                                display:
                                                                                    "none",
                                                                            }}
                                                                        />
                                                                        <button
                                                                            onClick={
                                                                                handleIconClick
                                                                            }
                                                                            type="button"
                                                                            className="btn bg-white border-0 fs-22 py-0">
                                                                            <MdAttachFile />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="col-auto">
                                                                    <div className="chat-input-links ms-md-2">
                                                                        <ul className="list-inline mb-0">
                                                                            <li className="list-inline-item">
                                                                                <button
                                                                                    type="submit"
                                                                                    className="btn btn-success chat-send waves-effect waves-light">
                                                                                    <i className="ri-send-plane-2-fill"></i>
                                                                                </button>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </Row>
                                                        </form>
                                                    </Formik>
                                                </>
                                            )}
                                            {!showReply && (
                                                <Formik
                                                    validationSchema={
                                                        validationSchema
                                                    }>
                                                    <form
                                                        onSubmit={sendMessage}>
                                                        <Row className="g-0 align-items-center">
                                                            <div className="col-auto">
                                                                <div className="chat-input-links me-2">
                                                                    <div className="links-list-item z-1">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link text-decoration-none emoji-btn"
                                                                            id="emoji-btn"
                                                                            onClick={() =>
                                                                                setemojiPicker(
                                                                                    !emojiPicker
                                                                                )
                                                                            }>
                                                                            <i className="bx bx-smile align-middle"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col">
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control chat-input bg-light border-light"
                                                                        placeholder="Type your message..."
                                                                        value={
                                                                            messageInput
                                                                        }
                                                                        onChange={handleTyping}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div>
                                                                    <input
                                                                        type="file"
                                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                                        ref={
                                                                            fileInputRef
                                                                        }
                                                                        onChange={
                                                                            handleFileChange
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "none",
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={
                                                                            handleIconClick
                                                                        }
                                                                        type="button"
                                                                        className="btn bg-white border-0 fs-22 py-0">
                                                                        <MdAttachFile />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="col-auto">
                                                                <div className="chat-input-links ms-md-2">
                                                                    <ul className="list-inline mb-0">
                                                                        <li className="list-inline-item">
                                                                            <button
                                                                                type="submit"
                                                                                className="btn btn-success chat-send waves-effect waves-light">
                                                                                <i className="ri-send-plane-2-fill"></i>
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </Row>
                                                    </form>
                                                </Formik>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <GroupInfoModel
                            isOpen={isGroupOpen}
                            toggle={toggleGroup}
                            groupInfo={currentUser}
                            handleUpdateChat={handleUpdateChat}
                            handleDeleChat={handleDeleChat}
                            userId={userId}
                            handleDeleteGroupChat={handleDeleteGroupChat}
                            handleLeaveGroupChat={handleLeaveGroupChat}
                            archive={archive}
                            unarchive={unarchive}
                            favchat={favchat}
                            unfavchat={unfavchat}
                        />
                    </>
                )
            ) : (
                <div
                    className="container d-flex justify-content-center align-items-center mt-5"
                    style={{ height: "80vh" }}>
                    <div className="row">
                        <div className="col text-center">
                            <p className="fs-5 text-muted">
                                Please select a user to start a chat.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chat;
