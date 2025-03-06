from flask import Blueprint, request, jsonify, url_for, redirect
from services.db import get_db
from models.user import User
from services.token_utils import generate_token, require_auth, decode_token
from werkzeug.security import check_password_hash, generate_password_hash
from cloudinary.uploader import upload, destroy
from flask_mail import Message
from services.mail_config import mail
from bson.objectid import ObjectId

routes = Blueprint("routes", __name__, url_prefix="/api")
db = get_db()
user_model = User(db)

@routes.route("/register", methods=["POST"])
def register():
    data = request.form
    if user_model.find_user_by_email(data["email"]):
        return jsonify({"error": "User already exists"}), 400

    file = request.files.get("image")
    image_url = upload(file, folder="profile").get("secure_url") if file else ""

    user_model.create_user({**data, "image": image_url})

    message = Message(
        "Welcome to Ifit!",
        sender="your-email@example.com",  
        recipients=[data["email"]]
    )
    message.body = f"Hello {data['name']},\n\nThank you for registering on our platform! We're excited to have you.\n\nBest regards,\nIfit Team"

    try:
        mail.send(message)
    except Exception as e:
        return jsonify({"error": "Error sending email", "message": str(e)}), 500

    return jsonify({"message": "User registered successfully, confirmation email sent"}), 201


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

