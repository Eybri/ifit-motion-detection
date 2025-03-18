import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField, Button, Container, Typography, Box, Paper, Select, MenuItem, InputLabel,
  FormControl, Stepper, Step, StepLabel, CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", gender: "", date_of_birth: "", height: "", weight: "",
    fitness_level: "Beginner", dance_styles: [], fitness_goals: [], preferred_dance_duration: "Medium", activity_level: "Active",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const steps = ["Profile Information", "Personal Details"];

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 0:
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        break;
      case 1:
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.date_of_birth) newErrors.date_of_birth = "Date of Birth is required";
        if (!formData.height) newErrors.height = "Height is required";
        if (!formData.weight) newErrors.weight = "Weight is required";
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      await axios.post("http://localhost:5000/api/register", form);
      toast.success("Registered Successfully!", { position: "bottom-right" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("Registration failed!", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1D2B53" }}>
              Profile Information
            </Typography>
            <Button variant="contained" component="label" fullWidth sx={{ borderRadius: "40px", bgcolor: "#7E2553", color: "#fff", "&:hover": { bgcolor: "#FF004D" } }}>
              Upload Profile Picture
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {preview && <Box mt={2} display="flex" justifyContent="center"><img src={preview} alt="Preview" style={{ width: 150, height: 150, borderRadius: "50%" }} /></Box>}
            <TextField label="Full Name" name="name" fullWidth required margin="normal" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
            <TextField label="Email" type="email" name="email" fullWidth required margin="normal" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
            <TextField label="Password" type="password" name="password" fullWidth required margin="normal" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#1D2B53" }}>
              Personal Details
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={formData.gender} onChange={handleChange} required error={!!errors.gender}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Date of Birth" type="date" name="date_of_birth" fullWidth required margin="normal" value={formData.date_of_birth} onChange={handleChange} error={!!errors.date_of_birth} helperText={errors.date_of_birth} InputLabelProps={{ shrink: true }} />
            <TextField label="Height (cm)" type="number" name="height" fullWidth required margin="normal" value={formData.height} onChange={handleChange} error={!!errors.height} helperText={errors.height} />
            <TextField label="Weight (kg)" type="number" name="weight" fullWidth required margin="normal" value={formData.weight} onChange={handleChange} error={!!errors.weight} helperText={errors.weight} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FDFAF6" }}>
        <Container maxWidth="sm">
          <Paper elevation={5} sx={{ padding: 4, borderRadius: 5, backgroundColor: "#fff", opacity: 0.95 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>
            <Box mt={4}>{renderStepContent(activeStep)}</Box>
            <Box mt={4} display="flex" justifyContent="space-between">
              <Button variant="contained" onClick={handleBack} disabled={activeStep === 0} sx={{ bgcolor: "#7E2553", color: "white" }}>Back</Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ bgcolor: "#7E2553", color: "white" }}>
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Submit"}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} sx={{ bgcolor: "#7E2553", color: "white" }}>Next</Button>
              )}
            </Box>
          </Paper>
        </Container>
        <ToastContainer />
      </Box>
    </motion.div>
  );
};

export default Register;