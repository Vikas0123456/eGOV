const { default: axios } = require("axios");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const QRCode = require("qrcode");
const {
    documentRequiredModel,
    applicationModel,
    generalSettingModel,
    applicationLogModel,
    application,
    generalSetting,
} = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const FormData = require("form-data");
const fs = require("fs");
const { generatePDF, generateDynamicPDF } = require("../utils/generatepdf");
const businessStructuresModel = require("../models/businessStructures");
const businessTypesModel = require("../models/businessTypes");
const companyTypeModel = require("../models/companyTypes");
const licenseTypeModel = require("../models/licenseTypes");
const marritalStatusModel = require("../models/marritalStatus");
const purposeModel = require("../models/purposes");
const {
    adminAssignMail,
    statusUpdateMail,
    sendCertificateMail,
} = require("../utils/mail/notificationMail");
const os = require("os");
const { sequelize } = require("../config/db.connection");
const moment = require("moment");
const { Console } = require("console");
const usersModel = require("../../../user-service/src/models/users");
const fetchDataFromTables = require("../config/getAllServiceList");
const path = require("path");
const { serviceTemplates } = require("../utils/certificateTemplates/certificateTemplate");

function generateFilePath() {
    const folderPath = path.join(__dirname, "src/file");

    // Ensure the folder exists (create it if not)
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate a unique file name with timestamp
    const fileName = `dynamic-output${Date.now()}.pdf`;
    const filePath = path.join(folderPath, fileName);

    return filePath;
}

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

const getLocalIPv4Address = () => {
    const interfaces = os.networkInterfaces();
    for (const ifaceName in interfaces) {
        const iface = interfaces[ifaceName];
        for (const { address, family, internal } of iface) {
            if (family === "IPv4" && !internal) {
                return address;
            }
        }
    }
    return null;
};
const calculateDateRange = (option) => {
    let startDate, endDate;

    switch (option) {
        case "All":
            startDate = moment().subtract(100, "years"); // Arbitrarily large range for 'All'
            endDate = moment();
            break;
        case "1w": // One Week
            startDate = moment().subtract(1, "weeks").startOf("day");
            endDate = moment().endOf("day");
            break;
        case "1m": // One Month
            startDate = moment().subtract(1, "months").startOf("day");
            endDate = moment().endOf("day");
            break;
        case "3m": // Three Months
            startDate = moment().subtract(3, "months").startOf("day");
            endDate = moment().endOf("day");
            break;
        case "6m": // Six Months
            startDate = moment().subtract(6, "months").startOf("day");
            endDate = moment().endOf("day");
            break;
        case "1y": // One Year
            startDate = moment().subtract(1, "years").startOf("day");
            endDate = moment().endOf("day");
            break;
        default:
            startDate = null;
            endDate = null;
    }

    return { startDate, endDate };
};

