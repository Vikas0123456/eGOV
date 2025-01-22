const {
    createFormService,
    getFormService,
    updateFormService,
    deleteFormService,
    getById,
} = require("../services/formbuilder.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const fs = require("fs");

const createForm = async (req, res) => {
    try {
        const reqBody = req.body.data;

        const result = await createFormService(reqBody, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_ADDED,
                success: true,
                data: { ...result },
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

const getDataById = async (req, res) => {
    try {
        const { id } = req.body.data;
        const result = await getById(id);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_FETCH,
                success: true,
                data: result,
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

const getFormList = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const result = await getFormService(reqBody);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_FETCH,
                success: true,
                data: result,
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
const updateForm = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { formId } = reqBody;
        if (!formId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_ID_NOT_FOUND,
                success: false,
                data: {},
            });
        }

        const result = await updateFormService(reqBody, formId, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_ADDED,
                success: true,
                data: { ...result },
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
const deleteForm = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { formId } = reqBody;
        if (!formId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_ID_NOT_FOUND,
                success: false,
                data: {},
            });
        }

        const result = await deleteFormService(formId, req);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.FORMBUILDER.FORMBUILDER_DELETE,
                success: true,
                data: { ...result },
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
    createForm,
    getFormList,
    updateForm,
    deleteForm,
    getDataById,
};
