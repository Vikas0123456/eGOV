const {generalsettingModal} = require("../models");
const {createSettingService,getSettingService,updateSettingService,getSettingServiceById} = require("../services/generalsetting.service");
const { MESSAGES, STATUS_CODES } = require("../utils/response/constants");

const createSettingController = async(req,res)=>{
    try{
        const { settingKey,settingValue,settingKeyName,description } = req.body.data.data;
        let setting = await createSettingService(settingKey,settingKeyName,settingValue,description,req);
    
        if(setting){
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.GENERAL_SETTING.CREATE_SUCCESS,
                success: true,
                data: setting,
        })
        }
        else{
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
                success: false,
                data: {},
              });
        }
    }
    catch(error){
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
          });
    }
}   

const getSettingsController = async(req,res) => {
    try{
        

        let setting = await getSettingService(req.body.data, req);
        if(setting){
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.GENERAL_SETTING.FETCH_SUCCESS,
                success: true,
                data: setting,
        })
        }
        else{
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
                success: false,
                data: {},
              });
        }
    }
    catch(error){
        console.log(error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
          });
            
         
    }
}

const updateSettingsController = async (req, res) => {
    try {
        const { id, settingValue,description,departmentId } = req.body.data.data;
        if (!id) {
            console.log('ID is missing in the data object');
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: 'ID is required',
                success: false,
                data: {},
            });
        }

        const setting = await updateSettingService(id, settingValue,description,departmentId,req);
        return res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.GENERAL_SETTING.UPDATE_SUCCESS,
            success: true,
            data: setting,
        });
    } catch (error) {
        console.log('Error in updateSettingsController:', error);
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: error.message,
            success: false,
            data: {},
        });
    }
};

const getSettingsByIdController = async(req,res)=>{
    try {
        const { id } = req.body.data;
        let setting = await getSettingServiceById(id);
        if(setting){
            return res.status(STATUS_CODES.SUCCESS).json({
                message: MESSAGES.GENERAL_SETTING.FETCH_SUCCESS,
                success: true,
                data: setting,
        })
        }
        else{
            return res.status(STATUS_CODES.SERVER_ERROR).json({
                message: error.message,
                success: false,
                data: {},
              });
        }
    }
    catch(error){
        return res.status(STATUS_CODES.SERVER_ERROR).json({
            message: MESSAGES.SERVER_ERROR,
            success: false,
            data: {},
          });
    }
}
module.exports = {
    createSettingController,
    getSettingsController,
    updateSettingsController,
    getSettingsByIdController
}