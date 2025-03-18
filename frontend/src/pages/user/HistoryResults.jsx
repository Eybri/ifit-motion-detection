import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { getToken, getUserId } from "../../utils/auth";
import { toast } from "react-toastify";
import ResultLineChart from "./ResultLineChart";
import OverallChart from "./OverallChart";
import jsPDF from "jspdf";

const HistoryResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleResults, setVisibleResults] = useState(3); // Show 3 results initially
  const [showAll, setShowAll] = useState(false); // Toggle to show all results

  const fetchUserResults = async () => {
    try {
      const token = getToken();
      const userId = getUserId();
      if (!token || !userId) {
        toast.error("Please log in to view your history.", { position: "bottom-right" });
        return;
      }
      const response = await axios.get("http://localhost:5000/api/leaderboard", { params: { fetch_all: true, user_id: userId }, headers: { Authorization: `Bearer ${token}` } });
      setResults(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch dance results.");
      setLoading(false);
      toast.error("Failed to fetch dance results.", { position: "bottom-right" });
    }
  };

  useEffect(() => {
    fetchUserResults();
  }, []);

  const calculateAverages = (results) => {
    if (results.length === 0) return null;

    const total = results.reduce(
      (acc, result) => ({
        performance_score: acc.performance_score + result.performance_score,
        motion_matching_score: acc.motion_matching_score + result.motion_matching_score,
        energy_expenditure: acc.energy_expenditure + result.energy_expenditure,
        steps_per_minute: acc.steps_per_minute + result.steps_per_minute,
      }),
      { performance_score: 0, motion_matching_score: 0, energy_expenditure: 0, steps_per_minute: 0 }
    );

    const averages = {
      performance_score: (total.performance_score / results.length).toFixed(2),
      motion_matching_score: (total.motion_matching_score / results.length).toFixed(2),
      energy_expenditure: (total.energy_expenditure / results.length).toFixed(2),
      steps_per_minute: (total.steps_per_minute / results.length).toFixed(2),
    };

    return averages;
  };

  const averages = calculateAverages(results);

  const generateAnalysisPDF = (averages) => {
    const doc = new jsPDF();
    
    // Define colors and styling
    const primaryColor = [0, 123, 255]; // Blue
    const secondaryColor = [52, 58, 64]; // Dark gray
    const accentColor = [220, 53, 69]; // Red
    
    // Add fancy header with border
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Add logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("I-FIT MOTION DETECTION", 105, 15, { align: "center" });
    
    // Add border to the entire page
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(5, 30, 200, 235);
    
    // Add report title
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE ANALYSIS REPORT", 105, 40, { align: "center" });
    
    // Add horizontal separator
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.3);
    doc.line(15, 45, 195, 45);
    
    // Set content styling
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Add summary section with background
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 55, 180, 50, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE SUMMARY", 105, 65, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    // Add performance metrics with improved formatting
    doc.text(`Performance Score: ${averages.performance_score}`, 25, 75);
    doc.text(`Motion Matching: ${averages.motion_matching_score}`, 25, 85);
    doc.text(`Energy Expenditure: ${averages.energy_expenditure} calories`, 25, 95);
    doc.text(`Steps Per Minute: ${averages.steps_per_minute}`, 120, 75);
    
    // Add recommendations section title
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED RECOMMENDATIONS", 105, 120, { align: "center" });
    
    // Add horizontal separator
    doc.line(15, 125, 195, 125);
    
    // Format recommendations in two columns
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const recommendations = [
      "Practice Regularly: Consistency is key to improvement.",
      "Focus on Timing and Rhythm: Use a metronome or practice with music that has a clear beat.",
      "Increase Intensity Gradually: Gradually increase the intensity of your dance sessions.",
      "Work on Movement Efficiency: Analyze your movements to identify unnecessary energy expenditure.",
      "Improve Posture and Alignment: Proper posture is essential for executing dance moves effectively.",
      "Incorporate Cross-Training: Engage in activities like yoga, Pilates, or strength training.",
      "Record and Review Your Sessions: Record your dance sessions to identify areas for improvement.",
      "Seek Feedback: Regularly seek feedback from a dance instructor or peers.",
      "Set Specific Goals: Define clear, measurable goals for your dance practice.",
      "Stay Hydrated and Nourished: Proper hydration and nutrition are essential for energy levels.",
      "Rest and Recover: Avoid overtraining by incorporating rest days into your routine."
    ];
    
    let yPos = 135;
    recommendations.forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 20, yPos);
      yPos += 10;
    });
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated on " + new Date().toLocaleDateString(), 105, 285, { align: "center" });
    
    // Add decorative element
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(3);
    doc.line(5, 290, 205, 290);
    
    // Save the PDF
    doc.save("i-fit_performance_analysis.pdf");
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setVisibleResults(showAll ? 3 : results.length); // Show all results if toggled
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", bgcolor: "#1e1e1e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <CircularProgress />
      <Typography variant="body1" sx={{ ml: 2, color: "#fff" }}>Loading your dance results...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", bgcolor: "#1e1e1e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <Typography variant="h6" color="error">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#1e1e1e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)", transition: "transform 0.3s, box-shadow 0.3s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.7)" } }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>Your Dance Results History</Typography>

      {/* Row for OverallChart and ResultLineChart */}
      <Box sx={{ display: "flex", flexDirection: "row", gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <OverallChart results={results} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ResultLineChart results={results} />
        </Box>
      </Box>

      {/* Display Results One by One */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {results.slice(0, visibleResults).map((result) => (
          <Card key={result.result_id} sx={{ bgcolor: "#2e2e2e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)", transition: "transform 0.3s, box-shadow 0.3s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.7)" } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>Date: {new Date(result.created_at).toLocaleString()}</Typography>
              <Typography variant="body2" gutterBottom sx={{ color: "#ccc" }}>Dance Session: {result.video_id}</Typography>

              {/* Table Format for Key Metrics */}
              <TableContainer component={Paper} sx={{ bgcolor: "#2e2e2e", color: "#fff", mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Metric</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Accuracy Score</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{result.accuracy_score.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Calories Burned</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{result.calories_burned}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Steps Taken</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{result.steps_taken}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Movement Efficiency</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{result.movement_efficiency}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: "#fff" }}><strong>Performance Score:</strong> {result.performance_score.toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}><strong>Motion Matching Score:</strong> {result.motion_matching_score.toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}><strong>Energy Expenditure:</strong> {result.energy_expenditure}</Typography>
                <Typography variant="body2" sx={{ color: "#fff" }}><strong>Steps Per Minute:</strong> {result.steps_per_minute}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* "See More" Button */}
      {results.length > 3 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={toggleShowAll}>
            {showAll ? "See Less" : "See More"}
          </Button>
        </Box>
      )}

      {/* Performance Analysis and Recommendations */}
      <Box sx={{ mt: 4, p: 3, bgcolor: "#2e2e2e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
          Performance Analysis
        </Typography>
        {averages ? (
          <Button variant="contained" color="primary" onClick={() => generateAnalysisPDF(averages)}>
            Download Performance Analysis PDF
          </Button>
        ) : (
          <Typography variant="body1" sx={{ color: "#fff" }}>No data available for analysis.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default HistoryResults;