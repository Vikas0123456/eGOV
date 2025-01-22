import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoDark from "../../assets/images/logo-dark-d.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import useAxios from "../../utils/hook/useAxios";
import NetcluesLogo from "../../../src/assets/images/netclues.gif";

const ResetPassword = () => {
  const axiosInstance = useAxios()
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Please enter email"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let data = {
          email: values.email,
        };

        const response = await axiosInstance.post(
          `userService/user/forgot-password`,
          data
        );
        if (response) {
          setErrors({
            email: "",
            password: "",
          });
          setIsResetSuccessful(true);
          toast.success("Reset password link sent successfully");
          setLoading(false);
          values.email = "";
        }
      } catch (error) {
        setLoading(false);
        if (error.response) {
          const { success, data } = error.response.data;
          if (data.message === "email is not registered with us....") {
            setIsResetSuccessful(false);
            setLoading(false);
            setErrors({
              email: "User not found. Please check your email and try again.",
              password: "",
            });
          } else if (
            data.message ===
            "Email not sent: The domain or email address is blocked."
          ) {
            setIsResetSuccessful(false);
            setLoading(false);
            setErrors({
              email: "Email not sent. The domain or email address is blocked.",
              extra: "Please contact administrator for further assistance",
            });
          } else {
            setErrors({
              email:
                "Something went wrong.Please check your email and try again.",
              password: "",
            });
          }
        }
      }
    },
  });

  useEffect(() => {
    if (formik.values.email === "") {
      setErrors({
        email: "",
        password: "",
      });
    }
    if (formik.values.email.length > 0) {
      setIsResetSuccessful(false);
    }
  }, [formik.values]);

  document.title = "Reset Password | eGov Solution"
  return (
    <>
      <div
        style={{
          background:
            "linear-gradient(130deg,#f99f1e29,#466bb32b 60.07%,#df4f4329 90.05%)",
        }}
      >
        <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
          <div className="auth-page-content overflow-hidden pt-lg-5">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="row justify-content-center g-0">
                    <div className="col-lg-5">
                      <div
                        className="card overflow-hidden border-0 mb-0"
                        style={{
                          boxShadow: "0 0px 15px rgb(0 0 0 / 10%)",
                          borderRadius: "20px",
                        }}
                      >
                        <div className="p-lg-5 p-4">
                          <div className="mb-4 text-center">
                            <a href="dashboard-analytics.html">
                              <img src={LogoDark} alt="" height="40" />
                            </a>
                          </div>
                          <div className="text-center">
                            <h5 className="text-primary">Forgot Password?</h5>
                            <p className="text-muted">
                              Reset password with eGov
                            </p>
                          </div>
                          <div className="mt-2 text-center">
                            <lord-icon
                              src="https://cdn.lordicon.com/rhvddzym.json"
                              trigger="loop"
                              colors="primary:#0ab39c"
                              className="avatar-xl"
                            ></lord-icon>
                          </div>
                          <div
                            className="alert alert-borderless alert-warning text-center mb-2 mx-2"
                            role="alert"
                          >
                            Enter your email and instructions will be sent to
                            you!
                          </div>
                          <div className="text-danger text-start"
                            style={{ textAlign: "center", display: errors.email ? "block" : "none", }}
                          >
                            {errors.email}
                            <br></br>
                            {errors?.extra}
                          </div>
                          {isResetSuccessful && (
                            <div className="text-success text-start d-block" >
                              Reset password mail sent successfully!
                            </div>
                          )}
                           <form onSubmit={formik.handleSubmit}>
                          <div className="p-2">
                            <div className="mb-4">
                              <label className="form-label">Email</label>
                              <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Enter user email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                {...formik.getFieldProps("email")}
                              />
                              {formik.touched.email && formik.errors.email && (
                                <div className="text-danger">
                                  {formik.errors.email}
                                </div>
                              )}
                            </div>
                            <div className="text-center mt-4">
                              <Button
                                className="btn btn-primary w-100"
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
                                    <span className="fs-13">
                                      {" "}
                                      Loading...
                                    </span>
                                  </>
                                ) : (
                                  <span className="fs-13">
                                    {" "}
                                    Send Reset Link
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                          </form>
                          <div
                            onClick={() => navigate("/")}
                            className="mt-5 text-center"
                          >
                            <div className="mb-0">
                              Wait, I remember my password...{" "}
                              <p className="fw-semibold text-primary text-decoration-underline" style={{cursor: "pointer"}}>
                                {" "}
                                Click here{" "}
                              </p>{" "}
                            </div>
                          </div>
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
                          href="https://www.netclues.ky"
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
    </>
  );
};

export default ResetPassword;
