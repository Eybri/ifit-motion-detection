import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Grid, Container } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // for React Router v6+

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

  const navigate = useNavigate(); // for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send data to backend
    axios
      .post('http://localhost:8000/api/register/', formData)
      .then((response) => {
        toast.success('User registered successfully!', {
          position: 'top-right',
        });

        // Clear form fields after successful registration
        setFormData({
          username: '',
          email: '',
          password: '',
          age: '',
          gender: 'Male',
          height: '',
          weight: '',
        });

        // Redirect to login page
        setTimeout(() => {
          navigate('/login'); // Redirect to login after registration
        }, 2000); // Optional delay before redirecting to allow user to see the success toast
      })
      .catch((err) => {
        toast.error(err.response?.data || 'An error occurred', {
          position: 'top-right',
        });
      });
  };

  return (
    <Container maxWidth="sm">
      <div className="register-container">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Left Side: Username, Email, Password */}
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

            {/* Right Side: Age, Gender, Height, Weight */}
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
                label="Height (in cm)"
                variant="outlined"
                fullWidth
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                margin="normal"
                type="number"
              />
              <TextField
                label="Weight (in kg)"
                variant="outlined"
                fullWidth
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                margin="normal"
                type="number"
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
            Register
          </Button>
        </form>
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </Container>
  );
};

export default Register;
