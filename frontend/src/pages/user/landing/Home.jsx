import React, { useEffect } from 'react';
import './../../../css/home.css';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in');
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('visible');
      }, index * 300); // Delay each element's appearance
    });
  }, []);

  const settings = {
    infinite: true,
    speed: 1500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: false,
    cssEase: 'linear',
    centerMode: true,
    centerPadding: '60px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '20px',
        },
      },
    ],
  };

  const danceStyles = [
    { img: 'https://cdn.usegalileo.ai/sdxl10/2c8322e5-718a-4560-8969-9fef3d2c6c2c.png' },
    { img: 'https://cdn.usegalileo.ai/sdxl10/3bde3e72-3ca9-477b-a3ef-d0a218582831.png' },
    { img: 'https://cdn.usegalileo.ai/sdxl10/afe72876-a785-475b-ab5e-2bdf3c0dc7ca.png' },
    { img: 'https://cdn.usegalileo.ai/sdxl10/020526c8-c03e-4311-816c-fe632f0be2bc.png' },
    { img: 'https://cdn.usegalileo.ai/sdxl10/3bde3e72-3ca9-477b-a3ef-d0a218582831.png' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <h1>Transform Your Dance Practice with Smart Motion Detection</h1>
        <h2>Track your movements, improve your performance, and take your dance skills to the next level with cutting-edge motion detection technology.</h2>
        <Link to="/video/list" className="btn btn-dark text-light">
          Start Your Free Trial
        </Link>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works fade-in">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Set Up</h3>
            <p>Install the iFit system in your dance studio or home.</p>
          </div>
          <div className="step">
            <h3>2. Dance</h3>
            <p>Simply dance in front of the motion detection camera.</p>
          </div>
          <div className="step">
            <h3>3. Track</h3>
            <p>The system detects your movements and provides real-time feedback.</p>
          </div>
          <div className="step">
            <h3>4. Improve</h3>
            <p>Get insights to improve your technique, posture, and performance.</p>
          </div>
        </div>
      </section>

      {/* Infinite Autoplay Carousel */}
      <div className="carousel-container fade-in">
        <Slider {...settings}>
          {danceStyles.map((item, index) => (
            <div key={index} className="carousel-slide">
              <img src={item.img} alt={`Dance style ${index + 1}`} className="carousel-img" />
            </div>
          ))}
        </Slider>
      </div>

      {/* CTA Section */}
      <section className="cta fade-in">
        <h2>Ready to Take Your Dance Skills to the Next Level?</h2>
        <Link to="/signup" className="btn btn-dark text-light">
          Join Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
