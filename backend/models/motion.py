from datetime import datetime
from bson.objectid import ObjectId
import mediapipe as mp
import cv2
import numpy as np


class MotionData:
    def __init__(self, db):
        self.collection = db["motion_data"]
        self.pose = mp.solutions.pose.Pose(model_complexity=1)  # Use BlazePose (more accurate for dance)

        # Important keypoints for dance motion tracking
        self.important_joints = {
            0: "nose", 11: "left_shoulder", 12: "right_shoulder",
            13: "left_elbow", 14: "right_elbow",
            15: "left_wrist", 16: "right_wrist",
            23: "left_hip", 24: "right_hip",
            25: "left_knee", 26: "right_knee",
            27: "left_ankle", 28: "right_ankle"
        }

    def get_realtime_keypoints(self, frame):
        """Detect keypoints from a live camera feed."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)

        keypoints = {}
        if results.pose_landmarks:
            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                if idx in self.important_joints:
                    keypoints[self.important_joints[idx]] = [
                        round(landmark.x, 3), round(landmark.y, 3), round(landmark.z, 3)
                    ]
        return keypoints
    
    def extract_motion_data(self, video_path, video_id, fps=30, frame_skip=3):
        """Extracts keypoints from a video and saves optimized motion data to MongoDB."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Error opening video file")

        motion_data = {
            "video_id": ObjectId(video_id),
            "fps": fps,
            "keypoints": [],
            "created_at": datetime.utcnow()
        }

        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break  # End of video

            # Skip frames to optimize storage and processing
            if frame_number % frame_skip != 0:
                frame_number += 1
                continue

            # Convert frame to RGB for MediaPipe processing
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)

            if results.pose_landmarks:
                keypoints = {}
                for idx, landmark in enumerate(results.pose_landmarks.landmark):
                    if idx in self.important_joints:
                        keypoints[self.important_joints[idx]] = [
                            round(landmark.x, 3), round(landmark.y, 3), round(landmark.z, 3)
                        ]  # Store 3D keypoints with 3 decimal places

                motion_data["keypoints"].append({
                    "frame": frame_number,
                    "joints": keypoints
                })

            frame_number += 1

        cap.release()
        return self.collection.insert_one(motion_data)
    
    def get_motion_data(self, video_id):
        """Retrieve motion data for a given video."""
        return self.collection.find_one({"video_id": ObjectId(video_id)})
    
    
    