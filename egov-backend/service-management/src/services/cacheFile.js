// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

// const CACHE_DIR = path.join(__dirname, "../cache");
// const DOCUMENT_CACHE_FILE = path.join(CACHE_DIR, "documentList.json");

// // const ensureCacheDirectoryExists = () => {
// //     if (!fs.existsSync(CACHE_DIR)) {
// //         fs.mkdirSync(CACHE_DIR, { recursive: true });
// //     }
// // };

// const fetchDataWithCaching = async (cacheFile, apiUrl) => {
//     try {

//         // ensureCacheDirectoryExists();
//         if (!fs.existsSync(CACHE_DIR)) {
//             fs.mkdirSync(CACHE_DIR, { recursive: true });
//         }

//         if (fs.existsSync(cacheFile)) {
//             const fileData = fs.readFileSync(cacheFile, "utf-8");
//             return JSON.parse(fileData);
//         }

//         const response = await axios.post(apiUrl, { data: {} });
//         const data = response.data?.data?.rows;
//         setTimeout(() => {
//             fs.writeFileSync(cacheFile, JSON.stringify(data));
//         }, 5000)


//         return data;
//     } catch (error) {
//         console.error(`Failed to fetch data from ${apiUrl}:`, error);
//         throw new Error(`Unable to fetch data from ${apiUrl}.`);
//     }
// };

// const fetchDocumentData = () => fetchDataWithCaching(DOCUMENT_CACHE_FILE, `${process.env.DOCUMENTSERVICE}document/list/upload`)

// module.exports = {
//     fetchDocumentData
// };