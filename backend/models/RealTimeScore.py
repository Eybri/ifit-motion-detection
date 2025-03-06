from datetime import datetime
from bson.objectid import ObjectId

class RealTimeScore:
    def __init__(self, db):
        self.collection = db["real_time_scores"]

    def save_score(self, user_id, video_id, frame_scores):
        """Store real-time accuracy scores in the database."""
        score_entry = {
            "user_id": ObjectId(user_id),
            "video_id": ObjectId(video_id),
            "timestamp": datetime.utcnow(),
            "scores": frame_scores  # Array of accuracy scores per frame
        }
        return self.collection.insert_one(score_entry).inserted_id

    def get_scores_by_video(self, video_id):
        """Retrieve all scores for a specific video."""
        return list(self.collection.find({"video_id": ObjectId(video_id)}, {"_id": 0}))

    def get_scores_by_user(self, user_id):
        """Retrieve all scores for a specific user."""
        return list(self.collection.find({"user_id": ObjectId(user_id)}, {"_id": 0}))

    def delete_scores_by_video(self, video_id):
        """Delete all scores associated with a specific video."""
        return self.collection.delete_many({"video_id": ObjectId(video_id)}).deleted_count
