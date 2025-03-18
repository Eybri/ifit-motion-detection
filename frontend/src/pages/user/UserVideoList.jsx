import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import styled from "styled-components";

const UserVideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewVideo, setPreviewVideo] = useState(null);
  const navigate = useNavigate();

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
      navigate(`/compare/${videoId}`);
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
    <BackgroundContainer>
      <StyledContainer>
        <ToastContainer />
        <Title>Select Your Dance</Title>

        <StyledSelect value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </StyledSelect>

        {loading ? (
          <p className="loading-text">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="loading-text">No videos available for this category.</p>
        ) : (
          <StyledSwiper
            modules={[Navigation, EffectCoverflow]}
            effect="coverflow"
            centeredSlides
            slidesPerView={2} // Adjust the number of slides per view
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
                <VideoCard
                  className={index === selectedIndex ? "selected" : "blurred"}
                  onClick={() => handleVideoSelect(video.id)}
                  onMouseEnter={() => setPreviewVideo(video.id)}
                  onMouseLeave={() => setPreviewVideo(null)}
                >
                  {previewVideo === video.id ? (
                    <video autoPlay muted loop>
                      <source src={video.video_url} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={video.thumbnail_url || "https://via.placeholder.com/300"} alt={video.title} />
                  )}
                  {index === selectedIndex && (
                    <VideoInfo>
                      <h3>{video.title}</h3>
                      <p>{video.artist}</p>
                      <div>{renderStars(video.rating)}</div>
                    </VideoInfo>
                  )}
                </VideoCard>
              </SwiperSlide>
            ))}
          </StyledSwiper>
        )}
      </StyledContainer>
    </BackgroundContainer>
  );
};

export default UserVideoList;

const BackgroundContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-image: url('/images/GifBG.gif'); // Add your background image path here
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledContainer = styled(Container)`
  text-align: center;
  padding-top: 2rem;

  .loading-text {
    color: #fff;
  }

  .just-dance-carousel {
    .swiper-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      transition: transform 0.3s ease;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border: 2px solid transparent;

      &:hover {
        transform: scale(1.05);
        border-color: #569DAA;
      }
    }
  }
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  font-size: 3rem;
  font-weight: bold;
  background: -webkit-linear-gradient(#1D2B53, #1D2B53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const StyledSelect = styled.select`
  margin-bottom: 2rem;
  width: 50%;
  margin-left: auto;
  margin-right: auto;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #577D86;
  }

  &:focus {
    outline: none;
    border-color: #577D86;
    box-shadow: 0 0 0 3px rgba(87, 125, 134, 0.2);
  }
`;

const StyledSwiper = styled(Swiper)`
  .swiper-button-next,
  .swiper-button-prev {
    color: #1D2B53; // Change this to your desired color
    transition: color 0.3s ease;
  }

  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    color: #1D2B53; // Change this to your desired hover color
  }
`;

const VideoCard = styled.div`
  position: relative;
  width: 100%;
  height: 600px; // Increase the height
  cursor: pointer;
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &.selected {
    transform: scale(1.1); // Increase the scale for selected item
    border: 3px solid #FF004D; // Add border for selected item
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); // Add shadow for selected item
    background: linear-gradient(145deg, rgba(255,0,77,0.2), rgba(30,43,83,0.2)); // Add gradient background
    animation: pulse 1.5s infinite; // Add pulse animation
  }

  &.blurred {
    filter: blur(2px);
  }

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: scale(1.05);
  }

  @keyframes pulse {
    0% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1.1);
    }
  }
`;

const VideoInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  text-align: left;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  p {
    margin: 0.5rem 0;
  }
`;