import React, { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { BiAddToQueue } from "react-icons/bi";

const DashboardOffcanvas = ({ show, handleClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      style={{ width: "40%" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Announcements</Offcanvas.Title>
        <div className="flex-shrink-0 p-4" style={{ marginLeft: "40%" }}>
          <div className="dropdown card-header-dropdown">
            <div className="d-flex align-items-center">
              <a
                onClick={toggleCollapse}
                role="button"
                aria-expanded={isCollapsed}
                aria-controls="add-anns-tooogle"
                title="Add a Task"
                className="d-flex align-items-center pp_c_orange"
              >
                <BiAddToQueue
                  className="me-2"
                  style={{ height: "20px", width: "20px" }}
                />
                <span>Add Announcement</span>
              </a>
            </div>
          </div>
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div
          className={`my-2 collapse ${isCollapsed ? "show" : ""}`}
          id="add-anns-tooogle"
        >
          <div className="card mb-0 border-0">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="customername-field" className="form-label">
                  Title
                </label>
                <textarea
                  type="text"
                  id="customername-field"
                  className="form-control"
                  placeholder=""
                  required=""
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="customername-field" className="form-label">
                  Departments
                </label>
                <div
                  className="choices"
                  data-type="select-multiple"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <div className="choices__inner">
                    <select
                      data-choices=""
                      data-choices-removeitem=""
                      multiple=""
                      data-choices-text-unique-true=""
                      className="choices__input"
                      hidden=""
                      tabIndex="-1"
                      data-choice="active"
                    ></select>
                    <div className="choices__list choices__list--multiple"></div>
                    <input
                      type="text"
                      className="choices__input choices__input--cloned"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      role="textbox"
                      aria-autocomplete="list"
                      aria-label="null"
                    />
                  </div>
                  <div
                    className="choices__list choices__list--dropdown"
                    aria-expanded="false"
                  >
                    <div
                      className="choices__list"
                      aria-multiselectable="true"
                      role="listbox"
                    ></div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center align-items-center">
                <a href="javascript:void(0);" className="btn btn-primary">
                  Add Announcement
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body bg-white">
          <div className="card pt-2 border-0">
            <div className="d-flex justify-content-between">
              <div>
                <label htmlFor="toggle1" className="d-block">
                  Over 216 crore 56 lakh COVID vaccine doses administered so far
                  under nationwide vaccination drive
                </label>
                <p className="fs-12">Birth Certificate</p>
                <a href="#" className="badge badge-outline-info p-1 text-black">
                  Today
                </a>
              </div>
              <div>
                <a
                  className="text-reset dropdown-btn p-0"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="text-muted fs-16">
                    <i className="mdi mdi-dots-vertical align-middle"></i>
                  </span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">
                    Delete
                  </a>
                  <a className="dropdown-item" href="#">
                    Edit / Update
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="card pt-2 border-0">
            <div className="d-flex justify-content-between">
              <div>
                <label htmlFor="toggle2" className="d-block">
                  COVID-19 UPDATE
                </label>
                <p className="fs-12">Registrar General's Department</p>
                <a
                  href="#"
                  className="badge badge-outline-danger p-1 text-danger"
                >
                  4 days ago
                </a>
              </div>
              <div>
                <a
                  className="text-reset dropdown-btn p-0"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="text-muted fs-16">
                    <i className="mdi mdi-dots-vertical align-middle"></i>
                  </span>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">
                    Delete
                  </a>
                  <a className="dropdown-item" href="#">
                    Edit / Update
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default DashboardOffcanvas;
