import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Box, Container, Paper, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
            <Container maxWidth="md">
                <Paper elevation={5} sx={{ padding: 4, borderRadius: 5, backgroundColor: '#F7F7F7', opacity: '0.95' }}>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>

                        {/* First Column: Profile/Image */}
                        <Box
                            flex={1}
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            sx={{
                                backgroundColor: '#577D86',
                                borderRadius: '10px',
                                padding: 3,
                                color: 'white',
                                marginRight: { md: 3 },
                                marginBottom: { xs: 3, md: 0 },
                            }}
                        >
                            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Forgot Your Password?
                            </Typography>
                            <Typography align="center" sx={{ opacity: 0.9 }}>
                                Enter your email to reset your password and regain access to your account.
                            </Typography>
                        </Box>

                        {/* Second Column: Form */}
                        <Box flex={1}>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{ fontWeight: 'bold', color: '#577D86', mb: 3 }}
                            >
                                Reset Password
                            </Typography>
                            <form onSubmit={submitHandler}>
                                <TextField
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                    required
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{ sx: { backgroundColor: 'white' } }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        mt: 3,
                                        bgcolor: '#577D86',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#569DAA' },
                                        borderRadius: '40px',
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Send Reset Link"}
                                </Button>
                            </form>
                        </Box>
                    </Box>
                </Paper>
                <ToastContainer />
            </Container>
        </Box>
    );
};

export default ForgotPassword;