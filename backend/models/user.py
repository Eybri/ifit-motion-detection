from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.start()

# Shut down the scheduler when the app exits
atexit.register(lambda: scheduler.shutdown())

class User:
    def __init__(self, db):
        self.collection = db["users"]

    def create_user(self, data):
        """Insert a new user with status (default: Inactive)."""
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
            "status": "Inactive",  # Set status to Inactive until OTP is verified
            "otp": data.get("otp", ""),
            "created_at": datetime.utcnow(),
            "deactivated_at": None  # Initialize deactivated_at as None
        }
        return self.collection.insert_one(user_data)
    def find_user_by_email(self, email):
        """Find user by email."""
        return self.collection.find_one({"email": email})

    def find_user_by_id(self, user_id):
        """Find user by ID."""
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def update_user_password(self, user_id, new_password):
        """Update user password."""
        hashed_password = generate_password_hash(new_password)
        self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed_password}})
            
    def update_user_status(self, user_id, status):
        """
        Update user status to Active, Inactive, or Archived.
        
        Args:
            user_id (str): The ID of the user to update.
            status (str): The new status. Must be one of "Active", "Inactive", or "Archived".
        """
        valid_statuses = ["Active", "Inactive", "Archived"]
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")

        update_data = {"status": status}
        
        if status == "Inactive":
            update_data["deactivated_at"] = datetime.utcnow()  # Set deactivation timestamp
        elif status == "Active":
            update_data["deactivated_at"] = None  # Clear deactivation timestamp
        elif status == "Archived":
            update_data["deactivated_at"] = None  # Clear deactivation timestamp for archived users

        self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    def delete_user(self, user_id):
        """Delete a user by ID."""
        result = self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count
    
    def update_user(self, user_id, data):
        """Update user profile details."""
        self.collection.update_one({"_id": ObjectId(user_id)}, {"$set": data})

    def deactivate_user_temporarily(self, user_id):
        """Deactivate user for 15 hours and schedule reactivation."""
        # Deactivate the user and set deactivated_at timestamp
        self.update_user_status(user_id, "Inactive")
        
        # Schedule reactivation after 15 hours
        reactivation_time = datetime.utcnow() + timedelta(hours=15)
        scheduler.add_job(
            func=self.reactivate_user,
            trigger='date',
            run_date=reactivation_time,
            args=[user_id]
        )

    def reactivate_user(self, user_id):
        """Reactivate the user and clear deactivated_at timestamp."""
        self.update_user_status(user_id, "Active")
