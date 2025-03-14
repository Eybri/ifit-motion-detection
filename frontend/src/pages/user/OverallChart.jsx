import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";
import { Box, Typography } from "@mui/material";

const OverallChart = ({ results }) => {
  // Process data for the scatter plot
  const chartData = results.map((result) => {
    const intensity = result.calories_burned / result.exercise_duration; // Intensity = calories burned per minute
    return {
      timeDuration: parseFloat(result.exercise_duration.toFixed(2)), // Time duration (2 decimal places)
      caloriesBurned: parseFloat(result.calories_burned.toFixed(2)), // Calories burned (2 decimal places)
      intensity: parseFloat(intensity.toFixed(2)), // Intensity (calories per minute)
    };
  });

  return (
    <Box
      sx={{
        margin: 1 ,
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
        Dance Intensity Analysis
      </Typography>

      {/* Scatter Plot for Calories Burned vs. Time Duration */}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#fff" /> {/* Darker grid lines */}
          <XAxis
            type="number"
            dataKey="timeDuration"
            name="Time Duration (mins)"
            unit=" mins"
            stroke="#fff" // White text for axes
          />
          <YAxis
            type="number"
            dataKey="caloriesBurned"
            name="Calories Burned"
            unit=" kcal"
            stroke="#fff" // White text for axes
          />
          <ZAxis
            dataKey="intensity"
            range={[100, 1000]} // Adjust bubble size range
            name="Intensity"
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "Intensity") {
                return `${value} kcal/min`;
              }
              return value.toFixed(2);
            }}
            contentStyle={{
              backgroundColor: "#fff", // Dark tooltip background
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
          <Scatter
            name="Dance Sessions"
            data={chartData}
            fill="#8884d8"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Explanation */}
      <Box sx={{ marginTop: 2 }}>
        <Typography variant="body1" sx={{ color: "#fff" }}>
          <strong>Intensity</strong> is calculated as <strong>Calories Burned per Minute</strong>.
        </Typography>
        <Typography variant="body1" sx={{ color: "#fff" }}>
          The larger the bubble, the higher the intensity of the dance session.
        </Typography>
      </Box>
    </Box>
  );
};

export default OverallChart;