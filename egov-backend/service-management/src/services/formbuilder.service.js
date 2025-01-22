const { Op } = require("sequelize");
const { default: axios } = require("axios");
const { formBuilderModel } = require("../models");

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

const createFormService = async (reqBody, req) => {
    try {
        const form = await formBuilderModel.create(reqBody);
        
        try {
                const { userId, ipAddress } = extractDataFromRequest(req);
                const auditLogBody = {
                    recordId: null,
                    action: "New Form Creation",
                    moduleName: "Form Builder",
                    newValue: reqBody,
                    oldValue: "N/A",
                    type: "0",
                    userId: userId,
                    customerId: null,
                    ipAddress: ipAddress,
                };

                await axios.post(
                    `${process.env.USERSERVICE}auditLog/create`,
                    {
                        data: auditLogBody,
                    }
                );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return form;
    } catch (error) {
        throw new Error(error);
    }
};

const updateFormService = async (reqBody, formId, req) => {
    try {
        const findForm = await formBuilderModel.findOne({
            where: {
                id: formId,
            },
            raw: true,
        });

        if (findForm) {
            let { version, formSlug } = findForm;

            const match = formSlug.match(/-(\d+)$/);
            if (match) {
                // Extract the numeric part and increment it
                const existingVersion = parseInt(match[1]);
                version = existingVersion + 1;
                formSlug = formSlug.replace(/-\d+$/, `-${version}`);
            } else {
                formSlug = `${formSlug}-${version}`;
            }
            const newForm = await formBuilderModel.create({
                userId: reqBody?.userId,
                version: version,
                formSlug: formSlug,
                formName: reqBody?.formName,
                formData: reqBody?.formData,
            });
            if (newForm) {
                await formBuilderModel.update(
                    { status: "0" },
                    {
                        where: {
                            id: formId,
                        },
                    }
                );
            }

            try {
                const { userId, ipAddress } = extractDataFromRequest(req);
                const oldValue = findForm ? findForm.formName : '';
                const auditLogBody = {
                    recordId: formId,
                    action: "Update Form",
                    moduleName: "Form Builder",
                    newValue: reqBody,
                    oldValue: oldValue,
                    type: "0",
                    userId: userId,
                    customerId: null,
                    ipAddress: ipAddress,
                };

                await axios.post(
                    `${process.env.USERSERVICE}auditLog/create`,
                    {
                        data: auditLogBody,
                    }
                );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

            return newForm;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getById = async (id) => {
    try {
        id = Array.isArray(id) ? id : [id];
        const response = await formBuilderModel.findAndCountAll({
            where: {
                id: {
                    [Op.in]: id,
                },
            },
        });
        return response;
    } catch (error) {
        throw new Error(error);
    }
};

const getFormService = async (reqBody) => {
    try {
        const {
            page,
            perPage,
            searchFilter,
            orderBy,
            sortOrder,
            fullList,
            id,
        } = reqBody;
        if (id) {
            const result = await formBuilderModel.findAndCountAll({
                where: {
                    id: id,
                    isDeleted: "0",
                    // status: "1",
                },
                logging: true,
            });
            return result;
        }
        const actualPage = (page && parseInt(page, 10)) || 1;
        const actualPerPage = (perPage && parseInt(perPage, 10)) || null;
        const offset = (actualPage - 1) * actualPerPage;

        const whereClause = {
            isDeleted: "0",
            status: "1",
        };

        if (searchFilter) {
            // Apply search filter by department name using a LIKE operator
            whereClause[Op.or] = [
                {
                    formName: {
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
        let result;
        if (fullList) {
            result = await formBuilderModel.findAndCountAll({
                where: whereClause,
            });
        } else {
            result = await formBuilderModel.findAndCountAll({
                where: whereClause,
                limit: actualPerPage,
                offset: offset,
                order: order, // Apply the defined order
                raw: true, // Return raw data instead of Sequelize instances
            });
        }

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const deleteFormService = async (formId, req) => {
    try {
        const form = await formBuilderModel.update(
            { isDeleted: "1" },
            {
                where: {
                    id: formId,
                },
            }
        );

        try {
            const { userId, ipAddress } = extractDataFromRequest(req);
            const auditLogBody = {
                recordId: formId,
                action: "Delete Form",
                moduleName: "Form Builder",
                newValue: "N/A",
                oldValue: formId,
                type: "0",
                userId: userId,
                customerId: null,
                ipAddress: ipAddress,
            };

            await axios.post(
                `${process.env.USERSERVICE}auditLog/create`,
                {
                    data: auditLogBody,
                }
            );
    } catch (error) {
        console.error("Error generating audit log:", error);
    }

        return form;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    createFormService,
    getFormService,
    updateFormService,
    deleteFormService,
    getById,
};
