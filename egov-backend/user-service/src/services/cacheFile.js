const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "../cache");
const DEPARTMENT_CACHE_FILE = path.join(CACHE_DIR, "departmentList.json");
const SERVICE_CACHE_FILE = path.join(CACHE_DIR, "serviceList.json");
const DOCUMENT_CACHE_FILE = path.join(CACHE_DIR, "documentList.json");

const ensureCacheDirectoryExists = () => {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
};

const writeCacheFile = (cacheFile, data) => {
    fs.writeFile(cacheFile, JSON.stringify(data), (err) => {
        if (err) {
            console.error(`Error writing cache file ${cacheFile}:`, err);
        } else {
            console.log(`Cache created: ${cacheFile}`);
        }
    });
};

const fetchDataWithCaching = async (cacheFile, apiUrl,forceUpdate = false) => {
    try {

        ensureCacheDirectoryExists();
        // if (!fs.existsSync(CACHE_DIR)) {
        //     fs.mkdirSync(CACHE_DIR, { recursive: true });
        // }

        
        
        if (!forceUpdate && fs.existsSync(cacheFile)) {
            const fileData = fs.readFileSync(cacheFile, "utf-8");
            return JSON.parse(fileData);
        }

        // if (fs.existsSync(cacheFile)) {
        //     fs.unlinkSync(cacheFile);
        //     console.log(`Cache deleted: ${cacheFile}`);
            
        // }

        const response = await axios.post(apiUrl, { data: {} });
        const data = response.data?.data?.rows;
        // setTimeout(() => {
        //     fs.writeFileSync(cacheFile, JSON.stringify(data));
        //     console.log("created");
        // }, 5000)

        // setTimeout(() => {
        //     fs.writeFile(cacheFile, JSON.stringify(data), (err) => {
        //         if (err) {
        //             console.error(`Error writing cache file ${cacheFile}:`, err);
        //         } else {
        //             console.log(`Cache created: ${cacheFile}`);
        //         }
        //     });
        // }, 5000);
        
        if (forceUpdate) {
            // setTimeout(() => {
                    
            writeCacheFile(cacheFile, data);
        // }, 1000);
        } else {
           
            setTimeout(() => {
                writeCacheFile(cacheFile, data);
            }, 5000);
        }
        
        return data;
    } catch (error) {
        console.error(`Failed to fetch data from ${apiUrl}:`, error);
        throw new Error(`Unable to fetch data from ${apiUrl}.`);
    }
};

const fetchDepartmentData = (forceUpdate=false) => fetchDataWithCaching(DEPARTMENT_CACHE_FILE, `${process.env.SERVICE_MANAGEMENT_URL}/department/list`,forceUpdate);

const fetchServiceData = (forceUpdate = false) => fetchDataWithCaching(SERVICE_CACHE_FILE, `${process.env.SERVICE_MANAGEMENT_URL}/service/list`,forceUpdate);

const fetchDocumentData = (forceUpdate=false) => fetchDataWithCaching(DOCUMENT_CACHE_FILE, `${process.env.DOCUMENT_URL}document/list/upload`,forceUpdate)

module.exports = {
    fetchDepartmentData,
    fetchServiceData,
    fetchDocumentData
};

// const cacache = require('cacache');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// const CACHE_DIR = path.join(__dirname, '../cache');

// if (!fs.existsSync(CACHE_DIR)) {
//     fs.mkdirSync(CACHE_DIR, { recursive: true });
// }

// // const cacheFiles = {
// //     departmentList: 'departmentList.json',
// //     serviceList: 'serviceList.json',
// //     documentList: 'documentList.json',
// // };

// const generateCacheKey = (baseKey) => {
//     const uniqueSuffix = crypto.randomBytes(4).toString('hex');
//     return `${baseKey}-${uniqueSuffix}.json`;
// };

// const removeOldCacheEntries = async (baseKey, forceUpdate) => {
//     try {
//         const cacheEntries = await cacache.ls(CACHE_DIR);

//         for (const [key, value] of Object.entries(cacheEntries)) {
//             // Only remove entries that match the baseKey
//             if (forceUpdate && key.startsWith(baseKey)) {
//                 await cacache.rm.entry(CACHE_DIR, key, { removeFully: true });
//                 await cacache.rm.content(CACHE_DIR, value.integrity);
//                 console.log(`Removed old cache entry: ${key}`);

//                 // const cacheDirPath = path.dirname(path.join(CACHE_DIR, key));
//                 // try {
//                 //     fs.rmSync(cacheDirPath, { recursive: true });
//                 //     console.log(`Removed directory: ${cacheDirPath}`);
//                 // } catch (err) {
//                 //     console.error(`Failed to remove directory ${cacheDirPath}:`, err);
//                 // }
//             }
//         }
//     } catch (error) {
//         console.error(`Failed to remove old cache entries for ${baseKey}:`, error);
//     }
// };


// const fetchDataWithCaching = async (cacheKeyBase, apiUrl, forceUpdate = false) => {
//     try {
//         let cacheFile;

//         if (forceUpdate) {
//             console.log(`Force update for ${cacheKeyBase}. Removing old cache entries...`);
//             await removeOldCacheEntries(cacheKeyBase, forceUpdate);
//             cacheFile = generateCacheKey(cacheKeyBase);
//         } else {
//             const cacheEntries = await cacache.ls(CACHE_DIR);
//             const existingEntry = Object.keys(cacheEntries).find(key => key.startsWith(cacheKeyBase));

//             if (existingEntry) {
//                 console.log(`Cache hit for ${cacheKeyBase}`);
//                 const cachedData = await cacache.get(CACHE_DIR, existingEntry);
//                 return JSON.parse(cachedData.data.toString());
//             }
            
//             cacheFile = generateCacheKey(cacheKeyBase);
//         }
        
//         console.log(`Fetching data from API for ${cacheKeyBase}...`);
//         const response = await axios.post(apiUrl, { data: {} });
//         const data = response.data?.data?.rows;

//         if (data) {
//             await cacache.put(CACHE_DIR, cacheFile, JSON.stringify(data, null, 2));
//             console.log(`Data cached for ${cacheKeyBase}`);
//         }

//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch or cache data for ${cacheKeyBase} from ${apiUrl}:`, error);
//         throw new Error(`Unable to fetch data from ${apiUrl}.`);
//     }
// };

// const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching('departmentList', `${process.env.SERVICE_MANAGEMENT_URL}/department/list`, forceUpdate);

// const fetchServiceData = (forceUpdate = false) => fetchDataWithCaching('serviceList', `${process.env.SERVICE_MANAGEMENT_URL}/service/list`, forceUpdate);

// const fetchDocumentData = (forceUpdate = false) => fetchDataWithCaching('documentList',`${process.env.DOCUMENT_URL}document/list/upload`,forceUpdate)
// module.exports = {
//     fetchDepartmentData,
//     fetchServiceData,
//     fetchDocumentData
// };