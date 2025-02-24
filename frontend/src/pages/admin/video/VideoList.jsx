import Loader from './../../../components/Layout/Loader';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Button, Spinner, Modal, Form } from "react-bootstrap";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newVideo, setNewVideo] = useState({ title: "", description: "", category_id: "", video_file: null });
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => { fetchVideos(); fetchCategories(); }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/videos/");
      setVideos(data);
    } catch { toast.error("Failed to load videos"); }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/categories/", { headers: { Authorization: `Bearer ${getToken()}` } });
      setCategories(data);
    } catch { toast.error("Failed to fetch categories"); }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    setActionLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success("Video deleted");
    } catch { toast.error("Failed to delete video"); }
    setActionLoading(false);
  };

  const handleChange = (e) => setNewVideo({ ...newVideo, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setNewVideo({ ...newVideo, video_file: e.target.files[0] });

  const handleEditClick = (video) => {
    setEditMode(true);
    setSelectedVideo(video);
    setNewVideo({
      title: video.title,
      description: video.description,
      category_id: video.category_id,
      video_file: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const formData = new FormData();
    Object.entries(newVideo).forEach(([key, value]) => formData.append(key, value));
    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/videos/${selectedVideo.id}`, formData, {
          headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Video updated");
      } else {
        await axios.post("http://localhost:5000/api/videos/", formData, {
          headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Video uploaded");
      }
      fetchVideos();
      setShowModal(false);
    } catch {
      toast.error("Failed to upload/update video");
    }
    setActionLoading(false);
  };

  return (
    <Container className="mt-4">
      <ToastContainer />
      <h2 className="mb-4">Video List</h2>
      <Button variant="primary" onClick={() => { setShowModal(true); setEditMode(false); }}>Add Video</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Video" : "Upload Video"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={newVideo.title} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={newVideo.description} onChange={handleChange} required />
            </Form.Group>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" name="category_id" value={newVideo.category_id} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </Form.Control>
            </Form.Group>
            {!editMode && (
              <Form.Group controlId="video_file">
                <Form.Label>Video File</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} required />
              </Form.Group>
            )}
            <Button variant="primary" type="submit" className="mt-3">{actionLoading ? "Loading..." : editMode ? "Update" : "Upload"}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {loading ? <Spinner animation="border" /> : (
        <div className="d-flex flex-wrap gap-4 mt-4">
          {videos.map(({ id, title, description, category_id, video_url, thumbnail_url }) => (
            <Card key={id} sx={{ width: 300 }}>
              <CardMedia component="img" height="150" image={thumbnail_url || "https://via.placeholder.com/150"} alt={title} onClick={() => setPlayingVideo(id === playingVideo ? null : id)} style={{ cursor: "pointer" }} />
              <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">{description}</Typography>
                <Typography variant="caption">{categories.find(cat => String(cat.id) === String(category_id))?.name || "Unknown"}</Typography>
                {playingVideo === id && <video width="100%" controls><source src={video_url} type="video/mp4" /></video>}
                <Button variant="warning" onClick={() => handleEditClick({ id, title, description, category_id, video_url, thumbnail_url })}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(id)} className="ms-2">Delete</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {actionLoading && <Loader />}
    </Container>
  );
};

export default VideoList;
