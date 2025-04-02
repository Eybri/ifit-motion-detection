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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Scale as ScaleIcon,
  Whatshot as CaloriesIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendIcon,
  FitnessCenter as ExerciseIcon,
  Info as InfoIcon
} from "@mui/icons-material";

const Progress = () => {
  const [userData, setUserData] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyTargets] = useState({
    calories: 2000,
    exercise: 300, // 5 hours
    workouts: 5
  });

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
        const user = JSON.parse(localStorage.getItem("user"));
        
        // Parallel API calls
        const [userRes, resultsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/leaderboard?fetch_all=true", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!userRes.ok || !resultsRes.ok) throw new Error("Data fetch failed");
        
        const [usersData, resultsData] = await Promise.all([userRes.json(), resultsRes.json()]);
        
        setUserData(usersData.users.find(u => u.email === user.email));
        setUserResults(resultsData.filter(r => r.email === user.email));
        
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate all metrics
  const calculateMetrics = () => {
    if (!userResults.length || !userData) return null;
    
    const totals = userResults.reduce((acc, result) => ({
      calories: (acc.calories || 0) + (result.calories_burned || 0),
      exercise: (acc.exercise || 0) + (result.exercise_duration || 0),
      accuracy: (acc.accuracy || 0) + (result.accuracy_score || 0),
      workouts: (acc.workouts || 0) + 1,
    }), {});

    const weightLossKg = totals.calories / 7700; // 7700 kcal ≈ 1kg
    const currentWeight = userData.weight ? userData.weight - weightLossKg : null;
    const bmi = currentWeight && userData.height ? 
      (currentWeight / ((userData.height / 100) ** 2)).toFixed(1) : "N/A";
    
    return {
      ...totals,
      weightLossKg,
      currentWeight,
      bmi,
      bmiCategory: classifyBMI(bmi),
      avgAccuracy: totals.accuracy / totals.workouts,
      weeklyProgress: {
        calories: (totals.calories / weeklyTargets.calories) * 100,
        exercise: (totals.exercise / weeklyTargets.exercise) * 100,
        workouts: (totals.workouts / weeklyTargets.workouts) * 100
      }
    };
  };

  const classifyBMI = (bmi) => {
    if (bmi === "N/A") return "N/A";
    const num = parseFloat(bmi);
    if (num < 18.5) return "Underweight";
    if (num < 25) return "Healthy";
    if (num < 30) return "Overweight";
    return "Obese";
  };

  if (loading) return <Loader />;
  if (!userData) return <NoDataMessage />;

  const metrics = calculateMetrics();
  if (!metrics) return <NoResultsMessage />;

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        <ExerciseIcon sx={{ mr: 1 }} />
        Fitness Progress Overview
      </Typography>
      
      <Typography variant="subtitle1" sx={styles.subtitle}>
        Comprehensive tracking of your fitness journey
      </Typography>

      <Grid container spacing={4}>
        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <SummaryCard 
            userData={userData} 
            metrics={metrics} 
            formatNumber={formatNumber}
          />
        </Grid>

        {/* Progress Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <MetricCard
              icon={<CaloriesIcon fontSize="large" />}
              title="Calories Burned"
              value={`${formatNumber(metrics.calories)} kcal`}
              progress={metrics.weeklyProgress.calories}
              description={`${formatNumber(metrics.weightLossKg, 3)} kg potential weight loss`}
              color="#FF5722"
            />

            <MetricCard
              icon={<TimeIcon fontSize="large" />}
              title="Exercise Time"
              value={formatExerciseTime(metrics.exercise)}
              progress={metrics.weeklyProgress.exercise}
              description={`${metrics.workouts} dance${metrics.dances !== 1 ? 's' : ''} completed`}
              color="#2196F3"
            />

            <MetricCard
              icon={<TrendIcon fontSize="large" />}
              title="Performance"
              value={`${formatNumber(metrics.avgAccuracy)}%`}
              progress={metrics.avgAccuracy}
              description={`Average accuracy across ${metrics.workouts} sessions`}
              color="#4CAF50"
              circular
            />

            <WeightProgressCard 
              userData={userData}
              metrics={metrics}
              formatNumber={formatNumber}
            />
          </Grid>
        </Grid>
      </Grid>

      <ToastContainer position="bottom-right" />
    </Box>
  );
};

// Component for the summary card
const SummaryCard = ({ userData, metrics, formatNumber }) => (
  <Card sx={styles.card}>
    <CardContent>
      <Box sx={styles.cardHeader}>
        <ScaleIcon sx={styles.largeIcon} />
        <Typography variant="h6" sx={styles.cardTitle}>
          Health Summary
        </Typography>
      </Box>
      
      <Box sx={styles.summaryItem}>
        <Typography variant="body2" color="text.secondary">
          Starting Weight
        </Typography>
        <Typography variant="body1">
          {formatNumber(userData.weight)} kg
        </Typography>
      </Box>

      <Box sx={styles.summaryItem}>
        <Typography variant="body2" color="text.secondary">
          Current Weight
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          {formatNumber(metrics.currentWeight)} kg
        </Typography>
      </Box>

      <Divider sx={styles.divider} />

      <Box sx={styles.summaryItem}>
        <Typography variant="body2" color="text.secondary">
          BMI
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {metrics.bmi} ({metrics.bmiCategory})
          </Typography>
          <Tooltip title="Body Mass Index">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
      </Box>

      <Box sx={styles.summaryItem}>
        <Typography variant="body2" color="text.secondary">
          Total Weight Change
        </Typography>
        <Typography variant="body1" color={metrics.weightLossKg >= 0 ? 'success.main' : 'error.main'}>
          {metrics.weightLossKg >= 0 ? '-' : '+'}{formatNumber(Math.abs(metrics.weightLossKg), 3)} kg
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(100, (metrics.weightLossKg / userData.weight) * 100)}
        sx={styles.progressBar}
      />

      <Chip
        label={`${((metrics.weightLossKg / userData.weight) * 100).toFixed(1)}% of initial weight`}
        color="primary"
        size="small"
        sx={styles.progressChip}
      />
    </CardContent>
  </Card>
);

// Reusable metric card component
const MetricCard = ({ icon, title, value, progress, description, color, circular = false }) => (
  <Grid item xs={12} sm={6}>
    <Card sx={styles.card}>
      <CardContent>
        <Box sx={styles.cardHeader}>
          <Box sx={{ ...styles.iconContainer, color }}>
            {icon}
          </Box>
          <Typography variant="h6" sx={styles.cardTitle}>
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ ...styles.metricValue, color }}>
          {value}
        </Typography>

        <Typography variant="body2" sx={styles.metricDescription}>
          {description}
        </Typography>

        {circular ? (
          <Box sx={styles.circularProgressContainer}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={80}
              thickness={5}
              sx={{ color }}
            />
            <Box sx={styles.circularProgressLabel}>
              <Typography variant="h6">
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, progress)}
              sx={{ ...styles.progressBar, backgroundColor: `${color}20`, '& .MuiLinearProgress-bar': { backgroundColor: color } }}
            />
            
          </>
        )}
      </CardContent>
    </Card>
  </Grid>
);

// Specialized weight progress card
const WeightProgressCard = ({ userData, metrics, formatNumber }) => (
  <Grid item xs={12} sm={6}>
    <Card sx={styles.card}>
      <CardContent>
        <Box sx={styles.cardHeader}>
          <TrendIcon fontSize="large" sx={styles.iconContainer} />
          <Typography variant="h6" sx={styles.cardTitle}>
            Weight Progress
          </Typography>
        </Box>

        <Box sx={styles.weightComparison}>
          <Box>
            <Typography variant="caption">Starting</Typography>
            <Typography variant="h6">{formatNumber(userData.weight)} kg</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption">Change</Typography>
            <Typography 
              variant="h6" 
              color={metrics.weightLossKg >= 0 ? 'success.main' : 'error.main'}
            >
              {metrics.weightLossKg >= 0 ? '-' : '+'}{formatNumber(Math.abs(metrics.weightLossKg))} kg
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption">Current</Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatNumber(metrics.currentWeight)} kg
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(100, (metrics.weightLossKg / userData.weight) * 100)}
          sx={styles.progressBar}
        />

        <Box sx={styles.weeklySummary}>
          <Typography variant="body2">
            <strong>This week:</strong> {formatNumber(metrics.weightLossKg, 3)} kg potential loss
          </Typography>
          <Typography variant="body2">
            <strong>Calories-to-weight:</strong> 7,700 kcal ≈ 1 kg
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

// Message components
const NoDataMessage = () => (
  <Box sx={styles.centerMessage}>
    <Typography variant="h6" color="textSecondary">
      No user data available
    </Typography>
  </Box>
);

const NoResultsMessage = () => (
  <Box sx={styles.centerMessage}>
    <Typography variant="h6" color="textSecondary">
      No workout results found
    </Typography>
  </Box>
);

// Styles
const styles = {
  container: {
    padding: 3,
    maxWidth: 1600,
    margin: "0 auto",
  },
  title: {
    fontWeight: "bold",
    color: "#3B1E54",
    textAlign: "center",
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
  card: {
    backgroundColor: "#F5F5F5",
    borderRadius: "12px",
    height: "100%",
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    mb: 2
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#3B1E54",
  },
  largeIcon: {
    fontSize: 40,
    color: "#3B1E54",
    mr: 2
  },
  iconContainer: {
    fontSize: 40,
    mr: 2
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 2
  },
  divider: {
    my: 2
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    mt: 2,
    mb: 1
  },
  progressChip: {
    mt: 1,
    alignSelf: 'flex-start'
  },
  metricValue: {
    fontWeight: "bold",
    mb: 1
  },
  metricDescription: {
    color: "#666",
    mb: 2
  },
  circularProgressContainer: {
    position: 'relative',
    display: 'inline-flex',
    mt: 2
  },
  circularProgressLabel: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightComparison: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 2,
    '& > div': {
      flex: 1
    }
  },
  weeklySummary: {
    mt: 2,
    '& > *': {
      mb: 1
    }
  },
  centerMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
  }
};

export default Progress;