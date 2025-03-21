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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

const reasons = [
  "Violation of terms of service",
  "Inappropriate behavior",
  "Suspicious activity",
  "Account inactivity",
  "Other",
];  

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
  const [remainingTime, setRemainingTime] = useState({});
  const [openArchivedModal, setOpenArchivedModal] = useState(false);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [openReasonModal, setOpenReasonModal] = useState(false); // New state for reason modal
  const [reason, setReason] = useState(""); // New state for reason input
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

    if (newStatus === "Inactive") {
      setOpenReasonModal(true); // Open reason modal for deactivation
      setSelectedUser(users.find(user => user._id === userId)); // Set selected user
    } else {
      // If activating, no reason needed
      updateStatus(userId, newStatus, "");
    }
  };

  // Update status with reason
  const updateStatus = async (userId, newStatus, reason) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-status/${userId}`,
        { status: newStatus, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Email sent to user about status update to ${newStatus}`);
      setUsers(users.map(user => user._id === userId ? { ...user, status: newStatus } : user));

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
      toast.error("Failed to update user status");
    }
  };

  // Handle reason submission
  const handleReasonSubmit = () => {
    if (selectedUser && reason) {
      updateStatus(selectedUser._id, "Inactive", reason);
      setOpenReasonModal(false);
      setReason(""); // Clear reason input
    } else {
      toast.error("Please select a reason for deactivation.");
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
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, status: "Archived" } : user
      );
  
      // Remove archived user from the main list
      setUsers(updatedUsers.filter(user => user.status !== "Archived"));
  
      // Add the user to the archived list
      const archivedUser = users.find(user => user._id === userId);
      setArchivedUsers(prev => [...prev, archivedUser]);
  
      toast.success("User status updated to Archived");
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("Failed to archive user");
    }
  };
  const handleUnarchiveUser = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/update-status/${userId}`,
        { status: "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Remove the user from the archived list
      const unarchivedUser = archivedUsers.find(user => user._id === userId);
      setArchivedUsers(prev => prev.filter(user => user._id !== userId));
  
      // Add the user back to the main list
      setUsers(prev => [...prev, { ...unarchivedUser, status: "Active" }]);
  
      toast.success("User is Unarchived");
    } catch (error) {
      console.error("Error unarchiving user:", error);
      toast.error("Failed to unarchive user");
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
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    user.status !== "Archived")
  );
  
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
    const margin = 15; // Left and right margins

    // Convert images to base64
    const productLogoBase64 = await toBase64("/images/tup.png");
    const schoolLogoBase64 = await toBase64("/images/1.png");

    // Add logos with better alignment
    doc.addImage(productLogoBase64, "PNG", margin, 10, 25, 25);
    doc.addImage(schoolLogoBase64, "PNG", pageWidth - 45, 10, 30, 20);

    // Title Block with improved styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40); // Dark gray for better readability
    doc.text("IFIT-MOTION-DETECTION", pageWidth / 2, 40, null, null, "center");

    doc.setFontSize(16);
    doc.text("Active Users Report", pageWidth / 2, 50, null, null, "center");

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Lighter gray for secondary text
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 58, null, null, "center");

    // Prepared by section with better spacing
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40); // Reset to dark gray
    doc.text("Prepared by:", margin, 70);
    const authors = ["Eybri Admin"];
    authors.forEach((name, i) => {
        doc.text(name, margin + 20, 70 + i * 8); // Indent author names
    });

    // Horizontal Line with better styling
    doc.setDrawColor(200, 200, 200); // Light gray line
    doc.setLineWidth(0.5);
    doc.line(margin, 85, pageWidth - margin, 85);

    // Table Data with improved design
    const headers = ["Name", "Email", "Gender", "DOB", "BMI", "Status", "Time Left"];
    
    // Calculate column width dynamically based on the page size
    const colWidths = [
        0.15 * pageWidth, // Name
        0.25 * pageWidth, // Email
        0.10 * pageWidth, // Gender
        0.10 * pageWidth, // DOB
        0.10 * pageWidth, // BMI
        0.10 * pageWidth, // Status
        0.10 * pageWidth  // Time Left
    ];

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
        startY: 95,
        theme: "striped", // Use striped theme for better readability
        styles: { 
            fontSize: 10, 
            textColor: [50, 50, 50], 
            cellPadding: 5, 
            lineColor: [200, 200, 200], 
            lineWidth: 0.3 
        },
        headStyles: { 
            fillColor: [50, 50, 50], // Darker header
            textColor: [255, 255, 255], 
            fontStyle: "bold",
            halign: "center" // Center align header text
        },
        bodyStyles: { halign: "center" }, // Center align body text
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Light gray for alternate rows
        columnStyles: {
            0: { cellWidth: colWidths[0], halign: "left" }, // Left align name
            1: { cellWidth: colWidths[1], halign: "left" }, // Left align email
            2: { cellWidth: colWidths[2] },
            3: { cellWidth: colWidths[3] },
            4: { cellWidth: colWidths[4] },
            5: { cellWidth: colWidths[5] },
            6: { cellWidth: colWidths[6] }
        }
    });

    // Footer with improved design
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);

        // Footer Text
        doc.text("Generated by IFit Motion Detection", pageWidth / 2, 285, null, null, "center");
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, null, null, "center");

        // Footer Line with better styling
        doc.setDrawColor(200, 200, 200); // Light gray line
        doc.setLineWidth(0.5);
        doc.line(margin, 280, pageWidth - margin, 280);
    }

    doc.save("users-list.pdf");
};

// Convert image URL to Base64
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
      {/* Reason Input Modal */}
      <Dialog open={openReasonModal} onClose={() => setOpenReasonModal(false)}>
        <DialogTitle>Select Reason for Deactivation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              label="Reason"
              required
            >
              {reasons.map((reasonOption, index) => (
                <MenuItem key={index} value={reasonOption}>
                  {reasonOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReasonModal(false)}>Cancel</Button>
          <Button onClick={handleReasonSubmit} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Status Change Dialog */}
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