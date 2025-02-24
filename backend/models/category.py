from datetime import datetime
from bson.objectid import ObjectId

class Category:
    def __init__(self, db):
        self.collection = db["categories"]
        self.video_collection = db["videos"]  

    def create_category(self, name, description=""):
        """Insert a new category."""
        category_data = {
            "name": name,
            "description": description,
            "created_at": datetime.utcnow()
        }
        return self.collection.insert_one(category_data)

    def find_category_by_name(self, name):
        """Find category by name."""
        return self.collection.find_one({"name": name})

    def find_category_by_id(self, category_id):
        """Find category by ID."""
        return self.collection.find_one({"_id": ObjectId(category_id)})

    def get_all_categories(self):
        """Get all categories."""
        return list(self.collection.find())
    
    def update_category(self, category_id, updated_data):
        """Update a category by ID."""
        result = self.collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": updated_data}
        )
        return result.modified_count

    def delete_category(self, category_id):
        """Delete a category and its associated videos."""
        category_obj_id = ObjectId(category_id)

        # Delete all videos associated with this category
        self.video_collection.delete_many({"category_id": category_obj_id})

        # Delete the category itself
        result = self.collection.delete_one({"_id": category_obj_id})
        return result.deleted_count
