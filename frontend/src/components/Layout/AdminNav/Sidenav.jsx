import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../../utils/auth";
import { jwtDecode } from "jwt-decode";
import { FaHome, FaChartBar, FaEnvelope, FaUser, FaSignOutAlt } from "react-icons/fa";
import Loader from "../Loader";
import { Menu, MenuItem, IconButton, Avatar } from "@mui/material"; // MUI components for dropdown
import { useState as useMUIState } from "react";
import styles from "./Sidenav.module.css"; // Import the CSS module

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
  const [anchorEl, setAnchorEl] = useMUIState(null); // MUI state for dropdown menu
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Auto logout when token expires
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = getToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convert to seconds
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
    const interval = setInterval(checkTokenExpiration, 60000); // Check every 60 seconds

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

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.logo}>
            <h1>I-FIT</h1>
          </div>
          <nav className={styles.navbar}>
            <ul>
                <>
                  <li><Link to="/admin/dashboard"><FaHome /> Dashboard</Link></li>
                  <li><Link to="/admin/user/list"><FaEnvelope /> User</Link></li>
                  <li><Link to="/admin/category/list"><FaChartBar /> Categories</Link></li>
                  <li><Link to="/admin/video/list"><FaEnvelope /> Video</Link></li>
                </>
          
            </ul>
          </nav>
        </div>
      </div>

      {/* Floating Header */}
      <div className={styles.floatingHeader}>
        <div className={styles.headerContent}>
          <h2>Welcome to I-FIT</h2>
          <p>Your fitness journey starts here</p>
        </div>

        {/* Profile Dropdown in Header */}
        {isAuthenticated() && user && (
          <div className={styles.profileDropdown}>
            <IconButton onClick={handleMenuOpen}>
              <Avatar src={user.profileImage} alt={user.name} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigate("/me")}>Profile</MenuItem>
              {user.is_admin && <MenuItem onClick={() => navigate("/admin/dashboard")}>Dashboard</MenuItem>}
              <MenuItem onClick={handleLogout}><FaSignOutAlt /> Logout</MenuItem>
            </Menu>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Add your main page content here */}
      </div>
    </div>
  );
};

export default Sidenav;
