import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  CircularProgress,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    date_of_birth: "",
    height: "",
    weight: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      await axios.post("http://localhost:5000/api/register", form);
      toast.success("Registered Successfully!", { position: "bottom-right" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("Registration failed!", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDFAF6", // Replace background image with color
        }}
      >
        <Container maxWidth="md" sx={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Adjust the height as needed */}
          <Paper
            elevation={5}
            sx={{
              padding: 4,
              borderRadius: 5,
              backgroundColor: "#fff",
              opacity: 0.95,
              height: '100%', // Ensure the Paper component takes the full height of the Container
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#99BC85", mb: 3 }}
            >
              Create an Account
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {/* Profile Section */}
                <Grid item xs={12} md={5}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "#99BC85" }}
                  >
                    Profile Information
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{
                      borderRadius: "40px",
                      bgcolor: "#99BC85",
                      color: "white",
                      "&:hover": { bgcolor: "#000" },
                    }}
                  >
                    Upload Profile Picture
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                  {preview && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ width: 150, height: 150, borderRadius: "50%" }}
                      />
                    </Box>
                  )}

                  <TextField
                    label="Full Name"
                    name="name"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    name="email"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    name="password"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                </Grid>

                {/* Other Fields Section */}
                <Grid item xs={12} md={7}>
                  <FormControl fullWidth margin="normal" sx={{ backgroundColor: "white" }}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    name="date_of_birth"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                  <TextField
                    label="Height (cm)"
                    type="number"
                    name="height"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    name="weight"
                    fullWidth
                    required
                    margin="normal"
                    onChange={handleChange}
                    InputProps={{ sx: { backgroundColor: "white" } }}
                  />
                  {/* Already have acc */}
                  <Typography align="right" sx={{ mt: 1 }}>
                    <Link to="/login" style={{ textDecoration: 'underline', color: '#99BC85' }}>
                      Already have an account?
                    </Link>
                  </Typography>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  bgcolor: "#99BC85",
                  color: "#fff",
                  "&:hover": { bgcolor: "#000" },
                  borderRadius: "40px",
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Register"}
              </Button>
            </form>
          </Paper>
        </Container>
        <ToastContainer />
      </Box>
    </motion.div>
  );
};

export default Register;