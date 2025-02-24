import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  TextField, Button, Container, Typography, Box, Paper, CircularProgress 
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "bottom-right" });
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`http://localhost:5000/api/reset-password/${token}`, { password });
      toast.success(data.message, { position: "bottom-right" });
      setTimeout(() => navigate("/login"), 1500);
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
      <Container maxWidth="sm">
        <Paper
          elevation={5}
          sx={{
            padding: 4,
            borderRadius: 5,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.8)",
            backgroundColor: "#F7F7F7",
            opacity: 0.9,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#577D86" }}>
            Reset Password
          </Typography>

          <form onSubmit={submitHandler}>
            <TextField
              label="New Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "40px",
                '& .MuiOutlinedInput-root': { borderRadius: "40px" },
              }}
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "40px",
                '& .MuiOutlinedInput-root': { borderRadius: "40px" },
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                bgcolor: "#577D86",
                color: "#fff",
                '&:hover': { bgcolor: "#569DAA" },
                padding: 1.5,
                fontSize: "1rem",
                borderRadius: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#" }} /> : "Reset Password"}
            </Button>
          </form>
        </Paper>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;