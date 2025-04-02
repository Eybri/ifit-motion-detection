from flask import Blueprint, request, jsonify
from services.db import get_db
from bson import ObjectId

feedback_routes = Blueprint("feedback_routes", __name__, url_prefix="/api/feedback")  # <- Added `url_prefix`
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

@feedback_routes.route("/<feedback_id>/reply/", methods=["POST"])
def reply_to_feedback(feedback_id):
    """Admin reply to feedback."""
    data = request.json
    admin_reply = data.get("reply")

    if not admin_reply:
        return jsonify({"error": "Reply is required"}), 400

    feedback = db.feedback.find_one({"_id": ObjectId(feedback_id)})

    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404

    db.feedback.update_one(
        {"_id": ObjectId(feedback_id)},
        {"$push": {"replies": admin_reply}}
    )

    return jsonify({"message": "Reply added successfully"}), 200

@feedback_routes.route("/", methods=["GET"])
def get_all_feedback():
    """Retrieve all feedback with replies."""
    feedbacks = list(db.feedback.find({}, {"_id": 1, "feedback": 1, "email": 1, "replies": 1}))

    for feedback in feedbacks:
        feedback["_id"] = str(feedback["_id"])

    return jsonify(feedbacks), 200

@feedback_routes.route("/<feedback_id>/", methods=["DELETE"])
def delete_feedback(feedback_id):
    """Delete a feedback entry."""
    try:
        # Verify the feedback exists first
        feedback = db.feedback.find_one({"_id": ObjectId(feedback_id)})
        if not feedback:
            return jsonify({"error": "Feedback not found"}), 404

        # Delete the feedback
        result = db.feedback.delete_one({"_id": ObjectId(feedback_id)})
        
        if result.deleted_count == 1:
            return jsonify({"message": "Feedback deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete feedback"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 400
