import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/shared/Layout/Layout";
import { useSelector } from "react-redux";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import "./AdminHome.css";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);

  const quickActions = [
    {
      title: "Manage Donors",
      desc: "View all donors, their donation history, and sort by donations or date.",
      to: "/donar-list",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Manage Hospitals",
      desc: "Review hospital profiles, contacts, and access permissions.",
      to: "/hospital-list",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Manage Organizations",
      desc: "Oversee organization accounts and their blood bank operations.",
      to: "/org-list",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Approve Accounts",
      desc: "Handle pending registration and account access requests.",
      to: "/admin/account-requests",
      icon: <HowToRegOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Certificate Requests",
      desc: "Manage donor certificates, send emails, and track approvals.",
      to: "/admin/certificate-requests",
      icon: <EmojiEventsOutlinedIcon fontSize="inherit" />,
    },
  ];

  const capabilities = [
    {
      title: "Donor Management",
      desc: "Track donation counts, manage donor information, and recognize top contributors.",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Request Processing",
      desc: "Review and approve blood requests from hospitals and organizations.",
      icon: <AssignmentTurnedInOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Certificate Awards",
      desc: "Issue recognition certificates to donors with 8+ donations.",
      icon: <EmojiEventsOutlinedIcon fontSize="inherit" />,
    },
  ];

  return (
    <Layout>
      <div className="admin-wrapper">
        <div className="admin-shell container">
          <div className="admin-hero">
            <div className="admin-hero-text">
              <p className="admin-eyebrow">Admin Command Center</p>
              <h1>
                Welcome back, <span>{user?.name || "Admin"}</span>
              </h1>
              <p className="admin-tagline">
                Keep the blood bank running smoothly with fast approvals, donor recognition,
                and intelligent request management.
              </p>
            </div>
            <div className="admin-hero-panel">
              <div className="admin-hero-stat">
                <span>Key Functions</span>
                <strong>Management & Approvals</strong>
                <small>Donors, hospitals, requests</small>
              </div>
              <div className="admin-hero-stat">
                <span>Special Feature</span>
                <strong>Donor Certificates</strong>
                <small>Recognize active donors</small>
              </div>
            </div>
          </div>

          <section className="admin-section">
            <div className="admin-section-title">
              <h2>Quick Actions</h2>
              <p>Jump straight into the most used admin workflows.</p>
            </div>
            <div className="admin-grid">
              {quickActions.map((item) => (
                <Link key={item.title} to={item.to} className="admin-action-card">
                  <div className="admin-icon">{item.icon}</div>
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.desc}</p>
                  </div>
                  <span className="admin-cta">Open</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-section">
            <div className="admin-section-title">
              <h2>Core Responsibilities</h2>
              <p>What you control in the system today.</p>
            </div>
            <div className="admin-capabilities">
              {capabilities.map((item) => (
                <div key={item.title} className="admin-capability-card">
                  <div className="admin-icon">{item.icon}</div>
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
