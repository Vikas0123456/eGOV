const multer = require("multer");
const path = require("path");
const fs = require("fs");
const documentsModel = require("../models/documents");
const documentListModel = require("../models/documentList");
const { default: axios } = require("axios");
const os = require("os");
const { Op } = require("sequelize");
const { Sequelize } = require("../config/db.connection");

// const notifyMicroservice = async (changedEntity) => {
//     const services = [
//         `${process.env.USERSERVICE}web/webhook`, 
//         `${process.env.TICKETSERVICE}/web/webhook`,
//         // `${process.env.SERVICEMANAGEMENT}web/webhook`,
//         `${process.env.NOTIFICATIONSERVICE}web/webhook`,
        
//         `${process.env.PAYMENTSERVICE}web/webhook`,
//         `${process.env.DEPARTMENTREPORTSERVICE}web/webhook`,
//         `${process.env.CHATSERVICE}web/webhook`


//     ];

//     const notifyService = async (url) => {
//         try {
//             await axios.post(url, { changedEntity });
//             console.log(`Microservice notified: ${url}`);
//         } catch (error) {
//             console.error(`Error notifying microservice ${url}:`, error);
//         }
//     };

//     for (const service of services) {
//         await notifyService(service);
//     }
// };

const extractDataFromRequest = (req) => {
    try {
        const jwtPayloadIndex = req.rawHeaders.indexOf("jwtPayload");
        if (jwtPayloadIndex !== -1) {
            const jwtPayloadString = req.rawHeaders[jwtPayloadIndex + 1];
            const jwtPayload = JSON.parse(jwtPayloadString);
            const userId = jwtPayload.userId;
            const ipAddress = jwtPayload.ip;

            return { userId, ipAddress };
        } else {
            throw new Error("jwtPayload header not found in rawHeaders.");
        }
    } catch (error) {
        console.error("Error extracting user info from request:", error);
        throw new Error("Failed to extract user info from request.");
    }
};

const createUploadMiddleware = async (fieldsData) => {
    try {
        const createdDocuments = [];
        for (const documentData of fieldsData) {
            const document = await documentsModel.create(documentData);
            createdDocuments.push(document);
        }
        // await notifyMicroservice('fileupload');
        return createdDocuments;
    } catch (error) {
        throw new Error(error);
    }
};

const getDocumentsData = async (
    customerId,
    documentId,
    isShowInDocument,
    page,
    perPage,
    isGenerated,
    searchQuery,
    getLatestData = false
) => {
    try {
        const actualPage = (page && parseInt(page)) || 1;
        const actualPerPage = perPage && parseInt(perPage);
        const offset = (actualPerPage && (actualPage - 1) * actualPerPage) || 0;

        let whereCondition = {};

        // Check if customerId is provided, then add it to the WHERE condition
        if (customerId) {
            whereCondition.customerId = customerId;
        }

        // Check if documentId is provided, then add it to the WHERE condition
        if (documentId) {
            whereCondition.id = documentId;
        }

        if (isShowInDocument) {
            whereCondition.isShowInDocument = isShowInDocument;
        }

        if (isGenerated) {
            whereCondition.isGenerated = isGenerated;
        }

        if (searchQuery) {
            whereCondition.viewDocumentName = {
                [Op.like]: `%${searchQuery}%`,
            };
        }

        // options object for findAndCountAll
        let options = {
            where: whereCondition,
            order: [["createdDate", "DESC"]],
        };

        if (actualPerPage) {
            options.limit = actualPerPage;
            options.offset = offset;
        }

        if (getLatestData) {
            options.where = {
                ...whereCondition,
                id: {
                    [Op.in]: Sequelize.literal(`(
                        SELECT MAX(id)
                        FROM documents
                        GROUP BY documentSlug
                    )`),
                },
            };
            options.order = [["createdDate", "DESC"]];
        }
        

        const documents = await documentsModel.findAndCountAll(options);

        return documents;
    } catch (error) {
        throw new Error(error);
    }
};

