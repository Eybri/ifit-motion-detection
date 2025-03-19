import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";
import CountUp from "react-countup";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { generatePDF, generateOverallPDF } from "../../utils/pdfExport"; // Import PDF export functions

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartDataLabels
);

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [maleUsers, setMaleUsers] = useState([]);
  const [femaleUsers, setFemaleUsers] = useState([]);
  const [underweightUsers, setUnderweightUsers] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [overweightUsers, setOverweightUsers] = useState([]);
  const [obeseUsers, setObeseUsers] = useState([]);
  const [bmiData, setBmiData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  // Refs for charts
  const pieChartRef = useRef(null);
  const barChartGenderRef = useRef(null);
  const barChartBMIRef = useRef(null);
  const lineChartRef = useRef(null);
  const leaderboardChartRef = useRef(null);
  const totalDancesChartRef = useRef(null); // Ref for Total Dances chart
  const caloriesBurnedChartRef = useRef(null); // Ref for Calories Burned chart

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users data
        const usersResponse = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const users = usersResponse.data.users;
        setTotalUsers(users.length);

        // Filter and store user names
        setActiveUsers(users.filter((user) => user.status === "Active"));
        setInactiveUsers(users.filter((user) => user.status === "Inactive"));
        setMaleUsers(users.filter((user) => user.gender === "male"));
        setFemaleUsers(users.filter((user) => user.gender === "female"));

        // Calculate BMI for each user and store with names
        const bmiValues = users.map((user) => ({
          name: user.name,
          bmi: user.weight / ((user.height / 100) ** 2),
        }));

        setBmiData(bmiValues);

        // Categorize BMI and store user names
        setUnderweightUsers(bmiValues.filter((user) => user.bmi < 18.5));
        setNormalUsers(bmiValues.filter((user) => user.bmi >= 18.5 && user.bmi < 25));
        setOverweightUsers(bmiValues.filter((user) => user.bmi >= 25 && user.bmi < 30));
        setObeseUsers(bmiValues.filter((user) => user.bmi >= 30));

        // Fetch leaderboard data
        const leaderboardResponse = await axios.get("http://localhost:5000/api/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(leaderboardResponse.data)) {
          setLeaderboardData(leaderboardResponse.data);
        } else {
          console.error("Unexpected leaderboard response structure:", leaderboardResponse.data);
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Pie Chart Data (Active vs. Inactive Users)
  const pieChartData = {
    labels: ["Active Users", "Inactive Users"],
    datasets: [
      {
        data: [activeUsers.length, inactiveUsers.length],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverBackgroundColor: ["#388E3C", "#D32F2F"],
      },
    ],
  };

  // Pie Chart Options
  const pieChartOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          return `${context.chart.data.labels[context.dataIndex]}\n${value}`;
        },
      },
    },
  };

  // Bar Chart Data (Users by Gender)
  const barChartDataGender = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Users",
        data: [maleUsers.length, femaleUsers.length],
        backgroundColor: ["#2196F3", "#E91E63"],
        hoverBackgroundColor: ["#1976D2", "#C2185B"],
      },
    ],
  };

  // Bar Chart Data (Users by BMI Category)
  const barChartDataBMI = {
    labels: ["Underweight", "Normal", "Overweight", "Obese"],
    datasets: [
      {
        label: "Users",
        data: [
          underweightUsers.length,
          normalUsers.length,
          overweightUsers.length,
          obeseUsers.length,
        ],
        backgroundColor: ["#FFEB3B", "#4CAF50", "#FF9800", "#F44336"],
        hoverBackgroundColor: ["#FBC02D", "#388E3C", "#F57C00", "#D32F2F"],
      },
    ],
  };

  // Bar Chart Data (Leaderboard - Average Accuracy)
  const barChartDataLeaderboard = {
    labels: leaderboardData.map((user) => user.name),
    datasets: [
      {
        label: "Average Accuracy",
        data: leaderboardData.map((user) => user.average_accuracy),
        backgroundColor: "#9C27B0",
        hoverBackgroundColor: "#7B1FA2",
      },
    ],
  };

  // Bar Chart Options
  const barChartOptions = {
    plugins: {
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => {
          return value;
        },
      },
    },
  };

  // Line Chart Data (BMI Distribution with User Names)
  const lineChartData = {
    labels: bmiData.map((user) => user.name),
    datasets: [
      {
        label: "BMI Values",
        data: bmiData.map((user) => user.bmi),
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        tension: 0.3,
      },
    ],
  };

  // Line Chart Options
  const lineChartOptions = {
    plugins: {
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => {
          return value.toFixed(2);
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
        },
      },
    },
  };

  // Line Chart Data (Total Dances)
  const lineChartDataTotalDances = {
    labels: leaderboardData.map((user) => user.name),
    datasets: [
      {
        label: "Total Dances",
        data: leaderboardData.map((user) => user.total_dances),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
        tension: 0.3,
      },
    ],
  };

  // Line Chart Options for Total Dances
  const lineChartOptionsTotalDances = {
    plugins: {
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "top",
        font: {
          weight: "bold",
          size: 12,
        },
        formatter: (value) => {
          return value;
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
        },
      },
    },
  };

  // Doughnut Chart Data (Calories Burned)
  const doughnutChartDataCaloriesBurned = {
    labels: leaderboardData.map((user) => user.name),
    datasets: [
      {
        label: "Calories Burned",
        data: leaderboardData.map((user) => (user.average_accuracy / 100) * (user.total_dances * 10)),
        backgroundColor: ["#4CAF50", "#81C784", "#A5D6A7", "#C8E6C9"],
        hoverBackgroundColor: ["#388E3C", "#66BB6A", "#81C784", "#A5D6A7"],
      },
    ],
  };

  // Doughnut Chart Options
  const doughnutChartOptionsCaloriesBurned = {
    plugins: {
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value, context) => {
          return `${context.chart.data.labels[context.dataIndex]}\n${value}`;
        },
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, paddingTop: "64px", fontFamily: "'Poppins', sans-serif" }}>
      {/* Dashboard Header */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 'bold', color: 'black', mb: 4 }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Total Users
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                {loading ? <CircularProgress size={24} /> : <CountUp end={totalUsers} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ color: "#4CAF50", fontFamily: "'Poppins', sans-serif" }}>
                {loading ? <CircularProgress size={24} /> : <CountUp end={activeUsers.length} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Inactive Users
              </Typography>
              <Typography variant="h4" sx={{ color: "#F44336", fontFamily: "'Poppins', sans-serif" }}>
                {loading ? <CircularProgress size={24} /> : <CountUp end={inactiveUsers.length} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart - Active vs. Inactive Users */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Active vs. Inactive Users
              </Typography>
              <div ref={pieChartRef} style={{ width: "70%", height: "auto", margin: "auto" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
              <Button
                variant="contained"
                onClick={() =>
                  generatePDF(
                    pieChartRef,
                    "Active vs Inactive Users",
                    {
                      activeUsers: activeUsers.length,
                      inactiveUsers: inactiveUsers.length,
                    }
                  )
                }
                sx={{
                  mt: 2,
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: '#99BC85',
                  color: '#FDFAF6',
                  '&:hover': {
                    backgroundColor: '#88A876',
                  },
                }}
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Users by Gender */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Users by Gender
              </Typography>
              <div ref={barChartGenderRef} style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataGender} options={barChartOptions} />
              </div>
              <Button
                variant="contained"
                onClick={() =>
                  generatePDF(
                    barChartGenderRef,
                    "Users by Gender",
                    {
                      maleUsers: maleUsers.length,
                      femaleUsers: femaleUsers.length,
                    }
                  )
                }
                sx={{
                  mt: 2,
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: '#99BC85',
                  color: '#FDFAF6',
                  '&:hover': {
                    backgroundColor: '#88A876',
                  },
                }}
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Users by BMI Category */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Users by BMI Category
              </Typography>
              <div ref={barChartBMIRef} style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataBMI} options={barChartOptions} />
              </div>
              <Button
                variant="contained"
                onClick={() =>
                  generatePDF(
                    barChartBMIRef,
                    "Users by BMI Category",
                    {
                      underweight: underweightUsers.length,
                      normal: normalUsers.length,
                      overweight: overweightUsers.length,
                      obese: obeseUsers.length,
                    }
                  )
                }
                sx={{
                  mt: 2,
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: '#99BC85',
                  color: '#FDFAF6',
                  '&:hover': {
                    backgroundColor: '#88A876',
                  },
                }}
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart - BMI Distribution with User Names */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                BMI Distribution
              </Typography>
              <div ref={lineChartRef}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
              <Button
                variant="contained"
                onClick={() =>
                  generatePDF(
                    lineChartRef,
                    "BMI Distribution",
                    bmiData
                  )
                }
                sx={{
                  mt: 2,
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: '#99BC85',
                  color: '#FDFAF6',
                  '&:hover': {
                    backgroundColor: '#88A876',
                  },
                }}
              >
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart - Total Dances */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Total Dances (Line Chart)
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : leaderboardData.length > 0 ? (
                <>
                  <div ref={totalDancesChartRef}>
                    <Line data={lineChartDataTotalDances} options={lineChartOptionsTotalDances} />
                  </div>
                  <Button
                    variant="contained"
                    onClick={() =>
                      generatePDF(
                        totalDancesChartRef,
                        "Total Dances (Line Chart)",
                        leaderboardData
                      )
                    }
                    sx={{
                      mt: 2,
                      fontFamily: "'Poppins', sans-serif",
                      backgroundColor: '#99BC85',
                      color: '#FDFAF6',
                      '&:hover': {
                        backgroundColor: '#88A876',
                      },
                    }}
                  >
                    Download PDF
                  </Button>
                </>
              ) : (
                <Typography variant="body1" align="center" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                  No leaderboard data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Doughnut Chart - Calories Burned */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#FDFAF6' }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
                Calories Burned (Doughnut Chart)
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : leaderboardData.length > 0 ? (
                <>
                  <div ref={caloriesBurnedChartRef}>
                    <Pie data={doughnutChartDataCaloriesBurned} options={doughnutChartOptionsCaloriesBurned} />
                  </div>
                  <Button
                    variant="contained"
                    onClick={() =>
                      generatePDF(
                        caloriesBurnedChartRef,
                        "Calories Burned (Doughnut Chart)",
                        leaderboardData
                      )
                    }
                    sx={{
                      mt: 2,
                      fontFamily: "'Poppins', sans-serif",
                      backgroundColor: '#99BC85',
                      color: '#FDFAF6',
                      '&:hover': {
                        backgroundColor: '#88A876',
                      },
                    }}
                  >
                    Download PDF
                  </Button>
                </>
              ) : (
                <Typography variant="body1" align="center" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                  No leaderboard data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Button to download overall PDF report */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() =>
              generateOverallPDF({
                activeUsers,
                inactiveUsers,
                maleUsers,
                femaleUsers,
                underweightUsers,
                normalUsers,
                overweightUsers,
                obeseUsers,
                bmiData,
                leaderboardData,
                pieChartRef,
                barChartGenderRef,
                barChartBMIRef,
                lineChartRef,
                leaderboardChartRef,
                totalDancesChartRef,
                caloriesBurnedChartRef,
              })
            }
            sx={{
              mt: 2,
              mb: 4,
              fontFamily: "'Poppins', sans-serif",
              backgroundColor: '#99BC85',
              color: '#FDFAF6',
              '&:hover': {
                backgroundColor: '#88A876',
              },
            }}
          >
            Download Overall PDF Report
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
