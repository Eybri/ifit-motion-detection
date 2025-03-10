import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { FaStar } from "react-icons/fa"; // Star icon for ratings

const UserVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0); // Track center video
  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    fetchCategories();
    fetchVideos();
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
    setSelectedCategory(e.target.value);
    setLoading(true);
  };

  const handleVideoSelect = async (videoId) => {
    try {
      // Navigate to the video detail page
      navigate(`/video/dance/${videoId}`);
    } catch (error) {
      console.error("Failed to fetch video details", error);
      toast.error("Failed to fetch video details.");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar key={index} color={index < rating ? "gold" : "gray"} />
    ));
  };

  return (
    <Container className="mt-5 text-center with-padding-top">
      <ToastContainer />
      <h2 className="mb-4 text-white title-center">Select Your Dance</h2>

      {/* Category Dropdown */}
      <select className="form-select mb-4 w-50 mx-auto category-dropdown" value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Just Dance Style Carousel */}
      {loading ? (
        <p className="text-white">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="text-white">No videos available for this category.</p>
      ) : (
        <Swiper
          modules={[Navigation, EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          slidesPerView={3}
          spaceBetween={30}
          navigation
          coverflowEffect={{
            rotate: 0,
            stretch: 50,
            depth: 150,
            modifier: 1,
            slideShadows: false,
          }}
          onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
          className="just-dance-carousel"
        >
          {videos.map((video, index) => (
            <SwiperSlide key={video.id}>
              <div
                className={`video-card ${index === selectedIndex ? "selected" : "blurred"}`}
                onClick={() => handleVideoSelect(video.id)} // Navigate on select
              >
                <img
                  src={video.thumbnail_url || "https://via.placeholder.com/300"}
                  alt={video.title}
                  className="video-thumbnail"
                />
                {index === selectedIndex && (
                  <div className="video-title-overlay">
                    <h3>{video.title}</h3>
                    <p>{video.artist}</p>
                    <div>{renderStars(video.rating)}</div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Container>
  );
};

export default UserVideoList;
