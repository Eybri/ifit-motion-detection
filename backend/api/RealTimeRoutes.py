from flask_socketio import SocketIO, emit
import numpy as np
from flask import Blueprint
from bson.objectid import ObjectId
from models.motion import MotionData
from models.RealTimeScore import RealTimeScore
from services.db import get_db
socketio = SocketIO(cors_allowed_origins="*")

# Load motion data when a user selects a video
motion_routes = Blueprint("motion_routes", __name__, url_prefix="/api/motion")
db = get_db()

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")

@socketio.on("start_dance")
def handle_start_dance(data):
    """Load reference motion data when user selects a video."""
    video_id = data["video_id"]
    if video_id not in motion_data_cache:
        motion_data = MotionData(db).get_motion_data(video_id)
        if not motion_data:
            emit("error", {"message": "Motion data not found"})
            return
        motion_data_cache[video_id] = motion_data["frames"]
    
    emit("ready", {"message": "Motion data loaded"})

@socketio.on("pose_data")
def handle_pose_data(data):
    """Compare live pose data with reference and calculate accuracy."""
    user_id = data["user_id"]
    video_id = data["video_id"]
    frame_no = data["frame_no"]
    user_keypoints = data["keypoints"]

    if video_id not in motion_data_cache:
        emit("error", {"message": "Motion data not loaded"})
        return

    reference_frames = motion_data_cache[video_id]

    # Find closest reference frame
    matched_frame = next((f for f in reference_frames if f["frame_no"] == frame_no), None)
    if not matched_frame:
        emit("accuracy_score", {"frame_no": frame_no, "accuracy": 0})
        return

    # Compare keypoints
    accuracy = calculate_pose_similarity(user_keypoints, matched_frame["keypoints"])

    # Save score
    RealTimeScore(db).save_score(user_id, video_id, [{"frame_no": frame_no, "accuracy": accuracy}])

    # Send accuracy to frontend
    emit("accuracy_score", {"frame_no": frame_no, "accuracy": accuracy})


def calculate_pose_similarity(user_keypoints, reference_keypoints):
    """Calculate similarity between user and reference keypoints."""
    user_vec = np.array([(kp["x"], kp["y"]) for kp in user_keypoints])
    ref_vec = np.array([(kp["x"], kp["y"]) for kp in reference_keypoints])

    if len(user_vec) != len(ref_vec):
        return 0  # Incomplete data

    distance = np.linalg.norm(user_vec - ref_vec)
    accuracy = max(0, 100 - distance * 100)  # Scale score
    return round(accuracy, 2)
