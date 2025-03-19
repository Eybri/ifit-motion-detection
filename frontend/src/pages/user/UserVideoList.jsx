import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { useNavigate } from "react-router-dom";
import { FaClock, FaPlay } from "react-icons/fa";
import styled, { keyframes } from "styled-components";

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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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

  return (
    <BackgroundContainer>
      <ContentWrapper>
        <ToastContainer />
        <Title>Select Your Dance</Title>

        <CategoryButtonsContainer>
          <CategoryButton 
            active={selectedCategory === ""}
            onClick={() => handleCategoryChange("")}
          >
            All Genres
            {selectedCategory === "" && <ActiveIndicator />}
          </CategoryButton>
          
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              active={selectedCategory === category.id}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
              {selectedCategory === category.id && <ActiveIndicator />}
            </CategoryButton>
          ))}
        </CategoryButtonsContainer>

        {loading ? (
          <LoadingContainer>
            <Spinner />
            <p>Loading amazing dance videos...</p>
          </LoadingContainer>
        ) : videos.length === 0 ? (
          <EmptyStateContainer>
            <p>No dance videos available for this category.</p>
            <p>Try selecting a different genre!</p>
          </EmptyStateContainer>
        ) : (
          <SwiperContainer>
            <StyledSwiper
              modules={[Navigation, EffectCoverflow, Pagination]}
              effect="coverflow"
              centeredSlides
              slidesPerView={window.innerWidth < 768 ? 1 : 3}
              spaceBetween={50}
              navigation
              pagination={{ clickable: true }}
              coverflowEffect={{
                rotate: 10,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
              }}
              onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
              className="dance-carousel"
            >
              {videos.map((video, index) => (
                <SwiperSlide key={video.id}>
                  <VideoCard
                    className={index === selectedIndex ? "selected" : ""}
                    onClick={() => handleVideoSelect(video.id)}
                    onMouseEnter={() => setPreviewVideo(video.id)}
                    onMouseLeave={() => setPreviewVideo(null)}
                  >
                    <CardOverlay />
                    <CardContent>
                      {previewVideo === video.id ? (
                        <VideoPreview autoPlay muted loop>
                          <source src={video.video_url} type="video/mp4" />
                        </VideoPreview>
                      ) : (
                        <ThumbnailImage src={video.thumbnail_url || "https://via.placeholder.com/300"} alt={video.title} />
                      )}
                      
                      {/* Play icon */}
                      <PlayIconWrapper>
                        <FaPlay />
                      </PlayIconWrapper>
                      
                      {/* Duration badge */}
                      {video.duration && (
                        <TimestampBadge>
                          <FaClock /> {new Date(video.duration * 1000).toISOString().substr(video.duration >= 3600 ? 11 : 14, 6)}
                        </TimestampBadge>
                      )}
                      
                      {/* Video info */}
                      <VideoInfoOverlay>
                        <VideoTitle>{video.title}</VideoTitle>
                        <ArtistName>{video.artist}</ArtistName>
                        <DanceDescription>
                          {video.description || "A high-energy dance routine that will get your heart pumping and feet moving to the rhythm."}
                        </DanceDescription>
                        <DifficultyBadge 
                          difficulty={video.difficulty || "medium"}>
                          {video.difficulty?.toUpperCase() || "MEDIUM"}
                        </DifficultyBadge>
                      </VideoInfoOverlay>
                    </CardContent>
                  </VideoCard>
                </SwiperSlide>
              ))}
            </StyledSwiper>
          </SwiperContainer>
        )}
      </ContentWrapper>
    </BackgroundContainer>
  );
};

export default UserVideoList;

