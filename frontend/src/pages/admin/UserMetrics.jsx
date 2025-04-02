import React, { useState, useEffect } from "react";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  Button,
  Avatar
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Scale as ScaleIcon,
  Whatshot as CaloriesIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendIcon,
  FitnessCenter as ExerciseIcon,
  Info as InfoIcon,
  People as PeopleIcon
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminUserMetrics = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Format numbers to 000,000,000.00 format
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    if (typeof num !== "number") return num;
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  // Format minutes into human-readable time
  const formatExerciseTime = (minutes) => {
    if (minutes === null || minutes === undefined) return "N/A";
    if (typeof minutes !== "number") return minutes;
    
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = Math.round(minutes % 60);
    
    return [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      `${mins}m`
    ].filter(Boolean).join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        
        // Fetch all users and their results
        const [usersRes, resultsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/leaderboard?fetch_all=true", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!usersRes.ok || !resultsRes.ok) throw new Error("Data fetch failed");
        
        const [usersData, resultsData] = await Promise.all([usersRes.json(), resultsRes.json()]);
        
        // Filter out admin users and process their data
        const nonAdminUsers = usersData.users.filter(user => !user.is_admin);
        const usersWithMetrics = calculateUserMetrics(nonAdminUsers, resultsData);
        
        // Filter out users with no metrics or N/A values
        const usersWithValidMetrics = usersWithMetrics.filter(user => 
          hasValidMetrics(user.metrics)
        );
        
        setUsers(usersWithValidMetrics);
        setFilteredUsers(usersWithValidMetrics);
        
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load user metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user has valid metrics (not N/A and has at least one workout)
  const hasValidMetrics = (metrics) => {
    return (
      metrics.workouts > 0 &&
      metrics.calories > 0 &&
      metrics.exercise > 0 &&
      metrics.avgAccuracy > 0 &&
      metrics.currentWeight !== "N/A" &&
      metrics.bmi !== "N/A"
    );
  };

  // Calculate comprehensive metrics for all users
  const calculateUserMetrics = (users, results) => {
    return users.map(user => {
      const userResults = results.filter(result => result.user_id === user._id);
      
      // Skip users with no results
      if (userResults.length === 0) {
        return {
          ...user,
          metrics: {
            workouts: 0,
            calories: 0,
            exercise: 0,
            accuracy: 0,
            avgAccuracy: 0,
            weightLossKg: 0,
            currentWeight: "N/A",
            bmi: "N/A",
            bmiCategory: "N/A"
          }
        };
      }

      const totals = userResults.reduce((acc, result) => ({
        calories: (acc.calories || 0) + (result.calories_burned || 0),
        exercise: (acc.exercise || 0) + (result.exercise_duration || 0),
        accuracy: (acc.accuracy || 0) + (result.accuracy_score || 0),
        workouts: (acc.workouts || 0) + 1,
      }), {});

      const weightLossKg = totals.calories / 7700; // 7700 kcal ≈ 1kg
      const currentWeight = user.weight ? user.weight - weightLossKg : "N/A";
      const bmi = currentWeight && user.height ? 
        (currentWeight / ((user.height / 100) ** 2)).toFixed(1) : "N/A";
      
      return {
        ...user,
        metrics: {
          ...totals,
          weightLossKg,
          currentWeight,
          bmi,
          bmiCategory: classifyBMI(bmi),
          avgAccuracy: totals.accuracy / totals.workouts
        }
      };
    });
  };

  const classifyBMI = (bmi) => {
    if (bmi === "N/A") return "N/A";
    const num = parseFloat(bmi);
    if (num < 18.5) return "Underweight";
    if (num < 25) return "Healthy";
    if (num < 30) return "Overweight";
    return "Obese";
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    
    // Add header with logos
    doc.addImage("/images/tup.png", "PNG", margin, margin, 20, 20);
    doc.addImage("/images/1.png", "PNG", pageWidth - margin - 20, margin, 20, 20);
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("IFIT-MOTION-DETECTION", pageWidth / 2, margin + 10, { align: "center" });
    doc.setFontSize(14);
    doc.text("Active Users Fitness Report", pageWidth / 2, margin + 20, { align: "center" });
    
    // Subtitle with date and user count
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | ${filteredUsers.length} active users`, 
      pageWidth / 2, margin + 30, { align: "center" });
    
    // Add horizontal divider
    doc.setDrawColor(59, 30, 84); // Purple color matching header
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 35, pageWidth - margin, margin + 35);
    
    // Table data - only include users with valid metrics
    const activeUsers = filteredUsers.filter(user => hasValidMetrics(user.metrics));
    
    const headers = [
      "User",
      "Workouts",
      "Calories",
      "Exercise Time",
      "Accuracy",
      "Weight Loss",
      "BMI"
    ];
    
    const rows = activeUsers.map(user => [
      user.name,
      user.metrics.workouts,
      formatNumber(user.metrics.calories),
      formatExerciseTime(user.metrics.exercise),
      `${formatNumber(user.metrics.avgAccuracy)}%`,
      `${formatNumber(user.metrics.weightLossKg)} kg`,
      `${user.metrics.bmi} (${user.metrics.bmiCategory})`
    ]);
    
    // Calculate optimal column widths based on content
    const tableWidth = pageWidth - (2 * margin);
    
    // Generate table with explicit column widths
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: margin + 40,
      theme: "grid",
      styles: { 
        fontSize: 9,
        textColor: [50, 50, 50], 
        cellPadding: 3,
        lineColor: [220, 220, 220], 
        lineWidth: 0.1,
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [59, 30, 84],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center',
        minCellHeight: 14
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.25, fontStyle: 'bold' }, // Name
        1: { cellWidth: tableWidth * 0.10, halign: 'center' }, // Workouts
        2: { cellWidth: tableWidth * 0.13, halign: 'right' }, // Calories
        3: { cellWidth: tableWidth * 0.13, halign: 'center' }, // Exercise
        4: { cellWidth: tableWidth * 0.12, halign: 'center' }, // Accuracy
        5: { cellWidth: tableWidth * 0.12, halign: 'right' }, // Weight Loss
        6: { cellWidth: tableWidth * 0.15, halign: 'left' }  // BMI Status
      },
      alternateRowStyles: {
        fillColor: [249, 245, 255]
      },
      didDrawPage: function(data) {
        // Add footer
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `IFIT-MOTION-DETECTION - Page ${doc.internal.getNumberOfPages()}`, 
          pageWidth / 2, 
          footerY, 
          { align: 'center' }
        );
        
        // If not the first page, add header again
        if (doc.internal.getNumberOfPages() > 1) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(59, 30, 84);
          doc.text("Active Users Fitness Report", pageWidth / 2, margin, { align: "center" });
        }
      },
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      tableLineColor: [59, 30, 84],
      tableLineWidth: 0.2,
    });
    
    // Calculate totals for summary page
    const totalWorkouts = activeUsers.reduce((sum, user) => sum + user.metrics.workouts, 0);
    const totalCalories = activeUsers.reduce((sum, user) => sum + user.metrics.calories, 0);
    const totalExerciseMinutes = activeUsers.reduce((sum, user) => sum + user.metrics.exercise, 0);
    const totalWeightLoss = activeUsers.reduce((sum, user) => sum + user.metrics.weightLossKg, 0);
    
    // Add a new page for summary
    doc.addPage();
    
    // Summary page title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(59, 30, 84);
    doc.text("Fitness Metrics Summary", pageWidth / 2, margin + 10, { align: "center" });
    
    // Add horizontal divider
    doc.setDrawColor(59, 30, 84);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 20, pageWidth - margin, margin + 20);
    
    // Summary data
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    
    const summaryData = [
      ["Total Active Users", activeUsers.length],
      ["Total Workouts Completed", totalWorkouts],
      ["Total Calories Burned", `${formatNumber(totalCalories)} kcal`],
      ["Total Exercise Time", formatExerciseTime(totalExerciseMinutes)],
      ["Total Weight Loss", `${formatNumber(totalWeightLoss)} kg`],
      ["Average Workouts Per User", formatNumber(totalWorkouts / activeUsers.length, 1)],
      ["Average Calories Per User", `${formatNumber(totalCalories / activeUsers.length)} kcal`],
      ["Average Weight Loss Per User", `${formatNumber(totalWeightLoss / activeUsers.length)} kg`]
    ];
    
    // Create summary table
    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: margin + 30,
      theme: "striped",
      styles: { 
        fontSize: 10,
        textColor: [50, 50, 50],
        cellPadding: 5
      },
      headStyles: { 
        fillColor: [59, 30, 84],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      },
      margin: { top: margin, right: margin, bottom: margin, left: margin },
    });
    
    // Add footer on summary page
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `IFIT-MOTION-DETECTION - Page ${doc.internal.getNumberOfPages()}`,
      pageWidth / 2, 
      footerY, 
      { align: 'center' }
    );
    
    doc.save("Active_Users_Fitness_Report.pdf");
  };
  if (loading) return <Loader />;

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        <PeopleIcon sx={{ mr: 1 }} />
        Active Users Fitness Dashboard
      </Typography>
      
      <Typography variant="subtitle1" sx={styles.subtitle}>
        Showing {filteredUsers.length} users with recorded activity
      </Typography>

      <Box sx={styles.controls}>
        <TextField
          label="Search Active Users"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={styles.searchField}
        />
        <Button
          variant="contained"
          onClick={generatePDF}
          sx={styles.pdfButton}
          startIcon={<TrendIcon />}
          disabled={filteredUsers.length === 0}
        >
          Export Report
        </Button>
      </Box>

      {filteredUsers.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeader}>
                  <TableCell sx={styles.headerCell}>User</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Workouts</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Calories Burned</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Exercise Time</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Accuracy</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Weight Progress</TableCell>
                  <TableCell sx={styles.headerCell} align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <UserRow 
                    key={user._id} 
                    user={user} 
                    formatNumber={formatNumber} 
                    formatExerciseTime={formatExerciseTime} 
                  />
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
            sx={styles.pagination}
          />
        </>
      ) : (
        <Card sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="textSecondary">
            No active users with recorded metrics found
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Users will appear here once they complete their first workout
          </Typography>
        </Card>
      )}

      <ToastContainer position="bottom-right" />
    </Box>
  );
};

// User row component (same as before)
const UserRow = ({ user, formatNumber, formatExerciseTime }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow hover sx={styles.userRow}>
        <TableCell>
          <Box sx={styles.userCell}>
            <Avatar src={user.image} alt={user.name} sx={styles.avatar} />
            <Box>
              <Typography variant="subtitle2">{user.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Chip 
            label={user.metrics.workouts} 
            color="primary" 
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={styles.metricCell}>
            <CaloriesIcon color="error" fontSize="small" />
            <Typography variant="body2">
              {formatNumber(user.metrics.calories)} kcal
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (user.metrics.calories / 2000) * 100)}
              sx={styles.smallProgress}
            />
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={styles.metricCell}>
            <TimeIcon color="info" fontSize="small" />
            <Typography variant="body2">
              {formatExerciseTime(user.metrics.exercise)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={styles.metricCell}>
            <CircularProgress
              variant="determinate"
              value={user.metrics.avgAccuracy}
              size={40}
              thickness={4}
              sx={{ color: "#4CAF50" }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {formatNumber(user.metrics.avgAccuracy)}%
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={styles.metricCell}>
            <ScaleIcon color="action" fontSize="small" />
            <Typography variant="body2">
              {formatNumber(user.metrics.weightLossKg)} kg
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={styles.detailsButton}
          >
            {expanded ? "Hide" : "Show"} Details
          </Button>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} sx={styles.expandedCell}>
            <UserDetails user={user} formatNumber={formatNumber} formatExerciseTime={formatExerciseTime} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// User details component (same as before)
const UserDetails = ({ user, formatNumber, formatExerciseTime }) => (
  <Grid container spacing={2} sx={styles.detailsContainer}>
    <Grid item xs={12} md={4}>
      <Card sx={styles.detailCard}>
        <CardContent>
          <Typography variant="h6" sx={styles.detailTitle}>
            <ScaleIcon sx={styles.detailIcon} />
            Weight Metrics
          </Typography>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Initial Weight:</Typography>
            <Typography variant="body1">{formatNumber(user.weight)} kg</Typography>
          </Box>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Current Weight:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatNumber(user.metrics.currentWeight)} kg
            </Typography>
          </Box>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Weight Loss:</Typography>
            <Typography variant="body1" color="success.main">
              {formatNumber(user.metrics.weightLossKg)} kg
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card sx={styles.detailCard}>
        <CardContent>
          <Typography variant="h6" sx={styles.detailTitle}>
            <CaloriesIcon sx={styles.detailIcon} />
            Activity Metrics
          </Typography>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Total Workouts:</Typography>
            <Typography variant="body1">{user.metrics.workouts}</Typography>
          </Box>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Calories Burned:</Typography>
            <Typography variant="body1">{formatNumber(user.metrics.calories)} kcal</Typography>
          </Box>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Exercise Time:</Typography>
            <Typography variant="body1">{formatExerciseTime(user.metrics.exercise)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} md={4}>
      <Card sx={styles.detailCard}>
        <CardContent>
          <Typography variant="h6" sx={styles.detailTitle}>
            <TrendIcon sx={styles.detailIcon} />
            Performance
          </Typography>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">Average Accuracy:</Typography>
            <Typography variant="body1">{formatNumber(user.metrics.avgAccuracy)}%</Typography>
          </Box>
          <Box sx={styles.detailItem}>
            <Typography variant="body2">BMI Status:</Typography>
            <Typography variant="body1">
              {user.metrics.bmi} ({user.metrics.bmiCategory})
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Styles (same as before)
const styles = {
  container: {
    padding: 3,
    maxWidth: 1800,
    margin: "0 auto",
  },
  title: {
    fontWeight: "bold",
    color: "#3B1E54",
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
    mb: 4,
  },
  controls: {
    display: 'flex',
    gap: 2,
    mb: 3,
    alignItems: 'center'
  },
  searchField: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  pdfButton: {
    backgroundColor: "#3B1E54",
    color: "#FFF",
    "&:hover": { backgroundColor: "#5D3A7E" },
    minWidth: 180
  },
  tableContainer: {
    borderRadius: 2,
    overflow: 'hidden',
    boxShadow: 3
  },
  tableHeader: {
    backgroundColor: "#3B1E54",
  },
  headerCell: {
    color: "#FFF !important",
    fontWeight: "bold",
    fontSize: "0.875rem",
    py: 1.5
  },
  userRow: {
    "&:nth-of-type(even)": {
      backgroundColor: "#F9F5FF"
    }
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  avatar: {
    width: 40,
    height: 40
  },
  metricCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5
  },
  smallProgress: {
    height: 6,
    width: '80%',
    borderRadius: 3
  },
  detailsButton: {
    textTransform: 'none',
    color: "#3B1E54",
    fontWeight: "bold"
  },
  expandedCell: {
    padding: 0,
    backgroundColor: "#F5F5F5"
  },
  detailsContainer: {
    p: 2
  },
  detailCard: {
    height: '100%',
    borderRadius: 2,
    boxShadow: 'none',
    border: '1px solid #EEE'
  },
  detailTitle: {
    display: 'flex',
    alignItems: 'center',
    mb: 2,
    color: "#3B1E54",
    fontSize: '1rem'
  },
  detailIcon: {
    mr: 1,
    fontSize: '1.25rem'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 1.5
  },
  pagination: {
    mt: 2,
    "& .MuiTablePagination-toolbar": {
      justifyContent: "flex-end"
    }
  }
};

export default AdminUserMetrics;