from flask import Blueprint, request, jsonify
from services.db import get_db
from models.user import User
from models.result import Result
from services.mail_config import mail
from bson.objectid import ObjectId

result_routes = Blueprint("result", __name__, url_prefix="/api")
db = get_db()
user_model = User(db)
result_model = Result(db)

@result_routes.route("/results/<result_id>/archive", methods=["PUT"])
def archive_result(result_id):
    data = request.get_json()
    archived = data.get("archived", True)

    result = result_model.archive_result(result_id, archived)

    if result.matched_count > 0:
        return jsonify({"message": "Result archived successfully" if archived else "Result unarchived successfully"}), 200
    else:
        return jsonify({"message": "Result not found"}), 404