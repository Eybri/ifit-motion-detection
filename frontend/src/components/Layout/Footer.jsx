import React from "react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import styled from "styled-components";

const Footer = () => {
  return (
    <FooterContainer>
      {/* Left Section - Brand Info */}
      <BrandInfo>
        <BrandName>IFIT</BrandName>
      </BrandInfo>

      {/* Middle Section - Subscribe Message and Button */}
      <SubscribeSection>
        <SubscribeMessage>For more updated news</SubscribeMessage>
        <SubscribeButton
          href="https://www.youtube.com/@ifit445" // Replace with your actual link
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe!
        </SubscribeButton>
      </SubscribeSection>

      {/* Right Section - Social Media */}
      <SocialMedia>
        <SocialIcons>
          {[
            { Icon: FaInstagram, link: "https://www.instagram.com/ifitmotiondetection/#" },
            { Icon: FaFacebookF, link: "https://www.facebook.com/share/16F8vfLtsc/" },
            { Icon: FaYoutube, link: "https://www.youtube.com/@ifit445" },
          ].map(({ Icon, link }, index) => (
            <a key={index} href={link} target="_blank" rel="noopener noreferrer">
              <Icon
                style={{
                  fontSize: "1.4rem",
                  color: "#1D2B53",
                  transition: "0.3s ease",
                  cursor: "pointer",
                  boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)", // Add shadow effect on top
                }}
                onMouseOver={(e) => (e.target.style.color = "#FF004D")}
                onMouseOut={(e) => (e.target.style.color = "#1D2B53")}
              />
            </a>
          ))}
        </SocialIcons>
      </SocialMedia>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components
const FooterContainer = styled.footer`
  background-color: #faf1e6;
  opacity: 0.9;
  color: #1d2b53;
  padding: 2rem 10%;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect on top */

  /* Use Flexbox for vertical centering */
  display: flex;
  justify-content: space-between; /* Spread elements evenly */
  align-items: center; /* Center vertically */
`;

const BrandInfo = styled.div`
  max-width: 300px;
  margin-bottom: 0;
`;

const BrandName = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #1d2b53;
  margin-bottom: 0px;
`;

const SubscribeSection = styled.div`
  display: flex; /* Use flexbox for horizontal alignment */
  align-items: center; /* Center vertically */
  gap: 10px; /* Add spacing between text and button */
`;

const SubscribeMessage = styled.h4`
  font-size: 1rem;
  color: #1d2b53;
  margin: 0; /* Remove default margin */
`;

const SubscribeButton = styled.a`
  padding: 10px 20px;
  background-color: #1d2b53;
  font-transform: uppercase;
  color: #fff;
  border: none;
  border-radius:50px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff004d;
  }
`;

const SocialMedia = styled.div`
  text-align: center;
  margin-bottom: 0;

  h4 {
    font-size: 1rem;
    margin-bottom: 0px;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;