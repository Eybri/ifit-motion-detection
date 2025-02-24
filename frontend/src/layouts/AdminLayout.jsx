import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./../components/Layout/AdminHeader"; // Adjust the path as needed

const AdminLayout = () => {
  return (
    <div id="admin-layout">
      {/* Include the AdminHeader */}
      <AdminHeader />

      {/* Content Area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
