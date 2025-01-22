import { RefreshCcw } from 'feather-icons-react';
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import { Button, Spinner } from "react-bootstrap";
import { FaDownload } from "react-icons/fa6";
import { LoaderSpin } from '../../../common/Loader/Loader';

const ActivityTab = ({
  mainApplicationLoading,
  searchFilter,
  handleSearch,
  dateStart,
  dateEnd,
  onChangeHandler,
  resetFilter,
  durationOfLog,
  setDurationOfLog,
  comment,
  setComment,
  isloadingMessage,
  handleSubmitCommentLog,
  isloadingRefress,
  getLogList,
  logList,
  formatDateLog,
  handleDownload,
  stringAvatar
}) => {
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
          <div className="card-header px-0 border-0 py-0 bg-transparent filter-header">
            <div className="row">
              <div className="col-xl-12 col-xxl-9">
                <div className="row">
                  <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                    <div className="app-search p-0">
                      <div className="position-relative shadow-sm">
                        <input type="text" className="form-control bg-white" placeholder="Search Activity..." autoComplete="off" value={searchFilter} onChange={handleSearch} id="search-options" />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options" ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                    <div className=" inner-border-0">
                      <div className="dateinput flatpickr-bg-white">
                        <DateRangePopup dateStart={dateStart} dateEnd={dateEnd} onChangeHandler={onChangeHandler} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                    <button type="button" className="btn btn-primary bg-light border-light text-muted d-flex align-items-center" onClick={resetFilter} >
                      <RefreshCcw className="text-muted me-2" width="16" height="16" />{" "} <span> Reset </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-xl-12 col-xxl-3">
                <div className=" ms-auto">
                  <ul className="nav justify-content-end nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center mb-0 flex-nowrap" role="tablist" >
                    <li className="nav-item" role="button">
                      <span className={durationOfLog === "all" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab" role="tab" aria-selected="true" onClick={() => setDurationOfLog("all")}
                      >
                        All
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfLog === "today" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab"
                        role="tab"
                        aria-selected="false"
                        onClick={() => setDurationOfLog("today")}
                      >
                        Today
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfLog === "weekly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab"
                        role="tab"
                        aria-selected="false"
                        onClick={() => setDurationOfLog("weekly")}
                      >
                        Weekly
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfLog === "monthly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab"
                        role="tab"
                        aria-selected="false"
                        onClick={() => setDurationOfLog("monthly")}
                      >
                        Monthly
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body px-0 pb-0">
            <div className="tab-content text-muted">
              <div className="row mb-4 align-items-center comment-from-box">
                <div className="col-10" style={{ width: "calc(100% - 160px)", }} >
                  <input type="text" className="form-control" placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <div className="col-1" style={{ width: "80px" }}>
                  {isloadingMessage ? (
                    <Button variant="btn btn-primary w-100">
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="visually-hidden"> Loading... </span>
                    </Button>
                  ) : (
                    <button className="btn btn-primary w-100" onClick={handleSubmitCommentLog} >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send icon-sm" >
                        {" "}
                        <line x1="22" y1="2" x2="11" y2="13"></line>{" "}
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>{" "}
                      </svg>
                    </button>
                  )}
                </div>
                <div className="col-1" style={{ width: "80px", }} >
                 
                    <button id="loadMore" className="btn btn-primary w-100" onClick={getLogList} >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-rotate-ccw icon-sm" > <polyline points="1 4 1 10 7 10"></polyline> <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path> </svg>
                    </button>
                 
                </div>
              </div>
              <div className="tab-pane active" role="tabpanel" >
                <div className="profile-timeline">
                  <div className="accordion accordion-flush" id="todayExample">
                    {
                      isloadingRefress || mainApplicationLoading ? (
                        <div className="text-center">
                         <LoaderSpin/>
                        </div>
                      ) :
                        logList && logList?.map((log, index) => (
                          <div className="d-flex space-between accordion-item border-0 bg-white p-3 rounded mb-3 loaditem" key={index} >
                            <div className="accordion-header" id="headingOne">
                              <div className="accordion-button p-2 shadow-none" data-bs-toggle="collapse" href="#" aria-expanded="true" >
                                <div className="d-flex ">
                                  <div className="flex-shrink-0">
                                    {log?.logBy === "0" ? (
                                      <img src={log?.userInfo?.documentPath} alt="" className="avatar-xs rounded-circle" />
                                    ) : (
                                      log?.customerInfo?.documentPath
                                      ?<img src={log?.customerInfo?.documentPath} alt="" className="avatar-xs rounded-circle" />
                                      :<div className="avatar-xs rounded-circle border bg-primary text-white d-flex justify-content-center align-items-center">{stringAvatar(log?.customerInfo)}</div>

                                    )}
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    {log?.logBy === "0" ? (
                                      <h6 className="fs-14 mb-1"> {log?.userInfo?.name} </h6>
                                    ) : (
                                      <h6 className="fs-14 mb-1">
                                        {log?.customerInfo?.firstName}{" "}
                                        {log?.customerInfo?.middleName}{" "}
                                        {log?.customerInfo?.lastName}
                                      </h6>
                                    )}
                                    <small className="text-muted">
                                      {log?.description}
                                      <span className="five"></span>{" "}
                                      {formatDateLog(log?.createdDate)}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {log?.attachedDoc?.documentPath && (
                              <div style={{ position: "absolute", right: 20, cursor: "pointer", }} >
                                <FaDownload
                                  onClick={() => handleDownload( log?.attachedDoc?.documentPath, log?.documentName ) }
                                  download=""
                                />
                              </div>
                            )}
                          </div>
                        ))
                      
                    
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
