import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Grid,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"; // Using Recharts for graphs
import { getToken, getUserId } from "../../utils/auth"; // Import auth utilities
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HistoryResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's dance results
  const fetchUserResults = async () => {
    try {
      const token = getToken();
      const userId = getUserId();

      if (!token || !userId) {
        toast.error("Please log in to view your history.", { position: "bottom-right" });
        return;
      }

      const response = await axios.get("http://localhost:5000/api/leaderboard", {
        params: {
          fetch_all: true,
          user_id: userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch dance results.");
      setLoading(false);
      toast.error("Failed to fetch dance results.", { position: "bottom-right" });
    }
  };

  useEffect(() => {
    fetchUserResults();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading your dance results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Dance Results History
      </Typography>
      <Grid container spacing={3}>
        {results.map((result) => (
          <Grid item key={result.result_id} xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dance Session: {result.video_id}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Date: {new Date(result.created_at).toLocaleDateString()}
                </Typography>

                {/* Graph for Key Metrics */}
                <Box sx={{ height: 200, marginTop: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Accuracy",
                          value: result.accuracy_score,
                        },
                        {
                          name: "Calories",
                          value: result.calories_burned,
                        },
                        {
                          name: "Steps",
                          value: result.steps_taken,
                        },
                        {
                          name: "Efficiency",
                          value: result.movement_efficiency,
                        },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Additional Details */}
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="body2">
                    <strong>Performance Score:</strong> {result.performance_score.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Motion Matching Score:</strong> {result.motion_matching_score.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Energy Expenditure:</strong> {result.energy_expenditure}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Steps Per Minute:</strong> {result.steps_per_minute}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HistoryResults;