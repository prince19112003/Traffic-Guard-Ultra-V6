import cv2

# --- SYSTEM CONFIG ---
FPS_LIMIT = 30
MODEL_PATH = "models/yolov8n.pt"

# --- CAMERA ---
# 0 for Webcam, or path to video file. 
# In a real 4-camera setup, you would have [0, 1, 2, 3]
VIDEO_SOURCE = 0 
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# --- SIMULATION VIDEOS (Fallback) ---
# Create an 'assets' folder and put these videos there
SIM_VIDEOS = [
    "assets/traffic_day.mp4", 
    "assets/traffic_night.mp4", 
    "assets/traffic_rain.mp4"
]

# --- TRAFFIC LOGIC ---
DEFAULT_GREEN_TIME = 20
MIN_GREEN_TIME = 5 # Burst mode time
YELLOW_TIME = 3

# --- DETECTION ZONES (x1, y1, x2, y2) ---
# These zones map to the 4 directions on the single feed (for demo/sim)
ZONES = {
    'north': [100, 100, 300, 300],
    'east':  [340, 100, 540, 300],
    'south': [100, 340, 300, 540],
    'west':  [340, 340, 540, 540]
}