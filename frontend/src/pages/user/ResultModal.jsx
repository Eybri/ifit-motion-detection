import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styled from "styled-components";
import { Chart } from "chart.js";

// Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ResultsModal = ({ show, onHide, results }) => {
  // Data for the radar chart
  const radarData = {
    labels: ["Calories Burned", "Steps Taken", "Steps Per Minute", "Movement Efficiency", "Performance Score"],
    datasets: [
      {
        label: "Exercise Metrics",
        data: [
          results.calories_burned?.toFixed(2),
          results.steps_taken?.toFixed(2),
          results.steps_per_minute?.toFixed(2),
          results.movement_efficiency?.toFixed(2),
          results.performance_score?.toFixed(2),
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)", // Pink background
        borderColor: "rgba(255, 99, 132, 1)", // Pink border
        borderWidth: 5, // Increased border width for bolder lines
        pointBackgroundColor: "rgba(255, 99, 132, 1)", // Pink points
        pointBorderColor: "#fff", // White point borders
        pointHoverBackgroundColor: "#fff", // White hover background
        pointHoverBorderColor: "rgba(255, 99, 132, 1)", // Pink hover border
        pointRadius: 5, // Larger points
        pointHoverRadius: 7, // Even larger points on hover
      },
    ],
  };

  // Options for the radar chart
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          color: "#999", // Darker gray angle lines
          lineWidth: 2, // Thicker angle lines
        },
        grid: {
          color: "#999", // Darker gray grid lines
          lineWidth: 2, // Thicker grid lines
        },
        pointLabels: {
          font: {
            size: 14, // Larger font size for labels
            weight: "bold", // Bold labels
          },
          color: "#2c3e50", // Dark text color
        },
        ticks: {
          display: false, // Hide ticks
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    animation: {
      duration: 1, // Set a very short duration for the PDF export
    },
  };

  // Reference for the chart
  const chartRef = React.useRef(null);

  // Function to generate PDF report with improved design
  const generatePDF = async () => {
    // Create PDF with higher quality
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add background color and header
    doc.setFillColor(250, 241, 230); // Light background color that matches modal header
    doc.rect(0, 0, 210, 30, "F"); // Header background
    
    // Add title with styling
    doc.setTextColor(126, 37, 83); // #7E2553 color
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Exercise Results Report", 105, 15, { align: "center" });
    
    // Add date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${date}`, 105, 22, { align: "center" });
    
    // Add summary box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(15, 35, 180, 15, 3, 3, "FD");
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Overall Score: ${results.final_score?.toFixed(2)}%`, 105, 43, { align: "center" });
    
    // Add radar chart image with better quality
    if (chartRef.current) {
      // First ensure the chart is rendered with animation disabled
      const chartInstance = chartRef.current;
      
      // Get the chart as a base64 image
      const chartImage = chartInstance.toBase64Image('image/png', 1.0);
      
      // Add the chart to the PDF
      doc.addImage(chartImage, 'PNG', 55, 55, 100, 100);
      
      // Add chart title
      doc.setTextColor(126, 37, 83); // #7E2553 color
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Performance Metrics Visualization", 105, 165, { align: "center" });
    }
    
    // Add detailed results table with improved styling
    const tableData = [
      ["Calories Burned", `${results.calories_burned?.toFixed(2)} kcal`],
      ["Steps Taken", results.steps_taken?.toFixed(2)],
      ["Steps Per Minute", results.steps_per_minute?.toFixed(2)],
      ["Exercise Duration", `${results.exercise_duration?.toFixed(2)} minutes`],
      ["Movement Efficiency", results.movement_efficiency?.toFixed(2)],
      ["Performance Score", results.performance_score?.toFixed(2)],
      ["Energy Expenditure", `${results.energy_expenditure?.toFixed(2)} J`],
    ];

    // Use autoTable plugin with custom styling
    autoTable(doc, {
      startY: 170,
      head: [["Metric", "Value"]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [126, 37, 83], // #7E2553 color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: 30, right: 30 },
    });
    
    // Add feedback section
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFillColor(250, 241, 230); // Light background color
    doc.roundedRect(30, finalY, 150, 30, 3, 3, "F");
    
    doc.setTextColor(126, 37, 83); // #7E2553 color
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Feedback:", 35, finalY + 7);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Handle multiline feedback with text wrapping
    const splitFeedback = doc.splitTextToSize(results.user_feedback || "No feedback provided.", 140);
    doc.text(splitFeedback, 35, finalY + 15);
    
    // Add footer
    doc.setFillColor(250, 241, 230); // Light background color for footer
    doc.rect(0, 277, 210, 20, "F");
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("© 2025 Exercise Tracker App. All rights reserved.", 105, 285, { align: "center" });

    // Save the PDF
    doc.save("exercise_results_report.pdf");
  };

  return (
    <StyledModal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>Exercise Results</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ResultsContainer>
          <TextResults>
            <p><strong>Final Score:</strong> {results.final_score?.toFixed(2)}%</p>
            <p><strong>Calories Burned:</strong> {results.calories_burned?.toFixed(2)} kcal</p>
            <p><strong>Steps Taken:</strong> {results.steps_taken?.toFixed(2)}</p>
            <p><strong>Steps Per Minute:</strong> {results.steps_per_minute?.toFixed(2)}</p>
            <p><strong>Exercise Duration:</strong> {results.exercise_duration?.toFixed(2)} minutes</p>
            <p><strong>Movement Efficiency:</strong> {results.movement_efficiency?.toFixed(2)}</p>
            <p><strong>Performance Score:</strong> {results.performance_score?.toFixed(2)}</p>
            <p><strong>Energy Expenditure:</strong> {results.energy_expenditure?.toFixed(2)} J</p>
            <p><strong>Feedback:</strong> {results.user_feedback}</p>
          </TextResults>
          <ChartResults>
            <Radar ref={chartRef} data={radarData} options={radarOptions} />
          </ChartResults>
        </ResultsContainer>
      </Modal.Body>
      <Modal.Footer>
        <StyledButton variant="secondary" onClick={onHide}>
          Close
        </StyledButton>
        <StyledButton variant="primary" onClick={generatePDF}>
          Download Report
        </StyledButton>
      </Modal.Footer>
    </StyledModal>
  );
};

export default ResultsModal;

// Styled Components
const StyledModal = styled(Modal)`
  .modal-header-custom {
    background-color: #FAF1E6;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */

  }

  .modal-title {
    color: #fff;
  }

  .modal-footer {
    background-color: #FAF1E6;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */
    // border-top: 1px solid #dee2e6;
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const TextResults = styled.div`
  flex: 1;
  padding: 20px;
  background-color: transparent;
  border-radius: 10px;
  max-width: 400px;

  p {
    margin: 10px 0;
    font-size: 1rem;
    color: #333;
  }

  strong {
    color: #1D2B53;
  }
`;

const ChartResults = styled.div`
  flex: 2;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const StyledButton = styled(Button)`
  background: #7E2553;
  color: white;
  border: none;
  padding: 10px 25px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 30px;
  transition: background 0.3s ease, box-shadow 0.3s ease; /* Add transition for box-shadow */
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add shadow effect */

  &:hover {
    background: #FF004D;
    color: white;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Enhance shadow effect on hover */
  }
`;