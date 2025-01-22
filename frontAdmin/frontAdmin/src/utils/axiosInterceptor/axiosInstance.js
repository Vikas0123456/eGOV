import axios from "axios";
import { decrypt, encrypt } from "../encryptDecrypt/encryptDecrypt";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 20000, // Adjust the timeout as needed
});

axiosInstance.interceptors.request.use(
    (config) => {
        const userEncryptData = localStorage.getItem("userData");
        const userDecryptData = userEncryptData
            ? decrypt({ data: userEncryptData })
            : {};
        const userData = userDecryptData?.data;
        const token = userData?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data && !(config.data instanceof FormData)) {
            // Exclude FormData from encryption
            config.data = encrypt(config.data);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = decrypt(response.data);
        }
        return response;
    },
    (error) => {
        const jsonObject = error.response.data;
        const statusCode = error.response.status;
        const userEncryptData = localStorage.getItem("userData");
        const userDecryptData = userEncryptData
            ? decrypt({ data: userEncryptData })
            : {};
        const userData = userDecryptData?.data;
        const token = userData?.token;
        if (statusCode == 401 && token && token != "") {
            localStorage.clear();
        } else if (statusCode == 401) {
            localStorage.clear();
        }
        error.response.data = decrypt(jsonObject);
        return Promise.reject(error);
    }
);

export default axiosInstance;
