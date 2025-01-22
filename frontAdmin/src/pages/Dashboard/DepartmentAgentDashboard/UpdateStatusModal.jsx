import React from 'react'

const UpdateStatusModal= () => {
    return (
        <>
            <div id="upstatus" className="modal fade zoomIn" tabIndex="-1" aria-labelledby="addAddressModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addAddressModalLabel"> Update Status</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <div className="mb-3">
                                    <label htmlFor="addaddress-Name" className="form-label">Status</label>
                                    <select data-choices data-choices-search-false data-choices-sorting-false>
                                        <option>Incomplete</option>
                                        <option>Checked & Verified</option>
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Approved</option>
                                        <option>Shipped</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                                <div className="file-upload mb-3">
                                    <label htmlFor="addaddress-Name" className="form-label">Upload Image / Document</label>
                                    <div className="file-upload-select border-dark">
                                        <div className="file-select-button bg-dark">Choose File</div>
                                        <div className="file-select-name"></div>
                                        <input type="file" name="file-upload-input" id="file-upload-input" className="file-upload-input" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="addaddress-Name" className="form-label">Description</label>
                                    <textarea className="form-control" id="VertimeassageInput" rows="3" placeholder="" style={{ resize: 'vertical', overflowY: 'auto' }}></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div type="button" data-bs-dismiss="modal" className="btn w-sm btn-primary">Submit</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateStatusModal;