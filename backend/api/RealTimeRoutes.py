from flask import Blueprint, jsonify, request
from models.video import Video
from models.motion import MotionData
import threading
import cv2
import numpy as np
import cloudinary
import cloudinary.uploader
import json
from datetime import datetime
import mediapipe as mp
from bson.objectid import ObjectId
from services.db import get_db
import os
# Initialize Blueprint for session_routes
session_routes = Blueprint('session_routes', __name__, url_prefix="/api/")

# Database Collections
db = get_db()
Video_collection = Video(db)
motion_data_collection = MotionData(db)

# Cloudinary Setup
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

comparison_running = False  # Track comparison status

def load_reference_pose_from_db(video_id):
    """Fetch reference motion data from MongoDB."""
    motion_data = motion_data_collection.get_motion_data(video_id)
    if motion_data:
        return motion_data["frames"]  # Return the keypoints data
    return None

def calculate_similarity(reference_pose, live_pose):
    """Calculate similarity score between reference pose and live pose."""
    if len(reference_pose) != len(live_pose):
        return 0

    total_score = 0
    num_keypoints = len(reference_pose)

    for ref, live in zip(reference_pose, live_pose):
        ref_coords = np.array([ref['x'], ref['y']])
        live_coords = np.array([live['x'], live['y']])
        distance = np.linalg.norm(ref_coords - live_coords)

        score = max(0, 1 - distance)
        total_score += score

    return (total_score / num_keypoints) * 100

def draw_stickman(frame, pose_landmarks, color):
    """Draw stickman on frames to visualize the pose."""
    for connection in mp_pose.POSE_CONNECTIONS:
        part1 = pose_landmarks[connection[0]]
        part2 = pose_landmarks[connection[1]]

        x1, y1 = int(part1['x'] * frame.shape[1]), int(part1['y'] * frame.shape[0])
        x2, y2 = int(part2['x'] * frame.shape[1]), int(part2['y'] * frame.shape[0])

        cv2.line(frame, (x1, y1), (x2, y2), color, 3)
        cv2.circle(frame, (x1, y1), 5, color, -1)
        cv2.circle(frame, (x2, y2), 5, color, -1)

def compare_live_pose(reference_json, video_url):
    """Compare live pose with reference pose from Cloudinary video."""
    cap_webcam = cv2.VideoCapture(0)  # Open webcam
    cap_video = cv2.VideoCapture(video_url)  # Open reference video from Cloudinary

    reference_poses = reference_json

    frame_index = 0

    while cap_webcam.isOpened() and cap_video.isOpened():
        ret_webcam, frame_webcam = cap_webcam.read()
        ret_video, frame_video = cap_video.read()

        if not ret_webcam or not ret_video:
            break  # Stop if webcam or video feed ends

        # Resize the reference video frame to match the webcam frame
        frame_video = cv2.resize(frame_video, (frame_webcam.shape[1], frame_webcam.shape[0]))

        # Convert to RGB
        frame_webcam_rgb = cv2.cvtColor(frame_webcam, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_webcam_rgb)

        # Draw live pose
        if results.pose_landmarks:
            live_keypoints = [
                {"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility}
                for lm in results.pose_landmarks.landmark
            ]

            if frame_index < len(reference_poses):
                reference_pose = reference_poses[frame_index]
                score = calculate_similarity(reference_pose, live_keypoints)

                color = (0, 255, 0) if score > 80 else (0, 255, 255) if score > 50 else (0, 0, 255)

                draw_stickman(frame_webcam, live_keypoints, color)
                draw_stickman(frame_video, reference_pose, (255, 255, 255))

                cv2.putText(frame_webcam, f"Score: {score:.2f}%", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            frame_index += 1

        # Concatenate frames
        combined_frame = cv2.hconcat([frame_webcam, frame_video])

        # Display the result
        cv2.imshow("Live Comparison", combined_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap_webcam.release()
    cap_video.release()
    cv2.destroyAllWindows()

@session_routes.route('/start_comparison', methods=['POST'])
def start_comparison():
    """Start comparison between live pose and reference video."""
    global comparison_running

    if comparison_running:
        return jsonify({"error": "Comparison already running"}), 400

    video_id = request.json['video_id']

    # Fetch the video URL from the database
    video_data = Video_collection.find_video_by_id(video_id)
    if not video_data:
        return jsonify({"error": "Video not found"}), 404

    video_url = video_data["video_url"]
    
    # Fetch the motion data (reference pose) from the database
    reference_json = load_reference_pose_from_db(video_id)
    if not reference_json:
        return jsonify({"error": "Motion data not found"}), 404

    threading.Thread(target=compare_live_pose, args=(reference_json, video_url)).start()

    comparison_running = True
    return jsonify({"message": "Comparison started"}), 200

@session_routes.route('/status', methods=['GET'])
def get_status():
    """Get the current status of the comparison."""
    return jsonify({"comparison_running": comparison_running})
