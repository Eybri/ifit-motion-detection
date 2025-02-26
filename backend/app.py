from flask import Flask
from flask_socketio import SocketIO
from config import Config
from api.routes import *
from api.categoryRoutes import *
from api.videoRoutes import video_routes
from api.motionRoutes import motion_routes
from flask_cors import CORS
from services.mail_config import configure_mail
from dotenv import load_dotenv
from models.video import Video
from services.db import get_db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")
# Configure Mailtrap
configure_mail(app)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Database instance
db = get_db()
app.config["VIDEO_INSTANCE"] = Video(db)

# Register Blueprints
app.register_blueprint(routes)
app.register_blueprint(category_routes)
app.register_blueprint(video_routes)
app.register_blueprint(motion_routes)

if __name__ == "__main__":
    socketio.run(app, debug=True, use_reloader=False)



