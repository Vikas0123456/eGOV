import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import SimpleBar from 'simplebar-react';

function firstLetter(inputString) {
    const hasSpaces = inputString.includes(" ");

    // Return the dynamic result based on the condition
    if (hasSpaces) {
        // Split the string by spaces and filter out empty elements
        const words = inputString.split(" ").filter(word => word !== "");

        // Map each word to its first letter in uppercase
        return words
            .map(word => word[0].toUpperCase())
            .join("");
    } else {
        // If there are no spaces, return the first two letters in uppercase
        return inputString.slice(0, 2).toUpperCase();
    }
}

const ProfileDropdown = ({ currentPath,userData, userImageData, handleLogout, BlockedIpsView, emailLogView, formBuilderView, emailTemplateView,settingView }) => {
    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };
    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        {/* <img className="rounded-circle header-profile-user" src={avatar1}
                            alt="Header Avatar" /> */}
                        <div>
                            {userImageData ? (
                                <img
                                    src={userImageData?.documentPath}
                                    alt={"img"}
                                    className="avatar-sm mb-0 rounded-circle"
                                />
                            ) : (
                                <p className="avatar-sm bg-primary mb-0 rounded-circle fs-20 text-white d-flex align-items-center justify-content-center">
                                    <i className="fst-normal">
                                        {userData?.name &&
                                            firstLetter(userData?.name)}
                                    </i>
                                </p>
                            )}
                        </div>
                        <span className="text-start ms-xl-2 text-nowrap">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium text-black user-name-text">{userData?.name}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{userData?.role?.roleName}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {userData?.name}!</h6>
                <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}>
                    <DropdownItem className='p-0'>
                        <Link to="/my-profile" className={`dropdown-item ${currentPath==="/my-profile"?"active":""}`}>
                            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">Profile</span>
                        </Link>
                    </DropdownItem>
                    <DropdownItem className='p-0'>
                        <Link to="/messages" className={`dropdown-item ${currentPath==="/messages"?"active":""}`}>
                            <i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i> <span
                                className="align-middle">Messages</span>
                        </Link>
                        </DropdownItem>

                    {emailLogView && <DropdownItem className='p-0'>
                        <Link to="/email-log" className={`dropdown-item ${currentPath==="/email-log"?"active":""}`}>
                            <i className="mdi mdi-email-outline text-muted fs-16 align-middle me-1"></i> <span
                                className="align-middle">Email Log</span>
                        </Link>
                    </DropdownItem>}
{/* 
                    <DropdownItem className='p-0'>
                        <Link to="/pages-faqs" className={`dropdown-item ${currentPath==="/pages-faqs"?"active":""}`}>
                            <i
                                className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle">Help</span>
                        </Link>
                    </DropdownItem> */}
                    <div className="dropdown-divider"></div>
                    {settingView && 
                    <DropdownItem className='p-0'>
                        <Link to="/settings" className={`dropdown-item ${currentPath==="/settings"?"active":""}`}>
                        <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">{" "}Settings</span>
                        </Link>
                    </DropdownItem>}
                    {BlockedIpsView && 
                        <DropdownItem className='p-0'>
                            <Link to="/blockedIps" className={`dropdown-item ${currentPath==="/blockedIps"?"active":""}`}>
                            <i className="mdi mdi-block-helper text-muted fs-16 align-middle me-1"></i>
                                <span className="align-middle">{" "}Blocked Ips</span>
                            </Link>
                        </DropdownItem>}
                    {emailTemplateView && <DropdownItem className='p-0'>
                        <Link to="/email-template" className={`dropdown-item ${currentPath==="/email-template"?"active":""}`}>
                        <i className="mdi mdi-email-edit-outline text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">{" "}Email Template</span>
                        </Link>
                    </DropdownItem>}
                    {formBuilderView && <DropdownItem className='p-0'>
                        <Link to="/formbuilder/list" className={`dropdown-item ${currentPath==="/formbuilder/list" || currentPath==="/formbuilder"?"active":""}`}>
                        <i className="mdi mdi-form-select text-muted fs-16 align-middle me-1"></i>
                            <span className="align-middle">{" "}Form Builder</span>
                        </Link>
                    </DropdownItem>}
                    
                    <DropdownItem className='p-0'>
                        <span onClick={handleLogout} className="dropdown-item">
                            <i
                                className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span
                                    className="align-middle" data-key="t-logout">Logout</span>
                        </span>
                    </DropdownItem>

                </SimpleBar>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;