import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import * as Yup from "yup";
import BannerModal from "./BannerModal";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import Noimage from "../../assets/images/NoImage.jpg";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import {
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../common/CommonFunctions/common";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw, Eye } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";

const BlankData = process.env.REACT_APP_BLANK;
const Banner = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableName = "banner";
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableColumnConfig = tableConfigList?.find(
        (config) => config?.tableName === tableName
    );
    // List of all columns
    const allColumns = ["Title", "Url", "Status"];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Title", "Url", "Status", "Action"] // Define all available columns
        : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

    // table data filter search sort
    const [openColumnModal, setOpenColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderBy, setOrderBy] = useState();
    const [sortOrder, setSortOrder] = useState("desc");
    // add update modal
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    const [bannerConfigData, setBannerConfigData] = useState(null);
    const [isCropping, setIsCropping] = useState(false);
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
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
    const BannerPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "banners"
        );
    const viewPermissions = BannerPermissions
        ? hasViewPermission(BannerPermissions)
        : false;
    const createPermission = BannerPermissions
        ? hasCreatePermission(BannerPermissions)
        : false;
    const editPermission = BannerPermissions
        ? hasEditPermission(BannerPermissions)
        : false;
    const deletePermission = BannerPermissions
        ? hasDeletePermission(BannerPermissions)
        : false;

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const handleAllPermissionsChange = (formIndex, moduleIndex, isChecked) => {
        const allowedPermissions = permissionList.filter((p) =>
            formik.values.formData[formIndex].modules[
                moduleIndex
            ].allowPermissions.includes(p.id)
        );
        const path = `formData[${formIndex}].modules[${moduleIndex}].modulePermissions`;

        let newPermissions = [
            ...formik.values.formData[formIndex].modules[moduleIndex]
                .modulePermissions,
        ];
        if (isChecked) {
            // Add all allowed permissions if not already added
            allowedPermissions.forEach((p) => {
                if (!newPermissions.includes(p.id)) {
                    newPermissions.push(p.id);
                }
            });
        } else {
            // Remove all allowed permissions
            newPermissions = newPermissions.filter(
                (perm) => !allowedPermissions.some((p) => p.id === perm)
            );
        }

        formik.setFieldValue(path, newPermissions);
    };

    useEffect(() => {
        fetchBannerConfig();
    }, []);

    const fetchBannerConfig = async () => {
        try {
            const heightResponsePromise = axiosInstance.post(
                `userService/setting/getsettingsbyid`,
                { id: 9 }
            );
            const widthResponsePromise = axiosInstance.post(
                `userService/setting/getsettingsbyid`,
                { id: 10 }
            );

            const [heightResponse, widthResponse] = await Promise.all([
                heightResponsePromise,
                widthResponsePromise,
            ]);

            setBannerConfigData((prevData) => ({
                ...prevData,
                height: heightResponse.data?.data,
                width: widthResponse.data?.data,
            }));
        } catch (error) {
            console.error("Error getting banner config", error);
        }
    };

    const handleImageUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const allowedFormats = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp",
            ];
            const maxSize = 2 * 1024 * 1024;

            if (selectedFile.size > maxSize) {
                event.target.value = null;
                formik.setFieldError(
                    "documentFile",
                    "Please select an image file that is less than 2MB."
                );
                return;
            }

            if (!allowedFormats.includes(selectedFile.type)) {
                event.target.value = null;
                formik.setFieldError(
                    "documentFile",
                    "Please select a valid image file (JPEG, JPG, PNG, or WEBP)."
                );
                return;
            }

            // formik.setFieldValue("documentFile", selectedFile);
            setSelectedFile(selectedFile);
            formik.setFieldError("documentFile", "");
            setIsCropping(true);
        }
    };

    const handleShow = () => {
        setShow(true);
        setIsCropping(false);
        setCroppedImageUrl(null);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        setSelectedFile(null);
        formik.resetForm();
        formik.setErrors({});
    };

    const fetchBannerList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `userService/banner/view`,
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
                `userService/banner/view`,
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
            fetchBannerList();
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

    const addBanner = async (values) => {
        try {
            setLoading(true);
            let fileId = null;
            if (croppedImageUrl) {
                const formData = new FormData();
                formData.append("viewDocumentName", "Banner");
                const response = await fetch(croppedImageUrl);
                const blob = await response.blob();
                formData.append("documentFile", blob);
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
            const response = await axiosInstance.post(
                `userService/banner/create`,
                {
                    ...values,
                    documentFile: undefined,
                    userId: undefined,
                    imageId: fileId,
                    isActive: values.status,
                }
            );
            if (response) {
                toast.success("Banner added successfully.");
                fetchBannerList();
                handleClose();
                setLoading(false);
                setIsCropping(false);
                setCroppedImageUrl(null);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong while add new banner");
        }
    };

    const updateBanner = async (id, values) => {
        try {
            if (id) {
                setLoading(true);
                let fileId = null;
                if (croppedImageUrl) {
                    const formData = new FormData();
                    formData.append("viewDocumentName", "Banner");
                    const response = await fetch(croppedImageUrl);
                    const blob = await response.blob();
                    formData.append("documentFile", blob);
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
                const response = await axiosInstance.put(
                    `userService/banner/update`,
                    {
                        id: id,
                        ...values,
                        imageId: fileId ? fileId : formik.values.imageId,
                        isActive: values.status,
                        documentFile: undefined,
                        userId: undefined,
                    }
                );
                if (response) {
                    toast.success("Banner updated successfully.");
                    fetchBannerList();
                    handleClose();
                    setLoading(false);
                    setIsCropping(false);
                    setCroppedImageUrl(null);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update banner");
        }
    };
    const deleteBanner = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this banner!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/banner/delete`,
                    {
                        id: deleteId,
                    }
                );
                if (response) {
                    toast.success(`Banner deleted successfully.`);
                    fetchBannerList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete banner.`);
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
    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .min(5, "Please enter title 5 charcter long")
            .required("Please enter title"),
        url: Yup.string()
            .url("Please enter valid url eg:http://example.com")
            .required("Please enter url"),
        status: Yup.string().required("Please select status"),
        documentFile: selectedFile
            ? Yup.mixed()
            : Yup.mixed().required("Please upload a banner"),
        userId: Yup.number(),
    });
    const formik = useFormik({
        initialValues: {
            title: "",
            url: "",
            status: "1",
            documentFile: "",
            userId: userId,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateBanner(id, values);
            } else {
                addBanner(values);
            }
        },
    });

    const updateBannerPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                title: data.title || "",
                url: data.url || "",
                status: data.isActive || "",
                documentFile: data.imageId || null,
                imageId: data.imageId || null,
                imageData: data.imageData || "",
            });
        }
        setShow(true);
    };
    const fetchTableConfigData = async () => {
        try {
            if (userId) {
                const response = await axiosInstance.post(
                    `userService/table/get-table-config`,
                    {
                        userId: userId,
                    }
                );

                if (response) {
                    const data = response?.data?.data;
                    dispatch(setTableColumnConfig(data));
                }
            }
        } catch (error) {
            console.error("Error fetching profile image:", error.message);
        }
    };
    const updateTableConfig = async (selectedColumns) => {
        setOpenColumnModal(false);
        try {
            const response = await axiosInstance.post(
                `userService/table/update-table-config`,
                {
                    userId: userId,
                    tableName: tableName,
                    tableConfig: selectedColumns,
                }
            );
            if (response) {
                fetchTableConfigData();
            }
        } catch (error) {
            console.error("Something went wrong while update banner");
        }
    };

    // Function to handle selecting all columns
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all columns
            setSelectedColumns(allColumns);
        } else {
            // Deselect all columns
            setSelectedColumns([]);
        }
    };

    // Function to handle individual column selection
    const handleColumnChange = (column) => {
        if (selectedColumns.includes(column)) {
            // If the column is already selected, remove it
            setSelectedColumns(selectedColumns.filter((col) => col !== column));
        } else {
            // Otherwise, add it to the selected columns
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    // Function to handle applying changes
    const handleApplyChanges = (e) => {
        e.preventDefault();
        // Add logic to handle applying column changes
        updateTableConfig(selectedColumns);
    };

    // Function to handle canceling changes
    const handleCancel = () => {
        setSelectedColumns([]); // Reset the selected columns
        setOpenColumnModal(false); // Close the dropdown
    };

    // Function to toggle the column modal
    const handleOpenColumnModal = (isOpen) => {
        setOpenColumnModal(isOpen);
    };

    document.title = "Banner | eGov Solution";

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
                                        <h4 className="mb-sm-0">Banners</h4>
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
                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xxl-2 mb-3 mb-md-0">
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
                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-4 col-12 col-xs-6 col-xxl-2 mb-3 mb-sm-0 ">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                    onClick={resetFilters}
                                                >
                                                    <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                    Reset
                                                </button>


                                            </div>
                                            <div className="col-xl-4 col-lg-4 col-12 col-md-4 col-sm-8  col-xs-6 col-xxl-4 ms-auto text-end d-flex align-items-start justify-content-end">
                                                {createPermission && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label me-3  text-nowrap"
                                                        id="create-btn"
                                                        onClick={handleShow}
                                                    >
                                                         <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                                                        Add Banner
                                                    </button>

                                                )}
                                                <ColumnConfig
                                                    openColumnModal={
                                                        openColumnModal
                                                    }
                                                    handleOpenColumnModal={
                                                        handleOpenColumnModal
                                                    }
                                                    handleApplyChanges={
                                                        handleApplyChanges
                                                    }
                                                    handleSelectAll={
                                                        handleSelectAll
                                                    }
                                                    selectedColumns={
                                                        selectedColumns
                                                    }
                                                    allColumns={allColumns}
                                                    handleColumnChange={
                                                        handleColumnChange
                                                    }
                                                    handleCancel={handleCancel}
                                                />
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
                                                            {columns.includes(
                                                                "Title"
                                                            ) && (
                                                                    <th
                                                                        className="fw-bold cursor-pointer"
                                                                        onClick={() =>
                                                                            handleSorting(
                                                                                "title"
                                                                            )
                                                                        }
                                                                    >
                                                                        Title{" "}
                                                                        <span>
                                                                            <BiSortAlt2 />
                                                                        </span>
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Url"
                                                            ) && (
                                                                    <th className="fw-bold">
                                                                        Url
                                                                    </th>
                                                                )}
                                                            {columns.includes(
                                                                "Status"
                                                            ) && (
                                                                    <th className="fw-bold">
                                                                        Status
                                                                    </th>
                                                                )}
                                                            {(deletePermission ||
                                                                editPermission) &&
                                                                columns.includes(
                                                                    "Action"
                                                                ) && (
                                                                    <th className="fw-bold text-end">
                                                                        Action
                                                                    </th>
                                                                )}
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {isLoading ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center"
                                                                >
                                                                    <LoaderSpin />
                                                                </td>
                                                            </tr>
                                                        ) : data.length ===
                                                            0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center"
                                                                >
                                                                    <NotFound
                                                                        heading="Banners not found."
                                                                        message="Unfortunately, banners not available at the moment."
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            data?.map(
                                                                (
                                                                    banner,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {columns.includes(
                                                                            "Title"
                                                                        ) && (
                                                                                <td>
                                                                                    <div className="fw-semibold text-black">
                                                                                        {banner?.title ||
                                                                                            BlankData}
                                                                                    </div>
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Url"
                                                                        ) && (
                                                                                <td>
                                                                                    {banner?.url ||
                                                                                        BlankData}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Status"
                                                                        ) && (
                                                                                <td className="status-update text-success fw-bold">
                                                                                    {banner.isActive ===
                                                                                        "1" ? (
                                                                                        <div className="badge badge-soft-success text-success fs-12">
                                                                                            <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                                                                            Active
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="badge badge-soft-warning text-warning fs-12">
                                                                                            <i className="ri-close-circle-line align-bottom"></i>{" "}
                                                                                            In-Active
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                            )}
                                                                        {columns.includes(
                                                                            "Action"
                                                                        ) && (
                                                                                <td className="text-end">
                                                                                    <span>
                                                                                        {viewPermissions &&
                                                                                            !editPermission && (
                                                                                                <span
                                                                                                    title="View"
                                                                                                    className="cursor-pointer me-4"
                                                                                                    onClick={() =>
                                                                                                        updateBannerPrefilledData(
                                                                                                            banner
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <Eye
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        className="text-primary"
                                                                                                    />
                                                                                                </span>
                                                                                            )}
                                                                                        {editPermission && (
                                                                                            <span
                                                                                                title="Edit"
                                                                                                onClick={() =>
                                                                                                    updateBannerPrefilledData(
                                                                                                        banner
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <FiEdit2 className="cursor-pointer me-4" />
                                                                                            </span>
                                                                                        )}
                                                                                        {deletePermission && (
                                                                                            <span
                                                                                                title="Delete"
                                                                                                onClick={() =>
                                                                                                    deleteBanner(
                                                                                                        banner.id
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <RiDeleteBinLine className="cursor-pointer" />
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
                                        handlePageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <BannerModal
                    isCropping={isCropping}
                    setIsCropping={setIsCropping}
                    croppedImageUrl={croppedImageUrl}
                    setCroppedImageUrl={setCroppedImageUrl}
                    bannerConfigData={bannerConfigData}
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    handleImageUpload={handleImageUpload}
                    loading={loading}
                    handleAllPermissionsChange={handleAllPermissionsChange}
                    viewPermissions={viewPermissions}
                    createPermission={createPermission}
                    editPermission={editPermission}
                />
            </div>

            <ScrollToTop />
        </>
    );
};

export default Banner;
