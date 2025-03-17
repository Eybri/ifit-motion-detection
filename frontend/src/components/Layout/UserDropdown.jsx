import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";

// Ensure Bootstrap Icons are included in your project
// Add this link to your public/index.html or main HTML file:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

const UserDropdown = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
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
    }
  };

  if (!isAuthenticated() || !user) return null;

  // Mock notifications data (replace with real data from your backend)
  const notifications = [
    { id: 1, message: "You have a new message", timestamp: "2 hours ago" },
    { id: 2, message: "Your order has been shipped", timestamp: "1 day ago" },
    { id: 3, message: "Reminder: Meeting at 3 PM", timestamp: "3 days ago" },
  ];

  return (
    <div className="d-flex align-items-center">
      {/* Notification Dropdown */}
      {/* <div className="dropdown me-3">
        <button
          className="btn border-0 bg-transparent p-0"
          id="notificationDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-bell-fill" style={{ fontSize: "1.2rem", color: "#526E48" }}></i>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="notificationDropdown">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownItem key={notification.id}>
                <div className="dropdown-item">
                  <div>{notification.message}</div>
                  <small className="text-muted">{notification.timestamp}</small>
                </div>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem>
              <div className="dropdown-item text-muted">No new notifications</div>
            </DropdownItem>
          )}
        </ul>
      </div> */}

      {/* User Dropdown */}
      <div className="dropdown">
        <button
          className="btn dropdown-toggle d-flex align-items-center border-0 bg-transparent"
          id="userDropdown"
          data-bs-toggle="dropdown"
        >
          <UserAvatar src={user.image || "/images/default.jpg"} alt={user.name || "User"} />
          <UserName>{user.name || "User"}</UserName>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
          <DropdownItem>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </DropdownItem>
        </ul>
      </div>
    </div>
  );
};

export default UserDropdown;

// Styled Components
const UserAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 2px solid #8686AC;
  margin-right: 8px;
`;

const UserName = styled.span`
  font-weight: 700;
  color: #526E48;
`;

const DropdownItem = styled.li`
  .dropdown-item {
    font-weight: 700;
    color: #526E48;
    &:hover {
      background: #526E48;
      color: white;
    }
  }
`;