import React from "react";
// import { userMenu } from "./Menus/userMenu";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "../../../styles/Layout.css";

const Sidebar = () => {
  //GET USER STATE
  const { user } = useSelector((state) => state.auth);

  const location = useLocation();

  return (
    <div>
      <div className="sidebar">
        <div className="menu">
          {user?.role === "organisation" && (
            <>
              <div
                className={`menu-item ${location.pathname === "/" && "active"}`}
              >
                <i className="fa-solid fa-warehouse"></i>
                <Link to="/">Inventory</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/donar" && "active"
                  }`}
              >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donar">Donar</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/hospital" && "active"
                  }`}
              >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/hospital">Hospital</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/interested-donors" && "active"
                  }`}
              >
                <i className="fa-solid fa-heart-pulse"></i>
                <Link to="/interested-donors">Interested</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/org-requests" && "active"
                  }`}
              >
                <i className="fa-solid fa-file-medical"></i>
                <Link to="/org-requests">Blood Requests</Link>
              </div>
            </>
          )}
          {user?.role === "admin" && (
            <>
              <div
                className={`menu-item ${location.pathname === "/donar-list" && "active"
                  }`}
              >
                <i className="fa-solid fa-warehouse"></i>
                <Link to="/donar-list">Donar List</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/hospital-list" && "active"
                  }`}
              >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/hospital-list">Hospital List</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/org-list" && "active"
                  }`}
              >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/org-list">Organisation List</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/admin/account-requests" && "active"
                  }`}
              >
                <i className="fa-solid fa-user-plus"></i>
                <Link to="/admin/account-requests">Account Requests</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/requests" && "active"
                  }`}
              >
                <i className="fa-solid fa-file-medical"></i>
                <Link to="/requests">Blood Requests</Link>
              </div>
            </>
          )}
          {(user?.role === "donar" || user?.role === "hospital") && (
            <div
              className={`menu-item ${location.pathname === "/org-list" && "active"
                }`}
            >
              <i className="fa-sharp fa-solid fa-building-ngo"></i>
              <Link to="/org-list">Organisation List</Link>
            </div>
          )}
          {user?.role === "hospital" && (
            <>
              <div
                className={`menu-item ${location.pathname === "/request-supply" && "active"
                  }`}
              >
                <i className="fa-solid fa-file-medical"></i>
                <Link to="/request-supply">Request Supply</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/blood-receive" && "active"
                  }`}
              >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/blood-receive">Blood Confirmation</Link>
              </div>

              <div
                className={`menu-item ${location.pathname === "/org-requests" && "active"
                  }`}
              >
                <i className="fa-solid fa-file-medical"></i>
                <Link to="/org-requests">Blood Requests</Link>
              </div>
            </>
          )}
          {user?.role === "donar" && (
            <>
              <div
                className={`menu-item ${location.pathname === "/donation" && "active"
                  }`}
              >
                <i className="fa-sharp fa-solid fa-building-ngo"></i>
                <Link to="/donation">Donation</Link>
              </div>
              <div
                className={`menu-item ${location.pathname === "/search-hospitals" && "active"
                  }`}
              >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/search-hospitals">Search Hospitals</Link>
              </div>
            </>
          )}
          {/* ANALYTICS LINK - REMOVED FOR ADMIN */}
          {(user?.role === "organisation" || user?.role === "hospital") && (
            <div
              className={`menu-item ${location.pathname === "/analytics" && "active"
                }`}
            >
              <i className="fa-solid fa-chart-bar"></i>
              <Link to="/analytics">Analytics</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Sidebar;
