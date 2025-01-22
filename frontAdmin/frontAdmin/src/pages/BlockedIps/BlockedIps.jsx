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
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import BlockedIpModal from "./BlockedIpModal";
import Loader,{LoaderSpin} from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
const BlankData = process.env.REACT_APP_BLANK;
const BlockedIps = () => {
    const axiosInstance = useAxios()
    // table data filter search sort
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // upload Image
    const [selectedFile, setSelectedFile] = useState(null);
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
            (module) => module.slug === "blockedIps"
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
        setSelectedFile(null);
        formik.resetForm();
        formik.setErrors({});
    };

    const fetchBlockedIpsList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/blockedIps/view`,
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
                `userService/blockedIps/view`,
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
            fetchBlockedIpsList();
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

    const addBlockedIp = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `userService/blockedIps/create`,
                {
                    ...values,
                }
            );
            if (response) {
                toast.success("BlockedIP added successfully.");
                fetchBlockedIpsList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error(error?.response?.data?.message);
            console.error("Something went wrong while add new blockedIp");
        }
    };

    const updateBlockedIp = async (id, values) => {
        try {
            if (id) {
                setLoading(true);

                const response = await axiosInstance.put(
                    `userService/blockedIps/update`,
                    {
                        id: id,
                        ...values,
                    }
                );
                if (response) {
                    toast.success("BlockedIp updated successfully.");
                    fetchBlockedIpsList();
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
    const deleteBlockedIp = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this blockedIp data!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/blockedIps/delete`,
                    {
                        id: deleteId,
                    }
                );
                if (response) {
                    toast.success(`Ip address deleted successfully.`);
                    fetchBlockedIpsList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete blockedIp.`);
                console.error(error);
            }
        }
    };

    const handleSorting = (value) => {
        setOrderBy(value);
        setSortOrder((prevSortOrder) =>
            prevSortOrder === "asc" ? "desc" : "asc"
        );
    };
    const initialValues = {
        ipAddress: "",
        createdBy: userId,
        isBlocked :"1",
    };

    const validationSchema = Yup.object({
        ipAddress: Yup.string()
            .required("Please enter IP address")
            .matches(
                /^(?!0+\.0+\.0+\.0+$)([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                "Invalid IP address"
            ),
    });

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateBlockedIp(id, values);
            } else {
                addBlockedIp(values);
            }
        },
    });

    const updateBannerPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                ipAddress: data?.ipAddress || "",
                isBlocked:data?.isBlocked
            });
        }
        setShow(true);
    };

    document.title = "Blocked IPs | eGov Solution"

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
                                                BlockedIps
                                            </h4>
                                            <div className="page-title-right">
                                                <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xxl-12 mb-3">
                                    <div className="card border-0">
                                        <div className="card-body border-0">
                                            <div className="row">
                                                <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4  col-xxl-2 mb-3    mb-sm-0 ">
                                                    <div className="search-box">
                                                        <input type="text" className="form-control search bg-light border-light" placeholder="Search" value={searchQuery} onChange={(e) => handleInputSearch(e)} />
                                                        <i className="ri-search-line search-icon"></i>
                                                    </div>
                                                </div>
                                                <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4 col-4  col-xxl-2 ">
                                                    <button type="button" className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center " onClick={resetFilters} >
                                                    <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                    Reset
                                                    </button>
                                                </div>
                                                {createPermission && (

                                                    <div className="col-xl-3 col-lg-2 col-md-4 col-sm-4  col-xxl-2 col-8  ms-auto text-end">
                                                        <button type="button" className="btn btn-primary btn-label text-nowrap " id="create-btn" onClick={handleShow} >
                                                        <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                             Add BlockedIp </button>
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
                                                {/* <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}> */}
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
                                                                            "ipAddress"
                                                                        )
                                                                    }
                                                                >
                                                                    Ip
                                                                    Address{" "}
                                                                    <span>
                                                                        <BiSortAlt2 />
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                    onClick={() =>
                                                                        handleSorting(
                                                                            "isBlocked"
                                                                        )
                                                                    }
                                                                >
                                                                    Blocked
                                                                    <span>
                                                                        <BiSortAlt2 />
                                                                    </span>
                                                                </th>
                                                                <th
                                                                    className="fw-bold cursor-pointer"
                                                                >
                                                                    Created By
                                                                </th>
                                                                {(deletePermission ||
                                                                    editPermission) && (
                                                                        <th className="fw-bold">
                                                                            Action
                                                                        </th>
                                                                    )}
                                                            </tr>
                                                        </thead>
                                                       
                                                             <tbody>
                                                                {isLoading ?(<tr>
                                                        <td colSpan="6" className="text-center">
                                                        <LoaderSpin /> 
                                                        </td>
                                                    </tr>):data?.length ===0 ?(
                                                        <tr>
                                                        <td
                                                            colSpan="6"
                                                            className="text-center"
                                                        >
                                                           <NotFound heading="Blocked IPs not found." message="Unfortunately, blocked IPs not available at the moment." />
                                                        </td>
                                                    </tr>
                                                    ):(
                                                        data?.map((data, index) => (
                                                           
                                                            <tr key={index}>
                                                                <td style={{ width: "300px", }} >
                                                                    <div>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="fw-semibold text-black">
                                                                                {data.ipAddress ||  BlankData}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ width: "300px", }} >
                                                                    <div>
                                                                        <div className="d-flex align-items-center">
                                                                                {data?.isBlocked ===
                                                                                    "1" && (
                                                                                        <div className="badge badge-soft-success badge-outline-success p-2 px-3 pe-none">
                                                                                            {" "}
                                                                                            Yes{" "}
                                                                                        </div>
                                                                                    )}{" "}

                                                                                {data?.isBlocked ===
                                                                                    "0" && (
                                                                                        <div className="badge badge-soft-danger badge-outline-danger p-2 px-3 pe-none">
                                                                                            {" "}
                                                                                            No{" "}
                                                                                        </div>
                                                                                    )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ width: "300px", }} >
                                                                    <div>
                                                                        <div className="d-flex align-items-center">
                                                                            <div className="fw-semibold text-black">
                                                                                {data.createdBy === null ?"Failed Login Attempt":"Manually"}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {(deletePermission ||
                                                                    editPermission) && (
                                                                        <td style={{ width: "100px", }} >
                                                                            <span>
                                                                                {deletePermission && (
                                                                                    <span title="Delete" onClick={() => { deleteBlockedIp(data.id); }} >
                                                                                        <RiDeleteBinLine className="me-4 cursor-pointer" />
                                                                                    </span>
                                                                                )}
                                                                                {editPermission && (
                                                                                    <span title="Edit" onClick={() => updateBannerPrefilledData(data)} >
                                                                                        <FiEdit2 className="me-4 cursor-pointer" />
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </td>
                                                                    )}
                                                            </tr>
                                                       
                                                    )
                                                    )
                                                    )}
                                                        
                                                         </tbody>
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
                                            handlePageChange={
                                                handlePageChange
                                            }
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <BlockedIpModal
                        show={show}
                        handleClose={handleClose}
                        updateId={id}
                        formik={formik}
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        loading={loading}
                    />
                </div>
           
            <ScrollToTop />
        </>
    );
};

export default BlockedIps;
