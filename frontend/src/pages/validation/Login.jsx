import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, Button, Container, Typography, Box, Paper, CircularProgress 
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { setToken, setUserId } from '../../utils/auth'; // Import setUserId
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const { data } = await axios.post('http://localhost:5000/api/login', values);

        if (data.token) {
          setToken(data.token); // Store the token in localStorage
          const decodedToken = jwtDecode(data.token); // Decode the token
          const userId = decodedToken.user_id; // Extract user_id from the token

          setUserId(userId); // Store user_id in session storage
          localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
          toast.success('Logged in successfully!', { position: 'bottom-right' });

          setTimeout(() => {
            navigate(redirect || "/");
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Invalid login response. Please try again.', { position: 'bottom-right' });
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Invalid email or password", { position: 'bottom-right' });
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/images/bg1.jpg)', // Adjust based on your image path
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
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.8)',
            backgroundColor: '#F7F7F7',
            opacity: 0.9,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#577D86' }}>
            Login to Your Account
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            {/* Email Input */}
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              type="email"
              {...formik.getFieldProps('email')}
              required
              margin="normal"
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: '40px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '40px',
                },
                '& .MuiInputBase-input': { padding: '12px 20px' }
              }}
            />

            {/* Password Input */}
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              name="password"
              type="password"
              {...formik.getFieldProps('password')}
              required
              margin="normal"
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: '40px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '40px',
                },
                '& .MuiInputBase-input': { padding: '12px 20px' }
              }}
            />

            {/* Forgot Password */}
            <Typography align="right" sx={{ mt: 1 }}>
              <Link to="/password/forgot" style={{ textDecoration: 'underline', color: '#577D86' }}>
                Forgot Password?
              </Link>
            </Typography>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                bgcolor: '#577D86',
                color: '#fff',
                '&:hover': { bgcolor: '#569DAA' },
                padding: 1.5,
                fontSize: '1rem',
                borderRadius: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Login"}
            </Button>

            {/* Register Link */}
            <Typography align="center" sx={{ mt: 2, color: '#577D86' }}>
              New User?{" "}
              <Link to="/register" style={{ textDecoration: 'underline', color: '#577D86' }}>
                Register Here
              </Link>
            </Typography>
          </form>
        </Paper>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default Login;