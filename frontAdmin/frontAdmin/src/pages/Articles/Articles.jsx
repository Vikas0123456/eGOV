import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import * as Yup from "yup";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
// import KnowledgeBaseModal from "./KnowledgeBaseModal";
import {
  hasCreatePermission,
  hasDeletePermission,
  hasEditPermission,
  hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../utils/hook/useAxios";

const KnowledgeBase = () => {
  const axiosInstance = useAxios()
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState();
  const [orderBy, setOrderBy] = useState();
  const [sortOrder, setSortOrder] = useState("desc");
  // add update modal
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [id, setId] = useState();
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPageSize, setPerPageSize] = useState(25);
  const totalPages = Math.ceil(totalCount / perPageSize);
  // upload Image
  const [selectedFile, setSelectedFile] = useState(null);
  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const EventPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find(
      (module) => module.slug === "knowledgebase"
    );
  const viewPermissions = EventPermissions
    ? hasViewPermission(EventPermissions)
    : false;
  const createPermission = EventPermissions
    ? hasCreatePermission(EventPermissions)
    : false;
  const editPermission = EventPermissions
    ? hasEditPermission(EventPermissions)
    : false;
  const deletePermission = EventPermissions
    ? hasDeletePermission(EventPermissions)
    : false;

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const allowedFormats = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      const maxSize = 1024 * 1024; // 1MB in bytes
      if (selectedFile.size > maxSize) {
        event.target.value = null;
        formik.setFieldError(
          "documentFile",
          "Please select an image file that is less than 1MB."
        );
        return; // Exit the function if size exceeds the limit
      }

      if (allowedFormats.includes(selectedFile.type)) {
        formik.setFieldValue("documentFile", selectedFile);
        setSelectedFile(selectedFile);
        formik.setFieldError("documentFile", "");
      } else {
        event.target.value = null;
        formik.setFieldError(
          "documentFile",
          "Please select a valid image file (JPEG, JPG, or PNG)."
        );
      }
    }
  };

  const handleShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setId();
    setSelectedFile(null);
    formik.resetForm();
    formik.setErrors({});
  };

  const fetchKnowledgeBaseList = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/knowledgebase/view`,
        {
          page: currentPage,
          perPage: perPageSize,
          sortOrder: sortOrder,
          orderBy: orderBy,
        }
      );

      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(count);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const listOfKnowledgeBaseSearch = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/knowledgebase/view`,
        {
          page: currentPage,
          perPage: perPageSize,
          searchFilter: searchQuery,
          sortOrder: sortOrder,
          orderBy: orderBy,
        }
      );

      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setData(rows);
        setTotalCount(rows);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        listOfKnowledgeBaseSearch();
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder]);

  useEffect(() => {
    if (!searchQuery) {
      fetchKnowledgeBaseList();
    }
  }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder]);

  const handleSelectPageSize = (e) => {
    setCurrentPage(1);
    setPerPageSize(parseInt(e.target.value, 10));
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
    setPerPageSize(25);
    setSearchQuery("");
  };

  const addKnowledgeBase = async (values) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `userService/knowledgebase/create`,
        {
          ...values,
        }
      );
      if (response) {
        toast.success("KnowledgeBase added successfully.");
        listOfKnowledgeBaseSearch();
        handleClose();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error, "Something went wrong while add new KnowledgeBase");
    }
  };

  const updateKnowledgeBase = async (id, values) => {
    try {
      if (id) {
        setLoading(true);
        const response = await axiosInstance.put(
          `userService/knowledgebase/update`,
          {
            id: id,
            ...values,
          }
        );
        if (response) {
          toast.success("KnowledgeBase updated successfully.");
          listOfKnowledgeBaseSearch();
          handleClose();
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("No changes were made.");
      console.error("Something went wrong while update KnowledgeBase");
    }
  };

  const deleteKnowledgeBase = async (deleteId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this KnowledgeBase!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#303e4b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `userService/knowledgebase/delete`,
          {
            id: deleteId,
            // isDeleted: "1",
          }
        );
        if (response) {
          toast.success(`KnowledgeBase deleted successfully.`);
          fetchKnowledgeBaseList();
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        toast.error(`Failed to delete KnowledgeBase.`);
        console.error(error);
      }
    }
  };

  const handleSorting = (value) => {
    setOrderBy(value);
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .min(5, "Please enter title 5 charcter long")
      .required("Please enter title"),
    description: Yup.string().required("Please enter description"),
    departmentId: Yup.number(),
    status: Yup.string().required("Please select status"),
  });
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      departmentId: null,
      status: "1",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (id) {
        updateKnowledgeBase(id, values);
      } else {
        addKnowledgeBase(values);
      }
    },
  });

  const updateKnowledgeBasePrefilledData = async (data) => {
    if (data) {
      setId(data?.id);
      formik.setValues({
        ...formik.values,
        title: data.title || "",
        description: data.description || "",
        departmentId: data.departmentId || null,
        status: data.status || "",
      });
    }
    setShow(true);
  };

  const extractText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getTruncatedTextFromHTML = (html, length) => {
    const text = extractText(html);
    return truncateText(text, length);
  };

  document.title = "Articles | eGov Solution"

  return (
    <div>
      <div id="layout-wrapper">
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0">Knowledge Base</h4>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 pe-4">
                <div className="row">
                  <div className="col-xxl-12 mb-3">
                    <div className="card border-0">
                      <div className="card-body border-0">
                        <div className="row">
                          <div className="flex-grow-1 ms-auto d-flex align-items-center justify-content-between col-12 col-sm-6">
                            <div className="d-flex align-items-center">
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

                              <button
                                type="button"
                                className="btn btn-primary bg-light border-light ms-3 text-muted d-flex align-items-center"
                                onClick={resetFilters}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-refresh-ccw icon-xs me-2 text-muted d-none d-sm-inline"
                                >
                                  <polyline points="1 4 1 10 7 10"></polyline>
                                  <polyline points="23 20 23 14 17 14"></polyline>
                                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                <span>Reset</span>
                              </button>
                            </div>
                          </div>
                          {createPermission && (
                            <div className="d-flex align-items-center col-12 col-sm-6 mt-3 mt-sm-0 justify-content-sm-end justify-content-center">
                              <button
                                type="button"
                                className="btn btn-primary ms-3"
                                id="create-btn"
                                onClick={handleShow}
                              >
                                Add Knowledge Base
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-12">
                    <div className="card border-0 mb-0">
                      <div className="card-body pb-0">
                        <div className="table-responsive table-card mb-0">
                          <table
                            className="table align-middle table-nowrap mb-0 com_table"
                            id="tasksTable"
                          >
                            <thead>
                              <tr>
                                <th
                                  className="fw-bold"
                                  onClick={() => handleSorting("title")}
                                >
                                  Title{" "}
                                  <span>
                                    <BiSortAlt2 />
                                  </span>
                                </th>
                                <th
                                  className="fw-bold"
                                  onClick={() => handleSorting("description")}
                                >
                                  Description{" "}
                                  <span>
                                    <BiSortAlt2 />
                                  </span>
                                </th>
                                <th className="fw-bold">Status</th>
                                {(deletePermission || editPermission) && (
                                  <th className="fw-bold">Action</th>
                                )}
                              </tr>
                            </thead>
                            {data && data?.length === 0 && (
                              <tbody>
                                <tr>
                                  <td colSpan="7" className="text-center">
                                    No records found.
                                  </td>
                                </tr>
                              </tbody>
                            )}
                            {data &&
                              data?.map((knowledgeBase, index) => (
                                <tbody key={index}>
                                  <tr>
                                    <td style={{ width: "300px", whiteSpace: "normal", }} >
                                      <div>
                                        <div className="d-flex align-items-center">
                                          <div className="fw-semibold text-black">
                                            {knowledgeBase.title}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="time text-muted mb-0" style={{ fontSize: "12px", width: "150px", whiteSpace: "normal", }} >
                                      {getTruncatedTextFromHTML(knowledgeBase.description, 250)}
                                    </td>
                                    <td style={{ width: "150px" }} className="status-update text-success fw-bold" >
                                      {knowledgeBase.status === "1" ? (
                                        <div className="badge badge-soft-success fs-12" >
                                          <i className="ri-checkbox-circle-line align-bottom " ></i>{" "}
                                          {knowledgeBase.status === "1" ? "Active" : "In-Active"}
                                        </div>
                                      ) : (
                                        <div className="badge badge-soft-warning text-warning fs-12" >
                                          <i className="ri-close-circle-line align-bottom " ></i>{" "}
                                          {knowledgeBase.isActive === "1" ? "Active" : "In-Active"}
                                        </div>
                                      )}
                                    </td>
                                    {(deletePermission || editPermission) && (
                                      <td style={{ width: "100px" }}>
                                        <span>
                                          {deletePermission && (
                                            <span onClick={() => { deleteKnowledgeBase(knowledgeBase.id); }} >
                                              <RiDeleteBinLine className="me-4" />
                                            </span>
                                          )}
                                          {editPermission && (
                                            <span onClick={() => updateKnowledgeBasePrefilledData(knowledgeBase)} >
                                              <FiEdit2 />
                                            </span>
                                          )}
                                        </span>
                                      </td>
                                    )}
                                  </tr>
                                </tbody>
                              ))}
                          </table>
                        </div>
                      </div>
                      <Pagination
                        totalCount={totalCount}
                        perPageSize={perPageSize}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handleSelectPageSize={handleSelectPageSize}
                        handlePageChange={handlePageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <KnowledgeBaseModal
          show={show}
          handleClose={handleClose}
          updateId={id}
          formik={formik}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleImageUpload={handleImageUpload}
          loading={loading}
        /> */}
      </div>
    </div>
  );
};

export default KnowledgeBase;
