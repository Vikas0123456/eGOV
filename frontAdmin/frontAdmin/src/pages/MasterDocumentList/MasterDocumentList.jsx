import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Input,
    Button,
    Table,
} from "reactstrap";
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
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import MasterDocumentListModel from "./MasterDocumentListModel";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import { RefreshCcw } from "feather-icons-react/build/IconComponents";
import useAxios from "../../utils/hook/useAxios";
import NotFound from "../../common/NotFound/NotFound";

const MasterDocumentList = () => {
    const axiosInstance = useAxios();
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userId = userData?.id;
    const [documentList, setDocumentList] = useState([]);
    const [searchQuery, setSearchQuery] = useState();
    // add update modal
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [id, setId] = useState();
    const [isEditing, setIsEditing] = useState(false);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / perPageSize);

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
        setId();
        formik.resetForm();
        formik.setErrors({});
    };

    const fetchDocumentList = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `documentService/document-list/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setDocumentList(rows);
                setTotalCount(count);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    const listOfSearch = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `documentService/document-list/view`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    searchFilter: searchQuery,
                }
            );

            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setDocumentList(rows);
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
    }, [searchQuery, currentPage, perPageSize]);

    useEffect(() => {
        if (!searchQuery) {
            fetchDocumentList();
        }
    }, [searchQuery, currentPage, perPageSize]);

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

    const handleInputSearch = (e) => {
        setCurrentPage(1);
        setSearchQuery(e.target.value);
    };

    const resetFilters = async () => {
        setCurrentPage(1);
        setPerPageSize(10);
        setSearchQuery("");
    };

    const addDocumentList = async (values) => {
        try {
            setIsEditing(true);

            const payload = {
                documentName: values.documentName,
                slug: values.slug,
                isRequired: values.isRequired,
                canApply: values.canApply,
            };

            const response = await axiosInstance.post(
                `documentService/document-list/create`,
                payload
            );

            if (response?.data) {
                toast.success("Document added successfully.");
                fetchDocumentList();
                handleClose();
            }
        } catch (error) {
            console.error("Something went wrong", error);
        } finally {
            setIsEditing(false)
        }
    };

    const updateDocumentList = async (id, values) => {
        try {
            setIsEditing(true)

            const payload = {
                documentListId: id,
                documentName: values.documentName,
                slug: values.slug,
                isRequired: values.isRequired,
                canApply: values.canApply,
            };

            const response = await axiosInstance.post(
                `documentService/document-list/update`,
                payload
            );

            if (response?.data) {
                toast.success("Document updated successfully.");
                fetchDocumentList();
                handleClose();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.error(
                "something went wrong",
                error?.response?.data?.message
            );
        } finally {
            setIsEditing(false);
        }
    };

    const deleteDocumentList = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this documentlist!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.post(
                    `documentService/document-list/delete`,
                    {
                        documentListId: deleteId,
                    }
                );
                if (response?.data) {
                    toast.success(`Document List deleted successfully.`);
                    fetchDocumentList();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete document list.`);
                console.error(error);
            }
        }
    };

    const validationSchema = Yup.object().shape({
        documentName: Yup.string().required("Please enter the document name"),
        slug: Yup.string().required("Please enter the slug"),
        isRequired: Yup.string()
            .oneOf(["0", "1"], "Please select if the document is required")
            .required("Please specify if the document is required"),
        canApply: Yup.string()
            .oneOf(["0", "1"], "Please select if the document can apply")
            .required("Please specify if the document can apply"),
    });

    const formik = useFormik({
        initialValues: {
            documentName: "",
            slug: "",
            isRequired: "",
            canApply: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (id) {
                updateDocumentList(id, values);
            } else {
                addDocumentList(values);
            }
        },
    });

    const updateDocumentPrefilledData = async (data) => {
        if (data) {
            setId(data?.id);
            formik.setValues({
                ...formik.values,
                documentName: data?.documentName || "",
                slug: data?.slug || "",
                isRequired: data?.isRequired || "0",
                canApply: data?.canApply || "0",
            });
        }
        setShow(true);
    };

    document.title = "Master Document List | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <Container fluid>
                            <Row>
                                <Col xs={12}>
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            Document List
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} className="pe-4">
                                    <Card className="border-0">
                                        <CardBody className="border-0">
                                            <Row>
                                                <Col
                                                    xs={12}
                                                    sm={6}
                                                    className="d-flex align-items-center">
                                                    <div className="search-box d-flex align-items-center">
                                                        <Input
                                                            type="text"
                                                            className="form-control search bg-light border-light"
                                                            placeholder="Search"
                                                            value={searchQuery}
                                                            onChange={
                                                                handleInputSearch
                                                            }
                                                        />
                                                        <i className="ri-search-line search-icon"></i>
                                                    </div>
                                                    <Button
                                                        color="primary"
                                                        className="bg-light border-light ms-3 text-muted d-flex align-items-center"
                                                        onClick={resetFilters}>
                                                        <RefreshCcw
                                                            width="24"
                                                            height="24"
                                                            className="feather feather-refresh-ccw icon-xs me-2 text-muted d-none d-sm-inline"
                                                        />
                                                        <span>Reset</span>
                                                    </Button>
                                                </Col>
                                                <Col
                                                    xs={12}
                                                    sm={6}
                                                    className="d-flex align-items-center justify-content-sm-end justify-content-center mt-3 mt-sm-0">
                                                    <Button
                                                        color="btn btn-primary"
                                                        id="create-btn"
                                                        onClick={handleShow}>
                                                        Create Document List
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                    <Card className="border-0 mb-0">
                                        <CardBody className="pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                <Table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable">
                                                    <thead>
                                                        <tr>
                                                            <th className="fw-bold">
                                                                Document Name
                                                            </th>
                                                            <th className="fw-bold">
                                                                Slug
                                                            </th>
                                                            <th className="fw-bold">
                                                                Document File
                                                                Type
                                                            </th>
                                                            <th className="fw-bold">
                                                                Is Required
                                                            </th>
                                                            <th className="fw-bold">
                                                                Can Apply
                                                            </th>
                                                            <th className="fw-bold">
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center">
                                                                    <LoaderSpin height={"300px"} />
                                                                </td>
                                                            </tr>
                                                        ) : documentList.length ===
                                                          0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan="6"
                                                                    className="text-center">
                                                                        <NotFound heading="Documents not found" message="Unfortunately, documents not available at the moment." />
                                                                    </td>
                                                            </tr>
                                                        ) : (
                                                            documentList.map(
                                                                (
                                                                    document,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }>
                                                                        <td
                                                                            style={{
                                                                                width: "300px",
                                                                            }}>
                                                                            {
                                                                                document.documentName
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "150px",
                                                                            }}>
                                                                            {
                                                                                document.slug
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "150px",
                                                                            }}>
                                                                            {
                                                                                document.documentFileType
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "100px",
                                                                            }}>
                                                                            {document.isRequired ===
                                                                            "1" ? (
                                                                                <div className="badge badge-soft-success text-success fs-12">
                                                                                    <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                                                                    Yes
                                                                                </div>
                                                                            ) : (
                                                                                <div className="badge badge-soft-warning text-warning fs-12">
                                                                                    <i className="ri-close-circle-line align-bottom"></i>{" "}
                                                                                    No
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "100px",
                                                                            }}>
                                                                            {document.canApply ===
                                                                            "1" ? (
                                                                                <div className="badge badge-soft-success fs-12 text-success">
                                                                                    <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                                                                    Yes
                                                                                </div>
                                                                            ) : (
                                                                                <div className="badge badge-soft-warning text-warning fs-12">
                                                                                    <i className="ri-close-circle-line align-bottom"></i>{" "}
                                                                                    No
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                width: "100px",
                                                                            }}>
                                                                            <span>
                                                                                <span
                                                                                    title="delete"
                                                                                    className="cursor-pointer"
                                                                                    onClick={() =>
                                                                                        deleteDocumentList(
                                                                                            document.id
                                                                                        )
                                                                                    }>
                                                                                    <RiDeleteBinLine className="me-4" />
                                                                                </span>
                                                                                <span
                                                                                    title="edit"
                                                                                    className="cursor-pointer"
                                                                                    onClick={() =>
                                                                                        updateDocumentPrefilledData(
                                                                                            document
                                                                                        )
                                                                                    }>
                                                                                    <FiEdit2 />
                                                                                </span>
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </CardBody>

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
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
                <MasterDocumentListModel
                    show={show}
                    handleClose={handleClose}
                    updateId={id}
                    formik={formik}
                    loading={isEditing}
                />
            </div>
            <ScrollToTop />
        </>
    );
};

export default MasterDocumentList;
