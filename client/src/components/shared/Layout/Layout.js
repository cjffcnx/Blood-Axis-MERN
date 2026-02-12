import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <>
      <div className="header">
        <Header />
      </div>
      <div className="row g-0 layout-row">
        <div className="col-md-3 layout-sidebar-col">
          <Sidebar />
        </div>
        <div className="col-md-9 layout-content-col">{children}</div>
      </div>
    </>
  );
};

export default Layout;
