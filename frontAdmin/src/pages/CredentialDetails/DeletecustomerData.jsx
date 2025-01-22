import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
import useAxios from "../../utils/hook/useAxios";
import { toast } from "react-toastify"; // Import react-toastify
import Swal from "sweetalert2"; // Import SweetAlert2
import { Container, Row } from "reactstrap";

const DeleteCustomerData = () => {
    const axiosInstance = useAxios();

    // Formik with validation schema
    const formik = useFormik({
        initialValues: {
            email: "", // Initial value for email
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address") // Ensures valid email format
                .required("Email is required"), // Ensures email is not empty
        }),
        onSubmit: async (values, { resetForm }) => {
            const result = await Swal.fire({
                title: `Are you sure you want to delete data for ${values.email}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#2960cc",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            });
    
            if (!result.isConfirmed) {
                toast.info("Action cancelled");
                return;
            }
    
            try {
                const response = await axiosInstance.post(
                    `userService/customer/deleteCustomerAllServiceData`,
                    { email: values.email }
                );
                toast.success("Customer data deleted successfully!");
                console.log("API Response:", response);
                resetForm(); // Resets the form after successful submission
            } catch (error) {
                toast.error(
                    "Failed to delete customer data. Please try again."
                );
                console.error("Error deleting customer data:", error);
            }
        },
    });
    

    return (
        <Container className="page-content">
            <Row className="align-items-center">
                <div className="text-center mb-4 mt-4">
                    <a
                        href="https://egov.adminportal.netcluesdemo.com"
                        target="_blank"
                        title="Netclues">
                        <img
                            src="https://egov.api.netcluesdemo.com/document/documentFile-1732861710999.png"
                            alt="Netclues"
                            width="150"
                        />
                    </a>
                </div>
                <div
                    className="row"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}>
                    <div className="col-9">
                        <div className="card p-4">
                            <h3 className="mb-sm-0">Delete Customer Data</h3>
                            <div className="mt-2">
                                <h6>
                                    Deleting this customer will permanently
                                    remove all associated data, including their
                                    account information, history, and linked
                                    records. Once deleted, this data cannot be
                                    recovered. If you wish to use our services
                                    in the future, you will need to create a new
                                    account, as the deleted account cannot be
                                    restored.{" "}
                                </h6>
                                <br></br>
                                <h4>
                                    {" "}
                                    <strong>Action Steps:</strong>{" "}
                                </h4>
                                <ol>
                                    <li>
                                        <h6>
                                            {" "}
                                            <strong>Review Data:</strong> Ensure
                                            you have reviewed and download the
                                            necessary data before proceeding
                                            with deletion.
                                        </h6>
                                    </li>
                                    <li>
                                        <h6>
                                            {" "}
                                            <strong>
                                                Email Confirmation:
                                            </strong>{" "}
                                            To confirm the deletion, enter the
                                            customer's registered email address
                                            in the field provided.
                                        </h6>
                                    </li>
                                    <li>
                                        <h6>
                                            {" "}
                                            <strong>
                                                Final Confirmation:
                                            </strong>{" "}
                                            After entering the email, click the{" "}
                                            <em>Yes, Delete it!</em> button to
                                            proceed.
                                        </h6>
                                    </li>
                                </ol>

                                <h6>
                                    <strong>Important:</strong> This action is
                                    irreversible. Please double-check all
                                    information before confirming.
                                </h6>
                            </div>
                        </div>
                    </div>

                    {/* <div className="row"> */}
                    <div className="col-9">
                        <div className="card p-4">
                            {/* Form Section */}
                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label">
                                        Customer Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`form-control ${
                                            formik.touched.email &&
                                            formik.errors.email
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        placeholder="Enter email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur} // Triggers validation on blur
                                    />
                                    {/* Validation Error Message */}
                                    {formik.touched.email &&
                                    formik.errors.email ? (
                                        <div className="invalid-feedback">
                                            {formik.errors.email}
                                        </div>
                                    ) : null}
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-danger">
                                    Delete Data
                                </button>
                            </form>
                        </div>
                        {/* </div> */}
                    </div>
                </div>
            </Row>
        </Container>
    );
};

export default DeleteCustomerData;
