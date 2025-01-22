import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classnames from "classnames";


const PassportApplication = () => {
    // const navigate = useNavigate()

    const [customActiveTab, setcustomActiveTab] = useState("1");
    const toggleCustom = (tab) => {
        if (customActiveTab !== tab) {
            setcustomActiveTab(tab);
        }
    };

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content overflow-hidden trans-detail-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Passport (Passport Office Ministry of Foreign Affairs)</h4>
                                        <div className="page-title-right">
                                            <span className="mb-0 me-2 fs-15 text-muted current-date"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="bg-white">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-auto">
                                                                <div className="avatar-md">
                                                                    <div className="avatar-title bg-white rounded">
                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-sm rounded-circle" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md ps-3 ps-md-0">
                                                                <div>
                                                                    <div className="hstack gap-3 flex-wrap mb-1">
                                                                        <small className="text-muted">Service Requested By</small>
                                                                    </div>
                                                                    <div className="d-flex align-items-center">
                                                                        <h4 className="fw-bold mb-0 me-2 text-capitalize">Kartik Mehta</h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-auto mt-3 mt-md-0">
                                                        <div className="hstack gap-1 flex-wrap align-items-center">
                                                            <button type="button" className="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#upstatus">Update Status</button>
                                                            <button type="button" className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange" data-bs-toggle="modal" data-bs-target="#view-model-user"><i data-feather="eye" className="icon-md"></i></button>
                                                            <div href="#" className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange"><i className="ri-mail-send-line fs-18 text-white"></i></div>
                                                            <div href="#" className="btn btn-outline-light btn-icon waves-effect waves-light me-2 pp_b_orange"><i className="ri-phone-line fs-18 text-white"></i></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-xl-9">
                                    <div className="row">
                                        <div className="col-xxl-12">
                                            <div className="card border-0 bg-transparent remove-inner-bg mb-0">
                                                <div className="card-body border-0 p-0">
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div className="scroll-tab">
                                                                    <Nav
                                                                        tabs className="nav-tabs-customs nav-justified mb-3 " role="tablist" aria-orientation="vertical">
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "1", })}
                                                                                onClick={() => { toggleCustom("1"); }} id="home1">Activity
                                                                            </NavLink>
                                                                        </NavItem>
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "2", })}
                                                                                onClick={() => { toggleCustom("2"); }}>Application Details
                                                                            </NavLink>
                                                                        </NavItem>
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "3", })}
                                                                                onClick={() => { toggleCustom("3"); }}>Documents
                                                                            </NavLink>
                                                                        </NavItem>
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "4", })}
                                                                                onClick={() => { toggleCustom("4"); }}> Payment History
                                                                            </NavLink>
                                                                        </NavItem>
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "5", })}
                                                                                onClick={() => { toggleCustom("5"); }}>Tickets
                                                                            </NavLink>
                                                                        </NavItem>
                                                                        <NavItem>
                                                                            <NavLink style={{ cursor: "pointer" }}
                                                                                className={classnames({ active: customActiveTab === "6", })}
                                                                                onClick={() => { toggleCustom("6"); }}>All Applications
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    </Nav>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <TabContent activeTab={customActiveTab} className="text-muted" >
                                                                <TabPane tabId="1" id="home1">
                                                                    <div className="row">
                                                                        <div className="col-lg-12">
                                                                            <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent filter-header">
                                                                                    <div className="app-search p-0">
                                                                                        <div className="position-relative shadow-sm">
                                                                                            <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                            <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                            <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="app-search inner-border-0 p-0 mx-3">
                                                                                        <div className="dateinput">
                                                                                            <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex-shrink-0 ms-auto">
                                                                                        <ul className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center mb-0 flex-nowrap" role="tablist">
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent active" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    All
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Today
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Weekly
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Monthly
                                                                                                </div>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card-body px-0 pb-0">
                                                                                    <div className="tab-content text-muted">
                                                                                        <div className="row mb-4 align-items-center comment-from-box">
                                                                                            <div className="col-10" style={{ width: "calc(100% - 160px)" }}>
                                                                                                <select data-choices data-choices-search-false className="statusupdate" data-choices-sorting-false>
                                                                                                    <option>Select Priority</option>
                                                                                                    <option>Your application is currently under review and we will provide an update as soon as possible.</option>
                                                                                                    <option>It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience.</option>
                                                                                                    <option>Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. </option>
                                                                                                </select>
                                                                                            </div>
                                                                                            <div className="col-1" style={{ width: "80px" }}>
                                                                                                <button className="btn btn-primary w-100" id="btn-submt-click"><i data-feather="send" className="icon-sm"></i></button>
                                                                                            </div>
                                                                                            <div className="col-1" style={{ width: "80px" }}>
                                                                                                <button id="loadMore" className="btn btn-primary w-100"><i data-feather="rotate-ccw" className="icon-sm"></i></button>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane active" id="all" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample" style={{ display: "flex", flexDirection: "column-reverse" }}>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem one-show">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">The application for a Passport Application has been successfully submitted. <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem two-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">Your application is currently under review and we will provide an update as soon as possible. <span className="four"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem three-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience. <span className="three"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem four-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem five-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="today" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Bank Authorization Letter" submitted successfully <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Business License" submitted successfully <span className="three"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted"> Supported document missing, please upload Business License & Bank Authorization Letter <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">New Land Mobile Radio License request submitted successfully <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="weekly" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2"> Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Business License" submitted successfully <span className="three"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted"> Supported document missing, please upload Business License & Bank Authorization Letter <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">New Land Mobile Radio License request submitted successfully <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="monthly" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience. <span className="three"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted">Your application is currently under review and we will provide an update as soon as possible. <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">The application for a Passport Application has been successfully submitted. <span className="five"></span> 11:00 AM</small>
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
                                                                </TabPane>
                                                                <TabPane tabId="2">
                                                                    <div>
                                                                        <div className="card mb-0 border-0">
                                                                            <div className="card-body d-none">
                                                                                <div className="row">
                                                                                    <div className="col-lg-4 col-12 mb-4">
                                                                                        <div className="mb-1 text-muted">Select Application:</div>
                                                                                        <select className="form-control bg-white" data-choices data-choices-search-false data-choices-sorting-false name="choices-single-default" id="idStatus">
                                                                                            <option disabled>Select Application:</option>
                                                                                            <option >Land Mobile Radio License</option>
                                                                                            <option>Aircraft Radio License</option>
                                                                                            <option>Electricity Generation License</option>
                                                                                            <option>Maritime Mobile Licence</option>
                                                                                            <option>Amateur Radio Application</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="card-body ">
                                                                                <div className="card">
                                                                                    <div className="card-body">
                                                                                        <div className="row mb-3 mb-xl-4">
                                                                                            <div className="col-12 mb-4 border-bottom pb-3">
                                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                                    <h5 className="text-black fs-20 fw-bold mb-0">KYC Information</h5>
                                                                                                    <div href="#" className="d-flex align-items-center btn btn-sm btn-outline-primary">
                                                                                                        <i className="bx bxs-file-pdf" style={{ fontSize: "20px", marginRight: "5px" }}></i><small> Download</small>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Application For:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">New Application</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Application Type:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">Emergency</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Applicant Full Name:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">
                                                                                                            Kartik Mehta
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Date of Birth:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">
                                                                                                            25 Apr, 1980
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Place of Birth:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">
                                                                                                            CAYMAN ISLANDS
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Gender:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">
                                                                                                            Male
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <div className="">
                                                                                                        <label className="mb-0 fs-14 fw-bold text-black">Marital Status:</label>
                                                                                                        <div className="w-100 mb-2 fs-14">
                                                                                                            Married
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Address:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        122, Cannon Place North Sound Road,<br /> Industrial Park, Abaco, <br /> GEORGE TOWN, KY1-1208<br /> CAYMAN ISLANDS
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Mailing address
                                                                                                        are different?</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        NO
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <h6 className="text-black fs-16 fw-bold">Phone:</h6>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        (647) 648-2233
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-4">
                                                                                                <div className="mb-3">
                                                                                                    <h6 className="text-black fs-16 fw-bold">Email:</h6>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        kartik@netclues.com
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="row mb-3">
                                                                                            <div className="col-12">
                                                                                                <h5 className="text-black fs-20 fw-bold mb-4 border-bottom pb-3">Uploaded Documents</h5>
                                                                                            </div>
                                                                                            <div className="col-12">
                                                                                                <div className="table-responsive">
                                                                                                    <table className="table">
                                                                                                        <thead>
                                                                                                            <tr>
                                                                                                                <th>
                                                                                                                    Name
                                                                                                                </th>
                                                                                                                <th>
                                                                                                                    File Type
                                                                                                                </th>
                                                                                                                <th>
                                                                                                                    Status
                                                                                                                </th>
                                                                                                                <th>
                                                                                                                </th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td>
                                                                                                                    Birth Certificate
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    PDF
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <span className="badge text-bg-success">Uploaded</span>
                                                                                                                </td>
                                                                                                                <td></td>
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
                                                                </TabPane>
                                                                <TabPane tabId="3">
                                                                    <div>
                                                                        <div className="row">
                                                                            <div className="col-12 col-sm-6">
                                                                                <div className="card border-0">
                                                                                    <div className="card-header">
                                                                                        <h5 className="mb-0">Prerequisite:</h5>
                                                                                    </div>
                                                                                    <div className="card-body cms">
                                                                                        <ul className="mb-0">
                                                                                            <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                                                                                took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining
                                                                                                essentially unchanged.</li>
                                                                                            <li>IIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
                                                                                                including versions of Lorem Ipsum.</li>
                                                                                            <li>
                                                                                                Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classNameical Latin literature from 45 BC, making it over 2000 years old.
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card border-0">
                                                                                    <div className="card-header">
                                                                                        <h5 className="mb-0">Instructions:</h5>
                                                                                    </div>
                                                                                    <div className="card-body cms">
                                                                                        <ol style={{ listStylePosition: "inside" }} className="mb-0">
                                                                                            <li>Registering a Licensing within prescribed 21 days
                                                                                                <ul>
                                                                                                    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                                    <li>Aliquam tincidunt mauris eu risus.</li>
                                                                                                    <li>Vestibulum auctor dapibus neque.</li>
                                                                                                </ul>
                                                                                            </li>
                                                                                            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                            <li>
                                                                                                Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                                                                                                <ul>
                                                                                                    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                                    <li>Aliquam tincidunt mauris eu risus.</li>
                                                                                                    <li>Vestibulum auctor dapibus neque.</li>
                                                                                                </ul>
                                                                                            </li>
                                                                                            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                        </ol>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-12 col-sm-6">
                                                                                <div className="card border-0">
                                                                                    <div className="card-header align-items-center d-flex border-bottom-dashed">
                                                                                        <h5 className="mb-0 flex-grow-1">Attachments</h5>
                                                                                        <div className="flex-shrink-0 d-none">
                                                                                            <button type="button" className="btn btn-soft-info btn-sm"><i className="ri-upload-2-fill me-1 align-bottom"></i> Upload</button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="card-body">
                                                                                        <div className="vstack gap-2">
                                                                                            <div className="border rounded border-dashed p-2">
                                                                                                <div className="d-flex align-items-center">
                                                                                                    <div className="flex-shrink-0 me-3">
                                                                                                        <div className="avatar-sm">
                                                                                                            <div className="avatar-title bg-light text-secondary rounded fs-24">
                                                                                                                <i className="ri-folder-zip-line"></i>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex-grow-1 overflow-hidden">
                                                                                                        <h5 className="fs-13 mb-1"><div href="#" className="text-body text-truncate d-block">Birth Certificate</div></h5>
                                                                                                    </div>
                                                                                                    <div className="flex-shrink-0 ms-2">
                                                                                                        <div className="d-flex gap-1 align-items-center">
                                                                                                            <div>
                                                                                                                <span className="badge bg-success">Checked & Verified</span>
                                                                                                            </div>
                                                                                                            <button type="button" className="btn btn-icon text-muted btn-sm fs-18"><i className="ri-download-2-line"></i></button>
                                                                                                            <div className="dropdown">
                                                                                                                <button className="btn btn-icon text-muted btn-sm fs-18 dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                                                    <i className="ri-more-fill"></i>
                                                                                                                </button>
                                                                                                                <ul className="dropdown-menu">
                                                                                                                    <li><div className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#approved">Checked & Verified</div></li>
                                                                                                                    <li><div className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#uprejected">Rejected</div></li>
                                                                                                                </ul>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card border-0">
                                                                                    <div className="card-header">
                                                                                        <h5 className="mb-0">Request for the document</h5>
                                                                                    </div>
                                                                                    <div className="card-body cms">
                                                                                        <form className="tablelist-form" autoComplete="off">
                                                                                            <div className="row g-3">
                                                                                                <div className="col-lg-12">
                                                                                                    <label htmlFor="addaddress-Name" className="form-label">Description</label>
                                                                                                    <textarea className="form-control" id="VertimeassageInput" rows="3" placeholder="Enter your description"></textarea>
                                                                                                </div>
                                                                                                <div className="col-lg-12 mt-3 text-end">
                                                                                                    <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#application-preview">
                                                                                                        Submit
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </form>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TabPane>
                                                                <TabPane tabId="4">
                                                                    <div>
                                                                        <div className="col-12">
                                                                            <div className="row">
                                                                                <div className="col-lg-12">
                                                                                    <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                        <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                            <div className="app-search p-0">
                                                                                                <div className="position-relative shadow-sm">
                                                                                                    <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                                    <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                    <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="app-search inner-border-0 p-0 mx-3">
                                                                                                <div className="dateinput">
                                                                                                    <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="card border-0 mt-3">
                                                                                            <div className="card-body p-0">
                                                                                                <div className="table-responsive">
                                                                                                    <table className="table mb-0">
                                                                                                        <thead>
                                                                                                            <tr>
                                                                                                                <th>Transaction Number</th>
                                                                                                                <th>Transaction Date</th>
                                                                                                                <th>Services</th>
                                                                                                                <th>Department</th>
                                                                                                                <th>Receipt Number</th>
                                                                                                                <th>Transaction Status</th>
                                                                                                                <th>Payment Mode</th>
                                                                                                                <th>Paid Amount</th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td>T12345678</td>
                                                                                                                <td><span className="five"></span></td>
                                                                                                                <td>Passport</td>
                                                                                                                <td>Passport Office Ministry of Foreign Affairs </td>
                                                                                                                <td>254500</td>
                                                                                                                <td>Success</td>
                                                                                                                <td>Credit Card </td>
                                                                                                                <td>$50.00</td>
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
                                                                </TabPane>
                                                                <TabPane tabId="5">
                                                                    <div>
                                                                        <div className="col-12">
                                                                            <div className="row">
                                                                                <div className="col-lg-12">
                                                                                    <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                        <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                            <div className="app-search p-0">
                                                                                                <div className="position-relative shadow-sm">
                                                                                                    <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                                    <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                    <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="app-search inner-border-0 p-0 mx-3">
                                                                                                <div className="dateinput">
                                                                                                    <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                                </div>
                                                                                            </div>
                                                                                            <input type="button" className="bg-primary form-control text-white" data-bs-toggle="modal" data-bs-target="#showModal" style={{ maxWidth: "max-content" }} />
                                                                                        </div>
                                                                                        <div className="card border-0 mt-3">
                                                                                            <div className="card-body p-0">
                                                                                                <div className="table-responsive" style={{ minHeight: "350px" }}>
                                                                                                    <table className="table mb-0">
                                                                                                        <thead>
                                                                                                            <tr>
                                                                                                                <th className="fw-bold">Tickets ID</th>
                                                                                                                <th className="fw-bold">Department Name</th>
                                                                                                                <th className="fw-bold">Services</th>
                                                                                                                <th className="fw-bold">Create Date / Time</th>
                                                                                                                <th className="fw-bold">Assigned to</th>
                                                                                                                <th className="fw-bold">Responded on</th>
                                                                                                                <th className="fw-bold">Priority</th>
                                                                                                                <th className="fw-bold">Action</th>
                                                                                                                <th className="fw-bold"></th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td><div href="#" className="fw-bold text-black">#T63245</div></td>
                                                                                                                <td>Passport Office Ministry of Foreign Affairs</td>
                                                                                                                <td className="fw-bold">Passport</td>
                                                                                                                <td><span className="current-date"></span><small className="d-block fs-11">07:59 PM</small></td>
                                                                                                                <td style={{ width: "200px" }}>
                                                                                                                    <select data-choices data-choices-sorting-false className="assigntodrop">
                                                                                                                        <option disabled></option>
                                                                                                                        <option>Erica Kernan</option>
                                                                                                                        <option>Leonard Dames Jr</option>
                                                                                                                        <option>Millie Dawkins</option>
                                                                                                                        <option>Keffieann Ferguson</option>
                                                                                                                        <option>Donald Rolle</option>
                                                                                                                    </select>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <span className="current-date"></span><small className="d-block fs-11">09:00 PM</small>
                                                                                                                </td>
                                                                                                                <td style={{ width: "80px" }}>
                                                                                                                    <select data-choices data-choices-search-false className="colorchangepriority" data-choices-sorting-false>
                                                                                                                        <option disabled>Select Priority</option>
                                                                                                                        <option>High</option>
                                                                                                                        <option>Medium</option>
                                                                                                                        <option>Low</option>
                                                                                                                    </select>
                                                                                                                </td>
                                                                                                                <td style={{ width: "100px" }}>
                                                                                                                    <select data-choices data-choices-search-false data-choices-sorting-false>
                                                                                                                        <option>New</option>
                                                                                                                        <option>Pending</option>
                                                                                                                        <option>In Progress</option>
                                                                                                                        <option>Closed</option>
                                                                                                                    </select>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div href="#" className="py-2 px-2">
                                                                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                            <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                        </svg>
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
                                                                </TabPane>
                                                                <TabPane tabId="6">
                                                                    <div>
                                                                        <div className="col-12">
                                                                            <div className="row">
                                                                                <div className="col-lg-12">
                                                                                    <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                        <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                            <div className="app-search p-0">
                                                                                                <div className="position-relative shadow-sm">
                                                                                                    <input type="text" className="form-control bg-white" placeholder="Search..." autoComplete="off" id="search-options" />
                                                                                                    <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                    <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="app-search inner-border-0 p-0 mx-3">
                                                                                                <div className="dateinput">
                                                                                                    <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="card border-0 mt-3">
                                                                                            <div className="card-body p-0">
                                                                                                <div className="table-responsive" style={{ minHeight: "350px" }}>
                                                                                                    <table className="table table-striped table-borderless mb-0">
                                                                                                        <thead>
                                                                                                            <tr>
                                                                                                                <th className="fw-bold">Application ID</th>
                                                                                                                <th className="fw-bold">Date / Time</th>
                                                                                                                <th className="fw-bold">Services Name</th>
                                                                                                                <th className="fw-bold">Department Name</th>
                                                                                                                <th className="fw-bold">TAT</th>
                                                                                                                <th className="fw-bold">Transction Status</th>
                                                                                                                <th className="fw-bold">Status</th>
                                                                                                                <th className="status text-center" style={{ width: "100px" }}>
                                                                                                                </th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td><div href="#" className="fw-bold text-black">BSBS546861</div></td>
                                                                                                                <td><span className="four">27 Mar, 2023</span><small className="d-block fs-11">11:00 AM</small></td>
                                                                                                                <td><strong className="fw-bold">Birth certificate</strong></td>
                                                                                                                <td>Registrar General's Department</td>
                                                                                                                <td>
                                                                                                                    <span className="text-primary fw-semibold text-nowrap" id="demo1">09:34:57</span>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="btn btn-outline-secondary badge-light-success pe-none">
                                                                                                                        <span className="fs-14">Success</span>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="btn badge-soft-warning badge-outline-warning pe-none">
                                                                                                                        <span className="fs-14 text-warning fw-semibold">Pending</span>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="d-flex align-items-center">
                                                                                                                        <div href="#" className="py-2 px-2">
                                                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                                <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                            </svg>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                            <tr>
                                                                                                                <td><div href="#" className="fw-bold text-black">BSPS546861</div></td>
                                                                                                                <td><span className="five">25 Mar, 2023</span><small className="d-block fs-11">01:00 PM</small></td>
                                                                                                                <td><strong className="fw-bold">Passport</strong></td>
                                                                                                                <td>Passport Office Ministry of Foreign Affairs</td>
                                                                                                                <td>
                                                                                                                    <span className="text-success fw-semibold text-nowrap">05:46:04</span>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="btn btn-outline-secondary badge-light-success pe-none">
                                                                                                                        <span className="fs-14">Success</span>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="btn badge-soft-success badge-outline-success pe-none">
                                                                                                                        <span className="fs-14 text-success  fw-semibold">Completed</span>
                                                                                                                    </div>
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <div className="d-flex align-items-center">
                                                                                                                        <div href="#" className="py-2 px-2">
                                                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                                <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                                <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                            </svg>
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
                                                                </TabPane>
                                                            </TabContent>
                                                            <div className="tab-content text-muted mt-3 mt-lg-0 home-list-tabs">
                                                                <div className="tab-pane border border-0 fade p-0 active show" id="activity-home" role="tabpanel" aria-labelledby="activity-home-tab">
                                                                    {/* <div className="row">
                                                                        <div className="col-lg-12">
                                                                            <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent filter-header">
                                                                                    <div className="app-search p-0">
                                                                                        <div className="position-relative shadow-sm">
                                                                                            <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                            <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                            <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="app-search inner-border-0 p-0 mx-3">
                                                                                        <div className="dateinput">
                                                                                            <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex-shrink-0 ms-auto">
                                                                                        <ul className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center mb-0 flex-nowrap" role="tablist">
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent active" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    All
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Today
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Weekly
                                                                                                </div>
                                                                                            </li>
                                                                                            <li className="nav-item">
                                                                                                <div className="nav-link fs-14 bg-transparent" data-bs-toggle="tab" href="#" role="tab">
                                                                                                    Monthly
                                                                                                </div>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card-body px-0 pb-0">
                                                                                    <div className="tab-content text-muted">
                                                                                        <div className="row mb-4 align-items-center comment-from-box">
                                                                                            <div className="col-10" style={{ width: "calc(100% - 160px)" }}>
                                                                                                <select data-choices data-choices-search-false className="statusupdate" data-choices-sorting-false>
                                                                                                    <option>Select Priority</option>
                                                                                                    <option>Your application is currently under review and we will provide an update as soon as possible.</option>
                                                                                                    <option>It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience.</option>
                                                                                                    <option>Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. </option>
                                                                                                </select>
                                                                                            </div>
                                                                                            <div className="col-1" style={{ width: "80px" }}>
                                                                                                <button className="btn btn-primary w-100" id="btn-submt-click"><i data-feather="send" className="icon-sm"></i></button>
                                                                                            </div>
                                                                                            <div className="col-1" style={{ width: "80px" }}>
                                                                                                <button id="loadMore" className="btn btn-primary w-100"><i data-feather="rotate-ccw" className="icon-sm"></i></button>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane active" id="all" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample" style={{ display: "flex", flexDirection: "column-reverse" }}>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem one-show">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">The application for a Passport Application has been successfully submitted. <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem two-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">Your application is currently under review and we will provide an update as soon as possible. <span className="four"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem three-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience. <span className="three"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem four-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem five-show d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="today" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Bank Authorization Letter" submitted successfully <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Business License" submitted successfully <span className="three"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted"> Supported document missing, please upload Business License & Bank Authorization Letter <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">New Land Mobile Radio License request submitted successfully <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="weekly" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2"> Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">Supported document "Business License" submitted successfully <span className="three"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted"> Supported document missing, please upload Business License & Bank Authorization Letter <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 d-none">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">New Land Mobile Radio License request submitted successfully <span className="five"></span> 11:00 AM</small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="tab-pane" id="monthly" role="tabpanel">
                                                                                            <div className="profile-timeline">
                                                                                                <div className="accordion accordion-flush" id="todayExample">
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted mb-2">Your application has been approved and the Passport Application has been issued. You may download it from your account at your earliest convenience. <span className="current-date"></span> 10:00 AM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted mb-2">The requested Valid Photo ID has been successfully uploaded.
                                                                                                                            <span className="one"></span> 4:05 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3 loaditem d-none">
                                                                                                        <div className="accordion-header" id="headingThree">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Camille Gomez</h6>
                                                                                                                        <small className="text-muted mb-2">It has come to our attention that the Valid Photo ID is currently missing and we kindly request that you provide it at your earliest convenience. <span className="three"></span>11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingTwo">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="false">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0 avatar-xs">
                                                                                                                        <div className="avatar-title bg-light text-success rounded-circle">
                                                                                                                            <img src="assets/images/users/avatar-5.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1"> Camille Gomez </h6>
                                                                                                                        <small className="text-muted">Your application is currently under review and we will provide an update as soon as possible. <span className="four"></span> 11:35 PM </small>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="accordion-item border-0 bg-white p-3 rounded mb-3">
                                                                                                        <div className="accordion-header" id="headingOne">
                                                                                                            <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true">
                                                                                                                <div className="d-flex">
                                                                                                                    <div className="flex-shrink-0">
                                                                                                                        <img src="assets/images/users/avatar-1.jpg" alt="" className="avatar-xs rounded-circle" />
                                                                                                                    </div>
                                                                                                                    <div className="flex-grow-1 ms-3">
                                                                                                                        <h6 className="fs-14 mb-1">Kartik Mehta</h6>
                                                                                                                        <small className="text-muted">The application for a Passport Application has been successfully submitted. <span className="five"></span> 11:00 AM</small>
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
                                                                    </div> */}
                                                                </div>
                                                                {/* <div className="tab-pane border border-0 fade p-0" id="parents-details" role="tabpanel" aria-labelledby="parents-details-tab">
                                                                    <div className="card mb-0 border-0">
                                                                        <div className="card-body d-none">
                                                                            <div className="row">
                                                                                <div className="col-lg-4 col-12 mb-4">
                                                                                    <div className="mb-1 text-muted">Select Application:</div>
                                                                                    <select className="form-control bg-white" data-choices data-choices-search-false data-choices-sorting-false name="choices-single-default" id="idStatus">
                                                                                        <option disabled>Select Application:</option>
                                                                                        <option >Land Mobile Radio License</option>
                                                                                        <option>Aircraft Radio License</option>
                                                                                        <option>Electricity Generation License</option>
                                                                                        <option>Maritime Mobile Licence</option>
                                                                                        <option>Amateur Radio Application</option>
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="card-body ">
                                                                            <div className="card">
                                                                                <div className="card-body">
                                                                                    <div className="row mb-3 mb-xl-4">
                                                                                        <div className="col-12 mb-4 border-bottom pb-3">
                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                <h5 className="text-black fs-20 fw-bold mb-0">KYC Information</h5>
                                                                                                <div href="#" className="d-flex align-items-center btn btn-sm btn-outline-primary">
                                                                                                    <i className="bx bxs-file-pdf" style={{ fontSize: "20px", marginRight: "5px" }}></i><small> Download</small>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Application For:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">New Application</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Application Type:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">Emergency</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Applicant Full Name:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        Kartik Mehta
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Date of Birth:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        25 Apr, 1980
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Place of Birth:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        CAYMAN ISLANDS
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Gender:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        Male
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <div className="">
                                                                                                    <label className="mb-0 fs-14 fw-bold text-black">Marital Status:</label>
                                                                                                    <div className="w-100 mb-2 fs-14">
                                                                                                        Married
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <label className="mb-0 fs-14 fw-bold text-black">Address:</label>
                                                                                                <div className="w-100 mb-2 fs-14">
                                                                                                    122, Cannon Place North Sound Road,<br /> Industrial Park, Abaco, <br /> GEORGE TOWN, KY1-1208<br /> CAYMAN ISLANDS
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <label className="mb-0 fs-14 fw-bold text-black">Mailing address
                                                                                                    are different?</label>
                                                                                                <div className="w-100 mb-2 fs-14">
                                                                                                    NO
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <h6 className="text-black fs-16 fw-bold">Phone:</h6>
                                                                                                <div className="w-100 mb-2 fs-14">
                                                                                                    (647) 648-2233
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="col-12 col-md-4">
                                                                                            <div className="mb-3">
                                                                                                <h6 className="text-black fs-16 fw-bold">Email:</h6>
                                                                                                <div className="w-100 mb-2 fs-14">
                                                                                                    kartik@netclues.com
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="row mb-3">
                                                                                        <div className="col-12">
                                                                                            <h5 className="text-black fs-20 fw-bold mb-4 border-bottom pb-3">Uploaded Documents</h5>
                                                                                        </div>
                                                                                        <div className="col-12">
                                                                                            <div className="table-responsive">
                                                                                                <table className="table">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th>
                                                                                                                Name
                                                                                                            </th>
                                                                                                            <th>
                                                                                                                File Type
                                                                                                            </th>
                                                                                                            <th>
                                                                                                                Status
                                                                                                            </th>
                                                                                                            <th>
                                                                                                            </th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td>
                                                                                                                Birth Certificate
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                PDF
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <span className="badge text-bg-success">Uploaded</span>
                                                                                                            </td>
                                                                                                            <td></td>
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
                                                                </div> */}
                                                                {/* <div className="tab-pane border border-0 fade p-0" id="attachments" role="tabpanel" aria-labelledby="attachments-pop-tab">
                                                                    <div className="row">
                                                                        <div className="col-12 col-sm-6">
                                                                            <div className="card border-0">
                                                                                <div className="card-header">
                                                                                    <h5 className="mb-0">Prerequisite:</h5>
                                                                                </div>
                                                                                <div className="card-body cms">
                                                                                    <ul className="mb-0">
                                                                                        <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer
                                                                                            took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining
                                                                                            essentially unchanged.</li>
                                                                                        <li>IIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker
                                                                                            including versions of Lorem Ipsum.</li>
                                                                                        <li>
                                                                                            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classNameical Latin literature from 45 BC, making it over 2000 years old.
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <div className="card border-0">
                                                                                <div className="card-header">
                                                                                    <h5 className="mb-0">Instructions:</h5>
                                                                                </div>
                                                                                <div className="card-body cms">
                                                                                    <ol style={{ listStylePosition: "inside" }} className="mb-0">
                                                                                        <li>Registering a Licensing within prescribed 21 days
                                                                                            <ul>
                                                                                                <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                                <li>Aliquam tincidunt mauris eu risus.</li>
                                                                                                <li>Vestibulum auctor dapibus neque.</li>
                                                                                            </ul>
                                                                                        </li>
                                                                                        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                        <li>
                                                                                            Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                                                                                            <ul>
                                                                                                <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                                <li>Aliquam tincidunt mauris eu risus.</li>
                                                                                                <li>Vestibulum auctor dapibus neque.</li>
                                                                                            </ul>
                                                                                        </li>
                                                                                        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
                                                                                    </ol>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-sm-6">
                                                                            <div className="card border-0">
                                                                                <div className="card-header align-items-center d-flex border-bottom-dashed">
                                                                                    <h5 className="mb-0 flex-grow-1">Attachments</h5>
                                                                                    <div className="flex-shrink-0 d-none">
                                                                                        <button type="button" className="btn btn-soft-info btn-sm"><i className="ri-upload-2-fill me-1 align-bottom"></i> Upload</button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card-body">
                                                                                    <div className="vstack gap-2">
                                                                                        <div className="border rounded border-dashed p-2">
                                                                                            <div className="d-flex align-items-center">
                                                                                                <div className="flex-shrink-0 me-3">
                                                                                                    <div className="avatar-sm">
                                                                                                        <div className="avatar-title bg-light text-secondary rounded fs-24">
                                                                                                            <i className="ri-folder-zip-line"></i>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="flex-grow-1 overflow-hidden">
                                                                                                    <h5 className="fs-13 mb-1"><div href="#" className="text-body text-truncate d-block">Birth Certificate</div></h5>
                                                                                                </div>
                                                                                                <div className="flex-shrink-0 ms-2">
                                                                                                    <div className="d-flex gap-1 align-items-center">
                                                                                                        <div>
                                                                                                            <span className="badge bg-success">Checked & Verified</span>
                                                                                                        </div>
                                                                                                        <button type="button" className="btn btn-icon text-muted btn-sm fs-18"><i className="ri-download-2-line"></i></button>
                                                                                                        <div className="dropdown">
                                                                                                            <button className="btn btn-icon text-muted btn-sm fs-18 dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                                                <i className="ri-more-fill"></i>
                                                                                                            </button>
                                                                                                            <ul className="dropdown-menu">
                                                                                                                <li><div className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#approved">Checked & Verified</div></li>
                                                                                                                <li><div className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#uprejected">Rejected</div></li>
                                                                                                            </ul>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="card border-0">
                                                                                <div className="card-header">
                                                                                    <h5 className="mb-0">Request for the document</h5>
                                                                                </div>
                                                                                <div className="card-body cms">
                                                                                    <form className="tablelist-form" autoComplete="off">
                                                                                        <div className="row g-3">
                                                                                            <div className="col-lg-12">
                                                                                                <label htmlFor="addaddress-Name" className="form-label">Description</label>
                                                                                                <textarea className="form-control" id="VertimeassageInput" rows="3" placeholder="Enter your description"></textarea>
                                                                                            </div>
                                                                                            <div className="col-lg-12 mt-3 text-end">
                                                                                                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#application-preview">
                                                                                                    Submit
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </form>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                                {/* <div className="tab-pane border border-0 fade p-0 d-none" id="service-updated-pop" role="tabpanel" aria-labelledby="service-updated-pop-tab">
                                                                    <div className="col-12">
                                                                        <div className="row">
                                                                            <div className="col-xxl-12">
                                                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                                                    <div className="d-flex align-items-center ms-auto">
                                                                                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createserviceModal"> Update Service</button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="card border-0 pb-0 mb-0 bg-transparent">
                                                                                    <div className="card-body pt-0 px-0 pb-0">
                                                                                        <ul className="list-group list-group-flush border-dashed">
                                                                                            <li className="list-group-item bg-white mb-3 border-0 shadow-sm">
                                                                                                <div className="row align-items-center g-3">
                                                                                                    <div className="col">
                                                                                                        <div className="d-flex mb-2">
                                                                                                            <h4 className="text-muted mt-0 mb-1 fs-13">Service Status</h4>
                                                                                                            <div className="ms-auto d-flex align-items-center">
                                                                                                                <h5 className="text-muted mt-0 mb-0 fs-13">16 Jan, 2023 10:00 AM </h5>
                                                                                                            </div>
                                                                                                            <div className="badge bg-red d-inline-flex bg-success align-items-center ms-2">
                                                                                                                <span className="mb-0 ms-1 fs-13">Approved</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="mt-3 d-none">
                                                                                                            <div className="d-flex align-items-center" data-bs-toggle="collapse" href="#" role="button" aria-expanded="true" aria-controls="collapseExample">
                                                                                                                <i data-feather="message-square" className="icon-sm me-2"></i><span>Add comment</span>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="collapse mt-3 d-none" id="collapseExample">
                                                                                                            <div className="card mb-0">
                                                                                                                <div className="card-body">
                                                                                                                    <div className="mx-n4 px-4">
                                                                                                                        <div className="accordion accordion-flush">
                                                                                                                            <div className="accordion-item border-dashed">
                                                                                                                                <div className="accordion-header">
                                                                                                                                    <div role="button" className="btn w-100 text-start px-0 bg-transparent shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true" aria-controls="email-collapseThree">
                                                                                                                                        <div className="d-flex align-items-center text-muted">
                                                                                                                                            <div className="flex-shrink-0 avatar-xs me-3">
                                                                                                                                                <img src="assets/images//users/avatar-2.jpg" alt="" className="img-fluid rounded-circle" />
                                                                                                                                            </div>
                                                                                                                                            <div className="flex-grow-1 overflow-hidden">
                                                                                                                                                <h5 className="fs-14 text-truncate mb-0">Jack Davis</h5>
                                                                                                                                                <div className="text-truncate fs-12">to: me</div>
                                                                                                                                            </div>
                                                                                                                                            <div className="flex-shrink-0 align-self-start">
                                                                                                                                                <div className="text-muted fs-12">10 Jan 2023, 10:08 AM</div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        
                                                                                                                    </div>
                                                                                                                    <div className="mt-auto">
                                                                                                                        <form className="mt-2">
                                                                                                                            <div>
                                                                                                                                <label htmlFor="exampleFormControlTextarea1" className="form-label">Reply :</label>
                                                                                                                                <textarea className="form-control border-bottom-0 rounded-top rounded-0 border" id="exampleFormControlTextarea1" rows="3" placeholder="Enter message"></textarea>
                                                                                                                                <div className="bg-light px-2 py-1 rouned-bottom border">
                                                                                                                                    <div className="row">
                                                                                                                                        <div className="col">
                                                                                                                                            <div className="btn-group" role="group">
                                                                                                                                                <button type="button" className="btn btn-sm py-0 fs-15 btn-light" data-bs-toggle="tooltip" data-bs-placement="top" title="Bold"><i className="ri-bold align-bottom"></i></button>
                                                                                                                                                <button type="button" className="btn btn-sm py-0 fs-15 btn-light" data-bs-toggle="tooltip" data-bs-placement="top" title="Italic"><i className="ri-italic align-bottom"></i></button>
                                                                                                                                                <button type="button" className="btn btn-sm py-0 fs-15 btn-light" data-bs-toggle="tooltip" data-bs-placement="top" title="Link"><i className="ri-link align-bottom"></i></button>
                                                                                                                                                <button type="button" className="btn btn-sm py-0 fs-15 btn-light" data-bs-toggle="tooltip" data-bs-placement="top" title="Image"><i className="ri-image-2-line align-bottom"></i></button>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                        <div className="col-auto">
                                                                                                                                            <div className="btn-group">
                                                                                                                                                <button type="button" className="btn btn-sm btn-success"><i className="ri-send-plane-2-fill align-bottom"></i></button>
                                                                                                                                                <button type="button" className="btn btn-sm btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                                                                                    <span className="visually-hidden">Toggle Dropdown</span>
                                                                                                                                                </button>
                                                                                                                                                <ul className="dropdown-menu dropdown-menu-end">
                                                                                                                                                    <li><div className="dropdown-item" href="#"><i className="ri-timer-line text-muted me-1 align-bottom"></i> Schedule Send</div></li>
                                                                                                                                                </ul>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </form>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div> */}
                                                                {/* <div className="tab-pane border border-0 fade p-0" id="payment-updated-pop" role="tabpanel" aria-labelledby="payment-updated-pop-tab">
                                                                    <div className="col-12">
                                                                        <div className="row">
                                                                            <div className="col-lg-12">
                                                                                <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                    <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                        <div className="app-search p-0">
                                                                                            <div className="position-relative shadow-sm">
                                                                                                <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                                <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="app-search inner-border-0 p-0 mx-3">
                                                                                            <div className="dateinput">
                                                                                                <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="card border-0 mt-3">
                                                                                        <div className="card-body p-0">
                                                                                            <div className="table-responsive">
                                                                                                <table className="table mb-0">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th>Transaction Number</th>
                                                                                                            <th>Transaction Date</th>
                                                                                                            <th>Services</th>
                                                                                                            <th>Department</th>
                                                                                                            <th>Receipt Number</th>
                                                                                                            <th>Transaction Status</th>
                                                                                                            <th>Payment Mode</th>
                                                                                                            <th>Paid Amount</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td>T12345678</td>
                                                                                                            <td><span className="five"></span></td>
                                                                                                            <td>Passport</td>
                                                                                                            <td>Passport Office Ministry of Foreign Affairs </td>
                                                                                                            <td>254500</td>
                                                                                                            <td>Success</td>
                                                                                                            <td>Credit Card </td>
                                                                                                            <td>$50.00</td>
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
                                                                </div> */}
                                                                {/* <div className="tab-pane border border-0 fade p-0" id="tickets-updated-pop" role="tabpanel" aria-labelledby="payment-updated-pop-tab">
                                                                    <div className="col-12">
                                                                        <div className="row">
                                                                            <div className="col-lg-12">
                                                                                <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                    <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                        <div className="app-search p-0">
                                                                                            <div className="position-relative shadow-sm">
                                                                                                <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" id="search-options" />
                                                                                                <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="app-search inner-border-0 p-0 mx-3">
                                                                                            <div className="dateinput">
                                                                                                <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                            </div>
                                                                                        </div>
                                                                                        <input type="button" className="bg-primary form-control text-white" data-bs-toggle="modal" data-bs-target="#showModal" style={{ maxWidth: "max-content" }} />
                                                                                    </div>
                                                                                    <div className="card border-0 mt-3">
                                                                                        <div className="card-body p-0">
                                                                                            <div className="table-responsive" style={{ minHeight: "350px" }}>
                                                                                                <table className="table mb-0">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th className="fw-bold">Tickets ID</th>
                                                                                                            <th className="fw-bold">Department Name</th>
                                                                                                            <th className="fw-bold">Services</th>
                                                                                                            <th className="fw-bold">Create Date / Time</th>
                                                                                                            <th className="fw-bold">Assigned to</th>
                                                                                                            <th className="fw-bold">Responded on</th>
                                                                                                            <th className="fw-bold">Priority</th>
                                                                                                            <th className="fw-bold">Action</th>
                                                                                                            <th className="fw-bold"></th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td><div href="#" className="fw-bold text-black">#T63245</div></td>
                                                                                                            <td>Passport Office Ministry of Foreign Affairs</td>
                                                                                                            <td className="fw-bold">Passport</td>
                                                                                                            <td><span className="current-date"></span><small className="d-block fs-11">07:59 PM</small></td>
                                                                                                            <td style={{ width: "200px" }}>
                                                                                                                <select data-choices data-choices-sorting-false className="assigntodrop">
                                                                                                                    <option disabled></option>
                                                                                                                    <option>Erica Kernan</option>
                                                                                                                    <option>Leonard Dames Jr</option>
                                                                                                                    <option>Millie Dawkins</option>
                                                                                                                    <option>Keffieann Ferguson</option>
                                                                                                                    <option>Donald Rolle</option>
                                                                                                                </select>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <span className="current-date"></span><small className="d-block fs-11">09:00 PM</small>
                                                                                                            </td>
                                                                                                            <td style={{ width: "80px" }}>
                                                                                                                <select data-choices data-choices-search-false className="colorchangepriority" data-choices-sorting-false>
                                                                                                                    <option disabled>Select Priority</option>
                                                                                                                    <option>High</option>
                                                                                                                    <option>Medium</option>
                                                                                                                    <option>Low</option>
                                                                                                                </select>
                                                                                                            </td>
                                                                                                            <td style={{ width: "100px" }}>
                                                                                                                <select data-choices data-choices-search-false data-choices-sorting-false>
                                                                                                                    <option>New</option>
                                                                                                                    <option>Pending</option>
                                                                                                                    <option>In Progress</option>
                                                                                                                    <option>Closed</option>
                                                                                                                </select>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div href="#" className="py-2 px-2">
                                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                        <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                    </svg>
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
                                                                </div> */}
                                                                {/* <div className="tab-pane border border-0 fade p-0" id="allapp-updated-pop" role="tabpanel" aria-labelledby="payment-updated-pop-tab">
                                                                    <div className="col-12">
                                                                        <div className="row">
                                                                            <div className="col-lg-12">
                                                                                <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
                                                                                    <div className="card-header align-items-center d-flex px-0 border-0 py-0 bg-transparent">
                                                                                        <div className="app-search p-0">
                                                                                            <div className="position-relative shadow-sm">
                                                                                                <input type="text" className="form-control bg-white" placeholder="Search..." autoComplete="off" id="search-options" />
                                                                                                <span className="mdi mdi-magnify search-widget-icon"></span>
                                                                                                <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options"></span>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="app-search inner-border-0 p-0 mx-3">
                                                                                            <div className="dateinput">
                                                                                                <input type="text" className="form-control border-light flatpickr-input ps-3" id="demo-datepicker" data-provider="flatpickr" data-date-format="d M, Y" data-range-date="true" placeholder="Date Range" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="card border-0 mt-3">
                                                                                        <div className="card-body p-0">
                                                                                            <div className="table-responsive" style={{ minHeight: "350px" }}>
                                                                                                <table className="table table-striped table-borderless mb-0">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th className="fw-bold">Application ID</th>
                                                                                                            <th className="fw-bold">Date / Time</th>
                                                                                                            <th className="fw-bold">Services Name</th>
                                                                                                            <th className="fw-bold">Department Name</th>
                                                                                                            <th className="fw-bold">TAT</th>
                                                                                                            <th className="fw-bold">Transction Status</th>
                                                                                                            <th className="fw-bold">Status</th>
                                                                                                            <th className="status text-center" style={{ width: "100px" }}>
                                                                                                            </th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td><div href="#" className="fw-bold text-black">BSBS546861</div></td>
                                                                                                            <td><span className="four">27 Mar, 2023</span><small className="d-block fs-11">11:00 AM</small></td>
                                                                                                            <td><strong className="fw-bold">Birth certificate</strong></td>
                                                                                                            <td>Registrar General's Department</td>
                                                                                                            <td>
                                                                                                                <span className="text-primary fw-semibold text-nowrap" id="demo1">09:34:57</span>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="btn btn-outline-secondary badge-light-success pe-none">
                                                                                                                    <span className="fs-14">Success</span>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="btn badge-soft-warning badge-outline-warning pe-none">
                                                                                                                    <span className="fs-14 text-warning fw-semibold">Pending</span>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="d-flex align-items-center">
                                                                                                                    <div href="#" className="py-2 px-2">
                                                                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                            <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                        </svg>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td><div href="#" className="fw-bold text-black">BSPS546861</div></td>
                                                                                                            <td><span className="five">25 Mar, 2023</span><small className="d-block fs-11">01:00 PM</small></td>
                                                                                                            <td><strong className="fw-bold">Passport</strong></td>
                                                                                                            <td>Passport Office Ministry of Foreign Affairs</td>
                                                                                                            <td>
                                                                                                                <span className="text-success fw-semibold text-nowrap">05:46:04</span>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="btn btn-outline-secondary badge-light-success pe-none">
                                                                                                                    <span className="fs-14">Success</span>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="btn badge-soft-success badge-outline-success pe-none">
                                                                                                                    <span className="fs-14 text-success  fw-semibold">Completed</span>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <div className="d-flex align-items-center">
                                                                                                                    <div href="#" className="py-2 px-2">
                                                                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                                                                                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                                                                                                            <path className="i_color" fill="#394958" d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
                                                                                                                        </svg>
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
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-12 mt-5 pt-2">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header badge-soft-success">
                                                    <h5 className="card-title mb-0">Application Details</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="table-responsive table-card">
                                                        <table className="table table-borderless align-middle mb-0">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="fw-bold">NIB Number</td>
                                                                    <td className="fw-bold">NIB568689</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="fw-medium">Application ID</td>
                                                                    <td>BZPS546861</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="fw-medium">Department</td>
                                                                    <td>Passport Office Ministry of Foreign Affairs</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="fw-medium">Assigned To:</td>
                                                                    <td>
                                                                        <div className="avatar-group">
                                                                            <div href="#" className="avatar-group-item">
                                                                                <img src="assets/images/users/avatar-2.jpg" alt="" className="rounded-circle avatar-xs me-2" />
                                                                                <span>Camille Gomez</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="fw-medium">Status:</td>
                                                                    <td>
                                                                        <div className="btn badge-soft-danger badge-outline-danger pe-none">
                                                                            <span className="fs-14 text-danger">Pending</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="fw-medium">Last Activity</td>
                                                                    <td>14 min ago</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card mb-0">
                                        <div className="card-header badge-soft-success">
                                            <div className="d-flex">
                                                <div className="flex-grow-1">
                                                    <h5 className="card-title mb-0">Payment Details</h5>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive table-card">
                                                <table className="table table-borderless align-middle mb-0">
                                                    <tbody>
                                                        <tr>
                                                            <td className="text-muted fs-13" colSpan="2">Payment Mode :</td>
                                                            <td className="fw-semibold text-end">Credit Card ( VISA )</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="2" className="text-muted fs-13">Transaction Number :</td>
                                                            <td className="fw-semibold text-end">T12345678</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="2" className="text-muted fs-13">Receipt Number : </td>
                                                            <td className="fw-semibold text-end">254500</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="2" className="text-muted fs-13">Transaction Date Time : </td>
                                                            <td className="fw-semibold text-end"><span className="five"></span> 11:00 AM</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="2" className="text-muted fs-13">Transaction Status : </td>
                                                            <td className="fw-semibold text-end">Success</td>
                                                        </tr>
                                                        <tr className="table-active">
                                                            <th colSpan="2">Total :</th>
                                                            <td className="text-end">
                                                                <span className="fw-semibold">
                                                                    $50.00
                                                                </span>
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
            </div>
        </>
    )
}

export default PassportApplication