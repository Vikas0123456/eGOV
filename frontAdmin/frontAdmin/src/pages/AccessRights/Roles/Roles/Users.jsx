import React from "react";

const Users= () => {
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content services">
                    <div className="page-content">
                        <div className="container-fluid p-0">
                            <div className="col-12 mb-4">
                                <div className="d-flex align-items-center flex-lg-row flex-column">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <h2 className="mb-0 fw-bold text-black">Users</h2>
                                                <p className="fs-15 mt-1 text-muted mb-0">All systems are running smoothly! You have <div className="text-primary">2 unread alerts!</div></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 mt-lg-0">
                                        <form action="#">
                                            <div className="row g-3 mb-0 align-items-center justify-content-center justify-content-lg-end">
                                                <div className="col-auto">
                                                    <div title="Add User" className="btn btn-primary fs-14" data-bs-toggle="modal" data-bs-target="#showModal">Add User</div>
                                                </div>
                                                <div className="col-auto">
                                                    <button type="button" className="btn btn-outline-secondary waves-effect waves-light"><i data-icon="download" className="icon"></i><div className="ms-2">Export</div></button>
                                                </div>
                                                <div className="col-auto  d-none">
                                                    <div className="input-group">
                                                        <input type="text" className="form-control form-control border-0 text-black fw-semibold" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Select date range" defaultValue="15 Nov, 2022 to 24 Nov, 2022" style={{ minWidth: '230px' }} />
                                                        <div className="input-group-text border-0 text-white bg-white ps-0">
                                                            <i data-feather="chevron-down" className="text-muted icon-sm"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-xl-12">
                                <div className="card border-0 p-0 p-xl-2 rounded">
                                    <div className="card-body pt-0">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-borderless mb-0">
                                                <thead className="">
                                                    <tr className="text-capitalize">
                                                        <th>Account Number</th>
                                                        <th className=" " >Shared With</th>
                                                        <th className="">Phone No. / Email</th>
                                                        <th>Shared On</th>
                                                        <th>Revoked On</th>
                                                        <th className=" text-center" >Status</th>
                                                        <th className=" text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="list form-check-all">
                                                    <tr>
                                                        <td>T12345678</td>
                                                        <td>
                                                            <div>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-shrink-0 me-2">
                                                                        <img src="assets/images/users/avatar-2.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                    </div>
                                                                    <div className="flex-grow-1"><strong>Mrs. Janice Miller</strong></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1 ph-no">(242) 327-1530/7</div>
                                                            </div>
                                                            janicemiller@egov.bs
                                                        </td>
                                                        <td><div className="one"></div></td>
                                                        <td>Continue</td>
                                                        <td className="status-update text-center text-success fw-bold"><div className="badge badge-soft-success fs-12">
                                                            <i className="ri-checkbox-circle-line align-bottom"></i> Access Shared
                                                        </div></td>
                                                        <td className="status text-center" style={{ width: '100px' }}>
                                                            <div className="dropdown ac-dropdown text-dark">
                                                                <div role="button" id="dropdownMenuLinkOne" data-bs-toggle="dropdown" aria-expanded="false" title="Action">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-vertical" style={{width: '18px', height: '18px'}}>
                                                                        <circle cx="12" cy="12" r="1"></circle>
                                                                        <circle cx="12" cy="5" r="1"></circle>
                                                                        <circle cx="12" cy="19" r="1"></circle>
                                                                    </svg>
                                                                </div>
                                                                <div className="dropdown-menu dropdown-menu-left ac-dropdown-1 n-fs-16 text-dark" aria-labelledby="dropdownMenuLinkOne">
                                                                    <div className="dropdown-item revokeAccess" title="Revoke Access">Revoke Access</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>T12345678</td>
                                                        <td>
                                                            <div>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-shrink-0 me-2">
                                                                        <img src="assets/images/users/avatar-3.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                    </div>
                                                                    <div className="flex-grow-1"><strong>Gaye Antoine-Bowe</strong></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <div className="flex-grow-1 ph-no">(242) 502-0600/5</div>
                                                            </div>
                                                            gantoinebowe@egov.bs
                                                        </td>
                                                        <td><div className="six"></div></td>
                                                        <td><div className="current-date"></div></td>
                                                        <td className="status-update text-center text-success fw-bold"><div className="badge badge-soft-warning fs-12">
                                                            <i className="ri-checkbox-circle-line align-bottom"></i> Access Revoked
                                                        </div></td>
                                                        <td className="status text-center" style={{ width: '100px' }}>
                                                            <div className="dropdown ac-dropdown text-dark">
                                                                <div role="button" id="dropdownMenuLinkOne" data-bs-toggle="dropdown" aria-expanded="false" title="Action">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-vertical" style={{ width: '18px', height: '18px' }}>
                                                                        <circle cx="12" cy="12" r="1"></circle>
                                                                        <circle cx="12" cy="5" r="1"></circle>
                                                                        <circle cx="12" cy="19" r="1"></circle>
                                                                    </svg>
                                                                </div>
                                                                <div className="dropdown-menu dropdown-menu-left ac-dropdown-1 n-fs-16 text-dark" aria-labelledby="dropdownMenuLinkOne">
                                                                    <div className="dropdown-item revokeAccess" title="Revoke Access">Revoke Access</div>
                                                                </div>
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
            <div className="modal fade fadeInRight vh-100" id="showModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-right modal-md me-0 my-0 p-0">
                    <div className="modal-dialog modal-lg my-0 p-0 me-0">
                        <div className="modal-content bg-light p-4 shadow-sm vh-100 overflow-auto">
                            <div className="bg-white vh-100">
                                <form>
                                    <div className="modal-header px-4 pt-4">
                                        <h4 className="modal-title" id="exampleModalgridLabel">Add User</h4>
                                        <div className="btn btn-primary" data-bs-dismiss="modal"><i className="ri-close-line me-1 align-middle"></i> Cancel</div>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <div className="avatar-xl">
                                                <input type="file" className="filepond filepond-input-circle" name="filepond" accept="image/png, image/jpeg, image/gif" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="customername-field" className="form-label">Full Name</label>
                                            <input type="text" id="customername-field" className="form-control" placeholder="Full Name" required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="customername-field" className="form-label">Role</label>
                                            <select data-choices data-choices-search-false data-choices-sorting-false>
                                                <option>Admin </option>
                                                <option>Department Head </option>
                                                <option>Service Executive </option>
                                                <option>Assistant executive</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="customername-field" className="form-label">Department</label>
                                            <select data-choices data-choices-search-false data-choices-sorting-false>
                                                <option>Passport Office Ministry of Foreign Affairs</option>
                                                <option>Registrar General's Department</option>
                                                <option>Road Traffic Department</option>
                                                <option>Department Of Labour</option>
                                                <option>Royal Bahamas Police</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="email-field" className="form-label">Email ID</label>
                                            <input type="email" id="email-field" className="form-control" placeholder="Enter Email" required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="phone-field" className="form-label">Phone No.</label>
                                            <input type="text" id="phone-field" className="form-control" placeholder="Enter Phone no." required />
                                        </div>
                                        <div className="mb-3">
                                            <div className="form-check mb-2">
                                                <input className="form-check-input" type="checkbox" id="formCheck1" />
                                                <label className="form-check-label" htmlFor="formCheck1">
                                                    Send Email Confirmation
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-body p-4 pt-0">
                                        <button className="btn btn-primary" type="submit">Add User</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-danger btn-icon" id="back-to-top">
                    <i className="ri-arrow-up-line"></i>
                </button>
            </div>
        </>
    )
}

export default Users;