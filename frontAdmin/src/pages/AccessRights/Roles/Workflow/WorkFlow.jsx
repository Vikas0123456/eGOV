import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Table,
} from "reactstrap";
import Select from "react-select";
import { useState } from "react";
import { useEffect } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import errorImage from "../../../../assets/images/error.gif";
import {
  hasCreatePermission,
  hasDeletePermission,
  hasEditPermission,
  hasViewPermission,
} from "../../../../common/CommonFunctions/common";
import Pagination from "../../../../CustomComponents/Pagination";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Loader, { LoaderSpin } from "../../../../common/Loader/Loader";
import ScrollToTop from "../../../../common/ScrollToTop/ScrollToTop";
import SimpleBar from "simplebar-react";
import { RefreshCcw } from "feather-icons-react";
import DepartmentUserInfo from "../../../../common/UserInfo/DepartmentUserInfo";
import { Eye } from "feather-icons-react/build/IconComponents";
import NotFound from "../../../../common/NotFound/NotFound";
import useAxios from "../../../../utils/hook/useAxios";
import ColumnConfig from './../../../../common/ColumnConfig/ColumnConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setTableColumnConfig } from "../../../../slices/layouts/reducer";

const BlankData = process.env.REACT_APP_BLANK;
const WorkFlow = () => {
  const axiosInstance = useAxios()
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id;
  const dispatch = useDispatch()
  const tableName = "workflow";
  const tableConfigList = useSelector((state) => state?.Layout?.tableColumnConfig);
  const tableColumnConfig = tableConfigList?.find((config) => config?.tableName === tableName)
  // List of all columns
  const allColumns = ["Workflow Name", "Workflow For", "Department Name", "Agent Name"];
  const shouldShowAllColumns = !tableColumnConfig?.tableConfig || tableColumnConfig?.tableConfig.length === 0;
  // Columns to be shown
  const columns = shouldShowAllColumns
    ? ["Workflow Name", "Workflow For", "Department Name", "Agent Name", "Action"] // Define all available columns
    : [...tableColumnConfig?.tableConfig, "Action"]; // Ensure "actions" is include

  // table data filter search sort
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);


  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState();
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDept, setSelectedDept] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPageSize, setPerPageSize] = useState(10);
  const totalPages = Math.ceil(totalCount / perPageSize);
  // upload Image
  const [selectedFile, setSelectedFile] = useState(null);
  const [isWorkflowLoading, setIsWorkflowLoading] = useState(true);

  const handleSorting = (value) => {
    setOrderBy(value);
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };
  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const EventPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find(
      (module) => module.slug === "workflow"
    );
  const viewPermissions = EventPermissions
    ? hasViewPermission(EventPermissions)
    : false;
  const createPermission = EventPermissions
    ? hasCreatePermission(EventPermissions)
    : false;
  const editPermission = EventPermissions
    ? hasEditPermission(EventPermissions)
    : false;
  const deletePermission = EventPermissions
    ? hasDeletePermission(EventPermissions)
    : false;

  useEffect(() => {
    if (tableColumnConfig?.tableConfig && openColumnModal === true) {
      setSelectedColumns(tableColumnConfig?.tableConfig);
    }
  }, [tableColumnConfig?.tableConfig, openColumnModal]);

  const fetchWorkflowList = async () => {
    try {
      setIsWorkflowLoading(true);
      const response = await axiosInstance.post(`userService/workflow/list`, {
        page: currentPage,
        perPage: perPageSize,
        searchFilter: searchQuery,
        workflowDepartmentId:
          userData?.isCoreTeam === "0" ? (userData?.departmentId || "").split(',').map(id => id.trim()) : selectedDept,
        sortOrder: sortOrder,
        orderBy: orderBy,
      });

      // Decrypt the response data if needed
      if (response?.data) {
        const { rows, count } = response?.data?.data;
        setTotalCount(count);
        setData(rows);
        setIsWorkflowLoading(false);
      }
    } catch (error) {
      setIsWorkflowLoading(false);
      console.error(error.message);
    }
  };

  const listOfDepartments = async () => {
    try {
      const response = await axiosInstance.post(
        `serviceManagement/department/view`,
        {}
      );
      if (response?.data) {
        const { rows } = response?.data?.data;
        setDepartmentList(rows);
      }
    } catch (error) {
      console.error("No results found for the given search query.");
    }
  };
  useEffect(() => {
    listOfDepartments();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        fetchWorkflowList();
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [currentPage, perPageSize, searchQuery, sortOrder, orderBy, selectedDept]);

  useEffect(() => {
    if (!searchQuery) {
      fetchWorkflowList();
    }
  }, [currentPage, perPageSize, searchQuery, sortOrder, orderBy, selectedDept]);

  const handleDepartmentSearch = (value) => {
    setCurrentPage(1);
    if (value) {
      setSelectedDept(value);
    } else {
      setSelectedDept("")
    }
  };
  const handleSelectPageSize = (e) => {
    setCurrentPage(1);
    setPerPageSize(parseInt(e.target.value, 10));
  };
  const handleInputSearch = (e) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };
  const resetFilters = async () => {
    setCurrentPage(1);
    setSelectedDept("");
    setPerPageSize(10);
    setSearchQuery("");
    setOrderBy();
    setSortOrder("desc");
  };
  const deleteWorkflow = async (workflowId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this workflow!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#303e4b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.put(
          `userService/workflow/delete`,
          {
            workflowId: workflowId,
          }
        );
        if (response) {
          toast.success(`Workflow deleted successfully.`);
          fetchWorkflowList();
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        toast.error(`Failed to delete Workflow.`);
        console.error(error);
      }
    }
  };
  const getWorkflowApi = async (workflowId) => {
    navigate("/add-workflow", {
      state: workflowId,
    });
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

  const departmentOptions = departmentList.length > 0 &&
    [{ value: "", label: "Select Department*" }, ...departmentList.map((deparment) => ({
      value: deparment.id,
      label: deparment.departmentName,
    }))]


  const fetchTableConfigData = async () => {
    try {
      if (userId) {
        const response = await axiosInstance.post(
          `userService/table/get-table-config`,
          {
            userId: userId,
          }
        );

        if (response) {
          const data = response?.data?.data;
          dispatch(setTableColumnConfig(data));
        }
      }
    } catch (error) {
      console.error("Error fetching profile image:", error.message);
    }
  };
  const updateTableConfig = async (selectedColumns) => {
    setOpenColumnModal(false);
    try {
      const response = await axiosInstance.post(
        `userService/table/update-table-config`,
        {
          userId: userId,
          tableName: tableName,
          tableConfig: selectedColumns,
        }
      );
      if (response) {
        fetchTableConfigData();
      }
    } catch (error) {
      console.error("Something went wrong while update banner");
    }
  };
  // Function to handle selecting all columns
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all columns
      setSelectedColumns(allColumns);
    } else {
      // Deselect all columns
      setSelectedColumns([]);
    }
  };

  // Function to handle individual column selection
  const handleColumnChange = (column) => {
    if (selectedColumns.includes(column)) {
      // If the column is already selected, remove it
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      // Otherwise, add it to the selected columns
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  // Function to handle applying changes
  const handleApplyChanges = (e) => {
    e.preventDefault();
    // Add logic to handle applying column changes
    updateTableConfig(selectedColumns);
  };

  // Function to handle canceling changes
  const handleCancel = () => {
    setSelectedColumns([]); // Reset the selected columns
    setOpenColumnModal(false); // Close the dropdown
  };

  // Function to toggle the column modal
  const handleOpenColumnModal = (isOpen) => {
    setOpenColumnModal(isOpen);
  };
  document.title = "Workflow | eGov Solution";
  return (
    <>

      <div id="layout-wrapper">
        <div className="main-content services">
          <div className="page-content">
            <Container fluid>
              <Row>
                <DepartmentUserInfo />
                <Col className="col-12">
                  <div className="d-flex align-items-center ">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <div className="page-title-box header-title pt-lg-4 pt-3">
                          <h4 className="mb-sm-0">Workflow</h4>
                          {/* <div className="">
                              <div className="fs-15 mt-1 text-muted mb-0">
                                All systems are running smoothly! You have{" "}
                                <span className="text-primary">
                                  {" "} 2 unread alerts!{" "}
                                </span>
                              </div>
                            </div> */}
                        </div>
                      </div>
                    </div>

                  </div>
                </Col>
                <Col className="col-12 ">
                  <Card className="border-0">
                    <CardBody className="border-0">
                      <div className="row">
                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xxl-3 mb-3 mb-md-0">
                          <div className="search-box">
                            <Input
                              type="text"
                              className="form-control search bg-light border-light"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={handleInputSearch}
                            />
                            <i className="ri-search-line search-icon"></i>
                          </div>
                        </div>
                        {userData?.isCoreTeam !== "0" && (
                          <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xxl-3 mb-3 mb-md-0">
                            <div className=" input-light">
                              <Select className="bg-choice" options={departmentOptions} onChange={(value) => handleDepartmentSearch(value.value)}
                                value={selectedDept ? departmentOptions.find((option) => option.value === selectedDept) : null}
                                placeholder="Select Department*"
                                name="Select Department*"
                                styles={{
                                  control: (provided) => ({ ...provided, cursor: "pointer", }),
                                  menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                  option: (provided) => ({ ...provided, cursor: "pointer", }),
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="col-xl-3 col-lg-3 col-md-3 col-12 col-sm-6 col-xxl-3  mb-3 mb-sm-0  ">
                          <Button type="button" className="btn btn-primary btn-label bg-warning border-warning d-flex align-items-center" onClick={resetFilters} >
                            <i className="ri-refresh-line label-icon align-middle fs-18 me-2"></i>
                            Reset
                          </Button>

                        </div>
                        <div className="col-xl-3 col-lg-3 col-md-3 col-12 col-sm-6 col-xxl-3 ms-auto text-end d-flex align-items-start justify-content-end">
                          {createPermission && (

                            <Button type="button" color="primary" className="btn btn-primary btn-label me-3  text-nowrap " id="create-btn" onClick={() => navigate("/add-workflow")} >
                              <i className="ri-add-line label-icon align-middle fs-20 me-2"></i>
                              Add Workflow
                            </Button>

                          )}

                          <ColumnConfig
                            openColumnModal={openColumnModal}
                            handleOpenColumnModal={handleOpenColumnModal}
                            handleApplyChanges={handleApplyChanges}
                            handleSelectAll={handleSelectAll}
                            selectedColumns={selectedColumns}
                            allColumns={allColumns}
                            handleColumnChange={handleColumnChange}
                            handleCancel={handleCancel}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col className="col-12">
                  <Card className="border-0 mb-0">
                    <CardBody className="pb-0">
                      <div className="table-responsive table-card mb-0">
                        {/* <SimpleBar style={{ maxHeight: "calc(100vh - 50px)", overflowX: "auto", }} > */}
                          <Table
                            className="table align-middle table-nowrap mb-0 com_table"
                            id="tasksTable"
                          >
                            <thead className="bg-white">
                              <tr>
                                {columns.includes("Workflow Name") && (<th
                                  className="fw-bold cursor-pointer"
                                  onClick={() =>
                                    handleSorting("workflowName")
                                  }
                                >
                                  Workflow Name{" "}
                                  <span>
                                    {" "}
                                    <BiSortAlt2 />{" "}
                                  </span>
                                </th>)}
                                {columns.includes("Workflow For") && (<th
                                  className="fw-bold cursor-pointer"
                                  onClick={() => handleSorting("workflowFor")}
                                >
                                  Workflow For{" "}
                                  <span>
                                    {" "}
                                    <BiSortAlt2 />{" "}
                                  </span>
                                </th>)}
                                {columns.includes("Department Name") && (<th
                                  className="fw-bold cursor-pointer"
                                  onClick={() =>
                                    handleSorting("workflowDepartmentId")
                                  }
                                >
                                  Department Name{" "}
                                  <span>
                                    {" "}
                                    <BiSortAlt2 />{" "}
                                  </span>
                                </th>)}

                                {columns.includes("Agent Name") && (<th
                                  className="fw-bold cursor-pointer"
                                  onClick={() => handleSorting("userId")}
                                >
                                  Agent Name{" "}
                                  <span>
                                    {" "}
                                    <BiSortAlt2 />{" "}
                                  </span>
                                </th>)}
                                {columns.includes("Action") && (<th className="fw-bold text-center">Action</th>)}
                              </tr>
                            </thead>
                            <tbody >
                              {isWorkflowLoading ? (<tr>
                                <td colSpan="6" className="text-center">
                                  <LoaderSpin />
                                </td>
                              </tr>) : data.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    {" "}
                                    <NotFound heading="Workflow not found." message="Unfortunately, workflow not available at the moment." />
                                    {" "}
                                  </td>
                                </tr>
                              ) : (
                                data.map((workflow, index) => (

                                  <tr key={index}>
                                    {columns.includes("Workflow Name") && (<td className="text-nowrap">
                                      <div>
                                        <div className="d-flex align-items-center">
                                          <div className="fw-semibold text-black">
                                            {workflow?.workflowName || BlankData}
                                          </div>
                                        </div>
                                      </div>
                                    </td>)}
                                    {columns.includes("Workflow For") && (<td className="text-nowrap">
                                      <div>
                                        <div className="d-flex align-items-center">
                                          <div className="fw-semibold text-black">
                                            {workflow?.workflowFor === "0"
                                              ? "Service"
                                              : workflow?.workflowFor === "1"
                                                ? "Ticket"
                                                : ""}
                                          </div>
                                        </div>
                                      </div>
                                    </td>)}
                                    {columns.includes("Department Name") && (<td className="text-nowrap">
                                      <div>
                                        <div className="d-flex align-items-center">
                                          <div className="fw-semibold text-black">
                                            {
                                              workflow?.department
                                                ?.departmentName
                                              || BlankData
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </td>)}
                                    {columns.includes("Agent Name") && (<td className="text-nowrap">
                                      <div className="d-flex align-items-center">
                                        <div className="fw-semibold text-black">
                                          {workflow?.user?.name || BlankData}
                                        </div>
                                      </div>
                                    </td>)}
                                    {columns.includes("Action") && (<td className="w-md text-end">
                                      <span>
                                        {viewPermissions &&
                                          !editPermission && (
                                            <span
                                              title="view"
                                              onClick={() =>
                                                // getWorkflowApi(workflow.id)
                                                  navigate("/add-workflow", {
                                                    state: workflow,
                                                  })
                                              }
                                            >
                                              <Eye
                                                width="16"
                                                height="16"
                                                className="text-primary me-4"
                                              />
                                            </span>
                                          )}
                                        {editPermission && (
                                          <span
                                            title="Edit"
                                            onClick={() =>
                                              // getWorkflowApi(workflow.id)
                                              navigate("/add-workflow", {
                                                state: workflow,
                                              })
                                            }
                                          >
                                            <FiEdit2 className=" cursor-pointer me-4" />
                                          </span>
                                        )}
                                        {deletePermission && (
                                          <span
                                            title="Delete"
                                            onClick={() =>
                                              deleteWorkflow(workflow.id)
                                            }
                                          >
                                            <RiDeleteBinLine className="cursor-pointer" />
                                          </span>
                                        )}
                                      </span>
                                    </td>)}
                                  </tr>

                                ))
                              )}

                            </tbody>
                          </Table>
                        {/* </SimpleBar> */}
                      </div>
                    </CardBody>
                    <Pagination
                      totalCount={totalCount}
                      perPageSize={perPageSize}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      handleSelectPageSize={handleSelectPageSize}
                      handlePageChange={handlePageChange}
                    />
                  </Card>
                </Col>
              </Row>

            </Container>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  );
};
export default WorkFlow;