const getDocumentsListService = async () => {
    try {
        const documents = await documentListModel.findAndCountAll();
        const formatedData = documents.rows.map((item) => {
            return {
                id: item.dataValues.id,
                documentName: item.dataValues.documentName,
                slug: item.dataValues.slug,
                documentFileType: JSON.parse(item.dataValues.documentFileType),
                isRequired: item.dataValues.isRequired,
                canApply: item.dataValues.canApply,
                createdDate: item.dataValues.createdDate,
                updateDate: item.dataValues.updateDate,
            };
        });
        return formatedData;
    } catch (error) {
        throw new Error(error);
    }
};

const updateDocumentNameById = async (id, documentName, req) => {
    try {
        const currentRecord = await documentsModel.findOne({
            attributes: ["userId", "customerId", "viewDocumentName"],
            where: {
                id,
            },
        });

        if (!currentRecord) {
            return { success: false, message: "Ticket record not found" };
        }

        let document;
        document = await documentsModel.update(
            { viewDocumentName: documentName },
            {
                where: {
                    id: id,
                },
            }
        );
        if (document) {
            document = await documentsModel.findOne({
                where: {
                    id: id,
                },
            });
        }

        const { ipAddress } = extractDataFromRequest(req);
        
        let auditLogBody = {
            recordId: id,
            action: "Rename Document",
            moduleName: "Documents",
            newValue: documentName,
            oldValue: currentRecord?.viewDocumentName,
            type: "0",
            userId: null,
            customerId: null,
            ipAddress: ipAddress,
        };

        if (currentRecord.customerId) {
            auditLogBody.type = "1";
            auditLogBody.customerId = currentRecord?.customerId;
        } else if (currentRecord.userId) {
            auditLogBody.type = "0";
            auditLogBody.userId = currentRecord?.userId;
        }
        try {
            await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
                data: auditLogBody,
            });
        } catch (error) {
            console.error("Error generating audit log:", error);
        }
        // await notifyMicroservice('fileupload');
        return document;
    } catch (error) {
        throw new Error(error);
    }
};

const getDocumentsDataForUserNotification = async (userId) => {
    try {
        let whereCondition = {};
        if (userId) {
            whereCondition.userId = userId;
        }

        const documents = await documentsModel.findAndCountAll({
            where: whereCondition,
        });

        return documents;
    } catch (error) {
        throw new Error(error);
    }
};

const getDocumentsDataForCustomerNotification = async (customerId) => {
    try {
        let whereCondition = {};
        if (customerId) {
            whereCondition.customerId = customerId;
        }

        const documents = await documentsModel.findAndCountAll({
            where: whereCondition,
        });

        return documents;
    } catch (error) {
        throw new Error(error);
    }
};
const getDocumentsDataForAdminApplication = async (documentIds) => {
    try {
        let whereCondition = {};
        
        if (documentIds) {
            whereCondition.id = { [Op.in]: documentIds };
        }

        const documents = await documentsModel.findAndCountAll({
            where: whereCondition,
            attributes: [
                "id",
                "customerId",
                "documentName",
                "documentType",
                "documentPath",
            ],
        });

        return documents;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteDocumentById = async (id, documentName) => {
    console.log(id, documentName);


    if (!id && !documentName) {
        return { success: false, message: "Either id or documentName must be provided" };
    }

    try {
        const currentRecord = await documentsModel.findOne({
            where: {
                [Sequelize.Op.or]: [
                    id ? { id } : null,
                    documentName ? { documentName } : null
                ],
            },
        });

        if (!currentRecord) {
            return { success: false, message: "Record not found" };
        }

        await documentsModel.destroy({
            where: {
                id: currentRecord.id,
            },
        });

        const filePath = path.join(__dirname, "../../public", currentRecord.documentName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return { success: true, message: "Document deleted successfully" };
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    createUploadMiddleware,
    getDocumentsData,
    getDocumentsListService,
    updateDocumentNameById,
    getDocumentsDataForUserNotification,
    getDocumentsDataForCustomerNotification,
    getDocumentsDataForAdminApplication,
    deleteDocumentById
};
