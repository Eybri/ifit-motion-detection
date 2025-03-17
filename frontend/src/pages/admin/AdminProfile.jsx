import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../components/Layout/Loader";
import { Avatar, Typography, Button, Box, Divider } from "@mui/material";
import { Modal, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";

// Google Font
const fontFamily = "'Poppins', sans-serif";

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#EEEEEE",
    minHeight: "100vh",
    fontFamily: fontFamily,
  },
  header: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#EEEEEE",
    marginBottom: "24px",
    padding: "16px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #3B1E54, #9B7EBD)",
    textAlign: "center",
    fontFamily: fontFamily,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  profileContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: fontFamily,
    display: "flex",
    gap: "24px",
    transform: "translateY(0)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
    },
  },
  avatarColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: "2px solid #D4BEE4",
    paddingRight: "24px",
  },
  detailsColumn: {
    flex: 3,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    marginBottom: "16px",
    border: "4px solid #9B7EBD",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  field: {
    marginBottom: "16px",
    fontFamily: fontFamily,
  },
  label: {
    fontWeight: "600",
    color: "#3B1E54",
    marginBottom: "8px",
    fontFamily: fontFamily,
  },
  value: {
    color: "#555",
    fontFamily: fontFamily,
  },
  updateButton: {
    backgroundColor: "#9B7EBD",
    color: "#EEEEEE",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "500",
    transition: "background 0.3s ease, transform 0.3s ease",
    cursor: "pointer",
    fontFamily: fontFamily,
    "&:hover": {
      backgroundColor: "#3B1E54",
      transform: "scale(1.05)",
    },
  },
  modalHeader: {
    backgroundColor: "#3B1E54",
    color: "#EEEEEE",
  },
  modalBody: {
    backgroundColor: "#D4BEE4",
  },
  modalFooter: {
    backgroundColor: "#9B7EBD",
  },
  modalButton: {
    backgroundColor: "#3B1E54",
    color: "#EEEEEE",
    border: "none",
    "&:hover": {
      backgroundColor: "#9B7EBD",
    },
  },
};

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [updatedAdmin, setUpdatedAdmin] = useState({
    email: "",
    gender: "",
    date_of_birth: "",
    height: "",
    weight: "",
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/user/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(response.data.user);
      setUpdatedAdmin({
        ...response.data.user,
        date_of_birth: new Date(response.data.user.date_of_birth),
      });
    } catch (error) {
      toast.error("Failed to fetch admin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = getToken();
      await axios.put(`http://localhost:5000/api/user/${admin._id}`, updatedAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully");
      setShowProfileModal(false);
      fetchAdminProfile(); // Refresh the profile data
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpdate = async () => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("image", image);

      await axios.put(`http://localhost:5000/api/user/${admin._id}/image`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Image updated successfully");
      setShowImageModal(false);
      fetchAdminProfile(); // Refresh the profile data
    } catch (error) {
      toast.error("Failed to update image");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedAdmin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDateChange = (date) => {
    setUpdatedAdmin((prev) => ({
      ...prev,
      date_of_birth: date,
    }));
  };

  // Calculate BMI and BMI category
  const calculateBMI = (height, weight) => {
    if (!height || !weight) return { bmi: null, category: "Unknown" };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    let category = "Unknown";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return { bmi, category };
  };

  const { bmi, category } = calculateBMI(admin?.height, admin?.weight);

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      {/* Add Google Font Link */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <h2 style={styles.header}>👤 Admin Profile</h2>

      <div style={styles.profileContainer}>
        {/* First Column: Avatar */}
        <div style={styles.avatarColumn}>
          <Avatar
            src={admin?.image || "/path/to/default-avatar.png"}
            alt={admin?.name}
            style={styles.avatar}
          />
          <Typography variant="h6" style={{ fontWeight: "bold", fontFamily: fontFamily }}>
            {admin?.name}
          </Typography>
          <Typography variant="body2" style={{ color: "#9B7EBD", fontFamily: fontFamily }}>
            Admin
          </Typography>
          <Button
            style={styles.updateButton}
            onClick={() => setShowImageModal(true)}
          >
            Update Image
          </Button>
        </div>

        {/* Second, Third, and Fourth Columns: Details */}
        <div style={styles.detailsColumn}>
          {/* Column 1 */}
          <div>
            <Box style={styles.field}>
              <Typography style={styles.label}>Email:</Typography>
              <Typography style={styles.value}>{admin?.email}</Typography>
            </Box>
            <Divider style={{ marginBottom: "16px" }} />
            <Box style={styles.field}>
              <Typography style={styles.label}>Gender:</Typography>
              <Typography style={styles.value}>{admin?.gender}</Typography>
            </Box>
          </div>

          {/* Column 2 */}
          <div>
            <Box style={styles.field}>
              <Typography style={styles.label}>Date of Birth:</Typography>
              <Typography style={styles.value}>
                {new Date(admin?.date_of_birth).toLocaleDateString()}
              </Typography>
            </Box>
            <Divider style={{ marginBottom: "16px" }} />
            <Box style={styles.field}>
              <Typography style={styles.label}>Height:</Typography>
              <Typography style={styles.value}>{admin?.height} cm</Typography>
            </Box>
          </div>

          {/* Column 3 */}
          <div>
            <Box style={styles.field}>
              <Typography style={styles.label}>Weight:</Typography>
              <Typography style={styles.value}>
                {admin?.weight ? parseFloat(admin.weight).toFixed(2) : "N/A"} kg
              </Typography>
            </Box>
            <Divider style={{ marginBottom: "16px" }} />
            <Box style={styles.field}>
              <Typography style={styles.label}>BMI:</Typography>
              <Typography style={styles.value}>
                {bmi} ({category})
              </Typography>
            </Box>
          </div>
        </div>

        {/* Update Button on the Right Side */}
        <div style={{ alignSelf: "flex-end", marginLeft: "auto" }}>
          <Button
            style={styles.updateButton}
            onClick={() => setShowProfileModal(true)}
          >
            Update Profile
          </Button>
        </div>
      </div>

      {/* Update Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Update Profile Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={updatedAdmin.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={updatedAdmin.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <DatePicker
                selected={updatedAdmin.date_of_birth}
                onChange={handleDateChange}
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Height (cm)</Form.Label>
              <Form.Control
                type="number"
                name="height"
                value={updatedAdmin.height}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                name="weight"
                value={updatedAdmin.weight}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleProfileUpdate} style={styles.modalButton}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>Update Profile Image</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleImageUpdate} style={styles.modalButton}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProfile;