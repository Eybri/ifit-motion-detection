import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, CircularProgress, Box, IconButton } from "@mui/material";
import { getToken, getUserId } from "../../utils/auth";
import { toast } from "react-toastify";
import Slider from "react-slick";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ResultLineChart from "./ResultLineChart";
import OverallChart from "./OverallChart";
import HistoryGraph from "./HistoryGraph";

const CustomArrow = ({ onClick, direction }) => (
  <IconButton onClick={onClick} sx={{ position: "absolute", [direction === "prev" ? "left" : "right"]: 0, top: "50%", transform: "translateY(-50%)", zIndex: 1, bgcolor: "rgba(255, 255, 255, 0.8)", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" } }}>
    {direction === "prev" ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
  </IconButton>
);

const HistoryResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
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

      {/* Slider for Individual Results */}
      <Slider {...settings}>
        {results.map((result) => (
          <Box key={result.result_id} sx={{ p: 2 }}>
            <Card sx={{ bgcolor: "#2e2e2e", borderRadius: "12px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)", transition: "transform 0.3s, box-shadow 0.3s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.7)" } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>Date: {new Date(result.created_at).toLocaleString()}</Typography>
                <Typography variant="body2" gutterBottom sx={{ color: "#ccc" }}>Dance Session: {result.video_id}</Typography>
                <HistoryGraph result={result} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}><strong>Performance Score:</strong> {result.performance_score.toFixed(2)}</Typography>
                  <Typography variant="body2" sx={{ color: "#fff" }}><strong>Motion Matching Score:</strong> {result.motion_matching_score.toFixed(2)}</Typography>
                  <Typography variant="body2" sx={{ color: "#fff" }}><strong>Energy Expenditure:</strong> {result.energy_expenditure}</Typography>
                  <Typography variant="body2" sx={{ color: "#fff" }}><strong>Steps Per Minute:</strong> {result.steps_per_minute}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HistoryResults;