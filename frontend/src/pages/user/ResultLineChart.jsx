import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";

const ResultLineChart = ({ results }) => {
  const [filter, setFilter] = useState("perDay"); // Default filter is per day

  // Process results based on the selected filter
  const processData = () => {
    let processedData = [];

    if (filter === "perDay") {
      // Group by day
      const groupedData = {};

      results.forEach((result) => {
        const date = new Date(result.created_at);
        const key = date.toLocaleDateString(); // Group by day

        if (!groupedData[key]) {
          groupedData[key] = {
            date: key,
            accuracy_score: 0,
            calories_burned: 0,
            steps_taken: 0,
            movement_efficiency: 0,
            count: 0,
          };
        }

        groupedData[key].accuracy_score += result.accuracy_score;
        groupedData[key].calories_burned += result.calories_burned;
        groupedData[key].steps_taken += result.steps_taken;
        groupedData[key].movement_efficiency += result.movement_efficiency;
        groupedData[key].count += 1;
      });

      // Calculate averages for each day
      processedData = Object.values(groupedData).map((data) => ({
        ...data,
        accuracy_score: data.accuracy_score / data.count,
        calories_burned: data.calories_burned / data.count,
        steps_taken: data.steps_taken / data.count,
        movement_efficiency: data.movement_efficiency / data.count,
      }));
    } else if (filter === "count") {
      // Group by number of results (e.g., show the first 10, next 10, etc.)
      processedData = results.map((result, index) => ({
        date: `Session ${index + 1}`,
        accuracy_score: result.accuracy_score,
        calories_burned: result.calories_burned,
        steps_taken: result.steps_taken,
        movement_efficiency: result.movement_efficiency,
      }));
    } else if (filter === "month") {
      // Group by month
      const groupedData = {};

      results.forEach((result) => {
        const date = new Date(result.created_at);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // Group by year and month

        if (!groupedData[key]) {
          groupedData[key] = {
            date: key,
            accuracy_score: 0,
            calories_burned: 0,
            steps_taken: 0,
            movement_efficiency: 0,
            count: 0,
          };
        }

        groupedData[key].accuracy_score += result.accuracy_score;
        groupedData[key].calories_burned += result.calories_burned;
        groupedData[key].steps_taken += result.steps_taken;
        groupedData[key].movement_efficiency += result.movement_efficiency;
        groupedData[key].count += 1;
      });

      // Calculate averages
      processedData = Object.values(groupedData).map((data) => ({
        ...data,
        accuracy_score: data.accuracy_score / data.count,
        calories_burned: data.calories_burned / data.count,
        steps_taken: data.steps_taken / data.count,
        movement_efficiency: data.movement_efficiency / data.count,
      }));
    }

    return processedData;
  };

  const chartData = processData();

  return (
    <Box
      sx={{
        margin: 1,
        padding: 4,
        backgroundColor: "#1e1e1e", // Dark background
        borderRadius: "12px", // Rounded corners
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", // Floating shadow effect
        border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)", // Floating effect on hover
          boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.7)", // Enhanced shadow on hover
        },
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
        Progress Over Time
      </Typography>

      {/* Filter Toggle Buttons */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, newFilter) => setFilter(newFilter)}
        sx={{
          marginBottom: 2,
          backgroundColor: "#A5BFCC", // Light background color
          borderRadius: "8px", // Rounded corners
          padding: "4px", // Add some padding
        }}
      >
        <ToggleButton
          value="perDay"
          aria-label="Filter by Day"
          sx={{
            color: "#333", // Dark text color
            "&.Mui-selected": {
              backgroundColor: "#F4EDD3", // Light background when selected
              color: "#333", // Dark text color when selected
            },
            "&:hover": {
              backgroundColor: "#e0e0e0", // Light background on hover
            },
          }}
        >
          Per Day
        </ToggleButton>
        <ToggleButton
          value="count"
          aria-label="Filter by Sessions"
          sx={{
            color: "#333", // Dark text color
            "&.Mui-selected": {
              backgroundColor: "#F4EDD3", // Light background when selected
              color: "#333", // Dark text color when selected
            },
            "&:hover": {
              backgroundColor: "#e0e0e0", // Light background on hover
            },
          }}
        >
          By Number of Results
        </ToggleButton>
        <ToggleButton
          value="month"
          aria-label="Filter by Month"
          sx={{
            color: "#333", // Dark text color
            "&.Mui-selected": {
              backgroundColor: "#F4EDD3", // Light background when selected
              color: "#333", // Dark text color when selected
            },
            "&:hover": {
              backgroundColor: "#e0e0e0", // Light background on hover
            },
          }}
        >
          By Month
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={385}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" /> {/* Darker grid lines */}
          <XAxis dataKey="date" stroke="#fff" /> {/* White text for axes */}
          <YAxis stroke="#fff" /> {/* White text for axes */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#333", // Dark tooltip background
              border: "1px solid #555", // Subtle border
              borderRadius: "8px", // Rounded corners
              color: "#fff", // White text
            }}
          />
          <Legend
            wrapperStyle={{
              color: "#fff", // White text for legend
            }}
          />
          <Line type="monotone" dataKey="accuracy_score" stroke="#8884d8" name="Accuracy Score" />
          <Line type="monotone" dataKey="calories_burned" stroke="#82ca9d" name="Calories Burned" />
          <Line type="monotone" dataKey="steps_taken" stroke="#ffc658" name="Steps Taken" />
          <Line type="monotone" dataKey="movement_efficiency" stroke="#ff8042" name="Movement Efficiency" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ResultLineChart;