const { sequelize, Sequelize } = require("../config/db.connection");
const { departmentsModel, serviceModel } = require("../models");
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const { fetchDocumentData } = require("./cacheFile");

// const notifyMicroservice = async (changedEntity) => {
//     const services = [
//         `${process.env.USERSERVICE}web/webhook`,
//         `${process.env.TICKETSERVICE}/web/webhook`,
//         `${process.env.PAYMENTSERVICE}web/webhook`,
//         `${process.env.DEPARTMENTREPORTSERVICE}web/webhook`,
//         `${process.env.CHATSERVICE}web/webhook`

//     ];

//     const notifyService = async (url) => {
//         try {
//             await axios.post(url, { changedEntity });
//             console.log(`Microservice notified: ${url}`);
//         } catch (error) {
//             if (error.response) {

//                 console.error(`Server responded with error code ${error.response.status} for ${url}`);
//             } else if (error.request) {

//                 console.error(`No response received for ${url}`);
//             } else {

//                 console.error(`Error notifying microservice ${url}:`, error.message);
//             }
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

const departmentFindByName = async (departmentName) => {
  try {
    const department = await departmentsModel.findOne({
      where: {
        departmentName: departmentName,
      },
    });
    return department;
  } catch (error) {
    throw new Error(error);
  }
};

const createDepartment = async (requestBody, req) => {
  try {
    const department = await departmentsModel.create(requestBody);
    try {
      const { userId, ipAddress } = extractDataFromRequest(req);
      const auditLogBody = {
        recordId: null,
        action: "New Department Create",
        moduleName: "Department",
        newValue: requestBody,
        oldValue: "N/A",
        type: "0",
        userId: userId,
        customerId: null,
        ipAddress: ipAddress,
      };

      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    return department;
  } catch (error) {
    throw new Error(error);
  }
};
const deleteDepartmentById = async (departmentId, req) => {
  try {
    if (departmentId) {
      const [department] = await departmentsModel.update(
        { isDeleted: "1" },
        {
          where: {
            id: departmentId,
          },
        }
      );

      try {
        const { userId, ipAddress } = extractDataFromRequest(req);
        const auditLogBody = {
          recordId: departmentId,
          action: "Delete Department",
          moduleName: "Department",
          newValue: departmentId,
          oldValue: "N/A",
          type: "0",
          userId: userId,
          customerId: null,
          ipAddress: ipAddress,
        };

        await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
          data: auditLogBody,
        });
      } catch (error) {
        console.error("Error generating audit log:", error);
      }

      // await notifyMicroservice('department');
      return department;
    }
  } catch (error) {
    throw new Error(error);
  }
};
const updateDepartementById = async (departmentId, updatedData, req) => {
  try {
    let department;
    [department] = await departmentsModel.update(updatedData, {
      where: {
        id: departmentId,
      },
    });
    if (department) {
      department = await departmentsModel.findOne({
        where: {
          id: departmentId,
        },
      });
    }

    try {
      const oldValue = department ? department.get({ plain: true }) : null;
      const { userId, ipAddress } = extractDataFromRequest(req);
      const auditLogBody = {
        recordId: departmentId,
        action: "Update Department",
        moduleName: "Department",
        newValue: updatedData,
        oldValue: oldValue,
        type: "0",
        userId: userId,
        customerId: null,
        ipAddress: ipAddress,
      };

      await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
        data: auditLogBody,
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }

    // await notifyMicroservice('department');
    return department;
  } catch (error) {
    throw new Error(error);
  }
};

