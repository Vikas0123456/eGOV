import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NoImage from "../../../../assets/images/NoImage copy.jpg";
import { toast } from "react-toastify";
import TicketCKEditor from "./TicketCKEditor";
import { useFormik } from "formik";
import * as Yup from "yup";
import { decrypt } from "../../../../utils/encryptDecrypt/encryptDecrypt";
import {
  hasCreatePermission,
  hasDeletePermission,
  hasEditPermission,
  hasAssignPermission,
} from "../../../../common/CommonFunctions/common";
import ScrollToTop from "../../../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import { Spinner } from "react-bootstrap";
import useAxios from "../../../../utils/hook/useAxios";
import SimpleBar from "simplebar-react";
import { IoChevronBack } from "react-icons/io5";
import { Button } from "react-bootstrap";
import TicketLogHistory from "./TicketChatHistory";

function formatDateString(isoDateString) {
  if (isoDateString) {
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
  } else {
    return "-";
  }
}

function formatRelativeTime(dateFromDB) {
  if (dateFromDB == null || undefined || "") {
    return "-";
  }

  const now = new Date();
  const dbDate = new Date(dateFromDB);
  const diffInMs = now - dbDate;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInSeconds < 0) {
    return "Invalid date";
  }
  if (diffInSeconds < 60) {
    return "Just now";
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }
  const diffInMonths =
    (now.getFullYear() - dbDate.getFullYear()) * 12 +
    (now.getMonth() - dbDate.getMonth());
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }
  const diffInYears = now.getFullYear() - dbDate.getFullYear();
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

