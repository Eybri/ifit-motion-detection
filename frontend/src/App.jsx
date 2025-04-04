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
import Home from './pages/user/landing/Home';
import UserProfile from './pages/user/UserProfile';
import UserVideoList from './pages/user/UserVideoList';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/Route/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import CategoryList from './pages/admin/category/CategoryList';
import UserList from './pages/admin/UserList';
import AdminProfile from './pages/admin/AdminProfile';
import UserMetrics from './pages/admin/UserMetrics';
import FeedbackList from './pages/admin/FeedbackList';
import Feedback from './pages/user/Feedback';
import Progress from './pages/user/Progress';

import VideoList from './pages/admin/video/VideoList';
import Calibration from './pages/user/CalibrationPage';
import PoseComparison from './pages/user/PoseComparison';
import AboutUs from './pages/user/AboutUs';
import LeaderBoards from './pages/user/LeaderBoards';
import History from './pages/user/HistoryResults';

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route element={<UserLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/password/forgot" element={<Forgot />} />
          <Route path="/reset-password/:token" element={<Reset />} />
        </Route>

        {/* Protected Routes for Regular Users */}
        <Route element={<UserLayout />}>
            <Route
              path="/me"
              element={
                <ProtectedRoute isUser={true}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute isUser={true}>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
            path="/leader-boards"
            element={
              <ProtectedRoute isUser={true}>
                <LeaderBoards />
              </ProtectedRoute>
            }
          />

          
          <Route
            path="/video/list"
            element={
              <ProtectedRoute isUser={true}>
                <UserVideoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare/:videoId"
            element={
              <ProtectedRoute isUser={true}>
                <Calibration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pose-comparison/:videoId"
            element={
              <ProtectedRoute isUser={true}>
                <PoseComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute isUser={true}>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute isUser={true}>
                <History />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Routes for Admin Users */}
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
            path="/admin/feedback"
            element={
              <ProtectedRoute isAdmin={true}>
                <FeedbackList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/metrics"
            element={
              <ProtectedRoute isAdmin={true}>
                <UserMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user/list"
            element={
              <ProtectedRoute isAdmin={true}>
                <UserList />
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
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />


        </Route>
      </Routes>
    </Router>
  );
};

export default App;