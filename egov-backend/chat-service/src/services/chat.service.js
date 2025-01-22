const { default: axios } = require("axios");
const { chatListModel, chatMessageModel } = require("../models");
const { Op, Sequelize } = require("sequelize");
const { fetchUserData, fetchDocumentData, fetchDepartmentData } = require("./cacheUtility");

const createChatService = async (chatName, isGroup, participants, createdBy) => {
    try {
       
        if (isGroup === 0) {
            let existingChat = await chatListModel.findOne({
                where: {
                    isGroup,
                    participants: JSON.stringify(participants),
                },
            });

            if (existingChat) {
             
                let archiveByArray = existingChat.archiveBy ? JSON.parse(existingChat.archiveBy) : [];

                if (archiveByArray.includes(createdBy)) {
                    
                    archiveByArray = archiveByArray.filter((id) => id !== createdBy);
                    await chatListModel.update(
                        {
                            archiveBy: archiveByArray.length > 0 ? JSON.stringify(archiveByArray) : null,
                        },
                        { where: { id: existingChat.id } }
                    );
                    return existingChat; 
                }

                return existingChat;
            }
        }

       
        const chat = await chatListModel.create({
            chatName,
            isGroup,
            participants: JSON.stringify(participants),
            createdBy,
        });
        return chat;
    } catch (error) {
        throw new Error(error.message);
    }
};


const updateChatService = async (chatId, chatName, participants, createdBy) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        if (chat.createdBy !== createdBy) {
            throw new Error("Only the creator can delete this chat");
        }

        const [updated] = await chatListModel.update(
            { chatName, participants: JSON.stringify(participants) },
            { where: { id: chatId } }
        );

        if (updated) {
            const updatedChat = await chatListModel.findOne({
                where: { id: chatId },
            });
            return updatedChat;
        }
        throw new Error("Chat not found");
    } catch (error) {
        throw new Error(error);
    }
};

const deleteGroupChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        await chatMessageModel.destroy({ where: { chatId } });
        await chatListModel.destroy({ where: { id: chatId } });

        return chat;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        const messages = await chatMessageModel.findAll({ where: { chatId } });
        const updatePromises = messages.map(async (message) => {
            let deletedByArray = message.deletedBy
                ? JSON.parse(message.deletedBy)
                : [];

            if (!deletedByArray.includes(userId)) {
                deletedByArray.push(userId);
            }

            return chatMessageModel.update(
                { deletedBy: JSON.stringify(deletedByArray) },
                { where: { id: message.id } }
            );
        });

        await Promise.all(updatePromises);

        return chat;
    } catch (error) {
        console.error("Error deleting chat:", error.message);
        throw new Error("Error deleting chat");
    }
};

const getPersonalChatListService = async (userId, chatListType) => {
    try {
        const [chatList, usersResponse] =
            await Promise.all([
                chatListModel.findAll({ raw: true, where: { isGroup: 0 } }),
                axios
                    .post(`${process.env.USERSERVICE}user/getAlluser`)
                    .catch(() => ({ data: { data: { rows: [] } } })),
                    // fetchUserData(),
            ]);

        const usersList = usersResponse.data.data.rows;

        const userProfileImageIds = [
            ...new Set(
                usersList
                    .filter((user) => user.profileImageId !== null)
                    .map((user) => user.profileImageId)
            ),
        ];
        // const usersList = usersResponse;
        let profilePicsList = []
        if (userProfileImageIds?.length > 0) {
            const documentResponse = await axios.post(
                `${process.env.DOCUMENTSERVICE}document/list/uploadAdmin`,
                { data: { documentIds: userProfileImageIds } }
            );
            profilePicsList = documentResponse?.data?.data?.rows;
        }

        const profilePicMap = Object.fromEntries(
            profilePicsList.map((pic) => [
                pic.id,
                pic.documentPath,
            ])
        );
      
        const chatIds = chatList
            .filter(
                (chat) =>
                    chat.createdBy !== 0 &&
                    JSON.parse(chat.participants).includes(userId) &&
                    ((chatListType === "archived" &&
                        JSON.parse(chat.archiveBy || "[]").includes(userId)) ||
                        (chatListType === "favorite" &&
                            JSON.parse(chat.favouriteBy || "[]").includes(
                                userId
                            )) ||
                        (chatListType === "normal" &&
                            !JSON.parse(chat.archiveBy || "[]").includes(
                                userId
                            )) ||
                        !chatListType)
            )
            .map((chat) => chat.id);

        const messages = await chatMessageModel.findAll({
            raw: true,
            where: { chatId: chatIds },
            order: [["createdDate", "DESC"]],
        });

       
        const lastMessageMap = messages.reduce((acc, msg) => {
            if (!acc[msg.chatId]) acc[msg.chatId] = msg;
            return acc;
        }, {});

        const unseenCountMap = await chatMessageModel
            .findAll({
                raw: true,
                attributes: [
                    "chatId",
                    [
                        Sequelize.fn("COUNT", Sequelize.col("id")),
                        "unseenMessageCount",
                    ],
                ],
                where: {
                    chatId: chatIds,
                    seenBy: {
                        [Op.or]: [
                            { [Op.is]: null },
                            { [Op.notLike]: `%${userId}%` },
                        ],
                    },
                    senderId: { [Op.ne]: userId },
                },
                group: ["chatId"],
            })
            .then((results) =>
                Object.fromEntries(
                    results.map((result) => [
                        result.chatId,
                        result.unseenMessageCount,
                    ])
                )
            );

        const updatedChatList = chatList
            .filter((chat) => chatIds.includes(chat.id))
            .map((chat) => {
                const participants = JSON.parse(chat.participants);
                const otherParticipant = usersList.find(
                    (user) =>
                        user.id ==
                        participants.find(
                            (participantId) => participantId !== userId
                        )
                );

                const lastMessage = lastMessageMap[chat.id];
                const deletedByArray = lastMessage?.deletedBy
                    ? JSON.parse(lastMessage.deletedBy)
                    : [];

                return {
                    ...chat,
                    user: otherParticipant
                        ? {
                              id: otherParticipant.id,
                              name: otherParticipant.name,
                              profileImagePath:
                                  profilePicMap[
                                      otherParticipant.profileImageId
                                  ] || null,
                              departmentId: otherParticipant.departmentId,
                              email: otherParticipant.email,
                              phone: otherParticipant.phone,
                          }
                        : null,
                        lastMessage: deletedByArray.includes(userId)
                        ? null
                        : lastMessage?.content || lastMessage?.attachmentType || null,
                    lastMessageDate:
                        lastMessageMap[chat.id]?.createdDate || null,
                    unseenCount: unseenCountMap[chat.id] || 0,
                };
            })
            .sort(
                (a, b) =>
                    new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
            );

        return updatedChatList;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to retrieve personal chat list");
    }
};

