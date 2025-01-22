import React, { useState } from "react";
//Small Images
import smallImage9 from "../../../assets/images/small/img-9.jpg";
import {
    Modal,
    ModalBody,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";

const GroupInfoModel = ({
    isOpen,
    toggle,
    groupInfo,
    handleUpdateChat,
    handleDeleChat,
    handleDeleteGroupChat,
    handleLeaveGroupChat,
    userId,
    archive,
    unarchive,
    favchat,
    unfavchat,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    return (
        <div role="dialog">
            <div className=" ">
                <Modal
                    isOpen={isOpen}
                    toggle={toggle}
                    className="modal-dialog modal-dialog-right border-0 modal-md me-0 my-0">
                    <ModalBody
                        className="offcanvas-body profile-offcanvas p-0"
                        style={{
                            height: "100vh",
                        }}>
                        <div className="team-cover">
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
                                            <button
                                                type="button"
                                                className="btn-close btn-close-black"
                                                onClick={toggle}></button>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="user-chat-nav d-flex">
                                            {(() => {
                                                const isFavourite =
                                                    groupInfo &&
                                                    groupInfo.favouriteBy
                                                        ? groupInfo.favouriteBy.includes(
                                                              userId
                                                          )
                                                        : false;
                                                const isArchived =
                                                    groupInfo &&
                                                    groupInfo.archiveBy
                                                        ? groupInfo.archiveBy.includes(
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
                                            {groupInfo?.createdBy !== 0 && (
                                                <Dropdown
                                                    isOpen={dropdownOpen}
                                                    toggle={toggleDropdown}>
                                                    <DropdownToggle
                                                        className="btn btn-ghost-secondary btn-icon"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded={
                                                            dropdownOpen
                                                        }>
                                                        <i className="ri-more-2-fill"></i>
                                                    </DropdownToggle>

                                                    <DropdownMenu end>
                                                        {(() => {
                                                            const isFavourite =
                                                                groupInfo &&
                                                                groupInfo.favouriteBy
                                                                    ? groupInfo.favouriteBy.includes(
                                                                          userId
                                                                      )
                                                                    : false;
                                                            const isArchived =
                                                                groupInfo &&
                                                                groupInfo.archiveBy
                                                                    ? groupInfo.archiveBy.includes(
                                                                          userId
                                                                      )
                                                                    : false;

                                                            if (isFavourite) {
                                                                return null;
                                                            }

                                                            return isArchived ? (
                                                                <DropdownItem
                                                                    onClick={() =>
                                                                        unarchive(
                                                                            true
                                                                        )
                                                                    }>
                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>
                                                                    UnArchive
                                                                </DropdownItem>
                                                            ) : (
                                                                <DropdownItem
                                                                    onClick={() =>
                                                                        archive(
                                                                            true
                                                                        )
                                                                    }>
                                                                    <i className="ri-inbox-archive-line align-bottom text-muted me-2"></i>
                                                                    Archive
                                                                </DropdownItem>
                                                            );
                                                        })()}

                                                        {/* <DropdownItem>
                            <i className="ri-mic-off-line align-bottom text-muted me-2"></i>
                            Muted
                          </DropdownItem> */}
                                                        {groupInfo.createdBy ===
                                                        userId ? (
                                                            <DropdownItem
                                                                onClick={
                                                                    handleDeleteGroupChat
                                                                }>
                                                                <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>
                                                                Delete Group
                                                            </DropdownItem>
                                                        ) : (
                                                            ""
                                                        )}
                                                        <DropdownItem
                                                            onClick={() =>
                                                                handleDeleChat(
                                                                    true
                                                                )
                                                            }>
                                                            <i className="ri-delete-bin-5-line align-bottom text-muted me-2"></i>
                                                            Clear Chat
                                                        </DropdownItem>
                                                        {groupInfo.createdBy ===
                                                        userId ? (
                                                            <DropdownItem
                                                                onClick={
                                                                    handleUpdateChat
                                                                }>
                                                                <i className="ri-pencil-line align-bottom text-muted me-2"></i>
                                                                Edit
                                                            </DropdownItem>
                                                        ) : (
                                                            ""
                                                        )}
                                                        {/* <DropdownItem onClick={handleUpdateChat}>
                            <i className="ri-pencil-line align-bottom text-muted me-2"></i>
                            Edit
                          </DropdownItem> */}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 text-center">
                            <div className="mt-3">
                                <h5 className="fs-16 mb-1">
                                    <a className="link-primary username">
                                        {groupInfo?.chatName || "Group Name"}
                                    </a>
                                </h5>
                            </div>
                        </div>
                        <div className="border-top border-top-dashed p-3">
                            <h5 className="fs-15 mb-3">Group Details</h5>
                            <div className="mb-3">
                                <p className="text-muted text-uppercase fw-medium fs-12 mb-1">
                                    Group Name
                                </p>
                                <h6>
                                    {groupInfo?.chatName || "Testing Group"}
                                </h6>
                            </div>
                            <div>
                                <p className="text-muted text-uppercase fw-medium fs-12 mb-1">
                                    Participants
                                </p>
                                <ul className="list-unstyled mb-0">
                                    {groupInfo?.participantsDetails &&
                                        groupInfo?.participantsDetails?.map(
                                            (participant) => (
                                                <li
                                                    key={participant?.id}
                                                    className="d-flex align-items-center mb-2">
                                                    <img
                                                        src={
                                                            participant?.profileImagePath ||
                                                            "assets/images/default-profile.jpg"
                                                        }
                                                        alt={participant?.name}
                                                        className="rounded-circle avatar-xs me-2"
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                        }}
                                                    />
                                                    <div>
                                                        <span>
                                                            {participant?.name}
                                                        </span>{" "}
                                                        {participant?.department && (
                                                            <span>
                                                               - {participant?.department}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            )
                                        )}
                                </ul>
                            </div>
                            {groupInfo.createdBy !== userId &&
                            groupInfo.createdBy !== 0 ? (
                                <div>
                                    <button onClick={handleLeaveGroupChat}>
                                        Leave
                                    </button>
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        </div>
    );
};

export default GroupInfoModel;
