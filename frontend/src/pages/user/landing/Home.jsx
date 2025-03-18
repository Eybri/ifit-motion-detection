import React, { useEffect, useState } from 'react';
import './../../../css/home.css';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../../../utils/auth'; // Import the authentication utility

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated()); // Check if the user is authenticated
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in');
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('visible');
      }, index * 300); // Delay each element's appearance
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="hero-content">
          <h1>Work anywhere and whenever</h1>
          <h2>iFit simplifies your dance practice, with a central place to track and improve your performance.</h2>
          <div className="hero-buttons">
          <Link to="/video/list" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* What is IFIT Section */}
      <section className="what-is-ifit fade-in">
        <h2>What is iFit?</h2>
        <div className="content">
          <p>iFit is an advanced interactive fitness technology designed to elevate your workout experience through virtual coaching, real-time performance tracking, and personalized training programs. Whether you're focusing on dance, cardio, strength training, or general fitness, iFit adapts to your goals by offering expert-led workouts tailored to your needs. The system seamlessly syncs with smart equipment, automatically adjusting settings such as speed, resistance, and incline to match your selected workout intensity. With access to a vast library of on-demand and live classes, iFit keeps you engaged, motivated, and constantly challenged, making every session both dynamic and effective.</p>
          <img src="/images/HomeImage.gif" alt="iFit" className="ifit-image" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works fade-in">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>Set Up</h3>
            <p>Enhance your dance studio or home gym with the iFit system, an interactive fitness technology that offers virtual coaching, real-time performance tracking, and personalized workouts. Whether you're training for dance, cardio, or strength, iFit syncs with smart equipment to provide immersive on-demand and live classes, keeping you motivated and engaged.</p>
          </div>
          <div className="step">
            <h3>Dance</h3>
            <p>Simply dance in front of the motion detection camera, and let the system track your movements in real time for an interactive and engaging experience. Whether for fitness, training, or fun, the camera captures your performance and provides feedback to enhance your sessions.</p>
          </div>
          <div className="step">
            <h3>Track</h3>
            <p>The system detects your movements with precision and instantly provides real-time feedback, helping you refine your technique, improve accuracy, and enhance overall performance effortlessly. Whether you're dancing, training, or exercising, it ensures you make the right adjustments for optimal results.</p>
          </div>
          <div className="step">
            <h3>Improve</h3>
            <p>Gain valuable insights to refine your technique, improve your posture, and enhance your overall performance with real-time analysis and personalized feedback. Whether you're practicing dance or fitness routines, the system helps you make precise adjustments for better results.</p>
          </div>
        </div>
      </section>

      {/* CTA Section
      <section className="cta fade-in">
        <h2>Ready to Take Your Dance Skills to the Next Level?</h2>
        <Link to="/signup" className="btn btn-dark text-light">
          Join Now
        </Link>
      </section> */}
    </div>
  );
};

export default Home;