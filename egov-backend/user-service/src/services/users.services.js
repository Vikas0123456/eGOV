const { Op, Sequelize, literal } = require("sequelize");
const { default: axios } = require("axios");
const { sequelize } = require("../config/db.connection");
const {
    usersModel,
    rolesModel,
    userLoginSessionModel,
    logiHistoryAdminModel,
} = require("../models");
const crypto = require("crypto");
const { generateAuditLog } = require("./auditLog.service");

const findUserById = async (id) => {
    try {
        return await usersModel.findOne({
            where: {
                id: id,
            },
        });
    } catch (error) {
        throw new Error(`Error finding user by id: ${error.message}`);
    }
};

const findUserByEmail = async (email) => {
    try {
        return await usersModel.findOne({
            where: {
                email: email,
            },
            include: [
                {
                    model: rolesModel,
                    required: false,
                    attributes: ["id", "roleName" ,"isAdmin"],
                },
            ],
        });
    } catch (error) {
        throw new Error(`Error finding user by email: ${error.message}`);
    }
};

const createUser = async (requestBody) => {
    try {
        const user = await usersModel.create(requestBody);

        const createdUser = await usersModel.findOne({
            where: { id: user?.id },
        });

        try {
            await generateAuditLog(
                user.id,
                "Create",
                "Users",
                "N/A",
                createdUser.dataValues,
                "0",
                user.id,
                null,
                requestBody?.ipAddress
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return user;
    } catch (error) {
        throw new Error(error);
    }
};

const setUserPassword = async (password, id) => {
    try {
        return await usersModel.update(
            { password: password },
            {
                where: {
                    id: id,
                },
            }
        );
    } catch (error) {
        throw new Error(error);
    }
};

const isValidEmail = async (email) => {
    try {
        const user = await findUserByEmail(email);
        // If user is found and isValidEmail is '1', return true, otherwise return false
        return user && user?.dataValues.isValidEmail === "1";
    } catch (error) {
        throw new Error(error);
    }
};

const updateOTP = async (userId, otp, otpExpireDateTime) => {
    try {
        return await usersModel.update(
            {
                otp: otp,
                otpExpireDateTime: otpExpireDateTime,
            },
            {
                where: {
                    id: userId,
                },
            }
        );
    } catch (error) {
        throw new Error(error);
    }
};

const updateOTPByEmail = async (userEmail, otp, otpExpireDateTime) => {
    try {
        return await usersModel.update(
            {
                otp: otp,
                otpExpireDateTime: otpExpireDateTime,
            },
            {
                where: {
                    email: userEmail,
                },
            }
        );
    } catch (error) {
        throw new Error(error);
    }
};

const validateEmail = async (userId) => {
    try {
        await usersModel.update(
            { isValidEmail: "1" },
            { where: { id: userId } }
        );

        return { success: true };
    } catch (error) {
        throw new Error(error);
    }
};

const deleteUserById = async (userId, ipAddress) => {
    try {
        if (userId) {
            const [user] = await usersModel.update(
                { isDeleted: "1" },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            try {
                await generateAuditLog(
                    userId,
                    "Delete",
                    "Users",
                    userId,
                    "N/A",
                    "0",
                    userId,
                    null,
                    ipAddress
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            return user;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const updateUserById = async (userId, requestBody) => {
    try {
        const { email, ...updatedFields } = requestBody;
        let userUpdate;
        if (requestBody?.isCoreTeam === "1") {
            updatedFields.departmentId = null;
        }

        const updateResult = await usersModel.update(updatedFields, {
            where: {
                id: userId,
                isDeleted: "0",
            },
        });
        if (updateResult) {
            userUpdate = await usersModel.findOne({
                where: {
                    id: userId,
                    isDeleted: "0",
                },
            });
        }
        const currentRecord = await usersModel.findOne({
            where: {
                id: userId,
            },
        });

        if (!currentRecord) {
            return { success: false, message: "User record not found" };
        }

        try {
            await generateAuditLog(
                userId,
                "Update",
                "Users",
                requestBody,
                currentRecord.dataValues,
                "0",
                userId,
                null,
                requestBody?.ipAddress
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return userUpdate;
    } catch (error) {
        throw new Error(error);
    }
};

const getUserInfo = async (
    userId,
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    status,
    roleId,
    departmentId,
    isSupportTeam
) => {
    try {
        let documentList;
        try {
            const documentResponse = await axios.post(
                `${process.env.DOCUMENT_URL}document/list/upload`,
                { data: {} }
            );
            documentList = documentResponse?.data?.data?.rows;
        } catch (error) {
            console.log(error);
        }

        let departmentsData;
        try {
            const departmentResponse = await axios.post(
                `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
            );
            departmentsData = departmentResponse?.data?.data?.rows;
        } catch (error) {
            console.log(error);
        }

        function getDepartmentNameById(departmentId, departmentsData) {
            if (!departmentId || !departmentsData) return null;
                // Split the department string into an array
                const departmentIds = (departmentId || "").split(',').map(id => id.trim());
                // Find departments matching the IDs
                const departmentNames = departmentIds
                    .map(id => {
                        const department = departmentsData.find(dept => dept.id == id);
                        return department ? department.departmentName : null;
                    })
                    .filter(name => name); // Filter out nulls
        
                // Return comma-separated department names
                return departmentNames.length ? departmentNames.join(', ') : null;
        }

        let getUser;
        if (userId) {
            getUser = await usersModel.findAndCountAll({
                where: {
                    id: userId,
                    isDeleted: "0",
                },
                include: [
                    {
                        model: rolesModel,
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "profileImageId",
                    "departmentId",
                    "roleId",
                    [sequelize.col("role.roleName"), "roleName"],
                    [sequelize.col("role.isAdmin"), "isAdmin"],
                    "password",
                    "otp",
                    "isValidEmail",
                    "isSupportTeam",
                    "isCoreTeam",
                    "otpExpireDateTime",
                    "status",
                    "meetingLink",
                ],
            });

            let newData = getUser.rows.map((user) => {
                let findDocumentData = documentList.find(
                    (doc) => doc.id === user?.profileImageId
                );

                return {
                    ...user.toJSON(),
                    imageData: findDocumentData ? { ...findDocumentData } : {},
                    departmentName: getDepartmentNameById(
                        user.departmentId,
                        departmentsData
                    ),
                };
            });

            getUser = { count: getUser.count, rows: newData };
        } else {
            const actualPage = (page && parseInt(page, 10)) || 1;
            const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
            const offset = (actualPage - 1) * actualPerPage;

            const whereClause = {
                isDeleted: "0",
            };
            if (roleId) {
                whereClause.roleId = roleId;
            }
            if (departmentId && departmentId?.length > 0) {
                whereClause.departmentId = {
                       [Op.or]: departmentId.map(department => ({
                           [Op.like]: `%,${department},%`, // Match department in the middle
                       })).concat(departmentId.map(department => ({
                           [Op.like]: `${department},%`, // Match department at the start
                       }))).concat(departmentId.map(department => ({
                           [Op.like]: `%,${department}`, // Match department at the end
                       }))).concat(departmentId.map(department => ({
                           [Op.eq]: `${department}`, // Match single department
                       }))),
                   };;
               }
            if (status) {
                whereClause.status = status;
            }
            if(isSupportTeam){
                whereClause.isSupportTeam = isSupportTeam
            }

            // Filter Conditions
            if (filter) {
                whereClause[Op.or] = [
                    { email: { [Op.like]: `%${filter}%` } },
                    { name: { [Op.like]: `%${filter}%` } },
                    { phone: { [Op.like]: `%${filter}%` } },
                ];
            }

            // Sorting
            let order = [];
            if (sortBy) {
                order.push([sortBy, sortOrder === "asc" ? "ASC" : "DESC"]);
            }

         getUser = await usersModel.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: rolesModel,
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone",
                    "profileImageId",
                    "departmentId",
                    "roleId",
                    [sequelize.col("role.roleName"), "roleName"],
                    [sequelize.col("role.isAdmin"), "isAdmin"],
                    "password",
                    "otp",
                    "isValidEmail",
                    "isSupportTeam",
                    "isCoreTeam",
                    "otpExpireDateTime",
                    "status",
                ],
                limit: actualPerPage,
                offset: offset,
                order: order,
                raw: true,
            });

            let newData = getUser.rows.map((user) => {
                let findDocumentData = documentList.find(
                    (doc) => doc.id === user?.profileImageId
                );

                return {
                    ...user,
                    imageData: findDocumentData ? { ...findDocumentData } : {},
                    departmentName: getDepartmentNameById(
                        user.departmentId,
                        departmentsData
                    ),
                };
            });

            getUser = { count: getUser.count, rows: newData };
        }

        const usersWithImages = getUser?.rows?.map((user) => {
            const matchingImageData = documentList?.find(
                (image) => image.id === user.profileImageId
            );

            if (matchingImageData) {
                return {
                    ...user,
                    imageData: {
                        id: matchingImageData?.id,
                        customerId: matchingImageData?.customerId,
                        userId: matchingImageData?.userId,
                        documentName: matchingImageData?.documentName,
                        documentPath: matchingImageData?.documentPath,
                        fileSize: matchingImageData?.fileSize,
                    },
                };
            } else {
                return user;
            }
        });

        return {
            ...getUser,
            rows: usersWithImages,
        };
        // return getUser;
    } catch (error) {
        throw new Error(error);
    }
};

const updateUserInfoById = async (userId, requestBody) => {
    try {
        const { email, status, ...updatedFields } = requestBody;
        let userUpdate;

        const updateResult = await usersModel.update(updatedFields, {
            where: {
                id: userId,
                isDeleted: "0",
            },
        });
        if (updateResult) {
            // Checking if any rows were updated
            userUpdate = await usersModel.findOne({
                where: {
                    id: userId,
                    isDeleted: "0",
                },
            });
        }
        return userUpdate;
    } catch (error) {
        throw new Error(error);
    }
};

const getUserForDirectoryData = async (
    searchFilter,
    departmentId,
    page,
    perPage,
    isSupportTeam
) => {
    try {
        let departmentsData;
        try {
            const departmentResponse = await axios.post(
                `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
            );
            departmentsData = departmentResponse?.data?.data?.rows;
        } catch (error) {
            console.log(error);
        }

        function getDepartmentNameById(departmentId, departmentsData) {
            if (!departmentId || !departmentsData) return null;
                const departmentIds = (departmentId || "").split(',').map(id => id.trim());
                const departmentNames = departmentIds
                    .map(id => {
                        const department = departmentsData.find(dept => dept.id == id);
                        return department ? department.departmentName : null;
                    })
                    .filter(name => name);
        
                return departmentNames.length ? departmentNames.join(', ') : null;
        }

        const actualPage = (page && parseInt(page, 10)) || 1;
        const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
        const offset = (actualPage - 1) * actualPerPage;

        const whereClause = {
            isDeleted: "0",
            status: "1",
        };
        if(isSupportTeam){
            whereClause.isSupportTeam = isSupportTeam
        }
        if (departmentId && departmentId?.length > 0) {
         whereClause.departmentId = {
                [Op.or]: departmentId.map(department => ({
                    [Op.like]: `%,${department},%`, // Match department in the middle
                })).concat(departmentId.map(department => ({
                    [Op.like]: `${department},%`, // Match department at the start
                }))).concat(departmentId.map(department => ({
                    [Op.like]: `%,${department}`, // Match department at the end
                }))).concat(departmentId.map(department => ({
                    [Op.eq]: `${department}`, // Match single department
                }))),
            };;
        }

        if (searchFilter) {
            whereClause[Op.or] = [
                { email: { [Op.like]: `%${searchFilter}%` } },
                { name: { [Op.like]: `%${searchFilter}%` } },
            ];
        }

        // Sorting
        let order = [["name", "ASC"]];

        let getUser = await usersModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: rolesModel,
                    attributes: ["id", "roleName" ,"isAdmin"],
                },
            ],
            attributes: [
                "id",
                "name",
                "email",
                "phone",
                "profileImageId",
                "departmentId",
                "roleId",
                [sequelize.col("role.roleName"), "roleName"],
                [sequelize.col("role.isAdmin"), "isAdmin"],
                "password",
                "otp",
                "isValidEmail",
                "isSupportTeam",
                "isCoreTeam",
                "otpExpireDateTime",
                "status",
            ],
            order: order,
            limit: actualPerPage,
            offset: offset,
            raw: true,
        });

        let newData = getUser.rows.map((user) => {
            return {
                ...user,
                departmentName: getDepartmentNameById(
                    user.departmentId,
                    departmentsData
                ),
            };
        });

        getUser = { count: getUser.count, rows: newData };

        let imageData = [];
        try {
            const documentResponse = await axios.post(
                `${process.env.DOCUMENT_URL}document/list/upload`,
                { data: {} }
            );
            imageData = documentResponse?.data?.data?.rows || [];
        } catch (error) {
            console.log("Document API call failed", error);
        }

        const usersWithImages = getUser?.rows?.map((user) => {
            const matchingImageData = imageData?.find(
                (image) => image.id === user.profileImageId
            );

            if (matchingImageData) {
                return {
                    ...user,
                    imageData: {
                        id: matchingImageData?.id,
                        customerId: matchingImageData?.customerId,
                        userId: matchingImageData?.userId,
                        documentName: matchingImageData?.documentName,
                        documentPath: matchingImageData?.documentPath,
                        fileSize: matchingImageData?.fileSize,
                    },
                };
            } else {
                return user;
            }
        });

        return {
            ...getUser,
            rows: usersWithImages,
        };

        // return getUser;
    } catch (error) {
        throw new Error(error);
    }
};

const getAllusers = async () => {
    try {
        getUser = await usersModel.findAndCountAll({});
        return getUser;
    } catch (error) {
        throw new Error(error);
    }
};

const fetchSearchAllusers = async (userId, searchQuery) => {
    try {
        const whereConditions = {
            ...(Array.isArray(userId) && userId.length > 0 && { id: { [Sequelize.Op.in]: userId } }), // Filter by array of userIds
            ...(searchQuery && {
              [Sequelize.Op.or]: [
                { email: { [Sequelize.Op.like]: `%${searchQuery}%` } }, // Case-insensitive search for email using LIKE
                { name: { [Sequelize.Op.like]: `%${searchQuery}%` } }   // Case-insensitive search for name using LIKE
              ]
            })
          };
    
        const getUser = await usersModel.findAndCountAll({
            where: whereConditions,
        });

        return getUser;
    } catch (error) {
        throw new Error(error);
    }
};

const getUsersforWorkflowService = async (reqBody) => {
    try {
        const { userId, roleId } = reqBody;

        let departmentsData;
        try {
            const departmentResponse = await axios.post(
                `${process.env.SERVICE_MANAGEMENT_URL}/department/list`
            );
            departmentsData = departmentResponse?.data?.data?.rows;
        } catch (error) {
            console.log(error);
        }

        function getDepartmentNameById(departmentId, departmentsData) {
            if (!departmentId || !departmentsData) return null;
                const departmentIds = (departmentId || "").split(',').map(id => id.trim());
                const departmentNames = departmentIds
                    .map(id => {
                        const department = departmentsData.find(dept => dept.id == id);
                        return department ? department.departmentName : null;
                    })
                    .filter(name => name);
        
                return departmentNames.length ? departmentNames.join(', ') : null;
        }

        const whereClause = {
            isDeleted: "0",
        };

        if (roleId) {
            whereClause.roleId = roleId;
        }

        if (userId && Array.isArray(userId) && userId.length > 0) {
            whereClause.id = userId;
        }

        let getUser = await usersModel.findAll({
            where: whereClause,
            include: [
                {
                    model: rolesModel,
                    required: false,
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "name",
                "email",
                "phone",
                "profileImageId",
                "departmentId",
                "roleId",
                [sequelize.col("role.roleName"), "roleName"],
                [sequelize.col("role.isAdmin"), "isAdmin"],
                "password",
                "otp",
                "isValidEmail",
                "isSupportTeam",
                "isCoreTeam",
                "otpExpireDateTime",
                "status",
            ],
            raw: true,
        });

        let newData = getUser.map((user) => {
            return {
                ...user,
                departmentName: getDepartmentNameById(
                    user.departmentId,
                    departmentsData
                ),
            };
        });

        return newData;
    } catch (error) {
        throw new Error(error);
    }
};

const changeUserPassword = async (password, id) => {
    try {
        return await usersModel.update(
            { password: password },
            {
                where: {
                    id: id,
                },
            }
        );
    } catch (error) {
        throw new Error(error);
    }
};

const generateLoginSession = async (data) => {
    let loginSession;
    try {
        // Create the login session
        loginSession = await userLoginSessionModel.create(data);

        // Check if login session creation was successful
        if (!loginSession) {
            throw new Error("Failed to create login session");
        }
    } catch (error) {
        throw new Error(error);
    }
};

const findLoginSessionUser = async (userId, token) => {
    let loginSession;
    try {
        // Create the login session
        loginSession = await userLoginSessionModel.findOne({
            where: {
                userId,
                token,
            },
            raw: true,
        });
        return loginSession;
    } catch (error) {
        throw new Error(error);
    }
};

const getLoginSessionList = async (userIds, req) => {
    try {
        const userId = req.body.data.userId;
        const userData = await usersModel.findByPk(userId);
        const roleData = await rolesModel.findByPk(userData.dataValues.roleId);
        const roleName = roleData.dataValues.roleName;

        let whereClause = {};
        if (roleName !== "Super controller" && roleName !== "Admin") {
            whereClause.userId = userIds;
        }

        let result = await userLoginSessionModel.findAndCountAll({
            where: whereClause,
            raw: true,
        });

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

// const getLoginSessionList = async (userId) => {
//   try {
//     const result = await userLoginSessionModel.findAndCountAll({
//       where: {
//         userId: userId,
//       },
//       raw: true,
//     });
//     return result;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// const deleteSessionById = async (ids) => {
//   try {
//     if (ids.length > 0) {
//       const session = await userLoginSessionModel.destroy({
//         where: {
//           id: {
//             [Op.in]: ids,
//           },
//         },
//       });
//       return session;
//     }
//   } catch (error) {
//     throw new Error(error);
//   }
// };

const deleteSessionById = async (ids) => {
    try {
        if (ids.length > 0) {
            const sessions = await userLoginSessionModel.findAll({
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
                attributes: ["id", "ip", "userId"],
            });

            const ipAddresses = sessions.map((session) => session.ip);
            const userIds = sessions.map((session) => session.userId);

            const session = await userLoginSessionModel.destroy({
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
            });

            const findData = await logiHistoryAdminModel.findAll({
                where: {
                    userId: {
                        [Op.in]: userIds,
                    },
                    ipAddress: {
                        [Op.in]: ipAddresses,
                    },
                },
                order: [["createdDate", "DESC"]],
            });

            if (session && findData.length > 0) {
                const currentUtcTime = new Date();
                const istOffset = 5.5 * 60 * 60 * 1000;
                const istTime = new Date(currentUtcTime.getTime() + istOffset);
                const logoutTime = istTime
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");

                await logiHistoryAdminModel.update(
                    { logoutTime: currentUtcTime },
                    {
                        where: {
                            id: {
                                [Op.in]: findData.map((data) => data.id),
                            },
                        },
                    }
                );
            }

            return session;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const generateAdminLoginHistory = async (
    userId,
    userEmail,
    browserInfo,
    ipAddress,
    os,
    isLoginSuccess
) => {
    try {
        const newLog = await logiHistoryAdminModel.create({
            userId,
            userEmail,
            browserInfo,
            ipAddress,
            os,
            isLoginSuccess,
        });

        return newLog;
    } catch (error) {
        console.error("Error generating log:", error);
        throw new Error("Failed to generate log");
    }
};

const adminLogHistoryData = async (
    id,
    page,
    perPage,
    dateRange,
    searchFilter,
    sortOrder = "desc",
    orderBy = "id",
    selectedType
) => {
    try {
        const actualPage = parseInt(page, 10) || 1;
        const actualPerPage = parseInt(perPage, 10) || 25;
        const offset = (actualPage - 1) * actualPerPage;

        let whereClause = {};

        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);

            whereClause.createdDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        if (searchFilter) {
            const userSubQuery = `(SELECT name FROM user WHERE user.email COLLATE utf8mb4_general_ci = login_history_admin.userEmail COLLATE utf8mb4_general_ci)`;

            whereClause[Op.or] = [
                { userEmail: { [Op.like]: `%${searchFilter}%` } },
                { browserInfo: { [Op.like]: `%${searchFilter}%` } },
                { os: { [Op.like]: `%${searchFilter}%` } },
                { ipAddress: { [Op.like]: `%${searchFilter}%` } },
                sequelize.literal(`(${userSubQuery}) LIKE '%${searchFilter}%'`),
            ];
        }

        if (selectedType) {
            whereClause.isLoginSuccess = {
                [Op.like]: `%${selectedType}%`,
            };
        }

        let order = [];
        if (orderBy === "userName") {
            order = [["userName", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "userEmail") {
            order = [["userEmail", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "os") {
            order = [["os", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "browserInfo") {
            order = [["browserInfo", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "ipAddress") {
            order = [["ipAddress", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "createdDate") {
            order = [["createdDate", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else if (orderBy === "isLoginSuccess") {
            order = [["isLoginSuccess", sortOrder === "asc" ? "ASC" : "DESC"]];
        } else {
            order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
        }

        const result = await logiHistoryAdminModel.findAndCountAll({
            where: whereClause,
            limit: actualPerPage,
            offset: offset,
            order: order,
            attributes: {
                include: [
                    [
                        literal(`(
              SELECT name
              FROM user
              WHERE user.email COLLATE utf8mb4_general_ci = login_history_admin.userEmail COLLATE utf8mb4_general_ci
            )`),
                        "userName",
                    ],
                    [
                        literal(`(
              SELECT email
              FROM user
              WHERE user.email COLLATE utf8mb4_general_ci = login_history_admin.userEmail COLLATE utf8mb4_general_ci
            )`),
                        "userEmail",
                    ],
                ],
            },
        });

        return {
            totalRecords: result.count,
            records: result.rows,
        };
    } catch (error) {
        console.error("Error fetching audit log data:", error);
        throw new Error("Error fetching audit log data.");
    }
};

const userLogoutById = async (token, userId, ip, browserName) => {
    try {
        if (token && userId) {
            const res = await userLoginSessionModel.destroy({
                where: {
                    userId: userId,
                    token: token,
                },
            });

            let findData = await logiHistoryAdminModel.findOne({
                where: {
                    userId: userId,
                    ipAddress: ip,
                    browserInfo: browserName,
                },
                order: [["createdDate", "DESC"]],
            });

            if (res) {
                const currentUtcTime = new Date();
                const istOffset = 5.5 * 60 * 60 * 1000;
                const istTime = new Date(currentUtcTime.getTime() + istOffset);
                const logoutTime = istTime
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");

                await logiHistoryAdminModel.update(
                    { logoutTime: currentUtcTime },
                    {
                        where: {
                            id: findData?.id,
                        },
                    }
                );
            }

            return res;
        }
    } catch (error) {
        throw new Error(error);
    }
};
const userLinkExpireTime = async (userId,linkExpireDateTime) => {
    try {
      return await usersModel.update(
        {
          linkExpireDateTime: linkExpireDateTime,
        },
        {
          where: {
            id: userId,
          },
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  };
module.exports = {
    createUser,
    findUserByEmail,
    setUserPassword,
    isValidEmail,
    updateOTP,
    validateEmail,
    deleteUserById,
    updateUserById,
    getUserInfo,
    getUserForDirectoryData,
    updateOTPByEmail,
    getAllusers,
    getUsersforWorkflowService,
    updateUserInfoById,
    findUserById,
    changeUserPassword,
    generateLoginSession,
    findLoginSessionUser,
    getLoginSessionList,
    deleteSessionById,
    generateAdminLoginHistory,
    adminLogHistoryData,
    userLogoutById,
    fetchSearchAllusers,
    userLinkExpireTime
};
