// LeaderBoards.js
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
import CurrentUserStanding from "./UserStanding"; // Import the new component

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
    <div className="leaderboard-container">
      <Typography variant="h3" className="leaderboard-title">
        ˏˋ°•*⁀➷ Dance Leaderboard ˏˋ°•*⁀➷
      </Typography>
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
            {leaderboard.map((user, index) => (
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
      <CurrentUserStanding currentUserStanding={currentUserStanding} />
    </div>
  );
};

export default LeaderBoards;