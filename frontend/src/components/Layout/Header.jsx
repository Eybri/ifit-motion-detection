import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../utils/auth";
import { jwtDecode } from "jwt-decode";
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
  const [user, setUser] = useState(() => {
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

  // Auto logout when token expires
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = getToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
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

  if (loading) return <Loader />;

  return (
    <>
      <GlobalStyle />
      <NavContainer className={`navbar navbar-expand-lg fixed-top ${isScrolled ? "scrolled" : ""}`}>
        <div className="container">
          <NavWrapper>
            {/* Right Section: Logo */}
            <RightSection>
              <Link to="/" className="navbar-brand">
                <Logo>I-FIT</Logo>
              </Link>
            </RightSection>

            {/* Left Section: Nav Items + Login Button */}
            <LeftSection>
              <ul className="navbar-nav">
                {!isAdminRoute && (
                  <>
                    <NavItem>
                      <Link className="nav-link" to="/">Home</Link>
                    </NavItem>
                    <NavItem>
                      <Link className="nav-link" to="/leader-boards">Leaderboards</Link>
                    </NavItem>
                    <NavItem>
                      <Link className="nav-link" to="/aboutus">About Us</Link>
                    </NavItem>
                    <NavItem>
                      <Link className="nav-link" to="/feedback">Feedback</Link>
                    </NavItem>
                  </>
                )}
              </ul>

              {/* Login Button */}
              {isAuthenticated() && user ? (
                <div className="dropdown">
                  <button className="btn dropdown-toggle d-flex align-items-center border-0 bg-transparent" id="dropdownMenuButton" data-bs-toggle="dropdown">
                    <UserAvatar src={user.image || "/images/default.jpg"} alt={user.name || "User"} />
                    <UserName>{user.name || "User"}</UserName>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <DropdownItem>
                      <Link className="dropdown-item" to="/me">Profile</Link>
                    </DropdownItem>
                    {user.is_admin && (
                      <DropdownItem>
                        <Link className="dropdown-item" to="/admin/dashboard">Dashboard</Link>
                      </DropdownItem>
                    )}
                    <DropdownItem>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                    </DropdownItem>
                  </ul>
                </div>
              ) : (
                <LoginButton to="/login">Login</LoginButton>
              )}
            </LeftSection>
          </NavWrapper>
        </div>
      </NavContainer>
    </>
  );
};

export default Header;

// Styled Components
const NavContainer = styled.nav`
  background-color: #FAF1E6;
  opacity: 0.9;
  transition: all 0.3s ease-in-out;
  font-family: "Montserrat", sans-serif;
  padding: 10px 5%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */
`;

const NavWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* Space between left and right sections */
  align-items: center;
  width: 100%;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1D2B53;

  &:hover {
    color: #FF004D;
  }
`;

const NavItem = styled.li`
  .nav-link {
    font-weight: 700;
    color: #1D2B53;
    text-transform: uppercase;
    transition: color 0.3s ease;

    &:hover {
      color: #FF004D;
    }
  }
`;

const UserAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 2px solid #1D2B53;
  margin-right: 8px;
`;

const UserName = styled.span`
  font-weight: 700;
  color: #1D2B53;
`;

const DropdownItem = styled.li`
  .dropdown-item {
    font-weight: 700;
    color: #1D2B53;
    &:hover {
      background: #1D2B53;
      color: white;
    }
  }
`;

const LoginButton = styled(Link)`
  background: #7E2553;
  color: white;
  border: none;
  padding: 10px 25px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 30px;
  transition: background 0.3s ease, box-shadow 0.3s ease; /* Add transition for box-shadow */
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */

  &:hover {
    background: #FF004D;
    color: white;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Enhance shadow effect on hover */
  }
`;