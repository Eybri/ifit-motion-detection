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
    <div style={styles.container}  className="fade-in">

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

      {/* Display All Feedback */}
      <div style={styles.feedbackList}  className="fade-in">
        <h2 style={styles.feedbackTitle}>All Feedback</h2>
        {allFeedback.map((fb) => (
          <div key={fb._id} style={styles.feedbackItem}>
            <p style={styles.feedbackText}>
              <strong>Feedback:</strong> {fb.feedback}
            </p>
            {fb.email && (
              <p style={styles.feedbackText}>
                <strong>Email:</strong> {fb.email}
              </p>
            )}
            <div>
              <strong>Replies:</strong>
              {fb.replies.length > 0 ? (
                fb.replies.map((reply, index) => (
                  <div key={index} style={styles.replyContainer}>
                    <p style={styles.replyText}>
                      <FontAwesomeIcon icon={faReply} style={styles.replyIcon} /> {reply}
                    </p>
                  </div>
                ))
              ) : (
                <p>No replies yet.</p>
              )}
            </div>
            {/* Reply Form */}
            {selectedFeedbackId === fb._id ? (
              <div style={styles.slideIn}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  style={styles.textarea}
                />
                <button
                  onClick={() => handleSubmitReply(fb._id)}
                  style={styles.button}
                >
                  Submit Reply
                </button>
                <button
                  onClick={() => setSelectedFeedbackId(null)}
                  style={styles.button}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedFeedbackId(fb._id)}
                style={styles.button}
              >
                <FontAwesomeIcon icon={faReply} style={styles.replyIcon} /> Reply
              </button>
            )}
          </div>
        ))}
      </div>

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

// Styles (same as before)
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
    // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    paddingTop: "100px", // Moves content downward
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  // form: {
  //   marginBottom: "20px",
  //   backgroundColor: "transparent",
  //   padding: "20px",
  //   borderRadius: "8px",
  //   boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  // },
  formTitle: {
    color: "#333",
    marginBottom: "20px",
  },
  label: {
    color: "#333",
    fontSize: "16px",
    marginBottom: "5px",
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

    buttonHover: {
    backgroundColor: "#7FA76C", // Darker green on hover
  },
  
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  feedbackList: {
    alignText: "center",

    marginTop: "20px",
  },
  feedbackTitle: {
    color: "#fff",
    marginBottom: "20px",
  },
  feedbackItem: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  feedbackText: {
    color: "#333",
    marginBottom: "10px",
  },
  replyContainer: {
    marginLeft: "20px",
    padding: "10px",
    borderLeft: "3px solid #1D2B53",
    backgroundColor: "#f1f1f1",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  replyText: {
    color: "#333",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  replyIcon: {
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "5px",
  },
};

export default App;