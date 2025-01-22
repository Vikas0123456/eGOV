import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input, Card, CardBody, Form, Button } from "reactstrap";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { toast } from "react-toastify";
import ChangePassword from "./ChangePassword";
import Loader, { LoaderSpin } from "../../common/Loader/Loader";
import LoggedInSessionModal from "./loggedInSession";
import Swal from "sweetalert2";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import { detect } from "detect-browser";
import { Spinner } from "react-bootstrap";
import useAxios from "../../utils/hook/useAxios";
import axios from 'axios';
import { useSelector } from "react-redux";

export function stringAvatar(userData) {
    return `${userData?.name?.split("")[0].toUpperCase()}${userData?.name
        ?.split("")[1]
        .toUpperCase()}`;
}

const UpdateProfile = () => {
    const axiosInstance = useAxios()
    const getIpInfo = useSelector((state) => state?.Layout?.ipData);
    const ipAddress = getIpInfo?.ip;
    const [userInfo, setUserInfo] = useState({});
    const [profileImageUpload, setProfileImageUpload] = useState(null);
    const [modalLoginSession, setModalLoginSession] = useState(false);
    const [loginSessionList, setLoginSessionList] = useState([]);
    const browser = detect();
    const [errors, setErrors] = useState({
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [meetingLinkLoading, setMeetingLinkLoading] = useState(false);

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const token = userData?.token;
    const userId = userData?.id;

    const [meetingLink, setMeetingLink] = useState('');

    const handleMeetingLink = (e) => {
        setMeetingLink(e.target.value);
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(5, "Please enter name 5 charcter long")
            .required("Please enter name"),
        email: Yup.string()
            .email("Please enter a valid email")
            .required("Please enter email"),
        status: Yup.string().required("Please select status"),
        phone: Yup.string()
            .required("Please enter phone number")
            .matches(/^[0-9]+$/, "Phone number must be an integer"),
        documentFile: Yup.mixed().nullable(),
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            status: "",
            phone: "",
            profileImageId: "",
            documentFile: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            let newProfileImageId = null;
            if (profileImageUpload) {
                const formData = new FormData();
                formData.append("viewDocumentName", values?.name);
                formData.append("documentFile", values?.documentFile);
                formData.append("userId", userDecryptData?.data?.id);
                formData.append("isGenerated", "0");
                formData.append("isShowInDocument", "0");
                let fileResponse = await axiosInstance.post(
                    "documentService/uploading",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                newProfileImageId = fileResponse?.data?.data
                    ? fileResponse?.data?.data?.[0]?.id
                    : null;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.put(
                    `userService/user/profile-update`,
                    {
                        name: values?.name,
                        phone: values?.phone,
                        email: values?.email,
                        status: values?.status,
                        profileImageId: newProfileImageId
                            ? newProfileImageId
                            : values?.profileImageId,
                        userId: userDecryptData?.data?.id,
                    }
                );

                if (response) {
                    setProfileImageUpload(null);
                    fetchUserProfile();
                    toast.success("Profile updated successfully.");
                    setLoading(false);
                } else {
                    setLoading(false);
                    toast.error(
                        "Something went wrong. Please check and try again"
                    );
                }
            } catch (error) {
                console.error(error.message);
            }
        },
    });

    const changePasswordValidationSchema = Yup.object().shape({
        oldPassword: Yup.string().required("Please enter old password"),
        newPassword: Yup.string().required("Please enter new password"),
        confirmPassword: Yup.string()
            .required("Please confirm your password")
            .oneOf([Yup.ref("newPassword")], "Passwords must match"),
    });

    const [isPassChange, setIsPassChange] = useState(false);
    const changePasswordFormik = useFormik({
        initialValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: changePasswordValidationSchema,
        onSubmit: async (values) => {
            try {
                setIsPassChange(true);
                let responseChangePassword = await axiosInstance.put(
                    `userService/user/change-password`,
                    {
                        oldPassword: values.oldPassword,
                        newPassword: values.newPassword,
                        confirmPassword: values.confirmPassword,
                        userId: userDecryptData?.data?.id,
                    }
                );
                if (responseChangePassword) {
                    changePasswordFormik.resetForm();
                    setErrors({
                        password: "",
                    });
                    toast.success("Password changed successfully.");
                    setIsPassChange(false);
                } else {
                    setIsPassChange(false);
                    toast.error(
                        "Something went wrong. Please check info and try again"
                    );
                }
            } catch (error) {
                const { data } = error.response;
                setErrors({
                    password: data.message,
                });
                toast.info(data.message);
                console.error(error.message);
                setIsPassChange(false);
            }
        },
    });

    const handleMeetingLinkToUser = async () => {
        try {
            if (meetingLink) {
                setMeetingLinkLoading(true);
                const response = await axiosInstance.put(`userService/user/update`, {
                    id: userId,
                    meetingLink,
                    ipAddress: ipAddress,
                });
                if (response) {
                    setMeetingLinkLoading(false);
                }
            }
        } catch (error) {
            setMeetingLinkLoading(false);
            console.log("Error : ", error);
        }
    }

    const handleImageUpload = (file) => {
        if (file) {
            const allowedFormats = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp",
            ];

            const maxSize = 1024 * 1024; // 1MB in bytes
            if (file.size > maxSize) {
                formik.setFieldError(
                    "documentFile",
                    "Please select an image file that is less than 1MB."
                );
                return;
            }

            if (allowedFormats.includes(file.type)) {
                formik.setFieldValue("documentFile", file);
                setProfileImageUpload(file);
                formik.setFieldError("documentFile", "");
            } else {
                formik.setFieldError(
                    "documentFile",
                    "Please select a valid image file (JPEG, JPG, or PNG)."
                );
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const droppedFile = event.dataTransfer.files[0];
        handleImageUpload(droppedFile);
    };

    const [initialFormValues, setInitialFormValues] = useState({
        name: "",
        email: "",
        status: "",
        phone: "",
        profileImageId: "",
        documentFile: "",
    });
    const [isFormChanged, setIsFormChanged] = useState(false);

    useEffect(() => {
        setIsFormChanged(
            JSON.stringify(formik.values) !== JSON.stringify(initialFormValues)
        );
    }, [formik.values, initialFormValues]);

    const [isLoading, setIsLoading] = useState(false);
    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const data = {
                id: userDecryptData?.data?.id,
            };
            const response = await axiosInstance.post(
                `userService/user/view`,
                data
            );

            if (response) {
                let info = response?.data?.data.rows[0];
                setUserInfo(info);
                const initialValues = {
                    name: info?.name || "",
                    email: info?.email || "",
                    phone: info?.phone || "",
                    status: info?.status || "",
                    profileImageId: info?.profileImageId || "",
                    documentFile: info?.imageData?.documentPath || null,
                };
                setInitialFormValues(initialValues);
                formik.setValues(initialValues);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    const fetchLoginSessions = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(
                `userService/user/login-session/view`,
                { userId: userId }
            );

            // if (response && response.data && response.data.data) {
            //     const dataObject = response?.data?.data;
            //     const rows = Object.keys(dataObject).map(
            //         (key) => dataObject[key]
            //     );
            //     setLoginSessionList(rows.length > 0 ? rows : []);
            //     setIsLoading(false);
            // }
            if (response) {
                const { count, rows } = response?.data?.data;
                setLoginSessionList(rows.length > 0 ? rows : []);
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchLoginSessions();
    }, []);

    const deleteSession = async (deleteIdArr) => {
        let newDeleteIdArr = deleteIdArr;

        const result = await Swal.fire({
            title: "Are you sure?",
            text:
                newDeleteIdArr.length > 1
                    ? "You want to delete all sessions!"
                    : "You want to delete this session!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#303e4b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                const response = await axiosInstance.put(
                    `userService/user/login-session/delete`,
                    {
                        ids: newDeleteIdArr,
                    }
                );
                if (response) {
                    toast.success(`Session deleted successfully.`);
                    fetchLoginSessions();
                    setIsLoading(false);
                } else {
                    toast.error(response?.message);
                    setIsLoading(false);
                }
            } catch (error) {
                setIsLoading(false);
                toast.error(`Failed to delete session.`);
                console.error(error);
            }
        }
    };

    function loginSessionModalOpen() {
        setModalLoginSession(!modalLoginSession);
    }

    document.title = "Profile | eGov Solution"

    return (
        <>

            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">
                                            My Profile
                                        </h4>
                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="card-title pagetab-title fw-semibold mb-4">
                                    Here you can edit your personal information.
                                </h4>
                            </div>
                            {isLoading ? (
                                <LoaderSpin />
                            ) : (
                                <div className="row">
                                    <div className="col-xxl-8 col-xl-8 col-lg-8 col-12">
                                        <form onSubmit={formik.handleSubmit} >


                                            <Card className="mb-4">
                                                <CardBody className="p-lg-4 p-3 mb-0">
                                                    {/* image upload here */}
                                                    <div className="row">
                                                        <div className="col-md-3 d-flex m-auto justify-content-center">
                                                            <div className="profile-user position-relative" onDragOver={handleDragOver} onDrop={handleDrop} >
                                                                {!userInfo
                                                                    ?.imageData
                                                                    ?.documentPath &&
                                                                    !profileImageUpload ? (
                                                                    <div > {stringAvatar(userInfo)}
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={
                                                                            !profileImageUpload
                                                                                ? formik
                                                                                    ?.values
                                                                                    ?.documentFile
                                                                                : URL.createObjectURL(
                                                                                    profileImageUpload
                                                                                )
                                                                        }
                                                                        className="rounded-circle avatar-xxl img-thumbnail"
                                                                        alt="user-profile-image0"

                                                                    />
                                                                )}

                                                                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                                                                    <input id="profile-img-file-input" type="file" className="profile-img-file-input" accept="image/*"
                                                                        onChange={(event) => handleImageUpload(event.target.files[0])}
                                                                    />
                                                                    <label
                                                                        htmlFor="profile-img-file-input"
                                                                        className="profile-photo-edit avatar-xs"
                                                                    >
                                                                        <span className="avatar-title rounded-circle bg-light text-body">
                                                                            <i className="ri-camera-fill" />
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                                {formik
                                                                    .errors
                                                                    .documentFile && (
                                                                        <div className="text-danger" >
                                                                            {formik.errors.documentFile}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>

                                                        <div className="col-md-9 ">
                                                            <div className="row">
                                                                <div className="col-md-6 mb-3">
                                                                    <label htmlFor="status" className="form-label" > Status </label>
                                                                    <select className="form-control"
                                                                        value={formik.values.status}
                                                                        {...formik.getFieldProps("status")}
                                                                        disabled
                                                                    >
                                                                        <option value=""> Select Status </option>
                                                                        <option value="1"> Active </option>
                                                                        <option value="0"> Inactive </option>
                                                                    </select>
                                                                    {formik
                                                                        .errors
                                                                        .status &&
                                                                        formik
                                                                            .touched
                                                                            .status && (
                                                                            <div className="text-danger" >
                                                                                {formik.errors.status}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                                <div className="col-md-6 mb-3">
                                                                    <div className="cm-floating">
                                                                        <label htmlFor="name" className="form-label" > Name </label>
                                                                        <Input type="text" {...formik.getFieldProps("name")} />
                                                                        {formik.touched.name && formik.errors.name && (
                                                                            <div className="text-danger text-start" >
                                                                                {formik.errors.name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6 mb-3">
                                                                    <div className="cm-floating">
                                                                        <label htmlFor="email" className="form-label" > Email </label>
                                                                        <Input
                                                                            type="text" {...formik.getFieldProps("email")}
                                                                            disabled={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6 mb-3">
                                                                    <label htmlFor="phone" className="form-label" > Phone </label>
                                                                    <Input type="text" {...formik.getFieldProps("phone")} />
                                                                    {formik
                                                                        .touched
                                                                        .phone &&
                                                                        formik
                                                                            .errors
                                                                            .phone && (
                                                                            <div className="text-danger text-start" >
                                                                                {formik.errors.phone}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                                <div className="col-12 text-end">
                                                                    <button type="submit" className="btn btn-primary mt-1 " disabled={!isFormChanged || loading} >
                                                                        {loading ? (
                                                                            <>
                                                                                <Spinner
                                                                                    animation="border"
                                                                                    size="sm"
                                                                                    role="status"
                                                                                    aria-hidden="true"
                                                                                    className="fs-13"
                                                                                />
                                                                                <span className=""> Saving... </span>
                                                                            </>
                                                                        ) : (
                                                                            <span className=""> Save & Keep Editing </span>
                                                                        )}
                                                                        <div className="flex-grow-1">  </div>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                        </form>
                                     
                                                <Card >
                                                    <CardBody className="p-lg-4 p-3 mb-0">
                                                        <div className="col-12">
                                                            <h4 className="mb-3">BooknMeet Meeting Link</h4>
                                                            <div className="card border-0 p-0 h-100 cursor mb-0">
                                                                <div className="card-body p-0">
                                                                    {/* <div className="avatar-sm flex-shrink-0">
                                                                <span className="avatar-title bg-info rounded-circle fs-2">
                                                                    <i className="ri-account-box-line"></i>
                                                                </span>
                                                            </div> */}


                                                                    <div className=" w-100">
                                                                        <textarea
                                                                            className="form-control mt-0   w-100"
                                                                            value={meetingLink}
                                                                            onChange={handleMeetingLink}
                                                                            rows={2}
                                                                            style={{ resize: 'none' }}
                                                                        ></textarea>
                                                                        <button
                                                                            className="btn btn-primary"
                                                                            onClick={handleMeetingLinkToUser}
                                                                            style={{ whiteSpace: 'nowrap' }}
                                                                            disabled={meetingLinkLoading}
                                                                        >
                                                                            {meetingLinkLoading ? (
                                                                                <>
                                                                                    <Spinner
                                                                                        animation="border"
                                                                                        size="sm"
                                                                                        role="status"
                                                                                        aria-hidden="true"
                                                                                        className="fs-13"
                                                                                    />
                                                                                    <span className=""> Saving... </span>
                                                                                </>
                                                                            ) : (
                                                                                <span className=""> Save </span>
                                                                            )}

                                                                        </button>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                           
                                    </div>
                                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-12 mb-4">
                                        <ChangePassword changePasswordFormik={changePasswordFormik} errors={errors} isPassChange={isPassChange} loading={loading} />
                                        <Card className="">
                                            <CardBody className="p-lg-4 p-3 ">
                                                <div className="col-12">
                                                    <div className="card cursor mb-0 "
                                                        onClick={() => loginSessionModalOpen()}
                                                    >
                                                        <div className="card-body d-flex align-items-center cursor-pointer">
                                                            <div className="avatar-sm flex-shrink-0">
                                                                <span className="avatar-title bg-info rounded-circle fs-2">
                                                                    <i className=" ri-smartphone-line"></i>
                                                                </span>
                                                            </div>
                                                            <div className="ms-3">
                                                                <h6> Logged in Sessions </h6>
                                                                <p className="mb-0"> List of devices/sessions where you're currently logged in </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <LoggedInSessionModal
                                                    modalLoginSession={
                                                        modalLoginSession
                                                    }
                                                    loginSessionModalOpen={
                                                        loginSessionModalOpen
                                                    }
                                                    loginSessionList={
                                                        loginSessionList
                                                    }
                                                    deleteSession={
                                                        deleteSession
                                                    }
                                                    token={token}
                                                />
                                            </CardBody>
                                        </Card>
                                    </div>


                                </div>
                            )}



                        </div>
                    </div>
                </div>
            </div>

            <ScrollToTop />
        </>
    );
};

export default UpdateProfile;
