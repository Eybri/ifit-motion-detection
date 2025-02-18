import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import Loader from '../Layout/Loader';
import { getUser } from '../../utils/helpers';

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    // If still loading, show the loader
    if (loading) {
        return <Loader />;
    }

    // If no user (not logged in), redirect to login
    if (!user) {
        return <Navigate to='/login' />;
    }

    // If user is not an admin and admin route is required, redirect to home
    if (isAdmin && !user.is_admin) {
        return <Navigate to='/' />;
    }

    // If all checks pass, render the children (protected content)
    return children;
};

export default ProtectedRoute;
