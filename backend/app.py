import threading
import numpy as np
import cv2
import base64
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mediapipe as mp
from services.db import get_db
from models.video import Video
from models.result import Result
from models.user import User
from models.motion import MotionData
from config import Config
from api.resultRoutes import result_routes
from api.routes import routes
from api.categoryRoutes import category_routes
from api.videoRoutes import video_routes
from services.mail_config import configure_mail
from dotenv import load_dotenv
from api.feedbackRoutes import feedback_routes
import scipy.integrate as integrate
import pandas as pd

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
configure_mail(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="*")

db = get_db()
app.config["VIDEO_INSTANCE"] = Video(db)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

comparison_running = False
video_model = Video(db)
user_model = User(db)
motion_data = MotionData(db)

def draw_stickman(frame, landmarks, color):
    for connection in mp_pose.POSE_CONNECTIONS:
        part1_idx, part2_idx = connection
        keypoint1 = landmarks.get(f"keypoint_{part1_idx}")
        keypoint2 = landmarks.get(f"keypoint_{part2_idx}")

        if keypoint1 and keypoint2:
            x1, y1 = int(keypoint1['x'] * frame.shape[1]), int(keypoint1['y'] * frame.shape[0])
            x2, y2 = int(keypoint2['x'] * frame.shape[1]), int(keypoint2['y'] * frame.shape[0])
            cv2.line(frame, (x1, y1), (x2, y2), color, 3)
            cv2.circle(frame, (x1, y1), 5, color, -1)
            cv2.circle(frame, (x2, y2), 5, color, -1)

def calculate_similarity(ref_pose, live_pose):
    if len(ref_pose) != len(live_pose):
        return 0

    total_score = 0
    num_keypoints = len(ref_pose)

    for i in range(num_keypoints):
        ref_key = f"keypoint_{i}"
        live_key = f"keypoint_{i}"

        if ref_key in ref_pose and live_key in live_pose:
            ref_coords = np.array([ref_pose[ref_key]['x'], ref_pose[ref_key]['y']])
            live_coords = np.array([live_pose[live_key]['x'], live_pose[live_key]['y']])
            distance = np.linalg.norm(ref_coords - live_coords)
            total_score += max(0, 1 - distance)

    return (total_score / num_keypoints) * 100  

def get_feedback(score):
    if score >= 90:
        return "PERFECT!", (0, 255, 0)
    elif score >= 75:
        return "GREAT!", (0, 200, 255)
    elif score >= 50:
        return "GOOD!", (0, 165, 255)
    else:
        return "KEEP TRYING!", (0, 0, 255)

def calculate_metrics(weight_kg, duration_minutes, steps_taken, accuracy_score, active_frames, total_frames):
    # Calculate activity level: percentage of frames where the user was active
    activity_level = active_frames / total_frames if total_frames > 0 else 0

    # Adjust MET value based on activity level
    # MET = 1.0 for no activity (resting), 5.0 for full activity
    met_value = 1.0 + (4.0 * activity_level)  # Scales from 1.0 to 5.0 based on activity

    # Calculate calories burned only if the user is actively moving
    if activity_level > 0:  # Only calculate if the user is moving
        calories_burned = (met_value * weight_kg * duration_minutes) / 60
    else:
        calories_burned = 0  # No movement, no calories burned

    # Calculate other metrics
    steps_per_minute = steps_taken / duration_minutes if duration_minutes > 0 else 0
    energy_expenditure = calories_burned * 4184  # Convert calories to joules
    movement_efficiency = (accuracy_score / 100) * steps_taken if steps_taken > 0 else 0
    performance_score = (accuracy_score + movement_efficiency) / 2 if steps_taken > 0 else 0

    return calories_burned, steps_per_minute, energy_expenditure, movement_efficiency, performance_score


