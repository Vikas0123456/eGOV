const {
    findServiceBySlug,
    createService,
    updateServiceById,
    getServiceList,
    serviceAllList,
    getApplicationServicelistForApi,
    getById,
    serviceAndDepartmentCount,
    getServiceByIds,
    getLatestUniqueSlugService,
} = require("../services/services.Service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createNewService = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { slug } = reqBody;

        if (slug) {
            const slugData = await findServiceBySlug(slug);
            if (slugData) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: MESSAGES.SERVICE.SERVICE_EXIST,
                    success: false,
                    data: {},
                });
            }
        }

        let newService = await createService(reqBody, req);

        if (newService) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_ADDED,
                success: true,
                data: newService,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: "Error in creating service, please try again after sometime",
                success: false,
                data: {},
            });
        }
    } catch (error) {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: "Error in creating service, please try again after sometime",
            success: false,
            data: {},
        });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.body.data;
        const reqBody = req.body.data;

        if (id) {
            let updateService = await updateServiceById(id, reqBody, req);
            if (updateService) {
                return res.status(STATUS_CODES.SUCCESS).json({
                    message: MESSAGES.SERVICE.SERVICE_UPDATE,
                    success: true,
                    data: updateService,
                });
            } else {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    message: MESSAGES.SERVICE.SERVICE_UPDATE_FAILED,
                    success: false,
                    data: {},
                });
            }
        } else {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.SERVICE.SERVICE_ID_NOT_FOUND,
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

const getService = async (req, res) => {
    try {
        const {
            id,
            page,
            perPage,
            searchFilter,
            departmentId,
            sortOrder,
            orderBy,
            slug,
        } = req.body.data;
        let serviceData = await getServiceList(
            id,
            page,
            perPage,
            searchFilter,
            departmentId,
            sortOrder,
            orderBy,
            slug
        );
        if (serviceData) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: { ...serviceData },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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

const listService = async (req, res) => {
    try {
        let result = await serviceAllList();
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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
const applicationServicelistForApi = async (req, res) => {
    try {
        const reqBody = req.body.data;
        const { departmentId } = reqBody;
        if (!departmentId) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: MESSAGES.SERVICE.SERVICE_DEPARTMENT_NOT_SELECTED,
                success: false,
                data: {},
            });
        }
        let result = await getApplicationServicelistForApi(departmentId);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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

const serviceDepartmentCountList = async (req, res) => {
    try {
        let result = await serviceAndDepartmentCount();
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: result,
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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

const getServiceById = async (req, res) => {
    try {
        const {slug} = req.body.data;
        const result = await getServiceByIds(slug);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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
}

const getLatestUniqueSlug = async (req, res) => {
    try {
        const {slug} = req.body.data;
        const result = await getLatestUniqueSlugService(slug);
        if (result) {
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH,
                success: true,
                data: { ...result },
            });
        } else {
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: MESSAGES.SERVICE.SERVICE_FETCH_FAILED,
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
}

module.exports = {
    createNewService,
    updateService,
    getService,
    listService,
    applicationServicelistForApi,
    serviceDepartmentCountList,
    getServiceById,
    getLatestUniqueSlug
};
