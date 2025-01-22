const { supportModel } = require("../models");
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const crypto = require("crypto");
const { extractDataFromRequest, generateAuditLog } = require("./auditLog.service");

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

const createNewSupport = async (requestBody, req) => {
  try {
    let createdSupport = await supportModel.create(requestBody);
    const { ipAddress } = extractDataFromRequest(req);
    try {
      await generateAuditLog(
        "-",
        "Create",
        "Support",
        requestBody,
        "N/A",
        "1",
        null,
        requestBody.customerId,
        ipAddress
      );
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
    return createdSupport;
  } catch (error) {
    throw new Error(error);
  }
};

const getSupportList = async (
  id,
  page,
  perPage,
  searchFilter,
  sortOrder,
  orderBy = "id"
) => {
  try {
    if (id) {
      return await supportModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const actualPage = (page && parseInt(page, 10)) || 1;
      const actualPerPage = (perPage && parseInt(perPage, 10)) || 25;
      const offset = (actualPage - 1) * actualPerPage;

      let whereClause = {};

      let department;
      try {
          const documentResponse = await axios.post(
              `${process.env.SERVICE_MANAGEMENT_URL}/department/list`,
          );
          department = documentResponse?.data?.data?.rows;
  
      } catch (error) {
          console.log(error);
      }


      if (searchFilter) {
        whereClause[Op.or] = [
          {
            name: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
          {
            message: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${searchFilter}%`,
            },
          },
        ];
      }

      let order = [[orderBy, sortOrder === "asc" ? "ASC" : "DESC"]];
      const result = await supportModel.findAndCountAll({
        where: whereClause,
        limit: actualPerPage,
        offset: offset,
        order: order,
        raw: true,
      });

      const newResponseData = result.rows.map((support, idx) => {
        let findDocumentData;
        findDocumentData = department.find(
          (department) => department.id == support?.departmentId
        );
        return {
          ...support,
          departmentData: {
            id: findDocumentData?.id,
            departmentName: findDocumentData?.departmentName,
          },
        };
      });

      return { count: result.count, rows: newResponseData };
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createNewSupport,
  getSupportList,
};
