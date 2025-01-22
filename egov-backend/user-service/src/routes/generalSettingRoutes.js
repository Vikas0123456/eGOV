const express = require('express');
const route = express.Router();
const { createSettingController,getSettingsController,updateSettingsController,getSettingsByIdController} = require('../controllers/generalSettingController');

route.post('/create',createSettingController);
route.post('/get', getSettingsController);
route.put('/update',updateSettingsController);
route.post('/getsettingsbyid',getSettingsByIdController);

module.exports = route;