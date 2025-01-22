const { sequelize } = require("../config/db.connection");
const { countriesModel, statesModel } = require("../models");
const { Op } = require("sequelize");

const getCountryList = async () => {
  try {
      return await countriesModel.findAndCountAll({});
  } catch (error) {
    throw new Error(error);
  }
};

const getStateList = async (countryId) => {
  try {
    if (countryId) {
      return await statesModel.findAndCountAll({
        where: {
          country_id: countryId
        }
      });
    } else {
      return await statesModel.findAndCountAll({});
    }
  } catch (error) {
    throw new Error(error);
  }
};


module.exports = {
  getCountryList,
  getStateList,
};
