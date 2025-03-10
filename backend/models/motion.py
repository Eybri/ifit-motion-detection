from datetime import datetime
from bson.objectid import ObjectId
import mediapipe as mp
import cv2
import numpy as np

class MotionData:
    def __init__(self, db):
        self.collection = db["motion_data"]
        self.pose = mp.solutions.pose.Pose(model_complexity=1)  # Use BlazePose

        # Store only essential keypoints
        self.important_joints = {
            11: "left_shoulder", 12: "right_shoulder",
            13: "left_elbow", 14: "right_elbow",
            15: "left_wrist", 16: "right_wrist",
            23: "left_hip", 24: "right_hip",
            25: "left_knee", 26: "right_knee",
            27: "left_ankle", 28: "right_ankle"
        }

    def extract_motion_data(self, video_path, video_id, fps=30, frame_skip=6):
        """Extract keypoints from video and store in MongoDB."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Error opening video file")

        motion_data = {
            "video_id": ObjectId(video_id),
            "fps": fps,
            "frames": [],
            "created_at": datetime.utcnow()
        }

        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_number % frame_skip != 0:
                frame_number += 1
                continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)

            if results.pose_landmarks:
                keypoints = {
                    f"keypoint_{idx}": {
                        "x": round(landmark.x, 3),
                        "y": round(landmark.y, 3),
                        "z": round(landmark.z, 3),
                        "score": round(landmark.visibility, 3)
                    }
                    for idx, landmark in enumerate(results.pose_landmarks.landmark)
                }

                motion_data["frames"].append({
                    "frame_no": frame_number,
                    "keypoints": keypoints
                })

            frame_number += 1

        cap.release()
        return self.collection.insert_one(motion_data)

    def get_motion_data(self, video_id):
        """Retrieve motion data for accuracy comparison."""
        return self.collection.find_one({"video_id": ObjectId(video_id)}, {"_id": 0})
