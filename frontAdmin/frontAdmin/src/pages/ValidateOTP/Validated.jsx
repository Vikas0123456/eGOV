import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { IoHelpCircleSharp } from "react-icons/io5";
import LogoDark from "../../assets/images/login/logo-dark-d.png";
import LogoFront from "../../assets/images/login/logo-front.png";
import { toast } from "react-toastify";
import "./validate.css";
import { Button, Spinner } from "react-bootstrap";
import OtpInput from "react-otp-input";
import * as Yup from "yup";
import { encrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { detect } from "detect-browser";
import useAxios from "../../utils/hook/useAxios";

const ValidatedOTP = ({ email, setIsOtp, ip }) => {
  const axiosInstance = useAxios()

  const browser = detect();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const resendOTP = async () => {
    try {
      setDisabled(true);
      const data = {
        email: email,
      };
      const response = await axiosInstance.post(
        `userService/user/resend-otp`,
        data
      );
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setTimeout(() => {
        setDisabled(false);
      }, 60000);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      resendOTP();
    }
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("Please fill all OTP fields")
        .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        setLoading(true);
        const data = {
          email: email,
          otp: JSON.parse(values.otp),
          ip: ip,
          osName: browser.os,
        };
        const response = await axiosInstance.post(
          `userService/user/verify-otp`,
          data
        );
        const { id, token } = response.data.data;
        const userData = encrypt({ data: response.data.data })

        localStorage.setItem("userData", userData?.data);
        setLoading(false);
        toast.success("User verified successfully");
        navigate("/dashboard");
      } catch (error) {
        setLoading(false);
        const { data } = error.response;
        setErrors({ otp: data.message });
      }
    },
  });

  const handleOtpChange = (otpValue) => {
    formik.setFieldValue("otp", otpValue);
  };

  useEffect(() => {
    const isOTPComplete = formik.values.otp.length === 6;
    if (isOTPComplete) {
      formik.handleSubmit();
    }
  }, [formik.values.otp]);

  const otpInputStyle = {
    minWidth: "45px",
    minHeight: "40px",
    textAlign: "center",
  };
  const inputStyleWithGap = {
    ...otpInputStyle,
    margin: "0 4px",
  };

  document.title = "OTP Validation | eGov Solution"

  return (
    <section className="bgMain">
      <div className="container h-100 ">
        <div className="row align-items-center h-100">
          <div className="col-12 col-lg-6 d-none d-lg-flex h-100 flex-column justify-content-between">
            <div className="mt-5">
              <a href="login.html" title="eGOV">
                <img src={LogoFront} alt="Logo" />
              </a>
            </div>
            <div className="mb-5">
              <div className="btn btn-primary rounded-pill d-inline-flex align-items-center px-4 py-3" title="Help" >
                <IoHelpCircleSharp className="icon-md" />
                <span className="ms-2 fs-12" >
                  Help
                </span>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 position-relative">
            <div className="formMain h-100" data-simplebar="init">
              <div className="mt-5 d-block d-lg-none text-center">
                <a href="login.html" title="eGOV">
                  <img src={LogoDark} alt="Logo" style={{ height: "34px", width: "auto" }} />
                </a>
              </div>
              <h1 className="ff-pop fw-semibold text-black text-center mb-4 pb-2 pt-5">
                Enter the 6-digit code sent to your email.
              </h1>
              <p className=" mb-4 text-center text-primary">
                This helps us keep your account secure by verifying that it's really you.
              </p>
              <form onSubmit={formik.handleSubmit} className="from-list w-100 mx-auto" >
                <div className="otp-part">
                  <div id="otp" className="inputs d-flex flex-row justify-content-center" >
                    <OtpInput
                      value={formik.values.otp}
                      onChange={handleOtpChange}
                      className="form-control mx-1"
                      numInputs={6}
                      containerStyle={otpInputStyle}
                      separator={<span> </span>}
                      inputStyle={inputStyleWithGap}
                      renderInput={(props) => <input {...props} />}
                    />
                  </div>
                  <div className="d-flex justify-content-center">
                    {formik.errors.otp && (
                      <div className="text-danger w-60">
                        {formik.errors.otp}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="hstack gap-2 justify-content-center pt-sm-5 pt-3">
                      <span onClick={() => setIsOtp(false)} className="previous btn btn-outline-dark w-100 opacity-50" >
                        Cancel
                      </span>
                      <button id="validateBtn" className="next btn btn-primary w-100" type="submit" disabled={loading} >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="fs-13" />
                            <span className="fs-13"> Validating... </span>
                          </>
                        ) : (
                          <span className="fs-13"> {" "} Validate </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <p className="mb-0">
                    Didn't receive a code ?{" "}
                    {disabled ? (
                      <span className="fw-semibold " style={{ cursor: "not-allowed", color: "#bdd3ff" }} >
                        Resend
                      </span>
                    ) : (
                      <span style={{ cursor: "pointer" }} className={`fw-semibold text-primary text-decoration-underline`} onClick={handleClick} >
                        Resend
                      </span>
                    )}
                  </p>
                </div>
              </form>
              <div className="mt-5 pt-5 text-center">
                <ul className="d-flex align-items-center justify-content-center m-0 p-0">
                  <li className="d-inline">
                    <span type="button" className="fs-12" data-bs-toggle="modal" data-bs-target="#terms-condition" >
                      Terms and Conditions
                    </span>
                  </li>
                  <li className="d-inline mx-1 fs-12">|</li>
                  <li className="d-inline">
                    <span type="button" className="fs-12" data-bs-toggle="modal" data-bs-target="#privpolicy" >
                      Privacy Policy
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValidatedOTP;
