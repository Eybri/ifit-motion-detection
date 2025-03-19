from flask import Blueprint, request, jsonify
from models.video import Video
from models.motion import MotionData
from services.db import get_db
import tempfile
from bson.objectid import ObjectId
import numpy as np
import cv2
import mediapipe as mp
import os

video_routes = Blueprint("video_routes", __name__, url_prefix="/api/videos")
db = get_db()
video_model = Video(db)
motion_model = MotionData(db)

# MediaPipe Pose setup for real-time comparison
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True)

@video_routes.route("/", methods=["POST"])
def upload_video():
    """Upload a new video and extract motion data."""
    data = request.form
    category_id = data.get("category_id")
    title = data.get("title")
    description = data.get("description", "")
    video_file = request.files.get("video_file")

    if not category_id or not title or not video_file:
        return jsonify({"error": "Category ID, title, and video file are required"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            video_file.save(temp_video.name)
            temp_path = temp_video.name

        # Upload video and extract motion data
        video = video_model.upload_video(category_id, title, temp_path, description)
        video_id = str(video.inserted_id)

        # Extract motion data and store it in the motion_data collection
        motion_model = MotionData(db)  # Assuming db is your MongoDB client
        motion_model.extract_motion_data(temp_path, video_id)

        os.remove(temp_path)  # Cleanup after processing

        return jsonify({"message": "Video uploaded and motion data extracted", "id": video_id}), 201
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)  # Ensure cleanup on failure
        return jsonify({"error": str(e)}), 500



@video_routes.route("/", methods=["GET"])
def get_videos():
    """Get all videos or filter by category"""
    category_id = request.args.get("category_id")
    videos = video_model.get_all_videos(category_id)

    # Fetch motion data for each video to get the duration
    video_list = []
    for video in videos:
        video_id = str(video["_id"])
        motion_data = db["motion_data"].find_one({"video_id": ObjectId(video_id)})

        # Include duration from motion_data if available
        duration = motion_data["duration"] if motion_data else None

        video_list.append({
            "id": video_id,
            "title": video["title"],
            "description": video["description"],
            "video_url": video["video_url"],
            "thumbnail_url": video.get("thumbnail_url", ""),  # Include thumbnail URL
            "category_id": str(video["category_id"]), 
            "created_at": video["created_at"],
            "updated_at": video["updated_at"],
            "duration": duration  # Add duration to the response
        })

    return jsonify(video_list), 200


@video_routes.route("/<video_id>", methods=["GET"])
def get_video_by_id(video_id):
    """Get a single video by ID"""
    video = video_model.find_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    motion_data = motion_model.get_motion_data(video_id)
    
    # Ensure motion_data exists before accessing frames
    if motion_data and "frames" in motion_data:
        motion_keypoints = [frame["keypoints"] for frame in motion_data["frames"]]
    else:
        motion_keypoints = []

    return jsonify({
        "id": str(video["_id"]),
        "title": video["title"],
        "description": video["description"],
        "video_url": video.get("video_url", ""),
        "thumbnail_url": video.get("thumbnail_url", ""),
        "category_id": str(video["category_id"]),
        "created_at": video["created_at"],
        "updated_at": video["updated_at"],
        "motion_data": {
            "fps": motion_data["fps"],
            "frames": motion_keypoints
        } if motion_data else None
    }), 200



@video_routes.route("/<video_id>", methods=["DELETE"])
def delete_video(video_id):
    """Delete a video by ID"""
    success = video_model.delete_video(video_id)
    if not success:
        return jsonify({"error": "Video not found"}), 404

    return jsonify({"message": "Video deleted successfully"}), 200


@video_routes.route("/<video_id>", methods=["PUT"])
def update_video(video_id):
    """Update video information by ID"""
    data = request.form  # Use request.form for handling multipart/form-data
    video_file = request.files.get("video_file")  # Get the video file if it's included

    # Ensure the title is provided
    if not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    # Create a dictionary with the updated data
    updated_data = {
        "title": data["title"],
        "description": data.get("description", ""),
        "category_id": ObjectId(data["category_id"]),
    }

    # If a new video file is provided, update it
    if video_file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            video_file.save(temp_video.name)
            temp_path = temp_video.name
            video_model.upload_video(data["category_id"], data["title"], temp_path, data.get("description", ""))

    # Update video metadata
    video_model.update_video(video_id, updated_data)

    return jsonify({"message": "Video updated successfully"}), 200

