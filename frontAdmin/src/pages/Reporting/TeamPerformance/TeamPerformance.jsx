import React from "react";
import { useEffect, useState } from "react";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import ScrollToTop from "../../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import { toast } from "react-toastify";
import DataExportDateRangePopup from "../../../common/Datepicker/DataExportDatePicker";
import classnames from "classnames";
import { Collapse } from "reactstrap";
import NotFound from "../../../common/NotFound/NotFound";
import useAxios from "../../../utils/hook/useAxios";
const BlankData = process.env.REACT_APP_BLANK;
function calculatePercentage(totalCompletedTime, totalTATDays) {
  if (totalCompletedTime > 0 && totalTATDays > 0) {
    let percentage = (totalCompletedTime / totalTATDays) * 100;
    return parseFloat(percentage.toFixed(2));
  }
  return 0;
}
const TeamPerformance = () => {
  const axiosInstance = useAxios()

  const [searchQuery, setSearchQuery] = useState("");
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [teamReportlist, setTeamReportList] = useState([]);
  const [dateRangeOption, setSelectedDateRangeOption] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  const [selectStartDateForExcel, setSelectStartDateForExcel] = useState("");
  const [selectEndDateForExcel, setSelectEndDateForExcel] = useState("");
  const [dateStartForExcel, setDateStartForExcel] = useState("");
  const [dateEndForExcel, setDateEndForExcel] = useState("");

  const [selectStartDateForPDF, setSelectStartDateForPDF] = useState("");
  const [selectEndDateForPDF, setSelectEndDateForPDF] = useState("");
  const [dateStartForPDF, setDateStartForPDF] = useState("");
  const [dateEndForPDF, setDateEndForPDF] = useState("");
  const [exportLoader, setExportLoader] = useState({
    excel: false,
    pdf: false,
  });

  const [isDateRangePopupVisibleForExcel, setIsDateRangePopupVisibleForExcel] =
    useState(false);
  const [isDateRangePopupVisibleForPDF, setIsDateRangePopupVisibleForPDF] =
    useState(false);

  function formatDateString(inputDateString) {
    const dateObject = new Date(inputDateString);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const listOfDepartments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `serviceManagement/department/view`,
        {}
      );
      if (response?.data) {
        const { rows } = response?.data?.data;
        setDepartmentList(rows);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("No results found for the given search query.");
    }
  };

  function onChangeHandlerForExcel(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectStartDateForExcel(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectEndDateForExcel(formattedendDate);
    }
    setDateStartForExcel(value[0]);
    setDateEndForExcel(value[1]);

    setIsDateRangePopupVisibleForExcel(false);
  }

  function onChangeHandlerForPDF(value) {
    const inputstartDateString = value[0];
    const inputEndDateString = value[1];

    const formattedstartDate = formatDateString(inputstartDateString);
    const formattedendDate = formatDateString(inputEndDateString);

    if (formattedstartDate) {
      setSelectStartDateForPDF(formattedstartDate);
    }
    if (formattedendDate >= formattedstartDate) {
      setSelectEndDateForPDF(formattedendDate);
    }
    setDateStartForPDF(value[0]);
    setDateEndForPDF(value[1]);

    setIsDateRangePopupVisibleForPDF(false);
  }

  const handleExportButtonClickForExcel = () => {
    setIsDateRangePopupVisibleForExcel(!isDateRangePopupVisibleForExcel);
    setIsDateRangePopupVisibleForPDF(false);
  };

  const handleExportButtonClickForPDF = () => {
    setIsDateRangePopupVisibleForPDF(!isDateRangePopupVisibleForPDF);
    setIsDateRangePopupVisibleForExcel(false);
  };

  useEffect(() => {
    if (selectEndDateForExcel) {
      excelReportExport();
    }
  }, [selectStartDateForExcel, selectEndDateForExcel]);

  useEffect(() => {
    if (selectEndDateForPDF) {
      pdfReportExport();
    }
  }, [selectStartDateForPDF, selectEndDateForPDF]);

  const excelReportExport = async () => {
    setExportLoader({ excel: true, pdf: false });
    const timestamp = new Date().getTime();
    const fileName = `team_perfomance_report_${timestamp}.xlsx`;

    try {
      const response = await axiosInstance.post(
        `departmentReport/deptperformance/export`,
        {
          departmentId:
            userData?.isCoreTeam === "0"
              ? (userData?.departmentId || "").split(',').map(id => id.trim())
              : selectedDepartment,
          dateRange: {
            startDate: selectStartDateForExcel,
            endDate: selectEndDateForExcel,
          },
          fileName: fileName,
        }
      );

      if (response.data.data.result.message === "No data found to export.") {
        toast.info("No data found to export.");
        setExportLoader({ excel: false, pdf: false });
        return;
      }

      fetch(`${response?.data?.data?.result}`)
        .then((response) => response.blob())
        .then(async (blob) => {
          const fileURL = window.URL.createObjectURL(new Blob([blob]));

          const a = document.createElement("a");
          a.href = fileURL;
          a.download = `${fileName}`;

          a.click();

          window.URL.revokeObjectURL(fileURL);

          const result = await axiosInstance.post(
            `departmentReport/deptperformance/removeExcel`,
            {
              fileName: fileName,
            }
          );

          setSelectStartDateForExcel("");
          setSelectEndDateForExcel("");
          setDateStartForExcel("");
          setDateEndForExcel("");

          if (result.data) {
            // console.log("sddssd", result.data);
          }

          setExportLoader({ excel: false, pdf: false });
        })
        .catch((error) => {
          console.error("Error downloading Excel:", error);
        });
    } catch (error) {
      console.error(error.message);
      setExportLoader({ excel: false, pdf: false });
    }
  };

  const pdfReportExport = async () => {
    setExportLoader({ excel: false, pdf: true });
    const timestamp = new Date().getTime();
    const fileName = `team_perfomance_report_${timestamp}.pdf`;

    try {
      const response = await axiosInstance.post(
        `departmentReport/deptperformance/generatePdf`,
        {
          departmentId:
            userData?.isCoreTeam === "0"
              ? (userData?.departmentId || "").split(',').map(id => id.trim())
              : selectedDepartment,
          dateRange: {
            startDate: selectStartDateForPDF,
            endDate: selectEndDateForPDF,
          },
          fileName: fileName,
        }
      );

      if (response.data.data.result.message === "No data found to export.") {
        toast.info("No data found to export.");
        setExportLoader({ excel: false, pdf: false });
        return;
      }

      fetch(`${response?.data?.data?.result}`)
        .then((response) => response.blob())
        .then((blob) => {
          const fileURL = window.URL.createObjectURL(new Blob([blob]));
          const a = document.createElement("a");
          a.href = fileURL;
          a.download = `${fileName}`;
          a.click();
          window.URL.revokeObjectURL(fileURL);

          const result = axiosInstance.post(
            `departmentReport/deptperformance/removePdf`,
            {
              fileName: fileName,
            }
          );

          setSelectStartDateForPDF("");
          setSelectEndDateForPDF("");
          setDateStartForPDF("");
          setDateEndForPDF("");
          
          if (result.data) {
          }
        })
        .catch((error) => {
          console.error("Error downloading PDF:", error);
        });
      setExportLoader({ excel: false, pdf: false });
    } catch (error) {
      console.error(error.message);
      setExportLoader({ excel: false, pdf: false });
    }
  };

  const getTeamentReport = async (values) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `departmentReport/teamperformance/list`,
        {
          departmentId:
            userData?.isCoreTeam === "0"
              ? (userData?.departmentId || "").split(',').map(id => id.trim())
              : selectedDepartment,
          dateRangeOption: dateRangeOption,
        }
      );
      if (response?.data) {
        const { data } = response?.data;
        setTeamReportList(data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Something went wrong while add new banner");
    }
  };

  const listOfSearch = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `departmentReport/teamperformance/list`,
        {
          departmentId: selectedDepartment,
          dateRangeOption: dateRangeOption,
          searchQuery: searchQuery,
        }
      );

      if (response?.data) {
        const { data } = response?.data;
        setTeamReportList(data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    listOfDepartments();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        listOfSearch();
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, dateRangeOption, selectedDepartment]);

  useEffect(() => {
    if (!searchQuery) {
      getTeamentReport();
    }
  }, [searchQuery, dateRangeOption, selectedDepartment]);

  const handleDepartmentSearch = (e) => {
    if (e) {
      setSelectedDepartment(e);
    }else{
      setSelectedDepartment("")
    }
  };

  const handleInputSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleChange = (event) => {
    setSelectedDateRangeOption(event);
    // setSelectedDateRangeOption(event.target.value);
  };

  const resetFilters = async () => {
    setSelectedDateRangeOption("");
    setSelectedDepartment("");
    setSearchQuery("");
  };
  const calculateAverageTimePerRequest = (
    RequestCompleted,
    completedHours
) => {
    const totalMinutes = parseInt(completedHours, 10);

    // Check if RequestCompleted is not zero to avoid division by zero
    if (RequestCompleted > 0) {
        const averageTimeInMinutes = totalMinutes / RequestCompleted;

        // Calculate days, hours, and minutes from the total minutes
        const days = Math.floor(averageTimeInMinutes / (60 * 24)); // 1 day = 24 hours
        const hours = Math.floor((averageTimeInMinutes % (60 * 24)) / 60); // remaining hours
        const minutes = Math.floor(averageTimeInMinutes % 60); // remaining minutes

        // Build the result string based on the calculated values
        let result = "";

        // Show only days if more than 24 hours
        if (days > 0) {
            result += `${days} day${days > 1 ? "s" : ""}`;
        } else {
            // Show hours and minutes when it's less than 24 hours
            if (hours > 0) {
                result += `${hours} hour${hours > 1 ? "s" : ""} `;
            }
            if (minutes > 0) {
                result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
            }
        }

        if (result.trim() === "") {
            return "_"; // Return '_' if no time was calculated
        }

        return result.trim(); // Remove any trailing spaces
    }

    return "_"; // Return '_' if no requests were completed
};

  const departmentOptions = departmentList.length > 0 && 
        [{ value: "", label: "Select Department*" }, 
            ...departmentList.map((deparment) => ({
            value: deparment.id,
            label: deparment.departmentName,
        }))]

        const dateRangeOptions = [
          { label: "All", value: "All" },
          { label: "One Week", value: "1w" },
          { label: "One Month", value: "1m" },
          { label: "Three Months", value: "3m" },
          { label: "Six Months", value: "6m" },
          { label: "One Year", value: "1y" },
      ];

  document.title = "Team Performance | eGov Solution";
  return (
    <>
      <div id="layout-wrapper">
        <div className="main-content">
          <div className="page-content">
            <div className="container-fluid">
              <div className="row">
                <DepartmentUserInfo />
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0">Team Performance</h4>
                    <div className="page-title-right">
                      <div className="mb-0 me-2 fs-15 text-muted current-date"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xxl-12 ">
                  <div className="card border-0">
                    <div className="card-body border-0">
                      <div className="row">
                        <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
                          <div className="search-box">
                            <input
                              type="text"
                              className="form-control search bg-light border-light"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={(e) => handleInputSearch(e)}
                            />
                            <i className="ri-search-line search-icon"></i>
                          </div>
                        </div>
                        <div className="col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xxl-2 mb-3 mb-xl-0">
                          <div className="input-light">
                            <Select
                              className="bg-choice basic-single"
                              classNamePrefix="select"
                              value={ dateRangeOption ?
                                dateRangeOptions.find(
                                  (option) => option.value === dateRangeOption
                                ) : null
                              }
                              onChange={(selectedOption) =>
                                handleChange(
                                  selectedOption ? selectedOption.value : ""
                                )
                              }
                              options={dateRangeOptions}
                              aria-label="Select Duration"
                              placeholder="Select Duration*"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  cursor: "pointer",
                                }),
                                menu: (provided) => ({
                                  ...provided,
                                  cursor: "pointer",
                                }),
                                option: (provided) => ({
                                  ...provided,
                                  cursor: "pointer",
                                }),
                              }}
                            />
                          </div>
                        </div>
                        {userData?.isCoreTeam === "1" && (
                          <div className="col-xl-3 col-lg-4 col-md-4 col-sm-12 col-xxl-2 mb-3 mb-xl-0">
                            <div className=" input-light">
                              <Select
                                className="bg-choice basic-single"
                                classNamePrefix="select"
                                value={ selectedDepartment ?
                                  departmentOptions.find(
                                    (option) =>
                                      option.value === selectedDepartment
                                  ) : null
                                }
                                onChange={(selectedOption) =>
                                  handleDepartmentSearch(
                                    selectedOption ? selectedOption.value : ""
                                  )
                                }
                                options={departmentOptions}
                                aria-label="Select Department"
                                placeholder="Select Department*"
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                  option: (provided) => ({
                                    ...provided,
                                    cursor: "pointer",
                                  }),
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="col-xl-1 col-lg-4 col-md-4 col-sm-4 col-xxl-2   mb-3 mb-sm-0">
                          <button
                            type="button"
                            className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center"
                            onClick={resetFilters}
                          >
                           <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                           Reset
                          </button>
                        </div>
                        <div className="col-xl-6 d-flex align-items-center col-lg-5 col-md-6 col-sm-8  col-xxl-4 ms-auto justify-content-sm-end ">
                          <button
                            className={classnames(
                              "btn btn-light material-shadow-none cursor-pointer",
                              "fw-medium",
                              { collapsed: !isDateRangePopupVisibleForExcel }
                            )}
                            type="button"
                            onClick={handleExportButtonClickForExcel}
                          >
                            Export to Excel
                          </button>

                          <Collapse
                            className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${
                              isDateRangePopupVisibleForExcel ? "show" : ""
                            }`}
                            style={{ top: "40px" }}
                          >
                            <div className="accordion-body">
                              <div className="input-group bg-white p-2">
                                <DataExportDateRangePopup
                                  dateStart={dateStartForExcel}
                                  dateEnd={dateEndForExcel}
                                  onChangeHandler={onChangeHandlerForExcel}
                                />
                                <div className="input-group-text bg-primary border-primary text-white">
                                  <i className="ri-calendar-2-line"></i>
                                </div>
                              </div>
                            </div>
                          </Collapse>

                          <button
                            className={classnames(
                              "btn btn-light material-shadow-none cursor-pointer ms-2",
                              "fw-medium",
                              { collapsed: !isDateRangePopupVisibleForPDF }
                            )}
                            type="button"
                            onClick={handleExportButtonClickForPDF}
                          >
                            Export to PDF
                          </button>

                          <Collapse
                            className={`dropdown-menu dropdown-menu-end py-0 position-absolute rounded shadow-sm z-1 ${
                              isDateRangePopupVisibleForPDF ? "show" : ""
                            }`}
                            style={{ top: "40px" }}
                          >
                            <div className="accordion-body">
                              <div className="input-group bg-white rounded p-2">
                                <DataExportDateRangePopup
                                  dateStart={dateStartForPDF}
                                  dateEnd={dateEndForPDF}
                                  onChangeHandler={onChangeHandlerForPDF}
                                />
                                <div className="input-group-text bg-primary border-primary text-white">
                                  <i className="ri-calendar-2-line"></i>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 ">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0">Request Details</h4>
                  </div>
                </div>
                <div className="col-lg-12 mb-4">
                  <div className="card mb-0 border-0">
                    <div className="card-body pb-0">
                      <div className="table-responsive table-card mb-0">
                        {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                          <table
                            className="table align-middle table-nowrap mb-0 com_table"
                            id="tasksTable"
                          >
                            <thead className="bg-white">
                              <tr className="text-capitalize">
                                <th className="">Users</th>
                                <th className="">Request assigned</th>
                                <th className="">Request Completed</th>
                                <th className="">Avg. Time </th>
                              </tr>
                            </thead>

                            <tbody className="list form-check-all">
                              {loading ? (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    <LoaderSpin />
                                  </td>
                                </tr>
                              ) : teamReportlist?.application?.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    <NotFound
                                      heading="Requests not found."
                                      message="Unfortunately, Requests not available at the moment."
                                    />
                                  </td>
                                </tr>
                              ) : (
                                teamReportlist?.application?.map(
                                  (data, index) => (
                                    <tr key={index}>
                                      <td>
                                        <div className="d-flex align-items-center w-50">
                                          <div className="flex-grow-1">
                                            {data?.userName || BlankData}
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        {data?.RequestAssigned || BlankData}
                                      </td>
                                      <td>
                                        {data?.RequestCompleted || BlankData}
                                      </td>
                                      <td>
                                       {calculateAverageTimePerRequest(data?.RequestCompleted,data?.completedDays)}
                                      </td>
                                    </tr>
                                  )
                                )
                              )}
                            </tbody>
                          </table>
                        {/* </SimpleBar> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                    <h4 className="mb-sm-0"> Ticket Details </h4>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="card mb-0 border-0">
                    <div className="card-body pb-0">
                      <div className="table-responsive table-card mb-0">
                        {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                          <table
                            className="table align-middle table-nowrap mb-0 com_table"
                            id="tasksTable"
                          >
                            <thead className="bg-white">
                              <tr className="text-capitalize">
                                <th className="">Users</th>
                                <th className="">Tickets assigned</th>
                                <th className="">Closed</th>
                                <th className="">Avg. Time </th>
                              </tr>
                            </thead>
                            <tbody className="list form-check-all">
                              {loading ? (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    <LoaderSpin />
                                  </td>
                                </tr>
                              ) : teamReportlist?.ticket?.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    {" "}
                                    {/* No records found.{" "} */}
                                    <NotFound
                                      heading="Tickets not found."
                                      message="Unfortunately, Tickets not available at the moment."
                                    />
                                  </td>
                                </tr>
                              ) : (
                                teamReportlist?.ticket?.map((data, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center w-50">
                                        <div className="flex-grow-1">
                                          {data?.userName}
                                        </div>
                                      </div>
                                    </td>
                                    <td>{data?.RequestAssigned}</td>
                                    <td>{data?.RequestCompleted}</td>
                                    <td>
                                    {calculateAverageTimePerRequest(data?.RequestCompleted,data?.completedDays)}
                                    </td>
                                 
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        {/* </SimpleBar> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  );
};
export default TeamPerformance;
