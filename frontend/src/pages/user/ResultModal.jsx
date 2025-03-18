import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"; // Import Button from react-bootstrap
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correctly import autoTable
import styled from "styled-components";

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
  };

  // Function to generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Exercise Results Report", 10, 20);

    // Add table for text results
    const tableData = [
      ["Final Score", `${results.final_score?.toFixed(2)}%`],
      ["Calories Burned", `${results.calories_burned?.toFixed(2)} kcal`],
      ["Steps Taken", results.steps_taken?.toFixed(2)],
      ["Steps Per Minute", results.steps_per_minute?.toFixed(2)],
      ["Exercise Duration", `${results.exercise_duration?.toFixed(2)} minutes`],
      ["Movement Efficiency", results.movement_efficiency?.toFixed(2)],
      ["Performance Score", results.performance_score?.toFixed(2)],
      ["Energy Expenditure", `${results.energy_expenditure?.toFixed(2)} J`],
      ["Feedback", results.user_feedback],
    ];

    // Use autoTable plugin
    autoTable(doc, {
      startY: 30,
      head: [["Metric", "Value"]],
      body: tableData,
    });

    // Add radar chart image
    const radarChart = document.querySelector(".chart-results canvas");
    if (radarChart) {
      const chartImage = radarChart.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 10, doc.lastAutoTable.finalY + 10, 180, 100);
    }

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
            <Radar data={radarData} options={radarOptions} />
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