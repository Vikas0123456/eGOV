const {
    createDocumentListService,
    getDocumentListService,
    updateDocumentListService,
    deleteDocumentListService,
} = require("../services/documentlist.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createDocumentList = async (req, res) => {
    try {
        const { documentName, slug, isRequired, canApply } = req.body.data;

        const response = await createDocumentListService(
            documentName,
            slug,
            isRequired,
            canApply
        );
        if (response) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENT_LIST.ADDED_SUCCESS,
                success: true,
                data: { response },
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

const getDocumentLists = async (req, res) => {
    try {
        const { page, perPage, searchFilter } = req.body?.data;
        const response = await getDocumentListService(page, perPage, searchFilter);
        if (response) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENT_LIST.ADDED_SUCCESS,
                success: true,
                data: response,
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

const updateDocumentList = async (req, res) => {
    try {
        const { documentListId, documentName, slug, isRequired, canApply } =
            req.body.data;

        const updateData = {
            documentName,
            slug,
            isRequired,
            canApply,
        };

        const response = await updateDocumentListService(
            documentListId,
            updateData
        );

        if (response) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENT_LIST.UPDATE_SUCCESS,
                success: true,
                data: { response },
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

const deleteDocumentList = async (req, res) => {
    try {
        const { documentListId } = req.body.data;

        const response = await deleteDocumentListService(documentListId);
        if (response) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.DOCUMENT_LIST.DELETE_SUCCESS,
                success: true,
                data: { response },
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
    createDocumentList,
    getDocumentLists,
    updateDocumentList,
    deleteDocumentList,
};
