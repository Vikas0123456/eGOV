import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { toast } from "react-toastify";
// import FeedIcon from "@mui/icons-material/Feed";
import Pagination from '../../CustomComponents/Pagination';
import Loader,{LoaderSpin} from '../../common/Loader/Loader';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import SimpleBar from "simplebar-react";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import { decrypt } from '../../utils/encryptDecrypt/encryptDecrypt';
import { Eye, RefreshCcw } from 'feather-icons-react/build/IconComponents';
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import NotFound from '../../common/NotFound/NotFound';
import useAxios from '../../utils/hook/useAxios';
const BlankData = process.env.REACT_APP_BLANK;
const FormBuilderList = () => {
    const axiosInstance = useAxios()
    const navigate = useNavigate()
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("DESC");

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const UserPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find((module) => module.slug === "formbuilder");
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


    // add update modal
    const [loading, setLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const handleSelectPageSize = (e) => {
        setCurrentPage(1);
        setPerPageSize(parseInt(e.target.value, 10));
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
    const fetchFormtList = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/form/list`,
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
                setLoading(false);
                setTotalCount(count);
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };
    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
    };
    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };
    useEffect(() => {
        if (!searchQuery) {
            fetchFormtList()
        }
    }, [searchQuery, currentPage, perPageSize, orderBy, sortOrder])

    const listOfSearch = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/form/list`,
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
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
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

    const handleEditClick = async (formData) => {
        if (formData) {
            navigate("/formbuilder", {
                state: formData,
            });
        }

    }
    const handleNewFormClick = () => {
        navigate("/formbuilder")
    }

    const deleteFormByiId = async (formId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this form!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `serviceManagement/form/delete`,
                    {
                        formId: formId,
                    }
                );
                if (response) {
                    toast.success(`Form deleted successfully.`);
                    fetchFormtList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete banner.`);
                console.error(error);
            }
        }
    }

    document.title = "Form Builder | eGov Solution"

    return (
       
        <div className="page-content">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-12  d-sm-flex align-items-center justify-content-between">
                        <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                            <h4 className="mb-sm-0">Form Builder</h4>
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
                                {
                                    createPermission && (
                                        <div className="d-flex col-6 col-sm-8 mt-3 mt-sm-0 justify-content-sm-end ">
                                            <Button variant="primary" onClick={handleNewFormClick} className="btn btn-primary btn-label me-3  text-nowrap" >
                                                <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                Create New Form
                                            </Button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card border-0 mb-0">
                    <div className="card-body pb-0">
                        <div className="table-responsive table-card mb-0">
                            {/* <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}> */}
                                <table
                                    className="table align-middle table-nowrap mb-0 com_table"
                                    id="tasksTable"
                                >
                                    <thead className="bg-white">
                                        <tr className="text-capitalize">
                                            <th className=" " data-sort="id">
                                                Name
                                            </th>
                                            <th>Slug</th>
                                            {(deletePermission || editPermission) && (
                                                <th
                                                    className=" text-center"
                                                    data-sort="status"
                                                    style={{ width: "150px" }}
                                                >
                                                    Action
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="list form-check-all">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    <LoaderSpin />
                                                </td>
                                            </tr>
                                        ) : data?.length === 0 ? (<tr>
                                            <td colSpan="6" className="text-center">
                                                <NotFound heading="Form Builder not found." message="Unfortunately, form builder not available at the moment." />
                                            </td>
                                        </tr>) : (
                                            data?.map((formData) => (
                                                <tr key={formData.id}>
                                                    <td style={{ width: "300px" }}>
                                                        <div className="flex-grow-1">
                                                            {formData.formName || BlankData}
                                                        </div>
                                                    </td>
                                                    <td style={{ width: "300px" }}>
                                                        <div className="flex-grow-1">
                                                            {" "}
                                                            {formData.formSlug || BlankData}
                                                        </div>
                                                    </td>


                                                    <td
                                                        className="status text-center"
                                                        style={{ width: "200px" }}
                                                    >
                                                        <span>
                                                            {viewPermissions &&
                                                                !editPermission && (
                                                                    <span
                                                                        title="view"
                                                                        className="cursor-pointer me-4"
                                                                        onClick={() => handleEditClick(formData)}
                                                                    >
                                                                        <Eye
                                                                            width="16"
                                                                            height="16"
                                                                            className="text-primary"
                                                                        />
                                                                    </span>
                                                                )}

                                                            {editPermission && (
                                                                <span title='Edit'
                                                                    onClick={() => handleEditClick(formData)}
                                                                >
                                                                    <FiEdit2 className="cursor-pointer me-4" />
                                                                </span>
                                                            )}

                                                            {deletePermission && (
                                                                <span title='Delete'
                                                                    onClick={() => {
                                                                        deleteFormByiId(formData.id);
                                                                    }}
                                                                >
                                                                    <RiDeleteBinLine className="cursor-pointer" />
                                                                </span>
                                                            )}

                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                    </tbody>
                                </table>
                            {/* </SimpleBar> */}
                        </div>
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
      

    )
}

export default FormBuilderList
