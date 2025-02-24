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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url(/images/bg1.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={5}
          sx={{
            padding: 4,
            borderRadius: 5,
            backgroundColor: "#F7F7F7",
            opacity: 0.95,
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#577D86", mb: 3 }}
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
                  sx={{ fontWeight: "bold", color: "#577D86" }}
                >
                  Profile Information
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: "40px",
                    bgcolor: "#577D86",
                    color: "white",
                    "&:hover": { bgcolor: "#569DAA" },
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
                  <Link to="/login" style={{ textDecoration: 'underline', color: '#577D86' }}>
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
                bgcolor: "#577D86",
                color: "#fff",
                "&:hover": { bgcolor: "#569DAA" },
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
  );
};

export default Register;
