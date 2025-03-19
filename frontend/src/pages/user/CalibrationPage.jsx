import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getUserId } from "../../utils/auth";
import Loader from '../../components/Layout/Loader';
import "./../../css/PoseComparisonPage.css";

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

  return (
    <div className="calibration-page">
      <div className="frame-container">
        {isLoading ? (
          <Loader />
        ) : (
          liveFrame && (
            <img
              src={`data:image/jpeg;base64,${liveFrame}`}
              alt="Live Feed"
              className="live-frame"
            />
          )
        )}
      </div>

      <div className="controls">
      <h1>Calibration: Adjust Your Position</h1>
      <p>Distance to correct position: {distance.toFixed(2)}</p>
      {isCalibrated && <p className="success-message">You are in the correct position!</p>}

        <button className="start-button" onClick={startCalibration}>
          Start Calibration
        </button>
      </div>
    </div>
  );
};

export default CalibrationPage;