import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div id="admin-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
