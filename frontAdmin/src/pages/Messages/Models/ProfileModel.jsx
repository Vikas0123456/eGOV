import React, { useState } from "react";
import smallImage9 from "../../../assets/images/small/img-9.jpg";
import {
    Modal,
    ModalBody,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";

import { MdBorderColor } from "react-icons/md";

const ProfileModal = ({
    currentUser,
    isOpen,
    toggle,
    handleDeleChat,
    userId,
    archive,
    unarchive,
    favchat,
    unfavchat,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
    return (
        <div role="dialog border-0">
            <div className="border-0">
                <Modal
                    isOpen={isOpen}
                    toggle={toggle}
                    className="modal-dialog modal-dialog-right border-0 modal-md me-0 my-0">
                    <ModalBody
                        className="relative offcanvas-body profile-offcanvas p-0"
                        style={{
                            height: "100vh",
                        }}>
                        <div className="team-cover ">
                            <img
                                src={smallImage9}
                                alt=""
                                className="img-fluid"
                            />
                        </div>
                        <div className="p-1 pb-4 pt-0">
                            <div className="team-settings">
                                <div className="row g-0">
                                    <div className="col">
                                        <div className="btn nav-btn">
                                        <i className="ri-close-line me-1 align-middle text-white fs-22"  onClick={toggle}></i>
                                            
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="user-chat-nav d-flex">
                                            {(() => {
                                                const isFavourite =
                                                    currentUser &&
                                                    currentUser.favouriteBy
                                                        ? currentUser.favouriteBy.includes(
                                                              userId
                                                          )
                                                        : false;
                                                const isArchived =
                                                    currentUser &&
                                                    currentUser.archiveBy
                                                        ? currentUser.archiveBy.includes(
                                                              userId
                                                          )
                                                        : false;

                                                return !isArchived ? (
                                                    isFavourite ? (
                                                        <button
                                                            type="button"
                                                            className="btn nav-btn favourite-btn active"
                                                            onClick={() =>
                                                                unfavchat(true)
                                                            }>
                                                            <i className="ri-star-fill"></i>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn nav-btn favourite-btn active"
                                                            onClick={() =>
                                                                favchat(true)
                                                            }>
                                                            <i
                                                                className="ri-star-line"
                                                                style={{
                                                                    color: "white",
                                                                    padding:
                                                                        "2px",
                                                                    display:
                                                                        "inline-block",
                                                                }}></i>
                                                        </button>
                                                    )
                                                ) : null;
                                            })()}

                                            <Dropdown
                                                isOpen={dropdownOpen}
                                                toggle={toggleDropdown}>
                                                <DropdownToggle
                                                    className="btn  btn-icon"
                                                    tag="button"
                                                    data-bs-toggle="dropdown">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#fff"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="feather feather-more-vertical icon-sm">
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="1"></circle>
                                                        <circle
                                                            cx="12"
                                                            cy="5"
                                                            r="1"></circle>
                                                        <circle
                                                            cx="12"
                                                            cy="19"
                                                            r="1"></circle>
                                                    </svg>
                                                </DropdownToggle>
                                                <DropdownMenu end>
                                                {(() => {
                                                            const isFavourite =
                                                                currentUser && currentUser.favouriteBy
                                                                    ? currentUser.favouriteBy.includes(userId)
                                                                    : false;
                                                            const isArchived =
                                                                currentUser && currentUser.archiveBy
                                                                    ? currentUser.archiveBy.includes(userId)
                                                                    : false;

                                                            if (isFavourite) {
                                                                return null; 
                                                            }

                                                            return isArchived ? (
                                                                <DropdownItem
                                                                    onClick={() => unarchive(true)}>
                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>
                                                                    UnArchive
                                                                </DropdownItem>
                                                            ) : (
                                                                <DropdownItem
                                                                    onClick={() => archive(true)}>
                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>
                                                                    Archive
                                                                </DropdownItem>
                                                            );
                                                        })()}

                                                    {/* <DropdownItem>
                                                        <i className="ri-mic-off-line align-bottom text-muted me-2"></i>
                                                        Muted
                                                    </DropdownItem> */}
                                                    <DropdownItem
                                                        onClick={
                                                            handleDeleChat
                                                        }>
                                                        <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>
                                                        Clear chat
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 text-center position-relative">
                            <img
                                src={currentUser?.user?.profileImagePath}
                                alt=""
                                className="avatar-lg img-thumbnail rounded-circle mx-auto profile-img"
                                style={{
                                    width: 100,
                                    height: 100,
                                    objectFit: "cover",
                                }}
                            />
                            <div className="mt-3">
                                <h5 className="fs-16 mb-1">
                                    <a className="link-primary username">
                                        {currentUser?.user?.name ||
                                            "Alen Kernan"}
                                    </a>
                                </h5>
                                {/* <p className="text-muted">
                                    <i className="ri-checkbox-blank-circle-fill me-1 align-bottom text-success"></i>
                                    Online
                                </p> */}
                            </div>
                            <div className="d-flex gap-2 justify-content-center d-none">
                                <button
                                    type="button"
                                    className="btn avatar-xs p-0"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Message">
                                    <span className="avatar-title rounded bg-light text-body">
                                        <i className="ri-question-answer-line"></i>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="btn avatar-xs p-0"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Favourite">
                                    <span className="avatar-title rounded bg-light text-body">
                                        <i className="ri-star-line"></i>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="btn avatar-xs p-0"
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                    title="Phone">
                                    <span className="avatar-title rounded bg-light text-body">
                                        <i className="ri-phone-line"></i>
                                    </span>
                                </button>
                                <div className="dropdown">
                                    <button
                                        className="btn avatar-xs p-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false">
                                        <span className="avatar-title bg-light text-body rounded">
                                            <i className="ri-more-fill"></i>
                                        </span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <a className="dropdown-item">
                                                <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>
                                                Archive
                                            </a>
                                        </li>
                                        {/* <li>
                                            <a className="dropdown-item">
                                                <i className="ri-mic-off-line align-bottom text-muted me-2"></i>
                                                Muted
                                            </a>
                                        </li> */}
                                        <li>
                                            <a className="dropdown-item">
                                                <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>
                                                Delete
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="border-top border-top-dashed p-3">
                            <h5 className="fs-15 mb-3">Personal Details</h5>
                            <div className="mb-3">
                                <p className="text-muted text-uppercase fw-medium fs-12 mb-1">
                                    Number
                                </p>
                                <h6>
                                    {currentUser?.user?.phone ||
                                        "+(256) 2451 8974"}
                                </h6>
                            </div>
                            <div className="mb-3">
                                <p className="text-muted text-uppercase fw-medium fs-12 mb-1">
                                    Email
                                </p>
                                <h6>
                                    {currentUser?.user?.email ||
                                        "lisaparker@gmail.com"}
                                </h6>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        </div>
    );
};

export default ProfileModal;
