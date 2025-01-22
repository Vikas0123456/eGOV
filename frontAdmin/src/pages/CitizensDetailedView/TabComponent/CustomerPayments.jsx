import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  Table,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import useAxios from "../../../utils/hook/useAxios";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import { BiSortAlt2 } from "react-icons/bi";
import Select from "react-select";
import { RefreshCcw } from "feather-icons-react";
import SimpleBar from "simplebar-react";
import { toast } from "react-toastify";
import NotFound from "../../../common/NotFound/NotFound";
import DateRangePopupCustom from "../../../common/Datepicker/DateRangePopupCustom";
import Pagination from "../../../CustomComponents/Pagination";

const BlankData = process.env.REACT_APP_BLANK;

function formatDateString(isoDateString) {
  const isoString = String(isoDateString);
  const date = new Date(isoString);

  const optionsDate = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = date.toLocaleDateString("en-GB", optionsDate);
  const formattedTime = date.toLocaleTimeString("en-GB", optionsTime);
  const hasTime = isoString.includes(":");

  return hasTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}

const CustomerPayment = ({customerId}) => {
  const axiosInstance = useAxios();
  const [myPaymentList, setMyPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPageSize, setPerPageSize] = useState(5);
  const [sortBy, setSortBy] = useState();
  const [sortOrder, setSortOrder] = useState("DESC");
  const totalPages = Math.ceil(totalCount / perPageSize);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [filterPaymentActiveTab, setFilterPaymentActiveTab] = useState("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("");
  const [isDatePickerFocused, setIsDatePickerFocused] = useState(false);
  const [dateRange,setDateRange]=useState("")
  useEffect(() => {
    if (dateFilter === "custom") {
      setIsDatePickerFocused(true);
    }
  }, [dateFilter]);
  window.onscroll = function () {
    scrollFunction();
  };

  const scrollFunction = () => {
    const element = document.getElementById("back-to-top");
    if (element) {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  const toTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const handleSorting = (value) => {
    setSortBy(value);
    setSortOrder((prevSortOrder) =>
      prevSortOrder === "DESC" ? "ASC" : "DESC"
    );
  };

  const getTransactionDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `paymentService/customerDetails/gettransactionDetails`,
        {
          customerId: customerId,
          page: currentPage,
          limit: perPageSize,
          sortBy: sortBy,
          sortOrder: sortOrder,
          transactionStatus: transactionStatusFilter,
          searchQuery: searchQuery,
          startDate: selectedStartDate || undefined,
          endDate: selectedEndDate || undefined,
          dateRangeOption:dateFilter,
        }
      );
      if (response) {
        const { count, rows } = response?.data?.data;
        setTotalCount(count);
        setMyPaymentList(rows);
        setIsLoading(false);
        const recordsId = rows?.map((data) => data?.transaction?.id) || []
        if (recordsId && recordsId?.length !== 0) {
          try {
            const response = await axiosInstance.post(
              `paymentService/customerDetails/updateSeenStatus`,
              {
                customerId: customerId,
                recordIds: recordsId
              }
            );
            if (response) {

            }
          } catch (error) {
            console.error(error.message);
          }
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error.message);
    }
  };
  // transaction/seenStatusUpdate

  useEffect(() => {
    if (!searchQuery) {
      getTransactionDetails();
    }
  }, [
    perPageSize,
    currentPage,
    searchQuery,
    sortBy,
    sortOrder,
    transactionStatusFilter,
    selectedStartDate,
    selectedEndDate,
    searchQuery,
    filterPaymentActiveTab,
    dateRange
  ]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        getTransactionDetails();
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [
    perPageSize,
    currentPage,
    searchQuery,
    sortBy,
    sortOrder,
    transactionStatusFilter,
    selectedStartDate,
    selectedEndDate,
    searchQuery,
    filterPaymentActiveTab,
    dateRange
  ]);

  const handleInputSearchBox = (e) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
    setFilterPaymentActiveTab("all");
  };

  function onChangeHandlerPayment(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectedStartDate(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectedEndDate(formattedendDate);
    }
    setFilterPaymentActiveTab("all");
    setStartDate(value[0]);
    setEndDate(value[1]);
  }

  const resetFilterForPaymentInvoice = () => {
    setSearchQuery("");
    setTransactionStatusFilter("");
    setFilterPaymentActiveTab("all");
    setSelectedStartDate("");
    setSelectedEndDate("");
    setStartDate("");
    setEndDate("");
    setPerPageSize(5);
    setCurrentPage(1);
    setDateFilter("")
    setDateRange("")
  };
  const resetDateFilter = () => {
    setDateFilter("")
    setDateRange("")
    setSelectedStartDate("");
    setSelectedEndDate("");
    setStartDate("");
    setEndDate("");
  };
 const handleDateFilter=(value)=>{
  if(value !== "custom"){
    setDateRange(value)
    setSelectedStartDate("");
    setSelectedEndDate("");
    setStartDate("");
    setEndDate("");
  }
  setDateFilter(value)
 }
  const handleSelectPageSize = (e) => {
    setCurrentPage(1);
    setPerPageSize(parseInt(e.target.value));
  };
  const handlePageChange = (page) => {
    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }
    setCurrentPage(page);

    if (page === totalPages) {
      document.querySelector(".pagination-next").classList.add("disabled");
    } else {
      document.querySelector(".pagination-next").classList.remove("disabled");
    }

    if (page === 1) {
      document.querySelector(".pagination-prev").classList.add("disabled");
    } else {
      document.querySelector(".pagination-prev").classList.remove("disabled");
    }
  };

  const handleDownloadClick = (url) => {
    const filename = url.substring(url.lastIndexOf("/") + 1);
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error downloading image:", error));
  };

  function getMonthName(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[date.getMonth()];
  }

  function formatDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Format the date in the desired format (08 Mar, 2024)
    const formattedDate = `${("0" + date.getDate()).slice(-2)} ${getMonthName(
      date
    )}, ${date.getFullYear()}`;

    // Get the hours and minutes
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Add leading zero to minutes if needed
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedTime = `${hours}:${minutes} ${ampm}`

    return (
      <div>
        <span className="five">{formattedDate}</span>
        <small className="d-block fs-11">{formattedTime}</small>
      </div>
    );
  }

  const transactionOptions = [
    { value: "", label: "All" },
    { value: "0", label: "Txn: Pending" },
    { value: "1", label: "Txn: Success" },
    { value: "2", label: "Txn: Failed" },
    { value: "3", label: "Txn: Refund" },
  ];

  const filterOptions = [
    { value: "All", label: "All" },
    { value: "1w", label: "One Week" },
    { value: "1m", label: "One Month" },
    { value: "3m", label: "Three Month" },
    { value: "6m", label: "Six Month" },
    { value: "1y", label: "One Year" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div >
          <div className="row mt-5">
            <div className="col-lg-4 col-sm-6 col-md-4 col-xxl-2 col-xl-3">
              <div className="mb-3">
                <div className="search-box text-muted position-relative">
                  <input
                    type="text"
                    className="form-control bg-white"
                    placeholder="Search Payment History..."
                    autoComplete="off"
                    id="search-options"
                    value={searchQuery}
                    onChange={(e) => handleInputSearchBox(e)}
                  />
                  <i className="ri-search-line search-icon"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6 col-md-4 col-xxl-2 col-xl-3">
              {dateFilter !== "custom" &&
                <Select
                  options={filterOptions}
                  className="input-light mb-3"
                  placeholder="Select Date Range"
                  value={
                    filterOptions.find(
                      (option) => option.value === dateFilter
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    handleDateFilter(
                      selectedOption ? selectedOption.value : ""
                    );
                  }}
                  styles={{
                    control: (provided) => ({ ...provided, cursor: "pointer" }),
                    menu: (provided) => ({ ...provided, cursor: "pointer" }),
                    option: (provided) => ({ ...provided, cursor: "pointer" }),
                  }}
                />}
              {dateFilter === "custom" && (
                <div className="d-flex">
                <DateRangePopupCustom
                  dateStart={startDate}
                  dateEnd={endDate}
                  onChangeHandler={onChangeHandlerPayment}
                  className="form-control"
                  placeholderText="Select a custom date"
                  autoFocus={isDatePickerFocused}
                />
                 <button type="button" className="btn btn-primary d-flex btn-icon align-items-center ms-2 px-3" onClick={resetDateFilter} >
                 <i className="mdi  mdi-update fs-20"></i>
              </button>
              </div>
              )}
            </div>
            <div className="col-lg-4 col-sm-6 col-md-4 col-xxl-2 col-xl-3">
              <Select
                options={transactionOptions}
                className="input-light mb-3"
                value={
                  transactionOptions.find(
                    (option) => option.value === transactionStatusFilter
                  ) || null
                }
                onChange={(selectedOption) => {
                  setTransactionStatusFilter(
                    selectedOption ? selectedOption.value : ""
                  );
                }}
                styles={{
                  control: (provided) => ({ ...provided, cursor: "pointer" }),
                  menu: (provided) => ({ ...provided, cursor: "pointer" }),
                  option: (provided) => ({ ...provided, cursor: "pointer" }),
                }}
              />
            </div>
            <div className="col-lg-4 col-sm-6 col-md-4 col-xxl-2 col-xl-3 text-end text-lg-start">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center mb-3"
                onClick={resetFilterForPaymentInvoice}
              >
                <RefreshCcw
                  className=" me-2"
                  width="16"
                  height="16"
                />
                Reset
              </button>
            </div>
          </div>
          <div className="row">
            <Col className="col-12 col-xl-12">
              <Row>
                <Col>
                  <Card className="border-0 p-0 p-xl-2 rounded">
                    <CardBody className="pt-0">
                      <div className="table-responsive">
                        <SimpleBar
                          style={{
                            maxHeight: "calc(100vh - 50px)",
                            overflowX: "auto",
                          }}
                        >
                          <Table className="table table-striped table-borderless mb-0">
                            <thead className="bg-white">
                              <tr>
                                <th className="fw-bold">Application ID</th>
                                <th className="fw-bold">Transaction ID</th>
                                <th
                                  className="fw-bold cursor-pointer"
                                  onClick={() => handleSorting("createdDate")}
                                >
                                  {" "}
                                  Date{" "}
                                  <span>
                                    {" "}
                                    <BiSortAlt2 />{" "}
                                  </span>{" "}
                                </th>
                                <th className="fw-bold">Application Name</th>
                                <th className="fw-bold">Department</th>
                                <th className="fw-bold">Transction Status</th>
                                <th className="fw-bold">Transction Amount</th>
                                <th className="fw-bold"></th>
                              </tr>
                            </thead>

                            <tbody>
                              {isLoading ? (
                                <tr className="">
                                  <td
                                    className="text-center bg-white"
                                    colSpan={8}
                                  >
                                    <LoaderSpin height={"300px"} />
                                  </td>
                                </tr>
                              ) : myPaymentList.length === 0 ? (
                                <tr className="">
                                  <td
                                    className="text-center bg-white"
                                    colSpan={8}
                                  >
                                    <NotFound
                                      heading="Payment History not found."
                                      message="Unfortunately, Payment History not available at the moment."
                                    />
                                  </td>
                                </tr>
                              ) :
                                myPaymentList.map((data, index) => (
                                  <tr key={index}>
                                    <td>
                                      {data?.transaction?.seenStatus === "0" && <span className="notification-dot-success me-2"></span>}
                                      <span className="fw-bold text-black">
                                        {data?.transaction?.applicationId ||
                                          BlankData}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="fw-bold text-black">
                                        {data?.transaction?.transactionId ||
                                          BlankData}
                                      </span>
                                    </td>
                                    <td>
                                      {formatDate(
                                        data?.transaction?.createdDate
                                      ) || BlankData}
                                    </td>
                                    <td>
                                      <strong className="fw-bold">
                                        {data?.findServicesBySlug
                                          ?.serviceName || BlankData}
                                      </strong>
                                    </td>
                                    <td>
                                      {" "}
                                      {data?.findDepartmentName
                                        ?.departmentName || BlankData}
                                    </td>

                                    <td>
                                      {data?.transaction
                                        ?.transactionStatus ? (
                                        <>
                                          {data?.transaction
                                            ?.transactionStatus === "0" && (
                                              <div className="px-3 badge border border-warning text-warning bg-soft-warning p-2 pe-none">
                                                <span className="fs-13">
                                                  Pending
                                                </span>
                                              </div>
                                            )}
                                          {data?.transaction
                                            ?.transactionStatus === "1" && (
                                              <div className="px-3 badge border border-success text-success bg-soft-success p-2 pe-none">
                                                <span className="fs-13">
                                                  Success
                                                </span>
                                              </div>
                                            )}
                                          {data?.transaction
                                            ?.transactionStatus === "2" && (
                                              <div className="px-3 badge border border-danger text-danger bg-soft-danger p-2 pe-none">
                                                <span className="fs-13">
                                                  Failed
                                                </span>
                                              </div>
                                            )}
                                          {data?.transaction
                                            ?.transactionStatus === "3" && (
                                              <div className="px-3 badge border border-primary text-primary bg-soft-primary p-2 pe-none">
                                                <span className="fs-13">
                                                  Refund
                                                </span>
                                              </div>
                                            )}
                                        </>
                                      ) : (
                                        BlankData
                                      )}
                                    </td>
                                    <td>
                                      <strong className="fs-16">
                                        $
                                        {data?.transaction
                                          ?.transactionAmount || BlankData}
                                      </strong>
                                    </td>
                                    <td>
                                      {data?.transaction
                                        ?.transactionStatus === "1" ? (
                                        <span
                                          role="button"
                                          className="d-flex align-items-center "
                                          onClick={() => {
                                            if (data?.documentPath) {
                                              handleDownloadClick(
                                                data?.documentPath
                                              );
                                            }
                                          }}
                                        >
                                          <i className="las la-download fs-22 me-2"></i>
                                          Download Receipt
                                        </span>
                                      ) : (
                                        BlankData
                                      )}
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </Table>
                        </SimpleBar>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
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
  );
};

export default CustomerPayment;
