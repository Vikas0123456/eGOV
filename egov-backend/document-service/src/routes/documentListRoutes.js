const express = require("express");
const {
    createDocumentList,
    getDocumentLists,
    deleteDocumentList,
    updateDocumentList,
} = require("../controllers/documentListController");
const route = express.Router();

route.post("/document-list/create", createDocumentList);
route.post("/document-list/view", getDocumentLists);
route.post("/document-list/update", updateDocumentList);
route.post("/document-list/delete", deleteDocumentList);

module.exports = route;
