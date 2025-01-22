import React, { useRef } from "react";
import { ImCross } from "react-icons/im";
import { Label, Input, Button, Offcanvas, Spinner } from "reactstrap";
import Select from "react-select";
import SimpleBar from "simplebar-react";

const UserAddUpdateModal = ({
  show,
  handleClose,
  updateId,
  formik,
  selectedFile,
  setSelectedFile,
  handleImageUpload,
  departmentList,
  listofRoleBydept,
  loading,
  userData,
  viewPermissions,
  createPermission,
  editPermission,
}) => {
  const inputRef = useRef(null);

  const handleCrossButtonClick = (event) => {
    event.stopPropagation();
    formik.setFieldValue("imageData", "");
    setSelectedFile(null);
  };

  const handleUploadContainerClick = () => {
    inputRef.current.click();
  };

  const supportTeamOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];

  const coreTeamOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];

  const departmentOptions =
    departmentList &&
    departmentList.map((department) => ({
      value: department.id,
      label: department.departmentName,
    }));

  const roleOptions =
    listofRoleBydept &&
    listofRoleBydept.map((role) => ({
      value: role.id,
      label: role.roleName,
    }));

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ];
  
  return (
    <Offcanvas direction="end" isOpen={show} toggle={handleClose}>
      <div className="bg-white p-4">
        <SimpleBar
          className="p-3 p-sm-4 bg-light vh-100"
          style={{ maxHeight: "calc(100vh - 50px)", overflow: "auto" }}
        >
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header pb-3">
              {!updateId && createPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Create User
                </h4>
              )}
              {updateId && !editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  View User
                </h4>
              )}
              {updateId && editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Update User
                </h4>
              )}
              <div className="d-flex justify-content-end align-items-center">
                <span onClick={handleClose} className="btn btn-sm btn-primary">
                  <i className="ri-close-line me-1 align-middle"></i> Cancel
                </span>
              </div>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div
                  className="upload-container cursor-pointer"
                  onClick={handleUploadContainerClick}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const files = event.dataTransfer.files;
                    if (files.length > 0) {
                      handleImageUpload({ target: { files } });
                    }
                  }}
                >
                  <input
                    ref={inputRef}
                    id="userImage"
                    name="userImage"
                    type="file"
                    onChange={(event) => handleImageUpload(event)}
                    style={{ display: "none" }}
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                  />
                  {selectedFile || formik.values?.imageData ? (
                    <div className="file-preview">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : formik.values?.imageData?.documentPath
                        }
                        alt="Uploaded file"
                      />
                      {((!updateId && createPermission) ||
                        (updateId && editPermission)) && (
                          <Button
                            type="button"
                            className="circle-button p-0 d-flex justify-content-center align-items-center btn btn-secondary"
                            onClick={
                              handleCrossButtonClick
                            }
                          >
                            <ImCross />
                          </Button>
                        )}
                    </div>
                  ) : (
                    <div className="upload-circle">
                      <div>
                        <p> Drag & Drop your picture or </p>
                        <button type="button" className="browse-button">
                          Browse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {formik.errors.documentFile && (
                  <div className="text-danger">
                    {formik.errors.documentFile}
                  </div>
                )}
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <Label htmlFor="departmentName-field" className="form-label">
                    {" "}
                    Name{" "}
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    value={formik.values.name}
                    {...formik.getFieldProps("name")}
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                  />
                  {formik.errors.name && formik.touched.name && (
                    <div className="text-danger">{formik.errors.name}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <Label htmlFor="email-field" className="form-label">
                    {" "}
                    Email{" "}
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    placeholder="Enter Email"
                    value={formik.values.email}
                    disabled={
                      updateId ||
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                    {...formik.getFieldProps("email")}
                  />
                  {formik.errors.email && formik.touched.email && (
                    <div className="text-danger">{formik.errors.email}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <Label htmlFor="url-field" className="form-label">
                    {" "}
                    Phone{" "}
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    disabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                    value={formik.values.phone}
                    {...formik.getFieldProps("phone")}
                  />
                  {formik.errors.phone && formik.touched.phone && (
                    <div className="text-danger">{formik.errors.phone}</div>
                  )}
                </div>
              </div>
              <div className="col-lg-12 mb-3">
                <div>
                  <Label htmlFor="supportTeam" className="form-label">
                    {" "}
                    Support Team{" "}
                  </Label>
                  <Select
                    id="supportTeam"
                    options={supportTeamOptions}
                    onChange={(option) => {
                        {
                          userData?.isCoreTeam !== "0" && formik.setFieldValue("isCoreTeam", option.value === "1" ? "0" : "");
                          userData?.isCoreTeam !== "0" && formik.setFieldValue("departmentId", "");
                          formik.setFieldValue("roleId", "");
                          formik.setFieldValue("isSupportTeam", option?.value);
                        }
                    }
                    }
                    isDisabled={
                      (!createPermission && !editPermission) ||
                      (updateId && !editPermission)
                    }
                    value={
                      formik.values.isSupportTeam
                        ? supportTeamOptions.find(
                          (option) =>
                            option.value === formik.values.isSupportTeam
                        )
                        : null
                    }
                    placeholder="Select Support Team*"
                    name="isSupportTeam"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
                      option: (provided) => ({
                        ...provided,
                        cursor: "pointer",
                      }),
                    }}
                  />
                  {formik.errors.isSupportTeam &&
                    formik.touched.isSupportTeam && (
                      <div className="text-danger">
                        {formik.errors.isSupportTeam}
                      </div>
                    )}
                </div>
              </div>
              {userData && userData?.isCoreTeam !== "0" && (
                <>
                  {
                    formik.values.isSupportTeam === "0" && (
                      <div className="col-lg-12 mb-3">
                        <div>
                          <Label htmlFor="tasksTitle-field" className="form-label">
                            {" "}
                            Core Team{" "}
                          </Label>
                          <Select
                            id="coreTeam"
                            options={coreTeamOptions}
                            onChange={(option) =>
                            {
                              formik.setFieldValue("departmentId", undefined);
                              formik.setFieldValue("roleId", "");
                              formik.setFieldValue("isCoreTeam", option?.value);
                            }
                            }
                            isDisabled={
                              (!createPermission && !editPermission) ||
                              (updateId && !editPermission)
                            }
                            value={
                              formik.values.isCoreTeam
                                ? coreTeamOptions.find(
                                  (option) =>
                                    option.value === formik.values.isCoreTeam
                                )
                                : null
                            }
                            placeholder="Select CoreTeam*"
                            name="isCoreTeam"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                cursor: "pointer",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                cursor: "pointer",
                              }),
                              option: (provided) => ({
                                ...provided,
                                cursor: "pointer",
                              }),
                            }}
                          />
                          {formik.errors.isCoreTeam &&
                            formik.touched.isCoreTeam && (
                              <div className="text-danger">
                                {formik.errors.isCoreTeam}
                              </div>
                            )}
                        </div>
                      </div>
                    )
                  }
                  {formik?.values?.isCoreTeam === "0" && (
                    <div className="col-lg-12 mb-3">
                      <div>
                        <Label
                          htmlFor="tasksTitle-field"
                          className="form-label"
                        >
                          {" "}
                          Department{" "}
                        </Label>
                        <Select
                          id="department"
                          options={departmentOptions}
                          onChange={(option) => {
                            formik.setFieldValue("roleId", "");
                            formik.setFieldValue(
                              "departmentId",
                              formik.values.isSupportTeam === "1"
                              ? option.map((opt) => opt.value).toString() // For multi-select, store array of values
                              : String(option?.value),
                            );
                          }
                          }
                          isDisabled={
                            (!createPermission && !editPermission) ||
                            (updateId && !editPermission)
                          }
                          value={
                            formik.values.departmentId ?
                            formik.values.isSupportTeam === "1"
                              ? departmentOptions.filter((option) =>
                                formik.values.departmentId?.includes(String(option.value))
                              )
                              : departmentOptions.find(
                                (option) => option.value == formik.values.departmentId
                              ) : null
                          }
                          placeholder="Select Department"
                          name="departmentId"
                          isMulti={formik.values.isSupportTeam === "1"} // Multi-select if isSupportTeam is "1"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              cursor: "pointer",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              cursor: "pointer",
                            }),
                            option: (provided) => ({
                              ...provided,
                              cursor: "pointer",
                            }),
                          }}
                        />

                        {formik.errors.departmentId &&
                          formik.touched.departmentId && (
                            <div className="text-danger">
                              {formik.errors.departmentId}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {formik.values.isCoreTeam === "1" ||
                (formik.values.departmentId && formik.values.isSupportTeam) ? (
                <div className="col-lg-12 mb-3">
                  <div>
                    <Label htmlFor="tasksTitle-field" className="form-label">
                      {" "}
                      Role{" "}
                    </Label>
                    <Select
                      id="role"
                      options={roleOptions}
                      onChange={(option) =>
                        formik.setFieldValue(
                          "roleId",
                          option ? parseInt(option.value) : null
                        )
                      }
                      isDisabled={
                        (!createPermission && !editPermission) ||
                        (updateId && !editPermission)
                      }
                      value={
                        formik.values.roleId
                          ? roleOptions.find(
                            (option) => option.value === formik.values.roleId
                          )
                          : null
                      }
                      placeholder="Select Role"
                      name="roleId"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                        option: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                      }}
                    />
                    {formik.errors.roleId && formik.touched.roleId && (
                      <div className="text-danger">
                        {" "}
                        {formik.errors.roleId}{" "}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              {updateId && (
                <div className="col-lg-12 mb-3">
                  <div>
                    <Label htmlFor="tasksTitle-field" className="form-label">
                      {" "}
                      Status{" "}
                    </Label>
                    <Select
                      value={
                        statusOptions.find(
                          (option) => option.value === formik.values.status
                        ) || null
                      }
                      onChange={(option) =>
                        formik.setFieldValue(
                          "status",
                          option ? option.value : ""
                        )
                      }
                      isDisabled={
                        (!createPermission && !editPermission) ||
                        (updateId && !editPermission)
                      }
                      options={statusOptions}
                      placeholder="Select Status"
                      name="status"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                        option: (provided) => ({
                          ...provided,
                          cursor: "pointer",
                        }),
                      }}
                    />
                    {formik.errors.status && formik.touched.status && (
                      <div className="text-danger">{formik.errors.status}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {((!updateId && createPermission) ||
              (updateId && editPermission)) && (
                <div className="modal-footer">
                  <Button
                    className=" btn btn-primary "
                    type="submit"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="fs-13"
                        />
                        <span className="fs-13"> Submitting... </span>
                      </>
                    ) : (
                      <span className="fs-13"> Submit </span>
                    )}
                  </Button>
                </div>
              )}
          </form>
        </SimpleBar>
      </div>
    </Offcanvas>
  );
};
export default UserAddUpdateModal;
