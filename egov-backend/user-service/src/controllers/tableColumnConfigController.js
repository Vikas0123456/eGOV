const { createtableConfigService, getTableConfigService } = require("../services/tableColumnConfig.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createtableConfig = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { userId, tableName } = reqBody;

        if (!userId) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: MESSAGES.TABLE_COLUMN_CONFIG.USER_ID_NOT_FOUND,
                    success: false,
                    data: {},
                });
        }
        if (!tableName) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.TABLE_COLUMN_CONFIG.TABLE_NAME_NOT_FOUND,
                success: false,
                data: {},
            });
        }
        if (!userId && !tableName) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.TABLE_COLUMN_CONFIG.TABLE_USER_NOT_FOUND,
                success: false,
                data: {},
            });
        }
        let createtableConfig = await createtableConfigService(reqBody);

        if (createtableConfig) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TABLE_COLUMN_CONFIG.ADDED_SUCCESS,
                success: true,
                data: createtableConfig,
            });
        } 
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const gettableConfig = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { userId } = reqBody;

        if (!userId) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: MESSAGES.TABLE_COLUMN_CONFIG.USER_ID_NOT_FOUND,
                    success: false,
                    data: {},
                });
        }
        let gettableConfig = await getTableConfigService(reqBody);

        if (gettableConfig) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.TABLE_COLUMN_CONFIG.FETCH_SUCCESS,
                success: true,
                data: gettableConfig,
            });
        } 
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};
module.exports = {
    createtableConfig,
    gettableConfig
};