const getDepartmentList = async (
  id,
  page,
  perPage,
  searchFilter,
  keyword,
  sortOrder,
  orderBy
) => {
  try {
    if (id) {
      return await departmentsModel.findAndCountAll({
        where: {
          id: id,
          isDeleted: "0",
        },
      });
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || null;
      const offset = (actualPage - 1) * actualPerPage;

      const whereClause = {
        isDeleted: "0",
      };

      if (searchFilter) {
        whereClause[Op.or] = [
          {
            departmentName: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }
      if (keyword) {
        whereClause[Op.or] = [
          {
            keyword: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ];
      }
      if (searchFilter && keyword) {
        whereClause[Op.or] = [
          {
            departmentName: {
              [Op.like]: `%${searchFilter}%`,
            },
            keyword :{
              [Op.like]: `%${keyword}%`,
            }
          },
        ];
      }

      let order = [];
      if (orderBy && sortOrder) {
        order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      }

      const result = await departmentsModel.findAndCountAll({
        where: whereClause,
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true,
      });

      let imageData = [];
      try {
        // const documentResponse = await axios.post(
        //     `${process.env.DOCUMENTSERVICE}document/list/upload`,
        //     { data: {} }
        // );
        // imageData = await fetchDocumentData()
        const documentResponse = await axios.post(
          `${process.env.DOCUMENTSERVICE}document/list/upload`,
          { data: {} }
        );
        imageData = documentResponse?.data?.data?.rows || [];
      } catch (error) {
        console.log("Document API call failed", error);
      }

      const dataWithImage = result?.rows?.map((department) => {
        const matchingImageData = imageData?.find(
          (image) => image.id === department.logo
        );

        if (matchingImageData) {
          return {
            ...department,
            imageData: {
              id: matchingImageData?.id,
              userId: matchingImageData?.userId,
              documentName: matchingImageData?.documentName,
              documentPath: matchingImageData?.documentPath,
              fileSize: matchingImageData?.fileSize,
            },
          };
        } else {
          return department;
        }
      });

      return {
        ...result,
        rows: dataWithImage,
      };
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getDeptKeywordList = async () => {
  try {
    // Find all departments where the keyword field has a non-empty value
    const departments = await departmentsModel.findAndCountAll({
      where: {
        keyword: {
          [Op.not]: null || "", // Check for non-null values
          // You can add additional conditions here if needed
        },
        isDeleted: {
          [Op.ne]: "1",
        },
      },
      attributes: ["id", "keyword", "departmentName"],
    });
    return departments;
  } catch (error) {
    throw new Error(error);
  }
};

const departmentAllList = async (id, searchFilter) => {
  try {
    let whereClause = {
      isDeleted: "0",
    };

    if (id) {
      whereClause.id = id;
    } else {
      if (searchFilter) {
        whereClause[Op.or] = [
          {
            departmentName: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }
    }

    const departments = await departmentsModel.findAndCountAll({
      where: whereClause,
      raw: true,
    });

    const departmentIds = departments.rows.map((department) => department.id);
    const servicesCounts = await serviceModel.findAll({
      attributes: [
        "departmentId",
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("slug"))
          ),
          "servicesCount",
        ],
      ],
      where: {
        departmentId: departmentIds,
      },
      group: ["departmentId"],
      raw: true,
    });

    departments.rows.forEach((department) => {
      const servicesCount = servicesCounts.find(
        (count) => count.departmentId == department.id
      );
      department.servicesCount = servicesCount
        ? servicesCount.servicesCount
        : 0;
    });

    let imageData = [];
    try {
      // imageData = await fetchDocumentData()
      const documentResponse = await axios.post(
        `${process.env.DOCUMENTSERVICE}document/list/upload`,
        { data: {} }
      );
      imageData = documentResponse?.data?.data?.rows || [];
    } catch (error) {
      console.log("Document API call failed", error);
    }

    const dataWithImage = departments?.rows?.map((department) => {
      const matchingImageData = imageData?.find(
        (image) => image.id === department.logo
      );

      if (matchingImageData) {
        return {
          ...department,
          imageData: {
            id: matchingImageData?.id,
            userId: matchingImageData?.userId,
            documentName: matchingImageData?.documentName,
            documentPath: matchingImageData?.documentPath,
            fileSize: matchingImageData?.fileSize,
          },
        };
      } else {
        return department;
      }
    });

    return {
      ...departments,
      rows: dataWithImage,
    };

    // return departments;
  } catch (error) {
    throw new Error(error);
  }
};

const getDepartmentDataById = async (departmentId) => {
  try {
    let whereClause = {
      isDeleted: "0",
    };

    if (departmentId) {
      whereClause.id = departmentId;
    }

    const departments = await departmentsModel.findAndCountAll({
      where: whereClause,
      raw: true,
    });

    const departmentIds = departments.rows.map((department) => department.id);
    const servicesCounts = await serviceModel.findAll({
      attributes: [
        "departmentId",
        [sequelize.fn("COUNT", sequelize.col("id")), "servicesCount"],
      ],
      where: {
        departmentId: departmentIds,
      },
      group: ["departmentId"],
      raw: true,
    });

    departments.rows.forEach((department) => {
      const servicesCount = servicesCounts.find(
        (count) => count.departmentId == department.id
      );
      department.servicesCount = servicesCount
        ? servicesCount.servicesCount
        : 0;
    });

    let imageData = [];
    try {
      // imageData = await fetchDocumentData()
      const documentResponse = await axios.post(
        `${process.env.DOCUMENTSERVICE}document/list/upload`,
        { data: {} }
      );
      imageData = documentResponse?.data?.data?.rows || [];
    } catch (error) {
      console.log("Document API call failed", error);
    }

    const dataWithImage = departments?.rows?.map((department) => {
      const matchingImageData = imageData?.find(
        (image) => image.id === department.logo
      );

      if (matchingImageData) {
        return {
          ...department,
          imageData: {
            id: matchingImageData?.id,
            userId: matchingImageData?.userId,
            documentName: matchingImageData?.documentName,
            documentPath: matchingImageData?.documentPath,
            fileSize: matchingImageData?.fileSize,
          },
        };
      } else {
        return department;
      }
    });

    return {
      ...departments,
      rows: dataWithImage,
    };

    // return departments;
  } catch (error) {
    throw new Error(error);
  }
};

const getServiceListDepartmentwise = async (departmentId, searchQuery) => {
  try {
    // Define where clause for department query
    let whereClause = { isDeleted: "0" };
    if (departmentId) {
      whereClause.id = departmentId;
    }

    // Define where clause for services search
    let serviceWhereClause = {
      currentVersion: {
        [Sequelize.Op.eq]: Sequelize.literal(
          `(SELECT MAX(s.currentVersion) FROM services AS s WHERE s.slug = services.slug AND s.departmentId = services.departmentId)`
        ),
      },
    };

    // Apply search query on serviceName if searchQuery is provided
    if (searchQuery) {
      serviceWhereClause.serviceName = {
        [Sequelize.Op.like]: `%${searchQuery}%`,
      };
    }

    // Fetch all departments with their services
    const departments = await departmentsModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: serviceModel,
          as: "services",
          attributes: [
            "serviceName",
            "slug",
            "id",
            "currentVersion",
            "departmentId",
          ],
          required: true, // Set to true to include only departments with services
          where: serviceWhereClause,
        },
      ],
    });

    // Fetch document logos
    const documentLogoIds = departments?.rows?.map(
      (department) => department?.logo
    );
    let documentList;
    try {
      const documentResponse = await axios.post(
        `${process.env.DOCUMENTSERVICE}view`,
        { data: { documentId: documentLogoIds } }
      );

      documentList = documentResponse?.data?.data?.rows;
    } catch (error) {
      console.log(error);
    }

    // Transform the data and return departments with their services
    const result = departments.rows.map((department) => {
      const logoDocument = documentList?.find(
        (doc) => doc.id === department.logo
      );

      return {
        id: department.id,
        departmentName: department.departmentName,
        logo: logoDocument?.documentPath || null, // Attach logo (or null if not found)
        services:
          department.services.map((service) => ({
            serviceName: service.serviceName,
            slug: service.slug,
            version: service.currentVersion,
            id: service.id,
          })) || [], // Ensure services is an empty array if no services
      };
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};



module.exports = {
  createDepartment,
  departmentFindByName,
  deleteDepartmentById,
  updateDepartementById,
  getDepartmentList,
  getDeptKeywordList,
  departmentAllList,
  getDepartmentDataById,
  getServiceListDepartmentwise,
};
