from flask import Blueprint, request, jsonify
from models.video import Video
from services.db import get_db
from bson.objectid import ObjectId

video_routes = Blueprint("video_routes", __name__, url_prefix="/api/videos")
db = get_db()
video_model = Video(db)

@video_routes.route("/", methods=["POST"])
def upload_video():
    """Upload a new video for a category"""
    data = request.form
    category_id = data.get("category_id")
    title = data.get("title")
    description = data.get("description", "")  # Optional description
    video_file = request.files.get("video_file")  # Video file is required

    # Ensure required fields are provided
    if not category_id or not title or not video_file:
        return jsonify({"error": "Category ID, title, and video file are required"}), 400

    # Upload video and store it in the database (Cloudinary and MongoDB handled in the model)
    try:
        video = video_model.upload_video(category_id, title, video_file, description)
        return jsonify({"message": "Video uploaded successfully", "id": str(video.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@video_routes.route("/", methods=["GET"])
def get_videos():
    """Get all videos or filter by category"""
    category_id = request.args.get("category_id")
    videos = video_model.get_all_videos(category_id)
    
    return jsonify([
        {
            "id": str(video["_id"]),
            "title": video["title"],
            "description": video["description"],
            "video_url": video["video_url"],
            "thumbnail_url": video.get("thumbnail_url", ""),  # Include thumbnail URL
            "category_id": str(video["category_id"]), 
            "created_at": video["created_at"],
            "updated_at": video["updated_at"]
        }
        for video in videos
    ]), 200

@video_routes.route("/<video_id>", methods=["GET"])
def get_video_by_id(video_id):
    """Get a single video by ID"""
    video = video_model.find_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    return jsonify({
        "id": str(video["_id"]),
        "title": video["title"],
        "description": video["description"],
        "video_url": video["video_url"],
        "thumbnail_url": video.get("thumbnail_url", ""),  # Include thumbnail URL
        "category_id": str(video["category_id"]),
        "created_at": video["created_at"],
        "updated_at": video["updated_at"]
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

    # If a new video file is uploaded, upload it to Cloudinary and generate a thumbnail
    if video_file:
        try:
            upload_result = cloudinary.uploader.upload(
                video_file,
                resource_type="video",
                folder="fitness_videos",
                eager=[{"width": 150, "height": 150, "crop": "fill", "format": "jpg"}]  # Generate thumbnail
            )
            updated_data["video_url"] = upload_result["secure_url"]
            updated_data["cloudinary_public_id"] = upload_result["public_id"]
            updated_data["thumbnail_url"] = upload_result["eager"][0]["secure_url"]  # Use thumbnail URL
        except Exception as e:
            return jsonify({"error": f"Video file upload failed: {str(e)}"}), 500

    # Update the video data in the database
    modified_count = video_model.update_video(video_id, updated_data)

    if modified_count == 0:
        return jsonify({"message": "No changes made to the video"}), 200

    return jsonify({"message": "Video updated successfully"}), 200
