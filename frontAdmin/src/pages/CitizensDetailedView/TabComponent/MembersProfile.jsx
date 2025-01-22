import React, { useEffect, useState } from "react";
const BlankData = process.env.REACT_APP_BLANK;
export function stringAvatar(citizen) {
    return `${citizen?.firstName?.charAt(0).toUpperCase()}${citizen?.lastName
        ?.charAt(0)
        .toUpperCase()}`;
}
function getMonthName(date) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    return months[date.getMonth()];
}
function formatDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Format the date in the desired format (08 Mar, 2024)
    const formattedDate = `${("0" + date.getDate()).slice(
        -2
    )} ${getMonthName(date)}, ${date.getFullYear()}`;

    // Get the hours and minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Add leading zero to minutes if needed
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedTime = `${hours}:${minutes} ${ampm}`

    return (
        <div>
            <span>{formattedDate}</span>
        </div>
    );
}
const MembersProfile = ({ profileData }) => {
    return (
        <div className="col-xl-6 col-lg-6 col-md-6 col-xxl-4">
            <div className="card-bg-fill card rounded-3 ">
                <div className="card-header rounded-top-3 d-flex align-items-center justify-content-between">
                    
                        <div className="profile-user position-relative d-inline-block  text-center ">
                            {profileData?.imageData?.documentPath ? (
                                <img
                                    src={
                                        profileData?.imageData?.documentPath
                                    }
                                    className="rounded-circle avatar-md img-thumbnail user-profile-image material-shadow" alt="user-profile"
                                />
                            ) : (
                                <div className="rounded-circle avatar-sm img-thumbnail bg-warning-subtle d-flex justify-content-center align-items-center fs-16">{stringAvatar(profileData)}</div>
                            )}
                        </div>
                        <div className="ms-2">
                            <h5 className="fs-16 mb-0">{`${profileData?.firstName} ${profileData?.middleName} ${profileData?.lastName}`}</h5>
                            {profileData?.nibNumber && <p className="text-muted mb-0">NIB / {profileData?.nibNumber}</p>}
                        </div>
                    
                </div>
                <div className=" card-body">

                    <div className="row">
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3  ">
                            <div className="" >

                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">
                                    Full Name</p>
                                <h5 className="fs-14 mb-0 view-type ">{`${profileData?.firstName} ${profileData?.middleName} ${profileData?.lastName}`}</h5>
                            </div>
                        </div>


                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3  ">
                            <div className="" >

                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Date of Birth</p>
                                <h5 className="fs-14 mb-0 view-type">  {profileData?.dateOfBirth ? formatDate(profileData?.dateOfBirth) : BlankData}
                                </h5>
                            </div>
                        </div>
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3   ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Place of Birth</p>
                                <h5 className="fs-14 mb-0 view-postdate">  {profileData?.countryOfBirth?.name ||
                                    BlankData}</h5>
                            </div>
                        </div>
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3  ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Gender</p>
                                <h5 className="fs-14 mb-0 view-experience">{profileData?.gender === "0"
                                    ? "Male"
                                    : "Female"}</h5>
                            </div>
                        </div>

                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3     ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Citizen</p>
                                <h5 className="fs-14 mb-0 view-experience">{profileData?.countryOfCitizenship
                                    ?.name || BlankData}</h5>
                            </div>
                        </div>
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-3      ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Resident</p>
                                <h5 className="fs-14 mb-0 view-experience">{profileData?.isResident === "0" ? "No" : "Yes"}</h5>

                            </div>
                        </div>
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-sm-0    ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Phone  </p>
                                <h5 className="fs-14 mb-0 view-experience">{profileData?.mobileNumber || BlankData} </h5>

                            </div>
                        </div>
                        <div className=" col-xl-6 col-xxl-6 col-lg-6 col-md-6 col-sm-6 col-6      ">
                            <div className="" >
                                <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted"> Email</p>
                                <h5 className="fs-14 mb-0 view-experience">{profileData?.email || BlankData}</h5>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default MembersProfile;
