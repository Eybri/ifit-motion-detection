import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";
import drawStickman from "./../../utils/StickmanDrawer";
import { Container, Grid, Paper, Typography, Button } from '@mui/material'; // Import Material UI components

const Dance = () => {
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState({});
  const [accuracy, setAccuracy] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [motionData, setMotionData] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    fetchVideoDetails();
    fetchMotionData();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
      setVideoDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch video details", error);
    }
  };

  const fetchMotionData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/motion/${videoId}`);
      setMotionData(response.data.frames);
    } catch (error) {
      console.error("Failed to fetch motion data", error);
    }
  };

  const startDetection = () => {
    if (!webcamRef.current || !webcamRef.current.video) {
      console.error("Webcam not initialized yet");
      return;
    }
    setIsDetecting(true);
    initPoseDetection();
  };

  const initPoseDetection = () => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (!camera) {
      const newCamera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });

      newCamera.start();
      setCamera(newCamera);
    }

    setInterval(() => {
      if (videoRef.current) {
        const currentFrame = Math.round(videoRef.current.currentTime * 30);
        setFrameIndex(currentFrame);
      }
    }, 100);
  };

  const onResults = (results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.scale(-1, 1);
    ctx.translate(-canvasRef.current.width, 0);

    drawStickman(ctx, results.poseLandmarks, canvasRef.current.width, canvasRef.current.height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const userPose = results.poseLandmarks.map((kp) => [kp.x, kp.y]);
    const referencePose = getReferencePose(frameIndex);

    if (referencePose) {
      const score = calculateAccuracy(userPose, referencePose);
      setAccuracy(score);
    }
  };

  const getReferencePose = (frameIndex) => {
    if (!motionData.length) return null;
    const closestFrame = motionData.reduce((prev, curr) =>
      Math.abs(curr.frame_no - frameIndex) < Math.abs(prev.frame_no - frameIndex) ? curr : prev
    );
    return closestFrame?.keypoints.map((kp) => [kp.x, kp.y]) || null;
  };

  const calculateAccuracy = (userPose, referencePose) => {
    if (!userPose || !referencePose || userPose.length !== referencePose.length) return 0;

    const leftHip = userPose[6];
    const rightHip = userPose[7];
    const hipDistance = Math.hypot(leftHip[0] - rightHip[0], leftHip[1] - rightHip[1]);

    if (hipDistance === 0) return 0;

    let totalDistance = 0;
    for (let i = 0; i < userPose.length; i++) {
      const dist = Math.hypot(userPose[i][0] - referencePose[i][0], userPose[i][1] - referencePose[i][1]);
      totalDistance += dist / hipDistance;
    }

    const maxPossible = userPose.length;
    return Math.max(0, 100 - (totalDistance / maxPossible) * 100);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {videoDetails.title}
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '640px', height: '480px' }}>
              <Webcam ref={webcamRef} style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} width={640} height={480} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <video ref={videoRef} controls style={{ width: '100%', height: '480px', borderRadius: '10px', objectFit: 'cover' }}>
              <source src={videoDetails.video_url} type="video/mp4" />
            </video>
          </Paper>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={startDetection} disabled={isDetecting}>
            {isDetecting ? "Detecting..." : "Start Detection"}
          </Button>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Accuracy: {accuracy.toFixed(2)}%
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dance;