def compare_live_pose(video_id, user_id):
    global comparison_running
    comparison_running = True

    video = video_model.find_video_by_id(video_id)
    user = user_model.find_user_by_id(user_id)
    if not video or not user:
        socketio.emit('comparison_error', {'message': 'Video or User not found'})
        comparison_running = False
        return

    # Load preprocessed motion data
    motion_data = MotionData(db).get_motion_data(video_id)
    if not motion_data or "frames" not in motion_data:
        socketio.emit('comparison_error', {'message': 'No preprocessed motion data found'})
        comparison_running = False
        return

    reference_poses = motion_data["frames"]  # Use preprocessed keypoints
    fps = motion_data["fps"]  # Get FPS for synchronization

    weight_kg = float(user["weight"])
    cap_webcam = cv2.VideoCapture(0)
    cap_video = cv2.VideoCapture(video["video_url"])

    frame_index = 0
    total_score = 0
    total_frames = 0  # Track all frames
    active_frames = 0  # Track frames where the user is actively detected
    start_time = time.time()
    steps_taken = 0

    while cap_webcam.isOpened() and cap_video.isOpened():
        ret_webcam, frame_webcam = cap_webcam.read()
        ret_video, frame_video = cap_video.read()

        if not ret_webcam or not ret_video:
            break

        height, width, _ = frame_webcam.shape
        frame_video_resized = cv2.resize(frame_video, (width, height))

        frame_rgb = cv2.cvtColor(frame_webcam, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        total_frames += 1  # Count all frames

        if results.pose_landmarks:
            active_frames += 1  # Count frames where the user is actively detected
            live_keypoints = {f"keypoint_{i}": {"x": lm.x, "y": lm.y, "z": lm.z} for i, lm in enumerate(results.pose_landmarks.landmark)}

            if frame_index < len(reference_poses):
                reference_pose = reference_poses[frame_index]["keypoints"]
                frame_score = calculate_similarity(reference_pose, live_keypoints)
                total_score += frame_score
                feedback, color = get_feedback(frame_score)

                # Calculate text position for feedback at the top
                text_size = cv2.getTextSize(feedback, cv2.FONT_HERSHEY_SIMPLEX, 2, 5)[0]
                text_x = (frame_webcam.shape[1] - text_size[0]) // 2  # Center horizontally
                text_y = text_size[1] + 10  # Place at the top with a small margin
                cv2.putText(frame_webcam, feedback, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 2, color, 5)

                # Place the score below the feedback
                cv2.putText(frame_webcam, f"Score: {frame_score:.2f}%", (10, text_y + text_size[1] + 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                steps_taken += 1  # Only count steps when a person is detected
                frame_index += 1
        else:
            # Assign a score of 0 for frames where no person is detected
            total_score += 0

        combined_frame = cv2.hconcat([frame_webcam, frame_video_resized])
        _, buffer = cv2.imencode('.jpg', combined_frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        socketio.emit('video_frame', {'frame': frame_base64})

        # Synchronize with the reference video's FPS
        delay = int(1000 / fps)  # Delay in milliseconds
        if cv2.waitKey(delay) & 0xFF == ord('q'):
            break

    cap_webcam.release()
    cap_video.release()
    cv2.destroyAllWindows()

    comparison_running = False
    final_average_score = total_score / total_frames if total_frames > 0 else 0  # Average over all frames
    duration_minutes = float((time.time() - start_time) / 60)

    # Calculate metrics with activity level
    calories_burned, steps_per_minute, energy_expenditure, movement_efficiency, performance_score = calculate_metrics(
        weight_kg, duration_minutes, steps_taken, final_average_score, active_frames, total_frames
    )

    # Only update weight if calories were burned
    if calories_burned > 0:
        weight_loss_kg = calories_burned / 7700
        new_weight = weight_kg - weight_loss_kg
        user_model.update_user(user_id, {"weight": new_weight})

    result = Result(db)
    result.create_result(
        video_id=video_id,
        user_id=user_id,
        accuracy_score=final_average_score,
        calories_burned=calories_burned,
        exercise_duration=duration_minutes,
        steps_taken=steps_taken,
        movement_efficiency=movement_efficiency,
        performance_score=performance_score,
        motion_matching_score=final_average_score,
        user_feedback=get_feedback(final_average_score)[0],
        energy_expenditure=energy_expenditure,
        steps_per_minute=steps_per_minute
    )

    # Emit all results to the frontend
    socketio.emit('comparison_complete', {
        'final_score': final_average_score,
        'calories_burned': calories_burned,
        'steps_taken': steps_taken,
        'steps_per_minute': steps_per_minute,
        'exercise_duration': duration_minutes,
        'movement_efficiency': movement_efficiency,
        'performance_score': performance_score,
        'energy_expenditure': energy_expenditure,
        'user_feedback': get_feedback(final_average_score)[0]
    })
    print(f"Final Average Accuracy Score: {final_average_score:.2f}%")

comparison_lock = threading.Lock()

@app.route('/start_comparison', methods=['POST'])
def start_comparison():
    global comparison_running

    video_id = request.json.get("video_id")
    user_id = request.json.get("user_id")
    if not video_id or not user_id:
        return jsonify({"error": "Video ID and User ID are required"}), 400

    with comparison_lock:
        if comparison_running:
            return jsonify({"error": "Comparison already running"}), 400
        comparison_running = True

    threading.Thread(target=compare_live_pose, args=(video_id, user_id)).start()
    return jsonify({"message": "Comparison started"}), 200

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({"comparison_running": comparison_running})

app.register_blueprint(routes)
app.register_blueprint(category_routes)
app.register_blueprint(video_routes)
app.register_blueprint(feedback_routes)
app.register_blueprint(result_routes)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)