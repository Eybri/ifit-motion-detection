import React from 'react';
import './../../css/home.css';

const Home = () => {


  return (
    <div>
      <div className="particles-container">
        <div className="particle" style={{ top: '20%', left: '30%' }}></div>
        <div className="particle" style={{ top: '40%', left: '70%' }}></div>
        <div className="particle" style={{ top: '60%', left: '50%' }}></div>
        <div className="particle" style={{ top: '80%', left: '10%' }}></div>
      </div>

      <section className="hero-section">
        <h1>The world's best dance classes</h1>
        <h2>Stream the best dance classes from the world's top studios. Try it free for 30 days. Terms Apply</h2>
        <button className="btn btn-dark text-light">Get Started</button>
      </section>

      <div className="container mt-4 ">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="grid-item">
              <img
                src="https://cdn.usegalileo.ai/sdxl10/2c8322e5-718a-4560-8969-9fef3d2c6c2c.png"
                alt="Dance style 1"
                className="img-fluid"
              />
              <div className="dance-list-overlay">
                <ul>
                  <li>Ballet</li>
                  <li>Hip Hop</li>
                  <li>Jazz</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="grid-item">
              <img
                src="https://cdn.usegalileo.ai/sdxl10/3bde3e72-3ca9-477b-a3ef-d0a218582831.png"
                alt="Dance style 2"
                className="img-fluid"
              />
              <div className="dance-list-overlay">
                <ul>
                  <li>Contemporary</li>
                  <li>Ballroom</li>
                  <li>Salsa</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="grid-item">
              <img
                src="https://cdn.usegalileo.ai/sdxl10/afe72876-a785-475b-ab5e-2bdf3c0dc7ca.png"
                alt="Dance style 3"
                className="img-fluid"
              />
              <div className="dance-list-overlay">
                <ul>
                  <li>Tango</li>
                  <li>Tap Dance</li>
                  <li>Breakdancing</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="grid-item">
              <img
                src="https://cdn.usegalileo.ai/sdxl10/020526c8-c03e-4311-816c-fe632f0be2bc.png"
                alt="Dance style 4"
                className="img-fluid"
              />
              <div className="dance-list-overlay">
                <ul>
                  <li>Modern Dance</li>
                  <li>Classical</li>
                  <li>Street Dance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  );
};

export default Home;
