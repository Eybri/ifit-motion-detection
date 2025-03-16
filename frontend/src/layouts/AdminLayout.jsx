import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layout/AdminNav/Sidenav";
import UserDropdown from "../components/Layout/UserDropdown"; // Create a new component for dropdown

const styles = {
  adminLayout: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#FDFAF6", // Off-white background
    color: "#333", // Darker text for contrast
    flexDirection: "column",
    overflow: "hidden", // Prevent scrolling on the layout itself
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "10px 20px",
    backgroundColor: "#FFFFFF", // White header
    borderBottom: "1px solid #E4EFE7", // Light green border
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow
  },
  contentWrapper: {
    display: "flex",
    flex: 1,
    overflow: "hidden", // Prevent scrolling on the wrapper
  },
  sidebar: {
    width: "250px",
    background: "#FDFAF6", // Off-white sidebar
    padding: "20px",
    boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)", // Light shadow
    overflowY: "auto", // Allow scrolling only in the sidebar
    transition: "width 0.3s ease",
  },
  mainContent: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#FFFFFF", // White main content
    borderTopLeftRadius: "20px",
    borderBottomLeftRadius: "20px",
    margin: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Light shadow
    overflowY: "auto", // Allow scrolling only in the main content
    transition: "all 0.3s ease",
  },
  minimizedSidebar: {
    width: "80px",
    padding: "10px",
  },
  minimizedMainContent: {
    marginLeft: "80px",
  },
};

const AdminLayout = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth <= 768
  );
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div style={styles.adminLayout}>
      {/* ✅ User Dropdown (Header Part) */}
      <div style={styles.header}>
        <UserDropdown />
      </div>

      <div style={styles.contentWrapper}>
        <div
          style={{
            ...styles.sidebar,
            ...(isMinimized ? styles.minimizedSidebar : {}),
          }}
        >
          <Sidebar isMinimized={isMinimized} toggleMinimize={toggleMinimize} />
        </div>
        <main
          style={{
            ...styles.mainContent,
            ...(isMinimized ? styles.minimizedMainContent : {}),
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;