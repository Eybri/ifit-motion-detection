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

  // Refined styles for a more classy look
  const cardStyles = {
    maxWidth: "600px", // Adjusted card size for a more refined look
    margin: "40px auto", // Center card with spacing
    backgroundColor: "#ffffff", // Clean white background
    border: "none", // Removed border for a sleek look
    borderRadius: "12px", // More rounded corners
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)", // Softer, more elegant shadow
    overflow: "hidden", // Ensures no content overflows card
  };

  const cardTitleStyles = {
    fontSize: "1.75rem", // Slightly larger title for emphasis
    fontWeight: "600", // Bolder font weight
    color: "#333", // Darker title color
    marginBottom: "15px", // Space between title and content
  };

  const cardTextStyles = {
    fontSize: "1rem",
    color: "#666", // Softer text color for description
    marginBottom: "20px", // Space at the bottom
  };

  const buttonStyles = {
    backgroundColor: "#007bff", // Classy blue for the button
    borderColor: "#007bff", // Consistent border color
    padding: "12px 30px", // Slightly larger padding for a premium feel
    fontSize: "1.15rem", // Slightly larger font for the button
    borderRadius: "25px", // Rounded corners for the button
    transition: "all 0.3s ease", // Smooth transition for hover effect
  };

  const buttonHoverStyles = {
    backgroundColor: "#0056b3", // Darker shade on hover for elegance
    borderColor: "#0056b3", // Matching border on hover
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
