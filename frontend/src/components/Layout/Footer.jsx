import React from "react";
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#181115", // Dark background for maangas feel
        color: "#ffffff",
        padding: "40px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        position: "relative",
        borderTop: "4px solid #577D86",
      }}
    >
      {/* Left Section - Brand Info */}
      <div style={{ maxWidth: "300px" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#577D86",
            marginBottom: "8px",
          }}
        >
          IFIT
        </h2>
        <p style={{ fontSize: "1rem", opacity: "0.8" }}>
          Elevate your fitness. Move to the beat.
        </p>
      </div>

      {/* Middle Section - Newsletter Signup */}
      <div>
        <h4 style={{ fontSize: "1rem", marginBottom: "10px" }}>
          Stay Ahead in Fitness & Dance! Subscribe for Exclusive Tips & Updates!
        </h4>
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="email"
            placeholder="Your email"
            style={{
              padding: "10px",
              width: "200px",
              border: "1px solid #577D86",
              background: "transparent",
              color: "white",
              borderRadius: "4px",
            }}
          />
          <button
            style={{
              background: "#577D86",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#569daa")}
            onMouseOut={(e) => (e.target.style.background = "#577D86")}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Right Section - Social Media */}
      <div>
        <h4 style={{ fontSize: "1rem", marginBottom: "10px" }}>Follow Us</h4>
        <div style={{ display: "flex", gap: "15px" }}>
          {[FaInstagram, FaFacebookF, FaTwitter, FaYoutube].map(
            (Icon, index) => (
              <Icon
                key={index}
                style={{
                  fontSize: "1.4rem",
                  color: "#577D86",
                  transition: "0.3s ease",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.color = "#569DAA")}
                onMouseOut={(e) => (e.target.style.color = "#577D86")}
              />
            )
          )}
        </div>
      </div>

      {/* Bottom Section - Copyright & Links */}
      <div
        style={{
          width: "100%",
          marginTop: "40px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          paddingTop: "10px",
          textAlign: "center",
          fontSize: "0.9rem",
          opacity: "0.7",
        }}
      >
        <p>© 2025 FitMart. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;