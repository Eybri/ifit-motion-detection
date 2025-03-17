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
  const doughnutChartRef = useRef(null); // Ref for Doughnut Chart

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
  
    // Create PDF in landscape orientation for better chart display
    const pdf = new jsPDF("landscape");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
  
    // Define colors and styling
    const primaryColor = "#1a73e8";
    const secondaryColor = "#4285f4";
    const textColor = "#202124";
    
    // Set document properties
    pdf.setProperties({
      title: `IFIT-MOTION-DETECTION: ${title}`,
      subject: "Data Analysis Report",
      author: "IFIT-MOTION-DETECTION Team",
      creator: "IFIT-MOTION-DETECTION System"
    });
  
    // Add header with logos and title
    const systemLogo = "/images/1.png"; 
    const schoolLogo = "/images/tup.jpg";
    
    // Add school logo
    pdf.addImage(schoolLogo, "PNG", 15, 10, 25, 25);
    
    // Add header line
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(15, 40, pageWidth - 15, 40);
    
    // Add system name with styling
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor);
    pdf.setFontSize(22);
    pdf.text("IFIT-MOTION-DETECTION", pageWidth / 2, 25, { align: "center" });
    
    // Add report title
    pdf.setTextColor(secondaryColor);
    pdf.setFontSize(16);
    pdf.text(`${title} Report`, pageWidth / 2, 35, { align: "center" });
    
    // Add system logo
    pdf.addImage(systemLogo, "PNG", pageWidth - 40, 10, 25, 25);
    
    // Add date on right side
    pdf.setTextColor(textColor);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 45, { align: "right" });
    

  
    // Generate enhanced intelligent analysis based on the data
    let analysis = {};
    let trends = "";
    let recommendations = "";
    
    if (title === "Active vs Inactive Users") {
      const activeUsers = data.activeUsers;
      const inactiveUsers = data.inactiveUsers;
      const totalUsers = activeUsers + inactiveUsers;
      const activePercentage = ((activeUsers / totalUsers) * 100).toFixed(2);
      const inactivePercentage = ((inactiveUsers / totalUsers) * 100).toFixed(2);
      
      analysis = {
        title: "USAGE STATISTICS",
        keyMetrics: [
          `Total Users: ${totalUsers}`,
          `Active Users: ${activeUsers} (${activePercentage}%)`,
          `Inactive Users: ${inactiveUsers} (${inactivePercentage}%)`
        ]
      };
      
      trends = `The system shows a ${activePercentage}% user engagement rate. This indicates ${
        activePercentage > 70 ? "strong user adoption" : 
        activePercentage > 50 ? "moderate user adoption" : 
        "challenges with user retention"
      }.`;
      
      recommendations = [
        `${inactivePercentage > 30 ? "Implement" : "Continue"} re-engagement campaigns targeting inactive users`,
        "Analyze usage patterns to identify drop-off points in user experience",
        `Consider ${activePercentage < 60 ? "introducing user incentives" : "highlighting success stories"} to boost engagement`
      ];
    } else if (title === "Users by Gender") {
      const maleUsers = data.maleUsers;
      const femaleUsers = data.femaleUsers;
      const totalUsers = maleUsers + femaleUsers;
      const malePercentage = ((maleUsers / totalUsers) * 100).toFixed(2);
      const femalePercentage = ((femaleUsers / totalUsers) * 100).toFixed(2);
      const genderGap = Math.abs(malePercentage - femalePercentage);
      
      analysis = {
        title: "GENDER DISTRIBUTION",
        keyMetrics: [
          `Total Users: ${totalUsers}`,
          `Male Users: ${maleUsers} (${malePercentage}%)`,
          `Female Users: ${femaleUsers} (${femalePercentage}%)`
        ]
      };
      
      trends = `Gender distribution shows a ${genderGap < 10 ? "balanced" : "notable"} gap of ${genderGap}% between male and female users. ${
        femalePercentage > malePercentage ? 
        "Female users dominate the platform." : 
        "Male users form the majority of our user base."
      }`;
      
      recommendations = [
        `${genderGap > 20 ? 
          "Implement targeted marketing to attract more " + 
          (malePercentage > femalePercentage ? "female" : "male") + 
          " users" : 
          "Maintain inclusive content that appeals to all genders"
        }`,
        "Analyze feature usage patterns by gender to identify preferences",
        "Consider user experience adjustments based on gender-specific feedback"
      ];
    } else if (title === "Users by BMI Category") {
      const underweight = data.underweight;
      const normal = data.normal;
      const overweight = data.overweight;
      const obese = data.obese;
      const totalUsers = underweight + normal + overweight + obese;
      
      const underweightPct = ((underweight / totalUsers) * 100).toFixed(2);
      const normalPct = ((normal / totalUsers) * 100).toFixed(2);
      const overweightPct = ((overweight / totalUsers) * 100).toFixed(2);
      const obesePct = ((obese / totalUsers) * 100).toFixed(2);
      
      analysis = {
        title: "BMI CATEGORY DISTRIBUTION",
        keyMetrics: [
          `Total Users Analyzed: ${totalUsers}`,
          `Underweight: ${underweight} (${underweightPct}%)`,
          `Normal: ${normal} (${normalPct}%)`,
          `Overweight: ${overweight} (${overweightPct}%)`,
          `Obese: ${obese} (${obesePct}%)`
        ]
      };
      
      const concernGroup = Math.max(
        parseFloat(underweightPct), 
        parseFloat(overweightPct), 
        parseFloat(obesePct)
      );
      const concernCategory = 
        concernGroup === parseFloat(underweightPct) ? "underweight" :
        concernGroup === parseFloat(overweightPct) ? "overweight" : "obese";
      
      trends = `${normalPct}% of users fall within the normal BMI range. The ${concernCategory} category represents a significant ${concernGroup}% of users, indicating a potential focus area for health interventions.`;
      
      recommendations = [
        `Develop specialized workout regimens for ${concernCategory} users`,
        `Create educational content about nutrition for users in ${
          parseFloat(underweightPct) > 15 ? "underweight" : 
          parseFloat(obesePct) > 15 ? "obese" : "all"
        } categories`,
        "Implement progress tracking features with achievable milestones",
        "Consider partnering with nutrition experts for personalized guidance"
      ];
    } else if (title === "BMI Distribution") {
      const averageBMI = (data.reduce((sum, user) => sum + user.bmi, 0) / data.length).toFixed(2);
      const minBMI = Math.min(...data.map((user) => user.bmi)).toFixed(2);
      const maxBMI = Math.max(...data.map((user) => user.bmi)).toFixed(2);
      const medianBMI = data.map(user => user.bmi).sort((a, b) => a - b)[Math.floor(data.length / 2)].toFixed(2);
      
      // Calculate standard deviation
      const mean = parseFloat(averageBMI);
      const variance = data.reduce((sum, user) => sum + Math.pow(user.bmi - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance).toFixed(2);
      
      analysis = {
        title: "BMI STATISTICAL ANALYSIS",
        keyMetrics: [
          `Total Sample Size: ${data.length}`,
          `Average BMI: ${averageBMI}`,
          `Median BMI: ${medianBMI}`,
          `Range: ${minBMI} - ${maxBMI}`,
          `Standard Deviation: ${stdDev}`
        ]
      };
      
      trends = `The average BMI of ${averageBMI} falls within the ${
        averageBMI < 18.5 ? "underweight" :
        averageBMI < 25 ? "normal" :
        averageBMI < 30 ? "overweight" : "obese"
      } category. The distribution shows a standard deviation of ${stdDev}, indicating ${
        parseFloat(stdDev) < 3 ? "relatively consistent" : "widely varying"
      } BMI values among users.`;
      
      recommendations = [
        "Implement personalized fitness programs based on BMI categories",
        `Focus on healthy weight maintenance for users in the ${
          parseFloat(averageBMI) < 18.5 ? "underweight" :
          parseFloat(averageBMI) < 25 ? "normal" :
          parseFloat(averageBMI) < 30 ? "overweight" : "obese"
        } range`,
        "Track BMI changes over time to measure program effectiveness",
        "Consider adding body composition analysis for more comprehensive assessment"
      ];
    } else if (title === "Leaderboard - Average Accuracy") {
      const topUser = data[0]; // Assuming data is sorted by average accuracy
      const bottomUser = data[data.length - 1];
      const averageAccuracy = (data.reduce((sum, user) => sum + user.average_accuracy, 0) / data.length).toFixed(2);
      const medianAccuracy = data.map(user => user.average_accuracy).sort((a, b) => a - b)[Math.floor(data.length / 2)].toFixed(2);
      
      analysis = {
        title: "PERFORMANCE METRICS",
        keyMetrics: [
          `Total Users Analyzed: ${data.length}`,
          `Top Performer: ${topUser.name} (${topUser.average_accuracy}%)`,
          `Average Accuracy: ${averageAccuracy}%`,
          `Median Accuracy: ${medianAccuracy}%`,
          `Lowest Accuracy: ${bottomUser.name} (${bottomUser.average_accuracy}%)`
        ]
      };
      
      const performanceGap = (topUser.average_accuracy - bottomUser.average_accuracy).toFixed(2);
      
      trends = `There is a ${performanceGap}% accuracy gap between top and bottom performers. The average accuracy of ${averageAccuracy}% indicates ${
        parseFloat(averageAccuracy) > 80 ? "excellent" :
        parseFloat(averageAccuracy) > 70 ? "good" :
        parseFloat(averageAccuracy) > 60 ? "moderate" : "concerning"
      } overall system efficacy.`;
      
      recommendations = [
        `${parseFloat(averageAccuracy) < 75 ? "Implement" : "Continue"} targeted training for users below ${medianAccuracy}% accuracy`,
        "Create achievement recognition system to motivate improvement",
        "Analyze motion patterns of top performers for training materials",
        `Consider ${parseFloat(performanceGap) > 30 ? "revising tutorial materials" : "advanced training modules"} to address performance gaps`
      ];
    }
  
    // Add analysis section with styled formatting
    const chartStartY = 65 ; // Starting Y position for chart
    
    // Title for analysis section
    pdf.setFillColor(primaryColor);
    pdf.rect(pageWidth / 2 + 5, 50, pageWidth / 2 - 20, 10, 'F');
    pdf.setTextColor('#FFFFFF');
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(analysis.title, pageWidth / 2 + 10, 57);
    
    // Key metrics
    pdf.setTextColor(textColor);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Key Metrics:", pageWidth / 2 + 5, 70);
    pdf.setFont("helvetica", "normal");
    
    analysis.keyMetrics.forEach((metric, index) => {
      pdf.text(`• ${metric}`, pageWidth / 2 + 10, 75 + (index * 5));
    });
    
    // Trends section
    const trendsY = 75 + (analysis.keyMetrics.length * 5) + 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Trends:", pageWidth / 2 + 5, trendsY);
    pdf.setFont("helvetica", "normal");
    
    const splitTrends = pdf.splitTextToSize(trends, pageWidth / 2 - 25);
    pdf.text(splitTrends, pageWidth / 2 + 10, trendsY + 5);
    
    // Recommendations section
    const recsY = trendsY + splitTrends.length * 5 + 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Recommendations:", pageWidth / 2 + 5, recsY);
    pdf.setFont("helvetica", "normal");
    
    if (Array.isArray(recommendations)) {
      recommendations.forEach((rec, index) => {
        pdf.text(`${index + 1}. ${rec}`, pageWidth / 2 + 10, recsY + 5 + (index * 5));
      });
    } else {
      const splitRecs = pdf.splitTextToSize(recommendations, pageWidth / 2 - 25);
      pdf.text(splitRecs, pageWidth / 2 + 10, recsY + 5);
    }
  
    // Add chart image
    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");
    
    // Calculate chart dimensions to fit nicely on left side
    const imgWidth = pageWidth / 2 - 25;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
    // Add chart with border
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(0.5);
    pdf.rect(15, chartStartY - 5, imgWidth + 10, imgHeight + 10);
    pdf.addImage(imgData, "PNG", 20, chartStartY, imgWidth, imgHeight);
    
 // Add chart title
 pdf.setFillColor(primaryColor);
 pdf.rect(15, chartStartY - 15, imgWidth + 10, 10, 'F');
 pdf.setTextColor('#FFFFFF');
 pdf.setFontSize(12);
 pdf.setFont("helvetica", "bold");
 pdf.text("VISUAL REPRESENTATION", 20, chartStartY - 7);

 // Add footer with page numbers
 const totalPages = 1; // Assuming one page for now
 pdf.setDrawColor(primaryColor);
 pdf.setLineWidth(0.5);
 pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

 pdf.setTextColor(textColor);
 pdf.setFontSize(8);
 pdf.setFont("helvetica", "italic");
 pdf.text("This report is automatically generated by the IFIT-MOTION-DETECTION system", pageWidth / 2, pageHeight - 15, { align: "center" });
 pdf.setFont("helvetica", "normal");
 pdf.text(`Page 1 of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: "right" });

 // Add watermark/copyright - Using the correct rotation approach for jsPDF
 pdf.setTextColor(220, 220, 220); // Light gray
 pdf.setFontSize(30);
 pdf.setFont("helvetica", "bold");

 // Correct way to rotate text in jsPDF
 const centerX = pageWidth / 2;
 const centerY = pageHeight / 2;

 // Save the current state
 pdf.saveGraphicsState();
 // Translate to the center point, rotate, and translate back
 pdf.text("IFIT-MOTION-DETECTION", centerX, centerY, {
   align: "center",
   angle: 45
 });
 // Restore the previous state
 pdf.restoreGraphicsState();

 // Add notes section if needed
 if (data.notes) {
   pdf.addPage();
   
   // Add header to new page
   pdf.setFillColor(primaryColor);
   pdf.rect(15, 15, pageWidth - 30, 10, 'F');
   pdf.setTextColor('#FFFFFF');
   pdf.setFontSize(12);
   pdf.setFont("helvetica", "bold");
   pdf.text(`${title} - Additional Notes`, pageWidth / 2, 22, { align: "center" });
   
   pdf.setTextColor(textColor);
   pdf.setFontSize(10);
   pdf.setFont("helvetica", "normal");
   pdf.text(pdf.splitTextToSize(data.notes, pageWidth - 40), 20, 40);
   
   // Add footer to new page
   pdf.setDrawColor(primaryColor);
   pdf.setLineWidth(0.5);
   pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
   pdf.setTextColor(textColor);
   pdf.setFontSize(8);
   pdf.text(`Page 2 of ${totalPages + 1}`, pageWidth - 15, pageHeight - 10, { align: "right" });
 }

 // Add appendix with data table if data is array-based
 if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
   // Add a new page for data tables
   pdf.addPage();
   
   // Add header to data table page
   pdf.setFillColor(primaryColor);
   pdf.rect(15, 15, pageWidth - 30, 10, 'F');
   pdf.setTextColor('#FFFFFF');
   pdf.setFontSize(12);
   pdf.setFont("helvetica", "bold");
   pdf.text(`${title} - Data Table`, pageWidth / 2, 22, { align: "center" });
   
   // Extract columns from first data object
   const columns = Object.keys(data[0]);
   const columnWidths = columns.map(col => Math.min(40, col.length * 5 + 10));
   const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
   const startX = (pageWidth - totalWidth) / 2;
   
   // Draw table header
   pdf.setFillColor(secondaryColor);
   pdf.rect(startX, 30, totalWidth, 10, 'F');
   pdf.setTextColor('#FFFFFF');
   pdf.setFont("helvetica", "bold");
   pdf.setFontSize(9);
   
   let currentX = startX;
   columns.forEach((col, i) => {
     pdf.text(col, currentX + 5, 37);
     currentX += columnWidths[i];
   });
   
   // Draw table rows
   pdf.setTextColor(textColor);
   pdf.setFont("helvetica", "normal");
   
   const maxRowsPerPage = Math.floor((pageHeight - 60) / 10);
   let rowY = 40;
   let pageCount = 1;
   
   data.forEach((row, rowIndex) => {
     // Check if we need a new page
     if (rowIndex > 0 && rowIndex % maxRowsPerPage === 0) {
       // Add footer to current page
       pdf.setDrawColor(primaryColor);
       pdf.setLineWidth(0.5);
       pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
       pdf.setTextColor(textColor);
       pdf.setFontSize(8);
       pdf.text(`Page ${2 + pageCount} of ${totalPages + 1 + Math.ceil(data.length / maxRowsPerPage)}`, pageWidth - 15, pageHeight - 10, { align: "right" });
       
       // Add new page
       pdf.addPage();
       pageCount++;
       
       // Add header to new page
       pdf.setFillColor(primaryColor);
       pdf.rect(15, 15, pageWidth - 30, 10, 'F');
       pdf.setTextColor('#FFFFFF');
       pdf.setFontSize(12);
       pdf.setFont("helvetica", "bold");
       pdf.text(`${title} - Data Table (continued)`, pageWidth / 2, 22, { align: "center" });
       
       // Reset row position
       rowY = 40;
       
       // Draw table header again
       pdf.setFillColor(secondaryColor);
       pdf.rect(startX, 30, totalWidth, 10, 'F');
       currentX = startX;
       columns.forEach((col, i) => {
         pdf.text(col, currentX + 5, 37);
         currentX += columnWidths[i];
       });
       
       pdf.setTextColor(textColor);
       pdf.setFont("helvetica", "normal");
       pdf.setFontSize(9);
     }
     
     // Draw row background (alternating colors)
     pdf.setFillColor(rowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff');
     pdf.rect(startX, rowY, totalWidth, 10, 'F');
     
     // Draw row data
     currentX = startX;
     columns.forEach((col, i) => {
       // Format cell value based on type
       let cellValue = row[col];
       if (typeof cellValue === 'number') {
         cellValue = cellValue % 1 === 0 ? cellValue.toString() : cellValue.toFixed(2);
       } else if (cellValue === null || cellValue === undefined) {
         cellValue = '-';
       }
       
       pdf.text(String(cellValue).substring(0, 20), currentX + 5, rowY + 7);
       currentX += columnWidths[i];
     });
     
     rowY += 10;
   });
   
   // Add footer to last page
   pdf.setDrawColor(primaryColor);
   pdf.setLineWidth(0.5);
   pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
   pdf.setTextColor(textColor);
   pdf.setFontSize(8);
   const finalPageNumber = 2 + pageCount;
   pdf.text(`Page ${finalPageNumber} of ${finalPageNumber}`, pageWidth - 15, pageHeight - 10, { align: "right" });
 }

 // Add QR code with linked report
 try {
   const qrCodeSize = 25;
   const qrCodeImg = await generateQRCode(`IFIT-MOTION-DETECTION:${title}`);
   pdf.addImage(qrCodeImg, "PNG", 15, pageHeight - 15 - qrCodeSize, qrCodeSize, qrCodeSize);
 } catch (error) {
   console.log("Could not generate QR code", error);
 }

 // Save PDF with formatted filename
 const cleanTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
 const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
 pdf.save(`ifit-${cleanTitle}-report-${timestamp}.pdf`);

 // Return the document for further processing if needed
 return pdf;
};

// Helper function to generate QR code
const generateQRCode = async (text) => {
 // This is a placeholder for QR code generation
 // In a real implementation, you would use a library like qrcode-generator
 // For now, we'll return a placeholder image
 return "/images/placeholder-qrcode.png";
};
  
  const generateOverallPDF = async () => {
    // Initialize PDF document with better quality settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Define consistent margins
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Set default font
    pdf.setFont("helvetica", "normal");
    
    // ===== HEADER SECTION =====
    // Add logos
    const systemLogo = "/images/1.png";
    const schoolLogo = "/images/tup.jpg";
    
    // Add school logo (left aligned)
    pdf.addImage(schoolLogo, "PNG", margin, margin, 25, 25);
    
    // Add system name (center aligned)
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 51, 102); // Dark blue for heading
    const systemName = "IFIT-MOTION-DETECTION";
    const systemNameWidth = pdf.getStringUnitWidth(systemName) * 20 / pdf.internal.scaleFactor;
    const systemNameX = (pageWidth - systemNameWidth) / 2;
    pdf.text(systemName, systemNameX, margin + 15);
    
    // Add system logo (right aligned)
    pdf.addImage(systemLogo, "PNG", pageWidth - margin - 25, margin, 25, 25);
    
    // Add horizontal line
    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 32, pageWidth - margin, margin + 32);
    
    // ===== PREPARED BY SECTION =====
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Prepared by:", margin, margin + 45);
    
    // Contributors
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const contributors = [
      "Avery Macasa",
      "Bryan James Batan",
      "Gelgin Delos Santos",
      "Tyron Justine Medina"
    ];
    
    contributors.forEach((name, index) => {
      pdf.text(name, margin + 5, margin + 52 + (index * 6));
    });
    
    // Date prepared
    pdf.setFontSize(11);
    pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, margin + 45);
    
    // ===== TITLE SECTION =====
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 51, 102);
    const title = "Overall Dashboard Report";
    const titleWidth = pdf.getStringUnitWidth(title) * 18 / pdf.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
    pdf.text(title, titleX, margin + 80);
    
    // ===== ANALYSIS SECTION =====
    // Section title
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Data Analysis & Insights", margin, margin + 90);
    
    // Underline section title
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.2);
    pdf.line(margin, margin + 92, margin + 70, margin + 92);
    
    // Generate intelligent analysis for each chart
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    let analysisY = margin + 100;
    
    // Analysis for Active vs Inactive Users
    const activeUsersCount = activeUsers.length;
    const inactiveUsersCount = inactiveUsers.length;
    const totalUsersCount = activeUsersCount + inactiveUsersCount;
    const activePercentage = ((activeUsersCount / totalUsersCount) * 100).toFixed(2);
    const inactivePercentage = ((inactiveUsersCount / totalUsersCount) * 100).toFixed(2);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Active vs Inactive Users Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");
    
    const activeAnalysis = [
      `• Active Users: ${activeUsersCount} (${activePercentage}%)`,
      `• Inactive Users: ${inactiveUsersCount} (${inactivePercentage}%)`,
      `• Recommendation: Focus on re-engaging inactive users through targeted campaigns.`
    ];
    
    activeAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + (index * 6));
    });
    
    analysisY += 25;
    
    // Analysis for Users by Gender
    const maleUsersCount = maleUsers.length;
    const femaleUsersCount = femaleUsers.length;
    const totalGenderUsers = maleUsersCount + femaleUsersCount;
    const malePercentage = ((maleUsersCount / totalGenderUsers) * 100).toFixed(2);
    const femalePercentage = ((femaleUsersCount / totalGenderUsers) * 100).toFixed(2);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Users by Gender Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");
    
    const genderAnalysis = [
      `• Male Users: ${maleUsersCount} (${malePercentage}%)`,
      `• Female Users: ${femaleUsersCount} (${femalePercentage}%)`,
      `• Recommendation: Ensure gender-balanced marketing strategies to engage all users.`
    ];
    
    genderAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + (index * 6));
    });
    
    analysisY += 25;
    
    // Analysis for Users by BMI Category
    const underweightCount = underweightUsers.length;
    const normalCount = normalUsers.length;
    const overweightCount = overweightUsers.length;
    const obeseCount = obeseUsers.length;
    const totalBMIUsers = underweightCount + normalCount + overweightCount + obeseCount;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Users by BMI Category Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");
    
    const bmiAnalysis = [
      `• Underweight Users: ${underweightCount} (${((underweightCount / totalBMIUsers) * 100).toFixed(2)}%)`,
      `• Normal Users: ${normalCount} (${((normalCount / totalBMIUsers) * 100).toFixed(2)}%)`,
      `• Overweight Users: ${overweightCount} (${((overweightCount / totalBMIUsers) * 100).toFixed(2)}%)`,
      `• Obese Users: ${obeseCount} (${((obeseCount / totalBMIUsers) * 100).toFixed(2)}%)`,
      `• Recommendation: Provide personalized health plans for overweight and obese users.`
    ];
    
    bmiAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + (index * 6));
    });
    
    analysisY += 35;
    
    // Analysis for BMI Distribution
    const averageBMI = (bmiData.reduce((sum, user) => sum + user.bmi, 0) / bmiData.length).toFixed(2);
    const minBMI = Math.min(...bmiData.map((user) => user.bmi)).toFixed(2);
    const maxBMI = Math.max(...bmiData.map((user) => user.bmi)).toFixed(2);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("BMI Distribution Analysis:", margin, analysisY);
    pdf.setFont("helvetica", "normal");
    
    const bmiDistributionAnalysis = [
      `• Average BMI: ${averageBMI}`,
      `• Minimum BMI: ${minBMI}`,
      `• Maximum BMI: ${maxBMI}`,
      `• Recommendation: Monitor users with extreme BMI values and provide tailored health advice.`
    ];
    
    bmiDistributionAnalysis.forEach((line, index) => {
      pdf.text(line, margin + 5, analysisY + 6 + (index * 6));
    });
    
    analysisY += 30;
    
    // Analysis for Leaderboard - Average Accuracy
    if (leaderboardData.length > 0) {
      const topUser = leaderboardData[0]; // Assuming data is sorted by average accuracy
      const averageAccuracy = (leaderboardData.reduce((sum, user) => sum + user.average_accuracy, 0) / leaderboardData.length).toFixed(2);
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Leaderboard - Average Accuracy Analysis:", margin, analysisY);
      pdf.setFont("helvetica", "normal");
      
      const leaderboardAnalysis = [
        `• Top User: ${topUser.name} with ${topUser.average_accuracy}% accuracy.`,
        `• Average Accuracy: ${averageAccuracy}%`,
        `• Recommendation: Recognize top performers and provide training for users with lower accuracy.`
      ];
      
      leaderboardAnalysis.forEach((line, index) => {
        pdf.text(line, margin + 5, analysisY + 6 + (index * 6));
      });
      
      analysisY += 25;
    }
    
    // ===== CHARTS SECTION =====
    // Add new page for charts
    pdf.addPage();
    
    // Charts section title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 51, 102);
    const chartsTitle = "Data Visualization Charts";
    const chartsTitleWidth = pdf.getStringUnitWidth(chartsTitle) * 16 / pdf.internal.scaleFactor;
    const chartsTitleX = (pageWidth - chartsTitleWidth) / 2;
    pdf.text(chartsTitle, chartsTitleX, margin + 10);
    
    // Add horizontal line
    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 15, pageWidth - margin, margin + 15);
    
    let chartStartY = margin + 25;
    
    // Add Pie Chart - Active vs. Inactive Users
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Active vs. Inactive Users Distribution", margin, chartStartY - 5);
    
    const pieChartCanvas = await html2canvas(pieChartRef.current);
    const pieChartImgData = pieChartCanvas.toDataURL("image/png");
    const pieChartImgWidth = contentWidth;
    const pieChartImgHeight = (pieChartCanvas.height * pieChartImgWidth) / pieChartCanvas.width;
    
    pdf.addImage(pieChartImgData, "PNG", margin, chartStartY, pieChartImgWidth, pieChartImgHeight);
    chartStartY += pieChartImgHeight + 15;
    
    // Add Bar Chart - Users by Gender
    if (chartStartY + 70 > pageHeight) {
      pdf.addPage();
      chartStartY = margin + 10;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Users by Gender Distribution", margin, chartStartY - 5);
    
    const barChartGenderCanvas = await html2canvas(barChartGenderRef.current);
    const barChartGenderImgData = barChartGenderCanvas.toDataURL("image/png");
    const barChartGenderImgWidth = contentWidth;
    const barChartGenderImgHeight = (barChartGenderCanvas.height * barChartGenderImgWidth) / barChartGenderCanvas.width;
    
    pdf.addImage(barChartGenderImgData, "PNG", margin, chartStartY, barChartGenderImgWidth, barChartGenderImgHeight);
    chartStartY += barChartGenderImgHeight + 15;
    
    // Add Bar Chart - Users by BMI Category
    if (chartStartY + 70 > pageHeight) {
      pdf.addPage();
      chartStartY = margin + 10;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Users by BMI Category Distribution", margin, chartStartY - 5);
    
    const barChartBMICanvas = await html2canvas(barChartBMIRef.current);
    const barChartBMIImgData = barChartBMICanvas.toDataURL("image/png");
    const barChartBMIImgWidth = contentWidth;
    const barChartBMIImgHeight = (barChartBMICanvas.height * barChartBMIImgWidth) / barChartBMICanvas.width;
    
    pdf.addImage(barChartBMIImgData, "PNG", margin, chartStartY, barChartBMIImgWidth, barChartBMIImgHeight);
    chartStartY += barChartBMIImgHeight + 15;
    
    // Add Line Chart - BMI Distribution with User Names
    if (chartStartY + 70 > pageHeight) {
      pdf.addPage();
      chartStartY = margin + 10;
    }
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("BMI Distribution Chart", margin, chartStartY - 5);
    
    const lineChartCanvas = await html2canvas(lineChartRef.current);
    const lineChartImgData = lineChartCanvas.toDataURL("image/png");
    const lineChartImgWidth = contentWidth;
    const lineChartImgHeight = (lineChartCanvas.height * lineChartImgWidth) / lineChartCanvas.width;
    
    pdf.addImage(lineChartImgData, "PNG", margin, chartStartY, lineChartImgWidth, lineChartImgHeight);
    chartStartY += lineChartImgHeight + 15;
    
    // Add Bar Chart - Leaderboard (Average Accuracy)
    if (leaderboardData.length > 0) {
      if (chartStartY + 70 > pageHeight) {
        pdf.addPage();
        chartStartY = margin + 10;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Leaderboard - Average Accuracy", margin, chartStartY - 5);
      
      const leaderboardChartCanvas = await html2canvas(leaderboardChartRef.current);
      const leaderboardChartImgData = leaderboardChartCanvas.toDataURL("image/png");
      const leaderboardChartImgWidth = contentWidth;
      const leaderboardChartImgHeight = (leaderboardChartCanvas.height * leaderboardChartImgWidth) / leaderboardChartCanvas.width;
      
      pdf.addImage(leaderboardChartImgData, "PNG", margin, chartStartY, leaderboardChartImgWidth, leaderboardChartImgHeight);
    }
    
    // Add footer to all pages
    const totalPages = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Add page border
      pdf.setDrawColor(0, 51, 102);
      pdf.setLineWidth(0.5);
      pdf.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));
      
      // Add footer with page number
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      
      // Add footer text
      const footerText = "IFIT-MOTION-DETECTION System | Dashboard Report";
      pdf.text(footerText, margin, pageHeight - margin + 5);
      
      // Add page numbers
      const pageText = `Page ${i} of ${totalPages}`;
      const pageTextWidth = pdf.getStringUnitWidth(pageText) * 9 / pdf.internal.scaleFactor;
      pdf.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - margin + 5);
      
      // Add timestamp
      const timestamp = new Date().toLocaleString();
      const timestampWidth = pdf.getStringUnitWidth(timestamp) * 9 / pdf.internal.scaleFactor;
      pdf.text(timestamp, pageWidth - margin - timestampWidth, pageHeight - margin + 10);
    }
    
    // Add report summary on the last page
    pdf.addPage();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 51, 102);
    pdf.text("Summary and Recommendations", margin, margin + 10);
    
    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 15, pageWidth - margin, margin + 15);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    
    // Summary text
    const summaryText = [
      "This report provides an overview of the IFIT-MOTION-DETECTION system's user base and performance metrics.",
      "Key findings include:",
      "• " + activePercentage + "% of users are currently active",
      "• Gender distribution shows " + malePercentage + "% male and " + femalePercentage + "% female users",
      "• BMI distribution indicates that " + ((normalCount / totalBMIUsers) * 100).toFixed(2) + "% of users fall within the normal BMI range",
      "• Average BMI across all users is " + averageBMI
    ];
    
    let summaryY = margin + 25;
    summaryText.forEach((line, index) => {
      if (index === 0 || index === 1) {
        pdf.setFont("helvetica", "bold");
      } else {
        pdf.setFont("helvetica", "normal");
      }
      pdf.text(line, margin, summaryY);
      summaryY += (index === 0 || index === 1) ? 10 : 6;
    });
    
    // Recommendations
    pdf.setFont("helvetica", "bold");
    pdf.text("Recommendations:", margin, summaryY + 5);
    pdf.setFont("helvetica", "normal");
    
    const recommendationsText = [
      "1. Implement targeted engagement strategies for inactive users to improve retention.",
      "2. Develop gender-specific programs to ensure balanced participation.",
      "3. Create personalized fitness plans based on BMI categories to improve health outcomes.",
      "4. Regularly monitor extreme BMI values and provide additional support.",
      "5. Recognize and reward high-performing users to maintain motivation.",
      "6. Provide additional training for users with lower accuracy scores."
    ];
    
    let recommendationsY = summaryY + 15;
    recommendationsText.forEach((line) => {
      pdf.text(line, margin, recommendationsY);
      recommendationsY += 6;
    });
    
    // Contact information
    pdf.setFont("helvetica", "bold");
    pdf.text("Contact Information:", margin, recommendationsY + 15);
    pdf.setFont("helvetica", "normal");
    
    const contactText = [
      "For questions or additional information, please contact:",
      "Email: support@ifit-motion.com",
      "Phone: +1-800-IFIT-SUP",
      "Website: www.ifit-motion-detection.com"
    ];
    
    let contactY = recommendationsY + 25;
    contactText.forEach((line) => {
      pdf.text(line, margin, contactY);
      contactY += 6;
    });
    
    // Save PDF with a descriptive filename including date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    pdf.save(`IFIT_Dashboard_Report_${dateStr}.pdf`);
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
    <Container maxWidth="xl" sx={{ mt: 4, paddingTop: "64px", fontFamily: "'Poppins', sans-serif" }}>
  {/* Dashboard Header */}
  <Typography 
    variant="h4" 
    gutterBottom 
    sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 'bold', color: 'black', mb: 4 }} // Custom styling for the header
  >
    Dashboard
  </Typography>

  <Grid container spacing={3}>
    {/* Total Users Card */}
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: 3, 
        height: "100%", 
        backgroundColor: '#FDFAF6', // Set card background color
      }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
          >
            Total Users
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
          >
            {loading ? <CircularProgress size={24} /> : <CountUp end={totalUsers} duration={2.5} separator="," />}
          </Typography>
        </CardContent>
      </Card>
        </Grid>

        {/* Active Users Card */}
        <Grid item xs={12} sm={6} md={4}>
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    height: "100%", 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Active Users
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ color: "#4CAF50", fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        {loading ? <CircularProgress size={24} /> : <CountUp end={activeUsers.length} duration={2.5} separator="," />}
      </Typography>
    </CardContent>
  </Card>
        </Grid>

        {/* Inactive Users Card */}
        <Grid item xs={12} sm={6} md={4}>
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    height: "100%", 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Inactive Users
      </Typography>
      <Typography 
        variant="h4" 
        sx={{ color: "#F44336", fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        {loading ? <CircularProgress size={24} /> : <CountUp end={inactiveUsers.length} duration={2.5} separator="," />}
      </Typography>
    </CardContent>
  </Card>
        </Grid>

        {/* Pie Chart - Active vs. Inactive Users */}
        <Grid item xs={12} md={6}>
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    height: "100%", 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Active vs. Inactive Users
      </Typography>
      <div 
        ref={pieChartRef} 
        style={{ width: "70%", height: "auto", margin: "auto" }}
      >
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
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font
    backgroundColor: '#99BC85', // Set button background color
    color: '#FDFAF6', // Set font color
    '&:hover': {
      backgroundColor: '#88A876', // Optional: Change hover color for better UX
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
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    height: "100%", 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Users by Gender
      </Typography>
      <div 
        ref={barChartGenderRef} 
        style={{ width: "80%", height: "auto", margin: "auto" }}
      >
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
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font
    backgroundColor: '#99BC85', // Set button background color
    color: '#FDFAF6', // Set font color
    '&:hover': {
      backgroundColor: '#88A876', // Optional: Change hover color for better UX
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
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Users by BMI Category
      </Typography>
      <div 
        ref={barChartBMIRef} 
        style={{ width: "80%", height: "auto", margin: "auto" }}
      >
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
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font
    backgroundColor: '#99BC85', // Set button background color
    color: '#FDFAF6', // Set font color
    '&:hover': {
      backgroundColor: '#88A876', // Optional: Change hover color for better UX
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
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
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
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font
    backgroundColor: '#99BC85', // Set button background color
    color: '#FDFAF6', // Set font color
    '&:hover': {
      backgroundColor: '#88A876', // Optional: Change hover color for better UX
    },
  }}
>
  Download PDF
</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Leaderboard (Average Accuracy) */}
        <Grid item xs={12}>
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: 3, 
    backgroundColor: '#FDFAF6', // Set card background color
  }}>
    <CardContent>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        sx={{ fontFamily: "'Poppins', sans-serif" }} // Font color remains unchanged
      >
        Leaderboard - Average Accuracy
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : leaderboardData.length > 0 ? (
        <>
          <div 
            ref={leaderboardChartRef} 
            style={{ width: "80%", height: "auto", margin: "auto" }}
          >
            <Bar data={barChartDataLeaderboard} options={barChartOptions} />
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
    fontFamily: "'Poppins', sans-serif", // Apply Poppins font
    backgroundColor: '#99BC85', // Set button background color
    color: '#FDFAF6', // Set font color
    '&:hover': {
      backgroundColor: '#88A876', // Optional: Change hover color for better UX
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
    onClick={generateOverallPDF}
    sx={{ 
      mt: 2, 
      mb: 4, 
      fontFamily: "'Poppins', sans-serif", // Apply Poppins font
      backgroundColor: '#99BC85', // Set button background color
      color: '#FDFAF6', // Set font color
      '&:hover': {
        backgroundColor: '#88A876', // Optional: Change hover color for better UX
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

