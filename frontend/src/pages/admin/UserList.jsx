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
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import ToggleButton from '@mui/material/ToggleButton';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import for autoTable

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

  // Function to convert image to base64
  const toBase64 = (url) => {
    return fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  };

  // Function to generate PDF
  const generatePDF = async () => {
    const doc = new jsPDF();

    // Add product logo (ensure the path is correct or convert the image to base64)
    const productLogo = "/images/tup.png"; // replace with your product logo path
    const productLogoBase64 = await toBase64(productLogo); // Convert image to base64
    doc.addImage(productLogoBase64, "PNG", 10, 10, 20, 20); // Adjust the size as needed

    // Add school logo (ensure the path is correct or convert the image to base64)
    const schoolLogo = "/images/1.png"; // replace with your school logo path
    const schoolLogoBase64 = await toBase64(schoolLogo); // Convert image to base64
    doc.addImage(schoolLogoBase64, "PNG", 170, 10, 30, 15); // Adjust the size and position as needed

    // Add system name "IFIT-MOTION-DETECTION"
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black color for text
    doc.setFontSize(16);
    doc.text("IFIT-MOTION-DETECTION", 105, 20, null, null, "center"); // Centered system name

    // Add the formal title
    doc.setFontSize(18);
    doc.text("Active Users Report", 105, 30, null, null, "center"); // Centered title

    // Add a subtitle with the current date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray color for subtitle
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, null, null, "center");

    // Add admin names below the subtitle
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50); // Dark gray color for admin names
    doc.text("Prepared by:", 20, 50); // Label for admin names
    doc.setFont("helvetica", "normal");
    doc.text("Avery Macasa.", 20, 55); // Admin 1
    doc.text("Bryan James Batan", 20, 60); // Admin 2
    doc.text("Gelgin Delos Santos", 20, 65); // Admin 3
    doc.text("Tyron Justine Medina", 20, 70); // Admin 4

    // Add a horizontal line below the admin names
    doc.setDrawColor(200, 200, 200); // Light gray color for the line
    doc.setLineWidth(0.5);
    doc.line(10, 75, 200, 75); // Horizontal line

    // Table headers
    const headers = ["Name", "Email", "Gender", "Date of Birth", "BMI Category", "Status"];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.gender,
      user.date_of_birth,
      user.bmiCategory,
      user.status,
    ]);

    // Add table to PDF using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 80, // Start the table below the admin names and line
      margin: { left: 10, right: 10 }, // Add left and right margins
      theme: "striped", // Use a striped theme for better readability
      styles: {
        fontSize: 10,
        textColor: [0, 0, 0], // Black text for fields
        cellPadding: 3,
        lineColor: [200, 200, 200], // Light gray color for the lines
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background for headers
        textColor: [0, 0, 0], // Black text for headers
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray background for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Adjust column widths as needed
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 30 },
      },
    });

    // Add a footer with a horizontal line, page number, and "Generated by IFit Motion Detection"
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color for footer text

      // Add "Generated by IFit Motion Detection" text
      doc.text(
        "Generated by IFit Motion Detection",
        105,
        285,
        null,
        null,
        "center"
      );

      // Add page number
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, null, null, "center");

      // Add a horizontal line above the footer
      doc.setDrawColor(200, 200, 200); // Light gray color for the line
      doc.setLineWidth(0.5);
      doc.line(10, 280, 200, 280); // Horizontal line above the footer
    }

    // Save the generated PDF
    doc.save("users-list.pdf");
  };

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
      <Button variant="contained" onClick={generatePDF} sx={{ marginBottom: 2 }}>
        Download PDF Report
      </Button>
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
              <TableCell align="center">Account Status</TableCell>
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

