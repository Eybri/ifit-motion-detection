import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";

const socket = io("http://localhost:5000");

const Dance = () => {
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState({});
  const [accuracy, setAccuracy] = useState(0);
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const [detector, setDetector] = useState(null);

  useEffect(() => {
    fetchVideoDetails();
    initPoseDetector();
    startCamera();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
      setVideoDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch video details", error);
    }
  };

  const initPoseDetector = async () => {
    await tf.ready();
    await tf.setBackend("webgl");

    const detectorConfig = { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    const newDetector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);
    setDetector(newDetector);
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (cameraRef.current) {
      cameraRef.current.srcObject = stream;
    }
    detectPose();
  };

  const detectPose = async () => {
    if (!detector) return;
    const videoElement = cameraRef.current;

    const processFrame = async () => {
      if (!videoElement || videoElement.readyState !== 4) {
        requestAnimationFrame(processFrame);
        return;
      }

      const poses = await detector.estimatePoses(videoElement);
      if (poses.length > 0) {
        const keypoints = extractKeypoints(poses[0]);
        sendPoseData(keypoints);
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const extractKeypoints = (pose) => {
    const importantJoints = [
      "nose", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
      "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", "right_knee",
      "left_ankle", "right_ankle"
    ];
    
    let keypoints = {};
    
    pose.keypoints.forEach((kp) => {
      if (importantJoints.includes(kp.name)) {
        keypoints[kp.name] = [kp.x / window.innerWidth, kp.y / window.innerHeight];
      }
    });

    return keypoints;
  };

  const sendPoseData = (keypoints) => {
    if (videoRef.current) {
      socket.emit("send_pose", {
        video_id: videoId,
        frame: Math.floor(videoRef.current.currentTime * 30),
        keypoints: keypoints,
      });
    }
  };

  useEffect(() => {
    socket.on("pose_score", (data) => {
      if (data.accuracy !== undefined) {
        setAccuracy(data.accuracy);
      }
    });

    return () => socket.off("pose_score");
  }, []);

  return (
    <div className="dance-page">
      <h2 className="title">{videoDetails.title}</h2>
      <div className="dance-container">
        <video ref={videoRef} controls className="dance-video">
          <source src={videoDetails.video_url} type="video/mp4" />
        </video>
        <video ref={cameraRef} autoPlay playsInline muted className="dance-camera"></video>
      </div>
      <p className="accuracy-score">Accuracy: {accuracy}%</p>
    </div>
  );
};

export default Dance;
