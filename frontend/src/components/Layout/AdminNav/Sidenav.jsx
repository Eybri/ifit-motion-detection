import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../../utils/auth";
import { jwtDecode } from "jwt-decode";
import { FaHome, FaChartBar, FaUser, FaSignOutAlt, FaPlayCircle } from "react-icons/fa";
import Loader from "../Loader";
import { Menu, MenuItem, IconButton, Avatar } from "@mui/material";
import { useState as useMUIState } from "react";

const Sidenav = () => {
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
  const [hoveredItem, setHoveredItem] = useState(null); // State to track hovered item
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
      backgroundColor: "#1e1e1e",
      color: "#fff",
      fontFamily: "'Poppins', sans-serif",
    },
    sidebar: {
      width: "260px",
      background: "linear-gradient(135deg, #121212 30%, #1e1e1e 100%)",
      padding: "24px 16px",
      boxShadow: "4px 0 12px rgba(0, 0, 0, 0.5)",
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
      color: "#4CAF50",
      textAlign: "center",
      marginBottom: "40px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      animation: "fadeIn 0.6s ease",
    },
    navItem: {
      padding: "14px 20px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#b0b0b0",
      textDecoration: "none",
      transition: "all 0.3s ease",
      cursor: "pointer",
      position: "relative",
      boxShadow: "inset 0 0 0 transparent",
      overflow: "hidden",
    },
    navItemHover: {
      backgroundColor: "#292929",
      color: "#4CAF50",
      transform: "translateX(10px) scale(1.05)",
      boxShadow: "inset 4px 0 0 #4CAF50",
    },
    activeLink: {
      backgroundColor: "#4CAF50",
      color: "#fff",
      fontWeight: "600",
      transform: "translateX(5px) scale(1.05)",
      boxShadow: "inset 4px 0 0 #fff",
    },
    icon: {
      marginRight: "12px",
      fontSize: "20px",
    },
  };

  return (
    <div style={sidebarStyles.container}>
      <div style={sidebarStyles.sidebar}>
        <div>
          <div style={sidebarStyles.logo}>I-FIT</div>
          <nav>
            {[
              { to: "/admin/dashboard", label: "Dashboard", icon: <FaHome /> },
              { to: "/admin/user/list", label: "Users", icon: <FaUser /> },
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
                onMouseEnter={() => setHoveredItem(to)} // Set hovered item
                onMouseLeave={() => setHoveredItem(null)} // Clear hovered item
              >
                <span style={sidebarStyles.icon}>{icon}</span> {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidenav;