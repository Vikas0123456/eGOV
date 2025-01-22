const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const {
    createChatService,
    createChatMessageService,
    getPersonalChatListService,
    getGroupChatListService,
    getChatMessageService,
    updateChatService,
    deleteChatService,
    deleteGroupChatService,
    deleteChatMessageService,
    updateChatMessageService,
    updateIsSeenMessagesService,
    getUnseenMessageCountsService,
    leaveGroupChatService,
    archiveChatService,
    unarchiveChatService,
    favouriteChatService,
    unfavouriteChatService,
} = require("../services/chat.service");

const createChat = async (req, res) => {
    try {
        const { chatName, isGroup, participants, createdBy } = req.body.data;
        const result = await createChatService(
            chatName,
            isGroup,
            participants,
            createdBy
        );
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_CREATE,
                success: true,
                data: { ...result },
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const updateChat = async (req, res) => {
    try {
        const { chatId, chatName, participants, createdBy } = req.body.data;
        const result = await updateChatService(
            chatId,
            chatName,
            participants,
            createdBy
        );
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UPDATE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const deleteChat = async (req, res) => {
    try {
        const reqBody = req.body.data;

        console.log(reqBody);
        const { chatId, userId } = reqBody;

        const result = await deleteChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_DELETE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const leaveChat = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const { chatId, userId } = reqBody;

        const result = await leaveGroupChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_LEAVE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const deleteGroupChat = async (req, res) => {
    try {
        const reqBody = req.body.data;

        console.log(reqBody);
        const { chatId } = reqBody;

        const result = await deleteGroupChatService(chatId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_DELETE_GROUP,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const getPersonalChatList = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { userId, chatListType } = reqBody;
        const personalChatList = await getPersonalChatListService(
            userId,
            chatListType
        );

        if (personalChatList) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_PERSONAL_FETCH,
                success: true,
                data: personalChatList,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const getGroupChatList = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { userId, isCoreUser, chatListType } = reqBody;
        const groupChatList = await getGroupChatListService(
            userId,
            isCoreUser,
            chatListType
        );

        if (groupChatList) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_GROUP_FETCH,
                success: true,
                data: groupChatList,
            });
        } else {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: MESSAGES.CHAT.GROUP_CHAT_NOT_FOUND,
                success: false,
                data: [],
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const createChatMessage = async (req, res) => {
    try {
        const {
            chatId,
            senderId,
            content,
            attachmentType,
            attachmentId,
            seenBy,
            replyMessage,
        } = req.body.data;
        const result = await createChatMessageService(
            chatId,
            senderId,
            content,
            attachmentType,
            attachmentId,
            seenBy,
            replyMessage
        );

        if (!(content || attachmentType)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.CHAT.CHAT_CONTENT_ATTACHMENT,
                success: false,
                data: {},
            });
        }

        if (attachmentType && !attachmentId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.CHAT.CHAT_ATTACHMENT_URL,
                success: false,
                data: {},
            });
        }

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_MESSAGE_CREATE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const updateChatMessage = async (req, res) => {
    try {
        const { chatId, messageId, content, userId } = req.body.data;

        const result = await updateChatMessageService(
            chatId,
            messageId,
            content,
            userId
        );

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UPDATE,
                success: true,
                data: {},
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const updateIsSeenMessage = async (req, res) => {
    try {
        const { updates } = req.body.data;
        const result = await updateIsSeenMessagesService(updates);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UPDATE,
                success: true,
                data: {},
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const deleteChatMessage = async (req, res) => {
    try {
        const { messageId, userId } = req.body.data;

        const result = await deleteChatMessageService(messageId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_DELETE,
                success: true,
                data: {},
            });
        } else {
            return res.status(STATUS_CODES.FORBIDDEN).json({
                message: result.message,
                success: false,
                data: {},
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const getChatMessage = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { chatId, userId } = reqBody;

        let chatList = await getChatMessageService(chatId, userId);
        if (chatList) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_FETCH,
                success: true,
                data: chatList,
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const getUnseenMessageCount = async (req, res) => {
    try {
        const reqBody = req.body.data;

        if (!reqBody || !reqBody.userId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.CHAT.INVALID_REQUEST,
                success: false,
                data: {},
            });
        }

        const { userId } = reqBody;

        const list = await getUnseenMessageCountsService(userId);

        if (list.length > 0) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UNSEEN_MESSAGE_COUNT,
                success: true,
                data: list,
            });
        } else {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_NO_UNSEEN_MESSAGE_COUNT,
                success: true,
                data: list,
            });
        }
    } catch (error) {
        console.error("Error fetching unseen message counts:", error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
        });
    }
};

const archiveChat = async (req, res) => {
    try {
        const { chatId, userId } = req.body.data;

        const result = await archiveChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_ARCHIVE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.error("Error archiving chat:", error.message);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const unarchiveChat = async (req, res) => {
    try {
        const { chatId, userId } = req.body.data;

        const result = await unarchiveChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UNARCHIVE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.error("Error unarchiving chat:", error.message);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const favouriteChat = async (req, res) => {
    try {
        const { chatId, userId } = req.body.data;

        const result = await favouriteChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_FAVOURITE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.error("Error favouriting chat:", error.message);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const unfavouriteChat = async (req, res) => {
    try {
        const { chatId, userId } = req.body.data;

        const result = await unfavouriteChatService(chatId, userId);

        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.CHAT.CHAT_UNFAVOURITE,
                success: true,
                data: result,
            });
        }
    } catch (error) {
        console.error("Error unfavouriting chat:", error.message);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

module.exports = {
    createChat,
    updateChat,
    deleteChat,
    getPersonalChatList,
    getGroupChatList,
    createChatMessage,
    updateChatMessage,
    updateIsSeenMessage,
    deleteChatMessage,
    deleteGroupChat,
    getChatMessage,
    getUnseenMessageCount,
    leaveChat,
    archiveChat,
    unarchiveChat,
    favouriteChat,
    unfavouriteChat,
};
