import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Form } from "react-bootstrap";
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import { FaEdit, FaTrash, FaPlay } from "react-icons/fa";

// Google Font
const fontFamily = "'Poppins', sans-serif";

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#FDFAF6",
    minHeight: "100vh",
    fontFamily: fontFamily, // Apply Google Font
  },
  header: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "24px",
    borderBottom: "2px solid #99BC85",
    paddingBottom: "8px",
    fontFamily: fontFamily, // Apply Google Font
  },
  button: {
    backgroundColor: "#99BC85",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    transition: "background 0.3s ease",
    marginBottom: "20px",
    cursor: "pointer",
    fontFamily: fontFamily, // Apply Google Font
  },
  card: {
    width: "300px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    overflow: "hidden",
    cursor: "pointer",
    fontFamily: fontFamily, // Apply Google Font
  },
  cardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
  },
  videoContainer: {
    width: "100%",
    height: "160px", // Fixed height for the video container
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Ensure the video fits perfectly within the container
  },
  cardContent: {
    padding: "16px",
    fontFamily: fontFamily, // Apply Google Font
  },
  iconButton: {
    marginLeft: "8px",
    color: "#757575",
    transition: "color 0.3s ease",
    fontFamily: fontFamily, // Apply Google Font
  },
};

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    category_id: "",
    video_file: null,
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/videos/");
      setVideos(data);
    } catch {
      toast.error("Failed to load videos");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/categories/", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setVideos(videos.filter((video) => video.id !== videoId));
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  const handleEditClick = (video) => {
    setEditMode(true);
    setSelectedVideo(video);
    setNewVideo({
      title: video.title || "",
      description: video.description || "",
      category_id: video.category_id || "",
      video_file: null,
    });
    setShowModal(true);
  };

  const handlePlay = (videoUrl) => {
    window.open(videoUrl, "_blank");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVideo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewVideo((prev) => ({
      ...prev,
      video_file: file || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newVideo.title);
    formData.append("description", newVideo.description);
    formData.append("category_id", newVideo.category_id);
    if (newVideo.video_file) formData.append("video_file", newVideo.video_file);

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/videos/${selectedVideo.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        toast.success("Video updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/videos/", formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        toast.success("Video added successfully");
      }

      fetchVideos();
      setShowModal(false);
      setNewVideo({ title: "", description: "", category_id: "", video_file: null });
      setEditMode(false);
    } catch {
      toast.error("Failed to submit video");
    }
  };

  // Function to handle video autoplay on hover
  const handleVideoHover = (e) => {
    const video = e.target;
    video.play();
  };

  // Function to handle video pause on mouse leave
  const handleVideoLeave = (e) => {
    const video = e.target;
    video.pause();
    video.currentTime = 0; // Reset video to the beginning
  };

  return (
    <div style={styles.container}>
      {/* Add Google Font Link */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <ToastContainer />
      <h2 style={styles.header}>🎥 Video List</h2>

      <button style={styles.button} onClick={() => setShowModal(true)}>
        ➕ Add Video
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="d-flex flex-wrap gap-4">
          {videos.map((video) => (
            <Card key={video.id} style={styles.card}>
              {/* Video Container */}
              <div style={styles.videoContainer}>
                <video
                  src={video.video_url}
                  style={styles.video}
                  controls={false} // Disable default controls
                  muted // Mute the video for autoplay
                  onMouseEnter={handleVideoHover} // Autoplay on hover
                  onMouseLeave={handleVideoLeave} // Pause on mouse leave
                />
              </div>
              <CardContent style={styles.cardContent}>
                <Typography variant="h6" style={{ fontFamily: fontFamily }}>{video.title}</Typography>
                <Typography variant="body2" style={{ fontFamily: fontFamily }}>{video.description}</Typography>
                <IconButton onClick={() => handleEditClick(video)} style={styles.iconButton}>
                  <FaEdit />
                </IconButton>
                <IconButton onClick={() => handleDelete(video.id)} style={styles.iconButton}>
                  <FaTrash />
                </IconButton>
                <IconButton onClick={() => handlePlay(video.video_url)} style={styles.iconButton}>
                  <FaPlay />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="text"
            name="title"
            value={newVideo.title}
            onChange={handleChange}
            required
            style={{ fontFamily: fontFamily }} // Apply Google Font
          />
          <Form.Control
            type="text"
            name="description"
            value={newVideo.description}
            onChange={handleChange}
            required
            style={{ fontFamily: fontFamily }} // Apply Google Font
          />
          <Form.Control
            as="select"
            name="category_id"
            value={newVideo.category_id}
            onChange={handleChange}
            required
            style={{ fontFamily: fontFamily }} // Apply Google Font
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Control>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            style={{ fontFamily: fontFamily }} // Apply Google Font
          />
          <button type="submit" style={styles.button}>
            {editMode ? "Update" : "Add"}
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoList;