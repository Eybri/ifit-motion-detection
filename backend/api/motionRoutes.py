from flask_socketio import SocketIO
from flask import Blueprint
from services.db import get_db

motion_routes = Blueprint("motion_routes", __name__, url_prefix="/api/motion")
db = get_db()
socketio = SocketIO()

@socketio.on("send_pose")
def handle_pose_data(data):
    """Handles incoming pose data from frontend"""
