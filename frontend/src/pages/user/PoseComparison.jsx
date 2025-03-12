import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getUserId } from "../../utils/auth";
import Loader from '../../components/Layout/Loader'; // Import the Loader component
import ResultsModal from './ResultModal'; // Import the ResultsModal component
import "./../../css/PoseComparisonPage.css";

const PoseComparisonPage = () => {
  const { videoId } = useParams();
  const [comparisonStatus, setComparisonStatus] = useState(false);
  const [liveFrame, setLiveFrame] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading status
  const [showResultsModal, setShowResultsModal] = useState(false); // State to control modal visibility
  const [results, setResults] = useState({}); // State to store comparison results

  useEffect(() => {
    // Initialize SocketIO connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Listen for video frames
    newSocket.on("video_frame", (data) => {
      setLiveFrame(data.frame);
      setIsLoading(false); // Stop loading when the frame is received
    });

    // Listen for comparison completion
    newSocket.on("comparison_complete", (data) => {
      setComparisonStatus(false);
      setLiveFrame(null); // Clear the live frame
      setIsLoading(false); // Stop loading when the comparison is complete
      setResults(data); // Store the results
      setShowResultsModal(true); // Show the results modal
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

    setIsLoading(true); // Start loading when comparison starts
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
      setIsLoading(false); // Stop loading if there's an error
    }
  };

  const stopComparison = () => {
    if (socket) {
      socket.emit("stop_comparison");
      setComparisonStatus(false);
      setLiveFrame(null); // Clear the live frame
      setIsLoading(false); // Stop loading when comparison is stopped
    }
  };

  const handleCloseModal = () => {
    setShowResultsModal(false); // Close the modal
  };

  return (
    <div className="pose-comparison-page">
      {!comparisonStatus ? (
        <div className="header">
          <h1>Start Dancing</h1>
          <div className="controls">
            <button className="start-button" onClick={startComparison}>
              Start Comparison
            </button>
          </div>
        </div>
      ) : (
        <div className="controls">
          <button className="stop-button" onClick={stopComparison}>
            Stop Comparison
          </button>
        </div>
      )}

      {comparisonStatus && (
        <div className="comparison-results">
          <div className="frame-container">
            {isLoading ? (
              <Loader /> // Display the Loader while loading
            ) : liveFrame ? (
              <img
                src={`data:image/jpeg;base64,${liveFrame}`}
                alt="Live Comparison"
                className="live-frame"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Results Modal */}
      <ResultsModal
        show={showResultsModal}
        onHide={handleCloseModal}
        results={results}
      />
    </div>
  );
};

export default PoseComparisonPage;