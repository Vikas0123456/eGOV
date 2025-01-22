import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DocumentItem from "./DocumentItem";
import { RefreshCcw } from "feather-icons-react";
import { IoChevronBack } from "react-icons/io5";
import useAxios from "../../../utils/hook/useAxios";
import NotFound from "../../../common/NotFound/NotFound";
import { LoaderSpin } from "../../../common/Loader/Loader";

const Documents = ({customerId}) => {
  document.title = "Documents | eGov Solution Customer";
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const [documentsList, setDocumentsList] = useState([]);
  const [editableIndex, setEditableIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  //For load more
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPageSize, setPerPageSize] = useState(3);
  const totalPages = Math.ceil(totalCount / perPageSize);
  //Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setPerPageSize(3);
    setSearchQuery("");
    setEditableIndex(null);
  };

  const handleInputSearch = (e) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };

  const fetchDocumentsList = async () => {
    try {
      setIsLoading(true);
      setDocumentsList([]);
      const options = {
        customerId: customerId,
        isShowInDocument: "1",
        page: currentPage,
        perPage: perPageSize,
        searchQuery: searchQuery,
        isGenerated: "",
      };
      if (activeTab === "generated") {
        options.isGenerated = "1";
      } else if (activeTab === "Show-In") {
        options.isGenerated = "0";
      }

      const response = await axiosInstance.post(
        `documentService/view`,
        options
      );

      if (response?.data) {
        const { rows, count } = response.data.data;

        setDocumentsList(rows.map((item) => ({ ...item, slug: false })));
        setIsLoading(false);
        setTotalCount(count);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      if (customerId) {
        fetchDocumentsList();
      } else {
        setIsLoading(false)
      }
    }
  }, [currentPage, perPageSize, searchQuery, activeTab]);

  const handleLoadMore = () => {
    if (perPageSize < totalCount) {
      setPerPageSize((prePageSize) => prePageSize + 3);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        if (customerId) {
          fetchDocumentsList();
        } else {
          setIsLoading(false)
        }
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [currentPage, perPageSize, searchQuery]);
  const resetFilters = () => {
    setCurrentPage(1);
    setPerPageSize(3);
    setSearchQuery("");
  };


  return (
        <div className="row">
          <div className="col-12 col-xl-12">
            
            <Card className="border-0  rounded ">
              <CardBody className="border-0 px-0">
                <div className="scroll-tab doc-tab">
                  <ul className="nav nav-tabs nav-tabs-customs nav-justified  border-0 " role="tablist" aria-orientation="vertical" >
                    <li>
                      <span
                        className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 cursor-pointer 
                                                        ${activeTab === "All"
                            ? "show active"
                            : ""
                          }`}
                        id="All-tab"
                        role="tab"
                        aria-controls="All"
                        aria-selected={activeTab === "All"}
                        onClick={() => handleTabClick("All")}
                      >
                        All
                      </span>
                    </li>
                    <li>
                      <span
                        className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 cursor-pointer ${activeTab === "Show-In" ? "show active" : ""
                          }`}
                        id="Show-In-tab"
                        role="tab"
                        aria-controls="Show-In"
                        aria-selected={activeTab === "Show-In"}
                        onClick={() => handleTabClick("Show-In")}
                      >
                        Show In
                      </span>
                    </li>
                    <li>
                      <span
                        className={`nav-link d-flex align-items-center m-0 fw-bold h-100 bg-transparent border-0 cursor-pointer ${activeTab === "generated" ? "show active" : ""
                          }`}
                        id="generated-tab"
                        role="tab"
                        aria-controls="generated"
                        aria-selected={activeTab === "generated"}
                        onClick={() => { handleTabClick("generated"); }}
                      >
                        Generated
                      </span>
                    </li>
                  </ul>
                </div>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="All">

                    <Row>
                      <Col lg={12} className="my-2 my-xl-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="search-box">
                              <input
                                type="text"
                                className="form-control search bg-light "
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) =>
                                  handleInputSearch(e)
                                }
                              />
                              <i className="ri-search-line search-icon"></i>
                            </div>

                            <Button
                              type="button"
                              className="btn btn-primary ms-3"
                              onClick={resetFilters}
                              color="primary"
                            >
                              <RefreshCcw className="me-2 icon-xs" />{" "}
                              Reset
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>


                    <div className="tab-content text-muted home-list-tabs">
                      <div className="row">
                        {isLoading ? (
                          <LoaderSpin height={"300px"} />
                        ) : documentsList.length === 0 ?
                          (
                            <div className="vstack gap-2 mt-3">
                              <NotFound heading="Documents not found." message="Unfortunately, Documents not available at the moment." />
                            </div>

                          ) :
                          documentsList?.filter((document) => document.isShowInDocument == "1").map((document, index) => (

                            <div className="col-xxl-4 col-md-6" key={index}>
                              <DocumentItem
                                index={index}
                                documentItem={document}
                                editableIndex={editableIndex}
                                setEditableIndex={setEditableIndex}
                                fetchDocumentsList={fetchDocumentsList}
                              />
                            </div>

                          ))
                        }
                      </div>
                    </div>

                    {!isLoading &&
                      totalPages !== currentPage &&
                      currentPage * perPageSize < totalCount && (
                        <div className="mt-4 mb-2 text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="Load more documents"
                            onClick={handleLoadMore}
                            disabled={
                              totalPages === currentPage ||
                              currentPage * perPageSize >= totalCount
                            }
                          >
                            Load More Documents
                          </button>
                        </div>
                      )}
                  </TabPane>
                  <TabPane tabId="Show-In">
                    <Row>
                      <Col lg={12} className="my-2 my-xl-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between ">
                          <div className="d-flex align-items-center">
                            <div className="search-box">
                              <input
                                type="text"
                                className="form-control search bg-light border-light"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) =>
                                  handleInputSearch(e)
                                }
                              />
                              <i className="ri-search-line search-icon"></i>
                            </div>

                            <Button
                              type="button"
                              className="btn btn-primary ms-2"
                              onClick={resetFilters}
                              color="primary"
                            >
                              <RefreshCcw className="text-white me-2 icon-xs" />{" "}
                              Reset
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <div className="tab-content text-muted home-list-tabs">
                      <div className="row">
                        {
                          isLoading ? (
                            <LoaderSpin height={"300px"} />
                          ) : documentsList.length === 0 ?
                            (
                              documentsList.filter(
                                (document) =>
                                  document.isShowInDocument == "1" &&
                                  document.isGenerated == "0"
                              ).length === 0 && (
                                <div className="vstack gap-2 mt-3">
                                  <NotFound
                                    heading="Documents not found."
                                    message="Unfortunately, Documents not available at the moment."
                                  />
                                </div>
                              )
                            ) :
                            (

                              documentsList
                                ?.filter(
                                  (document) =>
                                    document.isShowInDocument == "1" &&
                                    document.isGenerated == "0"
                                )
                                .map((document, index) => (
                                  <div className="col-xxl-4 col-md-6" key={index}>
                                    <DocumentItem
                                      index={index}
                                      documentItem={document}
                                      editableIndex={editableIndex}
                                      setEditableIndex={setEditableIndex}
                                      fetchDocumentsList={fetchDocumentsList}
                                    />
                                  </div>
                                ))
                            )
                        }
                      </div>
                    </div>

                    {!isLoading &&
                      totalPages !== currentPage &&
                      currentPage * perPageSize < totalCount && (
                        <div className="mt-4 mb-2 text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="Load more documents"
                            onClick={handleLoadMore}
                            disabled={
                              totalPages === currentPage ||
                              currentPage * perPageSize >= totalCount
                            }
                          >
                            Load More Documents
                            {/* <i className="ri-arrow-right-line align-middle ms-2"></i> */}
                          </button>
                        </div>
                      )}
                  </TabPane>
                  <TabPane tabId="generated">


                    <Row>
                      <Col lg={12} className="my-2 my-xl-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="search-box">
                              <input
                                type="text"
                                className="form-control search bg-light border-light"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) =>
                                  handleInputSearch(e)
                                }
                              />
                              <i className="ri-search-line search-icon"></i>
                            </div>
                            <Button
                              type="button"
                              className="btn btn-primary  ms-2"
                              onClick={resetFilters}
                              color="primary"
                            >
                              <RefreshCcw className="text-white me-2 icon-xs" />{" "}
                              Reset
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>



                    <div className="tab-content text-muted home-list-tabs">
                      <div className="row">
                        {isLoading ? (
                          <LoaderSpin height={"300px"} />
                        ) : documentsList.length === 0 ?
                          (
                            <div className="vstack gap-2 mt-3">
                              <NotFound
                                heading="Documents not found."
                                message="Unfortunately, Documents not available at the moment."
                              />
                            </div>

                          ) :
                          documentsList
                            ?.filter(
                              (document) => document.isGenerated == "1"
                            )
                            .map((document, index) => (
                              <div className="col-xxl-4 col-md-6" key={index}>

                                <DocumentItem
                                  index={index}
                                  documentItem={document}
                                  editableIndex={editableIndex}
                                  setEditableIndex={setEditableIndex}
                                  fetchDocumentsList={fetchDocumentsList}
                                />
                              </div>
                            ))
                        }
                      </div>
                    </div>
                    {!isLoading &&
                      totalPages !== currentPage &&
                      currentPage * perPageSize < totalCount && (
                        <div className="mt-4 mb-2 text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary waves-effect waves-light"
                            onClick={handleLoadMore}
                            disabled={
                              totalPages === currentPage ||
                              currentPage * perPageSize >= totalCount
                            }
                          >
                            Load More Documents
                          </button>
                        </div>
                      )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </div>
        </div>
  );
};

export default Documents;
