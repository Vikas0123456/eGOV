const documentsModel = require("../models/documents");
const {
    createUploadMiddleware,
    getDocumentsData,
    getDocumentsListService,
    updateDocumentNameById,
    getDocumentsDataForUserNotification,
    getDocumentsDataForCustomerNotification,
    getDocumentsDataForAdminApplication,
    deleteDocumentById,
} = require("../services/fileupload.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const { default: axios } = require("axios");


const uploadDocuments = async (req, res) => {
    try {
        const uploadedFiles = req.files;
        const {
            viewDocumentName,
            documentSlug,
            customerId,
            userId,
            isGenerated,
            isShowInDocument,
        } = req.body;
        const parseCustomerId = customerId ? JSON.parse(customerId) : null;
        const parseUserId = userId ? JSON.parse(userId) : null;

        const fileDetails = uploadedFiles?.map((file) => {
            return {
                viewDocumentName: viewDocumentName,
                documentName: file.filename,
                documentSlug: documentSlug || null,
                documentPath: process.env.IMAGE_PATH + file.filename,
                documentType: file.mimetype,
                customerId: parseCustomerId,
                userId: parseUserId,
                isGenerated: isGenerated,
                isShowInDocument: isShowInDocument,
                fileSize: file.size,
            };
        });

        const createdDocs = await createUploadMiddleware(fileDetails);

        return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.DOCUMENTS.ADDED_SUCCESS,
            success: true,
            data: [...createdDocs],
        });
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const getDocuments = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const {
            customerId,
            documentId,
            isShowInDocument,
            page,
            perPage,
            isGenerated,
            searchQuery,
            getLatestData
        } = reqBody;

        let getDocs = await getDocumentsData(
            customerId,
            documentId,
            isShowInDocument,
            page,
            perPage,
            isGenerated,
            searchQuery,
            getLatestData
        );
        if (getDocs) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.FETCH_SUCCESS,
                success: true,
                data: { ...getDocs },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.FETCH_FAILED,
                success: false,
                data: {},
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

const getDocumentslist = async (req, res) => {
    try {
        let getDocsList = await getDocumentsListService();

        if (getDocsList) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.LIST_FETCH_SUCCESS,
                success: true,
                data: [...getDocsList],
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.LIST_FETCH_FAILED,
                success: false,
                data: {},
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

const updateDocumentName = async (req, res) => {
    try {
        const { id, documentName } = req.body.data;

        let getDocument = await updateDocumentNameById(id, documentName, req);
        if (getDocument) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.NAME_UPDATE_SUCCESS,
                success: true,
                data: { ...getDocument },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.NAME_UPDATE_FAILED,
                success: false,
                data: {},
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

const getDocumentsForUserNotification = async (req, res) => {
    try {
        const { userId } = req.body;
        let getDocs = await getDocumentsDataForUserNotification(userId);
        if (getDocs) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.FETCH_SUCCESS,
                success: true,
                data: { ...getDocs },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.FETCH_FAILED,
                success: false,
                data: {},
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

const getDocumentsForCustomerNotification = async (req, res) => {
    try {
        const { customerId } = req.body;
        let getDocs = await getDocumentsDataForCustomerNotification(customerId);
        if (getDocs) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.FETCH_SUCCESS,
                success: true,
                data: { ...getDocs },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.FETCH_FAILED,
                success: false,
                data: {},
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

const getDocumentsForAdmin = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { documentIds } = reqBody;

        let getDocs = await getDocumentsDataForAdminApplication(documentIds);
        if (getDocs) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.FETCH_SUCCESS,
                success: true,
                data: { ...getDocs },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.FETCH_FAILED,
                success: false,
                data: {},
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

const deleteDocument = async (req, res) => {
    try {
        const { id, documentName } = req.body.data;

        let getDocument = await deleteDocumentById(id, documentName);
        if (getDocument) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENTS.DELETE_SUCCESS,
                success: true,
                data: { ...getDocument },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.DOCUMENTS.DELETE_FAILED,
                success: false,
                data: {},
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

const deleteCustomerData = async (req, res) => {
    const { customerId, name, email, ipAddress } = req.body.data;
    try {
        await documentsModel.destroy({ where: { customerId }});

        const auditLogBody = {
            recordId: customerId,
            action: `Customer ( ${name} - ${email} ) document data deleted successfully`,
            moduleName: "Document Service",
            newValue: JSON.stringify({
                customerId: customerId,
                name: name,
                email: email
              }),
            oldValue: "N/A",
            type: "2",
            userId: null,
            customerId,
            ipAddress,
          };
          try {
            await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
              data: auditLogBody,
            });
          } catch (error) {
            console.error(error);
          }
  
        return res.status(STATUS_CODES.SUCCESS).json({
          message: 'Data deleted successfully',
          success: true,
          data: {},
        });
    } catch (error) {
        const auditLogBody = {
            recordId: customerId,
            action: `Customer ( ${name} - ${email} ) document data delete failed`,
            moduleName: "Document Service",
            newValue: JSON.stringify({
                customerId: customerId,
                name: name,
                email: email
              }),
            oldValue: "N/A",
            type: "2",
            userId: null,
            customerId,
            ipAddress,
          };
          try {
            await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
              data: auditLogBody,
            });
          } catch (error) {
            console.error(error);
          }
      
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: error.message,
        success: false,
        data: {},
      });
    }
  };
  const transferDataToCustomer = async (req, res) => {
    const { currentCustomerDetails, transferCustomerDetails, ipAddress, customerId } = req.body.data;
  
    let documentsIds = []; // Declare here to use in error handling if needed
  
    try {
      // Fetch document IDs
      const documents = await documentsModel.findAll({
        attributes: ['id'],
        where: {
          customerId,
          isShowInDocument: "1",
          isGenerated: "0",
        },
      });
  
      documentsIds = documents.map(doc => doc.id);
  
      if (!documentsIds?.length) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: "No Document found",
          success: true,
          data: {},
        });
      }
  
      // Update documents with new customer ID
      await documentsModel.update(
        { customerId: transferCustomerDetails?.customerId },
        {
          where: {
            id: documentsIds,
            customerId: currentCustomerDetails?.customerId,
            isShowInDocument: "1",
            isGenerated: "0",
          },
        }
      );
  
      // Create audit log for a successful transfer
      const successAuditLog = {
        recordId: JSON.stringify(documentsIds),
        action: `Customer (${currentCustomerDetails?.name} - ${currentCustomerDetails?.email}) document data transferred to customer (${transferCustomerDetails?.name} - ${transferCustomerDetails?.email}) successfully`,
        moduleName: "Document Service",
        newValue: JSON.stringify({
          customerId: currentCustomerDetails?.customerId,
          name: currentCustomerDetails?.name,
          email: currentCustomerDetails?.email,
        }),
        oldValue: "N/A",
        type: "2",
        userId: null,
        customerId: currentCustomerDetails?.customerId,
        ipAddress,
      };
  
      try {
        // Send audit log for the successful operation
        await axios.post(`${process.env.USERSERVICE}auditLog/create`, { data: successAuditLog });
      } catch (auditError) {
        console.error("Audit log creation failed:", auditError.message);
      }
  
      return res.status(STATUS_CODES.SUCCESS).json({
        message: "Document data transferred successfully",
        success: true,
        data: {},
      });
    } catch (error) {
        console.error("Error transferring document data:", error.message);
  
        // Prepare the audit log body for a failed transfer
        const errorAuditLog = {
          recordId: JSON.stringify(documentsIds),
          action: `Customer (${currentCustomerDetails?.name} - ${currentCustomerDetails?.email}) document data transfer failed`,
          moduleName: "Document Service",
          newValue: JSON.stringify({
            customerId: currentCustomerDetails?.customerId,
            name: currentCustomerDetails?.name,
            email: currentCustomerDetails?.email,
          }),
          oldValue: "N/A",
          type: "2",
          userId: null,
          customerId: currentCustomerDetails?.customerId,
          ipAddress,
        };
    
        try {
          // Send audit log for the failed operation
          await axios.post(`${process.env.USERSERVICE}auditLog/create`, { data: errorAuditLog });
        } catch (auditError) {
          console.error("Audit log creation failed:", auditError.message);
        }
  
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: "Failed to transfer document data",
        success: false,
        error: error.message,
        data: {},
      });
    }
  };
  

module.exports = {
    uploadDocuments,
    getDocuments,
    getDocumentslist,
    updateDocumentName,
    getDocumentsForUserNotification,
    getDocumentsForCustomerNotification,
    getDocumentsForAdmin,
    deleteDocument,
    deleteCustomerData,
    transferDataToCustomer
};
