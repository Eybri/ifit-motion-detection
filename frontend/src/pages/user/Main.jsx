// src/Main.js
import React, { useState } from "react";
import UserVideoList from "./UserVideoList";
import PoseComparison from "./PoseComparison";

function Main() {
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const handleVideoSelect = (videoId) => {
    setSelectedVideoId(videoId);
  };

  return (
    <div className="Main">
      <h1>Pose Comparison Main</h1>
      {!selectedVideoId ? (
        <UserVideoList onVideoSelect={handleVideoSelect} />
      ) : (
        <PoseComparison videoId={selectedVideoId} />
      )}
    </div>
  );
}

export default Main;
