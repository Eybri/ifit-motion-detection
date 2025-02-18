import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { getToken } from '../../utils/auth';
import axios from 'axios';
import Loader from '../../components/Layout/Loader'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = getToken();
                if (!token) {
                    toast.error('Please log in to access your profile.', { position: 'bottom-right' });
                    navigate('/login');
                    return;
                }

                const { data } = await axios.get(`http://localhost:5000/api/user/${JSON.parse(localStorage.getItem('user')).id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(data.user);
            } catch (error) {
                const errorMessage = error.response?.data?.error || 'Failed to load user profile.';
                toast.error(errorMessage, { position: 'bottom-right' });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // Handle account deletion
    const handleDeleteAccount = async () => {
        try {
            const token = getToken();
            const userId = JSON.parse(localStorage.getItem('user')).id;

            const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (!confirm) return;

            await axios.delete(`http://localhost:5000/api/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Account deleted successfully.', { position: 'bottom-right' });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to delete account.';
            toast.error(errorMessage, { position: 'bottom-right' });
        }
    };

    // Handle profile edit (redirect to an edit page)
    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    // Handle image edit
    const handleImageEdit = () => {
        toast.info('Image edit feature coming soon!', { position: 'bottom-right' });
    };

    if (loading) return <Loader />;

    return (
        <div className="container custom-form">
            <Paper elevation={6} sx={{ padding: 4, borderRadius: 3, boxShadow: 10 }}>
                <Box display="flex" alignItems="center">
                    {/* Image Section */}
                    <Box sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                        <img
                            src={user?.image || 'https://via.placeholder.com/150'}
                            alt="User"
                            className="rounded-circle"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                padding: '6px',
                            }}
                            onClick={handleImageEdit}
                        >
                            Edit Image
                        </Button>
                    </Box>

                    {/* User Details Section */}
                    <Box sx={{ flex: 2, marginLeft: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {user?.name}
                        </Typography>
                        <Typography variant="body1">Email: {user?.email}</Typography>
                        <Typography variant="body1">Gender: {user?.gender}</Typography>
                        <Typography variant="body1">Date of Birth: {user?.date_of_birth}</Typography>
                        <Typography variant="body1">Height: {user?.height} cm</Typography>
                        <Typography variant="body1">Weight: {user?.weight} kg</Typography>

                        <Box display="flex" justifyContent="end" sx={{ marginTop: 3 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ boxShadow: 5, marginRight: 2 }}
                                onClick={handleEditProfile}
                            >
                                Edit Profile
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ boxShadow: 5 }}
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
};

export default UserProfile;
