const { createSequelizeInstance, allModelAndAssociate } = require("../config/config");
const axios = require("axios");
const crypto = require("crypto");

let applicationSlug;

const decrypt = (encryptedData) => {
  if (process.env.DECEYPTION === "true") {
    const decipher = crypto.createDecipheriv(
      process.env.CIPHERALGORITHM,
      process.env.CIPHERSKEY,
      process.env.CIPHERVIKEY
    );
    let decryptedData = decipher.update(encryptedData.data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return { data: JSON.parse(decryptedData) };
  }

  return encryptedData;
};

const findSlug = async (req, res, next) => {
  try {
    const { eData } = req.body;
    const decryptData = await decrypt(eData);
    applicationSlug = decryptData?.data?.applicationData[0]?.serviceSlug;
    next();
  } catch (error) {
    console.log("Error While finding slug", error);
    next(error);
  }
};

const dbConnectionForBookAndMeet = async (req, res, next) => {
  try {
    const getService = await axios.post(
      `${process.env.SERVICEMANAGEMENT}/service/getById`,
      {
        data: {
          slug: applicationSlug,
        },
      }
    );

    if (getService.data) {
      await createSequelizeInstance(
        getService.data.data.databaseName
      ).then(async (res) => {
        req.service = getService.data.data;
        req.sequelize = res;
        await allModelAndAssociate(req);
      });
      next();
    } else {
      return res.status(404).json({
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong! Please try again later.",
    });
  }
};

module.exports = { findSlug, dbConnectionForBookAndMeet };

