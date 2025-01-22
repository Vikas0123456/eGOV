import React, { useEffect, useState } from "react";
import { Button, Collapse, Offcanvas, Spinner } from "react-bootstrap";
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import DatePicker from "react-datepicker";
import SimpleBar from "simplebar-react";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
    formatRelativeTime,
    formatedDate,
    hasCreatePermission,
    hasDeletePermission,
    hasEditPermission,
    hasViewPermission,
} from "../../../common/CommonFunctions/common";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../../utils/hook/useAxios";
import { useRef } from "react";

const AnnouncementsAddUpdateModal = ({
    show,
    loading,
    setLoading,
    setShowAnnouncementsModal,
    userId,
}) => {
    const axiosInstance = useAxios()
    const formRef = useRef(null);
    const [departmentList, setDepartmentList] = useState([]);
    const [announcementList, setAnnouncementList] = useState([]);
    const [id, setId] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState();
    const [perPageSize, setPerPageSize] = useState(5);
    const totalPages = Math.ceil(totalCount / perPageSize);
    const [dropdownOpen, setDropdownOpen] = useState({});

    const toggleDropdown = (id) => {
        setDropdownOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const departmentOptions = departmentList.map((department) => ({
        value: department.id,
        label: department.departmentName,
    }));

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
            console.error(error.message);
        }
    };

    const listOfAnnouncements = async () => {
        try {
            const response = await axiosInstance.post(
                `userService/announcement/view`,
                { page: currentPage, perPage: perPageSize }
            );

            if (response?.data) {
                const { count, rows } = response?.data?.data;
                setAnnouncementList(rows?.length > 0 ? rows : []);
                setTotalCount(count);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const formik = useFormik({
        initialValues: {
            title: "",
            isCoreTeam: "0",
            departmentId: [],
            displayFrom: null,
            displayTo: null,
            displayFromAdd: null,
            displayToAdd: null,
            announcementDate: "",
            tag: "",
        },
        validate: (values) => {
            const errors = {};

            // Validate title
            if (!values.title.trim()) {
                errors.title = "Please enter title";
            }

            if (values.title.trim().length < 5) {
                errors.title = "Please enter title 5 character long";
            }

            // Validate core team
            if (!values.isCoreTeam.trim()) {
                errors.isCoreTeam = "Please select core team";
            }

            // Validate department if core team is not selected
            if (
                values.isCoreTeam == "1" &&
                values?.departmentId?.length === 0
            ) {
                errors.departmentId = "Please select department";
            }
            if (!values.tag) {
                errors.tag = "Please enter tag";
            }

            return errors;
        },
        onSubmit: (values) => {
            if (id) {
                updateAnnouncement(id, values);
            } else {
                addAnnouncement(values);
            }
        },
    });

    // useEffect(() => {
    //     if (formik.values.isCoreTeam === "1") {
    //         setIscoreteam(true);
    //     }
    // }, [formik.values.isCoreTeam]);

    useEffect(() => {
        listOfAnnouncements();
    }, [currentPage, perPageSize]);

    useEffect(() => {
        listOfDepartments();
    }, []);

    const handleSelectChange = (selectedOptions) => {
        setSelectedDepartment(selectedOptions);
        const selectedDepartmentIds = selectedOptions.map(
            (option) => option.value
        );

        formik.setValues({
            ...formik.values,
            departmentId: selectedDepartmentIds,
        });
    };

    const loadMoreAnnouncement = () => {
        if (perPageSize < totalCount) {
            setPerPageSize((prevPage) => prevPage + 5);
        }
    };

    const handleAnnouncementsClose = () => {
        setShowAnnouncementsModal(false);
        formik.resetForm();
        setCurrentPage(1);
        setPerPageSize(5);
        setSelectedDepartment(null);
        setCollapsed(false);
        setId(false);
    };

    const addAnnouncement = async (values) => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                `userService/announcement/create`,
                {
                    ...values,
                    departmentId: values.departmentId.join(","),
                    userId: userId,
                }
            );
            if (response) {
                toast.success("Announcement added successfully.");
                listOfAnnouncements();
                setCollapsed(false);
                formik.resetForm();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Something went wrong while add new announcement");
            console.error("Something went wrong while add new announcement");
        }
    };

    const updateAnnouncement = async (id, values) => {
        try {
            if (id) {
                setLoading(true);

                const response = await axiosInstance.put(
                    `userService/announcement/update`,
                    {
                        id: id,
                        ...values,
                        userId: userId,
                        departmentId: values.departmentId.join(","),
                    }
                );
                if (response?.data) {
                    toast.success("Announcement updated successfully.");
                    const updatedItem = response.data.data;

                    setAnnouncementList((prevItems) =>
                        prevItems.map((item) =>
                            item.id === updatedItem.id ? updatedItem : item
                        )
                    );
                    listOfAnnouncements();
                    setCollapsed(false);
                    setId(false);
                    formik.resetForm();
                    setLoading(false);
                }
            }
        } catch (error) {
            // console.log(error);
            setLoading(false);
            toast.error("No changes were made.");
            // console.error("Something went wrong while update Announcement");
        }
    };

    const deleteAnnouncement = async (deleteId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this Announcement!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.put(
                    `userService/announcement/delete`,
                    {
                        announcementId: deleteId,
                    }
                );
                if (response) {
                    toast.success(`announcement deleted successfully.`);
                    listOfAnnouncements();
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                toast.error(`Failed to delete announcement.`);
                console.error(error);
            }
        }
    };

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}/${month}/${day}`;
    }

    const updateAnnouncementData = (data) => {
        setCollapsed(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); 
         }, 100);
        if (data) {
            let departments = data?.departmentId
                ? data?.departmentId.split(",").map(Number)
                : [];
            setId(data?.id);
            formik.setValues({
                // ...formik.values,

                title: data?.title || "",
                tag: data?.tag || "",
                isCoreTeam: data?.isCoreTeam || "",
                departmentId: departments || undefined,
                displayFrom:
                    (data?.displayFrom && new Date(data?.displayFrom)) || "",
                displayTo: (data?.displayTo && new Date(data?.displayTo)) || "",

                displayFromAdd:
                    (data?.displayFrom && new Date(data?.displayFrom)) || "",
                displayToAdd:
                    (data?.displayTo && new Date(data?.displayTo)) || "",
                announcementDate:
                    (data?.announcementDate &&
                        new Date(data?.announcementDate)) ||
                    "",
            });

            let selectedDepartment = departmentOptions.filter((option) => {
                return data?.departmentId
                    ? departments.includes(option.value)
                    : false;
            });

            if (selectedDepartment) {
                setSelectedDepartment(selectedDepartment);
            }
        }
    };

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };
    const AnnouncementPermissions =
        userPermissionsDecryptData &&
        userPermissionsDecryptData?.data?.find(
            (module) => module.slug === "announcements"
        );
    const viewPermission = AnnouncementPermissions
        ? hasViewPermission(AnnouncementPermissions)
        : false;
    const createPermission = AnnouncementPermissions
        ? hasCreatePermission(AnnouncementPermissions)
        : false;
    const editPermission = AnnouncementPermissions
        ? hasEditPermission(AnnouncementPermissions)
        : false;
    const deletePermission = AnnouncementPermissions
        ? hasDeletePermission(AnnouncementPermissions)
        : false;

    return (
        <Offcanvas
            show={show}
            placement="end"
            onHide={handleAnnouncementsClose}
            style={{ width: "auto" }}>
            <div className="modal-dialog modal-md my-0">
                <div
                    className="modal-content bg-light p-4 shadow-sm vh-100 overflow-auto">

                    <div className="card border-0 bg-transparent 0">
                 
                        <div className="card-header">
                            {/* <h6 className="card-title mb-0 flex-grow-1 fs-13 mb-2">Announcements</h6> */}
                            <div className="d-flex align-items-center gap-1 justify-content-between">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        handleAnnouncementsClose();
                                        setCollapsed(false);
                                    }}
                                    className="btn btn-danger">
                                    <i className="ri-close-line align-middle" />
                                </Button>
                                <h5 className="card-title mb-0">
                                    Announcements
                                </h5>
                                <div className="flex-shrink-0">
                                    {createPermission && (
                                        <div className="dropdown card-header-dropdown">
                                            <div className="d-flex align-items-center">
                                                <span className="d-flex align-items-center" aria-controls="add-anns-tooogle" onClick={() => {
                                                    setCollapsed((prev) => !prev);
                                                    if (!collapsed) {
                                                        setId(false); formik.resetForm();
                                                    }
                                                }}>
                                                    <i className="mdi mdi-microphone-outline text-warning fs-4 me-2"></i>

                                                    <span role="button">
                                                        {id ? "Update" : "Add"}{" "}
                                                        Announcement
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Collapse in={collapsed}>
                            <div id="add-anns-tooogle" ref={formRef}>
                                <div className="card mb-0 border-0">
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="title"
                                                    className="form-label">
                                                    Title
                                                </label>
                                                <textarea
                                                    type="text"
                                                    id="title"
                                                    className="form-control"
                                                    value={formik.values.title}
                                                    {...formik.getFieldProps(
                                                        "title"
                                                    )}
                                                    style={{ resize: 'vertical', overflowY: 'auto' }}
                                                />
                                                {formik.errors.title &&
                                                    formik.touched.title && (
                                                        <div className="text-danger" >
                                                            {formik.errors.title}
                                                        </div>
                                                    )}
                                            </div>
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="tag"
                                                    className="form-label">
                                                    Tag
                                                </label>
                                                <input
                                                    type="text"
                                                    id="tag"
                                                    className="form-control"
                                                    value={formik.values.tag}
                                                    {...formik.getFieldProps(
                                                        "tag"
                                                    )}
                                                />
                                                {formik.errors.tag &&
                                                    formik.touched.tag && (
                                                        <div className="text-danger" >
                                                            {formik.errors.tag}
                                                        </div>
                                                    )}
                                            </div>
                                            <div className="mb-3">
                                                <div>
                                                    <label
                                                        htmlFor="isCoreTeam"
                                                        className="form-label">
                                                        Core Team
                                                    </label>
                                                    <select
                                                        className="form-control"
                                                        id="coreTeam"
                                                        value={
                                                            formik.values
                                                                .isCoreTeam
                                                        }
                                                        {...formik.getFieldProps(
                                                            "isCoreTeam"
                                                        )}
                                                        onChange={(e) =>
                                                            formik.setFieldValue(
                                                                "isCoreTeam",
                                                                e.target.value
                                                            )
                                                        }>
                                                        <option
                                                            value=""
                                                            disabled>
                                                            Select CoreTeam
                                                        </option>
                                                        <option value="1">
                                                            Yes
                                                        </option>
                                                        <option value="0">
                                                            No
                                                        </option>
                                                    </select>
                                                    {formik.errors.isCoreTeam &&
                                                        formik.touched
                                                            .isCoreTeam && (
                                                            <div className="text-danger" >
                                                                {formik.errors.isCoreTeam}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            {formik?.values?.isCoreTeam ===
                                                "1" && (
                                                    <div className="mb-3">
                                                        <div>
                                                            <label
                                                                htmlFor="department"
                                                                className="form-label">
                                                                Department
                                                            </label>

                                                            <Select
                                                                isMulti={true}
                                                                options={
                                                                    departmentOptions
                                                                }
                                                                placeholder="Select option"
                                                                value={
                                                                    selectedDepartment
                                                                }
                                                                onChange={
                                                                    handleSelectChange
                                                                }
                                                            />
                                                            {formik.errors
                                                                .departmentId &&
                                                                formik.touched
                                                                    .departmentId && (
                                                                    <div className="text-danger" >
                                                                        {formik.errors.departmentId}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                            <div
                                                className="mb-3 d-flex"
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}>
                                                <label
                                                    htmlFor="displayFrom"
                                                    className="form-label">
                                                    Display From
                                                </label>
                                                <DatePicker
                                                    className="form-control"
                                                    id="displayFrom"
                                                    selectsStart
                                                    selected={
                                                        formik.values
                                                            ?.displayFromAdd
                                                    }
                                                    startDate={
                                                        formik.values
                                                            ?.displayFromAdd
                                                    }
                                                    endDate={
                                                        formik.values
                                                            ?.displayToAdd
                                                    }
                                                    onChange={(date) => {
                                                        formik.setFieldValue(
                                                            "displayFrom",
                                                            formatDate(date)
                                                        );
                                                        formik.setFieldValue(
                                                            "displayFromAdd",
                                                            date
                                                        );
                                                    }}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Enter Display From"
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={100}
                                                />
                                            </div>

                                            <div
                                                className="mb-3 d-flex"
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}>
                                                <label
                                                    htmlFor="displayTo"
                                                    className="form-label">
                                                    Display To
                                                </label>
                                                <DatePicker
                                                    className="form-control"
                                                    id="displayTo"
                                                    selected={
                                                        formik.values
                                                            ?.displayToAdd
                                                    }
                                                    selectsEnd
                                                    startDate={
                                                        formik.values
                                                            ?.displayFromAdd
                                                    }
                                                    endDate={
                                                        formik.values
                                                            ?.displayToAdd
                                                    }
                                                    minDate={
                                                        formik.values
                                                            ?.displayFromAdd
                                                    }
                                                    onChange={(date) => {
                                                        formik.setFieldValue(
                                                            "displayTo",
                                                            formatDate(date)
                                                        );
                                                        formik.setFieldValue(
                                                            "displayToAdd",
                                                            date
                                                        );
                                                    }}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Enter Display To"
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={100}
                                                />
                                            </div>

                                            <div
                                                className="mb-3 d-flex"
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}>
                                                <label
                                                    htmlFor="announcementDate"
                                                    className="form-label">
                                                    Announcement Date
                                                </label>
                                                <DatePicker
                                                    className="form-control"
                                                    selected={
                                                        formik.values
                                                            ?.announcementDate
                                                    }
                                                    onChange={(date) =>
                                                        formik.setFieldValue(
                                                            "announcementDate",
                                                            formatDate(date)
                                                        )
                                                    }
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Announcement Date"
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={100}
                                                />
                                            </div>

                                            <div className="d-flex justify-content-center align-items-center">
                                                <Button
                                                    className="btn btn-primary"
                                                    type="submit"
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
                                                            <span className=""> {id ? "Updating" : "Adding"}{" "}Announcement... </span>
                                                        </>
                                                    ) : (
                                                        <span className=""> {id ? "Update" : "Add"}{" "}Announcement</span>
                                                    )}

                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </Collapse>
                        <div className="card-body bg-white">
                          
                                {announcementList.map((announcement) => {
                                    let parsedDepartment =
                                        announcement.departments &&
                                        JSON.parse(announcement.departments);
                                    return (

                                        <React.Fragment key={announcement.id}>

                                            <div className="card pt-2 border-0">
                                                <div className="d-flex justify-content-between">
                                                    <div className="">
                                                        <label
                                                            htmlFor="toggle1"
                                                            className=""
                                                            style={{
                                                                display: "inherit",
                                                            }}>
                                                            {announcement.title}
                                                        </label>
                                                        {parsedDepartment?.length >
                                                            0 && (
                                                                <p className="fs-14 ">
                                                                    <strong>
                                                                        Department:
                                                                    </strong>{" "}
                                                                    {parsedDepartment?.join(
                                                                        " , "
                                                                    )}
                                                                </p>
                                                            )}

                                                        <div>
                                                            <p className="fs-14 ">
                                                                {announcement?.tag && (
                                                                    <>
                                                                        <strong>
                                                                            Tag:
                                                                        </strong>
                                                                        <span className=" p-1 text-black">
                                                                            {
                                                                                announcement?.tag
                                                                            }
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="fs-14 ">
                                                                {announcement?.displayFrom && (
                                                                    <>
                                                                        <strong>
                                                                            Display
                                                                            From:
                                                                        </strong>
                                                                        <span className=" p-1 text-black">
                                                                            {formatedDate(
                                                                                announcement.displayFrom
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="fs-14 ">
                                                                {announcement?.displayTo && (
                                                                    <>
                                                                        <strong>
                                                                            Display
                                                                            To:
                                                                        </strong>
                                                                        <span className="badge p-1 text-black">
                                                                            {formatedDate(
                                                                                announcement.displayTo
                                                                            )}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <span className="badge badge-soft-warning border border-1 border-warning p-2  ">
                                                                {formatRelativeTime(
                                                                    announcement.createdDate
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {(deletePermission ||
                                                        editPermission) && (
                                                            <div>
                                                                <Dropdown
                                                                    key={
                                                                        announcement.id
                                                                    }
                                                                    isOpen={
                                                                        dropdownOpen[
                                                                        announcement
                                                                            .id
                                                                        ] || false
                                                                    }
                                                                    toggle={() =>
                                                                        toggleDropdown(
                                                                            announcement.id
                                                                        )
                                                                    }
                                                                    direction="down">
                                                                    <DropdownToggle
                                                                        tag="span"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded={
                                                                            dropdownOpen[
                                                                            announcement
                                                                                .id
                                                                            ] || false
                                                                        }
                                                                        role="button"
                                                                        className="text-reset dropdown-btn p-0">
                                                                        <span className="text-muted fs-16">
                                                                            <i className="mdi mdi-dots-vertical align-middle" />
                                                                        </span>
                                                                    </DropdownToggle>
                                                                    <DropdownMenu end>
                                                                        {deletePermission && (
                                                                            <DropdownItem
                                                                                onClick={() =>
                                                                                    deleteAnnouncement(
                                                                                        announcement.id
                                                                                    )
                                                                                }>
                                                                                Delete
                                                                            </DropdownItem>
                                                                        )}
                                                                        <DropdownItem
                                                                            onClick={() =>
                                                                                updateAnnouncementData(
                                                                                    announcement
                                                                                )
                                                                            }>
                                                                            Edit /
                                                                            Update
                                                                        </DropdownItem>
                                                                    </DropdownMenu>
                                                                </Dropdown>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>

                                            <hr />
                                        </React.Fragment>

                                    );
                                })}

                                {totalPages !== currentPage &&
                                    announcementList?.length > 0 && (
                                        <div className="d-flex justify-content-center align-items-center mt-3">
                                            <Button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                    loadMoreAnnouncement()
                                                }
                                                disabled={
                                                    totalPages === currentPage
                                                }>
                                                Load More
                                            </Button>
                                        </div>
                                    )}
                         
                        </div>
                                 
                    </div>
                                 
                    {/* <span
                        onClick={() => {
                            handleAnnouncementsClose();
                            setCollapsed(false);
                        }}
                        className="btn btn-primary">
                        <i className="ri-close-line me-1 align-middle" /> Close
                    </span> */}
                </div>
            </div>
        </Offcanvas>
    );
};

export default AnnouncementsAddUpdateModal;
