from flask import Blueprint, request, jsonify
from services.db import get_db
from models.category import Category

category_routes = Blueprint("category_routes", __name__, url_prefix="/api/categories")
db = get_db()
category_model = Category(db)

@category_routes.route("/", methods=["POST"])
def create_category():
    """Create a new category"""
    data = request.json
    if not data.get("name"):
        return jsonify({"error": "Category name is required"}), 400

    existing_category = category_model.find_category_by_name(data["name"])
    if existing_category:
        return jsonify({"error": "Category already exists"}), 400

    result = category_model.create_category(data["name"], data.get("description", ""))
    return jsonify({"message": "Category created", "id": str(result.inserted_id)}), 201

@category_routes.route("/", methods=["GET"])
def get_all_categories():
    """Retrieve all categories"""
    categories = category_model.get_all_categories()
    return jsonify([
        {
            "id": str(category["_id"]),
            "name": category["name"],
            "description": category["description"],
            "created_at": category["created_at"]
        }
        for category in categories
    ]), 200

@category_routes.route("/<category_id>", methods=["GET"])
def get_category_by_id(category_id):
    """Retrieve a category by its ID"""
    category = category_model.find_category_by_id(category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({
        "id": str(category["_id"]),
        "name": category["name"],
        "description": category["description"],
        "created_at": category["created_at"]
    }), 200

@category_routes.route("/<category_id>", methods=["PUT"])
def update_category(category_id):
    """Update a category by its ID"""
    data = request.json

    if not data.get("name"):
        return jsonify({"error": "Category name is required"}), 400

    # Find the category to ensure it exists
    existing_category = category_model.find_category_by_id(category_id)
    if not existing_category:
        return jsonify({"error": "Category not found"}), 404

    # Check for duplicate category name
    if (
        data.get("name")
        and existing_category["name"] != data["name"]
        and category_model.find_category_by_name(data["name"])
    ):
        return jsonify({"error": "A category with this name already exists"}), 400

    # Update the category
    updated_data = {
        "name": data["name"],
        "description": data.get("description", existing_category.get("description")),
    }
    modified_count = category_model.update_category(category_id, updated_data)

    if modified_count == 0:
        return jsonify({"message": "No changes made to the category"}), 200

    return jsonify({"message": "Category updated successfully"}), 200


@category_routes.route("/<category_id>", methods=["DELETE"])
def delete_category(category_id):
    """Delete a category and its associated videos"""
    deleted_count = category_model.delete_category(category_id)
    if deleted_count == 0:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({"message": "Category and related videos deleted successfully"}), 200
