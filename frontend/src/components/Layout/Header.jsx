import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getToken, removeToken } from '../../utils/auth';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../App.css';

const Header = () => {
    const [user,] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Logout function
    const logoutUser = async () => {
        try {
            const accessToken = getToken(); // Get access token
            const refreshToken = localStorage.getItem('refresh_token'); // Get refresh token
    
            if (!accessToken || !refreshToken) {
                toast.error("Session expired. Please login again.");
                removeToken();
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
    
            await axios.post(
                'http://localhost:8000/api/logout/', 
                { refresh: refreshToken }, // Send refresh token
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
    
            removeToken(); // Remove token after successful logout
            localStorage.removeItem('user');
            toast.success('Logged out successfully', { position: 'bottom-right' });
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error("Logout error:", error);
    
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                removeToken();
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.message || "Logout failed");
            }
        }
    };
    
    
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <nav className={`navbar navbar-expand-lg ${isAdminRoute ? 'bg-dark admin-header' : 'bg-body-tertiary'} ${isScrolled ? 'scrolled' : ''}`}
            style={{
                borderBottom: isAdminRoute ? 'none' : 'solid 1px black',
                boxShadow: isAdminRoute ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'
            }}>
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <img src={isAdminRoute ? "../../images/admin.png" : "./images/2.png"}
                        alt="iFit Logo" className="logo" width="80" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                        {!isAdminRoute && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link header-nav active" to="/">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link header-nav" to="/">Class</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link header-nav" to="/">Review</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center ms-auto">
                        {user ? (
                            <div className="dropdown ms-3">
                                <Link to="#" className={`btn dropdown-toggle ${isAdminRoute ? 'text-light' : 'text-dark'} d-flex align-items-center`} id="dropDownMenuButton" data-bs-toggle="dropdown">
                                    <figure className="avatar avatar-nav mb-0">
                                        <img src="/images/default-avatar.png" alt={user.username} className="rounded-circle" style={{ width: '30px', height: '30px' }} />
                                    </figure>
                                    <span className="ml-2 text-light">{user.username}</span>
                                </Link>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/me"><i className="bi bi-person-fill"></i> View Profile</Link></li>
                                    {user.is_admin && <li><Link className="dropdown-item" to="/admin/dashboard"><i className="bi bi-database-fill-dash"></i> Dashboard</Link></li>}
                                    <li><button className="dropdown-item text-danger" onClick={logoutUser}><i className="bi bi-box-arrow-right"></i> Logout</button></li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-dark ms-3" id="login_btn">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
