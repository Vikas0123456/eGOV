const express = require("express");
const {
    createChat,
    createChatMessage,
    getChatMessage,
    getPersonalChatList,
    getGroupChatList,
    updateChat,
    deleteChat,
    deleteGroupChat,
    deleteChatMessage,
    updateChatMessage,
    updateIsSeenMessage,
    getUnseenMessageCount,
    leaveChat,
    archiveChat,
    unarchiveChat,
    favouriteChat,
    unfavouriteChat,
} = require("../controllers/chatController");
const route = express.Router();

route.post("/createChat", createChat);
route.post("/updateChat", updateChat);
route.post("/deleteChat", deleteChat);
route.post("/getPersonalChatList", getPersonalChatList);
route.post("/getGroupChatList", getGroupChatList);
route.post("/createChatMessage", createChatMessage);
route.post("/updateChatMessage", updateChatMessage);
route.post("/updateIsSeenMessage", updateIsSeenMessage);
route.post("/deleteChatMessage", deleteChatMessage);
route.post("/deleteGroupChat", deleteGroupChat);
route.post("/getChatMessage", getChatMessage);
route.post("/getUnseenMessageCount", getUnseenMessageCount);
route.post("/leavechat", leaveChat);
route.post("/archiveChat", archiveChat);
route.post("/unarchiveChat", unarchiveChat);
route.post("/favouriteChat", favouriteChat);
route.post("/unfavouriteChat", unfavouriteChat);

module.exports = route;
