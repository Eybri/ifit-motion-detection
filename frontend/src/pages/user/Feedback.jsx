import React, { useState, useEffect } from "react";
import axios from "axios";
import { Filter } from "bad-words";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import { isAuthenticated, getUserId, getToken } from "../../utils/auth"; // Import auth utilities

const App = () => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [allFeedback, setAllFeedback] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false); // New state to control visibility
  const [hoveredFeedbackId, setHoveredFeedbackId] = useState(null);

  // Fetch the logged-in user's email from localStorage if authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email) {
        setEmail(user.email); // Set the email state with the logged-in user's email
      }
    }
  }, []);

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchAllFeedback();
  }, []);

  // Function to fetch all feedback
  const fetchAllFeedback = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/");
      setAllFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  // Function to filter bad words
  const filterBadWords = (text) => {
    const filter = new Filter();
    filter.addWords("putang ina", "putangina", "gago", "tang ina", "tangina", "bobo", "ulol", "pokpok", "tanga", "leche", "bingot", "negro");
    return filter.clean(text);
  };

  // Function to submit feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    // Validate email field
    if (!email) {
      setError("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const filteredFeedback = filterBadWords(feedback);
      const response = await axios.post("http://localhost:5000/api/feedback/", {
        feedback: filteredFeedback,
        email,
      });
      toast.success("Feedback submitted successfully!");
      setFeedback("");
      setError("");
      fetchAllFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  // Function to submit a reply to feedback
  const handleSubmitReply = async (feedbackId) => {
    try {
      const filteredReply = filterBadWords(reply);
      const response = await axios.post(
        `http://localhost:5000/api/feedback/${feedbackId}/reply`,
        { reply: filteredReply }
      );
      toast.success("Reply submitted successfully!");
      setReply("");
      setSelectedFeedbackId(null);
      fetchAllFeedback();
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to submit reply. Please try again.");
    }
  };

  return (
    <div style={styles.container} className="fade-in">
      {/* Feedback Submission Form */}
      <form onSubmit={handleSubmitFeedback} style={styles.form}>
        <h2 style={styles.formTitle}>Submit Feedback</h2>
        <div>
          <label style={styles.label}>Feedback:</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>
        <div>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            disabled={isAuthenticated()} // Disable the email input field if authenticated
          />
          {error && <p style={styles.error}>{error}</p>}
        </div>
        <button type="submit" style={styles.button}>
          Submit Feedback
        </button>
      </form>

      {/* Button to toggle feedback visibility */}
      <button
        onClick={() => setShowFeedback(!showFeedback)}
        style={{ ...styles.button, marginTop: "20px" }} // Added marginTop to move the button down
      >
        {showFeedback ? "Hide Feedback" : "See All Feedback"}
      </button>

      {/* Display All Feedback */}
      {showFeedback && (
        <div style={styles.feedbackList} className="fade-in">
          <h2 style={styles.feedbackTitle}>All Feedback</h2>
          {allFeedback.map((fb) => (
            <div
              key={fb._id}
              style={{
                ...styles.feedbackItem,
                ...(hoveredFeedbackId === fb._id ? styles.feedbackItemHovered : {})
              }}
              onMouseEnter={() => setHoveredFeedbackId(fb._id)}
              onMouseLeave={() => setHoveredFeedbackId(null)}
            >
              <div style={styles.feedbackHeader}>
                <p style={styles.feedbackEmail}>{fb.email}</p>
              </div>
              <p style={styles.feedbackText}>{fb.feedback}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toast Container for Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh", // Ensures full height coverage
    borderRadius: "8px",
    paddingTop: "100px", // Moves content downward
  },
  formTitle: {
    color: "#333",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  label: {
    color: "#333",
    fontSize: "16px",
    marginBottom: "5px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    color: "#333",
    backgroundColor: "#f1f1f1",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minHeight: "100px",
    fontSize: "16px",
    color: "#333",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#7E2553",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  feedbackList: {
    marginTop: "20px",
  },
  feedbackTitle: {
    color: "#333",
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "bold",
  },
  feedbackItem: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
  },
  feedbackItemHovered: {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#f9f2f7", // Light purple tint that complements the #7E2553 theme
    borderColor: "#7E2553", // Border color changes to match theme
  },
  feedbackHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  feedbackEmail: {
    color: "#7E2553",
    fontSize: "16px",
    fontWeight: "600",
  },
  feedbackText: {
    color: "#333",
    fontSize: "16px",
    lineHeight: "1.5",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "5px",
  },
};

export default App;