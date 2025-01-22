const {
    createDepartment,
    deleteDepartmentById,
    updateDepartementById,
    getDepartmentList,
    departmentFindByName,
    getDeptKeywordList,
    departmentAllList,
    getDepartmentDataById,
    getServiceListDepartmentwise
  } = require("../services/department.Service");
  const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");
  
  const createNewDepartment = async (req, res) => {
    try {
      const reqBody = req.body.data;
      const { departmentName } = reqBody;
  
      if (!departmentName) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.DEPARTMENT.NAME_NOT_ENTER,
          success: false,
          data: {},
        });
      }
      if (departmentName) {
        const dept = await departmentFindByName(departmentName);
        if (dept) {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.DEPARTMENT.DEPARTMENT_EXIST,
            success: false,
            data: {},
          });
        }
      }
  
      let newDepartment = await createDepartment(reqBody, req);
  
      if (newDepartment) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_ADDED,
          success: true,
          data: newDepartment,
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
  const deleteDepartment = async (req, res) => {
    try {
      const { id } = req.body.data;
      if (id) {
        const result = await deleteDepartmentById(id, req);
        if (!result) {
          return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.DEPARTMENT.DEPARTMENT_DELETE_FAILED,
            success: false,
            data: {},
          });
        } else {
          return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.DEPARTMENT.DEPARTMENT_DELETE,
            success: true,
            data: {},
          });
        }
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_ID_NOT_FOUND,
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
  const updateDepartment = async (req, res) => {
    try {
      const { id } = req.body.data;
      const reqBody = req.body.data;
  
      if (id) {
        let updateDepartment = await updateDepartementById(id, reqBody, req);
        if (updateDepartment) {
          return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.DEPARTMENT.DEPARTMENT_UPDATE,
            success: true,
            data: updateDepartment,
          });
        } else {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.DEPARTMENT.DEPARTMENT_UPDATE_FAILED,
            success: false,
            data: {},
          });
        }
      } else {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_ID_NOT_FOUND,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message:
          error.message === "SequelizeUniqueConstraintError: Validation error"
            ? MESSAGES.DEPARTMENT.DEPARTMENT_EXIST
            : error.message,
        success: false,
        data: {},
      });
    }
  };
  const getDepartment = async (req, res) => {
    try {
      const { id, page, perPage, searchFilter,keyword, sortOrder,orderBy } = req.body.data;
      let deptData = await getDepartmentList(
        id,
        page,
        perPage,
        searchFilter,
        keyword,
        sortOrder,
        orderBy
      );
      if (deptData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH,
          success: true,
          data: { ...deptData },
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH_FAILED,
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
  const getDepartmentKeyword = async (req, res) => {
    try {
      let deptkeyword = await getDeptKeywordList();
      if (deptkeyword) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.FETCH_KEYWORD,
          success: true,
          data: { ...deptkeyword },
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.DEPARTMENT.FETCH_FAILED_KEYWORD,
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
  const listDepartment = async (req, res) => {
    try {
      let deptData = await departmentAllList();
      if (deptData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH,
          success: true,
          data: { ...deptData },
        });
      } else {
        return res.status(STATUS_CODES.SERVER_ERROR).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH_FAILED,
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
  const getDepartmentById = async (req, res) => {
    try {
      const { departmentId } = req.body.data;
  
      if (!departmentId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_ID_NOT_FOUND,
          success: false,
          data: {},
        });
      }
  
      let departmentData = await getDepartmentDataById(departmentId);
  
      if (departmentData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH,
          success: true,
          data: departmentData,
        });
      } else {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH_FAILED,
          success: false,
          data: {},
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  };
  const getServiceDepartmentwise= async(req,res)=>{
    try {
      const { departmentId ,searchQuery } = req.body.data;

      let departmentData = await getServiceListDepartmentwise(departmentId,searchQuery);
  
      if (departmentData) {
        return res.status(STATUS_CODES.SUCCESS).json({
          message: MESSAGES.DEPARTMENT.DEPARTMENT_FETCH,
          success: true,
          data: departmentData,
        });
      } 
    } catch (error) {
      console.error(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({
        message: MESSAGES.SERVER_ERROR,
        success: false,
        data: {},
      });
    }
  }
  
  module.exports = {
    createNewDepartment,
    deleteDepartment,
    updateDepartment,
    getDepartment,
    getDepartmentKeyword,
    listDepartment,
    getDepartmentById,
    getServiceDepartmentwise
  };
  