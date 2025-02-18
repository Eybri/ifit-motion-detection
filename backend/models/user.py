from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from bson.objectid import ObjectId

class User:
    def __init__(self, db):
        self.collection = db["users"]

    def create_user(self, data):
        """Insert a new user."""
        hashed_password = generate_password_hash(data["password"])
        user_data = {
            "name": data["name"],
            "email": data["email"],
            "password": hashed_password,
            "gender": data["gender"],
            "date_of_birth": data["date_of_birth"],
            "height": data["height"],
            "weight": data["weight"],
            "is_admin": data.get("is_admin", False),
            "image": data.get("image", ""),
            "created_at": datetime.utcnow()
        }
        return self.collection.insert_one(user_data)

    def find_user_by_email(self, email):
        """Find user by email."""
        return self.collection.find_one({"email": email})

    def find_user_by_id(self, user_id):
        """Find user by ID."""
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def update_user_password(self, user_id, new_password):
        self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": new_password}})
        
        
    def delete_user(self, user_id):
        """Delete a user by ID."""
        result = self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count
    
    def update_user(self, user_id, data):
        """Update user profile details."""
        self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": data})
    