const getGroupChatListService = async (userId, isCoreUser, chatListType) => {
    try {
        // Fetch chat list and department details
        const [chatListResponse, departmentResponse] = await Promise.all([
            chatListModel.findAll({ raw: true, where: { isGroup: 1 } }),
            axios.post(`${process.env.SERVICEMANAGEMENT}department/list`),
            // fetchDepartmentData()
        ]);

        let chatList = chatListResponse;
        const departmentList = departmentResponse.data.data.rows;
        // const departmentList = departmentResponse;

        // Handle missing departments
        const departmentMissing = await createMissingGroups(departmentList);
        if (
            departmentMissing?.deletedCount > 0 ||
            departmentMissing?.createdCount > 0
        ) {
            chatList = await chatListModel.findAll({
                raw: true,
                where: { isGroup: 1 },
            });
        }

        // Fetch users and profile pictures
        const usersResponse = await axios.post(
            `${process.env.USERSERVICE}user/getAlluser`,
            {}
        );

        const usersList = usersResponse?.data?.data?.rows;

        const userProfileImageIds = [
            ...new Set(
                usersList
                    .filter((user) => user.profileImageId !== null)
                    .map((user) => user.profileImageId)
            ),
        ];
        // const usersList = usersResponse;
        let profilePicsList;
        if (userProfileImageIds?.length > 0) {
            const documentResponse = await axios.post(
                `${process.env.DOCUMENTSERVICE}document/list/uploadAdmin`,
                { data: { documentIds: userProfileImageIds } }
            );
            profilePicsList = documentResponse?.data?.data?.rows;
        }

        //    profilePicsList = profilePicsResponse.data.data.rows;
        // const profilePicsList = profilePicsResponse;

        const profilePicMap = profilePicsList.reduce((acc, pic) => {
            acc[pic.id] = pic.documentPath;
            return acc;
        }, {});

        const departmentMap = departmentList.reduce((acc, dept) => {
            acc[dept.id] = {
                id: dept.id,
                departmentName: dept.departmentName,
                email: dept.email,
                contactNumber: dept.contactNumber,
                location: dept.location,
                users: [],
            };
            return acc;
        }, {});

        const userMap = {};
        usersList.forEach((user) => {
            // Split the departmentId string into an array of IDs
            const departmentIds = user.departmentId ? user.departmentId.split(',') : [];
        
            departmentIds.forEach((deptId) => {
                if (departmentMap[deptId]) {
                    // Add user to the corresponding department
                    departmentMap[deptId].users.push({
                        id: user.id,
                        name: user.name,
                        departmentId: deptId, // Use the individual department ID here
                        profileImageId: user.profileImageId || null,
                        email: user.email,
                        phone: user.phone,
                    });
                }
            });
        
            // Map user information
            userMap[user.id] = {
                id: user.id,
                name: user.name,
                profileImagePath: profilePicMap[user.profileImageId] || null,
                department: departmentIds
                    .map((deptId) => departmentMap[deptId]?.departmentName || null)
                    .filter(Boolean) // Remove null/undefined values
                    .join(', '), // Combine department names into a string
            };
        });

        // Apply filters based on chatListType
        const applyFilters = (chat) => {
            const isArchived = JSON.parse(chat.archiveBy || "[]").includes(
                userId
            );
            const isFavorite = JSON.parse(chat.favouriteBy || "[]").includes(
                userId
            );
            switch (chatListType) {
                case "archived":
                    return isArchived;
                case "favorite":
                    return isFavorite;
                case "normal":
                    return !isArchived;
                default:
                    return true;
            }
        };

        // Separate user and system chat IDs
        const userChatIds = chatList
            .filter(
                (chat) =>
                    chat.createdBy !== 0 &&
                    JSON.parse(chat.participants).includes(userId)
            )
            .map((chat) => chat.id);

        const systemChatIds = chatList
            .filter((chat) => chat.createdBy === 0 && applyFilters(chat))
            .map((chat) => chat.id);

        // Fetch messages
        const messages = await chatMessageModel.findAll({
            raw: true,
            where: { chatId: [...userChatIds, ...systemChatIds] },
            order: [["createdDate", "DESC"]],
        });

        // Map last messages
        const lastMessageMap = messages.reduce((acc, msg) => {
            if (
                !acc[msg.chatId] ||
                acc[msg.chatId].createdDate < msg.createdDate
            ) {
                acc[msg.chatId] = msg;
            }
            return acc;
        }, {});

        const getLastMessage = (chatId) => {
            const lastMessage = lastMessageMap[chatId];
            const deletedByArray = lastMessage?.deletedBy
                ? JSON.parse(lastMessage.deletedBy)
                : [];
            if (lastMessage && !deletedByArray.includes(userId)) {
                return lastMessage.content !== null
                    ? lastMessage.content
                    : lastMessage.attachmentType || null;
            }
            return null;
        };
        // Attach unseen message count to each chat
        const allChatIds = [...userChatIds, ...systemChatIds];
        const unseenCounts = await Promise.all(
            allChatIds.map(async (chatId) => {
                const unseenCount = await chatMessageModel.count({
                    where: {
                        chatId,
                        seenBy: {
                            [Op.or]: [
                                { [Op.is]: null },
                                { [Op.notLike]: `%${userId}%` },
                            ],
                        },
                        senderId: { [Op.ne]: userId },
                    },
                });
                return { chatId, unseenMessageCount: unseenCount };
            })
        );

        const unseenCountMap = unseenCounts.reduce((acc, count) => {
            acc[count.chatId] = count.unseenMessageCount;
            return acc;
        }, {});

        // Update chat lists with unseen counts and last messages
        const updatedGeneratedChatList = chatList
            .filter(
                (chat) =>
                    chat.createdBy !== 0 &&
                    JSON.parse(chat.participants).includes(userId) &&
                    applyFilters(chat)
            )
            .map((chat) => ({
                ...chat,
                participantsDetails: JSON.parse(chat.participants)
                    .map((participantId) => userMap[participantId])
                    .filter(Boolean),
                lastMessage: getLastMessage(chat.id),
                lastMessageDate: lastMessageMap[chat.id]
                    ? lastMessageMap[chat.id].createdDate
                    : null,
                unseenCount: unseenCountMap[chat.id] || 0,
            }))
            .sort((a, b) => {
                if (a.lastMessageDate && b.lastMessageDate) {
                    return (
                        new Date(b.lastMessageDate) -
                        new Date(a.lastMessageDate)
                    );
                } else if (a.lastMessageDate) {
                    return -1;
                } else if (b.lastMessageDate) {
                    return 1;
                } else {
                    return 0;
                }
            });

        const updatedSystemChatList = chatList
            .filter((chat) => chat.createdBy === 0 && applyFilters(chat))
            .map((chat) => {
                const department = departmentMap[chat.departmentId];
                const departmentUsers = department ? department.users : [];
                const coreUsers = usersList.filter(
                    (user) => user.isCoreTeam === "1"
                );
                const participants = [
                    ...new Set([
                        ...departmentUsers.map((user) => user.id),
                        ...coreUsers.map((user) => user.id),
                    ]),
                ];

                const participantsDetails = [
                    ...departmentUsers.map((user) => userMap[user.id]),
                    ...coreUsers.map((user) => userMap[user.id]),
                ].filter(Boolean);

                if (
                    isCoreUser === "1" ||
                    (department &&
                        department.users.some((user) => user.id === userId))
                ) {
                    return {
                        ...chat,
                        participants: JSON.stringify(participants),
                        participantsDetails,
                        lastMessage: lastMessageMap[chat.id]?.content || null,
                        lastMessageDate: lastMessageMap[chat.id]
                            ? lastMessageMap[chat.id].createdDate
                            : null,
                        unseenCount: unseenCountMap[chat.id] || 0,
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (a.lastMessageDate && b.lastMessageDate) {
                    return (
                        new Date(b.lastMessageDate) -
                        new Date(a.lastMessageDate)
                    );
                } else if (a.lastMessageDate) {
                    return -1;
                } else if (b.lastMessageDate) {
                    return 1;
                } else {
                    return 0;
                }
            });

        return [...updatedGeneratedChatList, ...updatedSystemChatList];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

const createMissingGroups = async (departmentList) => {
    try {
        const existingGroups = await chatListModel.findAll({
            raw: true,
            where: { createdBy: 0 },
            attributes: ["departmentId"],
        });

        const existingGroupDepartmentIds = existingGroups.map(group => group.departmentId);
        const departmentIds = departmentList.map(department => department.id);

        // **1. Deletion Logic** - Identify and delete groups not in the departmentList
        const groupsToDelete = existingGroupDepartmentIds.filter(
            departmentId => !departmentIds.includes(departmentId)
        );

        if (groupsToDelete.length > 0) {
            await chatListModel.destroy({
                where: { departmentId: groupsToDelete },
            });
        }

        // **2. Creation Logic** - Identify and create missing groups
        const missingDepartments = departmentList.filter(
            department => !existingGroupDepartmentIds.includes(department.id)
        );

        const newGroups = missingDepartments.map(department => ({
            chatName: department.departmentName,
            isGroup: true,
            participants: null,
            createdBy: 0,
            departmentId: department.id,
        }));

        if (newGroups.length > 0) {
            await chatListModel.bulkCreate(newGroups);
        }

        return {
            deletedCount: groupsToDelete.length,
            createdCount: newGroups.length,
        };

    } catch (error) {
        console.error("Error syncing groups with departments:", error);
    }
};

const createChatMessageService = async (
    chatId,
    senderId,
    content,
    attachmentType,
    attachmentId,
    seenBy,
    replyMessage
) => {
    try {
        const chatmessage = await chatMessageModel.create(
            {
                chatId,
                senderId,
                content: content ? content : null,
                attachmentType: attachmentType ? attachmentType : null,
                attachmentId: attachmentId ? attachmentId : null,
                seenBy,
                replyMessage,
            },
            {
                raw: true,
            }
        );

        return chatmessage;
    } catch (error) {
        throw new Error(error);
    }
};

const updateChatMessageService = async (chatId, messageId, content, userId) => {
    try {
        const [response] = await chatMessageModel.update(
            {
                content: content,
            },
            {
                where: { id: messageId },
            }
        );

        if (response) {
            let lastMessage = content;

            if (lastMessage) {
                await chatListModel.update(
                    { lastMessage, updatedDate: Date.now() },
                    { where: { id: chatId } }
                );
            }
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const updateIsSeenMessagesService = async (updates) => {
    try {
        const updatePromises = updates.map(async (update) => {
            const { messageId, userId } = update;

            const message = await chatMessageModel.findOne({
                where: { id: messageId },
            });

            if (message) {
                const isSeenArray = message.seenBy
                    ? JSON.parse(message.seenBy)
                    : [];

                if (!isSeenArray.includes(userId)) {
                    isSeenArray.push(userId);
                    return chatMessageModel.update(
                        { seenBy: JSON.stringify(isSeenArray) },
                        { where: { id: messageId } }
                    );
                }
            }

            return null;
        });

        const results = await Promise.all(updatePromises);
        return results.filter((result) => result !== null).length;
    } catch (error) {
        console.error("Error updating isSeen messages:", error);
        throw new Error(error);
    }
};

const deleteChatMessageService = async (messageId) => {
    try {
        const response = await chatMessageModel.destroy({
            where: { id: messageId },
        });

        if (response) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getChatMessageService = async (chatId, userId) => {
    try {
        const chatMessages = await chatMessageModel.findAll({
            raw: true,
            where: { chatId },
        });

        const attachmentIds = [...new Set(chatMessages
            .filter(message => message.attachmentId !== null)
            .map(message => message.attachmentId))];
        const senderIds = [...new Set(chatMessages.map(message => message.senderId))];

        let usersList = [];
        if (senderIds.length > 0) {
            const usersResponse = await axios.post(
                `${process.env.USERSERVICE}user/getAlluser`,
                {}
            );
            usersList = usersResponse.data.data.rows;
        }

        const userProfileImageIds = [...new Set(usersList
            .filter(user => user.profileImageId !== null)
            .map(user => user.profileImageId))];


        
        let documentList = [];
        if (attachmentIds.length > 0 || userProfileImageIds?.length > 0) {
            const documentResponse = await axios.post(
                `${process.env.DOCUMENTSERVICE}document/list/uploadAdmin`,
                { data: { documentIds: [...userProfileImageIds, ...attachmentIds] } } 
            );
            documentList = documentResponse.data.data.rows;
        }

        const filteredMessages = chatMessages.filter((chatMessage) => {
            const deletedByArray = chatMessage.deletedBy
                ? JSON.parse(chatMessage.deletedBy)
                : [];

            return !deletedByArray.includes(userId);
        });

        filteredMessages.forEach((chatMessage) => {
            if (chatMessage.attachmentId !== null) {
                const matchingDocument = documentList.find(
                    (doc) => doc.id === chatMessage.attachmentId
                );
                if (matchingDocument) {
                    chatMessage.documentUrl = matchingDocument.documentPath;
                    chatMessage.documentName = matchingDocument.viewDocumentName;
                }
            }

            const senderProfile = usersList.find(
                (user) => user.id === chatMessage.senderId
            );
            if (senderProfile) {
                const profilePicDocument = documentList.find(
                    (doc) => doc.id === senderProfile.profileImageId
                );
                chatMessage.senderProfile = {
                    id: senderProfile.id,
                    name: senderProfile.name,
                    email: senderProfile.email,
                    phone: senderProfile.phone,
                    profilePic: profilePicDocument
                        ? profilePicDocument.documentPath
                        : null,
                };
            }
        });

        return filteredMessages;
    } catch (error) {
        throw new Error(error);
    }
};

const getUnseenMessageCountsService = async (userId) => {
    try {
        // Fetch all group chats
        let groupChatList = await chatListModel.findAll({
            raw: true,
            where: { isGroup: 1 },
        });

        // Fetch department list
        let departmentResponse;
        try {
            departmentResponse = await 
            // fetchDepartmentData();
            axios.post(
                `${process.env.SERVICEMANAGEMENT}department/list`
            );
        } catch (err) {
            console.log(err);
        }
        const departmentList = departmentResponse.data.data.rows;
        // const departmentList = departmentResponse;

        // Create missing groups if any
        const departmentMissing = await createMissingGroups(departmentList);
        if (departmentMissing > 0) {
            groupChatList = await chatListModel.findAll({
                raw: true,
                where: { isGroup: 1 },
            });
        }

        // Fetch all users
        const usersResponse = await
        //  fetchUserData();
         axios.post(
            `${process.env.USERSERVICE}user/getAlluser`,
            {}
        );
        const usersList = usersResponse.data.data.rows;
        // const usersList = usersResponse;


        if (usersList.length > 0 && departmentList.length > 0) {
            // Create department map
            const departmentMap = departmentList.reduce((acc, dept) => {
                acc[dept.id] = {
                    id: dept.id,
                    departmentName: dept.departmentName,
                    email: dept.email,
                    contactNumber: dept.contactNumber,
                    location: dept.location,
                    users: [],
                };
                return acc;
            }, {});

            usersList.forEach((user) => {
                if (departmentMap[user.departmentId]) {
                    departmentMap[user.departmentId].users.push({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                    });
                }
            });

            // Update group chat list
            const generatedGroupChatList = groupChatList.filter(
                (chat) => chat.createdBy !== 0
            );
            const systemGroupChatList = groupChatList.filter(
                (chat) => chat.createdBy === 0
            );

            const updatedGeneratedGroupChatList = generatedGroupChatList
                .filter((chat) => {
                    const participants = JSON.parse(chat.participants);
                    return participants.includes(userId);
                })
                .map((chat) => {
                    const participants = JSON.parse(chat.participants);
                    const participantsWithDept = participants.map((userId) => {
                        const user = usersList.find((u) => u.id == userId);
                        if (user) {
                            return {
                                id: user.id,
                                name: user.name,
                                department:
                                    departmentMap[user.departmentId] || null,
                            };
                        }
                        return null;
                    });

                    return {
                        ...chat,
                        participantsDetails:
                            participantsWithDept.filter(Boolean),
                    };
                });

            const updatedSystemGroupChatList = systemGroupChatList.map(
                (chat) => {
                    const department = departmentMap[chat.departmentId];
                    const participants = department
                        ? department.users.map((user) => user.id)
                        : [];
                    const participantsDetails = department
                        ? department.users.map((user) => ({
                              id: user.id,
                              name: user.name,
                              department:
                                  departmentMap[user.departmentId] || null,
                          }))
                        : [];

                    return {
                        ...chat,
                        participants: JSON.stringify(participants),
                        participantsDetails,
                    };
                }
            );

            // Fetch all personal chats
            const personalChatList = await chatListModel.findAll({
                raw: true,
                where: { isGroup: 0 },
                order: [["updatedDate", "DESC"]],
            });

            const filteredPersonalChatList = personalChatList.filter((chat) => {
                const participants = JSON.parse(chat.participants);
                return participants.includes(userId);
            });

            const profilePicsResponse = await
            //  fetchDocumentData();
            axios.post(
                `${process.env.DOCUMENTSERVICE}document/list/upload`,
                { data: {} }
            );
            const profilePicsList = profilePicsResponse.data.data.rows;
            // const profilePicsList = profilePicsResponse;


            const profilePicMap = profilePicsList.reduce((acc, pic) => {
                acc[pic.id] = pic.documentPath;
                return acc;
            }, {});

            const updatedPersonalChatList = filteredPersonalChatList.map(
                (chat) => {
                    let participants = JSON.parse(chat.participants);
                    const otherParticipantId = participants.find(
                        (participantId) => participantId !== userId
                    );
                    const otherParticipant = usersList.find(
                        (user) => user.id == otherParticipantId
                    );

                    return {
                        ...chat,
                        user: otherParticipant
                            ? {
                                  id: otherParticipant.id,
                                  name: otherParticipant.name,
                                  profileImagePath:
                                      profilePicMap[
                                          otherParticipant.profileImageId
                                      ] || null,
                                  departmentId: otherParticipant.departmentId,
                                  email: otherParticipant.email,
                                  phone: otherParticipant.phone,
                              }
                            : null,
                    };
                }
            );

            // Combine all chats
            const allChats = [
                ...updatedGeneratedGroupChatList,
                ...updatedSystemGroupChatList,
                ...updatedPersonalChatList,
            ];

            // Fetch unseen message counts
            const unseenMessageCounts = await Promise.all(
                allChats.map(async (chat) => {
                    const unseenCount = await chatMessageModel.count({
                        where: {
                            chatId: chat.id,
                            seenBy: {
                                [Op.or]: [
                                    { [Op.is]: null },
                                    { [Op.notLike]: `%${userId}%` },
                                ],
                            },
                            senderId: {
                                [Op.ne]: userId,
                            },
                        },
                    });

                    return {
                        chatId: chat.id,
                        unseenMessageCount: unseenCount,
                        participantsDetails:
                            chat.participantsDetails || chat.user,
                    };
                })
            );
            // console.log(unseenMessageCounts)
            return unseenMessageCounts;
        }

        return [];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

const leaveGroupChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({
            where: { id: chatId, isGroup: 1 },
        });

        if (!chat) {
            throw new Error("Group chat not found");
        }

        const participants = JSON.parse(chat.participants);

        if (!participants.includes(userId)) {
            throw new Error("User is not a participant of this group");
        }

        const updatedParticipants = participants.filter(
            (participantId) => participantId !== userId
        );

        if (updatedParticipants.length === 0) {
            await chatMessageModel.destroy({ where: { chatId } });
            await chatListModel.destroy({ where: { id: chatId } });
            return { message: "Group chat deleted as no participants remain" };
        } else {
            await chatListModel.update(
                { participants: JSON.stringify(updatedParticipants) },
                { where: { id: chatId } }
            );
            return { message: "Successfully left the group chat" };
        }
    } catch (error) {
        console.error("Error leaving group chat:", error.message);
        throw new Error(error.message);
    }
};

const archiveChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        let archiveByArray = chat.archiveBy ? JSON.parse(chat.archiveBy) : [];
        let favouriteByArray = chat.favouriteBy
            ? JSON.parse(chat.favouriteBy)
            : [];

        if (archiveByArray.includes(userId)) {
            throw new Error("Chat is already archived by this user");
        }

        archiveByArray.push(userId);

        favouriteByArray = favouriteByArray.filter((id) => id !== userId);

        await chatListModel.update(
            {
                archiveBy: JSON.stringify(archiveByArray),
                favouriteBy:
                    favouriteByArray.length > 0
                        ? JSON.stringify(favouriteByArray)
                        : null,
            },
            { where: { id: chatId } }
        );

        return { message: "Chat archived successfully" };
    } catch (error) {
        console.error("Error archiving chat:", error.message);
        throw new Error(error.message);
    }
};

const unarchiveChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        let archiveByArray = chat.archiveBy ? JSON.parse(chat.archiveBy) : [];

        if (!archiveByArray.includes(userId)) {
            throw new Error("Chat is not archived by this user");
        }

        archiveByArray = archiveByArray.filter((id) => id !== userId);

        await chatListModel.update(
            {
                archiveBy:
                    archiveByArray.length > 0
                        ? JSON.stringify(archiveByArray)
                        : null,
            },
            { where: { id: chatId } }
        );

        return { message: "Chat unarchived successfully" };
    } catch (error) {
        console.error("Error unarchiving chat:", error.message);
        throw new Error(error.message);
    }
};

const favouriteChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        let favouriteByArray = chat.favouriteBy
            ? JSON.parse(chat.favouriteBy)
            : [];

        if (favouriteByArray.includes(userId)) {
            throw new Error("Chat is already favourite by this user");
        }

        favouriteByArray.push(userId);

        await chatListModel.update(
            { favouriteBy: JSON.stringify(favouriteByArray) },
            { where: { id: chatId } }
        );

        return { message: "Chat favourite successfully" };
    } catch (error) {
        console.error("Error favouriting chat:", error.message);
        throw new Error(error.message);
    }
};

const unfavouriteChatService = async (chatId, userId) => {
    try {
        const chat = await chatListModel.findOne({ where: { id: chatId } });

        if (!chat) {
            throw new Error("Chat not found");
        }

        let favouriteByArray = chat.favouriteBy
            ? JSON.parse(chat.favouriteBy)
            : [];

        if (!favouriteByArray.includes(userId)) {
            throw new Error("Chat is not favourite by this user");
        }

        favouriteByArray = favouriteByArray.filter((id) => id !== userId);

        await chatListModel.update(
            {
                favouriteBy:
                    favouriteByArray.length > 0
                        ? JSON.stringify(favouriteByArray)
                        : null,
            },
            { where: { id: chatId } }
        );

        return { message: "Chat unfavourite successfully" };
    } catch (error) {
        console.error("Error unfavouriting chat:", error.message);
        throw new Error(error.message);
    }
};

module.exports = {
    createChatService,
    updateChatService,
    deleteChatService,
    getPersonalChatListService,
    getGroupChatListService,
    createChatMessageService,
    updateChatMessageService,
    updateIsSeenMessagesService,
    deleteChatMessageService,
    deleteGroupChatService,
    getChatMessageService,
    getUnseenMessageCountsService,
    leaveGroupChatService,
    archiveChatService,
    unarchiveChatService,
    favouriteChatService,
    unfavouriteChatService,
};
