import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/shared/Layout/Layout";
import { useSelector } from "react-redux";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import "./AdminHome.css";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);

  const quickActions = [
    {
      title: "Inventory Overview",
      desc: "Review stock levels, recent entries, and alerts.",
      to: "/home",
      icon: <Inventory2OutlinedIcon fontSize="inherit" />,
    },
    {
      title: "IN / OUT Transactions",
      desc: "Track all inbound and outbound blood units.",
      to: "/requests",
      icon: <SwapHorizOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Dispatch Requests",
      desc: "Approve and fulfill hospital blood requests.",
      to: "/org-requests",
      icon: <LocalShippingOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Manage Donors",
      desc: "View donors and maintain donor records.",
      to: "/donar-list",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Manage Hospitals",
      desc: "Review hospital profiles and access.",
      to: "/hospital-list",
      icon: <GroupOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Approve Accounts",
      desc: "Handle pending registration approvals.",
      to: "/admin/account-requests",
      icon: <HowToRegOutlinedIcon fontSize="inherit" />,
    },
  ];

  const capabilities = [
    {
      title: "Inventory Control",
      desc: "Keep blood stock balanced across all groups and locations.",
      icon: <Inventory2OutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Compliance & Safety",
      desc: "Ensure approvals follow verification and eligibility checks.",
      icon: <AssignmentTurnedInOutlinedIcon fontSize="inherit" />,
    },
    {
      title: "Operational Oversight",
      desc: "Coordinate requests, dispatch, and reporting workflows.",
      icon: <SwapHorizOutlinedIcon fontSize="inherit" />,
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
                Keep the blood bank running smoothly with fast approvals, clear
                oversight, and smart inventory control.
              </p>
            </div>
            <div className="admin-hero-panel">
              <div className="admin-hero-stat">
                <span>Critical Tasks</span>
                <strong>Approvals</strong>
                <small>Account + request checks</small>
              </div>
              <div className="admin-hero-stat">
                <span>Daily Focus</span>
                <strong>Stock & Dispatch</strong>
                <small>Balance supply with demand</small>
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
