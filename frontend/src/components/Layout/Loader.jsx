import React from "react";
import './../../css/loader.css';

const Loader = () => {
  return (
    <div className="loader">
      <div className="loading-screen">
        <div className="boxes">
          <div className="box"></div>
          <div className="box"></div>
          <div className="box"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
