const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_DIR = path.join(__dirname, "../cache");
const DEPARTMENT_CACHE_FILE = path.join(CACHE_DIR, "departmentList.json");
const USER_CACHE_FILE = path.join(CACHE_DIR, "userList.json");
const DOCUMENT_CACHE_FILE = path.join(CACHE_DIR,"document.json");

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

        // if (fs.existsSync(cacheFile)) {
        //     const fileData = fs.readFileSync(cacheFile, "utf-8");
        //     return JSON.parse(fileData);
        // }

        if (!forceUpdate &&fs.existsSync(cacheFile)) {
            const fileData = fs.readFileSync(cacheFile, "utf-8");
            return JSON.parse(fileData);
        }

        const response = await axios.post(apiUrl, requestData);
        const data = response.data?.data?.rows || response.data?.data || response.data; 

        // setTimeout(() => {
        //     fs.writeFileSync(cacheFile, JSON.stringify(data));
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
            writeCacheFile(cacheFile, data);
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

const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching(DEPARTMENT_CACHE_FILE, `${process.env.SERVICEMANAGEMENT}department/list`,{},forceUpdate);

const fetchDocumentData = () => fetchDataWithCaching(DOCUMENT_CACHE_FILE,`${process.env.DOCUMENTSERVICE}document/list/upload`,{ data: {} });

const fetchUserData = (forceUpdate = false) => fetchDataWithCaching(USER_CACHE_FILE, `${process.env.USERSERVICE}user/getAlluser`,{},forceUpdate);


module.exports = {
    fetchDepartmentData,

    fetchUserData,

    fetchDocumentData
};

// const cacache = require("cacache");
// const axios = require("axios");
// const path = require("path");
// const fs = require('fs');
// const CACHE_DIR = path.join(__dirname, "../cache");
// const DEPARTMENT_CACHE_KEY = "departmentList";
// const USER_CACHE_KEY = "userList";
// const DOCUMENT_CACHE_KEY = "document";

// // Ensure the cache directory exists
// // const ensureCacheDirectoryExists = () => {
// //     if (!cacache.ls(CACHE_DIR)) {
// //         cacache.mkdirSync(CACHE_DIR);
// //     }
// // };

// // const cacheFiles = {
// //     department : 'departmentlist.json',
// //     user: 'userlist.json'
// // }

// // const removeCacheFile = async (cacheFile) => {
// //     try {
// //         const cachePath = path.join(CACHE_DIR, cacheFile);
// //         if (fs.existsSync(cachePath)) {
// //             await cacache.rm.entry(CACHE_DIR, cacheFile);
// //             console.log(`Removed old cache file for ${cacheFile}`);
// //         }
// //     } catch (error) {
// //         console.error(`Failed to remove cache file ${cacheFile}:`, error);
// //     }
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


// const fetchDataWithCaching = async (cacheKeyBase, apiUrl, requestData = {}, forceUpdate = false) => {
//     try {
//         // ensureCacheDirectoryExists();
//         // const cacheFile = cacheFiles[cacheKey];
//         // if (!forceUpdate) {
//         //     const cacheEntry = await cacache.get.info(CACHE_DIR, cacheFile);

//         //     if (cacheEntry) {
//         //         console.log(`Cache hit for ${cacheKey}`);
//         //         const cachedData = await cacache.get(CACHE_DIR, cacheFile);
//         //         return JSON.parse(cachedData.data.toString());
//         //     }
//         // } else {
//         //     console.log(`Force update for ${cacheKey}. Skipping cache...`);
//         //     await removeCacheFile(cacheFile);
//         // }

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
//             console.log(`Data cached for ${cacheKeyBase}`);
//         }

//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch or cache data for ${cacheKeyBase} from ${apiUrl}:`, error);
//         throw new Error(`Unable to fetch data from ${apiUrl}.`);
//     }
// };

// const fetchDepartmentData = (forceUpdate = false) => fetchDataWithCaching("department", `${process.env.SERVICEMANAGEMENT}department/list`, {}, forceUpdate);

// // const fetchDocumentData = () => fetchDataWithCaching(DOCUMENT_CACHE_KEY, `${process.env.DOCUMENTSERVICE}document/list/upload`, { data: {} });

// const fetchUserData = (forceUpdate = false) => fetchDataWithCaching("user", `${process.env.USERSERVICE}user/getAlluser`, {}, forceUpdate);

// module.exports = {
//     fetchDepartmentData,
//     fetchUserData,
//     // fetchDocumentData,
// };
