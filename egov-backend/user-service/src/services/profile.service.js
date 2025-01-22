const { Op } = require("sequelize");
const { sequelize } = require("../config/db.connection");
const { default: axios } = require("axios");
const {
    customerModel,
    addressModel,
    statesModel,
    countriesModel,
} = require("../models");
const {
    extractDataFromRequest,
    generateAuditLog,
} = require("./auditLog.service");

/**
 * Fetches the customer profile data including personal details, addresses, and associated documents.
 * Supports filtering by search terms and pagination.
 *
 * @param {number} customerId - The ID of the customer to fetch profiles for.
 * @param {number} [page=1] - The current page for pagination.
 * @param {number} [perPage=null] - Number of records per page.
 * @param {string} [searchFilter] - A string to filter the results based on customer information like name, NIB number, etc.
 * @param {string} [keyword] - An optional keyword for additional filtering.
 * @returns {Object} - Paginated list of customer profiles with related data (addresses, country names, and documents).
 * @throws {Error} - Throws an error if customer profile retrieval fails.
 */
const getCustomerProfile = async (customerId, page, perPage, searchFilter, keyword) => {
    try {
        let customerProfileList;
        let where = {};

        // Apply search filters based on the searchFilter string (NIB, name, email, etc.)
        if (searchFilter) {
            const nameParts = searchFilter.split(' ').map(part => `%${part}%`);
            where[Op.or] = [
                { nibNumber: { [Op.like]: `%${searchFilter}%` } },
                { email: { [Op.like]: `%${searchFilter}%` } },
                { mobileNumber: { [Op.like]: `%${searchFilter}%` } },
                { firstName: { [Op.like]: `%${searchFilter}%` } },
                { lastName: { [Op.like]: `%${searchFilter}%` } },
                {
                    // Split search term to match both first and last name if multiple words are provided
                    [Op.and]: [
                        nameParts[0] ? { firstName: { [Op.like]: nameParts[0] } } : null,
                        nameParts[1] ? { lastName: { [Op.like]: nameParts[1] } } : null,
                    ].filter(Boolean),
                },
            ];
        }

        // Apply additional filtering by keyword, if provided
        if (keyword) {
            where[Op.or] = [
                ...(where[Op.or] || []),  // Merge existing filters
                { keyword: { [Op.like]: `%${keyword}%` } },
            ];
        }

        // Fetch results based on the primary customerId
        const resultsById = await customerModel.findAndCountAll({
            raw: true,
            where: {
                [Op.and]: [
                    { id: customerId },  // Match exact customerId
                    where,               // Apply search and keyword filters
                ],
            },
        });

        // Fetch results based on linkToCustomerId (linked customer profiles)
        const resultsByLinkToCustomerId = await customerModel.findAndCountAll({
            raw: true,
            where: {
                [Op.and]: [
                    { linkToCustomerId: customerId },  // Match linked customerId
                    where,                             // Apply search and keyword filters
                ],
            },
        });

        // Calculate total count and merge both result sets
        const totalCount = resultsById.count + resultsByLinkToCustomerId.count;
        const mergedResults = [
            ...resultsById.rows,
            ...resultsByLinkToCustomerId.rows,
        ];

        // Handle pagination
        const actualPage = (page && parseInt(page, 10)) || 1;
        const actualPerPage = (perPage && parseInt(perPage, 10)) || null;
        const offset = (actualPage - 1) * actualPerPage;
        const paginatedResults = actualPerPage
            ? mergedResults.slice(offset, offset + actualPerPage)
            : mergedResults;

        // Add country details (birth, citizenship) for each customer in the result set
        for (const profileresult of paginatedResults) {
            const birthcountryName = await countriesModel.findOne({
                where: { id: profileresult?.countryOfBirth },
            });
            const citizenshipcountryName = await countriesModel.findOne({
                where: { id: profileresult?.countryOfCitizenship },
            });

            // Update result object with detailed country information
            profileresult.countryOfBirth = {
                id: birthcountryName?.id,
                name: birthcountryName?.name,
            };
            profileresult.countryOfCitizenship = {
                id: citizenshipcountryName?.id,
                name: citizenshipcountryName?.name,
            };
        }

        // Add home and mailing address details for each customer
        for (const result of paginatedResults) {
            if (result.homeAddressId) {
                const address = await addressModel.findOne({
                    where: { id: result?.homeAddressId },
                });
                if(address && address?.countryId){
                const countryName = await countriesModel.findOne({
                    where: { id: address?.countryId },
                });
                const stateName = await statesModel.findOne({
                    where: { id: address?.state },
                });

                // Populate homeAddressId with detailed address and location information
                result.homeAddressId = {
                    ...address.dataValues,
                    countryName: countryName?.dataValues?.name,
                    stateName: stateName?.dataValues?.name,
                };
               }

                // Populate mailing address if it exists
                if (result?.mailingAddressId) {
                    const mailingAddress = await addressModel.findOne({
                        where: { id: result?.mailingAddressId },
                    });
                    if(mailingAddress && mailingAddress?.countryId){
                        const mailingCountryName = await countriesModel.findOne({
                            where: { id: mailingAddress?.countryId },
                        });
                        const mailingStateName = await statesModel.findOne({
                            where: { id: mailingAddress?.state },
                        });
    
                        result.mailingAddressId = {
                            ...mailingAddress?.dataValues,
                            countryName: mailingCountryName?.dataValues?.name,
                            stateName: mailingStateName?.dataValues?.name,
                        };
                    }
                }
            }
        }

        // Assign customer profile list with count and paginated data
        customerProfileList = { count: totalCount, rows: paginatedResults };

        let imageData = [];
        try {
            // Fetch document images associated with customer profiles
            const documentResponse = await axios.post(
                `${process.env.DOCUMENT_URL}document/list/upload`,
                { data: {} }
            );
            imageData = documentResponse?.data?.data?.rows || [];
        } catch (error) {
            console.error("Document API call failed", error);
        }

        // Merge image data into customer profile list
        const usersWithImages = customerProfileList?.rows?.map((user) => {
            const matchingImageData = imageData?.find(
                (image) => image.id === user.nibImageId
            );

            return matchingImageData
                ? {
                    ...user,
                    imageData: {
                        id: matchingImageData?.id,
                        customerId: matchingImageData?.customerId,
                        documentName: matchingImageData?.documentName,
                        documentPath: matchingImageData?.documentPath,
                        fileSize: matchingImageData?.fileSize,
                    },
                }
                : user;
        });

        return {
            ...customerProfileList,
            rows: usersWithImages,
        };
    } catch (error) {
        // Throw error if the process fails
        throw new Error(`Error finding customer: ${error.message}`);
    }
};


