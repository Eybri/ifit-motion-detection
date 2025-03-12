// src/Popup.js
import React from 'react';

function Popup({ score, onClose }) {
  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Comparison Complete</h2>
        <p>Final Accuracy Score: {score.toFixed(2)}%</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Popup;