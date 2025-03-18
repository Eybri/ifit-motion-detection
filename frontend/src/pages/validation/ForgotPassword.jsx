import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Box, Container, Paper, Typography, TextField, Button, CircularProgress, Divider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post("http://localhost:5000/api/forgot-password", { email });
            toast.success(data.message, { position: "bottom-right" });
            setEmail("");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong!";
            toast.error(errorMessage, { position: "bottom-right" });
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
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FDFAF6', // Replace background image with color
                }}
            >
                <Container maxWidth="sm" sx={{ height: '35vh' }}> {/* Adjust the height as needed */}
                    <Paper
                        elevation={5}
                        sx={{
                            padding: 4,
                            borderRadius: 5,
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            backgroundColor: '#fff',
                            opacity: 0.9,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%', // Ensure the Paper component takes the full height of the Container
                        }}
                    >
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1D2B53' }}>
                            Forgot Your Password?
                        </Typography>
                        <Typography align="center" sx={{ opacity: 0.9, mb: 3 }}>
                            Enter your email to reset your password in order to regain access.
                        </Typography>

                        <form onSubmit={submitHandler} style={{ width: '100%' }}>
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '40px',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '40px',
                                    },
                                    '& .MuiInputBase-input': { padding: '12px 20px' }
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{
                                    mt: 3,
                                    bgcolor: '#7E2553',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#FF004D ' },
                                    padding: 1.5,
                                    fontSize: '1rem',
                                    borderRadius: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Send Reset Link"}
                            </Button>
                        </form>
                    </Paper>
                </Container>

                <ToastContainer />
            </Box>
        </motion.div>
    );
};

export default ForgotPassword;