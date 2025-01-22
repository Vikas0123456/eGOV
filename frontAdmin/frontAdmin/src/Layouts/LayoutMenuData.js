import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//Import Icons
import FeatherIcon from "feather-icons-react";

const Navdata = () => {
  const history = useNavigate();
const [isDashboard, setIsDashboard] = useState(false);
const [isApplication, setIsApplication] = useState(false);
const [isCitizen, setIsCitizen] = useState(false);
const [isAccessRight, setIsAccessRight] = useState(false);
const [isDirectory, setIsDirectory] = useState(false);
const [isTickets, setIsTickets] = useState(false);
const [isReporting, setIsReporting] = useState(false);
const [isBanner, setIsBanner] = useState(false);
const [isFaqs, setIsFaqs] = useState(false);
const [isUpcomingEvents, setIsUpcomingEvents] = useState(false);
const [isReviewAndFeedback, setIsReviewAndFeedback] = useState(false);
const [isKnowledgeBase, setIsKnowledgeBase] = useState(false);
const [isSupport, setIsSupport] = useState(false);
const [isAuditLog, setIsAuditLog] = useState(false);

const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Access Right") {
      setIsAccessRight(false);
    }
    if (iscurrentState !== "Reporting") {
      setIsReporting(false);
    }
  }, [
    history,
    iscurrentState,
    isAccessRight,
    isReporting
  ]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "application",
      label: "Application",
      icon: <FeatherIcon icon="home" className="icon-dual" />,
      link: "/applications",
      click: function (e) {
        e.preventDefault();
        setIsApplication(!isApplication);
        setIscurrentState("Application");
        updateIconSidebar(e);
      }
    },
    {
      id: "citizen",
      label: "Citizen",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/citizen",
      click: function (e) {
        e.preventDefault();
        setIsCitizen(!isCitizen);
        setIscurrentState("Citizen");
        updateIconSidebar(e);
      },
    },
    {
      label: "pages",
      isHeader: true,
    },
    {
      id: "accessRight",
      label: "Access Right",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/#",
      click: function (e) {
        e.preventDefault();
        setIsAccessRight(!isAccessRight);
        setIscurrentState("Access Right");
        updateIconSidebar(e);
      },
      stateVariables: isAccessRight,
      subItems: [
        {
          id: "role",
          label: "Roles",
          link: "/roles",
          parentId: "accessRight",
        },
        {
          id: "users",
          label: "Users",
          link: "/users",
          parentId: "accessRight",
        },
        {
          id: "workflow",
          label: "Workflow",
          link: "/workflow",
          parentId: "accessRight",
        },
        {
          id: "department",
          label: "Departments",
          link: "/department",
          parentId: "accessRight",
        },
        {
          id: "service",
          label: "Services",
          link: "/services",
          parentId: "accessRight",
        },
      ],
    },
    {
      id: "directory",
      label: "Directory",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/directory",
      click: function (e) {
        e.preventDefault();
        setIsDirectory(!isDirectory);
        setIscurrentState("Directory");
        updateIconSidebar(e);
      },
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/support-tickets",
      click: function (e) {
        e.preventDefault();
        setIsTickets(!isTickets);
        setIscurrentState("Tickets");
        updateIconSidebar(e);
      },
    },
    {
      id: "reporting",
      label: "Reporting",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/#",
      click: function (e) {
        e.preventDefault();
        setIsReporting(!isReporting);
        setIscurrentState("Reporting");
        updateIconSidebar(e);
      },
      stateVariables: isReporting,
      subItems: [
        {
          id: "revenue",
          label: "Revenue",
          link: "/revenue",
          parentId: "reporting",
        },
        {
          id: "departmentperformance",
          label: "Department Performance",
          link: "/department-performance",
          parentId: "reporting",
        },
        {
          id: "teamperformance",
          label: "Team Performance",
          link: "/team-performance",
          parentId: "reporting",
        },
      ],
    },
    {
      id: "banner",
      label: "Banner",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/banner",
      click: function (e) {
        e.preventDefault();
        setIsBanner(!isBanner);
        setIscurrentState("Banner");
        updateIconSidebar(e);
      },
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/faq",
      click: function (e) {
        e.preventDefault();
        setIsFaqs(!isFaqs);
        setIscurrentState("FAQs");
        updateIconSidebar(e);
      },
    },
    {
      id: "upcomingEvents",
      label: "Upcoming Events",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/upcoming-events",
      click: function (e) {
        e.preventDefault();
        setIsUpcomingEvents(!isUpcomingEvents);
        setIscurrentState("Upcoming Events");
        updateIconSidebar(e);
      },
    },
    {
      id: "reviewAndFeedback",
      label: "Review and Feedback",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/user-review",
      click: function (e) {
        e.preventDefault();
        setIsReviewAndFeedback(!isReviewAndFeedback);
        setIscurrentState("Review and Feedback");
        updateIconSidebar(e);
      },
    },
    {
      id: "knowledgeBase",
      label: "Knowledge Base",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/knowledge-base",
      click: function (e) {
        e.preventDefault();
        setIsKnowledgeBase(!isKnowledgeBase);
        setIscurrentState("Knowledge Base");
        updateIconSidebar(e);
      },
    },
    {
      id: "support",
      label: "Support",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/support",
      click: function (e) {
        e.preventDefault();
        setIsSupport(!isSupport);
        setIscurrentState("Support");
        updateIconSidebar(e);
      },
    },
    {
      id: "auditLog",
      label: "Audit Log",
      icon: <FeatherIcon icon="grid" className="icon-dual" />,
      link: "/audit-log",
      click: function (e) {
        e.preventDefault();
        setIsAuditLog(!isAuditLog);
        setIscurrentState("Audit Log");
        updateIconSidebar(e);
      },
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
