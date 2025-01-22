import React, { useEffect, useState } from "react";
import { Input, Card, CardBody, Button } from "reactstrap";
import { RiLockPasswordLine } from "react-icons/ri";

const ChangePassword = ({ changePasswordFormik, errors, isPassChange }) => {
  return (
    
      
        <Card className="">
          <CardBody className="p-lg-4 p-3 mb-0">
            <form onSubmit={changePasswordFormik.handleSubmit}>
              <div className="row">
                <div className="col-sm-12">
                  <h4 className="card-title pagetab-title fw-semibold mb-4">
                    Change Password
                  </h4>
                </div>
              </div>
              <div className="row">
                <div className="col-12 mb-3">
                  <label htmlFor="oldpasswordInput" className="form-label">
                    Old Password*
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    {...changePasswordFormik.getFieldProps("oldPassword")}
                  />
                  {changePasswordFormik.touched.oldPassword &&
                    changePasswordFormik.errors.oldPassword && (
                      <div className="text-danger text-start" >
                        {changePasswordFormik.errors.oldPassword}
                      </div>
                    )}
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="newpasswordInput" className="form-label">
                    New Password*
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...changePasswordFormik.getFieldProps("newPassword")}
                  />
                  {changePasswordFormik.touched.newPassword &&
                    changePasswordFormik.errors.newPassword && (
                      <div className="text-danger text-start" >
                        {changePasswordFormik.errors.newPassword}
                      </div>
                    )}
                </div>

                <div className="col-12 mb-3">
                  <label htmlFor="confirmpasswordInput" className="form-label">
                    Confirm Password*
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...changePasswordFormik.getFieldProps("confirmPassword")}
                  />
                  {changePasswordFormik.touched.confirmPassword &&
                    changePasswordFormik.errors.confirmPassword && (
                      <div className="text-danger text-start" >
                        {changePasswordFormik.errors.confirmPassword}
                      </div>
                    )}
                </div>

                {errors.password && (
                  <>
                    <div className="text-danger">
                      <p
                        style={
                          changePasswordFormik.values.newPassword ===
                            changePasswordFormik.values.confirmPassword &&
                            changePasswordFormik.values.newPassword.length >= 8 &&
                            /[A-Z]/.test(changePasswordFormik.values.newPassword) &&
                            /\d/.test(changePasswordFormik.values.newPassword) &&
                            /\d/.test(changePasswordFormik.values.newPassword) &&
                            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                              changePasswordFormik.values.newPassword
                            )
                            ? {
                              color: "green",
                              marginBottom: 0,
                            }
                            : {
                              marginBottom: 0,
                            }
                        }
                      >
                        <RiLockPasswordLine /> Your password must have at least:
                      </p>
                      <ul
                        style={{
                          listStyleType: "none",
                          paddingLeft: 0,
                        }}
                      >
                        <li
                          style={{
                            color:
                              changePasswordFormik.values.newPassword ===
                                changePasswordFormik.values.confirmPassword
                                ? "green"
                                : "inherit",
                          }}
                        >
                          {changePasswordFormik.values.newPassword ===
                            changePasswordFormik.values.confirmPassword
                            ? "✓"
                            : "✗"}
                          Passwords match
                        </li>

                        <li
                          style={{
                            color:
                              changePasswordFormik.values.newPassword.length >= 8
                                ? "green"
                                : "inherit",
                          }}
                        >
                          {changePasswordFormik.values.newPassword.length >= 8 ? "✓" : "✗"} 8
                          characters long
                        </li>
                        <li
                          style={{
                            color: /[A-Z]/.test(changePasswordFormik.values.newPassword)
                              ? "green"
                              : "inherit",
                          }}
                        >
                          {/[A-Z]/.test(changePasswordFormik.values.newPassword) ? "✓" : "✗"} 1
                          uppercase letter
                        </li>
                        <li
                          style={{
                            color: /\d/.test(changePasswordFormik.values.newPassword)
                              ? "green"
                              : "inherit",
                          }}
                        >
                          {/\d/.test(changePasswordFormik.values.newPassword) ? "✓" : "✗"} 1
                          number
                        </li>
                        <li
                          style={{
                            color: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                              changePasswordFormik.values.newPassword
                            )
                              ? "green"
                              : "inherit",
                          }}
                        >
                          {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                            changePasswordFormik.values.newPassword
                          )
                            ? "✓"
                            : "✗"}{" "}
                          1 special character
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-1">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPassChange}
                >
                  {
                    isPassChange ? "Password Changing..." : " Change Password"
                  }
                </button>
              </div>
            </form>
          </CardBody>
        </Card>
      
  );
};

export default ChangePassword;
