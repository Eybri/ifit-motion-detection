// src/components/PoseComparison.js
import React, { useState } from "react";
import axios from "axios";

function PoseComparison({ videoId }) {
  const [comparisonStatus, setComparisonStatus] = useState(false);

  const startComparison = async () => {
    try {
      const response = await axios.post("http://localhost:5000/start_comparison", {
        video_id: videoId,
      });
      if (response.status === 200) {
        setComparisonStatus(true);
      }
    } catch (error) {
      console.error("Error starting comparison", error);
      setComparisonStatus(false);
    }
  };

  return (
    <div>
      <button onClick={startComparison}>Start Comparison</button>
      {comparisonStatus && <p>Comparison in progress...</p>}
    </div>
  );
}

export default PoseComparison;
