const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
const {
    createAnnouncement,
    deleteAnnouncementById,
    updateAnnouncementById,
    getAnnouncementList,
} = require("../services/announcements.service");
const { usersModel } = require("../models");
const moment = require("moment");

const getAnnouncement = async (req, res) => {
    try {
        const { page, perPage, isCoreteam } = req.body.data;

        let userId = req.headers.jwtPayload.userId;

        let announcementData = await getAnnouncementList(
            page,
            perPage,
            userId,
            isCoreteam
        );

        if (announcementData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_FETCH,
                success: true,
                data: { ...announcementData },
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

const createNewAnnouncement = async (req, res) => {
    try {
        const {
            title,
            isCoreTeam,
            departmentId,
            displayFrom,
            displayTo,
            userId,
            tag,
            announcementDate,
        } = req.body.data;

        const reqBody = {
            title,
            isCoreTeam,
            tag,
            departmentId:
                departmentId != "[]" && isCoreTeam != 0 ? departmentId : null,
            displayFrom:
                displayFrom == null || displayFrom == ""
                    ? null
                    : moment(displayFrom).format("YYYY-MM-DD HH:mm:ss"),
            displayTo:
                displayTo == null || displayTo == ""
                    ? null
                    : moment(displayTo).format("YYYY-MM-DD HH:mm:ss"),
            announcementDate:
                announcementDate == null || announcementDate == ""
                    ? null
                    : moment(announcementDate).format("YYYY-MM-DD HH:mm:ss"),
            createdBy: parseInt(userId),
        };

        if (!title) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.ANNOUNCEMENT.TITLE_NOT_ENTER,
                success: false,
                data: {},
            });
        }

        if (isCoreTeam != 0 && !departmentId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.ANNOUNCEMENT.DEPARTMENT_NOT_ENTER,
                success: false,
                data: {},
            });
        }

        let newAnnouncement = await createAnnouncement(reqBody, req);

        if (newAnnouncement) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_ADDED,
                success: true,
                data: newAnnouncement,
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

const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.body.data;
        if (announcementId) {
            const result = await deleteAnnouncementById(announcementId, req);
            if (!result) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({
                    message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_DELETE_FAILED,
                    success: false,
                    data: {},
                });
            } else {
                return res.status(STATUS_CODES.SUCCESS).json({
                    message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_DELETE,
                    success: true,
                    data: {},
                });
            }
        } else {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_ID_NOT_FOUND,
                success: false,
                data: {},
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

const updateAnnouncement = async (req, res) => {
    try {
        const {
            title,
            isCoreTeam,
            departmentId,
            displayFrom,
            displayTo,
            announcementDate,
            userId,
            id,
            tag,
        } = req.body.data;

        const reqBody = {
            title,
            isCoreTeam,
            tag,
            departmentId:
                departmentId != "[]" && isCoreTeam != 0 ? departmentId : null,
            displayFrom:
                displayFrom == null || displayFrom == ""
                    ? null
                    : moment(displayFrom).format("YYYY-MM-DD HH:mm:ss"),
            displayTo:
                displayTo == null || displayTo == ""
                    ? null
                    : moment(displayTo).format("YYYY-MM-DD HH:mm:ss"),
            announcementDate:
                announcementDate == null || announcementDate == ""
                    ? null
                    : moment(announcementDate).format("YYYY-MM-DD HH:mm:ss"),
            updatedBy: parseInt(userId),
        };

        if (id) {
            let updatedAnnouncement = await updateAnnouncementById(id, reqBody, req);
            if (updatedAnnouncement) {
                return res.status(STATUS_CODES.SUCCESS).json({
                    message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_UPDATE,
                    success: true,
                    data: updatedAnnouncement,
                });
            } else {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_UPDATE_FAILED,
                    success: false,
                    data: {},
                });
            }
        } else {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_ID_NOT_FOUND,
                success: false,
                data: {},
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message:
                error.message ===
                "SequelizeUniqueConstraintError: Validation error"
                    ? MESSAGES.ANNOUNCEMENT.ANNOUNCEMENT_EXIST
                    : error.message,
            success: false,
            data: {},
        });
    }
};

module.exports = {
    createNewAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncement,
};
