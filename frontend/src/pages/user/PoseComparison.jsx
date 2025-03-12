import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getUserId } from "../../utils/auth";
import "./../../css/PoseComparisonPage.css"; // Import a CSS file for styling

const PoseComparisonPage = () => {
  const { videoId } = useParams();
  const [comparisonStatus, setComparisonStatus] = useState(false);
  const [liveFrame, setLiveFrame] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize SocketIO connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Listen for video frames
    newSocket.on("video_frame", (data) => {
      setLiveFrame(data.frame);
    });

    // Listen for scores
    newSocket.on("score_update", (data) => {
      setScore(data.score);
      setFeedback(data.feedback);
    });

    // Listen for comparison completion
    newSocket.on("comparison_complete", (data) => {
      setComparisonStatus(false);
      setLiveFrame(null); // Clear the live frame
      alert(`Comparison complete! Final Score: ${data.final_score.toFixed(2)}%`);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startComparison = async () => {
    const userId = getUserId();
    if (!userId) {
      console.error("User ID not found in session storage");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/start_comparison", {
        video_id: videoId,
        user_id: userId,
      });
      if (response.status === 200) {
        setComparisonStatus(true);
      }
    } catch (error) {
      console.error("Error starting comparison", error);
      setComparisonStatus(false);
    }
  };

  const stopComparison = () => {
    if (socket) {
      socket.emit("stop_comparison");
      setComparisonStatus(false);
      setLiveFrame(null); // Clear the live frame
    }
  };

  return (
    <div className="pose-comparison-page">
      <div className="header">
        <h1>Pose Comparison</h1>
        <div className="controls">
          {!comparisonStatus ? (
            <button className="start-button" onClick={startComparison}>
              Start Comparison
            </button>
          ) : (
            <button className="stop-button" onClick={stopComparison}>
              Stop Comparison
            </button>
          )}
        </div>
      </div>

      {comparisonStatus && (
        <div className="comparison-results">
          <div className="frame-container">
            {liveFrame && (
              <img
                src={`data:image/jpeg;base64,${liveFrame}`}
                alt="Live Comparison"
                className="live-frame"
              />
            )}
          </div>
          <div className="score-feedback">
            <h2 className="score">Score: {score.toFixed(2)}%</h2>
            <h3 className="feedback">Feedback: {feedback}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoseComparisonPage;