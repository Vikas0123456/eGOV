import React from "react";
import { Button, Offcanvas, Spinner, Table } from "reactstrap";
import Select from "react-select";
import SimpleBar from "simplebar-react";

const DepartmentRolesModal = ({
  show,
  handleClose,
  isUpdate,
  formik,
  departmentOptions,
  selectedDepartment,
  setSelectedDepartment,
  handleSelectChange,
  handleCheckboxChange,
  loading,
  permissionList,
  areAllAllowedChecked,
  handleAllPermissionsChange,
  userData,
  viewPermissions,
  createPermission,
  editPermission,
}) => {
  const coreTeamOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];
  const supportTeamOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];
  const adminOptions = [
    { value: "1", label: "Yes" },
    { value: "0", label: "No" },
  ];
  return (
    <Offcanvas
      isOpen={show}
      direction="end"
      toggle={handleClose}
      className="container w-100 p-0"
    >
      <div className="bg-white p-4">
        <SimpleBar
          className="bg-light p-3 p-sm-4 vh-100"
          style={{ maxHeight: "calc(100vh - 50px)", overflow: "auto" }}
        >
          <form onSubmit={formik.handleSubmit}>
            <div className="modal-header  mb-3">
              {!isUpdate && createPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Create Role
                </h4>
              )}

              {isUpdate && !editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  View Role
                </h4>
              )}

              {isUpdate && editPermission && (
                <h4 className="modal-title" id="exampleModalgridLabel">
                  Update Role
                </h4>
              )}

              <div className="d-flex justify-content-end align-items-center">
                <span onClick={handleClose} className="btn btn-sm btn-primary">
                  {" "}
                  <i className="ri-close-line me-1 align-middle"></i> Cancel{" "}
                </span>
              </div>
            </div>
            <div className="modal-body">
              {/* Role Name */}
              <div className="row">
                <div className="col-md-6">
                  {formik.values.formData.map((item, index) => (
                    <div className="mb-3" key={index}>
                      <label
                        htmlFor={`role-name-${index}`}
                        className="form-label"
                      >
                        {" "}
                        Role Name{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`role-name-${index}`}
                        placeholder="Enter Role"
                        value={item.role.roleName}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `formData[${index}].role.roleName`,
                            e.target.value
                          )
                        }
                        disabled={
                          (!createPermission && !editPermission) ||
                          (isUpdate && !editPermission)
                        }
                      />
                      {formik?.errors?.role &&
                        formik.touched.formData?.[0]?.role && (
                          <div className="text-danger">
                            {formik?.errors?.role}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
                {userData.isCoreTeam === "0" ? (
                  <></>
                ) : (
                  <>
                    {/* CoreTeam */}
                    <div className="col-md-6">
                      {formik.values.formData.map((item, index) => (
                        <div className="mb-3" key={index}>
                          <label
                            htmlFor={`isCoreTeam-${index}`}
                            className="form-label"
                          >
                            {" "}
                            Core Team{" "}
                          </label>
                          <Select
                            id={`isCoreTeam-${index}`}
                            options={coreTeamOptions}
                            value={
                              coreTeamOptions.find(
                                (option) =>
                                  option.value === item.role.isCoreTeam
                              ) || null
                            }
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
                            onChange={(option) =>{
                              formik.setFieldValue(
                                `formData[${index}].role.isCoreTeam`,
                                option ? option.value : ""
                              )
                              formik.setFieldValue(
                                `formData[${index}].role.departmentId`,
                                []
                              )
                              formik.setFieldValue(
                                `formData[${index}].role.departmentName`,
                                []
                              )
                              formik.setFieldValue(
                                `formData[${index}].role.isAdmin`,
                                "0"
                              )
                              setSelectedDepartment(null)
                            }}
                            isDisabled={
                              item?.role?.roleId
                                ? true
                                : false ||
                                  (!createPermission && !editPermission)
                            }
                            placeholder="Select Core Team"
                          />
                          {formik?.errors?.isCoreTeam &&
                            formik.touched.formData?.[0]?.role && (
                              <div className="text-danger">
                                {formik?.errors?.isCoreTeam}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  
                    {formik.values.formData?.[0].role.isCoreTeam === "0" && (
                    <>
                    {/* SupportTeam */}
                    <div className="col-md-6">
                      {formik.values.formData.map((item, index) => (
                        <div className="mb-3" key={index}>
                          <label
                            htmlFor={`isSupportTeam-${index}`}
                            className="form-label"
                          >
                            {" "}
                            Support Team{" "}
                          </label>
                          <Select
                            id={`isSupportTeam-${index}`}
                            options={supportTeamOptions}
                            value={
                              supportTeamOptions.find(
                                (option) =>
                                  option.value === item.role.isSupportTeam
                              ) || null
                            }
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
                            onChange={(option) =>{
                              formik.setFieldValue(
                                `formData[${index}].role.isSupportTeam`,
                                option ? option.value : ""
                              ),
                              formik.setFieldValue(
                                `formData[${index}].role.departmentId`,
                                []
                              )
                              formik.setFieldValue(
                                `formData[${index}].role.departmentName`,
                                []
                              )
                              formik.setFieldValue(
                                `formData[${index}].role.isAdmin`,
                                "0"
                              )
                              setSelectedDepartment(null)
                            }}
                            isDisabled={
                              item?.role?.roleId
                                ? true
                                : false ||
                                  (!createPermission && !editPermission)
                            }
                            placeholder="Select Support Team"
                          />
                          {formik?.errors?.isSupportTeam &&
                            formik.touched.formData?.[0]?.role && (
                              <div className="text-danger">
                                {formik?.errors?.isSupportTeam}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                    {/* Department */}
                    {formik.values.formData?.[0].role.isSupportTeam === "0" && (
                      <>
                      {/* Admin */}
                     <div className="col-md-6">
                     {formik.values.formData.map((item, index) => (
                       <div className="mb-3" key={index}>
                         <label
                           htmlFor={`isAdmin-${index}`}
                           className="form-label"
                         >
                           {" "}
                           Department Admin{" "}
                         </label>
                         <Select
                           id={`isAdmin-${index}`}
                           options={adminOptions}
                           value={
                             adminOptions.find(
                               (option) =>
                                 option.value === item.role.isAdmin
                             ) || null
                           }
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
                           onChange={(option) =>{
                             formik.setFieldValue(
                               `formData[${index}].role.isAdmin`,
                               option ? option.value : ""
                             )
                           }}
                           isDisabled={
                             item?.role?.roleId
                               ? true
                               : false ||
                                 (!createPermission && !editPermission)
                           }
                           placeholder="Select Department Admin"
                         />
                         {formik?.errors?.isAdmin &&
                           formik.touched.formData?.[0]?.role && (
                             <div className="text-danger">
                               {formik?.errors?.isAdmin}
                             </div>
                           )}
                       </div>
                     ))}
                       </div>
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label
                            htmlFor="department"
                            className="form-label d-block"
                          >
                            {" "}
                            Select Department{" "}
                          </label>
                          <Select
                            isMulti={true}
                            options={departmentOptions}
                            placeholder="Select option"
                            value={selectedDepartment}
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
                            onChange={handleSelectChange}
                            isDisabled={
                              formik.values.formData?.[0].role?.roleId
                                ? true
                                : false ||
                                  (!createPermission && !editPermission)
                            }
                          />
                          {formik?.errors?.department &&
                            formik.touched.formData?.[0]?.role && (
                              <div className="text-danger">
                                {formik?.errors?.department}
                              </div>
                            )}
                        </div>
                      </div>
                      </>
                    )}
                    </>
                  )}
                  </>
                )}
              </div>
              {/* Modules and Permissions */}
              <div className="mb-3">
                <div className="table-responsive scrollbar-style">
                  <Table className="table table-hover table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Module &amp; Access</th>
                        <th scope="col">All</th>
                        {permissionList &&
                          permissionList?.map((permission, index) => (
                            <th scope="col" key={index}>
                              {permission?.permissionName}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.formData.map((item, index) =>
                        item.modules.map((module, moduleIndex) => (
                          <tr key={`${index}-${moduleIndex}`}>
                            <td className="fw-medium">{module.moduleName}</td>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input rounded-circle fs-16 ms-0 mt-0 per-check-all"
                                checked={
                                  module?.allowPermissions?.length === 0
                                    ? false
                                    : areAllAllowedChecked(module)
                                }
                                onChange={(e) =>
                                  handleAllPermissionsChange(
                                    index,
                                    moduleIndex,
                                    e.target.checked
                                  )
                                }
                                disabled={
                                  (!createPermission && !editPermission) ||
                                  (isUpdate && !editPermission)
                                }
                              />
                            </td>
                            {permissionList.map((permission) => (
                              <td key={permission.id}>
                                {module.allowPermissions.includes(
                                  permission.id
                                ) && (
                                  <input
                                    type="checkbox"
                                    className="form-check-input rounded-circle fs-16 ms-0 mt-0 cursor-pointer"
                                    checked={module.modulePermissions.includes(
                                      permission.id
                                    )}
                                    onChange={(e) =>
                                      handleCheckboxChange(
                                        index,
                                        moduleIndex,
                                        permission.id,
                                        e.target.checked
                                      )
                                    }
                                    disabled={
                                      (!createPermission && !editPermission) ||
                                      (isUpdate && !editPermission)
                                    }
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                {formik?.errors?.module &&
                  formik.touched.formData?.[0]?.modules && (
                    <div className="text-danger">{formik?.errors?.module}</div>
                  )}
              </div>
            </div>
            {((!isUpdate && createPermission) ||
              (isUpdate && editPermission)) && (
              <div className="modal-footer">
                <Button
                  className="btn btn-primary"
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
export default DepartmentRolesModal;