const createCustomerProfileService = async (requestBody, req) => {
    let transaction;
    let customer;
    try {
        // Start a transaction to ensure data consistency
        transaction = await sequelize.transaction();

        // Create the customer
        customer = await customerModel.create(requestBody, { transaction });

        // Check if customer creation was successful
        if (!customer) {
            throw new Error("Failed to create customer profile");
        }

        // Create the home address
        const homeAddress = await addressModel.create(
            {
                ...requestBody?.homeAddress,
                customerId: customer?.id,
            },
            { transaction }
        );

        // Check if home address creation was successful
        if (!homeAddress) {
            throw new Error("Failed to create home address");
        }

        const findParentUserDataInfo = await customerModel.findOne({
            where: {
                id: requestBody?.linkToCustomerId,
            },
        });
        if (findParentUserDataInfo) {
            const updatedCustomer = await customerModel.update(
                {
                    homeAddressId: homeAddress?.id,
                    // isResident: findParentUserDataInfo?.dataValues?.isResident,
                },
                {
                    where: { id: customer?.id },
                    transaction,
                }
            );

            // Check if customer record update was successful
            if (!updatedCustomer) {
                throw new Error(
                    "Failed to update customer record with address IDs"
                );
            }
            // Add homeAddressId and mailingAddressId to the customer object
            customer.homeAddressId = homeAddress?.id;

            // Commit the transaction
            await transaction.commit();

            try {
                const { ipAddress } = extractDataFromRequest(req);
                await generateAuditLog(
                    customer?.id,
                    "Create",
                    "Profile",
                    requestBody,
                    "N/A",
                    "1",
                    null,
                    customer?.id,
                    ipAddress
                );
            } catch (error) {
                console.error("Error generating audit log:", error);
            }

            return customer;
        }
    } catch (error) {
        throw new Error(
            `Error white creating customer profile: ${error.message}`
        );
    }
};

const updateCustomerProfileByIdService = async (
    customerId,
    requestBody,
    req
) => {
    try {
        const { email, nibNumber, ...updatedFields } = requestBody;

        const currentRecord = await customerModel.findOne({
            where: {
                id: customerId,
            },
        });

        if (!currentRecord) {
            return { success: false, message: "Profile record not found" };
        }

        // Start a transaction to ensure data consistency
        const updateResult = await customerModel.update(requestBody, {
            where: {
                id: customerId,
                isDeleted: "0",
            },
        });
        // Check if customer creation was successful
        if (!updateResult) {
            throw new Error("Failed to update customer profile");
        }
        const updatedCustomerInstance = await customerModel.findOne({
            where: { id: customerId },
        });

        // update the home address
        const homeAddressId = requestBody?.homeAddress?.id;
        const updatedAddress = await addressModel.update(
            { ...requestBody.homeAddress },
            { where: { id: homeAddressId } }
        );

        if (!updatedAddress) {
            throw new Error("Failed to create home address");
        }
        // If you want to fetch the updated address after updating
        const updatedAddressInstance = await addressModel.findOne({
            where: { id: homeAddressId },
        });

        try {
            const { ipAddress } = extractDataFromRequest(req);
            await generateAuditLog(
                requestBody.id,
                "Update",
                "Profile",
                requestBody,
                currentRecord.dataValues,
                "1",
                null,
                customerId,
                ipAddress
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return {
            ...updatedCustomerInstance?.dataValues,
            homeAdressId: updatedAddressInstance,
        };
    } catch (error) {
        throw new Error(
            `Error while updating customer profile: ${error.message}`
        );
    }
};

module.exports = {
    getCustomerProfile,
    createCustomerProfileService,
    updateCustomerProfileByIdService,
};
