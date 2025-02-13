import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Register from './pages/validation/Register';
import Login from './pages/validation/Login';
import Home from './pages/user/Home';
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
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
