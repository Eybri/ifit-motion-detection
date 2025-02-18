import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "../../components/Layout/Loader";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!", { position: "bottom-right" });
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(`http://localhost:5000/api/reset-password/${token}`, { password });
            toast.success(data.message, { position: "bottom-right" });
            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong!";
            toast.error(errorMessage, { position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container custom-form">
            {loading && <Loader />}
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="text-center mb-4">Reset Password</h3>
                            <form onSubmit={submitHandler}>
                                <div className="form-group mb-3">
                                    <label htmlFor="password_field">New Password</label>
                                    <input
                                        type="password"
                                        id="password_field"
                                        className="form-control"
                                        placeholder="Enter your new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="confirm_password_field">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirm_password_field"
                                        className="form-control"
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-dark w-100">
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
