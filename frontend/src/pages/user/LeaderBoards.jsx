import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import "./../../css/leaderboards.css"; // Custom CSS for additional styling
import { getUserId, getToken } from "../../utils/auth"; // Import auth utilities

const LeaderBoards = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserStanding, setCurrentUserStanding] = useState(null); // Store current user's standing

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leaderboard", {
        headers: {
          Authorization: `Bearer ${getToken()}`, // Include token for authenticated requests
        },
      });
      setLeaderboard(response.data);

      // If the user is authenticated, find their standing
      const userId = getUserId();
      if (userId) {
        const userStanding = response.data.find((user) => user.user_id === userId);
        if (userStanding) {
          setCurrentUserStanding({
            rank: response.data.indexOf(userStanding) + 1,
            name: userStanding.name,
            average_accuracy: userStanding.average_accuracy,
            total_dances: userStanding.total_dances,
            image: userStanding.image,
            email: userStanding.email,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch leaderboard data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <Typography variant="body1">Loading leaderboard...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="leaderboard-container" mt={20}>
      <TableContainer component={Paper} className="leaderboard-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell align="right">Average Accuracy</TableCell>
              <TableCell align="right">Total Dances</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.slice(0, 10).map((user, index) => ( // Only show top 10 users
              <TableRow key={user.user_id} className="leaderboard-row">
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <div className="user-info">
                    <Avatar
                      src={user.image || `https://via.placeholder.com/50?text=${user.name[0]}`}
                      alt={user.name}
                      className="user-image"
                    />
                    <div className="user-details">
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        {user.email}
                      </Typography>
                    </div>
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">
                    <span className="accuracy">{user.average_accuracy.toFixed(2)}%</span>
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">
                    <span className="dances">{user.total_dances}</span>
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Display current user's standing if authenticated */}
      {currentUserStanding && (
        <div className="current-user-card">
          <div className="user-info">
            <Avatar
              src={currentUserStanding.image || `https://via.placeholder.com/50?text=${currentUserStanding.name[0]}`}
              alt={currentUserStanding.name}
              className="user-image"
            />
            <div className="user-details">
              <Typography variant="subtitle1" className="name">{currentUserStanding.name}</Typography>
              <Typography variant="body2" className="email">{currentUserStanding.email}</Typography>
            </div>
          </div>
          <Typography variant="h5" className="rank">#{currentUserStanding.rank}</Typography>
          <Typography variant="body1" className="accuracy">Accuracy: {currentUserStanding.average_accuracy.toFixed(2)}%</Typography>
          <Typography variant="body1" className="dances">Dances: {currentUserStanding.total_dances}</Typography>
        </div>
      )}
    </div>
  );
};

export default LeaderBoards;