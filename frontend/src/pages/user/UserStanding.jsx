// CurrentUserStanding.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";

const UserStanding = ({ currentUserStanding }) => {
  if (!currentUserStanding) return null;

  return (
    <div className="current-standing" style={{ marginTop: "40px" }}>
      <Typography variant="h5" className="leaderboard-title" style={{ marginBottom: "20px" }}>
        Your Current Standing
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
            <TableRow className="leaderboard-row">
              <TableCell>#{currentUserStanding.rank}</TableCell>
              <TableCell>
                <div className="user-info">
                  <Avatar
                    src={currentUserStanding.image || `https://via.placeholder.com/50?text=${currentUserStanding.name[0]}`}
                    alt={currentUserStanding.name}
                    className="user-image"
                  />
                  <div className="user-details">
                    <Typography variant="subtitle1">{currentUserStanding.name}</Typography>
                    <Typography variant="body2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      {currentUserStanding.email}
                    </Typography>
                  </div>
                </div>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1">
                  <span className="accuracy">{currentUserStanding.average_accuracy.toFixed(2)}%</span>
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1">
                  <span className="dances">{currentUserStanding.total_dances}</span>
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserStanding;