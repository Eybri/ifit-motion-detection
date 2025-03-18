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
  TextField,
  TablePagination,
  Button,
  createTheme,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  Modal,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

// CSS for the pop-in animation
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  animation: 'popIn 0.3s ease-out', // Apply the animation
};

// Define the keyframes for the pop-in animation
const keyframes = `
  @keyframes popIn {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
`;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [remainingTime, setRemainingTime] = useState({}); // Track remaining time for each user
  const [openArchivedModal, setOpenArchivedModal] = useState(false); // State for archived users modal
  const [archivedUsers, setArchivedUsers] = useState([]); // State to store archived users
  const token = getToken();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter out admin users
        const nonAdminUsers = response.data.users.filter(user => !user.is_admin);

        const usersWithBmi = nonAdminUsers.map(user => {
          const heightInMeters = user.height / 100;
          const bmi = heightInMeters > 0 ? user.weight / (heightInMeters * heightInMeters) : 0;
          let bmiCategory = "Unknown";
          if (bmi > 0) {
            if (bmi < 18.5) bmiCategory = "Underweight";
            else if (bmi < 25) bmiCategory = "Normal";
            else if (bmi < 30) bmiCategory = "Overweight";
            else bmiCategory = "Obese";
          }
          return { ...user, bmiCategory };
        });

        setUsers(usersWithBmi);

        // Initialize remaining time for deactivated users
        const initialRemainingTime = {};
        usersWithBmi.forEach(user => {
          if (user.status === "Inactive" && user.deactivated_at) {
            const deactivatedTime = new Date(user.deactivated_at).getTime();
            const currentTime = new Date().getTime();
            const remaining = deactivatedTime + 15 * 60 * 60 * 1000 - currentTime;
            if (remaining > 0) {
              initialRemainingTime[user._id] = remaining;
            }
          }
        });
        setRemainingTime(initialRemainingTime);

        // Set archived users
        const archived = usersWithBmi.filter(user => user.status === "Archived");
        setArchivedUsers(archived);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Start countdown for deactivated users
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userId => {
          if (updated[userId] > 0) {
            updated[userId] -= 1000; // Subtract 1 second
          } else {
            delete updated[userId]; // Remove user if countdown is complete
          }
        });
        return updated;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Function to format remaining time
  const formatRemainingTime = (time) => {
    if (time <= 0) return "Reactivated";

    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setUsers(users.map(user => user._id === userId ? { ...user, status: newStatus } : user));

    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-status/${userId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Email sent to user about status update to ${newStatus}`);

      // If deactivated, start countdown
      if (newStatus === "Inactive") {
        const deactivatedTime = new Date().getTime();
        const remaining = deactivatedTime + 15 * 60 * 60 * 1000 - deactivatedTime;
        setRemainingTime(prev => ({ ...prev, [userId]: remaining }));
      } else {
        // If reactivated, remove countdown
        setRemainingTime(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setUsers(users.map(user => user._id === userId ? { ...user, status: currentStatus } : user));
      toast.success("Failed to update user status"); // Changed from toast.error to toast.success
    }
  };

  const handleArchiveUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-status/${userId}`,
        { status: "Archived" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the user's status in the local state
      const updatedUsers = users.map(user => user._id === userId ? { ...user, status: "Archived" } : user);
      setUsers(updatedUsers.filter(user => user.status !== "Archived")); // Remove archived user from main list
      toast.success("User status updated to Archived");

      // Update archived users list
      const archivedUser = users.find(user => user._id === userId);
      setArchivedUsers(prev => [...prev, archivedUser]);
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.success("Failed to archive user"); // Changed from toast.error to toast.success
    }
  };

  const handleUnarchiveUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-status/${userId}`,
        { status: "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the user's status in the local state
      const unarchivedUser = archivedUsers.find(user => user._id === userId);
      setUsers(prev => [...prev, { ...unarchivedUser, status: "Active" }]); // Add unarchived user back to main list
      toast.success("User is Unarchived");

      // Update archived users list
      const updatedArchivedUsers = archivedUsers.filter(user => user._id !== userId);
      setArchivedUsers(updatedArchivedUsers);
    } catch (error) {
      console.error("Error unarchiving user:", error);
      toast.success("Failed to unarchive user"); // Changed from toast.error to toast.success
    }
  };

  const handleToggleClick = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDialogClose = () => setOpenDialog(false);
  const handleDialogConfirm = () => {
    if (selectedUser) handleToggleStatus(selectedUser._id, selectedUser.status);
    setOpenDialog(false);
  };

  const handleOpenArchivedModal = () => setOpenArchivedModal(true);
  const handleCloseArchivedModal = () => setOpenArchivedModal(false);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const generatePDF = async () => {
    const doc = new jsPDF();

    const productLogoBase64 = await toBase64("/images/tup.png");
    const schoolLogoBase64 = await toBase64("/images/1.png");

    doc.addImage(productLogoBase64, "PNG", 10, 10, 20, 20);
    doc.addImage(schoolLogoBase64, "PNG", 170, 10, 30, 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("IFIT-MOTION-DETECTION", 105, 20, null, null, "center");
    doc.setFontSize(18);
    doc.text("Active Users Report", 105, 30, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, null, null, "center");

    doc.setFontSize(10);
    doc.text("Prepared by:", 20, 50);
    ["Avery Macasa.", "Bryan James Batan", "Gelgin Delos Santos", "Tyron Justine Medina"].forEach((name, i) => {
      doc.text(name, 20, 55 + i * 5);
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(10, 75, 200, 75);

    const headers = ["Name", "Email", "Gender", "Date of Birth", "BMI Category", "Status", "Time Remaining"];
    const rows = filteredUsers.map(user => [
      user.name,
      user.email,
      user.gender,
      user.date_of_birth,
      user.bmiCategory,
      user.status,
      user.status === "Inactive" ? formatRemainingTime(remainingTime[user._id] || 0) : "N/A",
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 80,
      theme: "striped",
      styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.5 },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 60 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 }, 4: { cellWidth: 40 }, 5: { cellWidth: 30 }, 6: { cellWidth: 40 } },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text("Generated by IFit Motion Detection", 105, 285, null, null, "center");
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 280, 200, 280);
    }

    doc.save("users-list.pdf");
  };

  const toBase64 = (url) => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

  if (loading) return <Loader />;

  return (
    <ThemeProvider theme={theme}>
      {/* Add the keyframes to the global styles */}
      <style>{keyframes}</style>

      <Box sx={{ width: '90%', margin: '0 auto', overflow: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ background: "linear-gradient(90deg, #3B1E54, #9B7EBD)", color: "#EEEEEE", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
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
        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            onClick={generatePDF}
            sx={{ backgroundColor: '#9B7EBD', color: '#EEEEEE', '&:hover': { backgroundColor: '#3B1E54' } }}
          >
            Download PDF Report
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenArchivedModal}
            sx={{ backgroundColor: '#A94A4A', color: '#EEEEEE', '&:hover': { backgroundColor: '#7A2E2E' } }}
          >
            Archived Users
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ backgroundColor: '#EEEEEE' }}>
          <Table sx={{ width: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#3B1E54' }}>
                <TableCell sx={{ color: '#EEEEEE' }}>Image</TableCell>
                <TableCell sx={{ color: '#EEEEEE' }}>Name</TableCell>
                <TableCell sx={{ color: '#EEEEEE' }}>Email</TableCell>
                <TableCell sx={{ color: '#EEEEEE' }}>Gender</TableCell>
                <TableCell sx={{ color: '#EEEEEE' }}>Date of Birth</TableCell>
                <TableCell sx={{ color: '#EEEEEE' }}>BMI Category</TableCell> 
                <TableCell align="center" sx={{ color: '#EEEEEE' }}>Time Remaining</TableCell>
                <TableCell align="center" sx={{ color: '#EEEEEE' }}>Account Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#D4BEE4' } }}>
                  <TableCell>
                    <Avatar src={user.image || "/path/to/default-image.jpg"} alt={user.name} />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.date_of_birth}</TableCell>
                  <TableCell>{user.bmiCategory}</TableCell>
                  <TableCell align="center">
                    {user.status === "Inactive" ? formatRemainingTime(remainingTime[user._id] || 0) : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.status === "Active" ? "Active" : "Deactivated"}>
                      <Switch
                        checked={user.status === "Active"}
                        onChange={() => handleToggleClick(user)}
                        color="success"
                        sx={{
                          "& .MuiSwitch-switchBase": { color: "#A94A4A" },
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "#9B7EBD" },
                          "& .MuiSwitch-track": { backgroundColor: "#A94A4A" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#9B7EBD" },
                        }}
                      />
                    </Tooltip>
                    <Button
                      variant="contained"
                      onClick={() => handleArchiveUser(user._id)}
                      sx={{ marginTop: 1, backgroundColor: '#A94A4A', color: '#EEEEEE', '&:hover': { backgroundColor: '#7A2E2E' } }}
                    >
                      Archive
                    </Button>
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

      {/* Archived Users Modal */}
      <Modal open={openArchivedModal} onClose={handleCloseArchivedModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3B1E54' }}>
            ARCHIVED USERS
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#EEEEEE' }}>
            <Table sx={{ width: '100%' }} aria-label="archived users table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#3B1E54' }}>
                  <TableCell sx={{ color: '#EEEEEE' }}>Image</TableCell>
                  <TableCell sx={{ color: '#EEEEEE' }}>Name</TableCell>
                  <TableCell sx={{ color: '#EEEEEE' }}>Email</TableCell>
                  <TableCell sx={{ color: '#EEEEEE' }}>Status</TableCell>
                  <TableCell align="center" sx={{ color: '#EEEEEE' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {archivedUsers.map((user) => (
                  <TableRow key={user._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#D4BEE4' } }}>
                    <TableCell>
                      <Avatar src={user.image || "/path/to/default-image.jpg"} alt={user.name} />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        onClick={() => handleUnarchiveUser(user._id)}
                        sx={{ backgroundColor: '#9B7EBD', color: '#EEEEEE', '&:hover': { backgroundColor: '#3B1E54' } }}
                      >
                        Unarchive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            onClick={handleCloseArchivedModal}
            sx={{ mt: 2, backgroundColor: '#A94A4A', color: '#EEEEEE', '&:hover': { backgroundColor: '#7A2E2E' } }}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {selectedUser?.status === "Active" ? "deactivate" : "activate"} this account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleDialogConfirm} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default UserList;