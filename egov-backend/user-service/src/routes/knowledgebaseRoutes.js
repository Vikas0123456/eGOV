const express = require("express");
const { createKnowledgeBase, updateKnowledgeBase, getKnowledgeBase, deleteKnowledgeBase, getKnowledgeBaseById, listKnowledgeBase, listAuthors, deleteKnowledgeBases, knowledgeBaseData, listLikeCount } = require("../controllers/knowledgebaseController");
const route = express.Router();

route.post("/create", createKnowledgeBase);
route.put("/update", updateKnowledgeBase);
route.post("/view", getKnowledgeBase);
route.post("/data", knowledgeBaseData);
route.put("/delete", deleteKnowledgeBase);
route.post('/knowledgeBaseById', getKnowledgeBaseById);
route.post("/list", listKnowledgeBase);
route.post('/authors', listAuthors);
route.put("/multiple-delete", deleteKnowledgeBases);
route.post('/likeCount', listLikeCount);

module.exports = route;
