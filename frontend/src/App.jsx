import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import './App.css';
import Register from './pages/validation/Register';
import Forgot from './pages/validation/ForgotPassword';
import Reset from './pages/validation/ResetPassword';
import Login from './pages/validation/Login';
import Home from './pages/user/Home';
import UserProfile from './pages/user/UserProfile';
import VideoProcess from './pages/user/VideoProcess';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/Route/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import CategoryList from './pages/admin/category/CategoryList';
import VideoList from './pages/admin/video/VideoList';

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* User Layout */}
        <Route element={<UserLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<UserProfile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/upload/video" element={<VideoProcess />} />
          <Route path="/password/forgot" element={<Forgot />} />
          <Route path="/reset-password/:token" element={<Reset />} />
        </Route>

        {/* Admin Layout */}
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/category/list"
            element={
              <ProtectedRoute isAdmin={true}>
                <CategoryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/video/list"
            element={
              <ProtectedRoute isAdmin={true}>
                <VideoList />
              </ProtectedRoute>
            }
          />
        </Route>
        
      </Routes>
    </Router>
  );
};

export default App;
