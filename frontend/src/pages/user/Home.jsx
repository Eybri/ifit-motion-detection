import React, { Fragment } from 'react';
import MetaData from '../../components/Layout/Metadata';
import { Carousel, Container, Row, Col } from 'react-bootstrap';

const Home = () => {
    return (
        <>
            <MetaData title={'Welcome to Our Store'} />

            <Fragment>
                {/* Hero Section - Carousel */}
                <section className="hero-section">
                    <Carousel fade indicators={false} interval={3000} pause={false}>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="../images/im1.jpg" 
                                alt="Latest Fashion Trends"
                                style={{ height: '600px', objectFit: 'cover', filter: 'brightness(70%)' }}
                            />
                            <Carousel.Caption className="text-white">
                                <h2 className="fw-bold">Latest Fashion Trends</h2>
                                <p className="lead">Shop the best styles of the season</p>
                                <button className="btn btn-dark btn-lg">Explore Now</button>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="../images/im2.jpg"
                                alt="Spring Collection"
                                style={{ height: '600px', objectFit: 'cover', filter: 'brightness(70%)' }}
                            />
                            <Carousel.Caption className="text-white">
                                <h2 className="fw-bold">Spring Collection</h2>
                                <p className="lead">Discover our latest arrivals</p>
                                <button className="btn btn-primary btn-lg">Leader Boards</button>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="../images/im3.jpg"
                                alt="New Arrivals"
                                style={{ height: '600px', objectFit: 'cover', filter: 'brightness(70%)' }}
                            />
                            <Carousel.Caption className="text-white">
                                <h2 className="fw-bold">New Arrivals</h2>
                                <p className="lead">Check out the newest pieces</p>
                                <button className="btn btn-light btn-lg text-dark">Browse Collection</button>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </section>

                {/* Welcome Section */}
                <Container className="text-center my-5">
                    <h1 className="fw-bold">Welcome to Our Store</h1>
                    <p className="lead text-muted">
                        Discover the latest trends, exclusive collections, and premium quality fashion. 
                        We bring style to your doorstep!
                    </p>
                    <button className="btn btn-primary btn-lg mt-3">Get Started</button>
                </Container>

                {/* Featured Video Section */}
                <section className="featured-video-section bg-light py-5">
                    <Container>
                        <h2 className="text-center fw-bold mb-4">Featured Video</h2>
                        <Row className="justify-content-center">
                            <Col md={8}>
                                <div className="embed-responsive embed-responsive-16by9">
                                    <iframe
                                        className="embed-responsive-item w-100"
                                        height="400"
                                        src="https://www.youtube.com/embed/your-video-id" // Replace with your actual video URL
                                        title="Featured Video"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </Fragment>
        </>
    );
}

export default Home;
