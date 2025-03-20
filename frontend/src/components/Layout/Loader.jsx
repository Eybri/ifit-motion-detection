import React, { useState, useEffect } from "react";
import './../../css/loader.css';

const Loader = () => {
  const [iconIndex, setIconIndex] = useState(0);
  
  // Array of fitness-related icons (using emoji for simplicity)
  const fitnessIcons = [
    "🏋️", // weightlifter
    "🏃", // runner
    "🚴", // cyclist
    "🧘", // yoga
    "💪", // flexed bicep
    "🥗", // salad
    "⚡", // energy
    "🏆", // trophy
  ];
  
  // Rotate through icons
  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) => (prevIndex + 1) % fitnessIcons.length);
    }, 600);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader">
      <div className="loading-screen">
        <div className="fitness-loader-container">
          <div className="fitness-icon">
            {fitnessIcons[iconIndex]}
          </div>
          <div className="boxes">
            <div className="box" style={{ backgroundColor: 'f8f9fa', border: '1px solid black' }}></div>
            <div className="box" style={{ backgroundColor: 'f8f9fa', border: '1px solid black' }}></div>
            <div className="box" style={{ backgroundColor: 'f8f9fa', border: '1px solid black' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;