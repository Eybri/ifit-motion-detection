import React from "react";
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import styled from "styled-components";

const Footer = () => {
  return (
    <FooterContainer>
      {/* Left Section - Brand Info */}
      <BrandInfo>
        <BrandName>IFIT</BrandName>
      </BrandInfo>

      {/* Middle Section - Copyright */}
      <Copyright>
        <h4>© 2025 IFIT. All Rights Reserved.</h4>
      </Copyright>

      {/* Right Section - Social Media */}
      <SocialMedia>
        <SocialIcons>
          {[FaInstagram, FaFacebookF, FaTwitter, FaYoutube].map((Icon, index) => (
            <Icon
              key={index}
              style={{
                fontSize: "1.4rem",
                color: "#99BC85",
                transition: "0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.target.style.color = "black")}
              onMouseOut={(e) => (e.target.style.color = "#99BC85")}
            />
          ))}
        </SocialIcons>
      </SocialMedia>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components
const FooterContainer = styled.footer`
  background-color: #FAF1E6;
  opacity: 0.9;
  color: #99BC85;
  padding: 2rem 10%;
  width: 100%;
  box-sizing: border-box;

  /* Use Flexbox for vertical centering */
  display: flex;
  justify-content: space-between; /* Spread elements evenly */
  align-items: center; /* Center vertically */

  /* Add shadow for floating effect */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;



const BrandInfo = styled.div`
  max-width: 300px;
  margin-bottom: 0;
`;

const BrandName = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #99BC85;
  margin-bottom: 0px;
`;

const BrandTagline = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  color: #99BC85;
`;

const Copyright = styled.div`
  text-align: center;
  margin-bottom: 0;

  h4 {
    font-size: 1rem;
    margin-bottom: 0px;
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