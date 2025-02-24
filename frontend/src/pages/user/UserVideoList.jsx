import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Row, Col } from "react-bootstrap";

const UserVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchVideos();  // Fetch videos when the component loads
  }, [selectedCategory]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/videos", {
        params: { category_id: selectedCategory },
      });
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos", error);
      toast.error("Failed to fetch videos");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to fetch categories");
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value); // Update selected category
    setLoading(true); // Set loading state to true while fetching
  };

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h2 className="mb-4">Select Your Video</h2>

      {/* Category Filter */}
      <select className="form-select mb-4" value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Video Grid Display */}
      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <Row>
          {videos.length === 0 ? (
            <p>No videos available for this category.</p>
          ) : (
            videos.map((video) => (
              <Col key={video.id} md={3} className="mb-4">
                <div className="grid-item">
                  <img
                    src={video.thumbnail_url || "https://via.placeholder.com/300"}
                    alt={video.title}
                    className="img-fluid"
                  />
                  <div className="dance-list-overlay">
                    <ul>
                      {/* Replace with your video categories or tags */}
                      <li>{categories.find((cat) => cat.id === video.category_id)?.name}</li>
                    </ul>
                  </div>
                </div>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default UserVideoList;
