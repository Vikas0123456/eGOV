const express = require("express");
const createUploadMiddleware = require("../middleware/fileUpload");
const {
    uploadDocuments,
    getDocuments,
    getDocumentslist,
    updateDocumentName,
    getDocumentsForUserNotification,
    getDocumentsForCustomerNotification,
    getDocumentsForAdmin,
    deleteDocument,
    deleteCustomerData,
    transferDataToCustomer,
} = require("../controllers/fileUploadController");
const route = express.Router();

route.post(
    "/documentService/uploading",
    createUploadMiddleware,
    uploadDocuments
);
route.post("/view", getDocuments);
route.post("/alldocument/list", getDocumentslist);
route.put("/document/nameUpdate", updateDocumentName);
route.post("/document/delete", deleteDocument);

// Backend use only for communicate b/w two projects
route.post("/document/list", getDocumentslist);
route.post("/document/list/upload", getDocuments);
route.post("/document/list/uploadAdmin", getDocumentsForAdmin);
route.post("/document-user-notification", getDocumentsForUserNotification);
route.post(
    "/document-customer-notification",
    getDocumentsForCustomerNotification
);
route.post("/deleteCustomerAlldata", deleteCustomerData);
route.post("/transferDocument",transferDataToCustomer)

module.exports = route;
