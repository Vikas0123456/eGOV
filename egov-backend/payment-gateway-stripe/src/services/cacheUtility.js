const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "../cache");
const DEPARTMENT_CACHE_FILE = path.join(CACHE_DIR, "departmentList.json");
const SERVICE_CACHE_FILE = path.join(CACHE_DIR, "serviceList.json");
const USER_CACHE_FILE = path.join(CACHE_DIR, "userList.json");
const CUSTOMER_CACHE_FILE = path.join(CACHE_DIR,"customerList.json")
// const BIRTH_USER_CACHE_FILE = path.join(CACHE_DIR,'birthdata.json');
// const REVENUE_STATUS_CACHE_FILE = path.join(CACHE_DIR,'revenuestatusdata.json')
// const BIRTH_RATING_CACHE_FILE = path.join(CACHE_DIR,'birthrating.json');
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

const fetchDataWithCaching = async (cacheFile, apiUrl, requestData = {},forceUpdate=false) => {
    try {
        ensureCacheDirectoryExists();

        // if (!fs.existsSync(CACHE_DIR)) {
        //     fs.mkdirSync(CACHE_DIR, { recursive: true });
        // }

        if (!forceUpdate &&fs.existsSync(cacheFile)) {
            const fileData = fs.readFileSync(cacheFile, "utf-8");
            return JSON.parse(fileData);
        }

        const response = await axios.post(apiUrl, requestData);
        const data = response.data?.data?.rows || response.data?.data || response.data; 

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
            writeCacheFile(cacheFile, data);
        } else {
            // Otherwise, delay the cache writing process
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

// const fetchRevenueApplicationStatusData = async (status) => {
//     try {
//         // ensureCacheDirectoryExists();

//         if (!fs.existsSync(CACHE_DIR)) {
//             fs.mkdirSync(CACHE_DIR, { recursive: true });
//         }

//         if (fs.existsSync(REVENUE_STATUS_CACHE_FILE)) {
//             const fileData = fs.readFileSync(REVENUE_STATUS_CACHE_FILE, "utf-8");
//             return JSON.parse(fileData);
//         }

//         const response = await axios.post(`${process.env.API_URL}applicationsInternalCommunication/revenueApplicationStatus`,{ data: { status: status } });


//         const data = response.data || response || response.data?.data || response.data?.data?.rows;

//         setTimeout(() => {
//             fs.writeFileSync(REVENUE_STATUS_CACHE_FILE, JSON.stringify(data));
//         }, 5000)
//         return data;
//     } catch (error) {
//         console.error("Failed to fetch audit log data:", error);
//         throw new Error("Unable to fetch audit log data.");
//     }
// };

// const fetchAuditLogData = async (auditLogBody) => {
//     try {
//         // ensureCacheDirectoryExists();

//         if (!fs.existsSync(CACHE_DIR)) {
//             fs.mkdirSync(CACHE_DIR, { recursive: true });
//         }

//         if (fs.existsSync(AUDIT_LOG_CACHE_FILE)) {
//             const fileData = fs.readFileSync(AUDIT_LOG_CACHE_FILE, "utf-8");
//             return JSON.parse(fileData);
//         }

//         const response = await axios.post(`${process.env.USERMICROSERVICE}/auditLog/create`, {
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
const fetchUserData = (forceUpdate = false) => fetchDataWithCaching(USER_CACHE_FILE, `${process.env.USERSERVICE}/user/getAlluser`,{},forceUpdate);
const fetchCustomerData = (forceUpdate = false) => fetchDataWithCaching(CUSTOMER_CACHE_FILE,`${process.env.USERMICROSERVICE}/internalCommunicationCustomer/customerList`,{},forceUpdate);
// const fetchBirthData = () => fetchDataWithCaching(BIRTH_USER_CACHE_FILE, `${process.env.BIRTHSERVICE_URL}/application/CompleteList`,{ data: {} });
// const fetchBirthRatingData = () => fetchDataWithCaching(BIRTH_RATING_CACHE_FILE,`${process.env.BIRTHSERVICE_URL}/application/ratingCount/list`)
// const fetchRevenueApplicationStatusData = () => fetchDataWithCaching(REVENUE_STATUS, `${process.env.API_URL}applicationsInternalCommunication/revenueApplicationStatus`,{ data: { status: status } })
module.exports = {
    fetchDepartmentData,
    fetchServiceData,
    fetchUserData,
    fetchCustomerData,
    // fetchBirthData,
    // fetchRevenueApplicationStatusData,
    // fetchBirthRatingData,
    // fetchAuditLogData
};


// const cacache = require("cacache");
// const axios = require("axios");
// const path = require("path");
// const fs = require('fs');
// const crypto = require('crypto');
// const CACHE_DIR = path.join(__dirname, "../cache");

// // const DEPARTMENT_CACHE_KEY = "departmentList";
// // const SERVICE_CACHE_KEY = "serviceList";
// // const USER_CACHE_KEY = "userList";
// // const CUSTOMER_CACHE_KEY = "customerList";

// // Ensure the cache directory exists
// // const ensureCacheDirectoryExists = () => {
// //     if (!cacache.ls(CACHE_DIR)) {
// //         cacache.mkdirSync(CACHE_DIR);
// //     }
// // };

// // const cacheFiles = {
// //     department : 'departmentlist.json',
// //     service: 'servicelist.json',
// //     user: 'userlist.json',
// //     customer: 'customerlist.json'
// // }

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
//         // Cache miss or force update: Fetch data from the API
//         console.log(`Fetching data from API for ${cacheKeyBase}...`);
//         const response = await axios.post(apiUrl, requestData);
//         const data = response.data?.data?.rows || response.data?.data || response.data;

//         if (data) {
//             // Save the new data to the cache
//             await cacache.put(CACHE_DIR, cacheFile, JSON.stringify(data, null, 2));
//             console.log(`Data cached for ${cacheKey}`);
//         }

//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch or cache data for ${cacheKeyBase} from ${apiUrl}:`, error);
//         throw new Error(`Unable to fetch data from ${apiUrl}.`);
//     }
// };

// const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching("department", `${process.env.SERVICE_MANAGEMENT_URL}/department/list`, {}, forceUpdate);
// const fetchServiceData = (forceUpdate = false) => fetchDataWithCaching("service", `${process.env.SERVICE_MANAGEMENT_URL}/service/list`, {}, forceUpdate);
// const fetchUserData = (forceUpdate = false) => fetchDataWithCaching("user", `${process.env.USERSERVICE}/user/getAlluser`, {}, forceUpdate);
// const fetchCustomerData = (forceUpdate = false) => fetchDataWithCaching("customer", `${process.env.USERMICROSERVICE}/internalCommunicationCustomer/customerList`, {}, forceUpdate);

// module.exports = {
//     fetchDepartmentData,
//     fetchServiceData,
//     fetchUserData,
//     fetchCustomerData,
// };
