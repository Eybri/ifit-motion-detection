import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, Button, Container, Typography, Box, Paper 
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

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
        const { data } = await axios.post('http://localhost:8000/api/login/', values);

        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success('Logged in successfully!', { position: 'bottom-right' });

          setTimeout(() => {
            navigate(redirect || "/");
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Invalid login response. Please try again.', { position: 'bottom-right' });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid email or password", { position: 'bottom-right' });
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
            backgroundColor: '#e4dbd1'
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Login
          </Typography>

          <form onSubmit={formik.handleSubmit}>
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
            />

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
            />

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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Typography align="center" sx={{ mt: 2 }}>
              New User?{" "}
              <Link to="/register" style={{ textDecoration: 'none', color: '#1565c0' }}>
                Register Here
              </Link>
            </Typography>

            <Typography align="center" sx={{ mt: 2 }}>
              <Link to="/password/forgot" style={{ textDecoration: 'none', color: '#1565c0' }}>
                Forgot Password?
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
