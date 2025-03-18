import React, { useState, useEffect } from "react";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  LinearProgress,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Progress = () => {
  const [userMetrics, setUserMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      try {
        const token = getToken();
        const response = await fetch("http://localhost:5000/api/leaderboard?fetch_all=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user metrics");

        const data = await response.json();
        // Find the authenticated user's metrics
        const authenticatedUser = data.find((user) => user.email === JSON.parse(localStorage.getItem("user")).email);
        setUserMetrics(authenticatedUser);
      } catch (error) {
        console.error("Error fetching user metrics:", error);
        toast.error("Failed to fetch user metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, []);

  // Function to compute BMI
  const computeBMI = (weight, height) => {
    if (weight && height) return (weight / ((height / 100) ** 2)).toFixed(2);
    return "N/A";
  };

  // Function to classify BMI
  const classifyBMI = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 25) return "Normal";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    return "Obese";
  };

  if (loading) return <Loader />;

  if (!userMetrics) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6" color="textSecondary">
          No metrics found for the authenticated user.
        </Typography>
      </Box>
    );
  }

  const bmi = computeBMI(userMetrics.weight, userMetrics.height);
  const bmiClassification = classifyBMI(bmi);

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#3B1E54", textAlign: "center", mb: 4 }}>
        Your Progress
      </Typography>

      <Grid container spacing={4}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", height: "100%" }}>
            <CardContent sx={{ textAlign: "center", padding: 3 }}>
              <Avatar
                src={userMetrics.image || "/path/to/default-image.jpg"}
                alt={userMetrics.name}
                sx={{ width: 100, height: 100, margin: "0 auto 16px" }}
              />
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {userMetrics.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {userMetrics.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                BMI: {bmi} ({bmiClassification})
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Calories Burned */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", height: "100%" }}>
                <CardContent sx={{ padding: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3B1E54", mb: 2 }}>
                    Calories Burned
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#9B7EBD", mb: 2 }}>
                    {userMetrics.calories_burned?.toFixed(2) || 0} kcal
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(userMetrics.calories_burned / 2000) * 100} // Assuming 2000 kcal as the goal
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Goal: 2000 kcal
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Exercise Duration */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", height: "100%" }}>
                <CardContent sx={{ padding: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3B1E54", mb: 2 }}>
                    Exercise Duration
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#9B7EBD", mb: 2 }}>
                    {userMetrics.exercise_duration?.toFixed(2) || 0} minutes
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(userMetrics.exercise_duration / 60) * 100} // Assuming 60 minutes as the goal
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Goal: 60 minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Accuracy Score */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", height: "100%" }}>
                <CardContent sx={{ padding: 3, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3B1E54", mb: 2 }}>
                    Accuracy Score
                  </Typography>
                  <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={userMetrics.accuracy_score || 0}
                      size={100}
                      thickness={5}
                      sx={{ color: "#9B7EBD" }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3B1E54" }}>
                        {userMetrics.accuracy_score?.toFixed(2) || 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Weight Loss */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "#F5F5F5", borderRadius: "12px", height: "100%" }}>
                <CardContent sx={{ padding: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3B1E54", mb: 2 }}>
                    Weight Loss
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#9B7EBD", mb: 2 }}>
                    {((userMetrics.calories_burned || 0) / 7700).toFixed(2)} kg
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    7700 kcal ≈ 1 kg
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <ToastContainer />
    </Box>
  );
};

export default Progress;