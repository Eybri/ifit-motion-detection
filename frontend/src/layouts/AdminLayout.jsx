import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layout/AdminNav/Sidenav";
import UserDropdown from "../components/Layout/UserDropdown"; // Create a new component for dropdown

const styles = {
  adminLayout: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#1e1e2f",
    color: "#ffffff",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "10px 20px",
    backgroundColor: "#000",
    borderBottom: "1px solid #333",
  },
  contentWrapper: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: "250px",
    background: "linear-gradient(135deg, #2a2a40 0%, #1e1e2f 100%)",
    padding: "20px",
    boxShadow: "4px 0 12px rgba(0, 0, 0, 0.3)",
    overflowY: "auto",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#f4f4f9",
    borderTopLeftRadius: "20px",
    borderBottomLeftRadius: "20px",
    margin: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
    transition: "all 0.3s ease",
  },
  smallScreenSidebar: {
    width: "70px",
    padding: "10px",
  },
  smallScreenMainContent: {
    width: "calc(100% - 70px)",
    marginLeft: "70px",
  },
};

const AdminLayout = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.adminLayout}>
      {/* ✅ User Dropdown (Header Part) */}
      <div style={styles.header}>
        <UserDropdown />
      </div>

      <div style={styles.contentWrapper}>
        <div
          style={isSmallScreen ? styles.smallScreenSidebar : styles.sidebar}
        >
          <Sidebar />
        </div>
        <main
          style={
            isSmallScreen
              ? styles.smallScreenMainContent
              : styles.mainContent
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
