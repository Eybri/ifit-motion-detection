import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Form } from "react-bootstrap";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import { FaEdit, FaTrash, FaPlay, FaHome, FaVideo } from "react-icons/fa";
import Loader from "../../../components/Layout/Loader";

const fontFamily = "'Poppins', sans-serif";

const styles = {
  container: { padding: "20px", backgroundColor: "#EEEEEE", minHeight: "100vh", fontFamily },
  header: { fontSize: "32px", fontWeight: "700", color: "#EEEEEE", marginBottom: "24px", padding: "16px", borderRadius: "12px", background: "linear-gradient(90deg, #3B1E54, #9B7EBD)", textAlign: "center", fontFamily },
  button: { backgroundColor: "#9B7EBD", color: "#EEEEEE", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "500", cursor: "pointer", fontFamily, margin: "8px" }, 
  card: { width: "300px", backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "pointer", fontFamily, transition: "transform 0.3s ease, box-shadow 0.3s ease" },
  videoContainer: { width: "100%", height: "160px", overflow: "hidden", position: "relative" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  cardContent: { padding: "16px", fontFamily },
  iconButton: { marginLeft: "8px", color: "#9B7EBD", fontFamily },
  categoryPlaceholder: {
    width: "200px",
    height: "120px",
    margin: "10px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  activeCategoryIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "4px",
    backgroundColor: "#3B1E54",
  },
  categoryIcon: {
    fontSize: "28px",
    marginBottom: "8px",
  },
  categoryTitle: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#3B1E54",
  },
  categoryCount: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  categoriesContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    margin: "20px 0",
  },
  videosContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    margin: "20px 0",
  },
  videoCardHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
  },
  categoryPlaceholderHover: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
  },
  loadingPlaceholder: {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "pulse 1.5s infinite linear",
  },
  sectionTitle: {
    fontSize: "24px",
    color: "#3B1E54",
    fontWeight: "600",
    textAlign: "center",
    margin: "30px 0 15px 0",
    fontFamily,
  },
  categoryOverlay: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(59, 30, 84, 0.8)",
    color: "#FFFFFF",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
  },
  videoControls: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  videoPlayButton: {
    color: "#FFFFFF",
    fontSize: "36px",
    backgroundColor: "rgba(59, 30, 84, 0.7)",
    borderRadius: "50%",
    padding: "10px",
    transition: "transform 0.2s ease",
  },
  emptyStateMessage: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: "20px",
    width: "100%",
  },
  categoryBadge: {
    padding: "3px 8px",
    borderRadius: "4px",
    backgroundColor: "#3B1E54",
    color: "#FFFFFF",
    fontSize: "12px",
    position: "absolute",
    top: "10px",
    right: "10px",
  }
};

