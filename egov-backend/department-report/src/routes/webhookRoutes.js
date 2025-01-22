const express = require("express");
const route = express.Router();
const fs = require("fs");
const path = require("path");
const cacheQueue = require('../services/queue')

// const CACHE_DIR = path.join(__dirname, "../cache");
// const DEPARTMENT_CACHE_FILE = path.join(CACHE_DIR, "departmentList.json");

const {fetchDepartmentData,fetchServiceData,fetchDocumentData, fetchUserData} = require('../services/cacheUtility');

route.post('/webhook',async (req, res) => {
    const { changedEntity } = req.body;
    try {
        // if (fs.existsSync(DEPARTMENT_CACHE_FILE)) {
        //     fs.unlinkSync(DEPARTMENT_CACHE_FILE);
        //     console.log("Cache invalidated: departmentList.json deleted");
        // }
        // res.status(200).json({ message: 'Cache invalidated' });
        if (changedEntity === 'department') {
            // cacheQueue.enqueue(async () => await fetchDepartmentData(true)); 
            await fetchDepartmentData(true)
        } else if (changedEntity === 'service') {
            // cacheQueue.enqueue(async () => await fetchServiceData(true));
            await fetchServiceData(true)
        }
        else if (changedEntity === 'user') {
            // cacheQueue.enqueue(async () => await fetchUserData(true));
            await fetchUserData(true)
        }
        res.status(200).json({ message: 'Cache recreated successfully' });
    } catch (error) {
        console.error('Error invalidating cache:', error);
        res.status(500).json({ message: 'Error invalidating cache' });
    }
    
});

module.exports = route;
