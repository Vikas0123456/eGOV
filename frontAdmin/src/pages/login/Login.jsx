import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoDark from "../../assets/images/logo-dark-d.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ValidatedOTP from "../ValidateOTP/Validated";
import { decrypt, encrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { detect } from "detect-browser";
import useAxios from "../../utils/hook/useAxios";
import axios  from 'axios';
import { useDispatch } from "react-redux";
import { setUserDataAction } from "../../slices/layouts/reducer"; 
import NetcluesLogo from "../../../src/assets/images/netclues.gif";

const Login = () => {
  const dispatch = useDispatch()
  const axiosInstance = useAxios()
  const browser = detect();
  const navigate = useNavigate();
  const [isOtp, setIsOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [ip, setIp] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Please enter email"),
    password: Yup.string().required("Please enter password"),
    browserName: Yup.string(),
    ip: Yup.string(),
  });

  const findIP = async () => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      if (response && response.status === 200) {
            const result = response.data;
            setIp(result?.ip);
        }
    } catch (error) {
        console.error("Error fetching IP information:", error.message);
    }
};
  useEffect(() => {
      findIP();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      ip: ip,
      rememberMe: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const data = {
          email: values.email,
          password: values.password,
          ip: ip,
          browserName: browser.name,
          osName: browser.os,
        };

        const response = await axiosInstance.post(
          `userService/user/login`,
          data
        );

        const { otp } = response.data.data;
        if (otp === true) {
          setEmail(values.email);
          setIsOtp(true);
          setLoading(false);
        } else {
          if (values.rememberMe) {
            localStorage.setItem("username", values.email);
            localStorage.setItem("password", values.password);
          } else {
            localStorage.removeItem("username");
            localStorage.removeItem("password");
          }
          const { id } = response.data.data;
          const { token } = response.data.data;
          const userData = encrypt({ data: response.data.data });

          localStorage.setItem("userData", userData?.data);
          dispatch(setUserDataAction(response.data.data))
          setLoading(false);
          toast.success("LoggedIn successfully");
          navigate("/dashboard");
        }
      } catch (error) {
        setLoading(false);
        const { success, data } = error.response;
        setErrors({
          email: data.message,
          password: "",
        });
      }
    },
  });

  document.title = "Login | eGov Solution"

  return (
    <>
      {isOtp ? (
        <ValidatedOTP email={email} setIsOtp={setIsOtp} ip={ip} />
      ) : (
        <div
          style={{
            background:
              "linear-gradient(130deg, #f99f1e29, #466bb32b 60.07%, #df4f4329 90.05%)",
          }}
        >
          <div className="auth-page-wrapper  py-5 d-flex justify-content-center align-items-center min-vh-100">
            <div className="auth-page-content overflow-hidden pt-lg-5">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="row g-0">
                      <div className="col-lg-5 m-auto">
                        <div
                          className="card overflow-hidden border-0 mb-0"
                          style={{
                            boxShadow: "0 0px 15px rgb(0 0 0 / 10%)",
                            borderRadius: "20px",
                          }}
                        >
                          <div className="p-lg-5 p-4">
                            <div className="mb-4 text-center">
                              <img src={logoDark} alt="eGOV.." height="40" />
                            </div>
                            <>
                              <div className="text-center mb-4">
                                <h4 className="text-primary mb-2">
                                  Welcome Back !
                                </h4>
                                <p className="text-muted">
                                  Sign in to continue to eGov.
                                </p>

                                <div className="text-danger text-center"
                                  style={{ display: errors.email ? "block" : "none", }}
                                >
                                  {errors.email}
                                </div>
                                <div className="text-danger text-center"
                                  style={{ display: errors.password ? "block" : "none", }}
                                >
                                  {errors.password}
                                </div>
                                <div   className="text-danger text-center"
                                  style={{ display: errors?.loginAttepts ? "block" : "none", }}
                                >
                                  {errors?.loginAttepts}
                                </div>
                              </div>
                              <form onSubmit={formik.handleSubmit}>
                                <div className="mt-4">
                                  <div className="mb-4">
                                    <label htmlFor="username" className="form-label" > User Email </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="username"
                                      placeholder="Enter user email"
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      {...formik.getFieldProps("email")}
                                    />
                                    {formik.touched.email &&
                                      formik.errors.email && (
                                        <div className="text-danger">
                                          {formik.errors.email}
                                        </div>
                                      )}
                                  </div>
                                  <div className="mb-4">
                                    <div className="float-end">
                                      <div
                                        onClick={() =>
                                          navigate("/reset-password")
                                        }
                                        className="text-muted"
                                        style={{cursor: "pointer"}}
                                      >
                                        Forgot password?
                                      </div>
                                    </div>
                                    <label
                                      className="form-label"
                                      htmlFor="password-input"
                                    >
                                      Password{" "}
                                    </label>
                                    <div className="position-relative auth-pass-inputgroup mb-3">
                                      <input
                                        type={
                                          showPassword ? "text" : "password"
                                        }
                                        className="form-control pe-5"
                                        placeholder="Enter password"
                                        id="password-input"
                                        value={password}
                                        onChange={(e) =>
                                          setPassword(e.target.value)
                                        }
                                        {...formik.getFieldProps("password")}
                                      />
                                      {formik.touched.password &&
                                        formik.errors.password && (
                                          <div className="text-danger">
                                            {formik.errors.password}
                                          </div>
                                        )}
                                      <button
                                        className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted d-flex align-items-center justify-content-center"
                                        type="button"
                                        id="password-addon"
                                        onClick={togglePasswordVisibility}
                                      >
                                        <i className="ri-eye-fill align-middle ms-2"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="auth-remember-check"
                                      checked={formik.values.rememberMe}
                                      onChange={formik.handleChange}
                                      name="rememberMe"
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="auth-remember-check"
                                    >
                                      Remember me
                                    </label>
                                  </div>
                                  <div className="mt-5">
                                    <Button
                                      className="next btn btn-primary w-100 d-flex align-items-center justify-content-center"
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
                                            // className="fs-13"
                                            className="fs-13 me-2"
                                          />
                                          <span className="fs-13">
                                            Sign In...
                                          </span>
                                        </>
                                      ) : (
                                        <span className="fs-13">
                                          {" "}
                                          Sign In
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            </>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-5 mx-auto mt-5">
                        <div className="design-by d-flex align-items-center justify-content-center">
                          <div className="text-muted">Crafted by:</div>
                          {/* <div
                            className="netclues"
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            title="Netclues!"
                          ></div> */}
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
        </div>
      )}
    </>
  );
};

export default Login;
