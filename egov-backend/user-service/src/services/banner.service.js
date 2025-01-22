const { default: axios } = require("axios");
const { bannerModel } = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const {
    generateAuditLog,
    extractDataFromRequest,
  } = require("./auditLog.service");

const createBanner = async (requestBody, req) => {
    try {
        const department = await bannerModel.create(requestBody);
        const { userId: extractedUserId, ipAddress } =
          extractDataFromRequest(req);
        const finalUserId = extractedUserId;
        try {
          await generateAuditLog(
            "-",
            "Create",
            "Banner",
            requestBody,
            "N/A",
            "0",
            finalUserId,
            null,
            ipAddress
          );
        } catch (error) {
          console.error("Error generating audit log:", error);
        }
        return department;
    } catch (error) {
        throw new Error(error);
    }
};
const deleteBannerById = async (bannerId, req) => {
    try {
        if (bannerId) {
            const [banner] = await bannerModel.update(
                { isDeleted: "1" },
                {
                    where: {
                        id: bannerId,
                    },
                }
            );
            const { userId: extractedUserId, ipAddress } =
              extractDataFromRequest(req);
            const finalUserId = extractedUserId;
            try {
              await generateAuditLog(
                bannerId,
                "Delete",
                "Banner",
                bannerId,
                "N/A",
                "0",
                finalUserId,
                null,
                ipAddress
              );
            } catch (error) {
              console.error("Error generating audit log:", error);
            }
            return banner;
        }
    } catch (error) {
        throw new Error(error);
    }
};
const updateBannerById = async (bannerId, updatedData, req) => {
    
    try {

        const currentRecord = await bannerModel.findOne({
          where: {
            id: bannerId,
          },
        });

        if (!currentRecord) {
          return { success: false, message: "Banner record not found" };
        }

        let banner;
        banner = await bannerModel.update(updatedData, {
            where: {
                id: bannerId,
            },
        });
        if (banner) {
            banner = await bannerModel.findOne({
                where: {
                    id: bannerId,
                },
            });
        }
        const { userId: extractedUserId, ipAddress } =
          extractDataFromRequest(req);
        const finalUserId = extractedUserId;
        try {
          await generateAuditLog(
            bannerId,
            "Update",
            "Banner",
            updatedData,
            currentRecord.dataValues,
            "0",
            finalUserId,
            null,
            ipAddress
          );
        } catch (error) {
          console.error("Error generating audit log:", error);
        }
        return banner;
    } catch (error) {
        
        throw new Error(error);
    }
};

const getBannerList = async (
    id,
    page,
    perPage,
    searchFilter,
    sortOrder,
    orderBy = 'id',
    isCoreteam
) => {
    try {
        if (id) {
            // If ID is provided, fetch a single department by ID
            return await bannerModel.findAndCountAll({
                where: {
                    id: id,
                    isDeleted: "0",
                },
            });
        } else {
            const actualPage = (page && parseInt(page, 10)) || 1;
            const actualPerPage = (perPage && parseInt(perPage, 10)) || null;
            const offset = (actualPage - 1) * actualPerPage;

            let whereClause = {
                isDeleted: "0",
            };

            if (isCoreteam == 0) {
                whereClause = { ...whereClause, isActive: "1", 
                imageId: {
                    [Op.not]: null, // Like: sellDate IS NOT NULL
                }, 
            };
            }

            if (searchFilter) {
                // Apply search filter by department name using a LIKE operator
                whereClause[Op.or] = [
                    {
                        title: {
                            [Op.like]: `%${searchFilter}%`,
                        },
                    },
                ];
            }

            // Define the order based on sortOrder parameter
            let order = [];
            if (orderBy && sortOrder) {
                order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
            }


            let documentList;
            try {
                const documentResponse = await axios.post(
                    `${process.env.DOCUMENT_URL}document/list/upload`,
                    {data: {}}
                );
                documentList = documentResponse?.data?.data?.rows;

            } catch (error) {
                console.log(error);
            }

            const result = await bannerModel.findAndCountAll({
                where: whereClause,
                limit: actualPerPage,
                offset: offset,
                order: order, // Apply the defined order
                raw: true, // Return raw data instead of Sequelize instances
            });
        

            const newResponseData = result.rows.map((application, idx) => {
                let findDocumentData;
                findDocumentData = documentList.find(
                    (doc) => doc.id === application?.imageId
                );
                return {
                    ...application,
                    imageData: {
                        id: findDocumentData?.id,
                        documentName: findDocumentData?.documentName,
                        documentType: findDocumentData?.documentType,
                        documentPath: findDocumentData?.documentPath,
                        fileSize: findDocumentData?.fileSize,
                    },
                    altText: application.title,
                    key: idx + 1,
                };
            });
            return { count: result.count, rows: newResponseData };
        }
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    createBanner,
    deleteBannerById,
    updateBannerById,
    getBannerList,
};
