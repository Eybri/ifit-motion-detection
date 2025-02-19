import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Paper, Modal, TextField } from '@mui/material';
import { getToken } from '../../utils/auth';
import axios from 'axios';
import Loader from '../../components/Layout/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false); // State for image modal
    const [formData, setFormData] = useState({});
    const [newImage, setNewImage] = useState(null); // State for new image file
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
                setFormData(data.user);
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

    // Handle profile update
    const handleProfileUpdate = async () => {
        try {
            const token = getToken();
            const userId = JSON.parse(localStorage.getItem('user')).id;

            await axios.put(`http://localhost:5000/api/user/${userId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success('Profile updated successfully.', { position: 'bottom-right' });
            setOpenModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile.';
            toast.error(errorMessage, { position: 'bottom-right' });
        }
    };

    // Handle image file selection
    const handleImageChange = (event) => {
        setNewImage(event.target.files[0]);
    };

    // Handle image update
    const handleImageUpdate = async () => {
        if (!newImage) {
            toast.error('Please select an image to upload.', { position: 'bottom-right' });
            return;
        }

        const token = getToken();
        const userId = JSON.parse(localStorage.getItem('user')).id;

        const formData = new FormData();
        formData.append('image', newImage);

        try {
            const { data } = await axios.put(`http://localhost:5000/api/user/${userId}/image`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser((prevUser) => ({
                ...prevUser,
                image: data.image_url,
            }));

            toast.success('Profile image updated successfully.', { position: 'bottom-right' });
            setImageModalOpen(false);
            setNewImage(null);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile image.';
            toast.error(errorMessage, { position: 'bottom-right' });
        }
    };

    // Handle input changes for form data
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                            onClick={() => setImageModalOpen(true)} // Open image modal
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
                                onClick={() => setOpenModal(true)}
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

            {/* Modal for Profile Update */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4
                }}>
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>Edit Profile</Typography>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Gender"
                        fullWidth
                        margin="normal"
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Date of Birth"
                        fullWidth
                        margin="normal"
                        name="date_of_birth"
                        value={formData.date_of_birth || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Height (cm)"
                        fullWidth
                        margin="normal"
                        name="height"
                        value={formData.height || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Weight (kg)"
                        fullWidth
                        margin="normal"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleInputChange}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Button variant="contained" onClick={handleProfileUpdate}>Save Changes</Button>
                        <Button variant="contained" color="error" onClick={() => setOpenModal(false)}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal for Image Update */}
            <Modal open={imageModalOpen} onClose={() => setImageModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4
                }}>
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>Update Profile Image</Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: '100%' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <Button variant="contained" onClick={handleImageUpdate}>Save Image</Button>
                        <Button variant="contained" color="error" onClick={() => setImageModalOpen(false)}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default UserProfile;
