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
  Button,
  createTheme,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [menuUser, setMenuUser] = useState(null); // To track which user's menu is open
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
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

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
    } catch (error) {
      console.error("Error updating user status:", error);
      setUsers(users.map(user => user._id === userId ? { ...user, status: currentStatus } : user));
      toast.error("Failed to update user status");
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

  // Dropdown menu handlers
  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleEdit = (user) => {
    console.log("Edit user:", user);
    handleMenuClose();
  };

  const handleDelete = (user) => {
    console.log("Delete user:", user);
    handleMenuClose();
  };

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

    const headers = ["Name", "Email", "Gender", "Date of Birth", "BMI Category", "Status"];
    const rows = filteredUsers.map(user => [user.name, user.email, user.gender, user.date_of_birth, user.bmiCategory, user.status]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 80,
      theme: "striped",
      styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.5 },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 60 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 }, 4: { cellWidth: 40 }, 5: { cellWidth: 30 } },
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
        <Button
          variant="contained"
          onClick={generatePDF}
          sx={{ marginBottom: 2, backgroundColor: '#9B7EBD', color: '#EEEEEE', '&:hover': { backgroundColor: '#3B1E54' } }}
        >
          Download PDF Report
        </Button>
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