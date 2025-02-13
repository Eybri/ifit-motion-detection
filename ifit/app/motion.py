import cv2
import mediapipe as mp
import numpy as np

# Initialize MediaPipe Pose model
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Function to extract frames from video
def extract_frames(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)

    cap.release()
    return frames

# Function to get pose landmarks for each frame
def get_pose_landmarks(frame):
    # Convert frame to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)

    # Check if landmarks are detected
    if results.pose_landmarks:
        return [(landmark.x, landmark.y, landmark.z) for landmark in results.pose_landmarks.landmark]
    else:
        return None

# Function to compare poses between two frames
def compare_poses(reference_landmarks, imitation_landmarks):
    differences = 0

    # Compare each pair of corresponding landmarks
    for ref, imitation in zip(reference_landmarks, imitation_landmarks):
        diff = np.linalg.norm(np.array(ref) - np.array(imitation))  # Euclidean distance
        if diff > 0.1:  # Threshold for considering a significant difference
            differences += 1

    return differences

# Function to calculate accuracy of the imitation video compared to the reference video
def calculate_accuracy(reference_frames, imitation_frames):
    total_landmarks = 0
    total_differences = 0

    # Loop through each frame and compare poses
    for ref_frame, imitation_frame in zip(reference_frames, imitation_frames):
        ref_landmarks = get_pose_landmarks(ref_frame)
        imitation_landmarks = get_pose_landmarks(imitation_frame)

        if ref_landmarks and imitation_landmarks:
            differences = compare_poses(ref_landmarks, imitation_landmarks)
            total_differences += differences
            total_landmarks += len(ref_landmarks)

    accuracy = (1 - (total_differences / total_landmarks)) * 100
    return accuracy

# Main function to process the videos and calculate accuracy
def process_and_compare_videos(reference_video_path, imitation_video_path):
    # Extract frames from both reference and imitation videos
    reference_frames = extract_frames(reference_video_path)
    imitation_frames = extract_frames(imitation_video_path)
    
    # Ensure both videos have the same number of frames (or compare frame by frame as available)
    min_frames = min(len(reference_frames), len(imitation_frames))

    reference_frames = reference_frames[:min_frames]
    imitation_frames = imitation_frames[:min_frames]

    # Calculate the accuracy of the imitation video compared to the reference
    accuracy = calculate_accuracy(reference_frames, imitation_frames)
    
    print(f"Pose comparison accuracy: {accuracy:.2f}%")
    return accuracy


# Example usage
reference_video_path = 'C:/Users/Bryan Batan/videoprocessing/media/videos/try.mp4'
imitation_video_path = 'C:/Users/Bryan Batan/videoprocessing/media/videos/09d6a97e-6c56-4ad5-b637-126eebd8661a.mp4'

accuracy = process_and_compare_videos(reference_video_path, imitation_video_path)