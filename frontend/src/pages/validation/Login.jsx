import React, { Fragment,  useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../../components/Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { setToken } from '../../utils/auth';
import MetaData from '../../components/Layout/Metadata';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .required('Password is required')
        }),
        onSubmit: async (values) => {
            const { email, password } = values;
            try {
                setLoading(true);
                const { data } = await axios.post('http://localhost:8000/api/login/', { email, password });
                
                if (data.token) {
                    setToken(data.token);
                    toast.success('Logged in successfully!', {
                        position: 'bottom-right'
                    });
                    localStorage.setItem('loginSuccess', 'true');
                    navigate(redirect || "/");
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                } else {
                    toast.error('Invalid login response. Please try again.', { position: 'bottom-right' });
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Invalid email or password", {
                    position: 'bottom-right'
                });
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Fragment>
            {loading ? <Loader /> : (
                <Fragment>
                    <MetaData title={'Login'} />
                    <div className="container">
                        <div className="row justify-content-center align-items-center mt-5">
                            <div className="col-md-8 d-flex shadow-lg p-0" style={{ borderRadius: '15px' }}>
                                <div className="col-5 d-none d-md-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTopLeftRadius: '15px', borderBottomLeftRadius: '15px' }}>
                                    <div className="text-center my-5">
                                        <img
                                            src="../images/AFlogo-nobg.png"
                                            alt="Logo"
                                            className="img-fluid"
                                            style={{ width: '100%', maxWidth: '250px' }}
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-7 p-5">
                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="email_field">Email</label>
                                            <input
                                                type="email"
                                                id="email_field"
                                                className="form-control"
                                                {...formik.getFieldProps('email')}
                                                placeholder="Enter your email"
                                            />
                                            {formik.touched.email && formik.errors.email ? (
                                                <div className="text-danger">{formik.errors.email}</div>
                                            ) : null}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password_field">Password</label>
                                            <input
                                                type="password"
                                                id="password_field"
                                                className="form-control"
                                                {...formik.getFieldProps('password')}
                                                placeholder="Enter your password"
                                            />
                                            {formik.touched.password && formik.errors.password ? (
                                                <div className="text-danger">{formik.errors.password}</div>
                                            ) : null}
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <Link to="/password/forgot" className="text-muted">Forgot Password?</Link>
                                        </div>

                                        <button
                                            id="login_button"
                                            type="submit"
                                            className="btn btn-dark btn-block py-3 rounded-pill"
                                            disabled={loading}
                                        >
                                            LOGIN
                                        </button>

                                        <div className="text-center mt-4">
                                            <Link to="/register" className="text-muted">New User? Register Here</Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}
        </Fragment>
    );
};

export default Login;
