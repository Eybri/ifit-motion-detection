import React, { useEffect, useState } from 'react';
import './../../../css/home.css';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../../../utils/auth';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in');
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('visible');
      }, index * 300);
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="hero-content">
          <h1>Work Anywhere, Anytime</h1>
          <h2>iFit simplifies your dance practice, offering a central hub to track and improve your performance.</h2>
          <div className="hero-buttons">
            <Link to="/video/list" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* What is IFIT Section */}
      <section className="what-is-ifit fade-in">
        <h2>WHAT IS IFIT?</h2>
        <div className="content">
          <p>iFit is an advanced interactive fitness technology designed to elevate your workout experience through virtual coaching, real-time performance tracking, and personalized training programs. Whether you're focusing on dance, cardio, strength training, or general fitness, iFit adapts to your goals by offering expert-led workouts tailored to your needs.</p>
          <img src="/images/HomeImage.gif" alt="iFit" className="ifit-image" />
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="mission-vision fade-in">
        <h2>VISION & MISSION</h2>
        <p className="subtitle">What drives us and why we do it.</p>
        <div className="content">
          <div className="card">
            <h3>Our Vision 👀</h3>
            <p>To pioneer technological breakthroughs that blend science and art, creating a seamless fusion of innovation and creativity.</p>
          </div>
          <div className="card">
            <h3>Our Mission 🎯</h3>
            <p>To make cutting-edge technology accessible and usable for everyone, empowering individuals to achieve their fitness and artistic goals.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works fade-in">
        <h2>HOW IT WORKS</h2>
        <div className="steps">
          <div className="step">
            <h3>Set Up</h3>
            <p>Enhance your dance studio or home gym with the iFit system, offering virtual coaching and real-time performance tracking.</p>
          </div>
          <div className="step">
            <h3>Dance</h3>
            <p>Dance in front of the motion detection camera, and let the system track your movements in real time for an interactive experience.</p>
          </div>
          <div className="step">
            <h3>Track</h3>
            <p>The system detects your movements with precision, providing real-time feedback to refine your technique and improve accuracy.</p>
          </div>
          <div className="step">
            <h3>Improve</h3>
            <p>Gain valuable insights to refine your technique, improve posture, and enhance overall performance with personalized feedback.</p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section className="privacy-policy fade-in">
        <h2>PRIVACY POLICY</h2>
        <div className="content">
          <p>At iFit, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our services.</p>
          <div className="policy-details">
            <h3>Information We Collect</h3>
            <p>We collect personal information such as your name, email address, and payment details when you sign up for our services.</p>
            <h3>How We Use Your Information</h3>
            <p>Your information is used to deliver and improve our services, personalize your experience, and communicate with you about updates and offers.</p>
            <h3>Data Security</h3>
            <p>We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or misuse.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;