import React from 'react'

const ChatActivity = () => {
    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Messages</h4>
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
                                                <div className="d-flex align-items-center justify-content-between flex-column flex-sm-row">
                                                    <div className="d-flex align-items-center">
                                                        <div className="search-box">
                                                            <input type="text" className="form-control search bg-light border-light" placeholder="Search" />
                                                            <i className="ri-search-line search-icon"></i>
                                                        </div>
                                                        <div className="dateinput ms-3 d-none d-md-inline">
                                                            <input type="text" className="form-control bg-light border-light" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <div className="input-light ms-3 d-none d-md-inline">
                                                            <select className="form-control" data-choices data-choices-search-false name="choices-single-default" id="idStatus">
                                                                <option>All</option>
                                                                <option>High</option>
                                                                <option>Medium</option>
                                                                <option>Low</option>
                                                            </select>
                                                        </div>
                                                        <button type="button" className="btn btn-primary d-flex align-center justify-content-center ms-sm-3 ms-0 mt-3 mt-sm-0" data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal"><i className="ri-add-line align-bottom me-1 d-none d-sm-inline"></i>Create Message</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="card mb-0 border-0">
                                        <div className="card-body pb-0">
                                            <div className="table-responsive table-card mb-0">
                                                <table className="table align-middle mb-0 com_table" id="tasksTable">
                                                    <thead className="table-light text-muted">
                                                        <tr>
                                                            <th className="sort" data-sort="id">Message Id<br />Date</th>
                                                            <th className="sort" data-sort="project_name" style={{ width: '150px' }}>Subject / Title</th>
                                                            <th className="sort" data-sort="tasks_name">Message Description</th>
                                                            <th className="sort" data-sort="client_name">Send to</th>
                                                            <th className="sort" data-sort="due_date">Priority</th>
                                                            <th className="sort" data-sort="status" style={{ width: '150px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="list form-check-all">
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <small className="text-secondary">12345678</small>
                                                                    <br />
                                                                    <strong>10 Aug, 2022</strong>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                Msg Subject
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ width: '260px', display: 'inline-block' }}>Descriptions</div>
                                                            </td>
                                                            <td>
                                                                DEPT-USER2
                                                            </td>
                                                            <td>
                                                                High
                                                            </td>
                                                            <td style={{ width: '100px' }}>
                                                                <button className="btn btn-primary" data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal">View / Reply</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <small className="text-secondary">23456780</small>
                                                                    <br />
                                                                    <strong>07 Aug, 2022</strong>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                Msg Subject
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ width: '260px', display: 'inline-block' }}>Descriptions</div>
                                                            </td>
                                                            <td>
                                                                DEPT-USER2
                                                            </td>
                                                            <td>
                                                                Medium
                                                            </td>
                                                            <td style={{ width: '100px' }}>
                                                                <button className="btn btn-primary">View / Reply</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <small className="text-secondary">12345778</small>
                                                                    <br />
                                                                    <strong>05 Aug, 2022</strong>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                Msg Subject
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ width: '260px', display: 'inline-block' }}>Descriptions</div>
                                                            </td>
                                                            <td>
                                                                DEPT-USER2
                                                            </td>
                                                            <td>
                                                                High
                                                            </td>
                                                            <td style={{ width: '100px' }}>
                                                                <button className="btn btn-primary" data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal">View / Reply</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <small className="text-secondary">12344678</small>
                                                                    <br />
                                                                    <strong>03 Aug, 2022</strong>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                Msg Subject
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ width: '260px', display: 'inline-block' }}>Descriptions</div>
                                                            </td>
                                                            <td>
                                                                DEPT-USER2
                                                            </td>
                                                            <td>
                                                                Low
                                                            </td>
                                                            <td style={{ width: '100px' }}>
                                                                <button className="btn btn-primary" data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal">View / Reply</button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <small className="text-secondary">12345670</small>
                                                                    <br />
                                                                    <strong>03 Aug, 2022</strong>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                Msg Subject
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ width: '260px', display: 'inline-block' }}>Descriptions</div>
                                                            </td>
                                                            <td>
                                                                DEPT-USER2
                                                            </td>
                                                            <td>
                                                                Medium
                                                            </td>
                                                            <td style={{ width: '100px' }}>
                                                                <button className="btn btn-primary" data-bs-toggle="modal" id="create-btn" data-bs-target="#showModal">View / Reply</button>
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
                    <div className="modal-dialog modal-dialog-right modal-md me-0 my-0">
                        <div className="modal-dialog modal-lg my-0">
                            <div className="modal-content bg-light p-4 shadow-sm vh-100 overflow-auto">
                                <div className="bg-white vh-100">
                                    <form>
                                        <div className="modal-header px-4 pt-4 flex-column justify-content-start align-items-start">
                                            <h4 className="modal-title" id="exampleModalgridLabel">New Message Creation</h4>
                                            <p>Internal Department</p>
                                        </div>
                                        <div className="modal-body">
                                            <div className="card border-0 mb-0">
                                                <div className="card-body p-0">

                                                    <div className="tab-content">

                                                        <div className="tab-pane active" id="create-replay" role="tabpanel">
                                                            <div className="mb-3">
                                                                <label htmlFor="customername-field" className="form-label">Select user</label>
                                                                <select className="form-control fw-normal" data-choices name="choices-single-default" id="choices-single-default">
                                                                    <option>Select</option>
                                                                    <option>DEPT-USER1</option>
                                                                    <option>DEPT-USER2</option>
                                                                    <option>DEPT-USER3</option>
                                                                    <option>DEPT-USER4</option>
                                                                    <option>DEPT-USER5</option>
                                                                </select>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="customername-field" className="form-label">Subject / Title</label>
                                                                <input type="text" id="customername-field" className="form-control" placeholder="" required />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="customername-field" className="form-label">Message Descriptions</label>
                                                                <textarea type="text" className="form-control" placeholder="" required></textarea>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-body p-4 pt-0">
                                            <div className="d-flex justify-content-center align-items-center">
                                                <button className="btn btn-primary me-3" type="submit">Submit / Reply</button>
                                                <div className="btn btn-primary" data-bs-dismiss="modal"><i className="ri-close-line me-1 align-middle"></i> Cancel</div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade zoomIn" id="deleteRecordModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="btn-close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mt-2 text-center">
                                    <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop" colors="primary:#25a0e2,secondary:#00bd9d" style={{ width: '100px', height: '100px' }}></lord-icon>
                                    <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                                        <h4>Are you sure ?</h4>
                                        <p className="text-muted mx-4 mb-0">Are you sure you want to remove this user ?</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                                    <button type="button" className="btn w-sm btn-light" data-bs-dismiss="modal">Close</button>
                                    <button type="button" className="btn w-sm btn-primary" id="delete-record">Yes, Delete It!</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ChatActivity;