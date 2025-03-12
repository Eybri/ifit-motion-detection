import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { Container, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
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
  const [leaderboardData, setLeaderboardData] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const token = getToken();

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

        // Log the response for debugging
        console.log("Leaderboard Response:", leaderboardResponse.data);

        // Set leaderboard data directly (response is an array)
        if (Array.isArray(leaderboardResponse.data)) {
          setLeaderboardData(leaderboardResponse.data);
        } else {
          console.error("Unexpected leaderboard response structure:", leaderboardResponse.data);
          setLeaderboardData([]); // Set to empty array if data is not in the expected format
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
          return value.toFixed(2); // Format BMI to 2 decimal places
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, paddingTop: "64px" }}>
      <Grid container spacing={3}>
        {/* Total Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {loading ? <CircularProgress size={24} /> : <CountUp end={totalUsers} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ color: "#4CAF50" }}>
                {loading ? <CircularProgress size={24} /> : <CountUp end={activeUsers.length} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inactive Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inactive Users
              </Typography>
              <Typography variant="h4" sx={{ color: "#F44336" }}>
                {loading ? <CircularProgress size={24} /> : <CountUp end={inactiveUsers.length} duration={2.5} separator="," />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart - Active vs. Inactive Users */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Active vs. Inactive Users
              </Typography>
              <div style={{ width: "70%", height: "auto", margin: "auto" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Users by Gender */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Users by Gender
              </Typography>
              <div style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataGender} options={barChartOptions} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Users by BMI Category */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Users by BMI Category
              </Typography>
              <div style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataBMI} options={barChartOptions} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart - BMI Distribution with User Names */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                BMI Distribution
              </Typography>
              <Line data={lineChartData} options={lineChartOptions} />
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Leaderboard (Average Accuracy) */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" align="center" gutterBottom>
                Leaderboard - Average Accuracy
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : leaderboardData.length > 0 ? (
                <div style={{ width: "80%", height: "auto", margin: "auto" }}>
                  <Bar data={barChartDataLeaderboard} options={barChartOptions} />
                </div>
              ) : (
                <Typography variant="body1" align="center">
                  No leaderboard data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

