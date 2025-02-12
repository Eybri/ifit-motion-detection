import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Register from './pages/validation/Register';
import Login from './pages/validation/Login';
import Home from './pages/user/Home';

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
