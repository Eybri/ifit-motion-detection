import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import Loader from '../../components/Layout/Loader';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Tooltip,
  IconButton,
  TextField,
  TablePagination,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import ToggleButton from '@mui/material/ToggleButton';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usersWithBmi = response.data.users.map(user => {
          const heightInMeters = user.height / 100;
          const bmi = heightInMeters > 0 ? user.weight / (heightInMeters * heightInMeters) : 0;
          let bmiCategory = "Unknown";
          if (bmi > 0) {
            if (bmi < 18.5) {
              bmiCategory = "Underweight";
            } else if (bmi < 25) {
              bmiCategory = "Normal";
            } else if (bmi < 30) {
              bmiCategory = "Overweight";
            } else {
              bmiCategory = "Obese";
            }
          }
          return { ...user, bmiCategory };
        });

        setUsers(usersWithBmi);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    // Optimistically update the UI
    setUsers(users.map(user =>
      user._id === userId ? { ...user, status: newStatus } : user
    ));

    try {
      await axios.put(`http://localhost:5000/api/admin/update-status/${userId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      // If error, revert the status change in the UI
      setUsers(users.map(user =>
        user._id === userId ? { ...user, status: currentStatus } : user
      ));
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ width: '90%', margin: '0 auto', overflow: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <TableContainer component={Paper}>
        <Table sx={{ width: '100%' }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>BMI Category</TableCell>
              <TableCell align="center">Admin Status</TableCell>
              <TableCell align="center">Account Status</TableCell> {/* New Column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Avatar src={user.image || "/path/to/default-image.jpg"} alt={user.name} />
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.date_of_birth}</TableCell>
                <TableCell>{user.bmiCategory}</TableCell>
                <TableCell align="center">
                  <Tooltip title={user.is_admin ? "Admin" : "User"}>
                    <IconButton size="small">
                      {user.is_admin ? (
                        <DoDisturbIcon sx={{ color: 'red' }} />
                      ) : (
                        <CheckCircleIcon sx={{ color: 'green' }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={`Click to change status`}>
                    <ToggleButton
                      value="check"
                      selected={user.status === "Active"}
                      onChange={() => handleToggleStatus(user._id, user.status)}
                    >
                      {user.status === "Active" ? (
                        <CheckCircleIcon sx={{ color: 'green' }} />
                      ) : (
                        <DoDisturbIcon sx={{ color: 'red' }} />
                      )}
                    </ToggleButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default UserList;
