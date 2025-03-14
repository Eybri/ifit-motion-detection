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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const generatePDF = async (chartRef, title, data) => {
    if (!chartRef.current) return;

    const pdf = new jsPDF("portrait");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add logos
    const systemLogo = "/images/1.png"; // Replace with actual path
    const schoolLogo = "/images/tup.jpg"; // Replace with actual path

    // Add school logo
    pdf.addImage(schoolLogo, "PNG", 10, 10, 30, 30);

    // Add system name
    pdf.setFontSize(18);
    pdf.text("IFIT-MOTION-DETECTION", 50, 20);

    // Add system logo
    pdf.addImage(systemLogo, "PNG", pageWidth - 40, 10, 30, 30);

    // Add prepared by information
    pdf.setFontSize(12);
    pdf.text("Prepared by:", 20, 50);
    pdf.setFont("helvetica", "normal");
    pdf.text("Avery Macasa.", 20, 55);
    pdf.text("Bryan James Batan", 20, 60);
    pdf.text("Gelgin Delos Santos", 20, 65);
    pdf.text("Tyron Justine Medina", 20, 70);

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 20, 85);

    // Generate intelligent analysis based on the data
    let analysis = "";
    if (title === "Active vs Inactive Users") {
      const activeUsers = data.activeUsers;
      const inactiveUsers = data.inactiveUsers;
      const totalUsers = activeUsers + inactiveUsers;
      const activePercentage = ((activeUsers / totalUsers) * 100).toFixed(2);
      const inactivePercentage = ((inactiveUsers / totalUsers) * 100).toFixed(2);

      analysis = `Analysis:
  - There are ${activeUsers} active users and ${inactiveUsers} inactive users.
  - ${activePercentage}% of users are active, while ${inactivePercentage}% are inactive.
  - Recommendation: Focus on re-engaging inactive users through targeted campaigns.`;
    } else if (title === "Users by Gender") {
      const maleUsers = data.maleUsers;
      const femaleUsers = data.femaleUsers;
      const totalUsers = maleUsers + femaleUsers;
      const malePercentage = ((maleUsers / totalUsers) * 100).toFixed(2);
      const femalePercentage = ((femaleUsers / totalUsers) * 100).toFixed(2);

      analysis = `Analysis:
  - There are ${maleUsers} male users and ${femaleUsers} female users.
  - ${malePercentage}% of users are male, while ${femalePercentage}% are female.
  - Recommendation: Ensure gender-balanced marketing strategies to engage all users.`;
    } else if (title === "Users by BMI Category") {
      const underweight = data.underweight;
      const normal = data.normal;
      const overweight = data.overweight;
      const obese = data.obese;
      const totalUsers = underweight + normal + overweight + obese;

      analysis = `Analysis:
  - Underweight Users: ${underweight} (${((underweight / totalUsers) * 100).toFixed(2)}%)
  - Normal Users: ${normal} (${((normal / totalUsers) * 100).toFixed(2)}%)
  - Overweight Users: ${overweight} (${((overweight / totalUsers) * 100).toFixed(2)}%)
  - Obese Users: ${obese} (${((obese / totalUsers) * 100).toFixed(2)}%)
  - Recommendation: Provide personalized health plans for overweight and obese users.`;
    } else if (title === "BMI Distribution") {
      const averageBMI = (data.reduce((sum, user) => sum + user.bmi, 0) / data.length).toFixed(2);
      const minBMI = Math.min(...data.map((user) => user.bmi)).toFixed(2);
      const maxBMI = Math.max(...data.map((user) => user.bmi)).toFixed(2);

      analysis = `Analysis:
  - Average BMI: ${averageBMI}
  - Minimum BMI: ${minBMI}
  - Maximum BMI: ${maxBMI}
  - Recommendation: Monitor users with extreme BMI values and provide tailored health advice.`;
    } else if (title === "Leaderboard - Average Accuracy") {
      const topUser = data[0]; // Assuming data is sorted by average accuracy
      const averageAccuracy = (data.reduce((sum, user) => sum + user.average_accuracy, 0) / data.length).toFixed(2);

      analysis = `Analysis:
  - Top User: ${topUser.name} with ${topUser.average_accuracy}% accuracy.
  - Average Accuracy: ${averageAccuracy}%
  - Recommendation: Recognize top performers and provide training for users with lower accuracy.`;
    }

    // Add analysis
    pdf.setFontSize(12);
    pdf.text(analysis, 20, 95, { maxWidth: pageWidth - 40 });

    // Add chart image
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Ensure the chart fits on the page
    const chartStartY = 120;
    if (imgHeight > pageHeight - chartStartY - 10) {
      pdf.addPage();
    }

    pdf.addImage(imgData, "PNG", 10, chartStartY, imgWidth, imgHeight);

    // Add footer
    pdf.setFontSize(10);
    pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, pageHeight - 10);

    // Save PDF
    pdf.save(`${title}.pdf`);
  };

  const generateOverallPDF = async () => {
    const pdf = new jsPDF("portrait");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add logos
    const systemLogo = "/images/1.png"; // Replace with actual path
    const schoolLogo = "/images/tup.jpg"; // Replace with actual path

    // Add school logo
    pdf.addImage(schoolLogo, "PNG", 10, 10, 30, 30);

    // Add system name
    pdf.setFontSize(18);
    pdf.text("IFIT-MOTION-DETECTION", 50, 20);

    // Add system logo
    pdf.addImage(systemLogo, "PNG", pageWidth - 40, 10, 30, 30);

    // Add prepared by information
    pdf.setFontSize(12);
    pdf.text("Prepared by:", 20, 50);
    pdf.setFont("helvetica", "normal");
    pdf.text("Avery Macasa.", 20, 55);
    pdf.text("Bryan James Batan", 20, 60);
    pdf.text("Gelgin Delos Santos", 20, 65);
    pdf.text("Tyron Justine Medina", 20, 70);

    // Add title
    pdf.setFontSize(16);
    pdf.text("Overall Dashboard Report", 20, 85);

    // Generate intelligent analysis for each chart
    let analysis = "";

    // Analysis for Active vs Inactive Users
    const activeUsersCount = activeUsers.length;
    const inactiveUsersCount = inactiveUsers.length;
    const totalUsersCount = activeUsersCount + inactiveUsersCount;
    const activePercentage = ((activeUsersCount / totalUsersCount) * 100).toFixed(2);
    const inactivePercentage = ((inactiveUsersCount / totalUsersCount) * 100).toFixed(2);

    analysis += `Active vs Inactive Users Analysis:
- There are ${activeUsersCount} active users and ${inactiveUsersCount} inactive users.
- ${activePercentage}% of users are active, while ${inactivePercentage}% are inactive.
- Recommendation: Focus on re-engaging inactive users through targeted campaigns.\n\n`;

    // Analysis for Users by Gender
    const maleUsersCount = maleUsers.length;
    const femaleUsersCount = femaleUsers.length;
    const totalGenderUsers = maleUsersCount + femaleUsersCount;
    const malePercentage = ((maleUsersCount / totalGenderUsers) * 100).toFixed(2);
    const femalePercentage = ((femaleUsersCount / totalGenderUsers) * 100).toFixed(2);

    analysis += `Users by Gender Analysis:
- There are ${maleUsersCount} male users and ${femaleUsersCount} female users.
- ${malePercentage}% of users are male, while ${femalePercentage}% are female.
- Recommendation: Ensure gender-balanced marketing strategies to engage all users.\n\n`;

    // Analysis for Users by BMI Category
    const underweightCount = underweightUsers.length;
    const normalCount = normalUsers.length;
    const overweightCount = overweightUsers.length;
    const obeseCount = obeseUsers.length;
    const totalBMIUsers = underweightCount + normalCount + overweightCount + obeseCount;

    analysis += `Users by BMI Category Analysis:
- Underweight Users: ${underweightCount} (${((underweightCount / totalBMIUsers) * 100).toFixed(2)}%)
- Normal Users: ${normalCount} (${((normalCount / totalBMIUsers) * 100).toFixed(2)}%)
- Overweight Users: ${overweightCount} (${((overweightCount / totalBMIUsers) * 100).toFixed(2)}%)
- Obese Users: ${obeseCount} (${((obeseCount / totalBMIUsers) * 100).toFixed(2)}%)
- Recommendation: Provide personalized health plans for overweight and obese users.\n\n`;

    // Analysis for BMI Distribution
    const averageBMI = (bmiData.reduce((sum, user) => sum + user.bmi, 0) / bmiData.length).toFixed(2);
    const minBMI = Math.min(...bmiData.map((user) => user.bmi)).toFixed(2);
    const maxBMI = Math.max(...bmiData.map((user) => user.bmi)).toFixed(2);

    analysis += `BMI Distribution Analysis:
- Average BMI: ${averageBMI}
- Minimum BMI: ${minBMI}
- Maximum BMI: ${maxBMI}
- Recommendation: Monitor users with extreme BMI values and provide tailored health advice.\n\n`;

    // Analysis for Leaderboard - Average Accuracy
    if (leaderboardData.length > 0) {
      const topUser = leaderboardData[0]; // Assuming data is sorted by average accuracy
      const averageAccuracy = (leaderboardData.reduce((sum, user) => sum + user.average_accuracy, 0) / leaderboardData.length).toFixed(2);

      analysis += `Leaderboard - Average Accuracy Analysis:
- Top User: ${topUser.name} with ${topUser.average_accuracy}% accuracy.
- Average Accuracy: ${averageAccuracy}%
- Recommendation: Recognize top performers and provide training for users with lower accuracy.\n\n`;
    }

    // Add analysis
    pdf.setFontSize(12);
    pdf.text(analysis, 20, 95, { maxWidth: pageWidth - 40 });

    // Add charts
    let chartStartY = 200; // Adjusted y-position for the first chart

    // Add Pie Chart - Active vs. Inactive Users
    const pieChartCanvas = await html2canvas(pieChartRef.current);
    const pieChartImgData = pieChartCanvas.toDataURL("image/png");
    const pieChartImgWidth = pageWidth - 20;
    const pieChartImgHeight = (pieChartCanvas.height * pieChartImgWidth) / pieChartCanvas.width;

    pdf.addImage(pieChartImgData, "PNG", 10, chartStartY, pieChartImgWidth, pieChartImgHeight);
    chartStartY += pieChartImgHeight + 10;

    // Add Bar Chart - Users by Gender
    const barChartGenderCanvas = await html2canvas(barChartGenderRef.current);
    const barChartGenderImgData = barChartGenderCanvas.toDataURL("image/png");
    const barChartGenderImgWidth = pageWidth - 20;
    const barChartGenderImgHeight = (barChartGenderCanvas.height * barChartGenderImgWidth) / barChartGenderCanvas.width;

    if (chartStartY + barChartGenderImgHeight > pageHeight) {
      pdf.addPage();
      chartStartY = 20;
    }

    pdf.addImage(barChartGenderImgData, "PNG", 10, chartStartY, barChartGenderImgWidth, barChartGenderImgHeight);
    chartStartY += barChartGenderImgHeight + 10;

    // Add Bar Chart - Users by BMI Category
    const barChartBMICanvas = await html2canvas(barChartBMIRef.current);
    const barChartBMIImgData = barChartBMICanvas.toDataURL("image/png");
    const barChartBMIImgWidth = pageWidth - 20;
    const barChartBMIImgHeight = (barChartBMICanvas.height * barChartBMIImgWidth) / barChartBMICanvas.width;

    if (chartStartY + barChartBMIImgHeight > pageHeight) {
      pdf.addPage();
      chartStartY = 20;
    }

    pdf.addImage(barChartBMIImgData, "PNG", 10, chartStartY, barChartBMIImgWidth, barChartBMIImgHeight);
    chartStartY += barChartBMIImgHeight + 10;

    // Add Line Chart - BMI Distribution with User Names
    const lineChartCanvas = await html2canvas(lineChartRef.current);
    const lineChartImgData = lineChartCanvas.toDataURL("image/png");
    const lineChartImgWidth = pageWidth - 20;
    const lineChartImgHeight = (lineChartCanvas.height * lineChartImgWidth) / lineChartCanvas.width;

    if (chartStartY + lineChartImgHeight > pageHeight) {
      pdf.addPage();
      chartStartY = 20;
    }

    pdf.addImage(lineChartImgData, "PNG", 10, chartStartY, lineChartImgWidth, lineChartImgHeight);
    chartStartY += lineChartImgHeight + 10;

    // Add Bar Chart - Leaderboard (Average Accuracy)
    if (leaderboardData.length > 0) {
      const leaderboardChartCanvas = await html2canvas(leaderboardChartRef.current);
      const leaderboardChartImgData = leaderboardChartCanvas.toDataURL("image/png");
      const leaderboardChartImgWidth = pageWidth - 20;
      const leaderboardChartImgHeight = (leaderboardChartCanvas.height * leaderboardChartImgWidth) / leaderboardChartCanvas.width;

      if (chartStartY + leaderboardChartImgHeight > pageHeight) {
        pdf.addPage();
        chartStartY = 20;
      }

      pdf.addImage(leaderboardChartImgData, "PNG", 10, chartStartY, leaderboardChartImgWidth, leaderboardChartImgHeight);
    }

    // Add footer
    pdf.setFontSize(10);
    pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, pageHeight - 10);

    // Save PDF
    pdf.save("Overall_Dashboard_Report.pdf");
  };

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
              <div ref={pieChartRef} style={{ width: "70%", height: "auto", margin: "auto" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
              <Button
                variant="contained"
                color="primary"
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
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
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
              <div ref={barChartGenderRef} style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataGender} options={barChartOptions} />
              </div>
              <Button
                variant="contained"
                color="primary"
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
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
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
              <div ref={barChartBMIRef} style={{ width: "80%", height: "auto", margin: "auto" }}>
                <Bar data={barChartDataBMI} options={barChartOptions} />
              </div>
              <Button
                variant="contained"
                color="primary"
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
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
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
              <div ref={lineChartRef}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  generatePDF(
                    lineChartRef,
                    "BMI Distribution",
                    bmiData
                  )
                }
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
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
                <>
                  <div ref={leaderboardChartRef} style={{ width: "80%", height: "auto", margin: "auto" }}>
                    <Bar data={barChartDataLeaderboard} options={barChartOptions} />
                  </div>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      generatePDF(
                        leaderboardChartRef,
                        "Leaderboard - Average Accuracy",
                        leaderboardData
                      )
                    }
                    sx={{ mt: 2 }}
                  >
                    Download PDF
                  </Button>
                </>
              ) : (
                <Typography variant="body1" align="center">
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
            color="primary"
            onClick={generateOverallPDF}
            sx={{ mt: 2, mb: 4 }}
          >
            Download Overall PDF Report
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