// Animations
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled Components
const BackgroundContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-image: url('/images/GifBG.gif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  overflow: hidden;
`;

const ContentWrapper = styled(Container)`
  text-align: center;
  padding: 2rem;
  animation: ${fadeIn} 0.8s ease-out;
  max-width: 1500px;
  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #1D2B53 0%, #5D75C6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  animation: ${slideInFromTop} .5s ease-out;
  letter-spacing: 1px;
`;

const CategoryButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 0.5rem;
  overflow-x: auto;
  animation: ${slideInFromTop} 0.7s ease-out;
  max-width: 90%;
  margin: 0 auto 3rem;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #1D2B53;
    border-radius: 10px;
  }
`;

const CategoryButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 2rem;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #1D2B53 0%, #5D75C6 100%)' 
    : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.active ? "#fff" : "#1D2B53"};
  font-weight: ${props => props.active ? "bold" : "normal"};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: ${props => props.active 
    ? '0 8px 15px rgba(29, 43, 83, 0.3)' 
    : '0 4px 8px rgba(0, 0, 0, 0.1)'};
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #1D2B53 0%, #5D75C6 100%)' 
      : 'rgba(255, 255, 255, 1)'};
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: linear-gradient(90deg, #FF004D, #FF66B2);
  border-radius: 1px;
`;

const SwiperContainer = styled.div`
  height: 560px;
  width: 100%;
  position: relative;
  margin-bottom: 2rem;
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
  padding: 50px 0;
  
  .swiper-button-next,
  .swiper-button-prev {
    color: white;
    background: rgba(29, 43, 83, 0.7);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    
    &::after {
      font-size: 20px;
    }
    
    &:hover {
      background: rgba(29, 43, 83, 0.9);
      transform: scale(1.1);
    }
  }
  
  .swiper-pagination-bullet {
    background: #1D2B53;
    opacity: 0.5;
  }
  
  .swiper-pagination-bullet-active {
    background: #FF004D;
    opacity: 1;
  }
`;

const VideoCard = styled.div`
  position: relative;
  width: 100%;
  height: 450px;
  cursor: pointer;
  transition: all 0.5s ease;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  perspective: 1000px;
  transform-style: preserve-3d;
  animation: ${float} 6s ease-in-out infinite;
  
  &.selected {
    animation: ${pulse} 2s infinite;
    box-shadow: 0 15px 35px rgba(255, 0, 77, 0.4);
    border: 2px solid rgba(255, 0, 77, 0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      z-index: -1;
      background: linear-gradient(45deg, #FF004D, #1D2B53, #FF004D);
      border-radius: 18px;
      background-size: 400% 400%;
      animation: gradient 3s ease infinite;
      
      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    }
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 1;
`;

const CardContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${VideoCard}:hover & {
    transform: scale(1.05);
  }
`;

const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlayIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 60px;
  height: 60px;
  background: rgba(255, 0, 77, 0.8);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  opacity: 0.8;
  transition: all 0.3s ease;
  z-index: 2;
  
  ${VideoCard}:hover & {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    background: rgba(255, 0, 77, 0.9);
    box-shadow: 0 0 30px rgba(255, 0, 77, 0.7);
  }
`;

const TimestampBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const VideoInfoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  z-index: 2;
  text-align: left;
  transition: transform 0.3s ease;
  
  ${VideoCard}:hover & {
    transform: translateY(-5px);
  }
`;

const VideoTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 5px;
`;

const ArtistName = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
`;

const DanceDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 90%;
`;

const DifficultyBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
  background: ${props => {
    switch (props.difficulty?.toLowerCase()) {
      case 'easy': return 'linear-gradient(90deg, #4CAF50, #8BC34A)';
      case 'hard': return 'linear-gradient(90deg, #F44336, #FF5722)';
      default: return 'linear-gradient(90deg, #FF9800, #FFC107)'; // medium/default
    }
  }};
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 20px;
  color: white;
  font-size: 1.2rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #FF004D;
  animation: ${spin} 1s ease-in-out infinite;
`;

const EmptyStateContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 30px;
  color: white;
  max-width: 500px;
  margin: 0 auto;
  
  p:first-child {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }
  
  p:last-child {
    color: rgba(255, 255, 255, 0.7);
  }
`;