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
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { format } from "date-fns";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import EmailTemplateEditModal from "./EmailTemplateEditModal";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import { Eye, RefreshCcw } from "feather-icons-react/build/IconComponents";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
const BlankData = process.env.REACT_APP_BLANK;
const EmailTemplate = () => {
    const axiosInstance = useAxios();
    // table data filter search sort
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    // userData
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const Permissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "emailtemplate"
        );
    const viewPermissions = Permissions
        ? hasViewPermission(Permissions)
        : false;
    const createPermission = Permissions
        ? hasCreatePermission(Permissions)
        : false;
    const editPermission = Permissions ? hasEditPermission(Permissions) : false;
    const deletePermission = Permissions
        ? hasDeletePermission(Permissions)
        : false;

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        formik.resetForm();
        formik.setErrors({});
    };

    const fetchTemplateList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/emailtemplate/view`,
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
                `userService/emailtemplate/view`,
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
                setTotalCount(count);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                listOfSearch();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder]);

    useEffect(() => {
        if (!searchQuery) {
            fetchTemplateList();
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
            document
                .querySelector(".pagination-next")
                .classList.add("disabled");
        } else {
            document
                .querySelector(".pagination-next")
                .classList.remove("disabled");
        }

        if (page === 1) {
            document
                .querySelector(".pagination-prev")
                .classList.add("disabled");
        } else {
            document
                .querySelector(".pagination-prev")
                .classList.remove("disabled");
        }
    };

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
    };

    const updateBlockedIp = async (id, values) => {
        try {
            if (id) {
                setLoading(true);

                const response = await axiosInstance.put(
                    `userService/emailtemplate/update`,
                    {
                        id: id,
                        ...values,
                    }
                );
                if (response) {
                    toast.success("Email template updated successfully.");
                    fetchTemplateList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message);
            console.error(error.response.data.message, "dhcgbf");
        }
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };
    const initialValues = {
        title: "",
        subject: "",
        userId: userId,
        content: "",
    };

    const validationSchema = Yup.object({
        title: Yup.string()
            .min(5, "Please enter title atleast 5 character long")
            .required("Please enter title"),
        subject: Yup.string().required("Please enter subject"),
        userId: Yup.number(),
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateBlockedIp(id, values);
            }
        },
    });

    const updateBannerPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                title: data.title || "",
                subject: data.subject || "",
                content: data.content || "",
            });
        }
        setShow(true);
    };

    document.title = "Email Template | eGov Solution";

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
                                        <h4 className="mb-sm-0">
                                            Email Templates
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xxl-12">
                                <div className="card border-0">
                                    <div className="card-body border-0">
                                        <div className="row">
                                            <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4  col-xxl-2 mb-3    mb-sm-0 ">
                                                <div className="search-box">
                                                    <input
                                                        type="text"
                                                        className="form-control search bg-light border-light"
                                                        placeholder="Search"
                                                        value={searchQuery}
                                                        onChange={(e) =>
                                                            handleInputSearch(e)
                                                        }
                                                    />
                                                    <i className="ri-search-line search-icon"></i>
                                                </div>
                                            </div>
                                            <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4  col-xxl-2 d-flex  justify-content-end ms-auto">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center  "
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
                            <div className="col-xxl-12">
                                <div className="card border-0 mb-0">
                                    <div className="card-body pb-0">
                                        <div className="table-responsive table-card mb-0">
                                            {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                                                <table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable"
                                                >
                                                    <thead className="bg-white">
                                                        <tr>
                                                            <th
                                                                className="fw-bold cursor-pointer"
                                                                onClick={() =>
                                                                    handleSorting(
                                                                        "title"
                                                                    )
                                                                }
                                                            >
                                                                Email Template
                                                                <span>
                                                                    <BiSortAlt2 />
                                                                </span>
                                                            </th>
                                                            <th
                                                                className="fw-bold cursor-pointer"
                                                                onClick={() =>
                                                                    handleSorting(
                                                                        "createdDate"
                                                                    )
                                                                }
                                                            >
                                                                Created Date
                                                                <span>
                                                                    <BiSortAlt2 />
                                                                </span>
                                                            </th>
                                                            <th
                                                                className="fw-bold cursor-pointer"
                                                                onClick={() =>
                                                                    handleSorting(
                                                                        "updateDate"
                                                                    )
                                                                }
                                                            >
                                                                Last Update
                                                                <span>
                                                                    <BiSortAlt2 />
                                                                </span>
                                                            </th>
                                                            {editPermission && (
                                                                <th className="fw-bold">
                                                                    Action
                                                                </th>
                                                            )}
                                                        </tr>
                                                    </thead>

                                                    {isLoading ? (
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center"
                                                                >
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    ) : data?.length === 0 ? (
                                                        <tbody>
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center"
                                                                >
                                                                    <NotFound
                                                                        heading="Email Templates not found."
                                                                        message="Unfortunately, email templates not available at the moment."
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    ) : (
                                                        data?.map(
                                                            (data, index) => (
                                                                <tbody
                                                                    key={index}
                                                                >
                                                                    <tr>
                                                                        <td
                                                                            style={{
                                                                                width: "300px",
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="fw-semibold text-black">
                                                                                        {data.title ||
                                                                                            BlankData}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "300px",
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="fw-semibold text-black">
                                                                                        {data?.createdDate
                                                                                            ? format(
                                                                                                  new Date(
                                                                                                      data?.createdDate
                                                                                                  ),
                                                                                                  "dd MMM, yyyy - h:mm a"
                                                                                              )
                                                                                            : BlankData}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "300px",
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <div className="d-flex align-items-center">
                                                                                    <div className="fw-semibold text-black">
                                                                                        {data?.updateDate
                                                                                            ? format(
                                                                                                  new Date(
                                                                                                      data?.updateDate
                                                                                                  ),
                                                                                                  "dd MMM, yyyy - h:mm a"
                                                                                              )
                                                                                            : BlankData}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        {viewPermissions &&
                                                                            !editPermission && (
                                                                                <td
                                                                                    style={{
                                                                                        width: "100px",
                                                                                    }}
                                                                                >
                                                                                    <span
                                                                                        title="Edit"
                                                                                        onClick={() =>
                                                                                            updateBannerPrefilledData(
                                                                                                data
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Eye
                                                                                            width="18"
                                                                                            height="18"
                                                                                            className="text-primary "
                                                                                        />
                                                                                    </span>
                                                                                </td>
                                                                            )}
                                                                        {editPermission && (
                                                                            <td
                                                                                style={{
                                                                                    width: "100px",
                                                                                }}
                                                                            >
                                                                                <span
                                                                                    title="Edit"
                                                                                    onClick={() =>
                                                                                        updateBannerPrefilledData(
                                                                                            data
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FiEdit2 className="cursor-pointer" />
                                                                                </span>
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                </tbody>
                                                            )
                                                        )
                                                    )}
                                                </table>
                                            {/* </SimpleBar> */}
                                        </div>
                                    </div>
                                    <Pagination
                                        totalCount={totalCount}
                                        perPageSize={perPageSize}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        handleSelectPageSize={
                                            handleSelectPageSize
                                        }
                                        handlePageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <EmailTemplateEditModal
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    loading={loading}
                    viewPermissions={viewPermissions}
                    editPermission={editPermission}
                />
            </div>

            <ScrollToTop />
        </>
    );
};

export default EmailTemplate;