const encrypt = (data) => {
    if (process.env.ENCRYPTION == "true") {
        const cipher = crypto.createCipheriv(
            process.env.CIPHERALGORITHM,
            process.env.CIPHERSKEY,
            process.env.CIPHERVIKEY
        );
        let encryptedData = cipher.update(JSON.stringify(data), "utf-8", "hex");
        encryptedData += cipher.final("hex");
        return { data: encryptedData };
    } else {
        return { data };
    }
};
const decrypt = (encryptedData) => {
    if (process.env.DECEYPTION == "true") {
        const decipher = crypto.createDecipheriv(
            process.env.CIPHERALGORITHM,
            process.env.CIPHERSKEY,
            process.env.CIPHERVIKEY
        );
        let decryptedData = decipher.update(encryptedData.data, "hex", "utf-8");
        decryptedData += decipher.final("utf-8");
        return { data: JSON.parse(decryptedData) };
    } else {
        return encryptedData;
    }
};
function formatDateString(isoDateString) {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}
function combineData(data) {
    const combineResult = [];
    Object.keys(data).forEach((key) => {
        combineResult.push(...data[key]);
    });
    return combineResult;
}
const applicationAsignedToUser = async (
    workflow,
    serviceListArrayWithSlug,
    excludeUserId
) => {
    try {
        if (!workflow) {
            return null;
        }
        let userId = [];
        let allFindUsers = [];
        if (workflow?.workflowMethod === "role") {
            const getAlluserList = await axios.post(
                `${process.env.USERMICROSERVICE}/internalCommunicationUser/workflowUser`,
                {
                    data: {
                        roleId: workflow?.roleId,
                    },
                }
            );
            userId = getAlluserList.data.data.map((item) => item.id);
            allFindUsers = getAlluserList.data.data.map((item) => ({
                id: item.id,
                email: item.email,
            }));
        }
        if (workflow?.workflowMethod === "agent") {
            const getAlluserList = await axios.post(
                `${process.env.USERMICROSERVICE}/internalCommunicationUser/workflowUser`,
                {
                    data: {
                        userId: JSON.parse(workflow?.userId),
                    },
                }
            );
            userId = getAlluserList.data.data.map((item) => item.id);
            allFindUsers = getAlluserList.data.data.map((item) => ({
                id: item.id,
                email: item.email,
            }));
        }
        if (userId?.length !== 0) {
            //   let serviceListArrayWithSlug = ["bcs", "mcs", "dcs"];
            const applicationdata = await fetchDataFromTables(
                serviceListArrayWithSlug,
                "application",
                "findAll",
                {
                    where: {
                        userId: userId,
                        status: "3",
                    },
                    raw: true,
                    attributes: [
                        "id",
                        "applicationId",
                        "serviceData",
                        "status",
                        "userId",
                        "createdDate",
                        "updateDate",
                    ],
                }
            );

            const completeData = combineData(applicationdata);

            // Step 1: Count applications per user
            const userApplicationCount = completeData.reduce((acc, curr) => {
                acc[curr.userId] = (acc[curr.userId] || 0) + 1;
                return acc;
            }, {});

            // Step 2: Ensure all users, even those without applications, are in the result
            allFindUsers.forEach((user) => {
                if (!userApplicationCount[user.id]) {
                    userApplicationCount[user.id] = 0; // Set count to 0 if no application assigned
                }
            });

            // Step 3: Convert counts to array format for `allAssignedUserIdWithCount`
            const combinedData = Object.entries(userApplicationCount).map(
                ([userId, count]) => ({
                    userId: parseInt(userId, 10), // Ensure `userId` is a number
                    count,
                })
            );

            // Step 4: Find the user with the lowest assignment count
            const lowestAssignedUser = combinedData.reduce(
                (lowest, current) => {
                    if (!lowest || current.count < lowest.count) {
                        return current;
                    }
                    return lowest;
                },
                null
            );

            // Step 5: Return the results
            return {
                lowestAssignedUserId: lowestAssignedUser?.userId || null, // Return the lowest userId or null if none
                allAssignedUserIdWithCount: combinedData, // Return the array with userId and count
                allFindUsers: allFindUsers, // Return all users
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
    }
};

const createApplicationService = async (
    fieldsData,
    applicationId,
    flag,
    slugApplicationId,
    slug,
    req
) => {
    try {
        if (applicationId) {
            let createdDocuments = []; // Array to store created documents

            // Create certificate application
            await req.applicationModel.update(fieldsData, {
                where: { id: applicationId },
            });
            const result = await req.applicationModel.findOne({
                where: {
                    id: applicationId,
                },
            });
            let parseDept;
            let parseService;
            let assignUserId;
            let Userdata;
            let parseData;
            let generalServiceSlugSettings;
            let serviceAllList;
            try {
                let getAllServiceList = await axios.post(
                    `${process.env.SERVICEMANAGEMENT}/service/list`,
                    { data: {} }
                );
                serviceAllList = getAllServiceList?.data?.data?.rows || [];
            } catch (error) {
                console.log(error);
            }
            let serviceData = serviceAllList?.find(
                (service) => service?.slug == slug
            );
            let customerData;
            // workflow implementation start
            if (fieldsData?.transactionStatus === "1" || result?.paymentToken) {
                let customerAllList;
                let serviceSlug = serviceAllList?.filter(
                    (service) =>
                        service?.departmentId == serviceData?.departmentId
                );
                let serviceListArrayWithSlug = serviceSlug?.map(
                    (service) => service?.slug
                );

                try {
                    let getCustomerData = await axios.post(
                        `${process.env.USERMICROSERVICE}/customer/customerList`,
                        { data: {} }
                    );
                    customerAllList = getCustomerData?.data?.data?.rows || [];
                } catch (error) {
                    console.log(error);
                }

                customerData = customerAllList?.find(
                    (customer) => customer?.id == fieldsData?.customerId
                );

                try {
                    const serviceData = serviceAllList?.find(
                        (service) => service?.slug == slug
                    );
                    const response = await axios.post(
                        `${process.env.USERMICROSERVICE}/internalCommuncationWorkflow/applicationWorkfllow`,
                        {
                            data: {
                                departmentId: serviceData?.departmentId,
                                serviceslug: serviceData?.slug,
                                workflowFor: "0",
                            },
                        }
                    );
                    const workflow = response?.data?.data?.workflow[0];
                    const dbStoreworkflow = response?.data?.data;
                    let excludeUserId = null;
                    if (workflow) {
                        try {
                            const userEmail = Userdata?.email;
                            parseData = JSON.stringify(dbStoreworkflow);

                            const getUser = await applicationAsignedToUser(
                                workflow,
                                serviceListArrayWithSlug,
                                excludeUserId
                            );

                            const assignUserId = getUser?.lowestAssignedUserId;
                            await req.applicationModel.update(
                                {
                                    userId: assignUserId,
                                    workflowData: parseData,
                                    workflowIndex: 0,
                                    status: "3",
                                },
                                {
                                    where: { id: applicationId },
                                }
                            );
                            await req.applicationLogModel.create({
                                applicationId: applicationId,
                                customerId: fieldsData?.customerId,
                                userId: assignUserId,
                                description:
                                    "Your application is currently under review and we will provide an update as soon as possible.",
                                logBy: "0",
                                oldStatus: fieldsData?.status,
                                newStatus: "3",
                            });

                            if (assignUserId) {
                                const notificationBodyCommon = {
                                    serviceSlug: serviceData?.slug,
                                    departmentId: serviceData?.departmentId,
                                    title: "Assigned User.",
                                    type: "1",
                                    applicationId: slugApplicationId,
                                    addedBy: "0",
                                };
                                let notifications = [];
                                notifications.push(
                                    {
                                        ...notificationBodyCommon,
                                        title: `New ${serviceData?.serviceName} application.`,
                                        message: `Your ${serviceData?.serviceName} application is under review.`,
                                        customerId: fieldsData?.customerId,
                                    },
                                    {
                                        ...notificationBodyCommon,
                                        title: "Assigned User.",
                                        message: `You have assigned ${serviceData?.serviceName} application successfully.`,
                                        userId: assignUserId,
                                    }
                                );
                                try {
                                    if (notifications.length > 0) {
                                        await axios.post(
                                            `${process.env.NOTIFICATIONSERVICE}/create`,
                                            {
                                                data: notifications,
                                            }
                                        );
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                                try {
                                    const { ipAddress } = extractDataFromRequest(req);
                                    
                                    const auditLogBody = {
                                        recordId: result?.applicationId,
                                        action: `${serviceData?.serviceName} Application`,
                                        moduleName: "Application",
                                        newValue: result?.applicationId
                                            ? fieldsData
                                            : createdDocuments,
                                        oldValue: "N/A",
                                        type: "1",
                                        userId: null,
                                        customerId: fieldsData.customerId,
                                        ipAddress: ipAddress,
                                    };

                                    await axios.post(
                                        `${process.env.USERMICROSERVICE}/auditLog/create`,
                                        {
                                            data: auditLogBody,
                                        }
                                    );
                                } catch (error) {
                                    console.error(
                                        "Error generating audit log:",
                                        error
                                    );
                                }
                                try {
                                    const template = await axios.post(
                                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                        {
                                            data: {
                                                slug: "assignedapplication",
                                            },
                                        }
                                    );
                                    const getTemplate = template.data.data;
                                    let htmlTemplate = getTemplate.content
                                        .replace(
                                            /@@SERVICENAME@@/g,
                                            `${serviceData?.serviceName}`
                                        )
                                        .replace(
                                            /@@APPLICATIONID@@/g,
                                            result.applicationId
                                        );
                                    //   adminAssignMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                                    //   adminAssignMail(userEmail, htmlTemplate, serviceData?.serviceName);
                                } catch (error) {
                                    console.error(error);
                                }
                                try {
                                    const template = await axios.post(
                                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                        {
                                            data: { slug: "applicationstatus" },
                                        }
                                    );
                                    const getTemplate = template.data.data;

                                    let htmlTemplate = getTemplate.content
                                        .replace(
                                            /@@SERVICENAME@@/g,
                                            `${serviceData?.serviceName}`
                                        )
                                        .replace(
                                            /@@APPLICATIONID@@/g,
                                            result.applicationId
                                        )
                                        .replace(
                                            /@@DESCRIPTION@@/g,
                                            `Your ${serviceData?.serviceName} application is currently under review and we will provide an update as soon as possible.`
                                        );

                                    //   statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                                    //   statusUpdateMail(fieldsData?.customerEmail, htmlTemplate, serviceData?.serviceName);
                                } catch (error) {
                                    console.error(error);
                                }
                                let workflowData =
                                    dbStoreworkflow?.workflow?.[0];
                                let parseTAT = JSON.parse(workflowData?.TAT)
                                let workflowTAT = parseTAT || 1;
                                try {
                                    await axios.post(
                                        `${process.env.DEPARTMENTREPORT}/application/create`,
                                        {
                                            data: {
                                                userId: assignUserId,
                                                applicationId:
                                                    result.applicationId,
                                                serviceSlug: serviceData?.slug,
                                                assignedDate: new Date(),
                                                turnAroundTime: workflowTAT,
                                            },
                                        }
                                    );
                                } catch (error) {
                                    console.error(error);
                                }

                                try {
                                    const turnaroundTimeMs =
                                        workflowTAT * 24 * 60 * 60 * 1000;

                                    // Calculate target date by adding turnaround time to current date
                                    const targetDate = new Date(
                                        Date.now() + turnaroundTimeMs
                                    );

                                    await req.applicationModel.update(
                                        {
                                            turnAroundTime: targetDate,
                                        },
                                        {
                                            where: { id: applicationId },
                                        }
                                    );
                                } catch (error) {
                                    console.error(error);
                                }
                                // Calculate turnaround time in milliseconds (assuming parseTAT is in days)
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (fieldsData?.transactionStatus === "2") {
                const notificationBodyCommon = {
                    serviceSlug: serviceData?.serviceSlug,
                    departmentId: serviceData?.departmentId,
                    title: `${serviceData?.serviceName} Application`,
                    type: "1",
                    applicationId: slugApplicationId,
                    addedBy: "0",
                };
                let notifications = [];
                notifications.push({
                    ...notificationBodyCommon,
                    message: `Your ${serviceData?.serviceName} application is failed.`,
                    customerId: fieldsData?.customerId,
                });
                try {
                    if (notifications.length > 0) {
                        await axios.post(
                            `${process.env.NOTIFICATIONSERVICE}/create`,
                            {
                                data: notifications,
                            }
                        );
                    }
                } catch (error) {
                    console.log(error);
                }
                try {
                    const { ipAddress } = extractDataFromRequest(req);
                    const auditLogBody = {
                        recordId: result.applicationId,
                        action: `${serviceData?.serviceName} Application`,
                        moduleName: "Application",
                        newValue: result.applicationId
                            ? fieldsData
                            : createdDocuments,
                        oldValue: "N/A",
                        type: "1",
                        userId: null,
                        customerId: fieldsData.customerId,
                        ipAddress: ipAddress,
                    };

                    await axios.post(
                        `${process.env.USERMICROSERVICE}/auditLog/create`,
                        {
                            data: auditLogBody,
                        }
                    );
                } catch (error) {
                    console.error("Error generating audit log:", error);
                }
                await req.applicationLogModel.create({
                    applicationId: applicationId,
                    customerId: fieldsData?.customerId,
                    userId: assignUserId,
                    description: `Your ${serviceData?.serviceName} application payment is failed.`,
                    logBy: "0",
                    oldStatus: fieldsData?.status,
                    newStatus: "3",
                });
                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: { slug: "applicationstatus" },
                        }
                    );
                    const getTemplate = template.data.data;

                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(/@@APPLICATIONID@@/g, result.applicationId)
                        .replace(
                            /@@DESCRIPTION@@/g,
                            `Your ${serviceData?.serviceName} application payment is failed.`
                        );

                    // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, parseService.serviceName);
                    // statusUpdateMail(fieldsData?.customerEmail, htmlTemplate, parseService.serviceName);
                } catch (error) {
                    console.error(error);
                }
            }
            // workflow implementation end

            return result;
        } else {
            let createdDocuments = []; // Array to store created documents

            // Create certificate application
            const application = await req.applicationModel.create(fieldsData);
            let applicationIds;
            if (flag == false && slugApplicationId) {
                applicationIds = slugApplicationId;
            } else {
                const id = application.id;
                applicationIds = `${slug.toUpperCase()}${id}`;
            }
            application.applicationId = applicationIds;
            // Update applicationId in applicationModel
            await req.applicationModel.update(
                { applicationId: applicationIds },
                {
                    where: { id: application.id },
                }
            );
            // Parse settingValue
            // const requiredDocumentIds = JSON.parse(generalSettings.settingValue);
            // const witnessDocumentIds = JSON.parse(
            //   generalWitnessSettings.settingValue
            // );

            // let documentsR;
            // try {
            //   documentsR = await axios.post(
            //     `${process.env.DOCUMENT_URL}document/list`
            //   );
            // } catch (error) {
            //   console.log(error);
            // }

            // const documentsResponse = documentsR.data;

            // if (documentsResponse) {
            //   const documentsData = documentsResponse.data;

            //   // Filter documents based on requiredDocumentIds
            //   const requiredDocuments = documentsData.filter((doc) =>
            //     requiredDocumentIds.includes(doc.id)
            //   );
            //   // Prepare data for documentRequiredModel
            //   for (const doc of requiredDocuments) {
            //     try {
            //       // Create a new record in documentRequiredModel for each document
            //       const createdDocument = await documentRequiredModel.create({
            //         applicationId: application.id,
            //         documentName: doc.documentName,
            //         slug: doc.slug,
            //         documentFileType: doc.documentFileType.join(","),
            //         canApply: doc.canApply,
            //         uploadedDocumentId: null,
            //         isRequired: "1",
            //       });
            //       createdDocuments.push(createdDocument);
            //     } catch (error) {
            //       console.error(
            //         `Error creating document "${doc.documentName}":`,
            //         error
            //       );
            //     }
            //   }
            // }
            //   try {
            //     if (applicationIds) {
            //       const ipAddress = getLocalIPv4Address();
            //       const auditLogBody = {
            //         recordId: applicationIds,
            //         action: "New Business License Certificate Application",
            //         moduleName: "Application",
            //         newValue: applicationIds ? fieldsData : createdDocuments,
            //         oldValue: "N/A",
            //         type: "1",
            //         userId: null,
            //         customerId: fieldsData.customerId,
            //         ipAddress: ipAddress,
            //       };

            //       await axios.post(`${process.env.USERMICROSERVICE}/auditLog/create`, {
            //         data: auditLogBody,
            //       });
            //     }
            //   } catch (error) {
            //     console.error("Error generating audit log:", error);
            //   }

            return application;
        }
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
};

const getApplicationByApplicationId = async (applicationId, req) => {
    try {
        const result = await req.applicationModel.findOne({
            where: {
                applicationId: {
                    [Op.like]: `${applicationId}%`,
                },
            },
        });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const getRequiredDocumentServices = async (applicationId) => {
    try {
        const documentReq = await documentRequiredModel.findAndCountAll({
            where: {
                applicationId: applicationId,
            },
            logging: true,
        });
        return documentReq;
    } catch (error) {
        throw new Error(error);
    }
};
const geGeneralSettingListServices = async (settingKey) => {
    try {
        if (settingKey) {
            const setting = await generalSettingModel.findAndCountAll({
                where: {
                    settingKey: settingKey,
                },
            });
            return setting;
        } else {
            const setting = await generalSettingModel.findAndCountAll({});
            return setting;
        }
    } catch (error) {
        throw new Error(error);
    }
};
const createApplicationLogService = async (reqBody, req) => {
    try {
        const data = {
            applicationId: reqBody.applicationId,
            userId: reqBody?.userId,
            customerId: reqBody.customerId,
            description: reqBody.description,
            logBy: reqBody.logBy,
            newStatus: reqBody.newStatus,
            oldStatus: reqBody.oldStatus,
        };
        const log = await req.applicationLogModel.create(data);
        return log;
    } catch (error) {
        throw new Error(error);
    }
};
const getApplicationListServices = async (applicationId, slug, req) => {
    try {
        const { applicationModel, generalSettingModel, applicationLogModel } =
            req;

        if (applicationId) {
            let customerResponse;
            let documentResponse;
            let getAlluserList;
            let getAllServiceList;

            try {
                customerResponse = await axios.post(
                    `${process.env.USERMICROSERVICE}/customer/customerList`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            try {
                documentResponse = await axios.post(
                    `${process.env.DOCUMENT_URL}document/list/upload`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            try {
                getAlluserList = await axios.post(
                    `${process.env.USERMICROSERVICE}/user/getAlluser`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            try {
                getAllServiceList = await axios.post(
                    `${process.env.SERVICEMANAGEMENT}/service/list`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            const customerLists = customerResponse?.data?.data?.rows;
            const documentList = documentResponse?.data?.data?.rows;
            const getAdminuserList = getAlluserList?.data?.data?.rows;
            const serviceAllList = getAllServiceList?.data?.data?.rows;

            const applicationList = await applicationModel.findAndCountAll({
                where: {
                    id: applicationId,
                },
                order: [["createdDate", "DESC"]],
            });

            const parsedApplications = applicationList.rows.map(
                (application) => {
                    const parsedData = JSON.parse(application.applicationData);

                    const findRequestBycustomer = customerLists.find(
                        (data) => data.id === application?.customerId
                    );

                    const findAssignUserData = getAdminuserList.find(
                        (data) => data.id == application?.userId
                    );

                    let issuedDocId;
                    if (application?.issuedDocumentId) {
                        issuedDocId = documentList.find(
                            (doc) => doc.id === application?.issuedDocumentId
                        );
                    }
                    let assigneUserInfo;
                    if (findAssignUserData) {
                        assigneUserInfo = documentList.find(
                            (doc) =>
                                doc.id === findAssignUserData?.profileImageId
                        );
                    }
                    let serviceData;
                    if (slug) {
                        serviceData = serviceAllList.find(
                            (service) => service?.slug == slug
                        );
                    }
                    let departmentLogoImage
                    if(serviceData){
                        departmentLogoImage = documentList.find(
                          (doc) => doc.id == serviceData?.departmentLogo
                        )
                    }
                  
                    let requestedByCustomerImage;
                    if (findRequestBycustomer) {
                        requestedByCustomerImage = documentList.find(
                            (doc) =>
                                doc.id === findRequestBycustomer?.nibImageId
                        );
                    }
                    let signNature;
                    if (application?.signatureImageId) {
                        signNature = documentList.find(
                            (doc) => doc.id === application?.signatureImageId
                        );
                    }

                    return {
                        ...application.toJSON(),
                        applicationData: parsedData,
                        serviceName: serviceData?.serviceName,
                        departmentId: serviceData?.departmentId,
                        departmentName: serviceData?.departmentName,
                        departmentLogo: serviceData?.departmentLogo,
                        departmentLogoPath: departmentLogoImage?.documentPath,
                        certificateTemplate: serviceData?.certificateTemplate,
                        pdfGenerator: serviceData?.pdfGenerator,
                        certificateExpiryTime:
                            serviceData?.certificateExpiryTime,
                        expiryTime: serviceData?.expiryTime,
                        serviceInstructionsData: serviceData?.serviceInstructionsData,
                        servicePrerequisiteData: serviceData?.servicePrerequisiteData,
                        meetingInstructionData: serviceData?.meetingInstructionData,
                        paymentOption: serviceData?.paymentOption,
                        paymentMethod: serviceData?.paymentMethod,
                        requestedByCustomerInfo: findRequestBycustomer
                            ? {
                                  id: findRequestBycustomer?.id,
                                  firstName: findRequestBycustomer?.firstName,
                                  middleName: findRequestBycustomer?.middleName,
                                  lastName: findRequestBycustomer?.lastName,
                                  nibNumber: findRequestBycustomer?.nibNumber,
                                  mobileNumber:
                                      findRequestBycustomer?.mobileNumber,
                                  email: findRequestBycustomer?.email,
                                  nibImageId: {
                                      id: requestedByCustomerImage?.id,
                                      documentName:
                                          requestedByCustomerImage?.documentName,
                                      documentType:
                                          requestedByCustomerImage?.documentType,
                                      documentPath:
                                          requestedByCustomerImage?.documentPath,
                                      fileSize:
                                          requestedByCustomerImage?.fileSize,
                                  },
                              }
                            : null,
                        applicationAssignedToUser: findAssignUserData
                            ? {
                                  id: findAssignUserData?.id,
                                  name: findAssignUserData?.name,
                                  email: findAssignUserData?.email,
                                  phone: findAssignUserData?.phone,
                                  documentName: assigneUserInfo?.documentName,
                                  documentPath: assigneUserInfo?.documentPath,
                                  fileSize: assigneUserInfo?.fileSize,
                              }
                            : null,
                        signatureImageId: signNature,
                        issuedDocumentId: issuedDocId,
                    };
                }
            );
            return { count: applicationList.count, rows: parsedApplications };
        }
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
const getAdminApplicationListServices = async (
    page, // No reassignment here
    perPage,
    customerId,
    applicationId,
    searchFilter,
    departmentId,
    serviceSlug,
    status,
    userId,
    dateRange,
    duration,
    req
) => {
    try {
        const actualPage = parseInt(page, 10) || 1;
        const actualPerPage = parseInt(perPage, 10) || 25;
        const offset = (actualPage - 1) * actualPerPage;

        let whereCondition = {
            [Op.or]: [
                {
                  applicationId: {
                    [Op.regexp]: "^[A-Z0-9]+-[0-9]$",
        
                  },
                  transactionStatus: "1", // Only include if transactionStatus is "1"
                },
                {
                  applicationId: {
                    [Op.notRegexp]: "^[A-Z0-9]+-[0-9]$",
        
                  },
                },
              ],
        };
        if (customerId) {
            whereCondition.customerId = customerId;
        }
        if (status) {
            whereCondition.status = status;
        }
        if (userId) {
            whereCondition.userId = userId;
        }
        if (applicationId) {
            whereCondition.applicationId = applicationId;
        }
        if (searchFilter) {
            whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
        }

        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            whereCondition.createdDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        switch (duration) {
            case "today":
                whereCondition.createdDate = {
                    [Op.gte]: today,
                };
                break;
            case "weekly":
                let oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 7);
                whereCondition.createdDate = {
                    [Op.gte]: oneWeekAgo,
                };
                break;
            case "monthly":
                let oneMonthAgo = new Date(today);
                oneMonthAgo.setMonth(today.getMonth() - 1);
                whereCondition.createdDate = {
                    [Op.gte]: oneMonthAgo,
                };
                break;
            default:
                break;
        }

        let data = await req.applicationModel.findAndCountAll({
            where: whereCondition,
            order: [["createdDate", "DESC"]],
            raw: true,
            limit: actualPerPage,
            offset: offset,
        });

        const [
            customerResponse,
            documentResponse,
            getAlluserList,
            getAllServiceList,
        ] = await Promise.all([
            axios.post(
                `${process.env.USERMICROSERVICE}/customer/customerList`,
                {
                    data: {},
                }
            ),
            axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
                data: {},
            }),
            axios.post(`${process.env.USERMICROSERVICE}/user/getAlluser`, {
                data: {},
            }),
            axios.post(`${process.env.SERVICEMANAGEMENT}/service/list`, {
                data: {},
            }),
        ]);

        // Using 'let' for variables that will be reassigned
        let customerLists = customerResponse?.data?.data?.rows || [];
        let documentList = documentResponse?.data?.data?.rows || [];
        let getAdminuserList = getAlluserList?.data?.data?.rows || [];
        let serviceAllList = getAllServiceList?.data?.data?.rows || [];

        let enhancedData = data?.rows
            ?.map((application) => {
                if (!application) return null;

                const customerData = customerLists.find(
                    (customer) =>
                        customer && customer.id == application.customerId
                );
                const serviceInfo = serviceAllList.find(
                    (service) => service?.slug == application?.serviceData?.slug
                );
                const assignUserList = serviceInfo
                    ? getAdminuserList.filter(
                          (adminUser) =>
                              adminUser &&
                              adminUser.departmentId ==
                                  serviceInfo?.departmentId
                      )
                    : [];
                const signatureData = application?.signatureImageId
                    ? documentList.find(
                          (doc) =>
                              doc && doc.id === application.signatureImageId
                      )
                    : null;
                const imageData = customerData?.nibImageId
                    ? documentList.find(
                          (doc) => doc && doc.id == customerData.nibImageId
                      )
                    : null;

                return {
                    ...application,
                    serviceName: serviceInfo,
                    signatureImage: signatureData
                        ? {
                              id: signatureData.id,
                              documentPath: signatureData.documentPath,
                          }
                        : {},
                    customerInfo: customerData
                        ? {
                              id: customerData.id,
                              firstName: customerData.firstName,
                              middleName: customerData.middleName,
                              lastName: customerData.lastName,
                              nibNumber: customerData.nibNumber,
                              email: customerData.email,
                              imageData: imageData
                                  ? {
                                        id: imageData.id,
                                        customerId: imageData.customerId,
                                        documentName: imageData.documentName,
                                        documentPath: imageData.documentPath,
                                        documentType: imageData.documentType,
                                    }
                                  : null,
                          }
                        : null,
                    assignUserList: assignUserList,
                };
            })
            .filter(Boolean);

        return { rows: enhancedData, count: data?.count };
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
const assignedUserUpdate = async (
    applicationId,
    userId,
    assignedUserId,
    applicationIdSlug,
    departmentNameData,
    customerId,
    customerEmail,
    userEmail,
    slug,
    serviceData,
    req
) => {
    try {
        const findOne = await req.applicationModel.findOne({
            where: { id: applicationId },
        });

        if (findOne && findOne?.userId) {
            const applicationUpdate = await req.applicationModel.update(
                { userId: assignedUserId },
                {
                    where: { id: applicationId },
                }
            );
            if (applicationUpdate) {
                try {
                    const notificationBodyCommon = {
                        serviceSlug: slug,
                        departmentNameData,
                        title: "Assigned User.",
                        type: "1",
                        applicationId: findOne.applicationId,
                        addedBy: "1",
                    };
                    let notifications = [];
                    notifications.push(
                        {
                            ...notificationBodyCommon,
                            message: `Your ${serviceData?.serviceName} application is under process.`,
                            customerId: customerId,
                        },
                        {
                            ...notificationBodyCommon,
                            message: `You have asssigned ${serviceData?.serviceName} application for review.`,
                            userId: assignedUserId,
                        }
                    );
                    if (notifications.length > 0) {
                        await axios.post(
                            `${process.env.NOTIFICATIONSERVICE}/create`,
                            {
                                data: notifications,
                            }
                        );
                    }
                } catch (error) {
                    console.error(error);
                }
                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: { slug: "assignedapplication" },
                        }
                    );
                    const getTemplate = template.data.data;
                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(/@@APPLICATIONID@@/g, findOne.applicationId);
                    //   adminAssignMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                    //   adminAssignMail(userEmail, htmlTemplate, serviceData?.serviceName);
                } catch (error) {
                    console.error(error);
                }
                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: { slug: "assignedapplication" },
                        }
                    );
                    const getTemplate = template.data.data;
                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(/@@APPLICATIONID@@/g, findOne.applicationId)
                        .replace(
                            /@@DESCRIPTION@@/g,
                            `Your ${serviceData?.serviceName} application is currently under review and we will provide an update as soon as possible.`
                        );

                    //   statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                    // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                } catch (error) {
                    console.error(error);
                }
                try {
                    await axios.put(
                        `${process.env.DEPARTMENTREPORT}/application/update`,
                        {
                            data: {
                                oldUserId: findOne?.userId,
                                userId: assignedUserId,
                                applicationId: findOne.applicationId,
                                serviceSlug: slug,
                            },
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
            }

            try {
                const { ipAddress } = extractDataFromRequest(req);
                const auditLogBody = {
                    recordId: applicationId,
                    action: `User Assign ( ${serviceData?.serviceName})`,
                    moduleName: "Application",
                    newValue: assignedUserId,
                    oldValue: "N/A",
                    type: "0",
                    userId: userId,
                    customerId: null,
                    ipAddress: ipAddress,
                };
                await axios.post(
                    `${process.env.USERMICROSERVICE}/auditLog/create`,
                    {
                        data: auditLogBody,
                    }
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            return applicationUpdate;
        } else {
          const serviceTAT = serviceData?.TAT || 1;

            if (serviceTAT) {
                const parseTAT = JSON.parse(serviceTAT);
                if (typeof parseTAT === "number") {
                    // Calculate turnaround time in milliseconds (assuming parseTAT is in days)
                    const turnaroundTimeMs = parseTAT * 24 * 60 * 60 * 1000;

                    // Calculate target date by adding turnaround time to current date
                    const targetDate = new Date(Date.now() + turnaroundTimeMs);

                    const applicationUpdate = await req.applicationModel.update(
                        {
                            userId: assignedUserId,
                            turnAroundTime: targetDate,
                        },
                        {
                            where: { id: applicationId },
                        }
                    );

                    if (applicationUpdate) {
                        try {
                            const notificationBodyCommon = {
                                serviceSlug: slug,
                                departmentNameData,
                                title: "Assigned User.",
                                type: "1",
                                applicationId: findOne.applicationId,
                                addedBy: "1",
                            };
                            let notifications = [];
                            notifications.push(
                                {
                                    ...notificationBodyCommon,
                                    message: `Your ${serviceData?.serviceName} application is under process.`,
                                    customerId: customerId,
                                },
                                {
                                    ...notificationBodyCommon,
                                    message: `You have asssigned ${serviceData?.serviceName} application for review.`,
                                    userId: assignedUserId,
                                }
                            );
                            if (notifications.length > 0) {
                                await axios.post(
                                    `${process.env.NOTIFICATIONSERVICE}/create`,
                                    {
                                        data: notifications,
                                    }
                                );
                            }
                        } catch (error) {
                            console.error(error);
                        }
                        try {
                            const template = await axios.post(
                                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                {
                                    data: { slug: "assignedapplication" },
                                }
                            );
                            const getTemplate = template.data.data;
                            let htmlTemplate = getTemplate.content
                                .replace(
                                    /@@SERVICENAME@@/g,
                                    `${serviceData?.serviceName}`
                                )
                                .replace(
                                    /@@APPLICATIONID@@/g,
                                    findOne.applicationId
                                );
                            //   adminAssignMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                            //   adminAssignMail(userEmail, htmlTemplate, serviceData?.serviceName);
                        } catch (error) {
                            console.error(error);
                        }
                        try {
                            const template = await axios.post(
                                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                {
                                    data: { slug: "assignedapplication" },
                                }
                            );
                            const getTemplate = template.data.data;
                            let htmlTemplate = getTemplate.content
                                .replace(
                                    /@@SERVICENAME@@/g,
                                    `${serviceData?.serviceName}`
                                )
                                .replace(
                                    /@@APPLICATIONID@@/g,
                                    findOne.applicationId
                                )
                                .replace(
                                    /@@DESCRIPTION@@/g,
                                    `Your ${serviceData?.serviceName} application is currently under review and we will provide an update as soon as possible.`
                                );

                            //   statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                            // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                        } catch (error) {
                            console.error(error);
                        }

                        const findApplication =
                            await req.applicationModel.findOne({
                                where: { id: applicationId },
                            });

                        const log = await req.applicationLogModel.create({
                            applicationId: applicationId,
                            customerId: findApplication?.customerId,
                            userId: userId,
                            description:
                                "Your application is currently under review and we will provide an update as soon as possible.",
                            logBy: "0",
                            oldStatus: "2",
                            newStatus: "3",
                        });

                        try {
                            const { ipAddress } = extractDataFromRequest(req);
                            const auditLogBody = {
                                recordId: applicationId,
                                action: `User Assign (${serviceData?.serviceName})`,
                                moduleName: "Application",
                                newValue: assignedUserId,
                                oldValue: "N/A",
                                type: "0",
                                userId: userId,
                                customerId: null,
                                ipAddress: ipAddress,
                            };
                            await axios.post(
                                `${process.env.USERMICROSERVICE}/auditLog/create`,
                                {
                                    data: auditLogBody,
                                }
                            );
                        } catch (error) {
                            console.error("Error generating audit log:", error);
                        }

                        try {
                            await axios.post(
                                `${process.env.DEPARTMENTREPORT}/application/create`,
                                {
                                    data: {
                                        userId: assignedUserId,
                                        applicationId: findOne.applicationId,
                                        serviceSlug: slug,
                                        assignedDate: new Date(),
                                        turnAroundTime: parseTAT,
                                    },
                                }
                            );
                        } catch (error) {
                            console.error(error);
                        }

                        return { log, ...findApplication?.dataValues };
                    }
                } else {
                    console.error("Invalid value for TAT in general settings.");
                }
            } else {
                console.error("General settings for TAT not found.");
            }
        }
    } catch (error) {
        throw new Error(error);
    }
};
// Mock deleteFile function (replace with your actual implementation)
const deleteFile = async (filePath) => {
    try {
        fs.unlinkSync(filePath);
        // console.log(`File deleted successfully: ${filePath}`);
    } catch (err) {
        console.error(`Error deleting file: ${filePath}`, err.message);
    }
};
const uploadPDF = async (filePath, userId, customerId, certificateName, documentSlug) => {
    try {
        // Validate input parameters
        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error("Invalid or missing file path.");
        }
        if (!userId) throw new Error("User ID is required.");
        if (!customerId) throw new Error("Customer ID is required.");
        if (!certificateName) throw new Error("Certificate name is required.");

        // Create FormData
        const formData = new FormData();
        formData.append("viewDocumentName", certificateName);
        formData.append("documentSlug", documentSlug);
        formData.append("documentFile", fs.createReadStream(filePath));
        formData.append("userId", userId);
        formData.append("customerId", customerId);
        formData.append("isGenerated", "1");
        formData.append("isShowInDocument", "1");

        // Upload the file using Axios
        const fileResponse = await axios.post(
            `${process.env.DOCUMENT_URL}documentService/uploading`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
            }
        );

        // Delete the file after successful upload
        if (fs.existsSync(filePath)) {
            await deleteFile(filePath);
        }

        return fileResponse.data; // Return the server response
    } catch (error) {
        // Enhanced error handlin
        console.log(error) 
    }
};

const genratePdfServices = async (
    fromAdmin = false,
    applicationId,
    userId,
    serviceData,
    departmentData,
    slug,
    req
) => {
    
    try {
        const findApplication = await req.applicationModel.findOne({
            where: { applicationId: applicationId },
        });

        const status = findApplication.dataValues.status;

        if (status === "4") {
            let result = {};
            if (
                (serviceData?.certificateTemplate &&
                    serviceData?.pdfGenerator === "1") ||
                (serviceData?.certificateTemplate &&
                    !serviceData?.issuedDocumentId)
            ) {
                const getServiceTemplate = serviceTemplates.find((service)=>service.serviceSlug === slug)
                
                const [departmentResponse, getAllCountryResponse, getAllStateCountryWiseResponse] =
                    await Promise.all(
                        [
                            axios.post(
                                `${process.env.SERVICEMANAGEMENT}/department/departmentById`,
                                { data: {departmentId : req.service.departmentId} }
                            ),
                            axios.post(
                                `${process.env.USERMICROSERVICE}/customer/country/list`,
                                { data: {} }
                            ),
                            axios.post(
                                `${process.env.USERMICROSERVICE}/customer/state/list`,
                                { data: {} }
                            ),
                        ].map((p) => p.catch((error) => ({ error })))
                    );

                const [departmentDetails, countryLists, stateLists] = [
                    departmentResponse?.data?.data?.rows?.[0],
                    getAllCountryResponse?.data?.data?.rows,
                    getAllStateCountryWiseResponse?.data?.data?.rows,
                ];
                
                const applicationStatus = await req.applicationModel.findOne({
                    where: { applicationId: applicationId },
                });

                if (!applicationStatus) {
                    throw new Error("Application not found");
                }
                let newApplicationData = JSON.parse(
                    applicationStatus?.applicationData
                )?.formData;

                const processApplicationData = (data) => {
                    if (!data || !Array.isArray(data)) return [];

                    const cleanHTML = (html) => {
                        if (!html) return "";
                        return html.replace(/<\/?[^>]+>/gi, "");
                    };

                    return data.map((item) => {
                        const label = cleanHTML(item.label);
                        let value =
                            item.value ||
                            (item.values &&
                                item.values.find((v) => v.selected)?.label) ||
                            "N/A";

                        if (
                            label.toLowerCase().includes("country")
                            || (item.description && item.description.includes("country") 
                            && !item.description.includes("state")) &&
                            !isNaN(value)
                        ) {
                            value = getNameById(value, countryLists);
                        } else if (
                            label.toLowerCase().includes("state") &&
                            !isNaN(value)
                        ) {
                            value = getNameById(value, stateLists);
                        } else if (item.type === "date" && value !== "N/A") {
                            value = formatDateString(value);
                        }

                        return { ...item, label, value };
                    });
                };

                const getNameById = (id, list) => {
                    const obj = list?.find((item) => item.id == id);
                    return obj ? obj?.name : null;
                };

                newApplicationData = processApplicationData(newApplicationData);

                const { certificateExpiryTime, agentDetails } = serviceData;
                
                let certificateGenerateDate;
                if(applicationStatus.certificateGenerateDate !== null){
                    certificateGenerateDate = applicationStatus.certificateGenerateDate
                } else{
                    certificateGenerateDate = new Date()
                }

                const Qrdata = {
                    id: applicationId,
                    application: slug,
                };

                const encryptData = encrypt(Qrdata);
                const qrCodeDataURL = await QRCode.toDataURL(
                    `${process.env.API_URL}scanQRcode/certificate/${encryptData.data}`
                );

                let filePath;
                let uploadResult;

                if(getServiceTemplate){
                    const newreplacePlaceholdersInHTML = (htmlString, dataArray) => {
                        const escapeRegExp = (string) => {
                            if (typeof string !== "string") {
                                return "";
                            }
                            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                        };
                    
                        if (!htmlString || typeof htmlString !== "string") {
                            throw new Error("Invalid HTML string.");
                        }
                    
                        if (!Array.isArray(dataArray)) {
                            throw new Error("Data array must be an array.");
                        }
                    
                        dataArray.forEach((item) => {
                            if (!item || typeof item !== "object") {
                                return;
                            }
                    
                            const { name, value } = item;
                    
                            if (!name) {
                                return;
                            }
                    
                            // Create a regex to find placeholders matching the pattern @@name@@
                            const pattern = new RegExp(`@@\\s*${escapeRegExp(name)}\\s*@@`, "g");
                    
                            // Replace the placeholder with the provided value
                            htmlString = htmlString.replace(pattern, value !== undefined && value !== null ? String(value) : "");
                        });
                    
                        return htmlString;
                    };

                    let finalApplicationData;
                    const parsedApplicationData =
                    applicationStatus &&
                    newreplacePlaceholdersInHTML(
                        serviceData?.certificateTemplate,
                        newApplicationData
                    );
                     finalApplicationData = getServiceTemplate.serviceTemplate.replace(/@@main_body_content@@/g, parsedApplicationData)

                    
                    let expiryDateInDate = null;
    
                    if (
                        certificateExpiryTime !== null &&
                        certificateExpiryTime !== undefined &&
                        certificateExpiryTime !== 0
                    ) {
                        expiryDateInDate = new Date();
                        expiryDateInDate.setDate(expiryDateInDate.getDate() + certificateExpiryTime);
    
                        expiryDateInDate = expiryDateInDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        });
                    }

                    let newTemplateContent;
                    if (getServiceTemplate && slug === "nbl") {
                        // const htmlContent = getServiceTemplate.headerTemplate;
                        newTemplateContent = finalApplicationData
                        .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                        .replace(/@@qr_code@@/g, qrCodeDataURL)
                        .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                        .replace(/@@license_number@@/g, applicationStatus.applicationId)
                        .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                        .replace(/@@issue_date@@/g, formatDateString(certificateGenerateDate))
                        .replace(/@@expiry_date@@/g, expiryDateInDate)
                        .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                        .replace(/@@officer_title@@/g, "-")
                        .replace(/@@officer_signature@@/g, "-")
                        .replace(/@@official_stamp@@/g, "-")
                        .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                        .replace(/@@department_email@@/g, departmentDetails.email || "-")
                        .replace(/@@department_website@@/g, departmentDetails.url || "-")
                    }else if(getServiceTemplate && slug === "tcs"){
                        newTemplateContent = finalApplicationData
                        .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                        .replace(/@@qr_code@@/g, qrCodeDataURL)
                        .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                        .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                        .replace(/@@expiry_date@@/g, expiryDateInDate)
                        .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                        .replace(/@@officer_title@@/g, "-")
                        .replace(/@@officer_signature@@/g, "-")
                        .replace(/@@official_stamp@@/g, "-")
                        .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                        .replace(/@@department_email@@/g, departmentDetails.email || "-")
                        .replace(/@@department_website@@/g, departmentDetails.url || "-")
                    }else if(getServiceTemplate && slug === "pcs"){
                        newTemplateContent = finalApplicationData
                        .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                        .replace(/@@qr_code@@/g, qrCodeDataURL)
                        .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                        .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                        .replace(/@@expiry_date@@/g, expiryDateInDate)
                        .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                        .replace(/@@officer_title@@/g, "-")
                        .replace(/@@officer_signature@@/g, "-")
                        .replace(/@@official_stamp@@/g, "-")
                        .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                        .replace(/@@department_email@@/g, departmentDetails.email || "-")
                        .replace(/@@department_website@@/g, departmentDetails.url || "-")
                    }else if(getServiceTemplate && slug === "bcs"){
                        newTemplateContent = finalApplicationData
                        .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                        .replace(/@@qr_code@@/g, qrCodeDataURL)
                        .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                        .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                        .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                        .replace(/@@department_email@@/g, departmentDetails.email || "-")
                        .replace(/@@department_website@@/g, departmentDetails.url || "-")
                    }

                    filePath = await generateDynamicPDF({
                        formData: newTemplateContent,
                        filePath: generateFilePath(),
                    });
                }else{
                    const replacePlaceholdersInHTML = (htmlString, dataArray) => {
                        const escapeRegExp = (string) => {
                            if (typeof string !== "string") {
                                return "";
                            }
                            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                        };
    
                        dataArray.forEach((item) => {
                            if (!item || typeof item !== "object") {
                                return;
                            }
    
                            const { name, value } = item;
    
                            if (name === undefined || name === null) {
                                return;
                            }
    
                            const pattern = new RegExp(
                                `@@\\s*${escapeRegExp(name)}\\s*@@`,
                                "g"
                            );
    
                            const replacementValue =
                                value !== undefined && value !== null
                                    ? String(value)
                                    : "";
                            htmlString = htmlString.replace(
                                pattern,
                                replacementValue
                            );
                        });
    
                        return htmlString;
                    };

                    const parsedApplicationData =
                    applicationStatus &&
                    replacePlaceholdersInHTML(
                        serviceData?.certificateTemplate,
                        newApplicationData
                    );
                    const pdfData = {
                        departmentName: serviceData?.departmentName,
                        departmentLogo: departmentDetails?.imageData?.documentPath,
                        serviceName: serviceData?.serviceName,
                        formData: parsedApplicationData,
                        filePath: generateFilePath(),
                        certificateNumber: applicationStatus.applicationId,
                        certificateGenerateDate: formatDateString(certificateGenerateDate)
                    };

                    filePath = await generatePDF(pdfData, qrCodeDataURL);
                }

                // Upload PDF
                uploadResult = await uploadPDF(
                    filePath,
                    userId,
                    applicationStatus?.associatedCustomerId,
                    `${serviceData?.serviceName} Certificate`,
                    slug
                );

                const issuedId = uploadResult.data?.[0].id;
                const updateData = { issuedDocumentId: issuedId };
                
                
                if(fromAdmin){
                    if(applicationStatus.certificateGenerateDate === null){
                        updateData.certificateGenerateDate = certificateGenerateDate
                    }

                    let expiryDate = null;
    
                    // Check if certificateExpiryTime is not 0
                    if (
                        certificateExpiryTime !== null &&
                        certificateExpiryTime !== undefined &&
                        certificateExpiryTime !== 0 &&
                        !applicationStatus?.expiryDate
                    ) {
                        expiryDate = new Date(); // Start with current date
                        expiryDate.setDate(
                            expiryDate.getDate() + certificateExpiryTime
                        ); // Add certificateExpiryTime days
                    }
                    if (expiryDate) {
                        updateData.expiryDate = expiryDate;
                    }
                }

                await req.applicationModel.update(updateData, {
                    where: { applicationId: applicationId },
                });
                

                result.uploadResult = uploadResult;
            }
            return result;
        }
    } catch (error) {
        console.error("Error in generatePdfServices =>", error);
        return {
            success: false,
            message:
                error.message ||
                "An error occurred during PDF generation and upload.",
        };
    }
};

const sendNotificationServices = async (
    applicationId,
    userId,
    pdfUrl,
    serviceData,
    req
) => {
    const { applicationModel, applicationLogModel } = req;
    try {
        // Log the application activity
        const findApplication = await applicationModel.findOne({
            where: { applicationId: applicationId },
        });

        if (!findApplication) {
            throw new Error("Application not found");
        }

        await applicationLogModel.create({
            applicationId: findApplication.id,
            customerId: findApplication.customerId,
            userId: userId,
            documentId: serviceData?.issuedDocumentId?.id,
            description: `Your application has been approved and the ${serviceData?.serviceName} has been issued. You may download it from your account at your earliest convenience.`,
            logBy: "0",
            oldStatus: findApplication?.status,
            newStatus: findApplication?.status || findApplication?.status,
        });

        // Send notification
        try {
            // Example deptName object (replace with actual logic)

            const notificationBody = {
                customerId: findApplication.customerId,
                serviceSlug: req?.service?.slug,
                departmentId: serviceData?.departmentId,
                title: serviceData?.serviceName,
                message: `Your application of ${serviceData?.serviceName} has been issued. You may download it from your account at your earliest convenience.`,
                type: "1",
                addedBy: "1",
                applicationId: findApplication?.applicationId,
            };

            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                data: notificationBody,
            });
        } catch (error) {
            console.error("Error sending notification =>", error);
            // Handle notification error appropriately
        }

        // Uncomment and test email notification if needed
        let customerEmail = serviceData?.customerEmail;
        try {
            const pdfUrlData = pdfUrl;
            const template = await axios.post(
                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                { data: { slug: "certificate" } }
            );
            const getTemplate = template.data.data;
            let htmlTemplate = getTemplate.content
                .replace(/@@SERVICENAME@@/g, serviceData?.serviceName)
                .replace(/@@APPLICATIONID@@/g, findApplication?.applicationId)
                .replace(
                    /@@DESCRIPTION@@/g,
                    "Your application certificate has been issued. You may download it from your account at your earliest convenience."
                );
            // await sendCertificateMail(customerEmail, htmlTemplate, pdfUrlData, serviceData?.serviceName);
            await sendCertificateMail("v1.netclues@gmail.com", htmlTemplate, pdfUrlData, serviceData?.serviceName);

        } catch (error) {
            console.error("Error sending email =>", error);
        }
        return {
            success: true,
            customerEmail: customerEmail,
            message: "Document processing completed successfully",
        };
    } catch (error) {
        console.error(
            "Error in sendNotification =>",
            error.response ? error.response.data : error.message
        );
        return {
            success: false,
            message:
                error.message ||
                "An error occurred during the notification process.",
        };
    }
};

const updateStatusService = async (
    applicationId,
    status,
    documentId,
    description,
    userId,
    customerEmail,
    serviceData,
    req
) => {
    try {
        const applicationUpdate = await req.applicationModel.update(
            { status: status },
            { where: { id: applicationId } }
        );
        let issuedDocumentData;

        let assignUserId;
        if (applicationUpdate) {
            const findApplication = await req.applicationModel.findOne({
                where: { id: applicationId },
            });
            // workflow implementation start
            if (findApplication?.workflowData && status === "1") {
                try {
                    const workflowData = findApplication?.workflowData
                        ? JSON.parse(findApplication?.workflowData)
                        : null;
                    if (workflowData) {
                        let currentIndex = findApplication?.workflowIndex;
                        let serviceAllList;
                        try {
                            let getAllServiceList = await axios.post(
                                `${process.env.SERVICEMANAGEMENT}/service/list`,
                                { data: {} }
                            );
                            serviceAllList =
                                getAllServiceList?.data?.data?.rows || [];
                        } catch (error) {
                            console.log(error);
                        }
                        let serviceSlug = serviceAllList?.filter(
                            (service) =>
                                service?.departmentId ==
                                serviceData?.departmentId
                        );
                        let serviceListArrayWithSlug = serviceSlug?.map(
                            (service) => service?.slug
                        );
                        try {
                            // const response = await axios.post(
                            //   `${process.env.USERMICROSERVICE}/internalCommuncationWorkflow/applicationWorkfllow`,
                            //   {
                            //     data: {
                            //       departmentId: serviceData?.departmentId,
                            //       serviceslug: serviceData?.slug,
                            //       workflowFor: "0",
                            //     },
                            //   }
                            // );
                            let workflow =
                                workflowData?.workflow[currentIndex + 1];
                            let excludeUserId = null;
                            if (workflow) {
                                try {
                                    const getUser =
                                        await applicationAsignedToUser(
                                            workflow,
                                            serviceListArrayWithSlug,
                                            excludeUserId
                                        );
                                    assignUserId =
                                        getUser?.lowestAssignedUserId;
                                    // const userEmail = Userdata?.email;
                                    const parseTAT=JSON.parse(workflow?.TAT)|| 1
                                    const turnaroundTimeMs = parseTAT * 24 * 60 * 60 * 1000;

                                    // Calculate target date by adding turnaround time to current date
                                    const targetDate = new Date(Date.now() + turnaroundTimeMs);
                                   
                                    await req.applicationModel.update(
                                        {
                                            userId: assignUserId,
                                            workflowIndex: currentIndex + 1,
                                            turnAroundTime: targetDate,
                                            status: "3",
                                        },
                                        {
                                            where: { id: applicationId },
                                        }
                                    );
                                    await req.applicationLogModel.create({
                                        applicationId: applicationId,
                                        customerId: findApplication?.customerId,
                                        userId: assignUserId,
                                        description:
                                            "Your application has been moves further verification.",
                                        logBy: "0",
                                        oldStatus: findApplication?.status,
                                        newStatus: "3",
                                    });

                                    if (assignUserId) {
                                        const notificationBody = {
                                            serviceSlug: serviceData?.slug,
                                            departmentId:
                                                serviceData?.departmentId,
                                            title: "Assigned User.",
                                            message:
                                                "You have assigned application for review.",
                                            type: "1",
                                            userId: assignUserId,
                                            applicationId: findApplication.applicationId,
                                            addedBy: "0",
                                        };
                                        try {
                                            await axios.post(
                                                `${process.env.NOTIFICATIONSERVICE}/create`,
                                                {
                                                    data: notificationBody,
                                                }
                                            );
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        try {
                                            const template = await axios.post(
                                                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                                {
                                                    data: {
                                                        slug: "assignedapplication",
                                                    },
                                                }
                                            );
                                            const getTemplate =
                                                template.data.data;
                                            let htmlTemplate =
                                                getTemplate.content
                                                    .replace(
                                                        /@@SERVICENAME@@/g,
                                                        `${serviceData?.serviceName} Certificate`
                                                    )
                                                    .replace(
                                                        /@@APPLICATIONID@@/g,
                                                        findApplication.applicationId
                                                    );

                                            // adminAssignMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                                            // adminAssignMail(userEmail, htmlTemplate, serviceData?.serviceName);
                                        } catch (error) {
                                            console.error(error);
                                        }
                                        try {
                                            await axios.put(
                                                `${process.env.DEPARTMENTREPORT}/application/update`,
                                                {
                                                    data: {
                                                        oldUserId:
                                                            findApplication?.userId,
                                                        applicationId:
                                                            findApplication?.applicationId,
                                                        status: "1",
                                                        completedDate:
                                                            new Date(),
                                                        approvedBy: userId,
                                                    },
                                                }
                                            );
                                        } catch (error) {
                                            console.error(error);
                                        }
                                        try {
                                            await axios.post(
                                                `${process.env.DEPARTMENTREPORT}/application/create`,
                                                {
                                                    data: {
                                                        userId: assignUserId,
                                                        applicationId:
                                                            findApplication.applicationId,
                                                        serviceSlug:
                                                            serviceData?.slug,
                                                        assignedDate:
                                                            new Date(),
                                                        turnAroundTime:
                                                            workflow?.TAT,
                                                    },
                                                }
                                            );
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            // workflow implementation end

            if (status === "4") {
                try {
                    if (
                        serviceData?.pdfGenerator === "0" &&
                        serviceData?.certificateTemplate
                    ) {
                        const getServiceTemplate = serviceTemplates.find((service)=>service.serviceSlug === serviceData?.slug)
                        const [
                            departmentResponse,
                            getAllCountryResponse,
                            getAllStateCountryWiseResponse,
                        ] = await Promise.all(
                            [
                                axios.post(
                                    `${process.env.SERVICEMANAGEMENT}/department/departmentById`,
                                    { data: {departmentId : req.service.departmentId} }
                                ),
                                axios.post(
                                    `${process.env.USERMICROSERVICE}/customer/country/list`,
                                    { data: {} }
                                ),
                                axios.post(
                                    `${process.env.USERMICROSERVICE}/customer/state/list`,
                                    { data: {} }
                                ),
                            ].map((p) => p.catch((error) => ({ error })))
                        );

                        const [departmentDetails, countryLists, stateLists] = [
                            departmentResponse?.data?.data?.rows?.[0],
                            getAllCountryResponse?.data?.data?.rows,
                            getAllStateCountryWiseResponse?.data?.data?.rows,
                        ];

                        let newApplicationData = JSON.parse(
                            findApplication?.applicationData
                        )?.formData;

                        // Process application data
                        if (Array.isArray(newApplicationData)) {
                            const cleanHTML = (html) =>
                                html ? html.replace(/<\/?[^>]+>/gi, "") : "";
                            const getNameById = (id, list) =>
                                list?.find((item) => item.id == id)?.name ||
                                null;

                            newApplicationData = newApplicationData.map(
                                (item) => {
                                    const label = cleanHTML(item.label);
                                    let value =
                                        item.value ||
                                        (item.values &&
                                            item.values.find((v) => v.selected)
                                                ?.label) ||
                                        "N/A";

                                    if (
                                        label
                                            .toLowerCase()
                                            .includes("country")
                                            || (item.description && item.description.includes("country") 
                                            && 
                                            !item.description.includes("state"))
                                        &&
                                        !isNaN(value)
                                    ) {
                                        value = getNameById(
                                            value,
                                            countryLists
                                        );
                                    } else if (
                                        label.toLowerCase().includes("state") &&
                                        !isNaN(value)
                                    ) {
                                        value = getNameById(value, stateLists);
                                    } else if (
                                        item.type === "date" &&
                                        value !== "N/A"
                                    ) {
                                        value = formatDateString(value);
                                    }

                                    return { ...item, label, value };
                                }
                            );
                        }

                        const { certificateExpiryTime, agentDetails } = serviceData;

                        const Qrdata = {
                            id: findApplication?.applicationId,
                            application: serviceData?.slug,
                        };

                        const encryptData = encrypt(Qrdata);
                        const qrCodeDataURL = await QRCode.toDataURL(
                            `${process.env.API_URL}scanQRcode/certificate/${encryptData.data}`
                        );

                        const certificateGenerateDate = new Date()

                        let filePath;
                        let uploadResult;

                        if(getServiceTemplate){
                            const newreplacePlaceholdersInHTML = (htmlString, dataArray) => {
                                const escapeRegExp = (string) => {
                                    if (typeof string !== "string") {
                                        return "";
                                    }
                                    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                };
                            
                                if (!htmlString || typeof htmlString !== "string") {
                                    throw new Error("Invalid HTML string.");
                                }
                            
                                if (!Array.isArray(dataArray)) {
                                    throw new Error("Data array must be an array.");
                                }
                            
                                dataArray.forEach((item) => {
                                    if (!item || typeof item !== "object") {
                                        return;
                                    }
                            
                                    const { name, value } = item;
                            
                                    if (!name) {
                                        return;
                                    }
                            
                                    // Create a regex to find placeholders matching the pattern @@name@@
                                    const pattern = new RegExp(`@@\\s*${escapeRegExp(name)}\\s*@@`, "g");
                            
                                    // Replace the placeholder with the provided value
                                    htmlString = htmlString.replace(pattern, value !== undefined && value !== null ? String(value) : "");
                                });
                            
                                return htmlString;
                            };
        
                            let finalApplicationData;
                            const parsedApplicationData =
                            applicationUpdate &&
                            newreplacePlaceholdersInHTML(
                                serviceData?.certificateTemplate,
                                newApplicationData
                            );
                             finalApplicationData = getServiceTemplate.serviceTemplate.replace(/@@main_body_content@@/g, parsedApplicationData)
        
                            
                            let expiryDateInDate = null;
            
                            if (
                                certificateExpiryTime !== null &&
                                certificateExpiryTime !== undefined &&
                                certificateExpiryTime !== 0
                            ) {
                                expiryDateInDate = new Date();
                                expiryDateInDate.setDate(expiryDateInDate.getDate() + certificateExpiryTime);
            
                                expiryDateInDate = expiryDateInDate.toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                });
                            }
        
                            let newTemplateContent;
                            if (getServiceTemplate && serviceData?.slug === "nbl") {
                                // const htmlContent = getServiceTemplate.headerTemplate;
                                newTemplateContent = finalApplicationData
                                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                                .replace(/@@qr_code@@/g, qrCodeDataURL)
                                .replace(/@@certificate_number@@/g, findApplication.applicationId)
                                .replace(/@@license_number@@/g, findApplication.applicationId)
                                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                                .replace(/@@issue_date@@/g, formatDateString(certificateGenerateDate))
                                .replace(/@@expiry_date@@/g, expiryDateInDate)
                                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                                .replace(/@@officer_title@@/g, "-")
                                .replace(/@@officer_signature@@/g, "-")
                                .replace(/@@official_stamp@@/g, "-")
                                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                                .replace(/@@department_website@@/g, departmentDetails.url || "-")
                            }else if(getServiceTemplate && serviceData?.slug === "tcs"){
                                newTemplateContent = finalApplicationData
                                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                                .replace(/@@qr_code@@/g, qrCodeDataURL)
                                .replace(/@@certificate_number@@/g, findApplication.applicationId)
                                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                                .replace(/@@expiry_date@@/g, expiryDateInDate)
                                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                                .replace(/@@officer_title@@/g, "-")
                                .replace(/@@officer_signature@@/g, "-")
                                .replace(/@@official_stamp@@/g, "-")
                                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                                .replace(/@@department_website@@/g, departmentDetails.url || "-")
                            }else if(getServiceTemplate && serviceData?.slug === "pcs"){
                                newTemplateContent = finalApplicationData
                                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                                .replace(/@@qr_code@@/g, qrCodeDataURL)
                                .replace(/@@certificate_number@@/g, findApplication.applicationId)
                                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                                .replace(/@@expiry_date@@/g, expiryDateInDate)
                                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                                .replace(/@@officer_title@@/g, "-")
                                .replace(/@@officer_signature@@/g, "-")
                                .replace(/@@official_stamp@@/g, "-")
                                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                                .replace(/@@department_website@@/g, departmentDetails.url || "-")
                            }else if(getServiceTemplate && serviceData?.slug === "bcs"){
                                newTemplateContent = finalApplicationData
                                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                                .replace(/@@qr_code@@/g, qrCodeDataURL)
                                .replace(/@@certificate_number@@/g, findApplication.applicationId)
                                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                                .replace(/@@department_website@@/g, departmentDetails.url || "-")
                            }
        
                            filePath = await generateDynamicPDF({
                                formData: newTemplateContent,
                                filePath: generateFilePath(),
                            });
                        }else{
                            // Replace placeholders in HTML
                            const replacePlaceholdersInHTML = (
                                htmlString,
                                dataArray
                            ) => {
                                const escapeRegExp = (string) =>
                                    string?.replace(
                                        /[.*+?^${}()|[\]\\]/g,
                                        "\\$&"
                                    ) || "";
                                return dataArray.reduce((html, item) => {
                                    if (
                                        !item ||
                                        typeof item !== "object" ||
                                        item.name == null
                                    )
                                        return html;
                                    const pattern = new RegExp(
                                        `@@\\s*${escapeRegExp(item.name)}\\s*@@`,
                                        "g"
                                    );
                                    return html.replace(
                                        pattern,
                                        item.value != null ? String(item.value) : ""
                                    );
                                }, htmlString);
                            };
    
                            const parsedApplicationData = replacePlaceholdersInHTML(
                                serviceData?.certificateTemplate,
                                newApplicationData
                            );
    
                            const pdfData = {
                                departmentName: serviceData?.departmentName,
                                departmentLogo: departmentDetails?.imageData?.documentPath,
                                serviceName: serviceData?.serviceName,
                                formData: parsedApplicationData,
                                filePath: generateFilePath(),
                                certificateNumber: findApplication.applicationId,
                                certificateGenerateDate: formatDateString(certificateGenerateDate)
                            };
                        
                            filePath = await generatePDF(
                                pdfData,
                                qrCodeDataURL
                            );
                        }

                        uploadResult = await uploadPDF(
                            filePath,
                            userId,
                            findApplication?.associatedCustomerId,
                            `${serviceData?.serviceName} Certificate`,
                            serviceData?.slug
                        );

                        issuedDocumentData = uploadResult?.data?.[0];

                        const issuedId = uploadResult.data?.[0].id;

                        const description = `Your application has been approved and the ${serviceData?.serviceName} has been issued. You may download it from your account at your earliest convenience.`;

                        let expiryDate = null;
                        

                        // Check if certificateExpiryTime is not 0
                        if (
                            certificateExpiryTime !== null &&
                            certificateExpiryTime !== undefined &&
                            certificateExpiryTime !== 0
                        ) {
                            expiryDate = new Date(); // Start with current date
                            expiryDate.setDate(
                                expiryDate.getDate() + certificateExpiryTime
                            ); // Add certificateExpiryTime days
                        }
                        await Promise.allSettled([
                            req.applicationLogModel.create({
                                applicationId: applicationId,
                                customerId: findApplication?.customerId,
                                userId: userId,
                                documentId: documentId,
                                description: description,
                                logBy: "0",
                                oldStatus: findApplication?.status,
                                newStatus: status,
                            }),
                            req.applicationModel.update(
                                {
                                    issuedDocumentId: issuedId,
                                    expiryDate: expiryDate,
                                    certificateGenerateDate: certificateGenerateDate
                                },
                                { where: { id: applicationId } }
                            ),
                        ]);

                        const notificationBody = {
                            customerId: findApplication?.customerId,
                            serviceSlug: serviceData?.slug,
                            departmentId: serviceData?.departmentId,
                            title: `${serviceData?.serviceName} status update.`,
                            message: description,
                            type: "1",
                            addedBy: "1",
                            applicationId: findApplication.applicationId,
                        };

                        await axios
                            .post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                                data: notificationBody,
                            })
                            .catch((error) => console.error(error));

                        try {
                            const template = await axios.post(
                                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                { data: { slug: "applicationstatus" } }
                            );
                            const getTemplate = template.data.data;
                            let htmlTemplate = getTemplate.content
                                .replace(
                                    /@@SERVICENAME@@/g,
                                    serviceData?.serviceName
                                )
                                .replace(
                                    /@@APPLICATIONID@@/g,
                                    findApplication?.applicationId
                                )
                                .replace(/@@DESCRIPTION@@/g, description);

                            // Uncomment these lines when ready to send emails
                            // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                            // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                        } catch (error) {
                            console.error(error);
                        }
                    } else {
                        const description = `Your application for ${serviceData?.serviceName} has been approved.`;

                        await req.applicationLogModel.create({
                            applicationId: applicationId,
                            customerId: findApplication?.customerId,
                            userId: userId,
                            documentId: documentId,
                            description: description,
                            logBy: "0",
                            oldStatus: findApplication?.status,
                            newStatus: status,
                        });

                        const notificationBody = {
                            customerId: findApplication?.customerId,
                            serviceSlug: serviceData?.slug,
                            departmentId: serviceData?.departmentId,
                            title: `${serviceData?.serviceName} status update.`,
                            message: description,
                            type: "1",
                            addedBy: "1",
                            applicationId: findApplication.applicationId,
                        };

                        await axios
                            .post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                                data: notificationBody,
                            })
                            .catch((error) => console.error(error));

                        try {
                            const template = await axios.post(
                                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                                { data: { slug: "applicationstatus" } }
                            );
                            const getTemplate = template.data.data;
                            let htmlTemplate = getTemplate.content
                                .replace(
                                    /@@SERVICENAME@@/g,
                                    serviceData?.serviceName
                                )
                                .replace(
                                    /@@APPLICATIONID@@/g,
                                    findApplication?.applicationId
                                )
                                .replace(/@@DESCRIPTION@@/g, description);

                            // Uncomment these lines when ready to send emails
                            // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                            // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    await axios
                        .put(
                            `${process.env.DEPARTMENTREPORT}/application/update`,
                            {
                                data: {
                                    oldUserId: findApplication?.userId,
                                    applicationId:
                                        findApplication?.applicationId,
                                    status: "4",
                                    completedDate: new Date(),
                                    approvedBy: userId,
                                },
                            }
                        )
                        .catch((error) => console.error(error));
                } catch (error) {
                    console.error(
                        "An error occurred while processing the application:",
                        error
                    );
                }
            }
            if (status !== "1" && status !== "4") {
                const notificationBodyCommon = {
                    serviceSlug: serviceData?.slug,
                    departmentId: serviceData?.departmentId,
                    title: `${serviceData?.serviceName} status update.`,
                    type: "1",
                    applicationId: findApplication.applicationId,
                    addedBy: "1",
                };
                let notifications = [];
                notifications.push(
                    {
                        ...notificationBodyCommon,
                        message: `Your ${serviceData.serviceName} application status has been changed.`,
                        customerId: findApplication?.customerId,
                    },
                    {
                        ...notificationBodyCommon,
                        message: `You have changed the status of ${serviceData.serviceName} application successfully.`,
                        userId: assignUserId,
                    }
                );
                try {
                    if (notifications.length > 0) {
                        await axios.post(
                            `${process.env.NOTIFICATIONSERVICE}/create`,
                            {
                                data: notifications,
                            }
                        );
                    }
                } catch (error) {
                    console.log(error);
                }

                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: {
                                slug: "applicationstatus",
                            },
                        }
                    );
                    const getTemplate = template.data.data;
                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(
                            /@@APPLICATIONID@@/g,
                            findApplication.applicationId
                        );

                    // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                    // statusUpdateMail(userEmail, htmlTemplate, serviceData?.serviceName);
                } catch (error) {
                    console.error(error);
                }
                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: {
                                slug: "applicationstatus",
                            },
                        }
                    );
                    const getTemplate = template.data.data;
                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(
                            /@@APPLICATIONID@@/g,
                            findApplication.applicationId
                        )
                        .replace(
                            /@@DESCRIPTION@@/g,
                            `Your ${serviceData?.serviceName} application is currently under review and we will provide an update as soon as possible.`
                        );

                    // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                    // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                } catch (error) {
                    console.error(error);
                }
            }

            try {
                const { ipAddress } = extractDataFromRequest(req);
                const auditLogBody = {
                    recordId: applicationId,
                    action: `${serviceData?.serviceName} Application Status Update`,
                    moduleName: "Application",
                    newValue: status,
                    oldValue: findApplication?.status,
                    type: "0",
                    userId: userId,
                    customerId: null,
                    ipAddress: ipAddress,
                };

                await axios.post(
                    `${process.env.USERMICROSERVICE}/auditLog/create`,
                    {
                        data: auditLogBody,
                    }
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            const log = await req.applicationLogModel.create({
                applicationId: applicationId,
                customerId: findApplication?.customerId,
                userId: userId,
                documentId: documentId,
                description: description,
                logBy: "0",
                oldStatus: findApplication?.status,
                newStatus: status,
            });
            return { log, ...findApplication?.dataValues, issuedDocumentData };
        }
    } catch (error) {
        throw new Error(error);
    }
};
const updateTransactionStatusService= async (
    applicationId,
    transactionStatus,
    paymentToken,
    description,
    transactionId,
    userId,
    serviceData,
    req
) => {
    try {
        const applicationUpdate = await req.applicationModel.update(
            { transactionStatus: transactionStatus ,transactionId:transactionId ,paymentToken:null},
            { where: { id: applicationId } }
        );

        if (applicationUpdate) {
            const findApplication = await req.applicationModel.findOne({
                where: { id: applicationId },
            });
          
                const notificationBodyCommon = {
                    serviceSlug: serviceData?.slug,
                    departmentId: serviceData?.departmentId,
                    title: `${serviceData?.serviceName} payment status update.`,
                    type: "1",
                    applicationId: findApplication.applicationId,
                    addedBy: "1",
                };
                let notifications = [];
                notifications.push(
                    {
                        ...notificationBodyCommon,
                        message: transactionStatus ==="1" ?`Your ${serviceData?.serviceName} application charge later payment has been successfully completed.`:
                        `Your ${serviceData?.serviceName} application charge later payment has been failed.`,
                        customerId: findApplication?.customerId,
                    },
                );
                try {
                    if (notifications.length > 0) {
                        await axios.post(
                            `${process.env.NOTIFICATIONSERVICE}/create`,
                            {
                                data: notifications,
                            }
                        );
                    }
                } catch (error) {
                    console.log(error);
                }

                try {
                    const template = await axios.post(
                        `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                        {
                            data: {
                                slug: "applicationstatus",
                            },
                        }
                    );
                    const getTemplate = template.data.data;
                    let htmlTemplate = getTemplate.content
                        .replace(
                            /@@SERVICENAME@@/g,
                            `${serviceData?.serviceName}`
                        )
                        .replace(
                            /@@APPLICATIONID@@/g,
                            findApplication.applicationId
                        )
                        .replace(
                            /@@DESCRIPTION@@/g,
                             transactionStatus ==="1" ?`Your ${serviceData?.serviceName} application charge later payment has been successfully.`:
                        `Your ${serviceData?.serviceName} application charge later payment has been failed.`,
                        );

                    // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
                    // statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
                } catch (error) {
                    console.error(error);
                }
            

            try {
                const { ipAddress } = extractDataFromRequest(req);
                const auditLogBody = {
                    recordId: applicationId,
                    action: `${serviceData?.serviceName} application charge later payment attempt ${transactionStatus==="1"?"successfully done":"failed"}.`,
                    moduleName: "Application",
                    newValue: findApplication?.status,
                    oldValue: findApplication?.status,
                    type: "0",
                    userId: userId,
                    customerId: null,
                    ipAddress: ipAddress,
                };

                await axios.post(
                    `${process.env.USERMICROSERVICE}/auditLog/create`,
                    {
                        data: auditLogBody,
                    }
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            const log = await req.applicationLogModel.create({
                applicationId: applicationId,
                customerId: findApplication?.customerId,
                userId: userId,
                documentId: null,
                description: description,
                logBy: "0",
                oldStatus: findApplication?.status,
                newStatus: findApplication?.status,
            });
            return { log, ...findApplication?.dataValues };
        }
    } catch (error) {
        throw new Error(error);
    }
};
const getlogListServices = async (
    applicationId,
    searchFilter,
    dateRange = null,
    duration,
    Order = "DESC"
) => {
    try {
        let whereCondition = {
            applicationId: applicationId,
        };

        // Handle search filter
        if (searchFilter) {
            whereCondition.description = { [Op.like]: `%${searchFilter}%` };
        }

        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            // Adjust endDate to include the entire day
            endDate.setHours(23, 59, 59, 999);

            whereCondition.createdDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        const now = new Date(); // Gets the current date and time
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        ); // Resets hours, minutes, seconds, and milliseconds to 0

        switch (duration) {
            case "today":
                whereCondition.createdDate = {
                    [Op.gte]: today,
                };
                break;
            case "weekly":
                let oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 7);
                whereCondition.createdDate = {
                    [Op.gte]: oneWeekAgo,
                };
                break;
            case "monthly":
                let oneMonthAgo = new Date(today);
                oneMonthAgo.setMonth(today.getMonth() - 1);
                whereCondition.createdDate = {
                    [Op.gte]: oneMonthAgo,
                };
                break;
            default:
                break;
        }

        const applicationLog = await applicationLogModel.findAndCountAll({
            where: whereCondition,
            order: [["createdDate", Order]],
        });
        if (applicationLog) {
            let customerResponse;
            let documentResponse;
            let getAlluserList;

            try {
                customerResponse = await axios.post(
                    `${process.env.USERMICROSERVICE}/customer/customerList`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            try {
                documentResponse = await axios.post(
                    `${process.env.DOCUMENT_URL}document/list/upload`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            try {
                getAlluserList = await axios.post(
                    `${process.env.USERMICROSERVICE}/user/getAlluser`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            const customerLists = customerResponse?.data?.data?.rows;
            const documentList = documentResponse?.data?.data?.rows;
            const getAdminuserList = getAlluserList?.data?.data?.rows;

            const parsedApplicationsLog = applicationLog.rows.map(
                (application) => {
                    const findcustomerData = customerLists.find(
                        (data) => data.id === application?.customerId
                    );
                    const findUserData = getAdminuserList.find(
                        (data) => data.id === application?.userId
                    );
                    let customerInfo;
                    if (findcustomerData) {
                        customerInfo = documentList.find(
                            (doc) => doc.id === findcustomerData?.nibImageId
                        );
                    }

                    let userInfo;
                    if (findUserData) {
                        userInfo = documentList.find(
                            (doc) => doc.id === findUserData?.profileImageId
                        );
                    }
                    let docInfo;
                    if (application?.documentId) {
                        docInfo = documentList.find(
                            (doc) => doc.id === application?.documentId
                        );
                    }
                    return {
                        ...application.toJSON(),
                        customerInfo: {
                            id: findcustomerData?.id,
                            firstName: findcustomerData?.firstName,
                            middleName: findcustomerData?.middleName,
                            lastName: findcustomerData?.lastName,
                            documentId: customerInfo?.id,
                            documentName: customerInfo?.documentName,
                            documentPath: customerInfo?.documentPath,
                            fileSize: customerInfo?.fileSize,
                        },
                        userInfo: {
                            id: findUserData?.id,
                            name: findUserData?.name,
                            documentId: userInfo?.id,
                            documentName: userInfo?.documentName,
                            documentPath: userInfo?.documentPath,
                            fileSize: userInfo?.fileSize,
                        },
                        attachedDoc: {
                            id: docInfo?.id,
                            documentName: docInfo?.documentName,
                            documentType: docInfo?.documentType,
                            documentPath: docInfo?.documentPath,
                            fileSize: docInfo?.fileSize,
                        },
                    };
                }
            );
            return { count: applicationLog.count, rows: parsedApplicationsLog };
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getReqDocUploadedFileService = async (applicationId) => {
    try {
        const applicationDoc = await documentRequiredModel.findAndCountAll({
            where: {
                applicationId: applicationId,
            },
        });
        if (applicationDoc) {
            let documentResponse;

            try {
                documentResponse = await axios.post(
                    `${process.env.DOCUMENT_URL}document/list/upload`,
                    { data: {} }
                );
            } catch (error) {
                console.log(error);
            }

            const documentList = documentResponse?.data?.data?.rows;

            const modifyApplicationsDoc = applicationDoc.rows.map(
                (application) => {
                    let docInfo;
                    if (application?.uploadedDocumentId) {
                        docInfo = documentList.find(
                            (doc) => doc.id === application?.uploadedDocumentId
                        );
                    }
                    return {
                        ...application.toJSON(),
                        attachedDoc: {
                            id: docInfo?.id,
                            documentName: docInfo?.documentName,
                            documentType: docInfo?.documentType,
                            documentPath: docInfo?.documentPath,
                            fileSize: docInfo?.fileSize,
                        },
                    };
                }
            );
            return { count: applicationDoc.count, rows: modifyApplicationsDoc };
        }
    } catch (error) {
        throw new Error(error);
    }
};

const bookAppoitmentRequestService = async (applicationId,userId, departmentId,description, req) => {
    const { applicationModel } = req;
    try {
        const findApplication = await applicationModel.findOne({
            where: { id: applicationId },
            raw: true,
        });
        await applicationModel.update(
            { bookingDetails: null },
            { where: { id: applicationId } }
        );

        const updateApplicationModel = await applicationModel.update(
            { isBooking: "1" },
            { where: { id: applicationId } }
        );
        const applicationData = await applicationModel.findAndCountAll({
            where: { id: applicationId },
        });
        try {
            const notificationBody = {
                customerId: findApplication?.customerId,
                serviceSlug: findApplication?.serviceData?.slug,
                departmentId: departmentId,
                title: `Booking Confirmation`,
                message: `You received a booking request for Application ID: ${findApplication?.applicationId}`,
                type: "1",
                addedBy: "1",
                applicationId: findApplication?.applicationId,
            };

            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                data: notificationBody,
            });
        } catch (error) {
            console.error("Error sending notification =>", error);
        }
        try{
            await req.applicationLogModel.create({
                applicationId: applicationId,
                customerId: findApplication?.customerId,
                userId: userId,
                documentId: null,
                description: description,
                logBy: "0",
                oldStatus: findApplication?.status,
                newStatus: findApplication?.status,
            });
        }catch(error){
            console.error("Error creating activity log =>", error);

        }
        return updateApplicationModel, applicationData?.rows;
    } catch (error) {
        throw new Error(error);
    }
};

const appoitmentDetailsService = async (
    eData,
    visitorId,
    bookingDetails,
    checksum,
    req
) => {
    try {
        const { applicationModel } = req;
        const decryptData = await decrypt(eData);
        let applicationId;
        let applicationSlug;
        if (!decryptData) {
            throw new Error("Decryption failed or application ID not found");
        } else {
            applicationId =
                decryptData?.data?.applicationData[0]?.applicationId;
            applicationSlug =
                decryptData?.data?.applicationData[0]?.serviceSlug;
        }
        const updateBookingDetails = await applicationModel.update(
            { bookingDetails: JSON.stringify({ bookingDetails, visitorId, checksum }) },
            { where: { applicationId: applicationId } }
        );
        updateBookingDetails;

        return {};
    } catch (error) {
        console.error("Error updating application:", error.message);
        throw new Error(error.message);
    }
};
const sendBookAndMeetDataService = async (applicationId, customerId, req) => {
    const { applicationModel } = req;
    try {
        const applicationList = await applicationModel.findAndCountAll({
            where: { id: applicationId },
        });

        const response = await axios.post(
            `${process.env.USERMICROSERVICE}/customer/view`,
            {
                data: {
                    id: customerId,
                },
            }
        );

        const citizenData = response?.data?.data?.rows;

        const applicationData = applicationList?.rows.map((application) => ({
            applicationId: application.dataValues.applicationId,
            customerId: application.dataValues.customerId,
            userId: application.dataValues.userId,
            serviceSlug: application.dataValues.serviceData?.slug,
        }));

        const citizenDetails = citizenData?.map((citizen) => ({
            id: citizen?.id,
            name: `${citizen?.firstName} ${citizen?.middleName} ${citizen?.lastName}`,
            mobileNumber: citizen?.mobileNumber,
            email: citizen?.email,
        }));

        const encryptedResponse = encrypt({ applicationData, citizenDetails });
        return encryptedResponse;
    } catch (error) {
        console.log("error", error);
        throw new Error("Error occurred while fetching data", error);
    }
};

const getBookingConfirmationService = async (
    applicationId,
    departmentId,
    req
) => {
    const { applicationModel } = req;

    try {
        await applicationModel.update(
            { isBooking: "0" },
            { where: { id: applicationId } }
        );
        const findApplication = await applicationModel.findOne({
            where: { id: applicationId },
        });
        // Send a notification
        try {
            const notificationBody = {
                customerId: findApplication?.customerId,
                serviceSlug: findApplication?.serviceData?.slug,
                departmentId: departmentId,
                title: `Booking Confirmation`,
                message: `Your booking for ${findApplication?.applicationId} has been confirmed`,
                type: "1",
                addedBy: "1",
                applicationId: findApplication?.applicationId,
            };

            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                data: notificationBody,
            });
        } catch (error) {
            console.error("Error sending notification =>", error);
        }

        return { findApplication };
    } catch (error) {
        console.error("Error in application processing:", error.message);
        throw new Error(error.message);
    }
};

const bookingCancelService = async (applicationId, departmentId, req) => {
    const { applicationModel } = req;
    
    try {

        await applicationModel.update(
            { isBooking: "0", bookingDetails: null },
            { where: { id: applicationId } }
        );

        const findApplication = await applicationModel.findOne({
            where: { id: applicationId },
        });
        
        
        // Send a notification
        const notificationBody = {
            customerId: findApplication?.customerId,
            serviceSlug: findApplication?.serviceData?.slug,
            departmentId: departmentId,
            title: `Booking is Cancel`,
            message: `Your booking for ${findApplication?.applicationId} has been Canceled`,
            type: "1",
            addedBy: "1",
            applicationId: findApplication?.applicationId,
        };

        await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
            data: notificationBody,
        });
        return { findApplication }
    } catch (error) {
        console.log("error",error);
        throw new Error(error.message);
    }
};

const createRequestDocumentService = async (
    applicationId,
    documentData,
    logData,
    req
) => {
    try {
        // let createdDocuments = []; // Array to store the results of document creations
        const { applicationModel, applicationLogModel } = req;

        const application = await applicationModel.findOne({
            where: { id: applicationId },
            raw: true,
        });

        if (!application) {
            throw new Error("Application not found");
        }

        const { applicationData, uploadedDocuments } = application;
        const parsedAppData = JSON.parse(applicationData);
        const existingRequiredDocs =
            parsedAppData?.requiredDocumentList?.data || [];
        const existingSelectedDocumentIds = parsedAppData?.selectedDocumentIds;

        // Fetch all documents
        const allDocumentsResponse = await axios.post(
            `${process.env.DOCUMENT_URL}document-list/view`,
            { data: {} }
        );
        const allDocuments = allDocumentsResponse?.data?.data?.rows || [];

        // Filter documents based on provided documentData
        const updatedDocuments = allDocuments.filter((doc) =>
            documentData.some((item) => item.value === doc.slug)
        );

        // Update required document list
        const updateRequiredDocs = (existing, updated) => {
            const existingMap = new Map(
                existing.map((item) => [item.id, item])
            );

            updated.forEach((doc) => {
                if (existingMap.has(doc.id)) {
                    existingMap.get(doc.id).uploadedDocumentId = null;
                } else {
                    existing.push({
                        ...doc,
                        documentFileType: JSON.parse(doc.documentFileType),
                        isRequired: doc.isRequired === "1",
                        canApply: doc.canApply === "1",
                        uploadedDocumentId: null,
                    });
                }
            });

            return existing;
        };

        const updatedRequiredDocs = updateRequiredDocs(
            existingRequiredDocs,
            updatedDocuments
        );

        // Update uploaded documents
        const updateUploadedDocs = (uploaded, docList) => {
            const updatedUploaded = { ...uploaded };
            docList.forEach((doc) => {
                updatedUploaded[doc.slug] = null;
            });
            return updatedUploaded;
        };

        const updatedUploadedDocs = updateUploadedDocs(
            uploadedDocuments,
            updatedDocuments
        );

        const updatedSelectedDocumentIds = updateUploadedDocs(
            existingSelectedDocumentIds,
            updatedDocuments
        );

        // Update application data
        const updatedAppData = {
            ...parsedAppData,

            selectedDocumentIds: updatedSelectedDocumentIds,
            requiredDocumentList: {
                ...parsedAppData.requiredDocumentList,
                data: updatedRequiredDocs,
            },
        };

        // Update the application in the database
        const createdDocuments = await applicationModel.update(
            {
                applicationData: JSON.stringify(updatedAppData),
                uploadedDocuments: updatedUploadedDocs,
            },
            { where: { id: applicationId } }
        );

        // Create a log entry
        const logEntry = await applicationLogModel.create({
            applicationId: applicationId,
            customerId: logData?.customerId,
            userId: logData?.userId,
            description: logData?.description,
            logBy: "0",
            oldStatus: logData?.oldStatus,
            newStatus: logData?.newStatus,
        });

        try {
            const { ipAddress } = extractDataFromRequest(req);
            const auditLogBody = {
                recordId: application?.applicationId,
                action: `Request Document For ${req?.service?.serviceName}`,
                moduleName: "Application",
                newValue: documentData,
                oldValue: "N/A",
                type: "0",
                userId: logData?.userId,
                customerId: null,
                ipAddress: ipAddress,
            };

            await axios.post(
                `${process.env.USERMICROSERVICE}/auditLog/create`,
                {
                    data: auditLogBody,
                }
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }
        try {
            const notificationBody = {
                customerId: application?.customerId,
                serviceSlug: req?.service?.slug,
                departmentId: req?.service?.departmentId,
                title: `${req?.service?.serviceName} Document request.`,
                message: `Request Document For ${req?.service?.serviceName}.`,
                type: "1",
                addedBy: "1",
                applicationId: application?.applicationId,
            };

            await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                data: notificationBody,
            });
        } catch (error) {
            console.error("Error sending notification =>", error);
        }
        try {
            const template = await axios.post(
                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                {
                    data: { slug: "applicationstatus" },
                }
            );
            const getTemplate = template.data.data;

            let htmlTemplate = getTemplate.content
                .replace(/@@SERVICENAME@@/g, `${req?.service?.serviceName}`)
                .replace(/@@APPLICATIONID@@/g, application?.applicationId)
                .replace(
                    /@@DESCRIPTION@@/g,
                    `Request document for ${req?.service?.serviceName}.`
                );

            //   statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, req?.service?.serviceName);
            // statusUpdateMail(customerEmail, htmlTemplate, req?.service?.serviceName);
        } catch (error) {
            console.error(error);
        }

        return {
            createdDocuments: createdDocuments,
            logEntry: logEntry,
        };
    } catch (error) {
        console.error("Failed to create document requests:", error);
        throw new Error("Failed to create document requests: " + error.message);
    }
};

const updateRequiredDocumentService = async (
    applicationId,
    documentSlug,
    uploadedDocumentId,
    req
) => {
    try {
        const { applicationModel, applicationLogModel } = req;
        const application = await applicationModel.findOne({
            where: { id: applicationId },
            raw: true,
        });

        if (!application) {
            throw new Error("Application not found");
        }

        const { applicationData, uploadedDocuments } = application;
        const parsedAppData = JSON.parse(applicationData);

        // Update requiredDocumentList.data
        const existingRequiredDocs =
            parsedAppData?.requiredDocumentList?.data || [];
        const updatedReqDoc = existingRequiredDocs.find(
            (doc) => doc.slug === documentSlug
        );

        if (updatedReqDoc) {
            updatedReqDoc.uploadedDocumentId = uploadedDocumentId;
        }

        // Update selectedDocumentIds
        const existingSelectedDocumentIds =
            parsedAppData?.selectedDocumentIds || {};
        if (existingSelectedDocumentIds[documentSlug]) {
            existingSelectedDocumentIds[documentSlug] = uploadedDocumentId;
        } else {
            existingSelectedDocumentIds[documentSlug] = uploadedDocumentId;
        }

        // Update uploadedDocuments
        let updatedUploadedDocuments = uploadedDocuments || {};
        if (updatedUploadedDocuments[documentSlug]) {
            updatedUploadedDocuments[documentSlug] = uploadedDocumentId;
        } else {
            updatedUploadedDocuments[documentSlug] = uploadedDocumentId;
        }

        // Prepare updated application data
        parsedAppData.requiredDocumentList.data = existingRequiredDocs;
        parsedAppData.selectedDocumentIds = existingSelectedDocumentIds;

        // Update the application record
        await applicationModel.update(
            {
                applicationData: JSON.stringify(parsedAppData),
                uploadedDocuments: updatedUploadedDocuments,
            },
            { where: { id: applicationId } }
        );

        const notificationBodyCommon = {
            serviceSlug: req?.service?.slug,
            departmentId: req?.service?.departmentId,
            title: "Document upload.",
            type: "1",
            applicationId: application?.applicationId,
            addedBy: "0",
        };
        let notifications = [];
        notifications.push(
            {
                ...notificationBodyCommon,
                message: `You have successfully uploaded the document for the application ${application?.applicationId}.`,
                customerId: application.customerId,
            },
            {
                ...notificationBodyCommon,
                message: `Customer with application ${application?.applicationId} has successfully uploaded the document.`,
                userId: application?.userId,
            }
        );
        try {
            if (notifications.length > 0) {
                await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                    data: notifications,
                });
            }
        } catch (error) {
            console.log(error);
        }
        try {
            const { ipAddress } = extractDataFromRequest(req);
            const auditLogBody = {
                recordId: application?.applicationId,
                action: `Document upload`,
                moduleName: "Application",
                newValue: req?.body?.data,
                oldValue: application?.uploadedDocuments,
                type: "1",
                userId: null,
                customerId: application?.customerId,
                ipAddress: ipAddress,
            };
            await axios.post(
                `${process.env.USERMICROSERVICE}/auditLog/create`,
                {
                    data: auditLogBody,
                }
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }
        try {
            const template = await axios.post(
                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                {
                    data: {
                        slug: "assignedapplication",
                    },
                }
            );
            const getTemplate = template.data.data;
            let htmlTemplate = getTemplate.content
                .replace(/@@SERVICENAME@@/g, `${req?.service?.serviceName}`)
                .replace(/@@APPLICATIONID@@/g, application?.applicationId)
                .replace(
                    /@@DESCRIPTION@@/g,
                    `Customer with application ${application?.applicationId} has successfully uploaded the document.`
                );
            // adminAssignMail("v1.netclues@gmail.com", htmlTemplate, req?.service?.serviceName);
            // adminAssignMail(userEmail, htmlTemplate, req?.service?.serviceName);
        } catch (error) {
            console.error(error);
        }
        try {
            const template = await axios.post(
                `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                {
                    data: { slug: "applicationstatus" },
                }
            );
            const getTemplate = template.data.data;

            let htmlTemplate = getTemplate.content
                .replace(/@@SERVICENAME@@/g, `${req?.service?.serviceName}`)
                .replace(/@@APPLICATIONID@@/g, application?.applicationId)
                .replace(
                    /@@DESCRIPTION@@/g,
                    `You have successfully uploaded the document for ${req?.service?.serviceName} certificate for application ${application?.applicationId}.`
                );

            // statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, req?.service?.serviceName);
            // statusUpdateMail(customerEmail, htmlTemplate, req?.service?.serviceName);
        } catch (error) {
            console.error(error);
        }

        // Create application log entry
        const logEntry = await applicationLogModel.create({
            applicationId: application.id,
            customerId: application.customerId,
            userId: application.userId,
            description: `${
                updatedReqDoc?.documentName || documentSlug
            } uploaded successfully`,
            logBy: "1",
            oldStatus: application.status,
            newStatus: application.status,
        });

        return {
            uploadedDocuments: updatedReqDoc,
            logEntry: logEntry,
        };
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const getDataForCombineList = async (reqBody) => {
    try {
        const {
            customerId,
            applicationId,
            searchFilter,
            departmentId,
            serviceId,
            status,
            userId,
            sortBy,
            sortOrder,
            dateRange,
        } = reqBody;

        let whereCondition = {};

        // Adding filters to whereCondition
        if (customerId) {
            whereCondition.customerId = customerId;
        }
        if (applicationId) {
            whereCondition.applicationId = applicationId;
        }
        if (status) {
            whereCondition.status = status;
        }
        if (userId) {
            whereCondition.userId = userId;
        }
        if (searchFilter) {
            whereCondition.applicationId = { [Op.like]: `%${searchFilter}%` };
        }

        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);

            // Adjust endDate to include the entire day
            endDate.setHours(23, 59, 59, 999);

            whereCondition.createdDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        // Subquery conditions for departmentId and serviceId
        const departmentCondition = departmentId
            ? Sequelize.literal(
                  `EXISTS (SELECT 1 FROM general_setting WHERE settingKey = 'departmentId' AND settingValue = '${departmentId}')`
              )
            : null;

        const serviceCondition = serviceId
            ? Sequelize.literal(
                  `EXISTS (SELECT 1 FROM general_setting WHERE settingKey = 'serviceId' AND settingValue = '${serviceId}')`
              )
            : null;

        // Combine all conditions
        const combinedConditions = [
            whereCondition,
            departmentCondition,
            serviceCondition,
        ].filter(Boolean);

        const applicationList = await applicationModel.findAll({
            where: Sequelize.and(...combinedConditions),
            attributes: {
                include: [
                    [
                        Sequelize.literal(
                            `(SELECT settingValue FROM general_setting WHERE settingKey = 'departmentName' LIMIT 1)`
                        ),
                        "departmentName",
                    ],
                    [
                        Sequelize.literal(
                            `(SELECT settingValue FROM general_setting WHERE settingKey = 'serviceName' LIMIT 1)`
                        ),
                        "serviceName",
                    ],
                ],
            },
            // order: [[sortBy, sortOrder]],
        });

        return { data: applicationList };
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

const getOptionsData = async () => {
    try {
        const businessStructure = await businessStructuresModel.findAll();
        const businessTypes = await businessTypesModel.findAll();
        const companyTypes = await companyTypeModel.findAll();
        const licenseTypes = await licenseTypeModel.findAll();
        const marritalStatus = await marritalStatusModel.findAll();
        const purposes = await purposeModel.findAll();
        return {
            businessStructure,
            businessTypes,
            companyTypes,
            licenseTypes,
            marritalStatus,
            purposes,
        };
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
const getDataforRevenueReportStatus = async (reqBody) => {
    try {
        const { status } = reqBody;
        const whereCondition = {
            transactionStatus: "1",
        };
        if (status) {
            whereCondition.status = status;
        }
        const results = await applicationModel.findAll({
            where: whereCondition,
            attributes: ["id", "applicationId", "status"],
        });
        return results;
    } catch (error) {
        throw new Error(error.message);
    }
};
const addRatingService = async (applicationId, rating, ratingFeedback, req) => {
    try {
        const applicationReview = await req.applicationModel.update(
            {
                rating: rating,
                ratingFeedback: ratingFeedback,
            },
            { where: { id: applicationId } }
        );

        return applicationReview;
    } catch (error) {
        throw new Error(error);
    }
};
const TicketCountStatusWise = async (dateRangeOption) => {
    try {
        // Set up the where condition for date range
        let whereConditions = {};
        if (dateRangeOption) {
            const { startDate, endDate } = calculateDateRange(dateRangeOption);
            if (startDate && endDate) {
                whereConditions.createdDate = {
                    [Op.between]: [startDate.toDate(), endDate.toDate()],
                };
            }
        }

        // First query to get the status-wise count
        const result = await applicationModel.findAll({
            attributes: [
                "status",
                [sequelize.fn("COUNT", sequelize.col("status")), "count"],
            ],
            where: whereConditions,
            group: ["status"],
        });

        // Second query to get the count of 'new' status with no userId
        const newWithoutUserIdConditions = {
            status: "2",
            userId: null,
        };
        if (dateRangeOption) {
            const { startDate, endDate } = calculateDateRange(dateRangeOption);
            if (startDate && endDate) {
                newWithoutUserIdConditions.createdDate = {
                    [Op.between]: [startDate.toDate(), endDate.toDate()],
                };
            }
        }

        const newWithoutUserId = await applicationModel.count({
            where: newWithoutUserIdConditions,
        });

        // Transform the result into a more readable format
        const counts = result.reduce(
            (acc, curr) => {
                const status = curr.status;
                const count = curr.dataValues.count;

                switch (status) {
                    case "1":
                        acc.inProgress = count;
                        break;
                    case "2":
                        acc.pending = count;
                        break;
                    case "4":
                        acc.completed = count;
                        break;
                    default:
                        break;
                }

                return acc;
            },
            { new: 0, pending: 0, inProgress: 0, completed: 0 }
        );

        // Add the count of 'new' status with no userId to the 'new' count
        counts.new += newWithoutUserId;

        return counts;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const getRatingsList = async () => {
    try {
        const totalRating = await applicationModel.sum("rating");

        return {
            serviceName: "New Business License",
            totalRating: totalRating,
        };
    } catch (error) {
        console.error("Error fetching ratings:", error);
        throw error;
    }
};

const deleteApplicationByApplicationId = async (applicationId, req) => {
    try {
        const result = await req.applicationModel.findOne({
            where: {
                applicationId: {
                    [Op.like]: `${applicationId}%`,
                },
            },
        });
        const deletApplication = await req.applicationModel.destroy({
            where: {
                id: result.id,
            },
        });
        return deletApplication;
    } catch (error) {
        throw new Error(error);
    }
};

const revenueApplicationStatusService = async (
    slug,
    applicationIds,
    status,
    req
) => {
    try {
        const { applicationModel } = req;

        let whereCondition = {};

        if (applicationIds && applicationIds.length > 0) {
            whereCondition.applicationId = { [Op.in]: applicationIds };
        }
        // Otherwise, filter by status if provided
        else if (status) {
            whereCondition.status = status;
        }

        // Query the database with the selected fields
        let data = await applicationModel.findAndCountAll({
            where: whereCondition,
            attributes: [
                "id",
                "applicationId",
                "customerId",
                "status",
                "transactionStatus",
            ],
            order: [["createdDate", "DESC"]],
            raw: true,
        });

        return { rows: data.rows, count: data.count };
    } catch (error) {
        console.error("Error in revenueApplicationStatusService:", error);
        throw new Error(error);
    }
};

const updateRenewApplicationService = async (
    customerId,
    applicationId,
    transactionId,
    newtransactionStatus,
    autoPay=false,
    serviceData,
    slug,
    req
) => {
    try {
        const { applicationModel, applicationLogModel } = req;

        let result = {};

        const [
            departmentResponse,
            getAllCountryResponse,
            getAllStateCountryWiseResponse,
        ] = await Promise.all(
            [
                axios.post(
                    `${process.env.SERVICEMANAGEMENT}/department/departmentById`,
                    { data: {departmentId : req.service.departmentId} }
                ),
                axios.post(
                    `${process.env.USERMICROSERVICE}/customer/country/list`,
                    {
                        data: {},
                    }
                ),
                axios.post(
                    `${process.env.USERMICROSERVICE}/customer/state/list`,
                    {
                        data: {},
                    }
                ),
            ].map((p) => p.catch((error) => ({ error })))
        );
        const getServiceTemplate = serviceTemplates.find((service)=>service.serviceSlug === slug)

        const [countryLists, stateLists, departmentDetails] = [
            getAllCountryResponse?.data?.data?.rows,
            getAllStateCountryWiseResponse?.data?.data?.rows,
            departmentResponse?.data?.data?.rows?.[0],
        ];

        const applicationStatus = await applicationModel.findOne({
            where: { id: applicationId },
        });

        if (!applicationStatus) {
            throw new Error("Application not found");
        }
        let newApplicationData = JSON.parse(
            applicationStatus?.applicationData
        )?.formData;

        const processApplicationData = (data) => {
            if (!data || !Array.isArray(data)) return [];

            const cleanHTML = (html) => {
                if (!html) return "";
                return html.replace(/<\/?[^>]+>/gi, "");
            };

            return data.map((item) => {
                const label = cleanHTML(item.label);
                let value =
                    item.value ||
                    (item.values &&
                        item.values.find((v) => v.selected)?.label) ||
                    "N/A";

                if (label.toLowerCase().includes("country") ||
                (item.description && item.description.includes("country")
                && !item.description.includes("state")) && !isNaN(value)) {
                    value = getNameById(value, countryLists);
                } else if (
                    label.toLowerCase().includes("state") &&
                    !isNaN(value)
                ) {
                    value = getNameById(value, stateLists);
                } else if (item.type === "date" && value !== "N/A") {
                    value = formatDateString(value);
                }

                return { ...item, label, value };
            });
        };

        const getNameById = (id, list) => {
            const obj = list?.find((item) => item.id == id);
            return obj ? obj.name : null;
        };

        newApplicationData = processApplicationData(newApplicationData);
        const { certificateExpiryTime, agentDetails } = serviceData;

        const certificateGenerateDate = new Date()

        const Qrdata = {
            id: applicationStatus?.applicationId,
            application: slug,
        };

        const encryptData = encrypt(Qrdata);
        const qrCodeDataURL = await QRCode.toDataURL(
            `${process.env.API_URL}scanQRcode/certificate/${encryptData.data}`
        );
        let filePath;
        let uploadResult;

        if(getServiceTemplate){
            const newreplacePlaceholdersInHTML = (htmlString, dataArray) => {
                const escapeRegExp = (string) => {
                    if (typeof string !== "string") {
                        return "";
                    }
                    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                };
            
                if (!htmlString || typeof htmlString !== "string") {
                    throw new Error("Invalid HTML string.");
                }
            
                if (!Array.isArray(dataArray)) {
                    throw new Error("Data array must be an array.");
                }
            
                dataArray.forEach((item) => {
                    if (!item || typeof item !== "object") {
                        return;
                    }
            
                    const { name, value } = item;
            
                    if (!name) {
                        return;
                    }
            
                    // Create a regex to find placeholders matching the pattern @@name@@
                    const pattern = new RegExp(`@@\\s*${escapeRegExp(name)}\\s*@@`, "g");
            
                    // Replace the placeholder with the provided value
                    htmlString = htmlString.replace(pattern, value !== undefined && value !== null ? String(value) : "");
                });
            
                return htmlString;
            };

            let finalApplicationData;
            const parsedApplicationData =
            applicationStatus &&
            newreplacePlaceholdersInHTML(
                serviceData?.certificateTemplate,
                newApplicationData
            );
             finalApplicationData = getServiceTemplate.serviceTemplate.replace(/@@main_body_content@@/g, parsedApplicationData)

            
            let expiryDateInDate = null;

            if (
                certificateExpiryTime !== null &&
                certificateExpiryTime !== undefined &&
                certificateExpiryTime !== 0
            ) {
                expiryDateInDate = new Date();
                expiryDateInDate.setDate(expiryDateInDate.getDate() + certificateExpiryTime);

                expiryDateInDate = expiryDateInDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                });
            }

            let newTemplateContent;
            if (getServiceTemplate && slug === "nbl") {
                // const htmlContent = getServiceTemplate.headerTemplate;
                newTemplateContent = finalApplicationData
                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                .replace(/@@qr_code@@/g, qrCodeDataURL)
                .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                .replace(/@@license_number@@/g, applicationStatus.applicationId)
                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                .replace(/@@issue_date@@/g, formatDateString(certificateGenerateDate))
                .replace(/@@expiry_date@@/g, expiryDateInDate)
                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                .replace(/@@officer_title@@/g, "-")
                .replace(/@@officer_signature@@/g, "-")
                .replace(/@@official_stamp@@/g, "-")
                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                .replace(/@@department_website@@/g, departmentDetails.url || "-")
            }else if(getServiceTemplate && slug === "tcs"){
                newTemplateContent = finalApplicationData
                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                .replace(/@@qr_code@@/g, qrCodeDataURL)
                .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                .replace(/@@expiry_date@@/g, expiryDateInDate)
                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                .replace(/@@officer_title@@/g, "-")
                .replace(/@@officer_signature@@/g, "-")
                .replace(/@@official_stamp@@/g, "-")
                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                .replace(/@@department_website@@/g, departmentDetails.url || "-")
            }else if(getServiceTemplate && slug === "pcs"){
                newTemplateContent = finalApplicationData
                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                .replace(/@@qr_code@@/g, qrCodeDataURL)
                .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                .replace(/@@expiry_date@@/g, expiryDateInDate)
                .replace(/@@officer_name@@/g, agentDetails?.name || "-")
                .replace(/@@officer_title@@/g, "-")
                .replace(/@@officer_signature@@/g, "-")
                .replace(/@@official_stamp@@/g, "-")
                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                .replace(/@@department_website@@/g, departmentDetails.url || "-")
            }else if(getServiceTemplate && slug === "bcs"){
                newTemplateContent = finalApplicationData
                .replace(/@@department_logo@@/g, departmentDetails?.imageData?.documentPath)
                .replace(/@@qr_code@@/g, qrCodeDataURL)
                .replace(/@@certificate_number@@/g, applicationStatus.applicationId)
                .replace(/@@certificate_created_date@@/g, formatDateString(certificateGenerateDate))
                .replace(/@@department_phone_no@@/g, departmentDetails.contactNumber || "-")
                .replace(/@@department_email@@/g, departmentDetails.email || "-")
                .replace(/@@department_website@@/g, departmentDetails.url || "-")
            }

            filePath = await generateDynamicPDF({
                formData: newTemplateContent,
                filePath: generateFilePath(),
            });
        }else{
            const replacePlaceholdersInHTML = (htmlString, dataArray) => {
                const escapeRegExp = (string) => {
                    if (typeof string !== "string") {
                        return "";
                    }
                    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                };

                dataArray.forEach((item) => {
                    if (!item || typeof item !== "object") {
                        return;
                    }

                    const { name, value } = item;

                    if (name === undefined || name === null) {
                        return;
                    }

                    const pattern = new RegExp(
                        `@@\\s*${escapeRegExp(name)}\\s*@@`,
                        "g"
                    );

                    const replacementValue =
                        value !== undefined && value !== null
                            ? String(value)
                            : "";
                    htmlString = htmlString.replace(
                        pattern,
                        replacementValue
                    );
                });

                return htmlString;
            };

            const parsedApplicationData =
            applicationStatus &&
            replacePlaceholdersInHTML(
                serviceData?.certificateTemplate,
                newApplicationData
            );
            const pdfData = {
                departmentName: serviceData?.departmentName,
                departmentLogo: departmentDetails?.imageData?.documentPath,
                serviceName: serviceData?.serviceName,
                formData: parsedApplicationData,
                filePath: generateFilePath(),
                certificateNumber: applicationStatus.applicationId,
                certificateGenerateDate: formatDateString(certificateGenerateDate)
            };

            filePath = await generatePDF(pdfData, qrCodeDataURL);
        }
        
       
        uploadResult = await uploadPDF(
            filePath,
            applicationStatus?.userId,
            applicationStatus?.associatedCustomerId,
            `${serviceData?.serviceName} Certificate`,
            slug
        );
        const issuedId = uploadResult.data?.[0].id;
       
        let expiryDate = null;
        const renewDate = new Date(); // Set renewDate to current date

        // Check if certificateExpiryTime is not 0
        if (
            certificateExpiryTime !== null &&
            certificateExpiryTime !== undefined &&
            certificateExpiryTime !== 0
        ) {
            expiryDate = new Date(); // Start with current date
            expiryDate.setDate(expiryDate.getDate() + certificateExpiryTime); // Add certificateExpiryTime days
        }

        await applicationModel.update(
            {
                issuedDocumentId: issuedId || null,
                transactionId: transactionId,
                transactionStatus: newtransactionStatus ? newtransactionStatus : applicationStatus?.transactionStatus,
                renewDate: renewDate,
                expiryDate: expiryDate,
                certificateGenerateDate: certificateGenerateDate
            },
            { where: { id: applicationId } }
        );
         if(autoPay){
         await axios.post(
            `${process.env.PAYMENTSERVICE}/customerDetails/create/transactionDetails`,
            {
              data: {
                customerId: applicationStatus?.customerId,
                applicationId: applicationStatus?.applicationId,
                serviceSlug: serviceData?.slug,
                departmentId: serviceData?.departmentId,
                transactionId: transactionId,
                transactionAmount: serviceData?.price,
                transactionStatus: newtransactionStatus,
                renew: true,
                ipAddress: "122.22.2333",
              },
            }
          )}

        if (issuedId) {
            await applicationLogModel.create({
                applicationId: applicationStatus.id,
                customerId: applicationStatus.customerId,
                userId: applicationStatus.userId,
                description: `Your ${serviceData?.serviceName} certificate renewed you can download new certficate.`,
                logBy: "1",
                oldStatus: applicationStatus.status,
                newStatus: applicationStatus.status,
            });
            try {
                const notificationBody = {
                    customerId: applicationStatus?.customerId,
                    serviceSlug: slug,
                    departmentId: serviceData?.departmentId,
                    title: `Renew ${serviceData?.serviceName} certificate.`,
                    message: `Your ${serviceData?.serviceName} certificate renewed you can download new certficate.`,
                    type: "1",
                    addedBy: "1",
                    applicationId: applicationStatus.applicationId,
                };

                await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
                    data: notificationBody,
                });
            } catch (error) {
                console.error("Error sending notification =>", error);
            }

            try {
                const customerData = await axios.post(
                    `${process.env.USERMICROSERVICE}/customer/customerListAdmin`,
                    { data: { customerIds: [customerId] } }
                );

                let customerEmail = customerData?.data?.data?.rows[0]?.email;
                const pdfUrlData = uploadResult?.data?.[0]?.documentPath;
                const template = await axios.post(
                    `${process.env.USERMICROSERVICE}/emailtemplate/get`,
                    { data: { slug: "certificate" } }
                );
                const getTemplate = template.data.data;
                let htmlTemplate = getTemplate.content
                    .replace(/@@SERVICENAME@@/g, serviceData?.serviceName)
                    .replace(
                        /@@APPLICATIONID@@/g,
                        applicationStatus?.applicationId
                    )
                    .replace(
                        /@@DESCRIPTION@@/g,
                        "Your application certificate has been issued. You may download it from your account at your earliest convenience."
                    );
                // await sendCertificateMail(customerEmail, htmlTemplate, pdfUrlData, serviceData?.serviceName);
                // await sendCertificateMail("v1.netclues@gmail.com", htmlTemplate, pdfUrlData, serviceData?.serviceName);

            } catch (error) {
                console.error("Error sending email =>", error);
            }
        }

        result.uploadResult = uploadResult;

        return result;
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
};

  const updateRenewFailedApplicationService = async (
    customerId,
    applicationId,
    transactionId,
    newtransactionStatus,
    serviceData,
    slug,
    req
  ) => {
    try {
      const { applicationModel, applicationLogModel } = req;
  
      let result = {};
  
      const [
        departmentLogoResponse,
        getAllCountryResponse,
        getAllStateCountryWiseResponse,
      ] = await Promise.all(
        [
          axios.post(`${process.env.DOCUMENT_URL}document/list/upload`, {
            data: { documentId: serviceData?.departmentLogo },
          }),
          axios.post(`${process.env.USERMICROSERVICE}/customer/country/list`, {
            data: {},
          }),
          axios.post(`${process.env.USERMICROSERVICE}/customer/state/list`, {
            data: {},
          }),
        ].map((p) => p.catch((error) => ({ error })))
      );
  
      const [countryLists, stateLists, departmentLogoData] = [
        getAllCountryResponse?.data?.data?.rows,
        getAllStateCountryWiseResponse?.data?.data?.rows,
        departmentLogoResponse?.data?.data?.rows,
      ];
  
      const applicationStatus = await applicationModel.findOne({
        where: { id: applicationId },
      });
  
      if (!applicationStatus) {
        throw new Error("Application not found");
      }
  
      await applicationModel.update(
        {
          transactionId: null,
          transactionStatus: newtransactionStatus
            ? newtransactionStatus
            : applicationStatus?.transactionStatus,
        },
        { where: { id: applicationId } }
      );

      await applicationLogModel.create({
        applicationId: applicationStatus.id,
        customerId: applicationStatus.customerId,
        userId: applicationStatus.userId,
        description: `Your auto payment for ${serviceData?.serviceName} has failed. Please retry to complete the payment.`,
        logBy: "1",
        oldStatus: applicationStatus.status,
        newStatus: applicationStatus.status,
      });
      try {
        const notificationBody = {
          customerId: applicationStatus?.customerId,
          serviceSlug: slug,
          departmentId: serviceData?.departmentId,
          title: `Renew ${serviceData?.serviceName} .`,
          message: `Your auto payment for ${serviceData?.serviceName} has failed. Please retry to complete the payment.`,
          type: "1",
          addedBy: "1",
          applicationId: applicationStatus?.applicationId,
        };
  
        await axios.post(`${process.env.NOTIFICATIONSERVICE}/create`, {
          data: notificationBody,
        });
      } catch (error) {
        console.error("Error sending notification =>", error);
      }
  
      try {
        const customerData = await axios.post(
          `${process.env.USERMICROSERVICE}/customer/customerListAdmin`,
          { data: { customerIds: [customerId] } }
        );
  
        let customerEmail = customerData?.data?.data?.rows[0]?.email;
        const template = await axios.post(
          `${process.env.USERMICROSERVICE}/emailtemplate/get`,
          { data: { slug: "certificate" } }
        );
        const getTemplate = template.data.data;
        let htmlTemplate = getTemplate.content
          .replace(/@@SERVICENAME@@/g, serviceData?.serviceName)
          .replace(/@@APPLICATIONID@@/g, applicationStatus?.applicationId)
          .replace(
            /@@DESCRIPTION@@/g,
            `Your auto payment for ${serviceData?.serviceName} has failed. Please retry to complete the payment.`
          );
        // await statusUpdateMail(customerEmail, htmlTemplate, serviceData?.serviceName);
        // await statusUpdateMail("v1.netclues@gmail.com", htmlTemplate, serviceData?.serviceName);
      } catch (error) {
        console.error("Error sending email =>", error);
      }
      try {
        await axios.post(
          `${process.env.PAYMENTSERVICE}/customerDetails/create/transactionDetails`,
          {
            data: {
              customerId: applicationStatus?.customerId,
              applicationId: applicationStatus.applicationId,
              serviceSlug: applicationStatus?.serviceData?.slug,
              departmentId: serviceData?.departmentId,
              transactionId: null,
              transactionAmount: serviceData?.price,
              transactionStatus: "2",
              renew: true,
              ipAddress: "122.22.2333",
            },
          }
        );
      } catch (error) {
        console.error("Error sending email =>", error);
      }
  
      return result;
    } catch (error) {
      throw new Error(error);
    }
  };
  
module.exports = {
    createApplicationService,
    getRequiredDocumentServices,
    createApplicationLogService,
    getApplicationListServices,
    assignedUserUpdate,
    genratePdfServices,
    sendNotificationServices,
    bookAppoitmentRequestService,
    appoitmentDetailsService,
    getBookingConfirmationService,
    bookingCancelService,
    sendBookAndMeetDataService,
    updateStatusService,
    getlogListServices,
    getReqDocUploadedFileService,
    createRequestDocumentService,
    updateRequiredDocumentService,
    geGeneralSettingListServices,
    getDataForCombineList,
    getOptionsData,
    getDataforRevenueReportStatus,
    addRatingService,
    TicketCountStatusWise,
    getRatingsList,
    getApplicationByApplicationId,
    getAdminApplicationListServices,
    deleteApplicationByApplicationId,
    revenueApplicationStatusService,
    updateRenewApplicationService,
    updateTransactionStatusService,
    updateRenewFailedApplicationService
};
