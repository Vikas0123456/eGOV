import { Eye, RefreshCcw } from "feather-icons-react/build/IconComponents";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import SimpleBar from "simplebar-react";
import Pagination from "../../../CustomComponents/Pagination";
import { LoaderSpin } from "../../../common/Loader/Loader";
import NotFound from "../../../common/NotFound/NotFound";
const BlankData = process.env.REACT_APP_BLANK;
const AllApplicationTab = ({
  mainApplicationLoading,
  loading,
  searchQueryForApplication,
  handleInputSearch,
  applicationStartDate,
  applicationEndDate,
  onChangeHandlerApplications,
  resetApplicationFilters,
  applicationList,
  formatDate,
  calculateRemainingTimeTAT,
  handleApplicationDetailedView,
  totalCountForApplication,
  perPageSizeForApplication,
  currentPageForApplication,
  totalPagesForApplication,
  handleSelectPageSizeForApplication,
  handlePageChangeForApplication,
  durationOfApplication,
  setDurationOfApplication
}) => {
  return (
    <div className="col-12">
      <div className="row">
        <div className="col-lg-12">
          <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
            <div className="card-header px-0 border-0 py-0 bg-transparent filter-header">
              <div className="row">
                <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                  <div className="app-search p-0">
                    <div className="position-relative shadow-sm">
                      <input
                        type="text"
                        className="form-control bg-white"
                        placeholder="Search Application..."
                        autoComplete="off"
                        id="search-options"
                        value={searchQueryForApplication}
                        onChange={(e) => handleInputSearch(e)}
                      />
                      <span className="mdi mdi-magnify search-widget-icon"></span>
                      <span
                        className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                        id="search-close-options"
                      ></span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                  <div className="  inner-border-0">
                    <div className="dateinput flatpickr-bg-white">
                      <DateRangePopup
                        dateStart={applicationStartDate}
                        dateEnd={applicationEndDate}
                        onChangeHandler={onChangeHandlerApplications}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-4 col-lg-3 mb-3">
                  <button
                    type="button"
                    className="btn btn-primary bg-light border-light text-muted d-flex align-items-center"
                    onClick={resetApplicationFilters}
                  >
                    <RefreshCcw
                      className="text-muted me-2"
                      width="16"
                      height="16"
                    />
                    <span> Reset </span>
                  </button>
                </div>
                <div className="col-xl-12 text-end col-xxl-3 d-flex mb-0 mb-lg-3 mb-xl-3 mb-xxl-0">
                  <ul className="nav nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center ms-auto flex-nowrap" role="tablist" >
                    <li className="nav-item" role="button">
                      <span className={durationOfApplication === "all" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="true" onClick={() => setDurationOfApplication("all")} >
                        All
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfApplication === "today" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfApplication("today")} >
                        Today
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfApplication === "weekly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfApplication("weekly")} >
                        Weekly
                      </span>
                    </li>
                    <li className="nav-item" role="button">
                      <span className={durationOfApplication === "monthly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                        data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfApplication("monthly")} >
                        Monthly
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card border-0 mt-3">
              <div className="card-body p-0">
                <div className="table-responsive" style={{ minHeight: "350px", }} >
                  <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} >
                    <table className="table table-striped table-borderless mb-0">
                      <thead className="bg-white text-nowrap">
                        <tr>
                          <th className="fw-bold"> Application ID </th>
                          <th className="fw-bold"> Date / Time </th>
                          <th className="fw-bold"> Services Name </th>
                          <th className="fw-bold"> Applicant Name </th>
                          <th className="fw-bold"> Department Name </th>
                          <th className="fw-bold"> TAT </th>
                          <th className="fw-bold"> Transction Status </th>
                          <th className="fw-bold"> Status </th>
                          <th className="status text-center"> Actions </th>
                        </tr>
                      </thead>

                      <tbody>

                        {loading || mainApplicationLoading ? (
                          <tr>
                            <td colSpan="9">
                              <LoaderSpin />
                            </td>
                          </tr>
                        ) : applicationList?.length === 0 && !loading ? (
                          <tr>
                            <td colSpan="9" className="text-center">
                              <NotFound heading="Applications not found." message="Unfortunately, applications not available at the moment." />
                            </td>
                          </tr>
                        ) : (
                          applicationList.map((data, index) => (
                            <tr key={index}>
                              <td>
                                <span className="fw-bold text-black" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Relation: Self" >
                                  {data?.applicationId || BlankData}
                                </span>
                              </td>
                              <td>{formatDate(data.createdDate) || BlankData}</td>
                              <td>
                                <strong className="fw-bold">
                                  {data?.serviceName?.serviceName || BlankData}
                                </strong>
                              </td>
                              <td>{data?.customerInfo?.firstName || BlankData + " " + data?.customerInfo?.lastName || BlankData}</td>
                              <td>{data?.serviceName?.departmentName || BlankData}</td>
                              <td>
                                {data?.turnAroundTime ? (
                                  <>
                                    {" "}
                                    {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service") === "Completed" ? (
                                      <div className="badge bg-success d-inline-flex align-items-center">
                                        <i className="mdi mdi-clock-edit-outline fs-14"></i>
                                        <div className="mb-0 ms-1 fs-13" id="demo1">
                                          {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                        </div>
                                      </div>
                                    ) : calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service") === "Overdue" ? (
                                      <div className="badge bg-danger d-inline-flex align-items-center">
                                        <i className="mdi mdi-clock-alert fs-14"></i>
                                        <span className="mb-0 ms-1 fs-13">
                                          {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="badge bg-warning d-inline-flex align-items-center">
                                        <i className="mdi mdi-clock-outline fs-14"></i>
                                        <span className="mb-0 ms-1 fs-13">
                                          {calculateRemainingTimeTAT(data?.turnAroundTime, data?.status, "service")}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  BlankData
                                )}
                              </td>
                              <td>
                                {data?.transactionStatus ? (<>
                                  {data?.transactionStatus === "0" && (
                                    <div className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                      {" "} <span> Pending </span>{" "}
                                    </div>
                                  )}
                                  {data?.transactionStatus === "1" && (
                                    <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                      {" "} <span> Success </span>{" "}
                                    </div>
                                  )}
                                  {data?.transactionStatus === "2" && (
                                    <div className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                      {" "} <span> Failed </span>{" "}
                                    </div>
                                  )}
                                  {data?.transactionStatus === "3" && (
                                    <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                      {" "} <span> Refund </span>{" "}
                                    </div>
                                  )}
                                </>) : (
                                  BlankData
                                )}

                              </td>
                              <td>
                                {data?.status ? (
                                    <>
                                    {data?.status ===
                                      "0" && (
                                        <div className="px-3 fs-13 badge border border-primary text-primary bg-soft-primary p-2 pe-none">
                                          <span>
                                            {" "}
                                            Incomplete{" "}
                                          </span>
                                        </div>
                                      )}
                                    {data?.status ===
                                      "1" && (
                                        <div className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                          <span>
                                            {" "}
                                            Pending{" "}
                                          </span>
                                        </div>
                                      )}{" "}
                                    {data?.status ===
                                      "2" && (
                                        <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                          <span className="">
                                            {" "}
                                            Inprogress{" "}
                                          </span>
                                        </div>
                                      )}{" "}
                                    {data?.status ===
                                      "3" && (
                                        <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                          <span>
                                            {" "}
                                            Checked
                                            &
                                            Verified{" "}
                                          </span>
                                        </div>
                                      )}{" "}
        
                                    {data?.status ===
                                      "4" && (
                                        <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                          <span className="">
                                            {" "}
                                            Auto Pay{" "}
                                          </span>
                                        </div>
                                      )}{" "}
                                    {data?.status ===
                                      "5" && (
                                        <div className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                          <span className="">
                                            {" "}
                                            Approved{" "}
                                          </span>
                                        </div>
                                      )}{" "}
                                    {data?.status ===
                                      "6" && (
                                        <div className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                          <span className="">
                                            {" "}
                                            Rejected{" "}
                                          </span>
                                        </div>
                                      )}
                                    {data?.status ===
                                      "7" && (
                                        <div className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                          <span className="">
                                            {" "}
                                            Shipped{" "}
                                          </span>
                                        </div>
                                      )}{" "}
                                  </>
                                ) : (BlankData)}

                              </td>
                              <td>
                                <div className="d-flex align-items-center justify-content-center">
                                  <span role="button" onClick={() => handleApplicationDetailedView(data)}
                                    className="py-2 px-2 pt-1 me-2 text-primary fs-18" title="View" >
                                    {/* <i className="ri-eye-line"></i> */}
                                    <Eye width="18" height="18" />
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}

                      </tbody>
                    </table>
                  </SimpleBar>
                  <Pagination
                    totalCount={totalCountForApplication}
                    perPageSize={perPageSizeForApplication}
                    currentPage={currentPageForApplication}
                    totalPages={totalPagesForApplication}
                    handleSelectPageSize={handleSelectPageSizeForApplication}
                    handlePageChange={handlePageChangeForApplication}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllApplicationTab;
