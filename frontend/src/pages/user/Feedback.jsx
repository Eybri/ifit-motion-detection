import React, { useState, useEffect } from "react";
import axios from "axios";
import { Filter } from "bad-words";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { isAuthenticated } from "../../utils/auth";

const App = () => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [allFeedback, setAllFeedback] = useState([]);
  const [error, setError] = useState("");
  const [expandedFeedbacks, setExpandedFeedbacks] = useState({});
  const [visibleFeedbackCount, setVisibleFeedbackCount] = useState(3);
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = JSON.parse(localStorage.getItem("user"));
      setEmail(user?.email || "");
    }
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback/");
      setAllFeedback(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const filterBadWords = (text) => {
    const filter = new Filter();
    filter.addWords("putang ina", "putangina", "gago", "tang ina", "tangina", "bobo", "ulol", "pokpok", "tanga", "leche", "bingot", "negro");
    return filter.clean(text);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      const filteredFeedback = filterBadWords(feedback);
      await axios.post("http://localhost:5000/api/feedback/", { feedback: filteredFeedback, email });
      toast.success("Feedback submitted successfully!");
      setFeedback("");
      setError("");
      fetchAllFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const toggleFeedbackExpansion = (feedbackId) => {
    setExpandedFeedbacks(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const toggleShowAllFeedback = () => {
    setShowAllFeedback(prev => !prev);
  };

  const displayedFeedback = showAllFeedback 
    ? allFeedback 
    : allFeedback.slice(0, visibleFeedbackCount);

  return (
    <div style={styles.container} className="fade-in">
      {/* Card for submitting feedback */}
      <div style={styles.card}>
        <form onSubmit={handleSubmitFeedback} style={styles.form}>
          <h2 style={styles.formTitle}>Submit Feedback</h2>
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            required 
            style={styles.textarea} 
            placeholder="What would you like to share with us?"
          />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={styles.input} 
            placeholder="Your email address"
            required 
            disabled={isAuthenticated()} 
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.submitButton}>Submit Feedback</button>
        </form>
      </div>

      {/* Feedback listing section */}
      <div style={styles.card}>
        <h2 style={styles.feedbackTitle}>Feedback & Comments</h2>
        
        {displayedFeedback.map((fb) => (
          <div key={fb._id} style={styles.feedbackItem}>
            <p style={styles.feedbackText}><strong>Feedback:</strong> {fb.feedback}</p>
            {fb.email && <p style={styles.emailText}><strong>From:</strong> {fb.email}</p>}
            
            {fb.replies.length > 0 && (
              <div>
                <div style={styles.repliesHeader} onClick={() => toggleFeedbackExpansion(fb._id)}>
                  <strong>Admin Replies ({fb.replies.length})</strong>
                  <FontAwesomeIcon 
                    icon={expandedFeedbacks[fb._id] ? faChevronUp : faChevronDown} 
                    style={styles.expandIcon} 
                  />
                </div>
                
                {expandedFeedbacks[fb._id] && (
                  <div style={styles.repliesContainer}>
                    {fb.replies.map((reply, index) => (
                      <div key={index} style={styles.replyContainer}>
                        <div style={styles.adminBadge}>Ifit Admin</div>
                        <p style={styles.replyText}>{reply}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {allFeedback.length > visibleFeedbackCount && (
          <div style={styles.showMoreContainer}>
            <button 
              onClick={toggleShowAllFeedback} 
              style={styles.showMoreButton}
            >
              {showAllFeedback ? "Show Less" : "See More"} 
              <FontAwesomeIcon icon={showAllFeedback ? faChevronUp : faChevronDown} style={{marginLeft: '8px'}} />
            </button>
          </div>
        )}
      </div>

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
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", 
    maxWidth: "800px", 
    margin: "0 auto", 
    minHeight: "100vh", 
    paddingTop: "100px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  form: { 
    width: "100%" 
  },
  formTitle: { 
    color: "#333", 
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600",
    borderBottom: "2px solid #7E2553",
    paddingBottom: "10px",
  },
  feedbackTitle: {
    color: "#333", 
    marginBottom: "25px",
    fontSize: "24px",
    fontWeight: "600",
    borderBottom: "2px solid #7E2553",
    paddingBottom: "10px",
  },
  input: { 
    width: "100%", 
    padding: "12px 15px", 
    margin: "10px 0", 
    borderRadius: "6px", 
    border: "1px solid #ddd", 
    fontSize: "16px", 
    color: "#333", 
    backgroundColor: "#f8f8f8",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  textarea: { 
    width: "100%", 
    padding: "15px", 
    margin: "10px 0", 
    borderRadius: "6px", 
    border: "1px solid #ddd", 
    minHeight: "120px", 
    fontSize: "16px", 
    color: "#333",
    backgroundColor: "#f8f8f8",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
    resize: "vertical",
  },
  submitButton: { 
    padding: "12px 25px", 
    backgroundColor: "#7E2553", 
    color: "#fff", 
    border: "none", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontSize: "16px", 
    fontWeight: "600",
    transition: "background-color 0.3s ease, transform 0.2s ease", 
    display: "inline-block",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(126, 37, 83, 0.15)",
  },
  feedbackItem: { 
    border: "1px solid #eee", 
    borderRadius: "8px", 
    padding: "20px", 
    marginBottom: "15px", 
    backgroundColor: "#fff", 
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  feedbackText: { 
    color: "#333", 
    marginBottom: "12px",
    fontSize: "16px",
    lineHeight: "1.5",
  },
  emailText: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px",
  },
  repliesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderTop: "1px solid #eee",
    marginTop: "10px",
    cursor: "pointer",
    color: "#555",
  },
  repliesContainer: {
    marginTop: "10px",
    padding: "5px 0",
  },
  replyContainer: { 
    marginLeft: "15px", 
    padding: "12px 15px", 
    borderLeft: "3px solid #7E2553", 
    backgroundColor: "#f8f8f8", 
    borderRadius: "4px", 
    marginBottom: "10px",
    position: "relative",
  },
  adminBadge: {
    position: "absolute",
    top: "-10px",
    left: "10px",
    backgroundColor: "#7E2553",
    color: "white",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  replyText: { 
    color: "#333", 
    margin: "0",
    paddingTop: "10px",
    fontSize: "15px",
  },
  expandIcon: {
    color: "#7E2553",
    fontSize: "14px",
  },
  error: { 
    color: "#e74c3c", 
    fontSize: "14px", 
    marginTop: "5px",
    marginBottom: "10px",
  },
  showMoreContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
  showMoreButton: {
    backgroundColor: "transparent",
    color: "#7E2553",
    border: "1px solid #7E2553",
    borderRadius: "20px",
    padding: "8px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default App;