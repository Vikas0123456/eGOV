const { default: axios } = require("axios");
const {generalsettingModal} = require('../models');
const { generateAuditLog, extractDataFromRequest } = require("./auditLog.service");

const createSettingService = async(settingKey,settingKeyName,settingValue,description,req)=>{
    try{
        const setting = await generalsettingModal.create({
            settingKey,
            settingKeyName,
            settingValue,
            description
          
        });

        const createdSetting = await generalsettingModal.findOne({
            where: {id: setting?.id}
        })

        const { userId, ipAddress } = extractDataFromRequest(req);

        try {
            await generateAuditLog(
                null,
                "Create",
                "Setting",
                "N/A",
                createdSetting.dataValues,
                "0",
                userId,
                null,
                ipAddress
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return setting;
    }
    catch(error){
        console.log(error)
        throw new Error(error.message);
    }
}

const getSettingService = async() =>{
    try{
        let setting = await generalsettingModal.findAll();
        return setting;
    }   
    catch(error){
        throw new Error(error.message);
    }
}

const getSettingServiceById = async(id)=>{
    try{
        let setting = await generalsettingModal.findByPk(id);
        return setting;
    }
    catch(error){
        throw new Error(error.message); 
    }
}

const updateSettingService = async (id, settingValue,description,departmentId,req) => {
    try {
        const existingSetting = await generalsettingModal.findOne({
            where: {
                id: id,
            },
        });

        if (!existingSetting) {
            throw new Error('Setting not found');
        }

        const result = await generalsettingModal.update(
            { settingValue,description },
            {
                where: { id: id },
            }
        );

        const { userId, ipAddress } = extractDataFromRequest(req);

        try {
            const oldValue = existingSetting ? existingSetting.get({ plain: true }) : null;
            await generateAuditLog(
                id,
                "Update",
                "Setting",
                settingValue,
                oldValue,
                "0",
                userId,
                null,
                ipAddress
            );
        } catch (error) {
            console.error("Error generating audit log:", error);
        }

        return result;

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports ={
    createSettingService,
    getSettingService,
    updateSettingService,
    getSettingServiceById
}