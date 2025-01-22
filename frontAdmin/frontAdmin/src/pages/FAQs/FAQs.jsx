import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { BiSortAlt2 } from "react-icons/bi";
import { useFormik } from "formik";
import Pagination from "../../CustomComponents/Pagination";
import "../css/fileupload.css";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import FAQsModal from "./FAQsModal";
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
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../common/UserInfo/DepartmentUserInfo";
import { Eye } from "feather-icons-react/build/IconComponents";
import NotFound from "../../common/NotFound/NotFound";
import useAxios from "../../utils/hook/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { setTableColumnConfig } from "../../slices/layouts/reducer";
import ColumnConfig from "../../common/ColumnConfig/ColumnConfig";
import AnswerModal from "./AnswerModal";
const BlankData = process.env.REACT_APP_BLANK;
const FAQs = () => {
    const axiosInstance = useAxios();
    const dispatch = useDispatch();
    const tableConfigList = useSelector(
        (state) => state?.Layout?.tableColumnConfig
    );
    const tableName = "faqs";
    const tableColumnConfig =
        tableConfigList &&
        tableConfigList?.find((data) => data?.tableName === tableName);
    // List of all columns
    const allColumns = ["Question", "Answer", "Status"];
    const shouldShowAllColumns =
        !tableColumnConfig?.tableConfig ||
        tableColumnConfig?.tableConfig.length === 0;
    // Columns to be shown
    const columns = shouldShowAllColumns
        ? ["Question", "Answer", "Status", "Action"] // Define all available columns
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
    const [answerShow, setAnswerShow] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [id, setId] = useState();
    //loader
    const [isLoading, setIsLoading] = useState(true);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(10);

    const totalPages = Math.ceil(totalCount / perPageSize);
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
    const FAQsPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "faqs"
        );
    const viewPermissions = FAQsPermissions
        ? hasViewPermission(FAQsPermissions)
        : false;
    const createPermission = FAQsPermissions
        ? hasCreatePermission(FAQsPermissions)
        : false;
    const editPermission = FAQsPermissions
        ? hasEditPermission(FAQsPermissions)
        : false;
    const deletePermission = FAQsPermissions
        ? hasDeletePermission(FAQsPermissions)
        : false;

    useEffect(() => {
        if (tableColumnConfig?.tableConfig && openColumnModal === true) {
            setSelectedColumns(tableColumnConfig?.tableConfig);
        }
    }, [tableColumnConfig?.tableConfig, openColumnModal]);

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        formik.resetForm();
        formik.setErrors({});
    };

    const fetchFAQsList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(`userService/faq/view`, {
                page: currentPage,
                perPage: perPageSize,
                sortOrder: sortOrder,
                orderBy: orderBy,
            });

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
            const response = await axiosInstance.post(`userService/faq/view`, {
                page: currentPage,
                perPage: perPageSize,
                searchFilter: searchQuery,
                sortOrder: sortOrder,
                orderBy: orderBy,
            });

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
            fetchFAQsList();
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

    const addFaq = async (values) => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                `userService/faq/create`,
                {
                    ...values,
                    userId: undefined,
                }
            );
            if (response) {
                toast.success("FAQ added successfully.");
                fetchFAQsList();
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Something went wrong while add new banner");
        }
    };

    const updateFaq = async (id, values) => {
        try {
            if (id) {
                setLoading(true);

                const response = await axiosInstance.put(
                    `userService/faq/update`,
                    {
                        id: id,
                        ...values,
                    }
                );
                if (response) {
                    toast.success("FAQ updated successfully.");
                    fetchFAQsList();
                    handleClose();
                    setLoading(false);
                }
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update banner");
        }
    };
    const deleteFAQ = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this FAQ!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/faq/update`,
                    {
                        id: deleteId,
                        isDeleted: "1",
                    }
                );
                if (response) {
                    toast.success(`FAQ deleted successfully.`);
                    fetchFAQsList();
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
        question: Yup.string()
            .min(5, "Please enter question 5 charcter long")
            .required("Please enter question"),
        answer: Yup.string()
            .min(10, "Please enter answer 10 charcter long")
            .required("Please enter answer"),
        status: Yup.string().required("Please select status"),
    });
    const formik = useFormik({
        initialValues: {
            question: "",
            answer: "",
            status: "1",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateFaq(id, values);
            } else {
                addFaq(values);
            }
        },
    });

    const updateFAQPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                question: data.question || "",
                answer: data.answer || "",
                status: data.status || "",
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

    const handleToggle = () => {
        setAnswerShow(false);
    };

    const handleAnswerModal = (selectedAnswer) => {
        setSelectedAnswer(selectedAnswer);
        setAnswerShow(true);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return text;
    };

    document.title = "FAQs | eGov Solution";

    return (
        <div>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <DepartmentUserInfo />
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">FAQs</h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xxl-12 ">
                                <div className="card border-0 ">
                                    <div className="card-body border-0">
                                        <div className="row">
                                            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-md-0">
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
                                            <div className="col-xl-3 col-lg-3 col-md-2 col-12 col-sm-6 col-xxl-3 d-flex align-items-start justify-content-start mb-md-0 mb-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                                                    onClick={resetFilters}
                                                >
                                                     <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                                                     Reset
                                                </button>


                                            </div>
                                            <div className="col-xl-5 col-lg-6 col-9 col-md-6 col-sm-6 col-12 col-xxl-4 ms-auto text-end d-flex align-items-start justify-content-end">
                                                {createPermission && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-label me-3  text-nowrap"
                                                        id="create-btn"
                                                        onClick={handleShow}
                                                    >

                                                        Add FAQ
                                                        <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
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
                                                                    "Question"
                                                                ) && (
                                                                        <th
                                                                            style={{
                                                                                maxWidth:
                                                                                    "200px",
                                                                            }}
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "question"
                                                                                )
                                                                            }
                                                                        >
                                                                            Question{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Answer"
                                                                ) && (
                                                                        <th
                                                                            style={{
                                                                                maxWidth:
                                                                                    "200px",
                                                                            }}
                                                                            className="fw-bold cursor-pointer"
                                                                            onClick={() =>
                                                                                handleSorting(
                                                                                    "answer"
                                                                                )
                                                                            }
                                                                        >
                                                                            Answer{" "}
                                                                            <span>
                                                                                {" "}
                                                                                <BiSortAlt2 />{" "}
                                                                            </span>
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Status"
                                                                ) && (
                                                                        <th className="fw-bold">
                                                                            {" "}
                                                                            Status{" "}
                                                                        </th>
                                                                    )}
                                                                {columns.includes(
                                                                    "Action"
                                                                ) && (
                                                                        <th className="fw-bold">
                                                                            {" "}
                                                                            Action{" "}
                                                                        </th>
                                                                    )}
                                                            </tr>
                                                        </thead>
                                                        {data &&
                                                            data?.length ===
                                                            0 &&
                                                            !isLoading && (
                                                                <tbody></tbody>
                                                            )}
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
                                                                            heading="FAQs not found."
                                                                            message="Unfortunately, FAQs not available at the moment."
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                data &&
                                                                data?.map(
                                                                    (
                                                                        question,
                                                                        index
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {columns.includes(
                                                                                "Question"
                                                                            ) && (
                                                                                    <td className="text-wrap">
                                                                                        <div>
                                                                                            <div className="d-flex align-items-center">
                                                                                                <div className="fw-semibold text-black">
                                                                                                    {question.question ||
                                                                                                        BlankData}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Answer"
                                                                            ) && (
                                                                                <td className="text-wrap"
                                                                                    onClick={() => handleAnswerModal(question.answer ||
                                                                                        BlankData)}
                                                                                    style={{ cursor: "pointer" }}
                                                                                    title={"Click here for detailed answer."}
                                                                                >
                                                                                    {truncateText(question.answer ||
                                                                                        BlankData, 5)}
                                                                                </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Status"
                                                                            ) && (
                                                                                    <td className="status-update text-success fw-bold">
                                                                                        {question.status ===
                                                                                            "1" ? (
                                                                                            <div className="badge badge-soft-success text-success fs-12">
                                                                                                <i className="ri-checkbox-circle-line align-bottom text-success"></i>{" "}
                                                                                                {question.status ===
                                                                                                    "1"
                                                                                                    ? "Active"
                                                                                                    : "In-Active"}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="badge badge-soft-warning fs-12">
                                                                                                <i className="ri-close-circle-line align-bottom "></i>{" "}
                                                                                                {question.status ===
                                                                                                    "1"
                                                                                                    ? "Active"
                                                                                                    : "In-Active"}
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                )}
                                                                            {columns.includes(
                                                                                "Action"
                                                                            ) && (
                                                                                    <td>
                                                                                        <span>
                                                                                            {viewPermissions &&
                                                                                                !editPermission && (
                                                                                                    <span
                                                                                                        className="cursor-pointer me-4"
                                                                                                        title="view"
                                                                                                        onClick={() =>
                                                                                                            updateFAQPrefilledData(
                                                                                                                question
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Eye
                                                                                                            width="16"
                                                                                                            height="16"
                                                                                                            className="cursor-pointer"
                                                                                                        />
                                                                                                    </span>
                                                                                                )}
                                                                                            {editPermission && (
                                                                                                <span
                                                                                                    title="Edit"
                                                                                                    onClick={() =>
                                                                                                        updateFAQPrefilledData(
                                                                                                            question
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    <FiEdit2 className="cursor-pointer me-4" />
                                                                                                </span>
                                                                                            )}
                                                                                            {deletePermission && (
                                                                                                <span
                                                                                                    title="Delete"
                                                                                                    onClick={() => {
                                                                                                        deleteFAQ(
                                                                                                            question.id
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <RiDeleteBinLine className=" cursor-pointer" />
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
                </div>

                <FAQsModal
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    loading={loading}
                    viewPermissions={viewPermissions}
                    createPermission={createPermission}
                    editPermission={editPermission}
                />
                <AnswerModal
                    answerShow={answerShow}
                    setAnswerShow={setAnswerShow}
                    handleToggle={handleToggle}
                    selectedAnswer={selectedAnswer}
                />
            </div>

            <ScrollToTop />
        </div>
    );
};

export default FAQs;
