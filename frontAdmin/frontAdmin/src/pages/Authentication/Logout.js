import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { logoutUser } from "../../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";

import withRouter from "../../Components/Common/withRouter";
import { createSelector } from "reselect";
import useAxios from "../../utils/hook/useAxios";
import { detect } from "detect-browser";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import axios  from 'axios';

const Logout = (props) => {
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const browser = detect();
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id;
  const token = userData?.token;

  useEffect(() => {
    logoutfromApi();
  }, []);
  const logoutfromApi = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      if (response && response.status === 200) {
        const result = response.data;
  
        try {
          const logoutResponse = await axiosInstance.put(`userService/user/logout`, {
            userId: userId,
            token: token,
            ip: result?.ip,
            browserName: browser.name,
          });
  
          if (logoutResponse) {
            localStorage.clear();
            navigate("/");
          }
        } catch (error) {
          console.error("Error during logout API call:", error);
          localStorage.clear();
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error fetching IP or logging out:", error);
      localStorage.clear();
      navigate("/");
    }
  };

  return <></>;
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default withRouter(Logout);