// Add keyframes animation for pulse effect
const pulseKeyframes = `
@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Category icons for a more visual representation
const categoryIcons = {
  default: <FaVideo />,
  all: <FaHome />
};

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: "", description: "", category_id: "", video_file: null });
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

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
      const { data } = await axios.get("http://localhost:5000/api/categories/", { headers: { Authorization: `Bearer ${getToken()}` } }); 
      setCategories(data); 
    } catch { 
      toast.error("Failed to load categories"); 
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setFilteredCategory(categoryId);
  };

  const handleDelete = async (videoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setVideos(videos.filter((video) => video.id !== videoId));
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (video, e) => {
    e.stopPropagation();
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

  const handleChange = (e) => {
    setNewVideo({ ...newVideo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewVideo({ ...newVideo, video_file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info(editMode ? "Updating video..." : "Adding video...");
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", newVideo.title);
      formData.append("description", newVideo.description);
      formData.append("category_id", newVideo.category_id);
      if (newVideo.video_file) formData.append("video_file", newVideo.video_file);

      const url = editMode ? `http://localhost:5000/api/videos/${selectedVideo.id}` : "http://localhost:5000/api/videos/";
      const method = editMode ? axios.put : axios.post;

      await method(url, formData, { headers: { Authorization: `Bearer ${getToken()}` } });

      fetchVideos();
      toast.success(editMode ? "Video updated successfully" : "Video added successfully");
      setShowModal(false);
    } catch {
      toast.error("Failed to save video");
    }
    setActionLoading(false);
  };

  const handlePlayVideo = (videoUrl, e) => {
    e.stopPropagation();
    window.open(videoUrl, "_blank");
  };

  const filteredVideos = filteredCategory ? videos.filter((video) => video.category_id === filteredCategory) : videos;
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  
  const getVideosForCategory = (categoryId) => {
    return videos.filter(video => video.category_id === categoryId);
  };
  
  // Generate random placeholder colors
  const generatePlaceholderColors = () => {
    const colors = ["#E2D0F9", "#BEAFC2", "#C8B8DB", "#D6C6E1", "#9B7EBD"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const renderCategoryPlaceholders = () => {
    if (loading) {
      // Loading placeholders
      return Array(6).fill(0).map((_, idx) => (
        <div 
          key={`placeholder-${idx}`}
          style={{
            ...styles.categoryPlaceholder,
            ...styles.loadingPlaceholder,
            backgroundColor: "#f0f0f0"
          }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e0e0e0", marginBottom: "10px" }}></div>
          <div style={{ width: "70%", height: "12px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
          <div style={{ width: "40%", height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", marginTop: "8px" }}></div>
        </div>
      ));
    }
    
    // Real categories
    return (
      <>
        <div 
          style={{
            ...styles.categoryPlaceholder,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            ...(hoveredCategory === "all" ? styles.categoryPlaceholderHover : {}),
            ...(filteredCategory === null ? { border: "2px solid #3B1E54" } : {})
          }}
          onMouseEnter={() => setHoveredCategory("all")}
          onMouseLeave={() => setHoveredCategory(null)}
          onClick={() => handleCategoryFilter(null)}
        >
          <div style={styles.categoryIcon}>{categoryIcons.all}</div>
          <div style={styles.categoryTitle}>All Videos</div>
          <div style={styles.categoryCount}>{videos.length} videos</div>
          {filteredCategory === null && <div style={styles.activeCategoryIndicator}></div>}
        </div>
        
        {categories.map((category) => {
          const videoCount = getVideosForCategory(category.id).length;
          const isActive = filteredCategory === category.id;
          
          return (
            <div 
              key={category.id}
              style={{
                ...styles.categoryPlaceholder,
                backgroundColor: "#FFFFFF",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                ...(hoveredCategory === category.id ? styles.categoryPlaceholderHover : {}),
                ...(isActive ? { border: "2px solid #3B1E54" } : {})
              }}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => handleCategoryFilter(category.id)}
            >
              <div style={styles.categoryIcon}>{categoryIcons.default}</div>
              <div style={styles.categoryTitle}>{category.name}</div>
              <div style={styles.categoryCount}>{videoCount} videos</div>
              {isActive && <div style={styles.activeCategoryIndicator}></div>}
            </div>
          );
        })}
      </>
    );
  };
  
  const renderVideoCards = () => {
    if (loading) {
      // Video loading placeholders
      return Array(6).fill(0).map((_, idx) => (
        <div 
          key={`video-placeholder-${idx}`}
          style={{
            ...styles.card,
            ...styles.loadingPlaceholder
          }}
        >
          <div style={{ ...styles.videoContainer, backgroundColor: "#f0f0f0" }}></div>
          <div style={styles.cardContent}>
            <div style={{ height: "20px", width: "80%", backgroundColor: "#e0e0e0", borderRadius: "4px", marginBottom: "12px" }}></div>
            <div style={{ height: "16px", width: "60%", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
          </div>
        </div>
      ));
    }
    
    if (filteredVideos.length === 0) {
      return <div style={styles.emptyStateMessage}>No videos found in this category</div>;
    }
    
    return filteredVideos.map((video) => (
      <div 
        key={video.id} 
        style={{
          ...styles.card,
          ...(hoveredVideo === video.id ? styles.videoCardHover : {})
        }}
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
      >
        <div style={styles.videoContainer}>
          <video 
            src={video.video_url} 
            style={styles.video} 
            muted 
            onMouseEnter={(e) => e.target.play()} 
            onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }} 
          />
          <div 
            style={{
              ...styles.videoControls,
              opacity: hoveredVideo === video.id ? 1 : 0
            }}
            onClick={(e) => handlePlayVideo(video.video_url, e)}
          >
            <FaPlay style={styles.videoPlayButton} />
          </div>
          <div style={styles.categoryBadge}>
            {getCategoryName(video.category_id)}
          </div>
        </div>
        <CardContent style={styles.cardContent}>
          <Typography variant="h6" style={{ fontFamily }}>{video.title}</Typography>
          <Typography variant="body2" style={{ fontFamily }}>{video.description}</Typography>
          <div style={{ marginTop: "8px" }}>
            <IconButton onClick={(e) => handleEditClick(video, e)} style={styles.iconButton}>
              <FaEdit />
            </IconButton>
            <IconButton onClick={(e) => handleDelete(video.id, e)} style={styles.iconButton}>
              <FaTrash />
            </IconButton>
            <IconButton onClick={(e) => handlePlayVideo(video.video_url, e)} style={styles.iconButton}>
              <FaPlay />
            </IconButton>
          </div>
        </CardContent>
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Add keyframes for animations */}
      <style dangerouslySetInnerHTML={{ __html: pulseKeyframes }} />
      
      {/* Add Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <ToastContainer />
      <h2 style={styles.header}>🎥 Video Collection</h2>
      
      {actionLoading && <Loader />}
      
      <div style={{ textAlign: "center" }}>
        <button style={styles.button} onClick={() => setShowModal(true)}>➕ Add New Video</button>
      </div>

      {/* Categories Section */}
      <h3 style={styles.sectionTitle}>Browse Categories</h3>
      <div style={styles.categoriesContainer}>
        {renderCategoryPlaceholders()}
      </div>

      {/* Videos Section */}
      <h3 style={styles.sectionTitle}>
        {filteredCategory ? `Videos in ${getCategoryName(filteredCategory)}` : "All Videos"}
      </h3>
      <div style={styles.videosContainer}>
        {renderVideoCards()}
      </div>

      {/* ✅ MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: "#EEEEEE" }}>
          <Modal.Title style={{ fontFamily }}>{editMode ? "Edit Video" : "Add Video"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#EEEEEE" }}>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              name="title"
              value={newVideo.title}
              onChange={handleChange}
              required
              placeholder="Title"
              style={{ marginBottom: "16px", fontFamily }}
            />
            <Form.Control
              type="text"
              name="description"
              value={newVideo.description}
              onChange={handleChange}
              required
              placeholder="Description"
              style={{ marginBottom: "16px", fontFamily }}
            />
            <Form.Control
              as="select"
              name="category_id"
              value={newVideo.category_id}
              onChange={handleChange}
              required
              style={{ marginBottom: "16px", fontFamily }}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Control>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              style={{ marginBottom: "16px", fontFamily }}
            />
            <button type="submit" style={styles.button}>
              {editMode ? "Update" : "Add"}
            </button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VideoList;