const { emailtemplatesModel } = require("../models");
const {
    getSystemSupportTypeList,
    generateSupport,
} = require("../services/systemSupport.service");
const { systemSupportMail } = require("../utils/mail/feedbackMail");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const getSystemSupportTypes = async (req, res) => {
    try {
        let supportTypeData = await getSystemSupportTypeList();
        if (supportTypeData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SUPPORT_TYPE.FETCH_SUCCESS,
                success: true,
                data: { ...supportTypeData },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SUPPORT_TYPE.FETCH_FAILED,
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

const createSupport = async (req, res) => {
    try {
        const requestBody = req.body.data;
        const newSystemSupport = await generateSupport(requestBody);
        if (newSystemSupport) {
            const getTemplate = await emailtemplatesModel.findOne({
                where: {
                    slug: "systemsupport",
                },
            });

            let htmlTemplate = getTemplate.content
                .replace(/@@ADMINNAME@@/g, requestBody.name)
                .replace(/@@ADMINEMAIL@@/g, requestBody.email)
                .replace(/@@DESCRIPTION@@/g, requestBody.description)
                .replace(/@@SITELINK@@/g, requestBody.link);

            // await systemSupportMail("v1.netclues@gmail.com", htmlTemplate);
            // await systemSupportMail(requestBody?.email, htmlTemplate);

            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SYSTEM_SUPPORT.ADDED_SUCCESS,
                success: true,
                data: newSystemSupport,
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
    getSystemSupportTypes,
    createSupport,
};
