import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import UpdateStatusModal from "./UpdateStatusModal";
import ActiveApplications from "../../Applications/ActiveApplications/ActiveApplications";
import SupportTickets from "../../TicketingSystem/Tickets/SupportTickets";
import { decrypt } from "../../../utils/encryptDecrypt/encryptDecrypt";
import AnnouncementCarousel from "../AnnouncementCarousel";
import DepartmentUserInfo from "../../../common/UserInfo/DepartmentUserInfo";
import { hasViewPermission } from "../../../common/CommonFunctions/common";
import Loader, { LoaderSpin } from "../../../common/Loader/Loader";
import useAxios from "../../../utils/hook/useAxios";
function calculatePercentages(statuses) {
    // Destructure the statuses object to get the counts
    const { completed, inProgress, new: newStatus, pending } = statuses;

    // Calculate the total number of items
    const total = completed + inProgress + newStatus + pending;

    // Calculate percentages
    const percentages = {
        completed: total === 0 ? 0 : (completed / total) * 100,
        inProgress: total === 0 ? 0 : (inProgress / total) * 100,
        new: total === 0 ? 0 : (newStatus / total) * 100,
        pending: total === 0 ? 0 : (pending / total) * 100,
    };

    return percentages;
}

const DepartmentAgentDashboard = () => {
    const axiosInstance = useAxios()
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = useMemo(() => {
        return userEncryptData ? decrypt({ data: userEncryptData }) : {};
    }, [userEncryptData]);
    const userData = userDecryptData?.data;
    const departmentId = userData?.departmentId;
    const [ticketCount, setTicketCount] = useState();
    const [ticketCountPercentage, setTicketCountPercentage] = useState();
    const [data, setData] = useState("");
    const visibleRecords = 5;
    const navigate = useNavigate();
    const [dataById, setDataById] = useState([]);
    const [loading, setLoading] = useState(true);
    const [announcementloading,setAnnouncementLoading] = useState(true)
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
      ? decrypt({ data: userPermissionsEncryptData })
      : { data: [] };
    
    const slugsToCheck = ["announcements", "applications", "tickets"];
    
    const getPermission = (slug) => {
      const permission = userPermissionsDecryptData?.data?.find(
        (module) => module.slug === slug
      );
      return permission ? hasViewPermission(permission) : false;
    };
    
    const permissions = {};
    
    slugsToCheck.forEach((slug) => {
      permissions[slug] = getPermission(slug);
    });
    
    const announcementsViewPermission = permissions["announcements"];
    const applicationsViewPermission = permissions["applications"];
    const ticketsViewPermission = permissions["tickets"];

    const fetchDepartmentById = async () => {
        // setIsLoading(true)
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/departmentById`,
                { departmentId: departmentId }
            );
            if (response?.data) {
                const { rows, count } = response?.data?.data;
                setDataById(rows);
                // setIsLoading(false)
            }
        } catch (error) {
            // setIsLoading(false)
            console.error(error.message);
        }
    };
    const fetchTicketCount = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.post(
                `ticketService/ticket/statusCount`,
                { departmentId: departmentId }
            );
            if (response?.data) {
                const data = response?.data?.data;
                setTicketCount(data);
                // setIsLoading(false)
                if (data) {
                    let percentage = calculatePercentages(data);
                    setTicketCountPercentage(percentage);
                    setLoading(false)
                }
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            fetchDepartmentById();
        }
    }, []);
    useEffect(() => {
        if (userData?.departmentId) {
            fetchTicketCount();
        }
    }, []);

    function toggleCardVisibility(cardId) {
        const card = document.getElementById(cardId);
        if (card) {
            card.classList.toggle("d-none");
        }
    }

    const getCurrentFormattedDate = () => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        const today = new Date();
        const dateString = today.toLocaleDateString("en-US", options);
        return dateString.replace(",", "");
    };

    const listOfAnnouncements = async () => {
        try {
            setAnnouncementLoading(true)
            const response = await axiosInstance.post(
                `userService/announcement/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setData(rows);
                setAnnouncementLoading(false)
            }
        } catch (error) {
            setAnnouncementLoading(false)
            console.error("No results found.");
        }
    };

    useEffect(() => {
        listOfAnnouncements();
    }, []);

    document.title = "Dashboard | eGov Solution";

    return (
        <>
            <div className="main-content dashboard-ana">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <DepartmentUserInfo />
                            <div className="col-lg-9">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header d-flex align-items-center">
                                                <h5 className="flex-grow-1 mb-0">
                                                    Announcements
                                                </h5>
                                            </div>
                                          
                                                    {announcementloading ? (
                                                        <>
                                                         <div
                                                            className="card-body"
                                                            style={{
                                                                height: "",
                                                                padding: "35px 20px",
                                                            }}>
                                                        <LoaderSpin/>
                                                        </div>
                                                        </>
                                                    ): !announcementloading && data.length===0 ? (
                                                        <>
                                                         <div className="text-center">
                                                        <p className="text-muted">No Announcement found.</p>
                                                        </div>
                                                        </>
                                                    ):(
                                                        <>
                                                          <div
                                                className="card-body"
                                                style={{
                                                    height: "",
                                                    padding: "35px 20px",
                                                }}>
                                                      <AnnouncementCarousel
                                                    items={data}
                                                    announcementsViewPermission={announcementsViewPermission}
                                                />
                                                </div>
                                                        </>
                                                    )}
                                              
                                                {/* <Swiper
                          style={{
                            "--swiper-navigation-color": "orange",
                            "--swiper-pagination-color": "orange",
                          }}
                          autoplay={{
                            delay: 3500,
                            disableOnInteraction: false,
                          }}
                          slidesPerView={1}
                          pagination={{
                            // dynamicBullets: true,
                            clickable: true,
                          }}
                          modules={[Pagination, Autoplay]}
                          className="mySwiper">
                          {data &&
                            data
                              .slice(0, visibleRecords)
                              ?.map((announcement) => (
                                <SwiperSlide key={announcement.id}>
                                  <div className="swiper collection-slider">
                                    <div className="swiper-wrapper">
                                      <div className="swiper-slide">
                                        <div className="d-flex">
                                          <div className="flex-shink-0">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              version="1.1"
                                              xmlnsXlink="http://www.w3.org/1999/xlink"
                                              xmlnssvgjs="http://svgjs.com/svgjs"
                                              width="512"
                                              height="512"
                                              x="0"
                                              y="0"
                                              viewBox="0 0 32 32"
                                              style={{
                                                enableBackground:
                                                  "new 0 0 512 512",
                                                height: "40px",
                                                width: "40px",
                                              }}
                                              xmlSpace="preserve"
                                              className="me-2">
                                              <g>
                                                <g
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  id="Layer_2"
                                                  data-name="Layer 2">
                                                  <path
                                                    d="m20.683 5.518a3 3 0 0 0 -2.8-.3l-7.076 2.83h-5.807a3 3 0 0 0 -3 3v6a3 3 0 0 0 2 2.816v5.184a3 3 0 1 0 6 0v-5h.807l7.079 2.831a3 3 0 0 0 4.114-2.785v-12.094a3 3 0 0 0 -1.317-2.482zm-16.683 5.53a1 1 0 0 1 1-1h5v8h-5a1 1 0 0 1 -1-1zm4 14a1 1 0 1 1 -2 0v-5h2zm12-4.954a1 1 0 0 1 -1.372.928l-6.628-2.651v-8.646l6.628-2.651a1 1 0 0 1 1.372.926z"
                                                    fill="#f99f1e"
                                                    data-original="#f99f1e"></path>
                                                  <path
                                                    d="m29 13.048h-3a1 1 0 0 0 0 2h3a1 1 0 0 0 0-2z"
                                                    fill="#f99f1e"
                                                    data-original="#f99f1e"></path>
                                                  <path
                                                    d="m26 8.048a.991.991 0 0 0 .446-.106l2-1a1 1 0 1 0 -.894-1.789l-2 1a1 1 0 0 0 .448 1.895z"
                                                    fill="#f99f1e"
                                                    data-original="#f99f1e"></path>
                                                  <path
                                                    d="m28.447 21.153-2-1a1 1 0 1 0 -.894 1.789l2 1a.991.991 0 0 0 .446.106 1 1 0 0 0 .448-1.895z"
                                                    fill="#f99f1e"
                                                    data-original="#f99f1e"></path>
                                                </g>
                                              </g>
                                            </svg>
                                          </div>
                                          <div className="ms-3 flex-grow-1">
                                            <h6 className="mb-1">
                                              {announcement.title}
                                            </h6>
                                            <p className="text-muted mb-0">
                                              {announcement.formattedDate}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="swiper-pagination text-start mt-4"></div>
                                  </div>
                                </SwiperSlide>
                              ))}
                        </Swiper> */}
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card border-0">
                                            <div className="card-header">
                                                <h4 className="card-title mb-0 flex-grow-1 fs-18 fw-semibold">
                                                    Tickets
                                                </h4>
                                            </div>

                                            {loading ? (
                                                     <div className="card-body border-0 pb-2 pt-2">
                                                     <LoaderSpin height={"300px"} />
                                                   </div>
                                            ): !loading && ticketsViewPermission?.length === 0 ?(
                                                <div className="text-center">
                                                <p className="text-muted">No Ticket Data found.</p>
                                                </div>
                                            ):(
                                                <>
                                                 <div className="card-body border-0 pb-2 pt-2">
                                                <div className="d-flex">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 text-muted">
                                                            New
                                                        </h6>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <h6 className="mb-0">
                                                            {ticketsViewPermission ? ticketCount?.new || null : null}
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div
                                                    className="progress animated-progress progress-sm bg-soft-secondary"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            backgroundColor:
                                                                "#405189",
                                                            width: `${ticketsViewPermission ? ticketCountPercentage?.new || null : null}%`,
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                        role="progressbar"
                                                        aria-valuenow="49"
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div className="card-body border-0 pb-2 pt-2">
                                                <div className="d-flex">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 text-muted">
                                                            In Progress
                                                        </h6>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <h6 className="mb-0">
                                                            {
                                                                ticketsViewPermission ? ticketCount?.inProgress || null : null
                                                            }
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div
                                                    className="progress animated-progress progress-sm bg-soft-secondary"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            backgroundColor:
                                                                "#b15444",
                                                            width: `${ticketsViewPermission ? ticketCountPercentage?.inProgress || null : null}%`,
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                        role="progressbar"
                                                        aria-valuenow="90"
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div className="card-body border-0 pb-2 pt-2">
                                                <div className="d-flex">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 text-muted">
                                                            Pending
                                                        </h6>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <h6 className="mb-0">
                                                            {
                                                                ticketsViewPermission ? ticketCount?.pending || null : null
                                                            }
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div
                                                    className="progress animated-progress progress-sm bg-soft-secondary"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            backgroundColor:
                                                                "#f7b84b",
                                                            width: `${ticketsViewPermission ? ticketCountPercentage?.pending || null : null}%`,
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                        role="progressbar"
                                                        aria-valuenow="90"
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"></div>
                                                </div>
                                            </div>

                                            <div className="card-body border-0">
                                                <div className="d-flex">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 text-muted">
                                                            Completed
                                                        </h6>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <h6 className="mb-0">
                                                            {
                                                                ticketsViewPermission ? ticketCount?.completed || null : null
                                                            }
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div
                                                    className="progress animated-progress progress-sm bg-soft-secondary"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}>
                                                    <div
                                                        className="progress-bar"
                                                        role="progressbar"
                                                        style={{
                                                            backgroundColor:
                                                                "#0ab39c",
                                                            width: `${ticketsViewPermission ? ticketCountPercentage?.completed || null : null}%`,
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                        aria-valuenow="10"
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            </>

                                            )}
                                           
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {applicationsViewPermission && (
                        <div className="row ">
                            <div className="col-lg-12">
                                <div className="card border-0">
                                    <div className="card-header border-bottom">
                                        <h5 className="mb-0">
                                            Recent Applications
                                        </h5>
                                    </div>
                                    <ActiveApplications isDashBoard={true} />
                                </div>
                            </div>
                        </div>
                        )}

                        {ticketsViewPermission && (
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="card mb-0 border-0">
                                    <div className="card-header border-bottom">
                                        <h5 className="mb-0">Recent Tickets</h5>
                                    </div>
                                    <SupportTickets isDashBoard={true} />
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                <UpdateStatusModal />
            </div>
        </>
    );
};

export default DepartmentAgentDashboard;
