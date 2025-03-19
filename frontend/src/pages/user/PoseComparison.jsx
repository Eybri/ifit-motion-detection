import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { io } from "socket.io-client";
import axios from "axios";
import { getUserId } from "../../utils/auth";
import Loader from '../../components/Layout/Loader';
import ResultsModal from './ResultModal';
import "./../../css/PoseComparisonPage.css";

const PoseComparisonPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [comparisonStatus, setComparisonStatus] = useState(false);
  const [liveFrame, setLiveFrame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("video_frame", (data) => {
      setLiveFrame(data.frame);
      setIsLoading(false);
    });

    newSocket.on("comparison_complete", (data) => {
      setComparisonStatus(false);
      setLiveFrame(null);
      setIsLoading(false);
      setResults(data);
      setShowResultsModal(true); // Show the results modal
    });

    // Automatically start comparison when the component mounts
    startComparison();

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

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const stopComparison = () => {
    if (socket) {
      socket.emit("stop_comparison");
      setComparisonStatus(false);
      setLiveFrame(null);
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowResultsModal(false); // Close the modal
    navigate("/video/list"); // Navigate to /video/list after closing the modal
  };

  return (
    <div className="pose-comparison-page">
      <div className="controls">
        <button className="stop-button" onClick={stopComparison}>
          Stop Comparison
        </button>
      </div>

      <div className="comparison-results">
        <div className="frame-container">
          {isLoading ? (
            <Loader />
          ) : liveFrame ? (
            <img
              src={`data:image/jpeg;base64,${liveFrame}`}
              alt="Live Comparison"
              className="live-frame"
            />
          ) : null}
        </div>
      </div>

      <ResultsModal
        show={showResultsModal}
        onHide={handleCloseModal} // Pass the handleCloseModal function
        results={results}
      />
    </div>
  );
};

export default PoseComparisonPage;