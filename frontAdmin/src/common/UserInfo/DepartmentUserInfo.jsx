import React, { useEffect, useMemo, useState } from "react";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../utils/hook/useAxios";
import { useSelector } from "react-redux";

const DepartmentUserInfo = () => {
    const axiosInstance = useAxios()
    const departmentUserInfo = useSelector(
        (state) => state?.Layout?.departmentUserInfo
    );

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);
    const userData = userDecryptData?.data;
    const userRole = userData?.role?.roleName;


    const getCurrentFormattedDate = () => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        const today = new Date();
        const dateString = today.toLocaleDateString("en-US", options);
        return dateString.replace(",", "");
    };
    return (
        userData?.isCoreTeam === "0" && (
            <div className="col-12 mb-3 mb-lg-4 ">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column mx-3">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                            <p className="avatar-sm mb-0 fs-20 text-white d-flex align-items-center justify-content-center">
                                <img src={departmentUserInfo?.imageData?.documentPath} alt="deparment logo" className="avatar-sm rounded-circle" />
                            </p>

                            <div className="ms-3">
                                <h5 className="mb-0"> {departmentUserInfo?.departmentName} </h5>
                                <p className="fs-15 mt-1 text-muted mb-0"> {userRole === "Department Admin" ? "Dept. Head" : "Agent"} - {userData?.name} </p>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-end">
                        <span className="mb-0 fs-15 text-muted current-date">
                            {getCurrentFormattedDate()}
                        </span>
                    </div>
                </div>
            </div>
        )
    );
};

export default DepartmentUserInfo;
