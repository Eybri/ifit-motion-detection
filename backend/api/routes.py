from flask import Blueprint, request, jsonify, url_for, redirect
from services.db import get_db
from models.user import User
from services.token_utils import generate_token, require_auth, decode_token
from werkzeug.security import check_password_hash, generate_password_hash
from cloudinary.uploader import upload
from flask_mail import Message
from services.mail_config import mail

routes = Blueprint("routes", __name__, url_prefix="/api")
db = get_db()
user_model = User(db)

@routes.route("/register", methods=["POST"])
def register():
    data = request.form
    if user_model.find_user_by_email(data["email"]):
        return jsonify({"error": "User already exists"}), 400

    # Handle image upload
    file = request.files.get("image")
    image_url = ""
    if file:
        try:
            upload_result = upload(file, folder="profile")
            image_url = upload_result.get("secure_url")
        except Exception as e:
            return jsonify({"error": "Image upload failed", "details": str(e)}), 500

    data = dict(data)
    data["image"] = image_url
    user_model.create_user(data)
    return jsonify({"message": "User registered successfully"}), 201


@routes.route("/login", methods=["POST"])
def login():
    data = request.json
    user = user_model.find_user_by_email(data["email"])
    if user and check_password_hash(user["password"], data["password"]):
        token = generate_token(str(user["_id"]))
        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "is_admin": user.get("is_admin", False),
                "image": user.get("image", "")
            }
        }), 200
    return jsonify({"error": "Invalid email or password"}), 401


@routes.route("/logout", methods=["POST"])
@require_auth
def logout(user_id):
    # Placeholder for token invalidation logic
    return jsonify({"message": "Logged out successfully"}), 200


@routes.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    user = user_model.find_user_by_email(data["email"])
    if not user:
        return jsonify({"error": "Email not found"}), 404

    # Generate reset token
    reset_token = generate_token(str(user["_id"]), expires_in=1)
    reset_link = url_for("routes.reset_password", token=reset_token, _external=True)

    # Send email
    msg = Message(
        subject="Password Reset Request",
        sender="no-reply@ifit.com",
        recipients=[user["email"]]
    )
    msg.body = f"Hi {user['name']},\n\nTo reset your password, click the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe iFit Team"
    mail.send(msg)

    return jsonify({"message": "Password reset link sent to your email"}), 200


@routes.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "GET":
        return redirect(f"http://localhost:3000/reset-password/{token}", code=302)

    if request.method == "POST":
        try:
            decoded = decode_token(token)
            user_id = decoded["user_id"]
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        user = user_model.find_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        new_password = request.json.get("password")
        if not new_password:
            return jsonify({"error": "Password is required"}), 400

        hashed_password = generate_password_hash(new_password)
        user_model.update_user_password(user_id, hashed_password)
        return jsonify({"message": "Password reset successful"}), 200

@routes.route("/user/<user_id>", methods=["GET"])
@require_auth
def get_user_profile(user_id):
    """Fetch user profile details."""
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON compatibility
    return jsonify({"user": user}), 200

@routes.route("/user/<user_id>", methods=["DELETE"])
@require_auth
def delete_user(user_id):
    """Delete a user."""
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Delete the user from the database
    deleted_count = user_model.delete_user(user_id)
    if deleted_count == 0:
        return jsonify({"error": "Failed to delete user"}), 500

    # Send account deletion confirmation email
    try:
        msg = Message(
            subject="Account Deletion Confirmation",
            sender="no-reply@ifit.com",
            recipients=[user["email"]]
        )
        msg.body = f"""
Hi {user['name']},

We want to confirm that your account associated with this email has been successfully deleted.

If this action was not authorized by you or you have any concerns, please contact our support team immediately.

Thanks,
The iFit Team
"""
        mail.send(msg)
    except Exception as e:
        # Log email sending failure (optional)
        print(f"Failed to send email: {e}")

    return jsonify({"message": "User deleted successfully"}), 200




