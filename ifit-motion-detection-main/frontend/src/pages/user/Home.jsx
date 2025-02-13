import React, { Fragment } from 'react';
import MetaData from '../../components/Layout/Metadata';
import { Carousel } from 'react-bootstrap'; 

const Home = () => {
    return (
        <>
            <MetaData title={'Welcome to Our Store'} />
            
            <Fragment>
                {/* Carousel Header */}
                <Carousel fade>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="../images/im1.jpg" // Replace with actual image URLs
                            alt="First slide"
                            style={{ height: '500px', objectFit: 'cover' }} // Ensure images are uniform in size
                        />
                        <Carousel.Caption>
                            <h3>Latest Fashion Trends</h3>
                            <p>Shop the best clothes of the season</p>
                            <button className="btn btn-dark">Dance Now</button>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="../images/im2.jpg"
                            alt="Second slide"
                            style={{ height: '500px', objectFit: 'cover' }} // Uniform image size
                        />
                        <Carousel.Caption>
                            <h3>Spring Collection</h3>
                            <p>Discover our latest spring collection</p>
                            <button className="btn btn-primary">Shop Now</button>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="../images/im3.jpg"
                            alt="Third slide"
                            style={{ height: '500px', objectFit: 'cover' }} // Uniform image size
                        />
                        <Carousel.Caption>
                            <h3>New Arrivals</h3>
                            <p>Check out the newest pieces in our store</p>
                            <button className="btn btn-primary">Shop Now</button>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>

                {/* Main Content */}
                <h1 className="text-center mb-4" id="products_heading">Welcome Home!</h1>
            </Fragment>
        </>
    );
}

export default Home;
