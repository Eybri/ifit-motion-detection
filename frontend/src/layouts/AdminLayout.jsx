import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layout/AdminNav/Sidenav"; // Adjust the path as needed

const AdminLayout = () => {
  return (
    <div id="admin-layout" style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
