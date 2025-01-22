import React, { useEffect, useState } from "react";
import Card from "./Card";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Select from "react-select";
import * as Yup from "yup";
import Pagination from "../../CustomComponents/Pagination";
import UserAddUpdateModal from "../AccessRights/Roles/Users/UserModal";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import {
  hasCreatePermission,
  hasDeletePermission,
  hasEditPermission,
  hasViewPermission,
} from "../../common/CommonFunctions/common";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import errorImage from "../../assets/images/error.gif";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useSelector } from "react-redux";

const Directory = () => {
  const axiosInstance = useAxios()
  // table data filter search sort
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id;
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // add update modal
  const [isCoreteam, setIscoreteam] = useState(false);
  const [show, setShow] = useState(false);
  const [id, setId] = useState();
  const [listofRoleBydept, setListofRoleByDept] = useState([]);
  // dropdown department data
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState();
  const [perPageSize, setPerPageSize] = useState(12);
  const totalPages = Math.ceil(totalCount / perPageSize);
  //loader
  const [isLoading, setIsLoading] = useState(true);
  // upload Image
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const getIpInfo = useSelector((state) => state?.Layout?.ipData);
  const ipAddress = getIpInfo?.ip;

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const allowedFormats = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const fileSizeLimit = 1024 * 1024;

    if (!allowedFormats.includes(selectedFile.type)) {
      formik.setFieldError(
        "documentFile",
        "Please select a valid image file (JPEG, JPG, PNG, or WEBP)."
      );
      event.target.value = null;
      return;
    }

    if (selectedFile.size > fileSizeLimit) {
      formik.setFieldError(
        "documentFile",
        "Please select an image file that is less than 1MB."
      );
      event.target.value = null;
      return;
    }

    formik.setFieldValue("documentFile", selectedFile);
    setSelectedFile(selectedFile);
    formik.setFieldError("documentFile", "");
  };

  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const UserPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find(
      (module) => module.slug === "directory"
    );
  const viewPermissions = UserPermissions
    ? hasViewPermission(UserPermissions)
    : false;
  const createPermission = UserPermissions
    ? hasCreatePermission(UserPermissions)
    : false;
  const editPermission = UserPermissions
    ? hasEditPermission(UserPermissions)
    : false;
  const deletePermission = UserPermissions
    ? hasDeletePermission(UserPermissions)
    : false;
  const handleClose = () => {
    setShow(false);
    setId();
    setSelectedFile(null);
    formik.resetForm();
    formik.setErrors({});
    // setIscoreteam(false);
  };

  const fetchDirectoryList = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `userService/user/directory/list`,
        {
          page: currentPage,
          perPage: perPageSize,
          departmentId:
                    userData?.isCoreTeam === "0"
                        ? (userData?.departmentId || "").split(',').map(id => id.trim()).filter(Boolean)
                        : selectedDepartment ? [selectedDepartment] : [],
        }
      );

      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(count);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error.message);
    }
  };
  const listOfSearch = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `userService/user/directory/list`,
        {
          page: currentPage,
          perPage: perPageSize,
          searchFilter: searchQuery,
          departmentId:
                    userData?.isCoreTeam === "0"
                        ? (userData?.departmentId || "").split(',').map(id => id.trim()).filter(Boolean)
                        : selectedDepartment ? [selectedDepartment] : [],
        }
      );

      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(count);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error.message);
    }
  };
  const listOfDepartments = async () => {
    try {
      const response = await axiosInstance.post(
        `serviceManagement/department/view`,
        {}
      );
      if (response?.data) {
        const { rows } = response?.data?.data;
        setDepartmentList(rows);
      }
    } catch (error) {
      console.error("No results found for the given search query.");
    }
  };

  const listOfRolesByDepartment = async (departmentId) => {
    try {
      const response = await axiosInstance.post(`userService/roles/view`, {
        departmentId: departmentId?.split(',').map(id => id.trim()),
      });
      if (response?.data) {
        const { rows } = response?.data?.data;
        setListofRoleByDept(rows);
      }
    } catch (error) {
      console.error("No results found for the given search query.");
    }
  };

  const listOfRolesByCoreaTeam = async (isCoreTeam) => {
    try {
      const response = await axiosInstance.post(`userService/roles/view`, {
        isCoreTeam: isCoreTeam,
      });
      if (response?.data) {
        const { rows } = response?.data?.data;
        setListofRoleByDept(rows);
      }
    } catch (error) {
      console.error("No results found for the given search query.");
    }
  };

  const listOfRolesBySupportTeam = async (isSupportTeam) => {
    try {
        const response = await axiosInstance.post(
            `userService/roles/view`,
            {
                isSupportTeam: isSupportTeam,
            }
        );
        if (response?.data) {
            const { rows } = response?.data?.data;
            setListofRoleByDept(rows);
        }
    } catch (error) {
        console.error("No results found for the given search query.");
    }
};

  useEffect(() => {
    listOfDepartments();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        listOfSearch();
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedDepartment, currentPage, perPageSize]);

  useEffect(() => {
    if (!searchQuery) {
      fetchDirectoryList();
    }
  }, [searchQuery, selectedDepartment, currentPage, perPageSize]);

  const handleSelectPageSize = (e) => {
    setCurrentPage(1);
    setPerPageSize(parseInt(e.target.value, 12));
  };
  const handleDepartmentSearch = (e) => {
    setCurrentPage(1);
    if (e) {
      setSelectedDepartment(e);
    } else {
      setSelectedDepartment("")
    }
  };
  const handleInputSearch = (e) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }
    setCurrentPage(page);

    if (page === totalPages) {
      document.querySelector(".pagination-next").classList.add("disabled");
    } else {
      document.querySelector(".pagination-next").classList.remove("disabled");
    }

    if (page === 1) {
      document.querySelector(".pagination-prev").classList.add("disabled");
    } else {
      document.querySelector(".pagination-prev").classList.remove("disabled");
    }
  };

  const resetFilters = async () => {
    setCurrentPage(1);
    setPerPageSize(12);
    setSearchQuery("");
    setSelectedDepartment("");
  };

  const updateUser = async (id, values) => {
    try {
      if (id) {
        setLoading(true);
        let fileId = null;
        if (selectedFile) {
          const formData = new FormData();
          formData.append("viewDocumentName", values?.name);
          formData.append("documentFile", values?.documentFile);
          formData.append("userId", userId);
          formData.append("isGenerated", "0");
          formData.append("isShowInDocument", "0");
          const fileResponse = await axiosInstance.post(
            "documentService/uploading",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          fileId = fileResponse?.data?.data
            ? fileResponse?.data?.data?.[0]?.id
            : null;
        }
        const response = await axiosInstance.put(`userService/user/update`, {
          id: id,
          ...values,
          profileImageId: fileId ? fileId : formik.values.profileImageId,
          documentFile: undefined,
          customerId: undefined,
          imageData: undefined,
          ipAddress: ipAddress,
        });
        if (response) {
          toast.success("User updated successfully.");
          fetchDirectoryList();
          handleClose();
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong while update user");
      console.error("Something went wrong while update user");
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter name"),
    email: Yup.string()
      .email("Please enter valid email")
      .required("Please enter email"),
    phone: Yup.string()
      .matches(
        /^\d{10,}$/,
        "Please enter at least 10 digit. Only digits are allowed"
      )
      .required("Please enter phone number"),
    profileImageId: Yup.number(),
    isSupportTeam: Yup.string().required("Please select is support team member"),
    isCoreTeam: Yup.string()
    .test('isCoreTeam', 'Please select core team', function (value) {
        const { isSupportTeam } = this.parent;
        return isSupportTeam !== '0' || (isSupportTeam === '0' && !!value);
      }),
    departmentId: Yup.string()
    .test('departmentId', 'Please select department', function (value) {
        const { isCoreTeam } = this.parent;
        return isCoreTeam !== '0' || (isCoreTeam === '0' && !!value);
        }),
    roleId: Yup.number().required("Please select role"),
    documentFile: selectedFile
      ? Yup.mixed()
      : Yup.mixed().required("Please upload a user image"),
    customerId: Yup.number(),
  });
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      profileImageId: "",
      isSupportTeam : "",
      isCoreTeam: userData?.isCoreTeam === "0" ? "0" : "",
      departmentId:
                userData?.isCoreTeam === "0"
                    ? userData?.departmentId
                    : undefined,
      roleId: "",
      documentFile: "",
      customerId: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (id) {
        updateUser(id, values);
      }
    },
  });
  const updateUserPrefilledData = (data) => {
    setShow(true);
    if (data) {
      setId(data?.id);
      formik.setValues({
        ...formik.values,
        name: data?.name || "",
        email: data?.email || "",
        phone: data?.phone || "",
        profileImageId: data?.profileImageId || "",
        isSupportTeam : data?.isSupportTeam || "",
        isCoreTeam: data?.isCoreTeam || "",
        departmentId: data?.departmentId || undefined,
        roleId: data?.roleId || "",
        status: data?.status || "",
        documentFile: data?.profileImageId || "",
        imageData: data?.imageData || "",
      });
    }
  };

  useEffect(() => {
    if (formik.values.departmentId && formik.values.isSupportTeam === "0") {
      listOfRolesByDepartment(formik.values.departmentId);
    }
  }, [formik.values.departmentId, formik.values.isSupportTeam]);

  useEffect(() => {
    if (formik.values.isCoreTeam === "1") {
      listOfRolesByCoreaTeam(formik.values.isCoreTeam);
      // setIscoreteam(true);
    }
  }, [formik.values.isCoreTeam]);

  useEffect(() => {
    if (formik.values.isSupportTeam === "1") {
        listOfRolesBySupportTeam(formik.values.isSupportTeam);
        // setIscoreteam(true);
    }
  }, [formik.values.isSupportTeam]);
  

  const departmentOptions =
    departmentList && departmentList.length > 0 &&
    [{ value: "", label: "Select Department*" }, ...departmentList.map((department) => ({
      value: department.id,
      label: department.departmentName,
    }))]

  document.title = "Directory | eGov Solution";

  return (
    <>

      <div id="layout-wrapper">
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                <DepartmentUserInfo />
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0"> Directory </h4>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xxl-12">
                  <div className="card border-0">
                    <div className="card-body border-0">
                      <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-md-0">
                          <div className="search-box">
                            <input
                              type="text"
                              className="form-control search bg-light border-light"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={(e) => handleInputSearch(e)}
                            />
                            <i className="ri-search-line search-icon"></i>
                          </div>
                        </div>
                        {userData && userData?.isCoreTeam !== "0" && (
                          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0 mb-md-3 mb-lg-0 mb-xl-0">
                            <div className=" input-light">
                              <Select
                                className="bg-choice"
                                data-choices
                                name="choices-single-default"
                                id="idStatus"
                                value={
                                  selectedDepartment
                                    ? departmentOptions.find(
                                      (option) =>
                                        option.value === selectedDepartment
                                    )
                                    : null
                                }
                                onChange={(option) =>
                                  handleDepartmentSearch(option.value)
                                }
                                placeholder="Select Department*"
                                options={departmentOptions}
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
                            </div>
                          </div>
                        )}
                        <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6  col-xxl-2 mb-3 mb-sm-0   mb-md-3 mb-lg-0 mb-xl-0">
                          <button
                            type="button"
                            className="btn btn-primary btn-label bg-warning border-warning "
                            onClick={resetFilters}
                          >
                            <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <LoaderSpin />
                ) : data.length === 0 ? (
                  <NotFound heading="Directory not found." message="Unfortunately, directory not available at the moment." />

                ) : (
                  data?.map((users) => (
                    <Card
                      key={users.id}
                      userImage={users?.imageData?.documentPath}
                      name={users?.name}
                      departmentName={users?.departmentName}
                      phone={users?.phone}
                      email={users?.email}
                      onClick={() => updateUserPrefilledData(users)}
                      editPermission={editPermission}
                      viewPermissions={viewPermissions}
                    />
                  ))
                )}



              </div>
              <Pagination
                totalCount={totalCount}
                perPageSize={perPageSize}
                currentPage={currentPage}
                totalPages={totalPages}
                handleSelectPageSize={handleSelectPageSize}
                handlePageChange={handlePageChange}
                isCard={true}
              />

            </div>
          </div>
        </div>
        <UserAddUpdateModal
          show={show}
          handleClose={handleClose}
          updateId={id}
          formik={formik}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleImageUpload={handleImageUpload}
          departmentList={departmentList}
          userData={userData}
          listofRoleBydept={listofRoleBydept}
          loading={loading}
          viewPermissions={viewPermissions}
          editPermission={editPermission}
        />
      </div>

      <ScrollToTop />
    </>
  );
};

export default Directory;
