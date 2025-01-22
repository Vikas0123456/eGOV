const { getCountryList, getStateList } = require("../services/countries.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getCountries = async (req, res) => {
  try {
    let countriesData = await getCountryList();

    if (countriesData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.COUNTRIES.COUNTRIES_FETCH,
        success: true,
        data: { ...countriesData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.COUNTRIES.COUNTRIES_FETCH_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};

const getStates = async (req, res) => {
  try {
    const {countryId} = req.body.data;
    let statesData = await getStateList(countryId);

    if (statesData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.STATES.STATES_FETCH,
        success: true,
        data: { ...statesData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.STATES.STATES_FETCH_FAILED,
        success: false,
        data: {},
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.SERVER_ERROR,
      success: false,
      data: {},
    });
  }
};
module.exports = {
  getCountries,
  getStates,
};
