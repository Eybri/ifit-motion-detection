import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, clearAuth, isAuthenticated } from "../../utils/auth";
import Loader from "../../components/Layout/Loader"; // Import your Loader component
import "../../App.css";

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
  const [loading, setLoading] = useState(false); // State for showing loader
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true); // Show loader
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }

      // Call the backend logout route
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearAuth(); // Clear auth (token and user data)
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  if (loading) {
    // Show loader during logout process
    return <Loader />;
  }

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        isAdminRoute ? "bg-dark admin-header" : "bg-white shadow-sm"
      } ${isScrolled ? "scrolled" : ""}`}
      style={{
        transition: "all 0.3s ease-in-out",
        borderBottom: isAdminRoute
          ? "none"
          : "solid 1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <img
            src={isAdminRoute ? "/images/admin.png" : "/images/2.png"}
            alt="iFit Logo"
            className="logo"
            width="70"
          />
        </Link>

        {/* Navbar Toggler for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav">
            {!isAdminRoute && (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold text-dark px-3" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-semibold text-dark px-3"
                    to="/upload/video"
                  >
                    Video Compare
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link fw-semibold text-dark px-3"
                    to="/review"
                  >
                    Review
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* User Section */}
        <div className="d-flex align-items-center">
          {isAuthenticated() && user ? (
            <div className="dropdown">
              <button
                className="btn dropdown-toggle d-flex align-items-center border-0 bg-transparent"
                id="dropDownMenuButton"
                data-bs-toggle="dropdown"
              >
                <figure className="avatar avatar-nav mb-0 me-2">
                  <img
                    src={user.image || "/images/default.jpg"}
                    alt={user.name || "User"}
                    className="rounded-circle border"
                    style={{ width: "35px", height: "35px" }}
                  />
                </figure>
                <span className="fw-semibold text-dark">
                  {user.name || "User"}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <Link className="dropdown-item" to="/me">
                    <i className="bi bi-person-circle me-2"></i>Profile
                  </Link>
                </li>
                {user.is_admin && (
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/admin/dashboard"
                    >
                      <i className="bi bi-speedometer2 me-2"></i>Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-dark ms-3 px-4 py-2 fw-semibold"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
