const { sequelize } = require("../config/db.connection");
const { addressModel, customerModel } = require("../models");
const { Op } = require("sequelize");

const findCustomerById = async (customerId) => {
  try {
    const customer = await customerModel.findOne({
      where: {
        id: customerId,
      },
    });
    return customer;
  } catch (error) {
    throw new Error(error);
  }
};

const createAddressService = async (requestBody) => {
  try {
    const address = await addressModel.create(requestBody);
    return address;
  } catch (error) {
    throw new Error(error);
  }
};

const updateAddressById = async (addressId, updatedData) => {
  try {
    let address;
    [address] = await addressModel.update(updatedData, {
      where: {
        id: addressId,
      },
    });
    if (address) {
      address = await addressModel.findOne({
        where: {
          id: addressId,
        },
      });
    }
    return address;
  } catch (error) {
    throw new Error(error);
  }
};

const getAddressList = async (id, page, perPage, sortOrder, orderBy) => {
  try {
    if (id) {
      return await addressModel.findAndCountAll({
        where: {
          id: id,
        },
      });
    } else {
      const result = await addressModel.findAndCountAll({});
      return result;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createAddressService,
  findCustomerById,
  updateAddressById,
  getAddressList,
};
