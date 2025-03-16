import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Divider,
  TextField
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { setToken, setUserId } from '../../utils/auth';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false); // State for modal visibility
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const { data } = await axios.post('http://localhost:5000/api/login', values);

        if (data.token) {
          setToken(data.token);
          const decodedToken = jwtDecode(data.token);
          const userId = decodedToken.user_id;

          setUserId(userId);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (data.user.is_admin) {
            navigate('/admin/dashboard');
          } else {
            navigate(redirect || '/');
          }
          window.location.reload();
        } else {
          setErrorMessage('Invalid login response. Please try again.');
          setErrorModalOpen(true);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          setErrorMessage(error.response.data.error); // Set deactivation error message
        } else {
          setErrorMessage(error.response?.data?.error || 'Invalid email or password');
        }
        setErrorModalOpen(true); // Open the modal
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCloseErrorModal = () => {
    setErrorModalOpen(false); // Close the modal
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FDFAF6',
        }}
      >
        <Container maxWidth="lg" sx={{ height: '60vh' }}>
          <Paper
            elevation={5}
            sx={{
              padding: 4,
              borderRadius: 5,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#fff',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, marginRight: 2 }}>
              <img src="/images/DanceArt.jpg" alt="Login" style={{ width: '100%', borderRadius: '10px' }} />
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#99BC85' }}>
                Login to Your Account
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
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '40px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '40px',
                    },
                    '& .MuiInputBase-input': { padding: '12px 20px' },
                  }}
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
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '40px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '40px',
                    },
                    '& .MuiInputBase-input': { padding: '12px 20px' },
                  }}
                />

                <Typography align="right" sx={{ mt: 1 }}>
                  <Link to="/password/forgot" style={{ textDecoration: 'underline', color: '#99BC85' }}>
                    Forgot Password?
                  </Link>
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    bgcolor: '#99BC85',
                    color: '#fff',
                    '&:hover': { bgcolor: '#E4EFE7' },
                    padding: 1.5,
                    fontSize: '1rem',
                    borderRadius: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
                </Button>

                <Typography align="center" sx={{ mt: 2, color: '#99BC85' }}>
                  New User?{' '}
                  <Link to="/register" style={{ textDecoration: 'underline', color: '#99BC85' }}>
                    Register Here
                  </Link>
                </Typography>
              </form>
            </Box>
          </Paper>
        </Container>

        {/* Custom Error Modal */}
        <Modal open={errorModalOpen} onClose={handleCloseErrorModal}>
          <Box
            sx={{
              color: 'black',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>
              Error Message
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {errorMessage}
            </Typography>
            <Button
              variant="contained"
              onClick={handleCloseErrorModal}
              sx={{
                bgcolor: '#99BC85',
                color: '#fff',
                '&:hover': { bgcolor: '#E4EFE7' },
              }}
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </motion.div>
  );
};

export default Login;