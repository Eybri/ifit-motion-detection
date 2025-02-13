import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, Button, MenuItem, Select, InputLabel, FormControl, Grid, 
  Container, Typography, Box, Paper 
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Username, Email, and Password are required!');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.age < 1) {
      toast.error('Age must be a positive number.');
      return false;
    }
    if (formData.height < 1 || formData.weight < 1) {
      toast.error('Height and Weight must be positive numbers.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData);
      toast.success('User registered successfully!');
      
      setFormData({
        username: '',
        email: '',
        password: '',
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <Box 
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/images/bg1.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={5} 
          sx={{
            padding: 4,
            borderRadius: 5,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#e4dbd1' // Slight transparency
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'Bold', color: '#333' }}>
            Create A New Account
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Age"
                  variant="outlined"
                  fullWidth
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  margin="normal"
                  type="number"
                  inputProps={{ min: 1 }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Height (cm)"
                  variant="outlined"
                  fullWidth
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  margin="normal"
                  type="number"
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Weight (kg)"
                  variant="outlined"
                  fullWidth
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  margin="normal"
                  type="number"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{
                mt: 3,
                bgcolor: '#0b0c17',
                color: '#fff',
                '&:hover': { bgcolor: '#1565c0' },
                padding: 1.5,
                fontSize: '1rem',
              }}
            >
              Register
            </Button>
          </form>
        </Paper>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default Register;
