import json
import threading
import numpy as np
import cv2
from flask import Flask, jsonify, request
from flask_cors import CORS
import mediapipe as mp
from services.db import get_db
from bson.objectid import ObjectId
from models.motion import MotionData
from models.video import Video
from config import Config
from api.routes import *
from api.categoryRoutes import *
from api.videoRoutes import video_routes
# from api.motionRoutes import motion_routes
# from api.RealTimeRoutes import session_routes
from services.mail_config import configure_mail
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Configure Mailtrap
configure_mail(app)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Database instance
db = get_db()
app.config["VIDEO_INSTANCE"] = Video(db)

# Initialize Pose Estimation using MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()

comparison_running = False  # Track comparison status

# Setup models
video_model = Video(db)
motion_model = MotionData(db)

# ✅ Function to extract keypoints from video frames
def extract_keypoints_from_video(video_url):
    cap = cv2.VideoCapture(video_url)
    keypoints_list = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            keypoints = {
                f"keypoint_{i}": {
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z
                } for i, lm in enumerate(results.pose_landmarks.landmark)
            }
            keypoints_list.append({"keypoints": keypoints})

    cap.release()
    return keypoints_list

# ✅ Function to draw stickman visualization using keypoint names
def draw_stickman(frame, pose_landmarks, color):
    for connection in mp_pose.POSE_CONNECTIONS:
        part1_idx, part2_idx = connection

        # Convert indices to keypoint names based on the number of keypoints
        keypoint_name1 = f"keypoint_{part1_idx}"
        keypoint_name2 = f"keypoint_{part2_idx}"

        # Ensure both keypoints exist in the pose_landmarks
        if keypoint_name1 in pose_landmarks and keypoint_name2 in pose_landmarks:
            part1 = pose_landmarks[keypoint_name1]
            part2 = pose_landmarks[keypoint_name2]

            # Get the coordinates of the two connected parts
            x1, y1 = int(part1['x'] * frame.shape[1]), int(part1['y'] * frame.shape[0])
            x2, y2 = int(part2['x'] * frame.shape[1]), int(part2['y'] * frame.shape[0])

            # Draw the connection and the two parts (keypoints)
            cv2.line(frame, (x1, y1), (x2, y2), color, 3)
            cv2.circle(frame, (x1, y1), 5, color, -1)
            cv2.circle(frame, (x2, y2), 5, color, -1)

# ✅ Function to calculate pose similarity
def calculate_similarity(reference_pose, live_pose):
    if len(reference_pose) != len(live_pose):
        return 0

    total_score = 0
    num_keypoints = len(reference_pose)

    for i in range(num_keypoints):
        ref_keypoint_name = f"keypoint_{i}"
        live_keypoint_name = f"keypoint_{i}"

        # Make sure the keypoint exists in both reference and live pose
        if ref_keypoint_name in reference_pose and live_keypoint_name in live_pose:
            ref_coords = np.array([reference_pose[ref_keypoint_name]['x'], reference_pose[ref_keypoint_name]['y']])
            live_coords = np.array([live_pose[live_keypoint_name]['x'], live_pose[live_keypoint_name]['y']])
            distance = np.linalg.norm(ref_coords - live_coords)

            score = max(0, 1 - distance)
            total_score += score

    return (total_score / num_keypoints) * 100  

# ✅ Function to compare live pose with reference pose from video
def compare_live_pose(video_id):
    global comparison_running
    comparison_running = True

    video = video_model.find_video_by_id(video_id)
    if not video:
        return jsonify({"error": "Video not found"}), 404

    reference_poses = extract_keypoints_from_video(video["video_url"])
    if not reference_poses:
        return jsonify({"error": "No keypoints extracted from video"}), 404

    cap_webcam = cv2.VideoCapture(0)
    cap_video = cv2.VideoCapture(video["video_url"])

    frame_index = 0
    total_score = 0
    frame_count = 0

    while cap_webcam.isOpened() and cap_video.isOpened():
        ret_webcam, frame_webcam = cap_webcam.read()
        ret_video, frame_video = cap_video.read()

        if not ret_webcam or not ret_video:
            break

        height, width, _ = frame_webcam.shape
        frame_video_resized = cv2.resize(frame_video, (width, height))

        frame_rgb = cv2.cvtColor(frame_webcam, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            live_keypoints = {
                f"keypoint_{i}": {
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z
                } for i, lm in enumerate(results.pose_landmarks.landmark)
            }

            if frame_index < len(reference_poses):
                reference_pose = reference_poses[frame_index]["keypoints"]
                frame_score = calculate_similarity(reference_pose, live_keypoints)

                total_score += frame_score
                frame_count += 1

                color = (0, 255, 0) if frame_score > 80 else (0, 255, 255) if frame_score > 50 else (0, 0, 255)

                draw_stickman(frame_webcam, live_keypoints, color)
                draw_stickman(frame_video_resized, reference_pose, (255, 255, 255))

                cv2.putText(frame_webcam, f"Score: {frame_score:.2f}%", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            frame_index += 1

        combined_frame = cv2.hconcat([frame_webcam, frame_video_resized])
        cv2.imshow("Live Comparison", combined_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap_webcam.release()
    cap_video.release()
    cv2.destroyAllWindows()

    comparison_running = False

    # ✅ Compute the final average score
    final_average_score = total_score / frame_count if frame_count > 0 else 0
    print(f"Final Average Accuracy Score: {final_average_score:.2f}%")

# ✅ API: Start comparison
comparison_lock = threading.Lock()
@app.route('/start_comparison', methods=['POST'])
def start_comparison():
    global comparison_running

    video_id = request.json.get("video_id")
    if not video_id:
        return jsonify({"error": "Video ID is required"}), 400

    with comparison_lock:
        if comparison_running:
            return jsonify({"error": "Comparison already running"}), 400
        comparison_running = True

    threading.Thread(target=compare_live_pose, args=(video_id,)).start()
    return jsonify({"message": "Comparison started"}), 200

# ✅ API: Get status of comparison
@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({"comparison_running": comparison_running})

# Register other Blueprints
app.register_blueprint(routes)
app.register_blueprint(category_routes)
app.register_blueprint(video_routes)
# app.register_blueprint(motion_routes)
# app.register_blueprint(session_routes)

# Run Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)