import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "../../components/Layout/Loader";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post("http://localhost:5000/api/forgot-password", { email });
            toast.success(data.message, { position: "bottom-right" });
            setEmail("");
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
                            <h3 className="text-center mb-4">Forgot Password</h3>
                            <form onSubmit={submitHandler}>
                                <div className="form-group mb-3">
                                    <label htmlFor="email_field">Email Address</label>
                                    <input
                                        type="email"
                                        id="email_field"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-dark w-100">
                                    Send Reset Link
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
