from flask import Blueprint, request, jsonify
from services.db import get_db

feedback_routes = Blueprint("feedback_routes", __name__, url_prefix="/api/feedback")
db = get_db()

@feedback_routes.route("/", methods=["POST"])
def submit_feedback():
    """Submit user feedback."""
    data = request.json
    feedback_text = data.get("feedback")
    user_email = data.get("email", None)  # Optional for guest users

    if not feedback_text:
        return jsonify({"error": "Feedback is required"}), 400

    feedback_data = {
        "feedback": feedback_text,
        "email": user_email,
        "replies": []  # Placeholder for admin replies
    }
    inserted_feedback = db.feedback.insert_one(feedback_data)

    return jsonify({"message": "Feedback submitted successfully", "feedback_id": str(inserted_feedback.inserted_id)}), 201

@feedback_routes.route("/", methods=["GET"])
def get_feedback():
    """Retrieve all feedback."""
    feedback_list = list(db.feedback.find({}, {"_id": 0}))
    return jsonify(feedback_list), 200

