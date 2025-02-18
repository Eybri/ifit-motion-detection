import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Register from './pages/validation/Register';
import Forgot from './pages/validation/ForgotPassword';
import Reset from './pages/validation/ResetPassword';
import Login from './pages/validation/Login';
import Home from './pages/user/Home';
import UserProfile from './pages/user/UserProfile';
import VideoProcess from './pages/user/VideoProcess';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const App = () => {
  return (
    <Router>
      <div id="app">
        <Header />
        <main>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/me" element={<UserProfile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/upload/video" element={<VideoProcess />} />
            <Route path="/password/forgot" element={<Forgot />} />
            <Route path="/reset-password/:token" element={<Reset />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
