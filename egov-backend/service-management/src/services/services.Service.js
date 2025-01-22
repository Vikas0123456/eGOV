const { sequelize } = require("../config/db.connection");
const { serviceModel, departmentsModel } = require("../models");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const { default: axios } = require("axios");
const createApplicationModel = require("../models/application");
const createApplicationLogModel = require("../models/applicationLog");
const createGeneralSettingModel = require("../models/generalSetting");

// const notifyMicroservice = async (changedEntity) => {
//     const services = [
//         `${process.env.USERSERVICE}web/webhook`,
//         `${process.env.TICKETSERVICE}/web/webhook`,
//         `${process.env.PAYMENTSERVICE}web/webhook`,
//         `${process.env.DEPARTMENTREPORTSERVICE}web/webhook`,
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

const findServiceBySlug = async (slug) => {
    try {
        const service = await serviceModel.findOne({
            where: {
                slug,
            },
        });
        return service;
    } catch (error) {
        throw new Error(error);
    }
};

const createService = async (requestBody, req) => {
    try {
        const databaseName = `egov_${requestBody.slug}_service`;
        // requestBody.databaseName = databaseName;

        const data = {
            serviceName: requestBody.serviceName,
            slug: requestBody.slug,
            shortDescription: requestBody.shortDescription,
            departmentId: requestBody.departmentId,
            price: requestBody.price,
            priority: requestBody.priority,
            TAT: requestBody.TAT,
            step: requestBody.dynamicFields,
            databaseName: databaseName,
            certificateTemplate: requestBody.certificateTemplate,
            pdfGenerator: requestBody.pdfGenerator,
            serviceInstructionsData: requestBody.serviceInstructionsData,
            servicePrerequisiteData: requestBody.servicePrerequisiteData,
            meetingInstructionData: requestBody.meetingInstructionData,
            paymentMethod: requestBody.paymentMethod,
            paymentOption: requestBody.paymentOption,
            // configurationData:requestBody.serviceName
        }
        const service = await serviceModel.create(data);

        if(service){
            try {
                const newDatabse = await sequelize.query(`CREATE DATABASE ${databaseName}`);
                
                if (newDatabse) {
                    const newDatabaseConnection = new Sequelize(
                        databaseName,
                        process.env.DB_USERNAME,
                        process.env.DB_PASSWORD,
                        {
                            host: process.env.DB_HOST,
                            dialect: "mysql",
                            define: {
                                timestamps: true,
                                freezeTableName: true,
                            },
                            logging: false,
                        }
                    );
            
                    await newDatabaseConnection.authenticate();
            
                    const generalSettingTable = createGeneralSettingModel({
                        sequelize: newDatabaseConnection,
                        Sequelize,
                    });
            
                    createApplicationModel({
                        sequelize: newDatabaseConnection,
                        Sequelize,
                    });
            
                    createApplicationLogModel({
                        sequelize: newDatabaseConnection,
                        Sequelize,
                    });
            
                    await newDatabaseConnection.sync({ force: true });
            
                    const department = await departmentsModel.findByPk(
                        requestBody.departmentId,
                        { raw: true }
                    );
            
                    const generalSettingData = [
                        {
                            settingKey: "TAT",
                            settingValue: requestBody.TAT || 15,
                        },
                        {
                            settingKey: "serviceSlug",
                            settingValue: requestBody.slug,
                        },
                        {
                            settingKey: "departmentName",
                            settingValue: JSON.stringify({
                                departmentName: department?.departmentName || "",
                                departmentId: requestBody.departmentId,
                            }),
                        },
                        {
                            settingKey: "serviceName",
                            settingValue: JSON.stringify({
                                serviceName: requestBody.serviceName,
                                serviceSlug: requestBody.slug,
                            }),
                        },
                        {
                            settingKey: "pdfGenerater",
                            settingValue: 0,
                            description:
                                "0 for Auto genrated pdf, 1 for manually genrated pdf...",
                        },
                    ];
            
                    await generalSettingTable.bulkCreate(generalSettingData);
        
                } 
            } catch (error) {
                await serviceModel.destroy({
                    where: {
                        slug: requestBody.slug,
                    },
                });
                throw new Error("Service creation failed");
            }
        }
        // await notifyMicroservice("service");

        try {
            const { userId, ipAddress } = extractDataFromRequest(req);
            const auditLogBody = {
                recordId: null,
                action: "New Service Create",
                moduleName: "Service",
                newValue: requestBody,
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
        return service;
    } catch (error) {
        // console.error(error);
        throw new Error(error.message || "Service creation failed");
    }
};

const updateServiceById = async (serviceId, updatedData, req) => {
    try {
        const existingService = await serviceModel.findOne({
            where: { id: serviceId },
        });

        if (!existingService) {
            throw new Error("Service not found");
        }

        let newVersion;
        let currentVersion = parseInt(existingService.currentVersion);
        if (existingService?.currentVersion) {
            newVersion = (Math.floor(currentVersion) + 1).toFixed(1);
        }
        const data = {
            departmentId: updatedData?.departmentId,
            step: updatedData?.dynamicFields,
            price: updatedData?.price,
            priority: updatedData?.priority,
            TAT: updatedData?.TAT,
            serviceName: updatedData?.serviceName,
            shortDescription: updatedData?.shortDescription,
            slug: updatedData?.slug,
            status: updatedData?.status,
            currentVersion: newVersion,
            configurationData: existingService?.configurationData,
            databaseName: existingService?.databaseName,
            certificateTemplate: updatedData?.certificateTemplate,
            pdfGenerator: updatedData?.pdfGenerator,
            certificateExpiryTime: updatedData?.certificateExpiryTime,
            servicePrerequisiteData: updatedData?.servicePrerequisiteData,
            serviceInstructionsData: updatedData?.serviceInstructionsData,
            meetingInstructionData: updatedData?.meetingInstructionData,
            paymentMethod: updatedData?.paymentMethod,
            paymentOption: updatedData?.paymentOption,
        };

        // const databaseName = `egov_${updatedData.slug}_service`;
        const databaseName = existingService?.databaseName;

        const newDatabaseConnection = new Sequelize(
            databaseName,
            process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: "mysql",
                define: {
                    timestamps: true,
                    freezeTableName: true,
                },
                logging: false,
            }
        );

        await newDatabaseConnection.authenticate();

        const generalSettingTable = createGeneralSettingModel({
            sequelize: newDatabaseConnection,
            Sequelize,
        });

        const department = await departmentsModel.findByPk(
            updatedData.departmentId,
            { raw: true }
        );

        const generalSettingData = [
            {
                settingKey: "TAT",
                settingValue: updatedData.TAT || 15,
            },
            {
                settingKey: "serviceSlug",
                settingValue: updatedData.slug,
            },
            {
                settingKey: "departmentName",
                settingValue: JSON.stringify({
                    departmentName: department?.departmentName || "",
                    departmentId: updatedData.departmentId,
                }),
            },
            {
                settingKey: "serviceName",
                settingValue: JSON.stringify({
                    serviceName: updatedData.serviceName,
                    serviceSlug: updatedData.slug,
                }),
            },
            {
                settingKey: "pdfGenerater",
                settingValue: 0,
            },
        ];

        for (const setting of generalSettingData) {
            await generalSettingTable.update(
                { settingValue: setting.settingValue },
                { where: { settingKey: setting.settingKey } }
            );
        }

        const newService = await serviceModel.create(data);
        // await notifyMicroservice("service");

        try {
            const oldValue = existingService ? existingService.get({ plain: true }) : null;
            const { userId, ipAddress } = extractDataFromRequest(req);
            const auditLogBody = {
                recordId: serviceId,
                action: "Update Service",
                moduleName: "Service",
                newValue: updatedData,
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

        return newService;
    } catch (error) {
        throw new Error(error);
    }
};

const getServiceList = async (
    id,
    page,
    perPage,
    searchFilter,
    departmentId,
    sortOrder,
    orderBy = "serviceName",
    slug
) => {
    try {
        if (id) {
            let whereClause = { id: id };
            const result = await serviceModel.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: departmentsModel,
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: [
                    "id",
                    "serviceName",
                    "slug",
                    "shortDescription",
                    "departmentId",
                    "configurationData",
                    [
                        sequelize.col("department.departmentName"),
                        "departmentName",
                    ],
                    [
                        sequelize.col("department.logo"),
                        "departmentLogo",
                    ],
                    "currentVersion",
                    "priority",
                    "TAT",
                    "price",
                    "status",
                    "step",
                    "createdDate",
                    "updateDate",
                    "certificateTemplate",
                    "pdfGenerator",
                    "certificateExpiryTime",
                    "serviceInstructionsData",
                    "servicePrerequisiteData",
                    "meetingInstructionData",
                    "paymentMethod",
                    "paymentOption",
                ],
                raw: true,
            });
            return result;
        } else {
            const actualPage = (page && parseInt(page, 10)) || 1;
            const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
            const offset = (actualPage - 1) * actualPerPage;

            let whereClause = {};

            if (slug) {
                whereClause.slug = {
                    [Op.in]: slug,
                };
            }

            if (id) {
                whereClause.id = id;
            }

            if (searchFilter) {
                whereClause[Op.or] = [
                    {
                        serviceName: {
                            [Op.like]: `%${searchFilter}%`,
                        },
                    },
                    {
                        shortDescription: {
                            [Op.like]: `%${searchFilter}%`,
                        },
                    },
                ];
            }

            if (departmentId) {
                if (!whereClause[Op.and]) whereClause[Op.and] = [];
                whereClause[Op.and].push({ departmentId });
            }

            const result = await serviceModel.findAndCountAll({
                where: {
                    ...whereClause,
                    [Op.and]: [
                        ...(whereClause[Op.and] || []),
                        sequelize.literal(`
                            (SELECT MAX(s2.currentVersion)
                             FROM services s2
                             WHERE s2.slug = services.slug) = services.currentVersion
                        `),
                        // sequelize.literal(`
                        //     services.currentVersion = (
                        //         SELECT s2.currentVersion
                        //         FROM services s2
                        //         WHERE s2.slug = services.slug
                        //         ORDER BY
                        //             CAST(SUBSTRING_INDEX(s2.currentVersion, '.', 1) AS UNSIGNED) DESC,
                        //             CAST(SUBSTRING_INDEX(s2.currentVersion, '.', -1) AS UNSIGNED) DESC
                        //         LIMIT 1
                        //     )
                        // `),
                    ],
                },
                limit: actualPerPage,
                offset: offset,
                include: [
                    {
                        model: departmentsModel,
                        required: false,
                        attributes: [],
                    },
                ],
                attributes: [
                    "id",
                    "serviceName",
                    "slug",
                    "shortDescription",
                    "departmentId",
                    "configurationData",
                    [
                        sequelize.col("department.departmentName"),
                        "departmentName",
                    ],
                    [
                        sequelize.col("department.logo"),
                        "departmentLogo",
                    ],
                    "currentVersion",
                    "priority",
                    "TAT",
                    "price",
                    "status",
                    "step",
                    "createdDate",
                    "updateDate",
                    "certificateTemplate",
                    "certificateExpiryTime",
                    "serviceInstructionsData",
                    "servicePrerequisiteData",
                    "meetingInstructionData",
                    "paymentMethod",
                    "paymentOption",
                ],
                order: [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]],
                raw: true,
            });

            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getServiceByIds = async (slug) => {
    try {
        // const response = await
        const result = await serviceModel.findOne({
            where: {
                slug: slug,
                [Op.and]: [
                    sequelize.literal(`
                        (SELECT MAX(s2.currentVersion)
                         FROM services s2
                         WHERE s2.slug = services.slug) = services.currentVersion
                    `),
                ],
            },
            include: [
                {
                    model: departmentsModel,
                    required: false,
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "serviceName",
                "slug",
                "shortDescription",
                "departmentId",
                "configurationData",
                [sequelize.col("department.departmentName"), "departmentName"],
                [
                    sequelize.col("department.logo"),
                    "departmentLogo",
                ],
                "currentVersion",
                "priority",
                "TAT",
                "price",
                "status",
                "step",
                "createdDate",
                "updateDate",
                "databaseName",
                "certificateTemplate",
                "certificateExpiryTime",
                "serviceInstructionsData",
                "servicePrerequisiteData",
                "meetingInstructionData",
                "paymentMethod",
                "paymentOption",
            ],
            raw: true,
        });

        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const serviceAllList = async () => {
    try {
        const whereClause = {};

        const result = await serviceModel.findAndCountAll({
            where: {
                ...whereClause,
                [Op.and]: [
                    ...(whereClause[Op.and] || []),
                    sequelize.literal(`
                        (SELECT MAX(s2.currentVersion)
                         FROM services s2
                         WHERE s2.slug = services.slug) = services.currentVersion
                    `),
                ],
            },
            include: [
                {
                    model: departmentsModel,
                    required: false,
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "serviceName",
                "slug",
                "shortDescription",
                "departmentId",
                "configurationData",
                [sequelize.col("department.departmentName"), "departmentName"],
                [
                    sequelize.col("department.logo"),
                    "departmentLogo",
                ],
                "currentVersion",
                "priority",
                "TAT",
                "price",
                "status",
                "step",
                "createdDate",
                "updateDate",
                "certificateTemplate",
                "pdfGenerator",
                "certificateExpiryTime",
                "serviceInstructionsData",
                "servicePrerequisiteData",
                "meetingInstructionData",
                "paymentMethod",
                "paymentOption",
                "databaseName",
            ],
            raw: true,
        });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const getApplicationServicelistForApi = async (departmentId) => {
    try {
        const result = await serviceModel.findAll({
            where: {
                departmentId: departmentId,
                status: "1",
            },
        });
        const configurationDataList = result.map(
            (item) => item.configurationData
        );

        return configurationDataList;
    } catch (error) {
        throw new Error(error);
    }
};

const serviceAndDepartmentCount = async () => {
    try {
        const serviceData = await serviceModel.count({
            distinct: true,
            col: "slug",
        });

        const departmentData = await departmentsModel.count();

        return {
            serviceCount: serviceData,
            departmentCount: departmentData,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getLatestUniqueSlugService = async (slug) => {
    try {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        throw new Error('Invalid input: slug must be a non-empty string');
      }
      
      const result = await serviceModel.findAll({
        where: {
          slug: {
            [Op.like]: `${slug}%`
          }
        },
        attributes: ['slug']
      });
  
      // Extract the existing slugs
      const existingSlugMatches = result.map(item => item.slug.match(new RegExp(`^${slug}(\\d+)?$`)));
      const existingSlugNumbers = existingSlugMatches
        .filter(Boolean)
        .map(match => parseInt(match[1] || '0', 10));
  
      // Find the next available unique slug
      const nextSlugNumber = existingSlugNumbers.length
        ? Math.max(...existingSlugNumbers) + 1
        : 1;
      const nextSlug = `${slug}${nextSlugNumber}`;
  
      return { slug: nextSlug };
    } catch (error) {
      throw new Error(error);
    }
  };



module.exports = {
    findServiceBySlug,
    createService,
    updateServiceById,
    getServiceList,
    serviceAllList,
    getApplicationServicelistForApi,
    serviceAndDepartmentCount,
    getServiceByIds,
    getLatestUniqueSlugService
};
