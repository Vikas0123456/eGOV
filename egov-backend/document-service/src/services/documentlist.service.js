const documentListModel = require("../models/documentList");
const { Op } = require("sequelize");
const { STATUS_CODES } = require("../utils/response/constants");

const createDocumentListService = async (
    documentName,
    slug,
    isRequired,
    canApply
) => {
    try {
        const filesType = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "application/pdf",
        ];

        const existingDocument = await documentListModel.findOne({
            where: { slug },
        });

        if (existingDocument) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Slug already exists",
                success: false,
                data: {},
            });
        }

        const data = {
            documentName,
            slug,
            documentFileType: JSON.stringify(filesType),
            isRequired,
            canApply,
        };

        const response = await documentListModel.create(data);

        if (response) {
            return response;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const getDocumentListService = async (page, perPage, searchFilter) => {
    try {
        const actualPage = page && parseInt(page) || 1;
        const actualPerPage = perPage && parseInt(perPage);
        const offset = (actualPage - 1) * actualPerPage;

        const whereClause = {};

        if (searchFilter) {
            whereClause[Op.or] = [
                {
                    documentName: {
                        [Op.like]: `%${searchFilter}%`,
                    },
                },
            ];
        }

        const documentList = await documentListModel.findAndCountAll({
            where: whereClause,
            limit: perPage ? actualPerPage : null,
            offset: perPage ? offset : null,
            raw: true,
        });

        if (documentList) {
            return documentList;
        }
    } catch (error) {
        throw new Error(error);
    }
};

const updateDocumentListService = async (documentListId, updateData) => {
    try {
        const findDocumentList = await documentListModel.findOne({
            where: { id: documentListId },
        });

        if (!findDocumentList) {
            throw new Error("Document List not found");
        }

        const existingDocument = await documentListModel.findOne({
            where: {
                slug: updateData.slug,
                id: { [Op.ne]: documentListId },
            },
        });

        if (existingDocument) {
            throw new Error("Slug already exists in another document");
        }

        const documentList = await documentListModel.update(updateData, {
            where: { id: documentListId },
        });

        return documentList;
    } catch (error) {
        throw new Error(error.message);
    }
};

const deleteDocumentListService = async (documentListId) => {
    try {
        const documentList = await documentListModel.destroy({
            where: { id: documentListId },
        });

        if (documentList) {
            return documentList;
        }
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    createDocumentListService,
    getDocumentListService,
    updateDocumentListService,
    deleteDocumentListService,
};
