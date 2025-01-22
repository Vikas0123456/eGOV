import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import error400cover from "../../../assets/images/error400-cover.png";

const ApplicationExpired = () => {
    document.title = "404 Error Cover | eGov solution";
    return (
        <React.Fragment>
            <div className="auth-page-content">
                <div className="auth-page-wrapper py-5 d-flex justify-content-center align-items-center min-vh-100">
                    <div className="auth-page-content overflow-hidden p-0">
                        <Container>
                            <Row className="justify-content-center">
                                <Col xl={7} lg={8}>
                                    <div className="text-center">
                                        <img
                                            src={error400cover}
                                            alt="error img"
                                            className="img-fluid"
                                        />
                                        <div className="mt-3">
                                            <h3 className="text-uppercase">
                                                Your application has been
                                                expired
                                            </h3>
                                            <p className="text-muted mb-4">
                                                Please renew the application
                                            </p>
                                            <Link
                                                to="/dashboard"
                                                className="btn btn-success"
                                            >
                                                <i className="mdi mdi-home me-1"></i>
                                                Back to home
                                            </Link>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ApplicationExpired;
