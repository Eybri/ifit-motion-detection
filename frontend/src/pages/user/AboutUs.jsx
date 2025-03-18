import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaRunning, FaChartLine, FaBrain } from "react-icons/fa"; // Animated icons

const AboutUs = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <AboutContainer>
      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : -50 }}
        transition={{ duration: 1 }}
        className="about-section"
      >
        <div className="about-content">
          <div className="text-section">
            <h1>iFit</h1>
            {aboutData.map((item, index) => (
              <p key={index}>
                <motion.div
                  className="icon"
                  animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  {item.icon}
                </motion.div>
                {item.text}
              </p>
            ))}
          </div>
          <div className="image-section">
            <img src="/images/fitness-illustration.jpg" alt="Fitness Illustration" />
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: animate ? 1 : 0, y: animate ? 0 : 50 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="team-section"
      >
        <h2>Meet Our Team</h2>
        <div className="team">
          {teamMembers.map((member, index) => (
            <div className="flip-card" key={index}>
              <div className="flip-card-inner">
                {/* Front Side - Image */}
                <div className="flip-card-front">
                  <img src={member.image} alt={member.name} />
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
                {/* Back Side - Description */}
                <div className="flip-card-back">
                  <h3>{member.name}</h3>
                  <p>{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="professor-heading">Meet Our Professor</h2>
        <div className="professor">
          {professor.map((professor, index) => (
            <div className="flip-card" key={index}>
              <div className="flip-card-inner">
                {/* Front Side - Image */}
                <div className="flip-card-front">
                  <img src={professor.image} alt={professor.name} />
                  <h3>{professor.name}</h3>
                  <p>{professor.role}</p>
                </div>
                {/* Back Side - Description */}
                <div className="flip-card-back">
                  <h3>{professor.name}</h3>
                  <p>{professor.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AboutContainer>
  );
};

export default AboutUs;

// About Data (Text & Icons)
const aboutData = [
  {
    icon: <FaRunning />,
    text: "iFit is a revolutionary fitness platform designed to make exercise fun and effective. It uses AI-powered motion detection to analyze movements and track progress in real-time.",
  },
  {
    icon: <FaChartLine />,
    text: "Simply input your BMI, choose your dance category, and let the system guide you through interactive workout sessions. As you move, iFit calculates your calorie burn automatically.",
  },
  {
    icon: <FaBrain />,
    text: "iFit enhances motivation and engagement through real-time performance tracking and customized fitness plans.",
  },
];
const professor =[
  {
  name: "Pops V. Madriaga",
  role: "BSIT Professor",
  image: "/images/pops.jpg",
  description: "Ma'am Pops is a Professor at the TUP Taguig Campus who handles the 1st to 4th year students.",
  }
]
// Team Members Data
const teamMembers = [
  {
    name: "Avery Macasa",
    role: "Leader (Backend & Frontend)",
    image: "/images/avery.jpg",
    description: "Avery is the team leader, responsible for both backend and frontend development.",
  },
  {
    name: "Bryan James Batan",
    role: "Backend Developer",
    image: "/images/bryan.jpg",
    description: "Bryan specializes in backend development and database management.",
  },
  {
    name: "Tyrone Justine Medina",
    role: "Frontend Developer",
    image: "/images/tyrone.jpg",
    description: "Tyrone focuses on frontend development, ensuring a great user experience.",
  },
  {
    name: "Gelgin De Los Santos",
    role: "Documentation",
    image: "/images/gelgin.jpg",
    description: "Gelgin handles documentation, ensuring all details are well-documented.",
  },
];

// Styled Components
const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 120px auto; /* Increase the margin-top to move it downward */
  padding: 40px;
  background: transparent;
  border-radius: 15px;
  // box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: "Montserrat", sans-serif;

  /* About Section */
  .about-section {
    padding: 50px;
  }

  .about-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
  }

  .text-section {
    flex: 1;
    text-align: left;
  }

  h1 {
    font-size: 3rem;
    font-weight: 900;
    color: #1D2B53;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  p {
    font-size: 1.2rem;
    color: #555;
    line-height: 1.6;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    font-size: 3rem;
    color: #1D2B53;
  }

  .image-section {
    flex: 1;
  }

  .image-section img {
    width: 100%;
    max-width: 400px;
  }

  .professor {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 30px;
  }

  h2.professor-heading {
    margin-top: 50px; /* Adjust this value as needed */
  }

  /* Team Section */
  .team-section {
    margin-top: 50px;
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1D2B53;
    margin-bottom: 30px;
  }

  .team {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  /* Flip Card */
  .flip-card {
    background: transparent;
    width: 220px;
    height: 280px;
    perspective: 1000px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 15px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
  }

  .flip-card-front {
    background: #fff;
  }

  .flip-card-front img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
  }

  .flip-card-front h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1D2B53;
  }

  .flip-card-front p {
    font-size: 1rem;
    color: #666;
  }

  .flip-card-back {
    background: #7E2553;
    color: white;
    transform: rotateY(180deg);
  }

  .flip-card-back h3 {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .flip-card-back p {
    font-size: 1rem;
    color: white;
  }
`;