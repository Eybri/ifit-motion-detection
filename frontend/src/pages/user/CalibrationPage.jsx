import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getUserId } from "../../utils/auth";
import Loader from '../../components/Layout/Loader';

const CalibrationPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [liveFrame, setLiveFrame] = useState(null);
  const [distance, setDistance] = useState(0);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("video_frame", (data) => {
      setLiveFrame(data.frame);
      setIsLoading(false);
    });

    newSocket.on("calibration_data", (data) => {
      setDistance(data.distance);
      if (data.distance < 0.1) {
        setIsCalibrated(true); // User is in the correct position
      }
    });

    newSocket.on("calibration_complete", () => {
      navigate(`/pose-comparison/${videoId}`); // Navigate to the comparison page
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, videoId]);

  const startCalibration = async () => {
    const userId = getUserId();
    if (!userId) {
      console.error("User ID not found in session storage");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/start_calibration", {
        video_id: videoId,
        user_id: userId,
      });
      if (response.status === 200) {
        console.log("Calibration started");
      }
    } catch (error) {
      console.error("Error starting calibration", error);
      setIsLoading(false);
    }
  };

  // Inline styles
  const styles = {
    calibrationPage: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      backgroundImage: "url('/images/GifBG.gif')", // Add background image
      backgroundSize: "cover", // Ensure the image covers the entire page
      backgroundPosition: "center", // Center the background image
      backgroundRepeat: "no-repeat", // Prevent the image from repeating
      padding: "20px",
    },
    frameContainer: {
      marginBottom: "20px",
    },
    liveFrame: {
      maxWidth: "100%",
      height: "auto",
      border: "2px solid #ccc",
      borderRadius: "10px",
    },
    controls: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "15px",
      backgroundColor: "rgba(252, 225, 225, 0.8)", // Add a semi-transparent white background for better readability
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
    },
    controlsH1: {
      fontSize: "24px",
      color: "#333",
      marginBottom: "10px",
    },
    controlsP: {
      fontSize: "18px",
      color: "#555",
    },
    successMessage: {
      color: "green",
      fontWeight: "bold",
    },
    startButton: {
      padding: "15px 25px",
      fontSize: "25px",
      color: "white",
      backgroundColor: "#1d2b53",
      border: "none",
      borderRadius: "32px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    startButtonHover: {
      backgroundColor: "#ff004d",
    },
    startButtonActive: {
      backgroundColor: "#ff004d",
    },
  };

  return (
    <div style={styles.calibrationPage}>
      {/* Conditionally render the frame container only if liveFrame exists */}
      {liveFrame && (
        <div style={styles.frameContainer}>
          {isLoading ? (
            <Loader />
          ) : (
            <img
              src={`data:image/jpeg;base64,${liveFrame}`}
              alt="Live Feed"
              style={styles.liveFrame}
            />
          )}
        </div>
      )}

      <div style={styles.controls}>
        <h1 style={styles.controlsH1}>Calibration: Adjust Your Position</h1>
        <p style={styles.controlsP}>Distance to correct position: {distance.toFixed(2)}</p>
        {isCalibrated && <p style={styles.successMessage}>You are in the correct position!</p>}

        <button
          style={styles.startButton}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.startButtonHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.startButton.backgroundColor)}
          onMouseDown={(e) => (e.target.style.backgroundColor = styles.startButtonActive.backgroundColor)}
          onMouseUp={(e) => (e.target.style.backgroundColor = styles.startButton.backgroundColor)}
          onClick={startCalibration}
        >
          Start Calibration
        </button>
      </div>
    </div>
  );
};

export default CalibrationPage;