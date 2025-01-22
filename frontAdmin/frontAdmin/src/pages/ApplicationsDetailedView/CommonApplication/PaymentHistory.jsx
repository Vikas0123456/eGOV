import { RefreshCcw } from "feather-icons-react/build/IconComponents";
import { Badge } from "reactstrap";
import SimpleBar from "simplebar-react";
import Pagination from "../../../CustomComponents/Pagination";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import Select from "react-select";
import { LoaderSpin } from "../../../common/Loader/Loader";
import NotFound from "../../../common/NotFound/NotFound";
const BlankData = process.env.REACT_APP_BLANK;
const PaymentHistoryTab = ({
  mainApplicationLoading,
  isPaymentHistoryLoading,
  searchQuery,
  handleInputSearchBox,
  startDate,
  endDate,
  onChangeHandlerPayment,
  transactionOptions,
  transactionStatusFilter,
  setTransactionStatusFilter,
  resetFilterForPaymentInvoice,
  durationOfPayment,
  setDurationOfPayment,
  customerTransactionList,
  formatDate,
  handleDownloadDownloadPDF,
  totalCount,
  perPageSize,
  currentPage,
  totalPages,
  handleSelectPageSize,
  handlePageChange,
}) => {
  return (
    <div>
      <div className="col-12">
        <div className="row">
          <div className="col-lg-12">
            <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
              <div className="card-header px-0 border-0 py-0 bg-transparent filter-header">
                <div className="row">
                  <div className="col-xl-12 col-xxl-9">
                    <div className="row">
                      <div className="col-md-3 col-sm-4 mb-3">
                        <div className="app-search p-0">
                          <div className="position-relative shadow-sm">
                            <input type="text" className="form-control bg-white" placeholder="Search Payment History..." autoComplete="off" id="search-options" defaultValue="" value={searchQuery} onChange={(e) => handleInputSearchBox(e)} />
                            <span className="mdi mdi-magnify search-widget-icon"></span>
                            <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options" ></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-4 mb-3">
                        <div className=" inner-border-0">
                          <div className="dateinput flatpickr-bg-white">
                            <DateRangePopup dateStart={startDate} dateEnd={endDate} onChangeHandler={onChangeHandlerPayment} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-4 mb-3">
                        <div className="border-0-dropdown">
                          <Select options={transactionOptions}
                            value={transactionOptions.find((option) => option.value === transactionStatusFilter) || null}
                            styles={{
                              control: (provided) => ({ ...provided, cursor: "pointer", }),
                              menu: (provided) => ({ ...provided, cursor: "pointer", }),
                              option: (provided) => ({ ...provided, cursor: "pointer", }),
                            }}
                            onChange={(selectedOption) => { setTransactionStatusFilter(selectedOption ? selectedOption.value : ""); }}
                          />
                        </div>
                      </div>
                      <div className="col-md-3 col-sm-4 mb-3">
                        <div className="">
                          <button type="button" className="btn btn-primary bg-light border-light text-muted d-flex align-items-center" onClick={resetFilterForPaymentInvoice} >
                            <RefreshCcw className="text-muted me-2" width="16" height="16" /> <span>Reset</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-12 text-end col-xxl-3 d-flex mb-0 mb-lg-3 mb-xl-3 mb-xxl-0">
                    <ul className="nav nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center ms-auto flex-nowrap" role="tablist" >
                      <li className="nav-item" role="button">
                        <span className={durationOfPayment === "all" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="true" onClick={() => setDurationOfPayment("all")} >
                          All
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfPayment === "today" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfPayment("today")} >
                          Today
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfPayment === "weekly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                          data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfPayment("weekly")} >
                          Weekly
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfPayment === "monthly" ? "nav-link fs-14 bg-transparent active" : "nav-link fs-14 bg-transparent"}
                          data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfPayment("monthly")} >
                          Monthly
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card border-0 mt-3 ">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} >
                      <table className="table table-striped table-borderless mb-0">
                        <thead className="bg-white text-nowrap">
                          <tr>
                            <th className="fw-bold">Application Id</th>
                            <th className="fw-bold">Transaction Number</th>
                            <th className="fw-bold">Transaction Date</th>
                            <th className="fw-bold">Services</th>
                            <th className="fw-bold">Department</th>
                            <th className="fw-bold">Transaction Status</th>
                            <th className="fw-bold">Paid Amount</th>
                            <th className="fw-bold">Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isPaymentHistoryLoading || mainApplicationLoading ? (
                            <>
                              <tr>

                                <td colSpan="8">
                                  <LoaderSpin/>
                                </td>
                              </tr>
                            </>
                          ): customerTransactionList?.length===0 && !isPaymentHistoryLoading ? (
                            <tr>
                            <td colSpan="8" className="text-center" >
                              <NotFound heading="Payment History not found." message="Unfortunately, payment history not available at the moment." />
                            </td>
                          </tr>
                          ):(
                            customerTransactionList.map((transac, index) => (
                              <tr key={index}>
                                <td>{transac?.transaction?.applicationId || BlankData}</td>
                                <td>{transac?.transaction?.transactionId || BlankData}</td>
                                <td>
                                  <span className="four">
                                    {formatDate( transac?.transaction?.createdDate || BlankData )}
                                  </span>
                                </td>
                                <td>
                                  {transac?.findServicesBySlug?.serviceName || BlankData}
                                </td>
                                <td>
                                  {transac?.findDepartmentName?.departmentName || BlankData}
                                </td>
                                <td className="tr-status">
                                  <div className="d-block text-body p-1 px-2">
                                  {transac?.transaction?.transactionStatus ? (
                                    <>
                                     {transac?.transaction?.transactionStatus === "0" && (
                                      <Badge className="px-3 fs-13 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                        {" "} Txn: Pending{" "}
                                      </Badge>
                                    )}
                                    {transac?.transaction?.transactionStatus === "1" && (
                                      <Badge className="px-3 fs-13 badge border border-success text-success bg-soft-success p-2 pe-none">
                                        {" "} Txn: Success{" "}
                                      </Badge>
                                    )}
                                    {transac?.transaction?.transactionStatus === "2" && (
                                      <Badge className="px-3 fs-13 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                        {" "} Txn: Failed{" "}
                                      </Badge>
                                    )}
                                    {transac?.transaction?.transactionStatus === "3" && (
                                      <Badge className="px-3 fs-13 badge border border-info text-info bg-soft-info p-2 pe-none">
                                        {" "} Txn: Refund{" "}
                                      </Badge>
                                    )}
                                    </>
                                  ):(
                                    <div>
                                    BlankData
                                    </div>
                                  )}
                                   
                                  </div>
                                </td>
                                <td>
                                  ${transac?.transaction?.transactionAmount || BlankData}
                                </td>
                                <td className="text-center">
                                  {transac?.transaction?.transactionStatus === "1" ? (
                                    <span className="btn btn-icon text-primary btn-sm fs-18" title="Download"
                                      onClick={() => { if (transac?.documentPath) { handleDownloadDownloadPDF(transac.documentPath); } }}
                                    >
                                      <i className="ri-download-2-line" />
                                    </span>
                                  ) : BlankData}
                                </td>
                              </tr>
                            ))
                          )}
                          
                        </tbody>
                      </table>
                    </SimpleBar>
                  </div>
                  <Pagination
                    totalCount={totalCount}
                    perPageSize={perPageSize}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handleSelectPageSize={handleSelectPageSize}
                    handlePageChange={handlePageChange}
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

export default PaymentHistoryTab;
