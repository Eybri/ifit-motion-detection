# import cv2
# import numpy as np
# from flask_socketio import emit
# from bson.objectid import ObjectId
# import cloudinary

# class PoseComparison:
#     def __init__(self, db):
#         self.motion_collection = db["motion_data"] 
#         self.video_collection = db["videos"]
    
#     def get_reference_data(self, video_id):
#         """Fetch reference keypoints and video from MongoDB & Cloudinary."""
#         motion_data = self.motion_collection.find_one({"video_id": ObjectId(video_id)}, {"_id": 0, "frames": 1})
#         video_data = self.video_collection.find_one({"_id": ObjectId(video_id)}, {"_id": 0, "video_url": 1})
        
#         if not motion_data or not video_data:
#             return None, None

#         return motion_data["frames"], video_data["video_url"]

#     def compare_live_pose(self, video_id):
#         """Fetch reference data & compare it with live poses from WebSocket."""
#         reference_frames, video_url = self.get_reference_data(video_id)
#         if not reference_frames or not video_url:
#             return "Reference data not found"

#         # Load reference video from Cloudinary
#         cap_video = cv2.VideoCapture(video_url)

#         frame_index = 0

#         while cap_video.isOpened():
#             ret_video, frame_video = cap_video.read()
#             if not ret_video:
#                 break  # Stop if video feed ends

#             # Wait for live pose data from WebSocket
#             live_pose = self.get_live_pose_from_socket()  
#             if live_pose is None:
#                 continue

#             # Compare poses and calculate similarity
#             reference_pose = reference_frames[frame_index]["keypoints"] if frame_index < len(reference_frames) else []
#             accuracy_score = self.calculate_similarity(reference_pose, live_pose)

#             # Send score to frontend via WebSocket
#             emit("accuracy_score", {"score": accuracy_score}, broadcast=True)

#             frame_index += 1

#         cap_video.release()

#     def get_live_pose_from_socket(self):
#         """Receive live pose data from WebSocket (to be implemented)."""
#         return None  # Replace with WebSocket listener

#     def calculate_similarity(self, reference_pose, live_pose):
#         """Calculate similarity between reference and live pose."""
#         if len(reference_pose) != len(live_pose):
#             return 0

#         total_score = 0
#         num_keypoints = len(reference_pose)

#         for ref, live in zip(reference_pose, live_pose):
#             ref_coords = np.array([ref['x'], ref['y']])
#             live_coords = np.array([live['x'], live['y']])
#             distance = np.linalg.norm(ref_coords - live_coords)

#             score = max(0, 1 - distance)
#             total_score += score

#         return (total_score / num_keypoints) * 100
