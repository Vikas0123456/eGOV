import React, { useEffect, useState } from "react";
import SimpleBar from "simplebar-react";
import Select from "react-select";
import Pagination from "../../../CustomComponents/Pagination";
import { Eye, RefreshCcw } from "feather-icons-react/build/IconComponents";
import DateRangePopup from "../../../common/Datepicker/DatePicker";
import CreateNewTicketModal from "../../../common/modals/CreateNewTicketModal/CreateNewTicketModal";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
const BlankData = process.env.REACT_APP_BLANK;
const TicketsTab = ({
  mainApplicationLoading,
  customerId,
  fetchSupportTicketsList,
  loading,
  setLoading,
  durationOfTickets,
  setDurationOfTickets,
  ticketSearchQuery,
  handleInputTicketSearch,
  ticketStartDate,
  ticketEndDate,
  onChangeHandlerTickets,
  selectedStatus,
  StatusFilterList,
  handleStatusFilter,
  resetTicketFilters,
  data,
  formatDate,
  handleTicketView,
  totalCountForTicket,
  perPageSizeForTicket,
  currentPageForTicket,
  totalPagesForTicket,
  handleSelectPageSizeForTicket,
  handlePageChangeForTicket,
}) => {
  const axiosInstance = useAxios()
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userDetails = userDecryptData?.data;
  const userId = userDetails?.id;

  const [openModel, setOpenModal] = useState(false);
  const [userData, setUserData] = useState([]);
  const [status, setStatus] = useState("All");
  const [ticketData, setTicketData] = useState([]);
  const [priority, setPriority] = useState("Select Priority");
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModel = () => {
    setOpenModal(false);
  };

  const fetchUserList = async () => {
    try {
      const response = await axiosInstance.post(
        `userService/user/getAlluser`,
        {}
      );
      if (response) {
        const { rows } = response?.data?.data;
        setUserData(rows);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  // const getTicketData = async (data) => {
  //   try {
  //     setLoading(true);
  //     const requestBody = data
  //       ? data
  //       : {
  //         priority:
  //           priority == "Select Priority" || priority == "All"
  //             ? null
  //             : priority,
  //         status: status == "All" ? null : status,
  //         userId: userId,
  //       };
  //     const response = await axiosInstance.post(
  //       `ticketService/ticket/view`,
  //       requestBody
  //     );
  //     if (response?.data) {
  //       const { rows, count } = response?.data?.data;
  //       setTicketData(rows);
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     console.error(error.message);
  //   }
  // };

  return (
    <div>
      <div className="col-12">
        <div className="row">
          <div className="col-lg-12">
            <div className="flex-shrink-0 card border-0 mb-0 ms-auto bg-transparent">
              <div className="card-header px-0 border-0 py-0 bg-transparent filter-header">
                <div className="row">
                  <div className="col-md-4 col-sm-4 mb-3 col-lg-4 col-xl-4 col-xxl-3">
                    <div className="app-search p-0">
                      <div className="position-relative shadow-sm">
                        <input type="text" className="form-control bg-white" placeholder="Search Ticket..." autoComplete="off" id="search-options" value={ticketSearchQuery} onChange={(e) => handleInputTicketSearch(e)} />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none" id="search-close-options" ></span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-4 mb-3 col-lg-4 col-xl-4 col-xxl-3">
                    <div className="inner-border-0">
                      <div className="dateinput flatpickr-bg-white">
                        <DateRangePopup dateStart={ticketStartDate} dateEnd={ticketEndDate} onChangeHandler={onChangeHandlerTickets} />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 col-sm-4 mb-3 col-lg-4 col-xl-4 col-xxl-3">
                    <div className="border-0-dropdown">
                      <div className="input-light " data-type="select-one">
                        <Select value={StatusFilterList.find((option) => option.value == selectedStatus) || null}
                          onChange={(option) => handleStatusFilter(option ? option.value : "")}
                          options={StatusFilterList}
                          placeholder="Select Ticket Status"
                          name="status"
                          styles={{
                            control: (provided) => ({ ...provided, cursor: "pointer", }),
                            menu: (provided) => ({ ...provided, cursor: "pointer", }),
                            option: (provided) => ({ ...provided, cursor: "pointer", }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 col-xl-12 col-sm-12 mb-3 col-lg-12 col-xxl-3 d-flex justify-contact-between">
                    <div className="me-3">
                      <div>
                        <button id="loadMore" className="w-100 btn btn-primary bg-light border-light text-muted d-flex align-items-center" onClick={resetTicketFilters} >
                          <RefreshCcw className="text-muted me-2" width="16" height="16" /> <span> Reset </span>
                        </button>
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary ms-auto" data-bs-toggle="modal" data-bs-target="#showModal" onClick={(e) => { setOpenModal(true); }} >
                      {" "} Create Ticket{" "}
                    </button>
                  </div>
                  <div className="col-xl-12 text-end col-xxl-3 d-flex mb-2 mb-lg-3 mb-xl-3 mb-xxl-2 ms-auto d-flex ">
                    <ul className="nav nav-tabs-custom rounded card-header-tabs border-bottom-0 align-items-center justify-contact-end d-flex flex-nowrap ms-auto mt-3 mb-1" role="tablist" >
                      <li className="nav-item" role="button">
                        <span className={durationOfTickets === "all" ? "nav-link fs-14 pt-0 bg-transparent active" : "nav-link fs-14 pt-0 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="true" onClick={() => setDurationOfTickets("all")} >
                          All
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfTickets === "today" ? "nav-link fs-14 pt-0 bg-transparent active" : "nav-link fs-14 pt-0 bg-transparent"} data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfTickets("today")} >
                          Today
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfTickets === "weekly" ? "nav-link fs-14 pt-0 bg-transparent active" : "nav-link fs-14 pt-0 bg-transparent"}
                          data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfTickets("weekly")} >
                          Weekly
                        </span>
                      </li>
                      <li className="nav-item" role="button">
                        <span className={durationOfTickets === "monthly" ? "nav-link fs-14 pt-0 bg-transparent active" : "nav-link fs-14 pt-0 bg-transparent"}
                          data-bs-toggle="tab" role="tab" aria-selected="false" onClick={() => setDurationOfTickets("monthly")} >
                          Monthly
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card border-0 mt-3">
                <div className="card-body p-0">
                  <div className="table-responsive" >
                    <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} >
                      <table className="table table-striped table-borderless mb-0">
                        <thead className="bg-white text-nowrap">
                          <tr>
                            <th className="fw-bold"> Tickets ID </th>
                            <th className="fw-bold"> Department Name </th>
                            <th className="fw-bold"> Service Name </th>
                            <th className="fw-bold"> Task </th>
                            <th className="fw-bold"> Create Date / Time </th>
                            <th className="fw-bold"> Status </th>
                            <th className="status text-center"> Actions </th>
                          </tr>
                        </thead>
                        <tbody>


                          {loading || mainApplicationLoading ? (
                            <tr>
                              <td colSpan="7" className="text-center">
                                <LoaderSpin />
                              </td>
                            </tr>
                          ) : data?.length === 0 && !loading ? (
                            <tr>
                              <td colSpan="7" className="text-center">
                                <NotFound heading="Tickets not found." message="Unfortunately, tickets not available at the moment." />
                              </td>
                            </tr>
                          ) : (
                            data.map((ticket, index) => (
                              <tr key={index}>
                                <td>
                                  <span className="fw-bold text-black" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Relation: Self" >
                                    {`#${ticket?.ticketId}` || BlankData}
                                  </span>
                                </td>
                                <td>
                                  {ticket?.departmentData?.departmentName || BlankData}
                                </td>
                                <td>
                                  {ticket?.serviceData?.serviceName || BlankData}
                                </td>
                                <td>
                                  <strong className="fw-bold">
                                    {ticket?.title || BlankData}
                                  </strong>
                                </td>
                                <td>
                                  {formatDate(ticket.createdDate) || BlankData}
                                </td>
                                <td>
                                  {ticket?.status ? (
                                    <>
                                    {ticket?.status ===
                                        "0" && (
                                        <div className="px-3 badge border border-warning text-warning bg-soft-warning fs-13 p-2 pe-none">
                                            <span className="">
                                                Pending
                                            </span>
                                        </div>
                                    )}{" "}
                                    {ticket?.status ===
                                        "1" && (
                                        <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                            <span className="">
                                               Inprogress
                                            </span>
                                        </div>
                                    )}{" "}
                                     {ticket?.status ===
                                        "2" && (
                                        <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                            <span className="">
                                            Escalated
                                            </span>
                                        </div>
                                    )}{" "}
                                    {ticket?.status ===
                                        "3" && (
                                        <div className="px-3 badge border border-success text-success bg-soft-success fs-13 p-2 pe-none">
                                            <span className="">
                                                Closed
                                            </span>
                                        </div>
                                    )}{" "}
                                   
                                    {ticket?.status ===
                                        "4" && (
                                            <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                            <span className="">
                                             Reopened
                                            </span>
                                        </div>
                                    )}{" "}
                                </>
                                  ) : (
                                    BlankData
                                  )}

                                </td>
                                <td className="text-center" title="View">
                                  <span onClick={(e) => handleTicketView(e, ticket)} className="py-2 px-2 fs-18 text-primary " role="button" >
                                    <Eye width="18" height="18" />
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}

                        </tbody>
                      </table>
                    </SimpleBar>
                    <Pagination
                      totalCount={totalCountForTicket}
                      perPageSize={perPageSizeForTicket}
                      currentPage={currentPageForTicket}
                      totalPages={totalPagesForTicket}
                      handleSelectPageSize={handleSelectPageSizeForTicket}
                      handlePageChange={handlePageChangeForTicket}
                    />
                    {openModel ? (
                      <CreateNewTicketModal
                        openModel={openModel}
                        handleCloseModel={handleCloseModel}
                        userData={userData}
                        getTicketData={fetchSupportTicketsList}
                        customerId={customerId}
                      />
                    ) : null}
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

export default TicketsTab;
