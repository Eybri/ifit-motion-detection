import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";
import "../../App.css";
import styled, { createGlobalStyle } from "styled-components";

// Global Font Style
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');

  body {
    font-family: "Montserrat", sans-serif;
  }
`;

const Header = () => {
  const [user,] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  if (loading) return <Loader />;

  return (
    <>
      <GlobalStyle />
      <NavContainer className={`navbar navbar-expand-lg fixed-top ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src={isAdminRoute ? "/images/admin.png" : "/images/2.png"} alt="iFit Logo" className="logo" width="100" />
          </Link>

          {/* Navbar Toggler for Mobile */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Links */}
          <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
            <ul className="navbar-nav">
              {!isAdminRoute && (
                <>
                  <NavItem>
                    <Link className="nav-link" to="/">Home</Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/upload/video">Video Compare</Link>
                  </NavItem>
                  <NavItem>
                    <Link className="nav-link" to="/review">Review</Link>
                  </NavItem>
                </>
              )}
            </ul>
          </div>

          {/* User Section */}
          <div className="d-flex align-items-center">
            {isAuthenticated() && user ? (
              <div className="dropdown">
                <button className="btn dropdown-toggle d-flex align-items-center border-0 bg-transparent" id="dropdownMenuButton" data-bs-toggle="dropdown">
                  <UserAvatar src={user.image || "/images/default.jpg"} alt={user.name || "User"} />
                  <UserName>{user.name || "User"}</UserName>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  <DropdownItem>
                    <Link className="dropdown-item" to="/me">
                      <i className="bi bi-person-circle me-2"></i>Profile
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
            ) : (
              <LoginButton to="/login">Login</LoginButton>
            )}
          </div>
        </div>
      </NavContainer>
    </>
  );
};

export default Header;

// Styled Components
const NavContainer = styled.nav`
  background-color: #F7F7F7;
  opacity: 0.9;
  transition: all 0.3s ease-in-out;
  border-bottom: solid 1px rgba(0, 0, 0, 0.1);
  font-family: "Montserrat", sans-serif;
`;

const NavItem = styled.li`
  .nav-link {
    font-weight: 700;
    color: #577D86;
    text-transform: uppercase;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
`;

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

const LoginButton = styled(Link)`
  background: #577D86;
  color: white;
  border: none;
  padding: 10px 25px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 30px;
  transition: background 0.3s ease;
  text-decoration: none;

  &:hover {
    background: #4a423e;
    color: white;
  }
`;

