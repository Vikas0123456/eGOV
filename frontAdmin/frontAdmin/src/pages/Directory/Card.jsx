import React from "react";
import { FiEdit2 } from "react-icons/fi";
import Noimage from "../../../src/assets/images/NoImage.jpg";
import { Eye } from "feather-icons-react/build/IconComponents";

const Card = ({
  userImage,
  name,
  departmentName,
  phone,
  email,
  onClick,
  editPermission,
  viewPermissions
}) => {
  return (
    <div className="col-lg-6 col-xl-3 col-md-6 col-12 mb-3">
      <div
        className="d-flex align-items-center bg-white p-2 position-relative h-100"
        style={{ flexWrap: "nowrap" }}
      >
        <div className="flex-shrink-0 me-2 ">
          <img
            src={userImage ? userImage : Noimage}
            alt="userImage"
            className="avatar-md rounded-circle"
          />
        </div>
        {viewPermissions && !editPermission && (
          <div className="edit-directory" title="view" onClick={onClick}>
            <Eye className="cursor-pointer"/>
          </div>
        )}
        {editPermission && (
          <div className="edit-directory" title="Edit" onClick={onClick}>
            <FiEdit2 className="cursor-pointer"/>
          </div>
        )}
        <div className="flex-grow-1">
          <div>
            <strong>{name}</strong>
          </div>
          <div className="text-muted mb-1 ">{departmentName}</div>
          <div className="fs-12">
            <div title="(501) 245 6588">{phone}</div>
          </div>
          <div className="fs-12">
            <div title="milliedawkins@egov.bz">{email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
