import React from "react";
import { useNavigate } from "react-router-dom";
import UpdateStatusModal from "../../../common/modals/UpdateStatusModal/UpdateStatusModal";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";

const CompleteApplications = () => {
  const navigate = useNavigate();

  document.title = "Completed Applications | eGov Solution";

  return (
    <>
      <div id="layout-wrapper">
        <div className="main-content trans-sup">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <div className="dropdown card-header-dropdown">
                      <div className="dropdown-btn h4 text-black" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <div onClick={() => navigate("/applications")} className="text-black fs-16">
                          Completed Applications{" "} <i className="mdi mdi-chevron-down align-middle"></i>
                        </div>
                      </div>
                      <div className="dropdown-menu" style={{}}>
                        <div onClick={() => navigate("/applications")} className="dropdown-item">
                          Active Applications
                        </div>
                      </div>
                    </div>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col-xxl-12 mb-3">
                      <div className="card border-0">
                        <div className="card-body border-0">
                          <div className="row">
                            <div className="col-12 col-sm-8">
                              <div className="d-flex align-items-center">
                                <div className="search-box">
                                  <input type="text" className="form-control search bg-light border-light" placeholder="Search" />
                                  <i className="ri-search-line search-icon"></i>
                                </div>
                                <div className="dateinput ms-3">
                                  <input type="text" className="form-control bg-light border-light" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                </div>
                                <button type="button" className="btn btn-primary bg-light border-light ms-3 text-muted d-flex align-items-center">
                                  <i data-feather="refresh-ccw" className="icon-xs me-2 text-muted d-none d-sm-inline"></i> <div>Reset</div>
                                </button>
                              </div>
                            </div>
                            <div className="col-12 col-sm-4">
                              <div className="d-flex align-items-center justify-content-center justify-content-sm-end mt-3 mt-sm-0">
                                <div className="input-light ms-3">
                                  <select className="form-control" data-choices data-choices-search-false name="choices-single-default" id="idStatus" data-choices-sorting-false>
                                    <option disabled>Select Department</option>
                                    <option>All</option>
                                    <option>
                                      Passport Office Ministry of Foreign Affairs
                                    </option>
                                    <option>
                                      Registrar General's Department
                                    </option>
                                    <option>Road Traffic Department</option>
                                    <option>Department Of Labour</option>
                                    <option>Royal Bahamas Police</option>
                                  </select>
                                </div>
                                <div className="input-light ms-3">
                                  <select className="form-control" data-choices name="choices-single-default" id="idStatus">
                                    <option disabled>Select Service</option>
                                    <option>Passport</option>
                                    <option>Citizenship</option>
                                    <option>Residence</option>
                                    <option>Permits</option>
                                    <option>Visa</option>
                                    <option>Refugees</option>
                                  </select>
                                </div>
                                <div className="input-light ms-3">
                                  <select data-choices data-choices-search-false>
                                    <option value="all">TAT</option>
                                    <option value="New">New</option>
                                    <option value="Inprogress"> Inprogress </option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                                <div className="input-light ms-3" style={{ width: "200px", }}>
                                  <select className="form-control" data-choices name="choices-single-default" id="idStatus">
                                    <option disabled>Assign to</option>
                                    <option> Camille Gomez-Jones </option>
                                    <option>Leonard Dames Jr</option>
                                    <option>Millie Dawkins</option>
                                    <option>Keffieann Ferguson</option>
                                    <option>Donald Rolle</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="card mb-0 border-0">
                        <div className="card-body pb-0">
                          <div className="table-responsive table-card mb-0"
                            style={{ minHeight: "500px", }}>
                            <table className="table align-middle table-mobile table-nowrap mb-0 com_table" id="tasksTable">
                              <thead>
                                <tr className="text-capitalize">
                                  <th className="sort" data-sort="id">
                                    NIB / Citizen
                                  </th>
                                  <th>Application ID</th>
                                  <th className="sort" data-sort="due_date">
                                    Date
                                  </th>
                                  <th className="sort" data-sort="service-name">
                                    Service
                                  </th>
                                  <th className="sort" data-sort="department-name">
                                    Department
                                  </th>
                                  <th className="sort" data-sort="time-remain">
                                    TAT
                                  </th>
                                  <th className="sort" data-sort="tr-status">
                                    Transaction Status
                                  </th>
                                  <th>Assign To</th>
                                  <th className="sort text-center" data-sort="status" style={{ width: "150px", }}>
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="list form-check-all">
                                <tr>
                                  <td>
                                    <div>
                                      <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-2">
                                          <div
                                            className="notification-dot me-2"
                                            style={{
                                              opacity: "0",
                                            }}></div>
                                          <img
                                            src="assets/images/users/avatar-1.jpg"
                                            alt=""
                                            className="avatar-xs rounded-circle"
                                          />
                                        </div>
                                        <div className="flex-grow-1">
                                          <small className="text-secondary">
                                            NIB: 78654123
                                          </small>
                                          <br />
                                          <strong>Kartik Mehta</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="fw-bold">BSPS546861</td>
                                  <td className="due_date">
                                    <div className="five"></div>
                                    <br />
                                    <small className="text-muted">
                                      11:00 AM
                                    </small>
                                  </td>
                                  <td className="service-name  fw-bold">
                                    <div>Passport</div>
                                  </td>
                                  <td>
                                    <div className="d-flex">
                                      <div className="flex-grow-1 department-name">
                                        Passport Office Ministry of Foreign
                                        Affairs
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="badge bg-warning d-inline-flex align-items-center">
                                      <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                      <div className="mb-0 ms-1 fs-13">
                                        05:46:04
                                      </div>
                                    </div>
                                  </td>
                                  <td className="tr-status">
                                    <div
                                      data-bs-target="#tra_popup"
                                      data-bs-toggle="modal"
                                      className="d-block text-body p-1 px-2">
                                      Amount: $50.00
                                      <br />
                                      <div className="badge badge-soft-success fs-12">
                                        <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                        Txn: Success
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      width: "250px",
                                    }}>
                                    <select
                                      data-choices
                                      className="assigntodrop">
                                      <option disabled></option>
                                      <option> Camille Gomez-Jones </option>
                                      <option>Leonard Dames Jr</option>
                                      <option>Millie Dawkins</option>
                                      <option>Keffieann Ferguson</option>
                                      <option>Donald Rolle</option>
                                    </select>
                                  </td>
                                  <td
                                    className="status text-center"
                                    style={{
                                      width: "220px",
                                    }}>
                                    {/* <div data-bs-toggle="modal" data-bs-target="#upstatus" className="btn btn-primary" title="Update Status">Update Status</div> */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#upstatus"
                                      className="btn btn-primary"
                                      title="Update Status">
                                      {" "}
                                      Update Status{" "}
                                    </button>
                                    <div
                                      onClick={() =>
                                        navigate("/passport-application")
                                      }
                                      className="py-2 px-3"
                                      title="View Detail">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-eye icon-sm">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-2">
                                          <div
                                            className="notification-dot me-2"
                                            style={{
                                              opacity: "0",
                                            }}></div>
                                          <img
                                            src="assets/images/users/avatar-8.jpg"
                                            alt=""
                                            className="avatar-xs rounded-circle"
                                          />
                                        </div>
                                        <div className="flex-grow-1">
                                          <small className="text-secondary">
                                            NIB: NIB568645
                                          </small>
                                          <br />
                                          <strong>Robinson Howard</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="fw-bold">BSPS546863</td>
                                  <td className="due_date">
                                    <div className="five"></div>
                                    <br />
                                    <small className="text-muted">
                                      11:00 AM
                                    </small>
                                  </td>
                                  <td className="service-name  fw-bold">
                                    <div>Birth Certificate</div>
                                  </td>
                                  <td>
                                    <div className="d-flex">
                                      <div className="flex-grow-1 department-name">
                                        Registrar General's Department
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="badge bg-warning d-inline-flex align-items-center">
                                      <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                      <div className="mb-0 ms-1 fs-13">
                                        01:11:04
                                      </div>
                                    </div>
                                  </td>
                                  <td className="tr-status">
                                    <div
                                      data-bs-target="#tra_popup"
                                      data-bs-toggle="modal"
                                      className="d-block text-body p-1 px-2">
                                      Amount: $10.00
                                      <br />
                                      <div className="badge badge-soft-success fs-12">
                                        <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                        Txn: Success
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      width: "250px",
                                    }}>
                                    <select
                                      data-choices
                                      className="assigntodrop">
                                      <option disabled></option>
                                      <option> Camille Gomez-Jones </option>
                                      <option>Leonard Dames Jr</option>
                                      <option>Millie Dawkins</option>
                                      <option>Keffieann Ferguson</option>
                                      <option>Donald Rolle</option>
                                    </select>
                                  </td>
                                  <td
                                    className="status text-center"
                                    style={{
                                      width: "220px",
                                    }}>
                                    {/* <div data-bs-toggle="modal" data-bs-target="#upstatus" className="btn btn-primary" title="Update Status">Update Status</div> */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#upstatus"
                                      className="btn btn-primary"
                                      title="Update Status">
                                      {" "}
                                      Update Status{" "}
                                    </button>
                                    <div
                                      className="py-2 px-3"
                                      title="View Detail">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-eye icon-sm">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-2">
                                          <div
                                            className="notification-dot me-2"
                                            style={{
                                              opacity: "0",
                                            }}></div>
                                          <img
                                            src="assets/images/users/avatar-2.jpg"
                                            alt=""
                                            className="avatar-xs rounded-circle"
                                          />
                                        </div>
                                        <div className="flex-grow-1">
                                          <small className="text-secondary">
                                            NIB: NIB568556
                                          </small>
                                          <br />
                                          <strong>Emily walls</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="fw-bold">BSPS546864</td>
                                  <td className="due_date">
                                    <div className="five"></div>
                                    <br />
                                    <small className="text-muted">
                                      11:00 AM
                                    </small>
                                  </td>
                                  <td className="service-name  fw-bold">
                                    <div>Birth Certificate</div>
                                  </td>
                                  <td>
                                    <div className="d-flex">
                                      <div className="flex-grow-1 department-name">
                                        Registrar General's Department
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="badge bg-warning d-inline-flex align-items-center">
                                      <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                      <div className="mb-0 ms-1 fs-13">
                                        05:46:54
                                      </div>
                                    </div>
                                  </td>
                                  <td className="tr-status">
                                    <div
                                      data-bs-target="#tra_popup"
                                      data-bs-toggle="modal"
                                      className="d-block text-body p-1 px-2">
                                      Amount: $10.00
                                      <br />
                                      <div className="badge badge-soft-success fs-12">
                                        <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                        Txn: Success
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      width: "250px",
                                    }}>
                                    <select
                                      data-choices
                                      className="assigntodrop">
                                      <option disabled></option>
                                      <option> Camille Gomez-Jones </option>
                                      <option>Leonard Dames Jr</option>
                                      <option>Millie Dawkins</option>
                                      <option>Keffieann Ferguson</option>
                                      <option>Donald Rolle</option>
                                    </select>
                                  </td>
                                  <td
                                    className="status text-center"
                                    style={{
                                      width: "220px",
                                    }}>
                                    {/* <div data-bs-toggle="modal" data-bs-target="#upstatus" className="btn btn-primary" title="Update Status">Update Status</div> */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#upstatus"
                                      className="btn btn-primary"
                                      title="Update Status">
                                      {" "}
                                      Update Status{" "}
                                    </button>
                                    <div
                                      className="py-2 px-3"
                                      title="View Detail">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-eye icon-sm">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 me-2">
                                          <div
                                            className="notification-dot me-2"
                                            style={{
                                              opacity: "0",
                                            }}></div>
                                          <img
                                            src="assets/images/users/avatar-7.jpg"
                                            alt=""
                                            className="avatar-xs rounded-circle"
                                          />
                                        </div>
                                        <div className="flex-grow-1">
                                          <small className="text-secondary">
                                            NIB: NIB564489
                                          </small>
                                          <br />
                                          <strong>Martin Parker</strong>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="fw-bold">BSPS546865</td>
                                  <td className="due_date">
                                    <div className="five"></div>
                                    <br />
                                    <small className="text-muted">
                                      11:00 AM
                                    </small>
                                  </td>
                                  <td className="service-name  fw-bold">
                                    <div>Birth Certificate</div>
                                  </td>
                                  <td>
                                    <div className="d-flex">
                                      <div className="flex-grow-1 department-name">
                                        Registrar General's Department
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="badge bg-warning d-inline-flex align-items-center">
                                      <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                      <div className="mb-0 ms-1 fs-13">
                                        08:55:01
                                      </div>
                                    </div>
                                  </td>
                                  <td className="tr-status">
                                    <div
                                      data-bs-target="#tra_popup"
                                      data-bs-toggle="modal"
                                      className="d-block text-body p-1 px-2">
                                      Amount: $10.00
                                      <br />
                                      <div className="badge badge-soft-success fs-12">
                                        <i className="ri-checkbox-circle-line align-bottom"></i>{" "}
                                        Txn: Success
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      width: "250px",
                                    }}>
                                    <select
                                      data-choices
                                      className="assigntodrop">
                                      <option disabled></option>
                                      <option> Camille Gomez-Jones </option>
                                      <option>Leonard Dames Jr</option>
                                      <option>Millie Dawkins</option>
                                      <option>Keffieann Ferguson</option>
                                      <option>Donald Rolle</option>
                                    </select>
                                  </td>
                                  <td
                                    className="status text-center"
                                    style={{
                                      width: "220px",
                                    }}>
                                    {/* <div data-bs-toggle="modal" data-bs-target="#upstatus" className="btn btn-primary" title="Update Status">Update Status</div> */}
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#upstatus"
                                      className="btn btn-primary"
                                      title="Update Status">
                                      {" "}
                                      Update Status{" "}
                                    </button>
                                    <div
                                      className="py-2 px-3"
                                      title="View Detail">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-eye icon-sm">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <div
                              className="noresult"
                              style={{
                                display: "none",
                              }}>
                              <div className="text-center">
                                <lord-icon
                                  src="https://cdn.lordicon.com/msoeawqm.json"
                                  trigger="loop"
                                  colors="primary:#25a0e2,secondary:#00bd9d"
                                  style={{
                                    width: "75px",
                                    height: "75px",
                                  }}></lord-icon>
                                <h5 className="mt-2">Sorry! No Result Found</h5>
                                <p className="text-muted mb-0">
                                  We've searched more than 200k+ tasks We did
                                  not find any tasks for you search.
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
          </div>
        </div>
      </div>
      <UpdateStatusModal />
      <ScrollToTop />
    </>
  );
};

export default CompleteApplications;
