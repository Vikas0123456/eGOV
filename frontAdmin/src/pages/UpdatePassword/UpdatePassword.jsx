import React, { useState,useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import logoDark from "../../assets/images/logo-dark-d.png";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { Alert, Form, FormFeedback, Input, Label, Spinner, UncontrolledAlert } from "reactstrap";
import { Button } from "react-bootstrap";
import { RiLockPasswordLine } from "react-icons/ri";
import useAxios from "../../utils/hook/useAxios";
import UnauthorizedModal from "./UnauthorizedModal";
import NetcluesLogo from "../../../src/assets/images/netclues.gif";
import InvalidLinkModal from "./InvalidLinkModal";

function UpdatePassword() {
  const axiosInstance = useAxios()

  const navigate = useNavigate();
  const { userId } = useParams();
  const decryptuserId = decrypt({ data: userId });
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const [openInvalidLinkmodal, setInvalidLinkmodal] = useState(false)
  const [isInvalidLink, setIsInvalidLink] = useState(false)

  const toggleShowInvalidLink = () => {
    setInvalidLinkmodal(!openInvalidLinkmodal)
  }

  const toggleErrorModal = () => {
    setErrorModalOpen(!errorModalOpen)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setConfirmPassword(!showConfirmPassword);
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("Please enter password")
      .min(8, "Password must be at least 8 characters")
      .matches(/[0-9]/, "1 number is required")
      .matches(/[A-Z]/, "1 Capital letter is required ")
      .matches(/[^\w]/, "1 Special character is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Password must match")
      .required("Please enter confirm password")
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
      userId: decryptuserId,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axiosInstance.post(
          `userService/user/isvalidlink`,
          {
            userId: decryptuserId,
          }
        );
  
        if (response?.data?.data?.linkExpired) {
          setInvalidLinkmodal(response?.data?.data?.linkExpired)
        }else{
          const response = await axiosInstance.put(
            `userService/user/create-password`,
            {
              password: values.password,
              confirmPassword: values.confirmPassword,
              userId: decryptuserId,
            }
          );
  
          if (response?.data?.data) {
            setLoading(false);
            toast.success("Password update successfully");
            setErrors({
              password: "",
            });
            setIsResetSuccessful(true);
            navigate("/");
          }
        }
      } catch (error) {
        setLoading(false);
        setInvalidLinkmodal(true)
        setIsResetSuccessful(false);
        const { success, data } = error.response;
        setErrors({
          password: data.message,
        });
      }
    },
  });

  const resendLink = async () => {
    try {
      let data = {
        userID: decryptuserId,
      };
      const response = await axiosInstance.post(
        `userService/user/forgot-password`,
        data
      );
      if (response) {
        setInvalidLinkmodal(false);
        navigate("/")
      }
    } catch (error) {

    }
  }
  const checkValidLink = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/user/isvalidlink`,
        {
          userId: decryptuserId,
        }
      );

      if (response?.data) {
        setInvalidLinkmodal(response?.data?.data?.linkExpired)
      }
    } catch (error) {
      if(error?.response?.data?.message === "Failed to fetch User info"){
        setIsInvalidLink(true)
        setInvalidLinkmodal(true)
      }
    }
  }
  useEffect(() => {
    checkValidLink()
  }, [])

  document.title = "Update Password | eGov Solution"
  return (
    <>
      <div
        style={{
          background:
            "linear-gradient(130deg, #f99f1e29, #466bb32b 60.07%, #df4f4329 90.05%)",
        }}
      >
        <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
          <div className="auth-page-content overflow-hidden pt-lg-5">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="row g-0">
                    <div className="col-lg-5 m-auto">
                      <div className="card overflow-hidden border-0 mb-0" style={{ boxShadow: "0 0px 15px rgb(0 0 0 / 10%)", borderRadius: "20px", }} >
                        <div className="p-lg-5 p-4">
                          <div className="mb-4 text-center">
                            <img src={logoDark} alt="eGOV.." height="40" />
                          </div>
                          <div className="text-center mb-5">
                            <h4 className="text-primary mb-2">
                              Welcome Back !
                            </h4>
                            <p className="text-muted">
                              Sign in to continue to eGov.
                            </p>
                            {isResetSuccessful && (
                              <div className="text-success text-start d-block" >
                                Password updated successfully!
                              </div>
                            )}
                          </div>
                          <form onSubmit={formik.handleSubmit}>
                            <div className="mt-4">
                              <div className="mb-4">
                                <label className="form-label" htmlFor="password-input" >
                                  New Password{" "}
                                </label>
                                <div className="position-relative auth-pass-inputgroup mb-3">
                                  <input className="form-control pe-5" placeholder="Enter password" id="password-input"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    {...formik.getFieldProps("password")}
                                  />
                                  {formik.touched.password &&
                                    formik.errors.password === "Please enter password" && (
                                      <div className="text-danger">
                                        {formik.errors.password}
                                      </div>
                                    )}
                                  <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon"
                                    onClick={toggleConfirmPasswordVisibility} >
                                    <i className="ri-eye-fill align-middle"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="float-end">
                                  <span onClick={() => navigate("/")} className="text-muted cursor-pointer"  >
                                    Login In?
                                  </span>
                                </div>
                                <label className="form-label" htmlFor="password-input" > Confirm New Password{" "} </label>
                                <div className="position-relative auth-pass-inputgroup mb-3">
                                  <input type={showPassword ? "text" : "password"} className="form-control pe-5" placeholder="Enter password" id="password-input"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    {...formik.getFieldProps("confirmPassword")}
                                  />
                                  {formik.touched.confirmPassword &&
                                    formik.errors.confirmPassword && (
                                      <div className="text-danger">
                                        {formik.errors.confirmPassword}
                                      </div>
                                    )}

                                  <div className="text-danger mt-3" >
                                    {(formik?.values?.password || formik?.values?.confirmPassword) && (
                                      <>

                                        <ul className="ps-0 list-unstyled fs-15" >
                                          <li>
                                            <Alert color={(formik.values.password === formik.values.confirmPassword && formik.values.password.length >= 8 && /[A-Z]/.test(formik.values.password) && /\d/.test(formik.values.password) && /\d/.test(formik.values.password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formik.values.password)) ? 'success' : 'danger'} className="alert-label-icon rounded-label material-shadow" >
                                              <i className={(formik.values.password === formik.values.confirmPassword && formik.values.password.length >= 8 && /[A-Z]/.test(formik.values.password) && /\d/.test(formik.values.password) && /\d/.test(formik.values.password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formik.values.password)) ? ' ri-lock-line label-icon me-2' : 'ri-lock-unlock-line label-icon me-2'}></i>
                                              Your password must have at least
                                            </Alert>
                                          </li>
                                          <li className="mb-1" >
                                            <div className={formik.values.password === formik.values.confirmPassword ? 'text-success' : 'text-danger'}>
                                              <i className={formik.values.password === formik.values.confirmPassword ? ' ri-check-double-line label-icon me-2' : 'ri-error-warning-line label-icon me-2'}></i> Passwords match
                                            </div>
                                          </li>
                                          <li className="mb-1">
                                            <div className={formik.values.password.length >= 8 ? 'text-success' : 'text-danger'} >
                                              <i className={formik.values.password.length >= 8 ? ' ri-check-double-line label-icon me-2' : 'ri-error-warning-line label-icon me-2'}></i> 8 characters long
                                            </div>
                                          </li>
                                          <li className="mb-1">
                                            <div className={/[A-Z]/.test(formik.values.password) ? 'text-success' : 'text-danger'}>
                                              <i className={/[A-Z]/.test(formik.values.password) ? ' ri-check-double-line label-icon me-2' : 'ri-error-warning-line label-icon me-2'}></i> 1 uppercase letter
                                            </div>
                                          </li>
                                          <li className="mb-1">
                                            <div className={/\d/.test(formik.values.password) ? 'text-success' : 'text-danger'}>
                                              <i className={/\d/.test(formik.values.password) ? ' ri-check-double-line label-icon me-2' : 'ri-error-warning-line label-icon me-2'}></i> 1 number
                                            </div>
                                          </li>
                                          <li className="mb-1">
                                            <div className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formik.values.password) ? 'text-success' : 'text-danger'}>
                                              <i className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formik.values.password) ? ' ri-check-double-line label-icon me-2' : 'ri-error-warning-line label-icon me-2'}></i> 1 special character
                                            </div>
                                          </li>
                                        </ul>

                                      </>
                                    )}
                                  </div>
                                  <button className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted" type="button" id="password-addon" onClick={togglePasswordVisibility} >
                                    <i className="ri-eye-fill align-middle"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="mt-5">
                                <Button className="btn btn-primary w-100" type="submit" disabled={loading} >
                                  {loading ? (
                                    <>
                                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="fs-13 me-2" />
                                      <span className="fs-13"> {" "} Updating Password... </span>
                                    </>
                                  ) : (
                                    <span className="fs-13"> {" "} Update Password </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-5 mx-auto mt-5">
                      <div className="design-by d-flex align-items-center justify-content-center">
                        <span className="text-muted">Crafted by:</span>
                        {/* <span className="netclues" href="#" target="_blank" rel="noopener noreferrer nofollow" title="Netclues!" ></span> */}
                        <a
                          href="https://www.netclues.ky/"
                          title="Netclues!"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', verticalAlign: 'middle' }}
                        >
                          <img
                            className="ms-2"
                            src={NetcluesLogo}
                            alt="netclues"
                            style={{ height: 24 }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UnauthorizedModal show={errorModalOpen} setShow={setErrorModalOpen} toggleShow={toggleErrorModal} />
        <InvalidLinkModal show={openInvalidLinkmodal} setShow={setInvalidLinkmodal} toggleShow={toggleShowInvalidLink} resendLink={resendLink} isInvalidLink={isInvalidLink} setIsInvalidLink={setIsInvalidLink} />

      </div>
    </>
  );
}

export default UpdatePassword;
