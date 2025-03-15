from flask import Blueprint, request, jsonify
from services.db import get_db
from models.user import User
from models.result import Result
from services.mail_config import mail

result_routes = Blueprint("result", __name__, url_prefix="/api")
db = get_db()
user_model = User(db)
result_model = Result(db)


@result_routes.route("/leaderboard", methods=["GET"])
def leaderboard():
    user_id = request.args.get("user_id")  # Optional: Fetch ranking for a specific user
    fetch_all = request.args.get("fetch_all", default="false").lower() == "true"  # Optional: Fetch all results

    if fetch_all:
        # Fetch all results for the specific user
        if user_id:
            user_results = result_model.find_results_by_user(user_id)
            
            # Enrich the results with user details
            enriched_results = []
            for result in user_results:
                user = user_model.find_user_by_id(result["user_id"])
                if user:
                    enriched_results.append({
                        "result_id": str(result["_id"]),
                        "user_id": str(result["user_id"]),
                        "name": user["name"],
                        "email": user["email"],
                        "video_id": str(result["video_id"]),
                        "accuracy_score": result["accuracy_score"],
                        "calories_burned": result["calories_burned"],
                        "exercise_duration": result["exercise_duration"],
                        "steps_taken": result["steps_taken"],
                        "movement_efficiency": result["movement_efficiency"],
                        "performance_score": result["performance_score"],
                        "motion_matching_score": result["motion_matching_score"],
                        "user_feedback": result["user_feedback"],
                        "energy_expenditure": result["energy_expenditure"],
                        "steps_per_minute": result["steps_per_minute"],
                        "created_at": result["created_at"]
                    })
            
            return jsonify(enriched_results), 200
        else:
            return jsonify({"error": "user_id is required when fetch_all is true"}), 400
    else:
        # Fetch leaderboard data
        leaderboard_data = result_model.get_leaderboard(user_id)
        
        # Enrich the leaderboard data with user details
        enriched_leaderboard = []
        for entry in leaderboard_data:
            user = user_model.find_user_by_id(entry["_id"])
            if user:
                enriched_leaderboard.append({
                    "user_id": str(entry["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "average_accuracy": entry["average_accuracy"],
                    "total_dances": entry["total_dances"]
                })
        
        return jsonify(enriched_leaderboard), 200

@result_routes.route("/results/<result_id>/archive", methods=["PUT"])
def archive_result(result_id):
    data = request.get_json()
    archived = data.get("archived", True)

    result = result_model.archive_result(result_id, archived)

    if result.matched_count > 0:
        return jsonify({"message": "Result archived successfully" if archived else "Result unarchived successfully"}), 200
    else:
        return jsonify({"message": "Result not found"}), 404