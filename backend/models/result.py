from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId

class Result:
    def __init__(self, db):
        self.collection = db["results"]

    def create_result(self, video_id, user_id, accuracy_score, calories_burned, exercise_duration, 
                      steps_taken, movement_efficiency, performance_score, motion_matching_score, 
                      user_feedback, energy_expenditure, steps_per_minute):
        """Insert a new result with extended fields."""
        result_data = {
            "video_id": ObjectId(video_id),
            "user_id": ObjectId(user_id),
            "accuracy_score": accuracy_score,
            "calories_burned": calories_burned,
            "exercise_duration": exercise_duration,
            "steps_taken": steps_taken,
            "movement_efficiency": movement_efficiency,
            "performance_score": performance_score,
            "motion_matching_score": motion_matching_score,
            "user_feedback": user_feedback,
            "energy_expenditure": energy_expenditure,
            "steps_per_minute": steps_per_minute,
            "created_at": datetime.utcnow()
        }
        return self.collection.insert_one(result_data)

    def find_results_by_user(self, user_id):
        """Find results by user ID."""
        return list(self.collection.find({"user_id": ObjectId(user_id)}))

    def find_results_by_video(self, video_id):
        """Find results by video ID."""
        return list(self.collection.find({"video_id": ObjectId(video_id)}))

    def get_all_results(self):
        """Fetch all results."""
        return list(self.collection.find({}))

    def get_leaderboard(self, user_id=None):
        """Fetch leaderboard or ranking for a specific user."""
        pipeline = [
            {
                "$group": {
                    "_id": "$user_id",
                    "average_accuracy": {"$avg": "$accuracy_score"},
                    "total_dances": {"$sum": 1}
                }
            },
            {
                "$sort": {"average_accuracy": -1}
            }
        ]

        if user_id:
            pipeline.insert(0, {"$match": {"user_id": ObjectId(user_id)}})

        leaderboard_data = list(self.collection.aggregate(pipeline))
        return leaderboard_data