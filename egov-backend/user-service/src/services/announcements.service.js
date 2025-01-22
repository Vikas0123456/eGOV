const {
    announcementModel,
    usersModel,
} = require("../models");
const { sequelize } = require("../config/db.connection");
const { Op, literal } = require("sequelize");
const moment = require("moment");
const { default: axios } = require("axios");
const { extractDataFromRequest, generateAuditLog } = require("./auditLog.service");

// const announcementFindByName = async (departmentName) => {
//     try {
//         const department = await announcementModel.findOne({
//             where: {
//                 departmentName: departmentName,
//             },
//         });
//         return department;
//     } catch (error) {
//         throw new Error(error);
//     }
// };

const createAnnouncement = async (requestBody, req) => {
    try {
        const department = await announcementModel.create(requestBody);

        const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
        const finalUserId = extractedUserId;
        try {
          await generateAuditLog(
            "-",
            "Create",
            "Announcement",
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
const deleteAnnouncementById = async (announcementId, req) => {
    try {
        if (announcementId) {
            const [announcement] = await announcementModel.update(
                { isDeleted: "1" },
                {
                    where: {
                        id: announcementId,
                    },
                }
            );

            const { userId: extractedUserId, ipAddress } =
                extractDataFromRequest(req);
            const finalUserId = extractedUserId;

            try {
                await generateAuditLog(
                    announcementId,
                    "Delete",
                    "Announcement",
                    announcementId,
                    "N/A",
                    "0",
                    finalUserId,
                    null,
                    ipAddress
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            return announcement;
        }
    } catch (error) {
        throw new Error(error);
    }
};
const updateAnnouncementById = async (announcementId, updatedData, req) => {
    try {
        let announcement;

        const announcementOldValue = await announcementModel.findOne({
            where: {
                id: announcementId,
            },
        });
        
        [announcement] = await announcementModel.update(updatedData, {
            where: {
                id: announcementId,
            },
        });
        if (announcement) {
            announcement = await announcementModel.findOne({
                where: {
                    id: announcement,
                },
            });
        }

        const { userId: extractedUserId, ipAddress } = extractDataFromRequest(req);
        const finalUserId = extractedUserId;
        try {
          await generateAuditLog(
            announcementId,
            "Update",
            "Announcement",
            updatedData,
            announcementOldValue?.dataValues,
            "0",
            finalUserId,
            null,
            ipAddress
          );
        } catch (error) {
          console.error("Error generating audit log:", error);
        }

        return announcement;
    } catch (error) {
        throw new Error(error);
    }
};

const getAnnouncementList = async (page, perPage, userId, isCoreteam) => {
    
    try {
        const actualPage = (page && parseInt(page, 10)) || 1;
        const actualPerPage = (perPage && parseInt(perPage, 10)) || 5;
        const offset = (actualPage - 1) * actualPerPage;
        let whereClause = {
            isDeleted: "0",
        };

        const currentDateTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        let departmentsData;
        try {
            const documentResponse = await axios.post(
                `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
            );
            departmentsData = documentResponse?.data?.data?.rows;
        } catch (error) {
            console.log(error);
        }

        function getDepartmentNames(announcement, departmentsData) {
            if (
                Object.keys(announcement).length > 0 &&
                announcement.departmentId === null
            ) {
                return JSON.stringify([]);
            } else if (
                Object.keys(announcement).length > 0 &&
                announcement.departmentId.length > 0
            ) {
                const departmentMap = {};
                departmentsData.forEach((department) => {
                    departmentMap[department.id] =
                        department.departmentName;
                });

                let departmentIds = announcement.departmentId.split(",");

                departmentIds = departmentIds.map((id) => parseInt(id));

                const departmentNames = departmentIds.map(
                    (id) => departmentMap[id]
                );

                return JSON.stringify(departmentNames);
            } else {
                return JSON.stringify([]);
            }
        }

        //citizen
        if (isCoreteam == "0") {
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    {
                        [Op.and]: [
                            literal(
                                `CAST(displayTo AS DATETIME) >= '${currentDateTime}'`
                            ), // Cast displayTo to datetime and compare
                            literal(
                                `CAST(displayFrom AS DATETIME) <= '${currentDateTime}'`
                            ), // Cast displayFrom to datetime and compare
                        ],
                    },
                    {
                        [Op.or]: [
                            { displayTo: { [Op.is]: null } }, // Check for null displayTo
                            { displayFrom: { [Op.is]: null } }, // Check for null displayFrom
                        ],
                    },
                ],
            };

            let result = await announcementModel.findAndCountAll({
                where: whereClause,
                limit: actualPerPage,
                offset: offset,
                order: [["id", "DESC"]],
                attributes: [
                    "id",
                    "title",
                    "isCoreTeam",
                    "departmentId",
                    "displayFrom",
                    "displayTo",
                    "createdBy",
                    "updatedBy",
                    "tag",
                    "announcementDate",
                    "createdDate",
                    "updatedDate",
                ],
                raw: true,
            });

            result.rows = result.rows.map((row) => {
                let departments = getDepartmentNames(row, departmentsData);
                return {
                    ...row,
                    displayFrom:
                        row.displayFrom != null
                            ? moment(row.displayFrom).format("YYYY-MM-DD")
                            : null,
                    displayTo:
                        row.displayFrom != null
                            ? moment(row.displayTo).format("YYYY-MM-DD")
                            : null,
                    announcementDate:
                        row.announcementDate != null
                            ? moment(row.announcementDate).format("YYYY-MM-DD")
                            : null,
                    departments: departments,
                };
            });

            return result;
        }

        //admin
        if (isCoreteam == "1") {
            const admin = await usersModel.findOne({
                where: {
                    id: userId,
                },
            });

            if (admin.dataValues.departmentId && admin.dataValues.isCoreTeam === "0") {
                whereClause = {
                    ...whereClause,
                    
                    [Op.or]: [
                        {
                            departmentId: {
                                [Op.or]: [
                                    sequelize.literal(`FIND_IN_SET('${admin.dataValues.departmentId}', departmentId) > 0`),
                                    {
                                        [Op.like]: `${admin.dataValues.departmentId},%`,
                                    }, // Match when ID is at the beginning of the list
                                    {
                                        [Op.like]: `%,${admin.dataValues.departmentId},%`,
                                    }, // Match when ID is in the middle of the list
                                    {
                                        [Op.like]: `%,${admin.dataValues.departmentId}`,
                                    }, // Match when ID is at the end of the list
                                    { [Op.eq]: admin.dataValues.departmentId }, // Match when ID is the only value in the list
                                ],
                            },
                        },
                        {
                            [Op.and]: [
                                literal(
                                    `CAST(displayTo AS DATETIME) >= '${currentDateTime}'`
                                ), // Cast displayTo to datetime and compare
                                literal(
                                    `CAST(displayFrom AS DATETIME) <= '${currentDateTime}'`
                                ), // Cast displayFrom to datetime and compare
                            ],
                        },
                        {
                            [Op.or]: [
                                { displayTo: { [Op.is]: null } }, // Check for null displayTo
                                { displayFrom: { [Op.is]: null } }, // Check for null displayFrom
                            ],
                        },
                    ],
                };

                let result = await announcementModel.findAndCountAll({
                    where: whereClause,
                    limit: actualPerPage,
                    offset: offset,
                    order: [["id", "DESC"]],
                    attributes: [
                        "id",
                        "title",
                        "isCoreTeam",
                        "departmentId",
                        "displayFrom",
                        "displayTo",
                        "createdBy",
                        "updatedBy",
                         "tag",
                        "announcementDate",
                        "createdDate",
                        "updatedDate",
                    ],
                    raw: true,
                });

                result.rows = result.rows.map((row) => ({
                    ...row,
                    displayFrom:
                        row.displayFrom != null
                            ? moment(row.displayFrom).format("YYYY-MM-DD")
                            : null,
                    displayTo:
                        row.displayTo != null
                            ? moment(row.displayTo).format("YYYY-MM-DD")
                            : null,
                    announcementDate:
                        row.announcementDate != null
                            ? moment(row.announcementDate).format("YYYY-MM-DD")
                            : null,
                }));

                return result;
            } else {
                return [];
            }
        }

        if (!isCoreteam) {

            let result = await announcementModel.findAndCountAll({
                where: whereClause,
                limit: actualPerPage,
                offset: offset,
                order: [["id", "DESC"]],
                attributes: [
                    "id",
                    "title",
                    "isCoreTeam",
                    "departmentId",
                    "displayFrom",
                    "displayTo",
                    "createdBy",
                    "updatedBy",
                    "tag",
                    "announcementDate",
                    "createdDate",
                    "updatedDate",
                ],
                raw: true,
            });

            result.rows = result.rows.map((row) => {
                let departments = getDepartmentNames(row, departmentsData);
                return {
                    ...row,
                    displayFrom:
                        row.displayFrom != null
                            ? moment(row.displayFrom).format("YYYY-MM-DD")
                            : null,
                    displayTo:
                        row.displayFrom != null
                            ? moment(row.displayTo).format("YYYY-MM-DD")
                            : null,
                    announcementDate:
                        row.announcementDate != null
                            ? moment(row.announcementDate).format("YYYY-MM-DD")
                            : null,
                    departments: departments,
                };
            });

            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    createAnnouncement,
    deleteAnnouncementById,
    updateAnnouncementById,
    getAnnouncementList,
};
