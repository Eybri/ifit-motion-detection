import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";

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

  return (
    <div className="dropdown">
      <button
        className="btn dropdown-toggle d-flex align-items-center border-0 bg-transparent"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
      >
        <UserAvatar src={user.image || "/images/default.jpg"} alt={user.name || "User"} />
        <UserName>{user.name || "User"}</UserName>
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
        <DropdownItem>
          <Link className="dropdown-item" to="/me">
            <i className="bi bi-person-circle me-2"></i>Profile
          </Link>
        </DropdownItem>
        <DropdownItem>
          <Link className="dropdown-item" to="/history">
            <i className="bi bi-clock-history me-2"></i>My History
          </Link>
        </DropdownItem>
        {user.is_admin && (
          <DropdownItem>
            <Link className="dropdown-item" to="/admin/dashboard">
              <i className="bi bi-speedometer2 me-2"></i>Dashboard
            </Link>
          </DropdownItem>
        )}
        <DropdownItem>
          <button className="dropdown-item text-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </DropdownItem>
      </ul>
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
  color: #8686AC;
`;

const DropdownItem = styled.li`
  .dropdown-item {
    font-weight: 700;
    color: #8686AC;
    &:hover {
      background: #0F0E47;
      color: white;
    }
  }
`;
