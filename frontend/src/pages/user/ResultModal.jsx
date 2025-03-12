import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const ResultsModal = ({ show, onHide, results }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Exercise Results</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Final Score:</strong> {results.final_score?.toFixed(2)}%</p>
        <p><strong>Calories Burned:</strong> {results.calories_burned?.toFixed(2)} kcal</p>
        <p><strong>Steps Taken:</strong> {results.steps_taken}</p>
        <p><strong>Steps Per Minute:</strong> {results.steps_per_minute?.toFixed(2)}</p>
        <p><strong>Exercise Duration:</strong> {results.exercise_duration?.toFixed(2)} minutes</p>
        <p><strong>Movement Efficiency:</strong> {results.movement_efficiency?.toFixed(2)}</p>
        <p><strong>Performance Score:</strong> {results.performance_score?.toFixed(2)}</p>
        <p><strong>Energy Expenditure:</strong> {results.energy_expenditure?.toFixed(2)} J</p>
        <p><strong>Feedback:</strong> {results.user_feedback}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultsModal;