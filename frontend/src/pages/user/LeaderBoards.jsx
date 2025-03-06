import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const LeaderBoards = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState([
    { id: 1, name: 'Alex Thompson', score: 98, avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Emily White', score: 95, avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Jordan Lee', score: 92, avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Sophia Green', score: 89, avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Noah Brown', score: 87, avatar: 'https://i.pravatar.cc/150?img=5' },
  ]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${TableHead}-head`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    borderBottom: `1px solid ${theme.palette.divider}`,
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const findCurrentUserRank = () => {
    if (!currentUser) return null;

    const userRank = leaderboardData.findIndex((user) => user.name === currentUser.name) + 1;
    return userRank > 0 ? userRank : null;
  };

  const currentUserRank = findCurrentUserRank();

  useEffect(() => {
    setLeaderboardData((prevData) =>
      [...prevData].sort((a, b) => b.score - a.score)
    );
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, paddingTop: '64px' }}> {/* Added paddingTop */}
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Leaderboards
      </Typography>

      {currentUserRank && (
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          Your current rank: {currentUserRank}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Table aria-label="leaderboard table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Rank</StyledTableCell>
              <StyledTableCell align="left">User</StyledTableCell>
              <StyledTableCell align="center">Score</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboardData.map((row, index) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell align="center">
                  {index === 0 ? (
                    <EmojiEventsIcon color="primary" />
                  ) : (
                    index + 1
                  )}
                </StyledTableCell>
                <StyledTableCell align="left">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar alt={row.name} src={row.avatar} sx={{ mr: 2 }} />
                    <Typography variant="body1">{row.name}</Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">{row.score}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LeaderBoards;