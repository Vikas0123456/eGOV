const { createAddressService, findCustomerById, updateAddressById, getAddressList } = require("../services/address.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createAddress = async (req, res) => {
  try {
    const reqBody = req.body.data;
    const { customerId } = reqBody;

    if (!customerId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ADDRESS.ADDRESS_CUSTIOMER_NOT_ENTER,
        success: false,
        data: {},
      });
    }

    if (customerId) {
      const customer = await findCustomerById(customerId);
      if (!customer) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.ADDRESS.ADDRESS_CUSTIOMER_ID_NOT_FOUND,
          success: false,
          data: {},
        });
      }
    }

    let newAddress = await createAddressService(reqBody);

    if (newAddress) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ADDRESS.ADDRESS_ADDED,
        success: true,
        data: newAddress,
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
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

const updateAddress = async (req, res) => {
  try {
    const { id } = req.body.data;
    const reqBody = req.body.data;

    if (id) {
      let updateAdd = await updateAddressById(id, reqBody);
      if (updateAdd) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.ADDRESS.ADDRESS_UPDATE,
          success: true,
          data: updateAdd,
        });
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.ADDRESS.ADDRESS_UPDATE_FAILED,
          success: false,
          data: {},
        });
      }
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ADDRESS.ADDRESS_ID_NOT_FOUND,
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

const getAddress = async (req, res) => {
  try {
    const { id, page, perPage, sortOrder, orderBy } = req.body.data;
    let addressData = await getAddressList(
      id,
      page,
      perPage,
      sortOrder,
      orderBy
    );
    if (addressData) {
      return res.status(STATUS_CODES.SUCCESS).json({
        message: MESSAGES.ADDRESS.ADDRESS_FETCH,
        success: true,
        data: { ...addressData },
      });
    } else {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.ADDRESS.ADDRESS_FETCH_FAILED,
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
    createAddress,
    updateAddress,
    getAddress,
};
