import os

# --- PATH SETTINGS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "yolov8n.pt")  # Make sure model yahan ho

# --- CAMERA SETTINGS ---
# Agar webcam use kar rahe hain toh 0, video file hai toh path dein
VIDEO_SOURCE = 0  
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
FPS_LIMIT = 5  # CPU bachane ke liye hum sirf 5 frames/sec process karenge

# --- TRAFFIC ZONES (Coordinates) ---
# Yeh screen par wo box hain jahan gaadiyan count hongi.
# [x1, y1, x2, y2]
ZONES = {
    'north': [100, 50, 300, 250],
    'east':  [350, 50, 550, 250],
    'south': [100, 300, 300, 500],
    'west':  [350, 300, 550, 500]
}

# --- SIGNAL TIMINGS (Seconds) ---
DEFAULT_GREEN_TIME = 30
MIN_GREEN_TIME = 5
YELLOW_TIME = 3
EMERGENCY_TIME = 60

# --- THRESHOLDS ---
# Kitni gaadiyan hone par 'Heavy Traffic' mana jayega
HEAVY_TRAFFIC_THRESHOLD = 10
MAX_WAIT_TIME = 60  # Seconds