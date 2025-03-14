import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";

const HistoryGraph = ({ result }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#2e2e2e", // Dark background
        borderRadius: "12px", // Rounded corners
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", // Floating shadow effect
        border: "1px solid rgba(255, 255, 255, 0.1)", // Subtle border
        padding: 2,
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)", // Floating effect on hover
          boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.7)", // Enhanced shadow on hover
        },
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
        Key Metrics
      </Typography>
      <Box sx={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              { name: "Accuracy", value: result.accuracy_score },
              { name: "Calories", value: result.calories_burned },
              { name: "Steps", value: result.steps_taken },
              { name: "Efficiency", value: result.movement_efficiency },
            ]}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" /> {/* Darker grid lines */}
            <XAxis dataKey="name" stroke="#fff" /> {/* White text for axes */}
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
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default HistoryGraph;