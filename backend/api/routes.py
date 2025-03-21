from flask import Blueprint, request, jsonify, url_for, redirect
from services.db import get_db
from models.user import User
from services.token_utils import generate_token, require_auth, decode_token
from werkzeug.security import check_password_hash, generate_password_hash
from cloudinary.uploader import upload, destroy
from flask_mail import Message
from services.mail_config import mail
from bson.objectid import ObjectId
import random
import string

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))
routes = Blueprint("routes", __name__, url_prefix="/api")
db = get_db()
user_model = User(db)
# result_model = Result(db)

@routes.route("/register", methods=["POST"])
def register():
    data = request.form
    if user_model.find_user_by_email(data["email"]):
        return jsonify({"error": "User already exists"}), 400

    file = request.files.get("image")
    image_url = upload(file, folder="profile").get("secure_url") if file else ""

    otp = generate_otp()
    user_data = {
        **data,
        "image": image_url,
        "otp": otp,
        "status": "Inactive"  # Set status to Inactive until OTP is verified
    }
    user_model.create_user(user_data)

    message = Message(
        "Welcome to Ifit!",
        sender="your-email@example.com",  
        recipients=[data["email"]]
    )
    message.body = f"Hello {data['name']},\n\nThank you for registering on our platform! Please use the following OTP to verify your account: {otp}\n\nBest regards,\nIfit Team"

    try:
        mail.send(message)
    except Exception as e:
        return jsonify({"error": "Error sending email", "message": str(e)}), 500

    return jsonify({"message": "User registered successfully, OTP sent to email"}), 201

@routes.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    user = user_model.find_user_by_email(data["email"])
    if user and user["otp"] == data["otp"]:
        user_model.update_user_status(str(user["_id"]), "Active")
        return jsonify({"message": "OTP verified successfully"}), 200
    return jsonify({"error": "Invalid OTP"}), 401

@routes.route("/login", methods=["POST"])
def login():
    data = request.json
    user = user_model.find_user_by_email(data["email"])
    if user and check_password_hash(user["password"], data["password"]):
        if user["status"] == "Active":
            token = generate_token(str(user["_id"]))
            return jsonify({
                "token": token,
                "user": {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"],
                    "status": user["status"],
                    "is_admin": user.get("is_admin", False),
                    "image": user.get("image", "")
                }
            }), 200
        else:
            return jsonify({"error": "Your account is not active. Please verify your email."}), 403
    return jsonify({"error": "Invalid email or password"}), 401

@routes.route("/logout", methods=["POST"])
@require_auth
def logout(user_id):
    return jsonify({"message": "Logged out successfully"}), 200

@routes.route("/users", methods=["GET"])
@require_auth
def get_all_users(user_id):
    """Fetches all users. Requires authentication."""
    users = list(user_model.collection.find({}))  
    for user in users:
        user["_id"] = str(user["_id"])  
        user.pop("password", None) 
    return jsonify({"users": users}), 200


@routes.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    user = user_model.find_user_by_email(data["email"])
    if not user:
        return jsonify({"error": "Email not found"}), 404

    reset_token = generate_token(str(user["_id"]), expires_in=1)
    reset_link = url_for("routes.reset_password", token=reset_token, _external=True)

    msg = Message(
        subject="Password Reset Request",
        sender="no-reply@ifit.com",
        recipients=[user["email"]],
        body=f"Hi {user['name']},\n\nTo reset your password, click the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe iFit Team"
    )
    mail.send(msg)

    return jsonify({"message": "Password reset link sent to your email"}), 200

@routes.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "GET":
        return redirect(f"http://localhost:3000/reset-password/{token}", code=302)

    try:
        user_id = decode_token(token)["user_id"]
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    new_password = request.json.get("password")
    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    user_model.update_user_password(user_id, generate_password_hash(new_password))
    return jsonify({"message": "Password reset successful"}), 200

@routes.route("/user/<user_id>", methods=["GET"])
@require_auth
def get_user_profile(user_id):
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify({"user": user}), 200

@routes.route("/user/<user_id>", methods=["DELETE"])
@require_auth
def delete_user(user_id):
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user_model.delete_user(user_id) == 0:
        return jsonify({"error": "Failed to delete user"}), 500

    msg = Message(
        subject="Account Deletion Confirmation",
        sender="no-reply@ifit.com",
        recipients=[user["email"]],
        body=f"Hi {user['name']},\n\nYour account has been successfully deleted.\n\nThanks,\nThe iFit Team"
    )
    mail.send(msg)

    return jsonify({"message": "User deleted successfully"}), 200

@routes.route("/user/<user_id>", methods=["PUT"])
@require_auth
def update_user_profile(user_id):
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = {k: v for k, v in request.json.items() if k != "password" and k != "_id"}
    user_model.collection.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    return jsonify({"message": "Profile updated successfully"}), 200

@routes.route("/user/<user_id>/image", methods=["PUT"])
@require_auth
def update_user_image(user_id):
    user = user_model.find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image file provided"}), 400

    if user.get("image"):
        destroy(user["image"].split("/")[-1].split(".")[0])

    image_url = upload(file, folder="profile").get("secure_url")
    user_model.collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"image": image_url}})
    return jsonify({"message": "Image updated successfully", "image_url": image_url}), 200

@routes.route("/admin/update-status/<user_id>", methods=["PUT"])
def update_user_status(user_id):
    """Admin can change user status to Active, Inactive, or Archived."""
    # Fetch the user whose status is being updated
    user_to_update = user_model.find_user_by_id(user_id)
    if not user_to_update:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    new_status = data.get("status")
    reason = data.get("reason", "")  # Get the reason for deactivation (optional)

    # Validate the new status
    if new_status.lower() not in ["active", "inactive", "archived"]:  # Add "archived" to the list
        return jsonify({"error": "Invalid status. Must be 'active', 'inactive', or 'archived'."}), 400

    new_status = new_status.title()  # Convert to title case (e.g., "active" -> "Active")

    # Update the user status in the database
    user_model.update_user_status(user_id, new_status)

    # Retrieve the updated user's email and name
    user_email = user_to_update.get("email")
    user_name = user_to_update.get("name")

    # Send email to the user (only for Active/Inactive status changes)
    if new_status in ["Active", "Inactive"]:
        message = Message(
            "Account Status Updated",
            sender="your-email@example.com",  # Replace with your email
            recipients=[user_email]
        )

        # Customize the email body based on the status
        if new_status == "Inactive":
            message.body = f"Hello {user_name},\n\nYour account status has been updated to {new_status} for 15h."
            if reason:
                message.body += f"\n\nReason for deactivation: {reason}"
            message.body += "\n\nBest regards,\nIfit Team"
        else:
            message.body = f"Hello {user_name},\n\nYour account status has been updated to {new_status}.\n\nBest regards,\nIfit Team"

        try:
            mail.send(message)
        except Exception as e:
            return jsonify({"error": "Error sending email", "message": str(e)}), 500

    return jsonify({"message": f"User status updated to {new_status}"}), 200