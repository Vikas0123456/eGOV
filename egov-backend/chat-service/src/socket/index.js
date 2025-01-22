const { Op } = require("sequelize");
const { chatMessageModel } = require("../models");

const usersStatus = {};

const socketManager = (io) => {
    const handleError = (socket, errorMessage) => {
        socket.emit("error", errorMessage);
        console.error(errorMessage);
    };

    const updateUserStatus = (userId, status) => {
        usersStatus[userId] = status;
        io.emit("user-status-update", { userId, status });
    };
    io.on("connection", (socket) => {
        socket.on("setup", (userId) => {
            try {
                socket.userId = userId;
                updateUserStatus(userId, {
                    online: true,
                    away: false,
                    lastSeen: new Date(),
                });
                socket.emit("setup-complete");
            } catch (error) {
                handleError(socket, "Error setting up the connection");
            }
        });

        socket.on("join-chat", (userId) => {
            try {
                socket.join(userId);
            } catch (error) {
                handleError(socket, "Error joining the chat room");
            }
        });

        socket.on("chat-create", (data) => {
            const participants =
                data.participants && JSON.parse(data?.participants);

            if (data.isGroup) {
                const recipients = participants.filter(
                    (participant) => participant !== data.createdBy
                );
                recipients.forEach((participant) => {
                    socket.to(participant).emit("chat-created", data);
                });
            } else {
                const recipient = participants.find(
                    (participant) => participant !== data.createdBy
                );

                if (recipient) {
                    socket.to(recipient).emit("chat-created", data);
                }
            }

            // socket
            //     .to(recipient)
            //     .emit("chat-deleted", { chatId: data.chatId, participants });
        });
        socket.on("delete-group-chat", (data) => {
            const participants =
                data.participants && JSON.parse(data?.participants);

            const recipient = participants.find(
                (participant) => participant !== data.userId
            );

            socket
                .to(recipient)
                .emit("chat-deleted", { chatId: data.chatId, participants });
        });

        socket.on("new-message", (data) => {
            try {
                const participants = JSON.parse(data.chat.participants);
                const senderId = data.message.senderId;

                if (data.chat.isGroup) {
                    const recipients = participants.filter(
                        (participant) => participant !== senderId
                    );
                    recipients.forEach((participant) => {
                        socket.to(participant).emit("received-message", data);
                    });
                } else {
                    const recipient = participants.find(
                        (participant) => participant !== senderId
                    );
                    if (recipient) {
                        socket.to(recipient).emit("received-message", data);
                    }
                }
            } catch (error) {
                handleError(socket, "Error handling new message");
            }
        });

        socket.on("user-online", (userId) => {
            updateUserStatus(userId, {
                online: true,
                away: false,
                lastSeen: new Date(),
            });
        });

        socket.on("user-away", (userId) => {
            updateUserStatus(userId, {
                online: false,
                away: true,
                lastSeen: new Date(),
            });
        });

        socket.on("user-offline", (userId) => {
            updateUserStatus(userId, {
                online: false,
                away: false,
                lastSeen: new Date(),
            });
        });

        socket.on("deleted-chat", async (data) => {
            try {
                const participants =
                    data.participants && JSON.parse(data.participants);
                const userId = data.userId;

                const messages = await chatMessageModel.findAll({
                    where: {
                        chatId: data.chatId,
                    },
                });

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

                const recipientIds = participants.filter(
                    (participant) => participant !== userId
                );
                recipientIds.forEach((participant) => {
                    socket.to(participant).emit("chat-deleted", {
                        chatId: data.chatId,
                        deletedBy: userId,
                    });
                });
            } catch (error) {
                handleError(socket, "Error deleting chat");
            }
        });

        socket.on("leave-group-chat", async ({ chatId, userId }) => {
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
                    io.to(chatId).emit("group-chat-deleted", {
                        chatId,
                        message: "Group chat deleted as no participants remain",
                    });
                } else {
                    await chatListModel.update(
                        { participants: JSON.stringify(updatedParticipants) },
                        { where: { id: chatId } }
                    );
                    io.to(chatId).emit("user-left", {
                        userId,
                        chatId,
                        message: "User left the group chat",
                    });
                }

                const recipientIds = updatedParticipants;
                recipientIds.forEach((participant) => {
                    socket.to(participant).emit("user-left", {
                        userId,
                        chatId,
                        message: "User left the group chat",
                    });
                });
            } catch (error) {
                handleError(socket, "Error handling leave group chat");
            }
        });

        socket.on("message-seen", async ({ userId, chatId, senderId }) => {
            try {
                const messages = await chatMessageModel.findAll({
                    where: {
                        chatId: chatId,
                        seenBy: {
                            [Op.or]: [
                                { [Op.is]: null },
                                { [Op.notLike]: `%${userId}%` },
                            ],
                        },
                    },
                });

                const updatePromises = messages.map(async (message) => {
                    const isSeenArray = message.seenBy
                        ? JSON.parse(message.seenBy)
                        : [];
                    if (
                        !isSeenArray.includes(userId) &&
                        userId !== message.senderId
                    ) {
                        isSeenArray.push(userId);
                    }
                    return chatMessageModel.update(
                        { seenBy: JSON.stringify(isSeenArray) },
                        { where: { id: message.id } }
                    );
                });

                await Promise.all(updatePromises);

                io.to(senderId).emit("messages-seen-updated", {
                    chatId,
                    senderId,
                });
                io.to(chatId).emit("update-unseen-count", {
                    chatId,
                    seenBy: userId,
                });
            } catch (error) {
                console.error("Error updating messages:", error.message);
            }
        });

        socket.on("typing", (data) => {
            const { userId, userName, chatData, isTyping } = data;

            const participants = JSON.parse(chatData?.participants);
                const senderId = userId;

                if (chatData.isGroup) {
                    const recipients = participants.filter(
                        (participant) => participant !== senderId
                    );
                    recipients.forEach((participant) => {
                        socket.to(participant).emit("typing_status", data);
                    });
                } else {
                    const recipient = participants.find(
                        (participant) => participant !== senderId
                    );
                    if (recipient) {
                        socket.to(recipient).emit("typing_status", data);
                    }
                }
        });
        
        socket.on("message-delete", (data) => {
            const { userId, chatData} = data;

            const participants = JSON.parse(chatData?.participants);
                const senderId = userId;

                if (chatData.isGroup) {
                    const recipients = participants.filter(
                        (participant) => participant !== senderId
                    );
                    recipients.forEach((participant) => {
                        socket.to(participant).emit("message-deleted", data);
                    });
                } else {
                    const recipient = participants.find(
                        (participant) => participant !== senderId
                    );
                    if (recipient) {
                        socket.to(recipient).emit("message-deleted", data);
                    }
                }
        });

        socket.on("disconnect", () => {
            const userId = socket.userId;
            if (userId) {
                updateUserStatus(userId, {
                    online: false,
                    away: false,
                    lastSeen: new Date(),
                });
            }
        });
    });
};

module.exports = socketManager;
