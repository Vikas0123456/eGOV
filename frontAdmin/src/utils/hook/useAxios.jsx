import { useEffect } from "react";
import axios from "axios";
import { decrypt, encrypt } from "../encryptDecrypt/encryptDecrypt";
import { useNavigate } from "react-router-dom";

const useAxios = () => {
  const navigate = useNavigate();

  // Create an Axios instance with default settings
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 20000, // Timeout for requests (20 seconds)
  });

  // Request interceptor to handle request modifications
  axiosInstance.interceptors.request.use(
    (config) => {
      // Retrieve and decrypt customer data from local storage
      const customerEncryptData = localStorage.getItem("userData");
      const userDecryptData = customerEncryptData
        ? decrypt({ data: customerEncryptData })
        : {};
      const customerData = userDecryptData?.data;

      // Attach token to request headers if available
      const token = customerData?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Encrypt request data if not FormData
      if (config.data && !(config.data instanceof FormData)) {
        config.data = encrypt(config.data);
      }
      
      return config;
    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle response modifications
  axiosInstance.interceptors.response.use(
    (response) => {
      // Decrypt response data if available
      if (response.data) {
        response.data = decrypt(response.data);
      }
      return response;
    },
    (error) => {
      // Handle response error
      const jsonObject = error.response.data;
      const statusCode = error.response.status;

      // Retrieve and decrypt customer data from local storage
      const customerEncryptData = localStorage.getItem("userData");
      const userDecryptData = customerEncryptData
        ? decrypt({ data: customerEncryptData })
        : {};
      const customerData = userDecryptData?.data;
      const token = customerData?.token;

      // Redirect based on status code
      if (statusCode === 401 && token && token !== "") {
        navigate("/logout"); // Redirect to logout if token is present
      } else if (statusCode === 401) {
        localStorage.clear();
        navigate("/");
      }

      // Decrypt error response data
      error.response.data = decrypt(jsonObject);

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
