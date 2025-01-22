import React from "react";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";

const LogReport = () => {
    document.title = "Log Report | eGov Solution"
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Log Report</h4>

                                        <div className="page-title-right">
                                            <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                             
                                <div className="col-xxl-12 mb-3">
                                    <div className="card border-0">
                                        <div className="card-body border-0">
                                            <div className="row">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center">
                                                        <div className="search-box">
                                                            <input
                                                                type="text"
                                                                className="form-control search bg-light border-light"
                                                                placeholder="Search"
                                                            />
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                        <div className="dateinput ms-3">
                                                            <input
                                                                type="text"
                                                                className="form-control bg-light border-light"
                                                                id="demo-datepicker"
                                                                data-provider="flatpickr"
                                                                data-date-format="d M, Y"
                                                                data-range-date="true"
                                                                placeholder="Date Range"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary bg-light border-light ms-3 text-muted d-flex align-items-center"
                                                        >
                                                            <i
                                                                data-feather="refresh-ccw"
                                                                className="icon-xs me-2 text-muted d-none d-sm-inline"
                                                            ></i>
                                                            <div>Reset</div>
                                                        </button>
                                                    </div>
                                                    <div className="align-items-center d-none d-lg-flex">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary bg-light border-light ms-3 text-black"
                                                        >
                                                            Export to Excel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary bg-light border-light ms-3 text-black"
                                                        >
                                                            Export to PDF
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <div className="card mb-0 border-0">
                                        <div className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                <table
                                                    className="table align-middle table-nowrap mb-0 com_table"
                                                    id="tasksTable"
                                                >
                                                    <thead className="">
                                                        <tr className="text-capitalize">
                                                            <th
                                                                className="sort"
                                                                data-sort="id"
                                                            >
                                                                Name{" "}
                                                            </th>
                                                            <th
                                                                className="sort"
                                                                data-sort="due_date"
                                                            >
                                                                Email Id
                                                            </th>
                                                            <th
                                                                className="sort"
                                                                data-sort="tr-status"
                                                            >
                                                                IP Address
                                                            </th>
                                                            <th
                                                                className="sort"
                                                                data-sort="department-name"
                                                            >
                                                                Login Time
                                                            </th>
                                                            <th
                                                                className="sort"
                                                                data-sort="service-name"
                                                            >
                                                                Logout Time
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="list form-check-all">
                                                        <tr>
                                                            <td className="id">
                                                                Camille
                                                                Gomez-Jones{" "}
                                                            </td>
                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    registrargeneral@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        27.54.170.98{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                16 Aug, 2022
                                                                09:30AM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                16 Aug, 2022
                                                                10:35AM
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="id">
                                                                Camille
                                                                Gomez-Jones{" "}
                                                            </td>
                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    registrargeneral@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        20.54.180.78{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                11 Aug, 2022
                                                                10:00PM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                11 Aug, 2022
                                                                11:40PM
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="id">
                                                                Leonard Dames
                                                                Jr.{" "}
                                                            </td>
                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    leonarddames@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        22.54.177.98{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                07 Aug, 2022
                                                                02:35PM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                07 Aug, 2022
                                                                03:45PM
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td className="id">
                                                                Millie Dawkins{" "}
                                                            </td>

                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    milliedawkins@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        29.55.170.98{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                05 Aug, 2022
                                                                03:15PM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                05 Aug, 2022
                                                                04:53PM
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="id">
                                                                Keffieann
                                                                Ferguson{" "}
                                                            </td>
                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    keffieannferguson@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        20.64.177.58{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                04 Aug, 2022
                                                                04:35PM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                04 Aug, 2022
                                                                05:48PM
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="id">
                                                                Donald Rolle{" "}
                                                            </td>
                                                            <td className="service-name">
                                                                <div>
                                                                    {" "}
                                                                    leonarddames@bahamas.gov.bs{" "}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex">
                                                                    <div className="flex-grow-1 department-name">
                                                                        {" "}
                                                                        21.64.180.99{" "}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                03 Aug, 2022
                                                                10:15AM
                                                            </td>
                                                            <td className="due_date">
                                                                {" "}
                                                                03 Aug, 2022
                                                                11:45AM
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div
                                                    className="noresult"
                                                    style={{ display: "none" }}
                                                >
                                                    <div className="text-center">
                                                        <lord-icon
                                                            src="https://cdn.lordicon.com/msoeawqm.json"
                                                            trigger="loop"
                                                            colors="primary:#25a0e2,secondary:#00bd9d"
                                                            style={{
                                                                width: "75px",
                                                                height: "75px",
                                                            }}
                                                        ></lord-icon>
                                                        <h5 className="mt-2">
                                                            Sorry! No Result
                                                            Found
                                                        </h5>
                                                        <p className="text-muted mb-0">
                                                            We've searched more
                                                            than 200k+ tasks We
                                                            did not find any
                                                            tasks for you
                                                            search.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    id="tra_popup"
                    className="modal fade zoomIn"
                    tabIndex="-1"
                    aria-labelledby="addAddressModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="card mb-0">
                                    <div className="card-header badge-soft-success">
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <h5 className="card-title mb-0">
                                                    <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                                                    Payment Details
                                                </h5>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive table-card">
                                            <table className="table table-borderless align-middle mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            className="text-muted fs-13"
                                                            colSpan="2"
                                                        >
                                                            Payment Mode :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Credit Card ( VISA )
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Number :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            25425458452
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Citizen Receipt
                                                            Number :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            254500
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Date
                                                            Time :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            10 Aug, 2022 - 11:00
                                                            AM
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Status :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Success
                                                        </td>
                                                    </tr>
                                                    <tr className="table-active">
                                                        <th colSpan="2">
                                                            Total :
                                                        </th>
                                                        <td className="text-end">
                                                            <div className="fw-semibold">
                                                                $10.00
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id="tra_f_popup"
                    className="modal fade zoomIn"
                    tabIndex="-1"
                    aria-labelledby="addAddressModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="card mb-0">
                                    <div className="card-header bg-soft-warning">
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <h5 className="card-title mb-0">
                                                    <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                                                    Payment Details
                                                </h5>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive table-card">
                                            <table className="table table-borderless align-middle mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            className="text-muted fs-13"
                                                            colSpan="2"
                                                        >
                                                            Payment Mode :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Credit Card ( VISA )
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Number :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            25425458452
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Citizen Receipt
                                                            Number :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            254500
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Date
                                                            Time :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            03 Aug, 2022 - 11:00
                                                            AM
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Status :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Failed
                                                        </td>
                                                    </tr>
                                                    <tr className="table-active">
                                                        <th colSpan="2">
                                                            Total :
                                                        </th>
                                                        <td className="text-end">
                                                            <div className="fw-semibold">
                                                                $10.00
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id="tra_p_popup"
                    className="modal fade zoomIn"
                    tabIndex="-1"
                    aria-labelledby="addAddressModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="card mb-0">
                                    <div className="card-header bg-soft-info">
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <h5 className="card-title mb-0">
                                                    <i className="ri-secure-payment-line align-bottom me-2 text-muted"></i>
                                                    Payment Details
                                                </h5>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive table-card">
                                            <table className="table table-borderless align-middle mb-0">
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            className="text-muted fs-13"
                                                            colSpan="2"
                                                        >
                                                            Payment Mode :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Credit Card ( VISA )
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Number :
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            25425458452
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Citizen Receipt
                                                            Number :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            254500
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Date
                                                            Time :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            03 Aug, 2022 - 11:00
                                                            AM
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-muted fs-13"
                                                        >
                                                            Transaction Status :{" "}
                                                        </td>
                                                        <td className="fw-semibold text-end">
                                                            Pending
                                                        </td>
                                                    </tr>
                                                    <tr className="table-active">
                                                        <th colSpan="2">
                                                            Total :
                                                        </th>
                                                        <td className="text-end">
                                                            <div className="fw-semibold">
                                                                $10.00
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ScrollToTop />
        </>
    );
};
export default LogReport;