const TicketsDetails = () => {
  const axiosInstance = useAxios()

  const editorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [ticketDetails, setTicketDetails] = useState(
    location.state?.ticketDetails || {}
  );
  const [ticketLogs, setTicketLogs] = useState([]);
  const [ticketChat, setTicketChat] = useState([]);
  const [lastActivity, setLastActivity] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [openModel, setOpenModel] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userInfo= userDecryptData?.data
  const userPermissionsEncryptData = localStorage.getItem("userPermissions");
  const userPermissionsDecryptData = userPermissionsEncryptData
    ? decrypt({ data: userPermissionsEncryptData })
    : { data: [] };
  const RolesPermissions =
    userPermissionsDecryptData &&
    userPermissionsDecryptData?.data?.find(
      (module) => module.slug === "tickets"
    );
  const editPermission = RolesPermissions
    ? hasEditPermission(RolesPermissions)
    : false;

  const assignToPermission = RolesPermissions
    ? hasAssignPermission(RolesPermissions)
    : false;
  const validationSchema = Yup.object().shape({
    message: Yup.string().required("Please enter the Message."),
  });

    const chatEndRef = useRef(null);
    const simpleBarRef = useRef(null);

    useEffect(() => {
        if (openModel || ticketChat?.length) {
            const timeoutId = setTimeout(() => {
                if (simpleBarRef.current) {
                    const scrollElement = simpleBarRef.current.getScrollElement();
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                } else {
                    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [ticketChat, openModel]);

    const lastActivityData = async () => {
        try {
            const response = await axiosInstance.post(
                `ticketService/ticket/last-activity`,
                { id: ticketDetails?.id }
            );

            if (response?.data) {
                const rows = response.data?.lastActivity;
                setLastActivity(rows);
            }
        } catch (error) {
            console.error("Error fetching last activity data:", error);
        }
    };


    useEffect(() => {
        lastActivityData();
    }, [ticketDetails]);
  

    const getTicketChat = async () => {
        try {
            const response = await axiosInstance.post("ticketService/ticket/chatList", {
                ticketId: ticketDetails?.id,
            });
            if (response) {
                const { rows } = response.data.data;
                const parentMessages = rows.filter((ele) => !ele.dataValues.parentId);
                let preparedArray = [];

                parentMessages.forEach((parent) => {
                    const replies = rows.filter((reply) => reply.dataValues.parentId === parent.dataValues.id);

                    let messageData = {
                        id: parent.dataValues.id,
                        documentPath: parent.documentData?.documentPath || null,
                        createdDate: parent.dataValues.createdDate,
                        message: parent.dataValues.message,
                        userName: parent.userDetails?.userName || null,
                        customerName: parent.customer?.customerName || null,
                        replys: [],
                    };

                    replies
                        .sort((a, b) => new Date(a.dataValues.createdDate) - new Date(b.dataValues.createdDate))
                        .forEach((reply) => {
                            messageData.replys.push({
                                documentPath: reply.documentData?.documentPath || null,
                                createdDate: reply.dataValues.createdDate,
                                message: reply.dataValues.message,
                                userName: reply.userDetails?.userName || null,
                                customerName: reply.customer?.customerName || null,
                            });
                        });

                    preparedArray.push(messageData);
                });

                const sortedArray = preparedArray.sort((a, b) => a.id - b.id);

                setTicketChat(sortedArray);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const getTicketLogs = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                "ticketService/ticket/logs",
                {
                    ticketId: ticketDetails?.id,
                    customerId: ticketDetails?.customerId || null,
                }
            );
            if (response) {
                const { rows } = response.data.data;

                setTicketLogs(rows)
                
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        }
    };

    useEffect(() => {
        getTicketChat();
        getTicketLogs();
    }, []);

    let activityDate = ticketChat.sort((a, b) => {
      const dateA = new Date(a?.createdDate);
      const dateB = new Date(b?.createdDate);
      return dateA - dateB;
    })[0];

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 0:
        return "High";
      case 1:
        return "Medium";
      case 2:
        return "Low";
      default:
        return "Unknown";
    }
  };

  const getStatusLabel = (priority) => {
    switch (priority) {
      case 0:
        return "Pending";
      case 1:
        return "In Progress";
      case 2:
        return "Escalated";
      case 3:
        return "Closed";
      case 4:
       return "Reopened";
      default:
        return "Unknown";
    }
  };

  function getPriorityStyle(priority) {
    switch (priority) {
      case 0:
        return { backgroundColor: "red", color: "white" };
      case 1:
        return { backgroundColor: "blue", color: "white" };
      case 2:
        return { backgroundColor: "green", color: "white" };
      default:
        return {};
    }
  }

  const updateStatus = async (e, ticket) => {
    try {
      const statusId = e.target.value;
      const response = await axiosInstance.put(
        `ticketService/ticket/status/${ticket}`,
        { statusId }
      );
      if (response) {
        toast.success("Status updated successfully");
        setTicketDetails((prevDetails) => ({
          ...prevDetails,
          status: statusId,
        }));
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const formatFileSize = (sizeInBytes) => {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const handleDownload = (url, filename) => {
    fetch(`${url}`)
      .then((response) => response.blob())
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(new Blob([blob]));

        const a = document.createElement("a");
        a.href = fileURL;
        a.download = `${filename}.png`;

        a.click();

        window.URL.revokeObjectURL(fileURL);
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
      });
  };

    const formik = useFormik({
        initialValues: { message: "" },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            await submitMessage(values.message, null);
        },
    });

    const replyFormik = useFormik({
        initialValues: { message: "" },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            await submitMessage(values.message, parentId);
            setIsReplying(false);
            replyFormik.resetForm();
            setParentId(null);
            if (editorRef.current) editorRef.current.setDisabled(false);
        },
    });

    const submitMessage = async (message, parentId) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("ticketService/ticket/send", {
                message,
                ticketId: ticketDetails?.id,
                userId: userDecryptData?.data?.id,
                parentId: parentId,
            });

            if (response) {
                toast.success("Message added successfully.");
                formik.resetForm();
                if (editorRef.current) editorRef.current.setData("");
                getTicketChat();
            }
        } catch (error) {
            toast.error("Something went wrong. Please check info and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReplyClick = (messageId) => {
        setIsReplying(true);
        setParentId(messageId);
    };
  
  const handleCloseModel = () => {
    setOpenModel(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const statusOptions = (status) => {
    return status === "1"
    ? [
        { value: "2", label: "Escalated" },
        { value: "3", label: "Closed" },
      ]
    : status === "2"
    ? [
        { value: "3", label: "Closed" },
      ]
    : status === "3"
    ? [
        { value: "3", label: "Closed" },
      ]
    : [
        {
            value: "1",
            label: "In Progress",
        },
    ];
};

  return (
      <>
          <div id="layout-wrapper">
              <div className="main-content">
                  <div className="page-content">
                      <div className="container-fluid">
                          <div className="row">
                              <div className="col-lg-12">
                                  <div className="card mt-n4  border-0">
                                      <div className="bg-dark">
                                          <div className="card-body mt-3 mt-sm-0">
                                              <div className="row">
                                                  <div className="col-md">
                                                      <div className="row align-items-center">
                                                          <div className="col-md-auto">
                                                              <div className="avatar-md mb-md-0 mb-4">
                                                                  <div className="avatar-title bg-white rounded-circle">
                                                                      <img
                                                                          src={
                                                                              ticketDetails
                                                                                  ?.departmentImageData
                                                                                  ?.documentPath ||
                                                                              NoImage
                                                                          }
                                                                          alt=""
                                                                          className="avatar-sm"
                                                                      />
                                                                  </div>
                                                              </div>
                                                          </div>
                                                          <div className="col-md">
                                                              <h4 className="fw-semibold text-white">
                                                                  {
                                                                      ticketDetails?.title
                                                                  }
                                                              </h4>
                                                              <div className="hstack gap-3 flex-wrap">
                                                                  <div className="text-white">
                                                                      <i className="ri-building-line align-bottom me-1"></i>
                                                                      {
                                                                          ticketDetails
                                                                              ?.departmentData
                                                                              ?.departmentName
                                                                      }
                                                                  </div>
                                                                  <div
                                                                      className="vr"
                                                                      style={{
                                                                          background:
                                                                              " #fff",
                                                                          opacity:
                                                                              "1",
                                                                      }}></div>
                                                                  <div className="text-white">
                                                                      Create
                                                                      Date :{" "}
                                                                      {formatDateString(
                                                                          ticketDetails?.createdDate
                                                                      )}{" "}
                                                                      <div className="fw-medium">
                                                                          <div className="current-date"></div>
                                                                      </div>
                                                                  </div>
                                                                  <div
                                                                      className="vr"
                                                                      style={{
                                                                          background:
                                                                              "#fff",
                                                                          opacity:
                                                                              "1",
                                                                      }}></div>
                                                                  {ticketDetails?.respondedOn && (
                                                                      <div className="text-white">
                                                                          Responded
                                                                          on :{" "}
                                                                          {formatDateString(
                                                                              activityDate?.createdDate >
                                                                                  ticketDetails?.respondedOn
                                                                                  ? activityDate?.createdDate
                                                                                  : ticketDetails?.respondedOn
                                                                          )}
                                                                          <div className="fw-medium current-date"></div>
                                                                      </div>
                                                                  )}
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div className="col-md-auto mt-md-0 mt-4 d-none">
                                                      <div className="hstack gap-1 flex-wrap">
                                                          <button
                                                              type="button"
                                                              className="btn avatar-xs mt-n1 p-0 favourite-btn active">
                                                              <div className="avatar-title bg-transparent fs-15">
                                                                  <i className="ri-star-fill"></i>
                                                              </div>
                                                          </button>
                                                          <button
                                                              type="button"
                                                              className="btn py-0 fs-16 text-body"
                                                              id="settingDropdown"
                                                              data-bs-toggle="dropdown">
                                                              {" "}
                                                              <i className="ri-share-line"></i>{" "}
                                                          </button>
                                                          <ul
                                                              className="dropdown-menu"
                                                              aria-labelledby="settingDropdown">
                                                              <li>
                                                                  <div className="dropdown-item">
                                                                      <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                                                      View
                                                                  </div>
                                                              </li>
                                                              <li>
                                                                  <div className="dropdown-item">
                                                                      <i className="ri-share-forward-fill align-bottom me-2 text-muted"></i>{" "}
                                                                      Share with
                                                                  </div>
                                                              </li>
                                                              <li>
                                                                  <div className="dropdown-item">
                                                                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                                                      Delete
                                                                  </div>
                                                              </li>
                                                          </ul>
                                                          <button
                                                              type="button"
                                                              className="btn py-0 fs-16 text-body">
                                                              <i className="ri-flag-line"></i>
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="row">
                              <div className="col-xxl-9">
                                  <div className="card">
                                      <div className="card-header">
                                          <div className="row">
                                              <div className="flex-grow-1 ms-auto d-flex align-items-center justify-content-between col-12 col-sm-6">
                                                  <div className="d-flex align-items-center">
                                                      <div>
                                                          <Button
                                                              color="outline-secondary"
                                                              className="waves-effect waves-light back-btn d-flex align-items-center"
                                                              onClick={handleBack}
                                                          >
                                                              <IoChevronBack size={20} />
                                                              <span className="ms-2">
                                                                  Back
                                                              </span>
                                                          </Button>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="card-body p-4">
                                          <h6 className="fw-semibold text-uppercase mb-3">
                                              Ticket Description
                                          </h6>
                                          <div className="d-flex justify-content-end align-items-center">
                                              {ticketLogs.length > 0 && (
                                                  <button
                                                      type="button"
                                                      className="btn btn-sm btn-primary d-flex align-items-center justify-content-center ms-2"
                                                      title="Chat History"
                                                      onClick={(e) => {
                                                          setOpenModel(true);
                                                      }}>
                                                      <span className="icon">
                                                          <i className="ri-history-line fs-18"></i>
                                                      </span>
                                                      <span className="text ms-2 fs-14">
                                                            Log History
                                                        </span>
                                                  </button>
                                              )}
                                          </div>
                                          <p className="text-muted">
                                              {ticketDetails?.discription}
                                              <div className="four"></div>
                                          </p>
                                      </div>
                                      <div className="card-body p-4">
                                          <SimpleBar style={{ maxHeight: "25rem", overflowX: "auto" }} ref={simpleBarRef}>
                                              {ticketChat?.map((data) => (
                                                  <div className="d-flex mb-4" key={data?.id}>
                                                      <div className="flex-shrink-0">
                                                          <img src={data?.documentPath || NoImage} alt="" className="rounded-circle avatar-xs me-2" />
                                                      </div>
                                                      <div className="flex-grow-1 ms-3">
                                                          <h5 className="fs-13">
                                                              {data?.userName || data?.customerName}{" "}
                                                              <small className="text-muted">{formatDateString(data?.createdDate)}</small>
                                                          </h5>
                                                          <p className="text-muted">
                                                              <div dangerouslySetInnerHTML={{ __html: data?.message }} />
                                                          </p>
                                                          {ticketDetails?.status !="3" && (ticketDetails?.assignTo == userInfo?.id || userInfo?.isCoreTeam =="1" || userInfo?.role?.isAdmin =="1") &&
                                                          <span
                                                              title="Reply"
                                                              className="badge text-muted bg-light cursor-pointer"
                                                              onClick={() => handleReplyClick(data?.id)}
                                                          >
                                                              <i className="mdi mdi-reply"></i> Reply
                                                          </span>}
                                                          
                                                          {/* Inline reply editor */}
                                                          {isReplying && parentId === data?.id && (
                                                              <div className="mt-4">
                                                                  <span
                                                                      title="Cancel"
                                                                      className="badge text-muted bg-light cursor-pointer"
                                                                      onClick={() => {
                                                                          replyFormik.resetForm();
                                                                          setIsReplying(false);
                                                                          setParentId(null);
                                                                          if (editorRef.current) editorRef.current.setData("");
                                                                      }}
                                                                  >
                                                                      Cancel
                                                                  </span>
                                                                  <form onSubmit={replyFormik.handleSubmit}>
                                                                      <TicketCKEditor
                                                                          value={replyFormik.values.message}
                                                                          onChange={(data) => replyFormik.setFieldValue("message", data)}
                                                                          onBlur={() => replyFormik.setFieldTouched("message", true)}
                                                                          placeholder="Enter your reply"
                                                                      />
                                                                      {replyFormik.touched.message && replyFormik.errors.message && (
                                                                          <div className="text-danger">{replyFormik.errors.message}</div>
                                                                      )}
                                                                      <div className="text-end mt-2">
                                                                          <button type="submit" className="btn btn-primary" disabled={loading}>
                                                                              {loading ? <Spinner animation="border" size="sm" className="fs-13" /> : "Reply To"}
                                                                          </button>
                                                                          {/* <button
                                                                              type="button"
                                                                              className="btn btn-secondary ms-2"
                                                                              onClick={() => {
                                                                                  replyFormik.resetForm();
                                                                                  setIsReplying(false);
                                                                                  setParentId(null);
                                                                                  if (editorRef.current) editorRef.current.setData("");
                                                                              }}
                                                                          >
                                                                              Cancel
                                                                          </button> */}
                                                                      </div>

                                                                  </form>
                                                              </div>
                                                          )}

                                                          {/* Display Replies */}
                                                          {data.replys.map((reply, index) => (
                                                              <div className="d-flex mt-3 p-3 rounded-3  bg-info-subtle" key={`${reply.id}-${index}`}>
                                                                  <div className="flex-shrink-0">
                                                                      <img src={reply.documentPath || NoImage} alt="" className="rounded-circle avatar-xs me-2" />
                                                                  </div>
                                                                  <div className="flex-grow-1 ms-3">
                                                                      <h5 className="fs-13">
                                                                          {reply.userName || reply.customerName}{" "}
                                                                          <small className="text-muted">{formatDateString(reply.createdDate)}</small>
                                                                      </h5>
                                                                      <div className="text-muted ticket-chat-box mb-0">
                                                                          <div dangerouslySetInnerHTML={{ __html: reply.message }} />
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          ))}
                                                      </div>
                                                  </div>
                                              ))}
                                              <div ref={chatEndRef} />
                                          </SimpleBar>

                                          {/* Main CKEditor for new messages, only visible if not replying */}
                                          {!isReplying && ticketDetails?.status !="3" && (ticketDetails?.assignTo == userInfo?.id || userInfo?.isCoreTeam =="1" || userInfo?.role?.isAdmin =="1") &&(
                                              <div className="row g-3 mt-4">
                                                  <div className="col-lg-12">
                                                      <label htmlFor="message-editor" className="form-label mb-3">Message</label>
                                                      <TicketCKEditor
                                                          value={formik.values.message}
                                                          onChange={(data) => formik.setFieldValue("message", data)}
                                                          onBlur={() => formik.setFieldTouched("message", true)}
                                                          placeholder="Enter your message"
                                                          ref={editorRef}
                                                      />
                                                      {formik.touched.message && formik.errors.message && (
                                                          <div className="text-danger">{formik.errors.message}</div>
                                                      )}
                                                      <div className="text-end mt-2">
                                                          <button
                                                              type="submit"
                                                              className="btn btn-primary"
                                                              onClick={formik.handleSubmit}
                                                              disabled={loading}
                                                          >
                                                              {loading ? (
                                                                  <>
                                                                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" className="fs-13" />
                                                                      <span> Submitting...</span>
                                                                  </>
                                                              ) : (
                                                                  "Submit"
                                                              )}
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                              <div className="col-xxl-3">
                                  <div className="card">
                                      <div className="card-header">
                                          <h5 className="card-title mb-0">
                                              Ticket Details
                                          </h5>
                                      </div>
                                      <div className="card-body">
                                          <div className="table-responsive table-card">
                                              <table className="table table-borderless align-middle mb-0">
                                                  <tbody>
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Ticket{" "}
                                                          </td>
                                                          <td>
                                                              {" "}
                                                              #{" "}
                                                              {
                                                                  ticketDetails?.ticketId
                                                              }{" "}
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Department{" "}
                                                          </td>
                                                          <td>
                                                              {
                                                                  ticketDetails
                                                                      ?.departmentData
                                                                      ?.departmentName
                                                              }
                                                          </td>
                                                      </tr>
                                                      {ticketDetails
                                                          ?.serviceData
                                                          ?.serviceName && (
                                                          <tr>
                                                              <td className="fw-medium">
                                                                  {" "}
                                                                  Service{" "}
                                                              </td>
                                                              <td>
                                                                  {" "}
                                                                  {
                                                                      ticketDetails
                                                                          ?.serviceData
                                                                          ?.serviceName
                                                                  }{" "}
                                                              </td>
                                                          </tr>
                                                      )}
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Assigned To:{" "}
                                                          </td>
                                                          <td>
                                                              <div className="avatar-group">
                                                                  <div
                                                                      className="avatar-group-item border-0 d-flex align-items-center"
                                                                      data-bs-toggle="tooltip"
                                                                      data-bs-placement="top"
                                                                      data-bs-trigger="hover"
                                                                      data-bs-original-title="Erica Kernan">
                                                                      <img
                                                                          src={
                                                                              ticketDetails?.userData?.documentData?.documentPath ||
                                                                              NoImage
                                                                          }
                                                                          alt=""
                                                                          className="rounded-circle avatar-xs me-2"
                                                                      />
                                                                      <div>
                                                                          {
                                                                              ticketDetails
                                                                                  ?.userData
                                                                                  ?.userName
                                                                          }
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Priority{" "}
                                                          </td>
                                                          <td>
                                                              <div
                                                                  className="badge pt-1"
                                                                  style={getPriorityStyle(
                                                                      parseInt(
                                                                          ticketDetails?.priority
                                                                      )
                                                                  )}>
                                                                  {getPriorityLabel(
                                                                      parseInt(
                                                                          ticketDetails?.priority
                                                                      )
                                                                  )}
                                                              </div>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                               Status{" "}
                                                          </td>
                                                              <td>
                                                                  <div className="fw-medium">
                                                                  <>
                                                                            {ticketDetails?.status ===
                                                                                "0" && (
                                                                                    <div className="px-3 badge border border-warning text-warning bg-soft-warning fs-13 p-2 pe-none">
                                                                                        <span className="">
                                                                                            Pending
                                                                                        </span>
                                                                                    </div>
                                                                                )}{" "}
                                                                            {ticketDetails?.status ===
                                                                                "1" && (
                                                                                    <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                        <span className="">
                                                                                            Inprogress
                                                                                        </span>
                                                                                    </div>
                                                                                )}{" "}
                                                                            {ticketDetails?.status ===
                                                                                "2" && (
                                                                                    <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                        <span className="">
                                                                                            Escalated
                                                                                        </span>
                                                                                    </div>
                                                                                )}{" "}
                                                                            {ticketDetails?.status ===
                                                                                "3" && (
                                                                                    <div className="px-3 badge border border-success text-success bg-soft-success fs-13 p-2 pe-none">
                                                                                        <span className="">
                                                                                            Closed
                                                                                        </span>
                                                                                    </div>
                                                                                )}{" "}

                                                                            {ticketDetails?.status ===
                                                                                "4" && (
                                                                                    <div className="px-3 badge border border-info text-info bg-soft-info fs-13 p-2 pe-none">
                                                                                        <span className="">
                                                                                            Reopened
                                                                                        </span>
                                                                                    </div>
                                                                                )}{" "}
                                                                        </>
                                                                  </div>
                                                              </td>
                                                        
                                                      </tr>
                                                      {(userDecryptData?.data?.isCoreTeam =="1" ||
                                                          assignToPermission || userDecryptData?.data.id == ticketDetails?.assignTo) && (
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Update Status:{" "}
                                                          </td>
                                                         
                                                              <td>
                                                                  <Select
                                                                       isDisabled={!ticketDetails.assignTo || ticketDetails.status =="3"}
                                                                      menuPosition="fixed"
                                                                      value={statusOptions(ticketDetails?.status).find(
                                                                          (
                                                                              option
                                                                          ) =>
                                                                              option.value ===
                                                                              ticketDetails?.status?.toString()
                                                                      )}
                                                                      onChange={(
                                                                          selectedOption
                                                                      ) => {
                                                                          updateStatus(
                                                                              {
                                                                                  target: {
                                                                                      value: selectedOption.value,
                                                                                  },
                                                                              },
                                                                              ticketDetails?.id
                                                                          );
                                                                      }}
                                                                      options={
                                                                          statusOptions(ticketDetails?.status)
                                                                      }
                                                                      placeholder="Select Status"
                                                                      isSearchable={
                                                                          false
                                                                      }
                                                                      styles={{
                                                                          control:
                                                                              (
                                                                                  provided
                                                                              ) => ({
                                                                                  ...provided,
                                                                                  cursor: "pointer",
                                                                              }),
                                                                          menu: (
                                                                              provided
                                                                          ) => ({
                                                                              ...provided,
                                                                              cursor: "pointer",
                                                                          }),
                                                                          option: (
                                                                              provided
                                                                          ) => ({
                                                                              ...provided,
                                                                              cursor: "pointer",
                                                                          }),
                                                                      }}
                                                                  />
                                                              </td>     
                                                      </tr>
                                                      ) }
                                                      <tr>
                                                          <td className="fw-medium">
                                                              {" "}
                                                              Last Activity{" "}
                                                          </td>
                                                          <td>
                                                              {formatRelativeTime(
                                                                  lastActivity
                                                              )}
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="card">
                                      <div className="card-header">
                                          <h6 className="card-title fw-semibold mb-0">
                                              Files Attachment
                                          </h6>
                                      </div>
                                      <div className="card-body">
                                          <div className="d-flex align-items-center border border-dashed p-2 rounded">
                                              <div className="flex-shrink-0 avatar-sm">
                                                  <div className="avatar-title bg-light rounded">
                                                      <i className="ri-file-zip-line fs-20 text-primary"></i>
                                                  </div>
                                              </div>
                                              <div className="flex-grow-1 ms-3">
                                                  <h6 className="mb-1">
                                                      <div className="link-secondary">
                                                          {
                                                              ticketDetails
                                                                  ?.documentData
                                                                  ?.viewDocumentName
                                                          }
                                                      </div>
                                                  </h6>
                                                  <small className="text-muted">
                                                      {formatFileSize(
                                                          ticketDetails
                                                              ?.documentData
                                                              ?.fileSize
                                                      )}
                                                  </small>
                                              </div>
                                              <div className="hstack gap-3 fs-16">
                                                  <div
                                                      className="text-muted"
                                                      title="Download"
                                                      onClick={() =>
                                                          handleDownload(
                                                            ticketDetails
                                                            ?.documentData?.documentPath,
                                                            ticketDetails
                                                            ?.documentData?.viewDocumentName ||
                                                                  "image.jpg"
                                                          )
                                                      }>
                                                      <i className="ri-download-2-line cursor-pointer"></i>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  {openModel ? (
                      <TicketLogHistory
                          openModel={openModel}
                          handleCloseModel={handleCloseModel}
                          ticketLogs={ticketLogs}
                          formatDateString={
                              formatDateString
                          }/>
                  ) : null}
              </div>
          </div>
          <ScrollToTop />
      </>
  );
};

export default TicketsDetails;
