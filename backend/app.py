from flask import Flask
from config import Config
from api.routes import *
from api.categoryRoutes import *
from api.videoRoutes import video_routes
from flask_cors import CORS
from services.mail_config import configure_mail
from dotenv import load_dotenv
from models.video import Video
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Load configuration from Config class
app.config.from_object(Config)

# Configure Mailtrap
configure_mail(app)

# Enable CORS for the app
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config["VIDEO_INSTANCE"] = Video(db)
# Register Blueprints
app.register_blueprint(routes)
app.register_blueprint(category_routes)
app.register_blueprint(video_routes)

if __name__ == "__main__":
    app.run(debug=True)
