import React, { createContext, useState, useContext, useEffect } from "react";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../utils/hook/useAxios";

export const UnseenMessageContext = createContext();

export const UnseenMessageProvider = ({ children }) => {
    const axiosInstance = useAxios();

    const [personalChatUnseenCounts, setPersonalChatUnseenCounts] = useState(
        []
    );
    const [groupChatUnseenCounts, setGroupChatUnseenCounts] = useState([]);
    const [totalUnseenCount, setTotalUnseenCount] = useState(0);
    const [currentOtherUser, setCurrentOtherUser] = useState(null);
    const [userStatuses, setUserStatuses] = useState({});
    const [userData, setUserData] = useState(null);
    const userEncryptData = localStorage.getItem("userData");
    const data = userEncryptData
        ? decrypt({ data: userEncryptData }).data
        : null;
    useEffect(() => {
        if (data && !userData) {
            setUserData(data);
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

            setPersonalChatUnseenCounts(newPerChat);
            setGroupChatUnseenCounts(newGroupChat);
            setTotalUnseenCount(totalUnseenCounts);
        } catch (error) {
            console.error("Error fetching chat lists:", error.message);
        }
    };

    return (
        <UnseenMessageContext.Provider
            value={{
                personalChatUnseenCounts,
                setPersonalChatUnseenCounts,
                groupChatUnseenCounts,
                setGroupChatUnseenCounts,
                totalUnseenCount,
                setTotalUnseenCount,
                currentOtherUser,
                setCurrentOtherUser,
                fetchChatLists,
                userStatuses,
                setUserStatuses,
                userData,
                setUserData,
            }}>
            {children}
        </UnseenMessageContext.Provider>
    );
};

export const useUnseenMessageContext = () => {
    const context = useContext(UnseenMessageContext);
    if (!context) {
        throw new Error("error");
    }
    return context;
};
