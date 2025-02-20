from datetime import datetime
from bson.objectid import ObjectId

class Video:
    def __init__(self, db):
        self.collection = db["videos"]

    def create_video(self, data):
        """Insert a new video."""
        video_data = {
            "title": data["title"],
            "description": data.get("description", ""),
            "file_url": data["file_url"],
            "stickman_url": data.get("stickman_url", ""),
            "category_id": ObjectId(data["category_id"]),
            "admin_id": ObjectId(data["admin_id"]),  # Reference to the admin who uploaded
            "is_processed": False,  # True when stickman animation is generated
            "created_at": datetime.utcnow()
        }
        return self.collection.insert_one(video_data)

    def find_video_by_id(self, video_id):
        """Find video by ID."""
        return self.collection.find_one({"_id": ObjectId(video_id)})

    def find_videos_by_category(self, category_id):
        """Find videos by category ID."""
        return list(self.collection.find({"category_id": ObjectId(category_id)}))

    def find_all_videos(self):
        """Get all videos."""
        return list(self.collection.find())

    def update_video(self, video_id, data):
        """Update video details."""
        self.collection.update_one({"_id": ObjectId(video_id)}, {"$set": data})

    def delete_video(self, video_id):
        """Delete a video by ID."""
        result = self.collection.delete_one({"_id": ObjectId(video_id)})
        return result.deleted_count
