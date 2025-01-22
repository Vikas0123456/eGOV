const fs = require("fs");
const path = require("path");
const axios = require("axios");
 
const CACHE_DIR = path.join(__dirname, "../cache");
const DEPARTMENT_CACHE_FILE = path.join(CACHE_DIR, "departmentList.json");
const SERVICE_CACHE_FILE = path.join(CACHE_DIR, "serviceList.json");
const DOCUMENT_CACHE_FILE = path.join(CACHE_DIR, "documentList.json");
const DOCUMENT_VIEW_CACHE_FILE = path.join(CACHE_DIR, "documentviewList.json");
 
const USER_CACHE_FILE = path.join(CACHE_DIR, "userList.json");
const CUSTOMER_CACHE_FILE = path.join(CACHE_DIR,"customerList.json");
// const AUDIT_LOG_CACHE_FILE = path.join(CACHE_DIR, "auditLogList.json");
 
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

const fetchDataWithCaching = async (cacheFile, apiUrl, requestData = {} ,forceUpdate = false,) => {
    try {
        ensureCacheDirectoryExists();
 
        // if (!fs.existsSync(CACHE_DIR)) {
        //     fs.mkdirSync(CACHE_DIR, { recursive: true });
        // }
 
        if (!forceUpdate && fs.existsSync(cacheFile)) {
            const fileData = fs.readFileSync(cacheFile, "utf-8");
            return JSON.parse(fileData);
        }
 
        const response = await axios.post(apiUrl, requestData);
        const data = response.data?.data?.rows || response.data?.data || response.data;
 
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
 
// const fetchAuditLogData = async (auditLogBody) => {
//     try {
//         ensureCacheDirectoryExists();
 
//         if (fs.existsSync(AUDIT_LOG_CACHE_FILE)) {
//             const fileData = fs.readFileSync(AUDIT_LOG_CACHE_FILE, "utf-8");
//             return JSON.parse(fileData);
//         }
 
//         const response = await axios.post(`${process.env.USERSERVICE}auditLog/create`, {
//             data: auditLogBody,
//         });
 
 
//         const data = response.data || response || response?.data?.data || response.data?.data?.rows;
 
//         setTimeout(() => {
//             fs.writeFileSync(AUDIT_LOG_CACHE_FILE, JSON.stringify(data));
//         }, 5000)
//         return data;
//     } catch (error) {
//         console.error("Failed to fetch audit log data:", error);
//         throw new Error("Unable to fetch audit log data.");
//     }
// };
 
const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching(DEPARTMENT_CACHE_FILE, `${process.env.SERVICE_MANAGEMENT_URL}/department/list`,{},forceUpdate);
const fetchServiceData = (forceUpdate = false) => fetchDataWithCaching(SERVICE_CACHE_FILE, `${process.env.SERVICE_MANAGEMENT_URL}/service/list`,{},forceUpdate);
// const fetchDocumentData = (forceUpdate = false) => fetchDataWithCaching(DOCUMENT_CACHE_FILE, `${process.env.DOCUMENTSERVICE}document/list/upload`, { data: {} },forceUpdate);
// const fetchDocumentViewData = () => fetchDataWithCaching(DOCUMENT_VIEW_CACHE_FILE,`${process.env.DOCUMENTSERVICE}view`, {data: {},});
 
const fetchUserData = (forceUpdate = false) => fetchDataWithCaching(USER_CACHE_FILE, `${process.env.USERSERVICE}internalCommunicationUser/getAlluser`,{},forceUpdate);
const fetchCustomerData = (forceUpdate = false) => fetchDataWithCaching(CUSTOMER_CACHE_FILE,  `${process.env.USERSERVICE}internalCommunicationCustomer/customerList`,{},forceUpdate);
 
 
module.exports = {
    fetchDepartmentData,
    fetchServiceData,
    // fetchDocumentData,
    fetchUserData,
    fetchCustomerData,
    // fetchDocumentViewData,
    // fetchAuditLogData
};
 

// const cacache = require("cacache");
// const axios = require("axios");
// const path = require("path");
// const fs = require('fs');
// const crypto = require('crypto');

// const CACHE_DIR = path.join(__dirname, "../cache");

// // const cacheFiles = {
// //     departmentList: "departmentList.json",
// //     serviceList: "serviceList.json",
// //     documentList: "documentList.json",
// //     documentViewList: "documentviewList.json",
// //     userList: "userList.json",
// //     customerList: "customerList.json",
// //     // auditLogList: "auditLogList.json", // Uncomment when needed
// // };

// if (!fs.existsSync(CACHE_DIR)) {
//     fs.mkdirSync(CACHE_DIR, { recursive: true });
// }

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

// // Ensure the cache directory exists
// // const ensureCacheDirectoryExists = () => {
// //     if (!cacache.ls(CACHE_DIR)) {
// //         cacache.mkdirSync(CACHE_DIR);
// //     }
// // };

// const fetchDataWithCaching = async (cacheKeyBase, apiUrl, requestData = {}, forceUpdate = false) => {
//     try {
//         // ensureCacheDirectoryExists();

//         // const cacheFile = cacheFiles[cacheKey];
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
//         const response = await axios.post(apiUrl, requestData);
//         const data = response.data?.data?.rows || response.data?.data || response.data;

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

// const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching("departmentList", `${process.env.SERVICE_MANAGEMENT_URL}/department/list`, {}, forceUpdate);
// const fetchServiceData = (forceUpdate = false) => fetchDataWithCaching("serviceList", `${process.env.SERVICE_MANAGEMENT_URL}/service/list`, {}, forceUpdate);
// const fetchDocumentData = () => fetchDataWithCaching("documentList", `${process.env.DOCUMENTSERVICE}document/list/upload`, { data: {} });
// // const fetchDocumentViewData = () => fetchDataWithCaching("documentViewList", `${process.env.DOCUMENTSERVICE}view`, { data: {} });
// const fetchUserData = () => fetchDataWithCaching("userList", `${process.env.USERSERVICE}internalCommunicationUser/getAlluser`);
// const fetchCustomerData = (forceUpdate = false) => fetchDataWithCaching("customerList", `${process.env.USERSERVICE}internalCommunicationCustomer/customerList`, {}, forceUpdate);

// module.exports = {
//     fetchDepartmentData,
//     fetchServiceData,
//     fetchDocumentData,
//     fetchUserData,
//     fetchCustomerData,
//     // fetchDocumentViewData,
//     // fetchAuditLogData // Uncomment when needed
// };
