import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../../utils/auth";
import { jwtDecode } from "jwt-decode";
import { FaHome, FaChartBar, FaUser, FaSignOutAlt, FaPlayCircle, FaBars } from "react-icons/fa";
import Loader from "../Loader";
import { Menu, MenuItem, IconButton, Avatar } from "@mui/material";
import { useState as useMUIState } from "react";

const Sidenav = ({ isMinimized, toggleMinimize }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useMUIState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = getToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            clearAuth();
            navigate("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          clearAuth();
          navigate("/login");
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No token found");

      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) return <Loader />;

  const sidebarStyles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#FDFAF6", // Off-white background
      color: "#333", // Darker text for contrast
      fontFamily: "'Poppins', sans-serif", // Google Font
    },
    sidebar: {
      width: isMinimized ? "80px" : "260px",
      background: "#FDFAF6", // Off-white sidebar
      padding: "24px 16px",
      boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)", // Light shadow
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "fixed",
      left: "0",
      top: "0",
      bottom: "0",
      zIndex: 10,
      transition: "width 0.3s ease",
    },
    logo: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#99BC85", // Green color for logo
      textAlign: "center",
      marginBottom: "40px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      animation: "fadeIn 0.6s ease",
      display: isMinimized ? "none" : "block",
    },
    navItem: {
      padding: "14px 20px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#555", // Darker text for visibility
      textDecoration: "none",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
      boxShadow: "inset 0 0 0 transparent",
      overflow: "hidden",
    },
    navItemHover: {
      backgroundColor: "#E4EFE7", // Light green on hover
      color: "#99BC85", // Green text on hover
      transform: "translateX(10px) scale(1.05)",
      boxShadow: "inset 4px 0 0 #99BC85", // Green accent on hover
    },
    activeLink: {
      backgroundColor: "#99BC85", // Green background for active link
      color: "#FDFAF6", // Off-white text for active link
      fontWeight: "600",
      transform: "translateX(5px) scale(1.05)",
      boxShadow: "inset 4px 0 0 #FDFAF6",
    },
    icon: {
      marginRight: isMinimized ? "0" : "12px",
      fontSize: "20px",
    },
    userSection: {
      display: "flex",
      alignItems: "center",
      padding: "16px",
      backgroundColor: "#FAF1E6", // Light beige background
      borderRadius: "12px",
      marginTop: "auto",
    },
    avatar: {
      marginRight: "12px",
    },
    userInfo: {
      display: isMinimized ? "none" : "flex",
      flexDirection: "column",
    },
    userName: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#333", // Darker text for visibility
    },
    userRole: {
      fontSize: "14px",
      color: "#777", // Lighter text for role
    },
    toggleButton: {
      position: "absolute",
      top: "20px",
      right: "-20px",
      backgroundColor: "#99BC85", // Green button
      color: "#FDFAF6", // Off-white icon
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      zIndex: 1000,
    },
  };

  return (
    <div style={sidebarStyles.container}>
      <div style={sidebarStyles.sidebar}>
        <div style={sidebarStyles.toggleButton} onClick={toggleMinimize}>
          <FaBars />
        </div>
        <div>
          <div style={sidebarStyles.logo}>I-FIT</div>
          <nav>
            {[
              { to: "/admin/dashboard", label: "Dashboard", icon: <FaHome /> },
              { to: "/admin/user/list", label: "Accounts", icon: <FaUser /> },
              { to: "/admin/category/list", label: "Categories", icon: <FaChartBar /> },
              { to: "/admin/video/list", label: "Videos", icon: <FaPlayCircle /> },
            ].map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  ...sidebarStyles.navItem,
                  ...(location.pathname === to ? sidebarStyles.activeLink : {}),
                  ...(hoveredItem === to ? sidebarStyles.navItemHover : {}),
                }}
                onMouseEnter={() => setHoveredItem(to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span style={sidebarStyles.icon}>{icon}</span>
                {!isMinimized && label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={sidebarStyles.userSection}>
          <Avatar style={sidebarStyles.avatar} src={user?.avatar} />
          <div style={sidebarStyles.userInfo}>
            <div style={sidebarStyles.userName}>{user?.name}</div>
            <div style={sidebarStyles.userRole}>{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidenav;