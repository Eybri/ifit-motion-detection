from datetime import datetime
from bson.objectid import ObjectId
import cloudinary 
import cloudinary.uploader
import os

class Video:
    def __init__(self, db):
        self.collection = db["videos"]
    
    def upload_video(self, category_id, title, video_file, description="", folder="fitness_videos"):
        """Upload video to a folder in Cloudinary and store it in the database."""
        # Upload the video to Cloudinary
        upload_result = cloudinary.uploader.upload(
            video_file,
            resource_type="video",
            folder=folder,  # Specify the folder for the video
            eager=[{"width": 150, "height": 150, "crop": "fill", "format": "jpg"}]  # Generate thumbnail
        )

        # The thumbnail URL will be available in the `eager` array of the upload response
        thumbnail_url = upload_result['eager'][0]['secure_url']

        video_data = {
            "category_id": ObjectId(category_id),
            "title": title,
            "description": description,
            "video_url": upload_result["secure_url"],
            "thumbnail_url": thumbnail_url,  # Store generated thumbnail URL
            "cloudinary_public_id": upload_result["public_id"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        return self.collection.insert_one(video_data)

    
    def find_video_by_id(self, video_id):
        """Find a video by its ID."""
        return self.collection.find_one({"_id": ObjectId(video_id)})
    
    def get_all_videos(self, category_id=None):
        """Retrieve all videos or filter by category ID."""
        query = {}
        if category_id:
            query["category_id"] = ObjectId(category_id)
        return list(self.collection.find(query))
    
    def update_video(self, video_id, updated_data):
        """Update video information by ID."""
        updated_data["updated_at"] = datetime.utcnow()
        result = self.collection.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": updated_data}
        )
        return result.modified_count

    def delete_video(self, video_id):
        """Delete a video from the database and Cloudinary."""
        video = self.find_video_by_id(video_id)
        if not video:
            return False
        
        # Delete from Cloudinary
        cloudinary.uploader.destroy(video["cloudinary_public_id"], resource_type="video")

        # Delete from MongoDB
        self.collection.delete_one({"_id": ObjectId(video_id)})
        return True
