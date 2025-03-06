# from flask import Blueprint, jsonify, request
# from flask_socketio import SocketIO, emit
# from services.db import get_db
# from models.video import Video
# from models.motion import MotionData
# import cv2
# import mediapipe as mp
# import numpy as np

# # Initialize Blueprints

# motion_routes = Blueprint("motion_routes", __name__, url_prefix="/api/motion")

# db = get_db()
# socketio = SocketIO(cors_allowed_origins="http://localhost:5000")

# # Initialize Pose Estimation
# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True)


# @motion_routes.route("/compare_poses", methods=["POST"])
# def compare_poses():
#     """Compare user's pose with reference pose."""
#     data = request.json
#     user_pose = data.get("user_pose")
#     reference_pose = data.get("reference_pose")

#     if not user_pose or not reference_pose:
#         return jsonify({"error": "User pose and reference pose are required"}), 400

#     accuracy_score = calculate_accuracy(user_pose, reference_pose)

#     return jsonify({"accuracy_score": accuracy_score}), 200


# def calculate_accuracy(user_pose, reference_pose):
#     """Calculate accuracy score between user pose and reference pose."""
#     if len(user_pose) != len(reference_pose):
#         return 0  # Return zero accuracy if keypoints don't match

#     total_distance = 0
#     num_keypoints = len(user_pose)

#     # Normalize based on hip distance (scaling factor)
#     left_hip = user_pose[6]  # left_hip index in `important_joints`
#     right_hip = user_pose[7]  # right_hip index

#     if not left_hip or not right_hip:
#         return 0  # Invalid keypoints

#     hip_distance = ((left_hip[0] - right_hip[0])**2 + (left_hip[1] - right_hip[1])**2)**0.5
#     if hip_distance == 0:
#         return 0  # Avoid division by zero

#     # Compute Euclidean distance and normalize it
#     for user_kp, ref_kp in zip(user_pose, reference_pose):
#         distance = ((user_kp[0] - ref_kp[0])**2 + (user_kp[1] - ref_kp[1])**2)**0.5
#         normalized_distance = distance / hip_distance  # Normalize by body size
#         total_distance += normalized_distance

#     # Convert to accuracy percentage
#     accuracy_score = max(0, 100 - (total_distance / num_keypoints * 100))
#     return round(accuracy_score, 2)  # Return rounded percentage


# @socketio.on("send_pose")
# def handle_pose_data(data):
#     """Handle incoming user pose data and compute real-time accuracy."""
#     user_pose = data.get("user_pose")
#     video_id = data.get("video_id")

#     if not user_pose or not video_id:
#         emit("accuracy_update", {"error": "Invalid pose data"})
#         return

#     # Retrieve reference pose from MongoDB
#     motion_data = db["motion_data"].find_one({"video_id": video_id})
#     if not motion_data or "frames" not in motion_data:
#         emit("accuracy_update", {"error": "Reference motion data not found"})
#         return

#     reference_pose = motion_data["frames"][0]["keypoints"]  # First frame as reference
#     accuracy_score = calculate_accuracy(user_pose, reference_pose)

#     # Emit real-time accuracy updates to the frontend
#     emit("accuracy_update", {"accuracy": accuracy_score}, broadcast=True)
