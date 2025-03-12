import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Container, Button, Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

function VideoDetailPage() {
  const { videoId } = useParams(); // Get video ID from URL
  const [videoDetails, setVideoDetails] = useState(null);
  const [comparisonStatus, setComparisonStatus] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
      setVideoDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch video details", error);
      toast.error("Failed to fetch video details.");
    }
  };

  const startComparison = async () => {
    try {
      const response = await axios.post("http://localhost:5000/start_comparison", {
        video_id: videoId,
      });
      if (response.status === 200) {
        setComparisonStatus(true);
        toast.success("Pose comparison started!");
      }
    } catch (error) {
      console.error("Error starting comparison", error);
      setComparisonStatus(false);
      toast.error("Failed to start comparison.");
    }
  };

  return (
    <Container className="text-center" style={{ marginTop: '90px' }}>
      <ToastContainer />
      {videoDetails ? (
        <Card style={cardStyles}>
          <Card.Img
            variant="top"
            src={videoDetails.thumbnail_url || "https://via.placeholder.com/600x400"}
            style={{ objectFit: "cover", height: "300px" }} // Improved image styling
          />
          <Card.Body>
            <Card.Title style={cardTitleStyles}>{videoDetails.title}</Card.Title>
            <Card.Text style={cardTextStyles}>{videoDetails.description}</Card.Text>
            <Button
              variant="primary"
              onClick={startComparison}
              style={buttonStyles}
              onMouseOver={(e) => (e.target.style = buttonHoverStyles)}
              onMouseOut={(e) => (e.target.style = buttonStyles)}
            >
              Start Pose Comparison
            </Button>
            {comparisonStatus && <p className="mt-3" style={{ fontStyle: "italic", color: "#777" }}>Pose comparison in progress...</p>}
          </Card.Body>
        </Card>
      ) : (
        <p className="mt-4" style={{ fontSize: "1.2rem", color: "#888" }}>Loading video details...</p>
      )}
    </Container>
  );
}

export default VideoDetailPage;
