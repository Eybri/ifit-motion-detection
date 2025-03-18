import React, { useState, useEffect } from "react";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Layout/Loader";
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
  TextField,
  TablePagination,
  Button,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserMetrics = () => {
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserResults = async () => {
      try {
        const token = getToken();
        const response = await fetch("http://localhost:5000/api/leaderboard?fetch_all=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user results");

        const data = await response.json();
        // Filter out admin users
        const nonAdminUsers = data.filter((user) => !user.is_admin);
        setUserResults(nonAdminUsers);
      } catch (error) {
        console.error("Error fetching user results:", error);
        toast.error("Failed to fetch user results");
      } finally {
        setLoading(false);
      }
    };

    fetchUserResults();
  }, []);

  // Function to compute BMI
  const computeBMI = (weight, height) => {
    if (weight && height) return (weight / ((height / 100) ** 2)).toFixed(2);
    return "N/A";
  };

  // Function to classify BMI
  const classifyBMI = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 25) return "Normal";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    return "Obese";
  };

  // Function to aggregate user metrics
  const aggregateUserMetrics = (results) => {
    const userMetricsMap = {};

    results.forEach((result) => {
      const userId = result.user_id;

      if (!userMetricsMap[userId]) {
        userMetricsMap[userId] = {
          name: result.name || "N/A",
          email: result.email || "N/A",
          image: result.image || "/path/to/default-image.jpg",
          totalCaloriesBurned: 0,
          totalExerciseDuration: 0,
          totalAccuracyScores: 0,
          resultCount: 0,
          initialWeight: result.weight || 0,
          height: result.height || 0,
        };
      }

      userMetricsMap[userId].totalCaloriesBurned += result.calories_burned || 0;
      userMetricsMap[userId].totalExerciseDuration += result.exercise_duration || 0;
      userMetricsMap[userId].totalAccuracyScores += result.accuracy_score || 0;
      userMetricsMap[userId].resultCount += 1;
    });

    return Object.values(userMetricsMap).map((user) => {
      const weightLost = (user.totalCaloriesBurned / 7700).toFixed(2); // 7700 calories ≈ 1 kg
      const currentWeight = (user.initialWeight - weightLost).toFixed(2);
      const currentBMI = computeBMI(currentWeight, user.height);
      const bmiClassification = classifyBMI(currentBMI);

      return {
        ...user,
        averageAccuracy: (user.totalAccuracyScores / user.resultCount).toFixed(2),
        initialBMI: computeBMI(user.initialWeight, user.height),
        currentBMI,
        weightLost,
        currentWeight,
        bmiClassification,
      };
    });
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredUsers = aggregateUserMetrics(userResults).filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("User Metrics Report", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, null, null, "center");

    const headers = [
      "Name",
      "Email",
      "Total Calories Burned (kcal)",
      "Total Exercise Duration (minutes)",
      "Average Accuracy Score (%)",
      "Initial BMI",
      "Current BMI",
      "Weight Lost (kg)",
      "BMI Classification",
    ];
    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.totalCaloriesBurned.toFixed(2),
      user.totalExerciseDuration.toFixed(2),
      user.averageAccuracy,
      user.initialBMI,
      user.currentBMI,
      user.weightLost,
      user.bmiClassification,
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: "striped",
      styles: { fontSize: 10, textColor: [0, 0, 0], cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.5 },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save("user-metrics-report.pdf");
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ width: "90%", margin: "0 auto", overflow: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          background: "linear-gradient(90deg, #3B1E54, #9B7EBD)",
          color: "#EEEEEE",
          padding: "16px",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        User Metrics
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
        sx={{ marginBottom: 2, backgroundColor: "#9B7EBD", color: "#EEEEEE", "&:hover": { backgroundColor: "#3B1E54" } }}
      >
        Download PDF Report
      </Button>
      <TableContainer component={Paper} sx={{ backgroundColor: "#EEEEEE" }}>
        <Table sx={{ width: "100%", textAlign: "center" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#3B1E54" }}>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>User</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Total Calories Burned (kcal)</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Total Exercise Duration (minutes)</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Average Accuracy Score (%)</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Initial BMI</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Current BMI</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>Weight Lost (kg)</TableCell>
              <TableCell sx={{ color: "#EEEEEE", textAlign: "center" }}>BMI Classification</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#D4BEE4" } }}>
                <TableCell sx={{ textAlign: "start" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                    <Avatar src={user.image} alt={user.name} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        User
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.totalCaloriesBurned.toFixed(2)} kcal</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.totalExerciseDuration.toFixed(2)} minutes</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.averageAccuracy} %</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.initialBMI}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.currentBMI}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.weightLost} kg</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{user.bmiClassification}</TableCell>
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
      <ToastContainer />
    </Box>
  );
};

export default UserMetrics;