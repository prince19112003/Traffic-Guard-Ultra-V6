import cv2
import base64
import numpy as np
import random
import os
from ultralytics import YOLO
import config

class VehicleDetector:
    def __init__(self):
        print(f"Loading YOLO model from: {config.MODEL_PATH}...")
        try:
            self.model = YOLO(config.MODEL_PATH)
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None

        # State
        self.mode = 'CAMERA' # 'CAMERA' or 'SIMULATION'
        self.sim_video_index = 0
        self.cap = None
        
        # Initialize Default Source
        self.switch_source('CAMERA')
            
        self.fake_analytics = { 'car': 0, 'bike': 0, 'bus': 0, 'truck': 0 }

    def switch_source(self, mode, index=0):
        self.mode = mode
        
        if self.cap is not None:
            self.cap.release()
            
        if mode == 'CAMERA':
            self.cap = cv2.VideoCapture(config.VIDEO_SOURCE)
            if not self.cap.isOpened():
                print("⚠️ Camera Failed. Switching to Simulation default.")
                self.switch_source('SIMULATION', 0)
            else:
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
                print("📷 Camera Mode Active")
                
        elif mode == 'SIMULATION':
            self.sim_video_index = index
            if index < len(config.SIM_VIDEOS):
                video_path = config.SIM_VIDEOS[index]
                if os.path.exists(video_path):
                    self.cap = cv2.VideoCapture(video_path)
                    print(f"🎬 Playing Simulation Video: {video_path}")
                else:
                    print(f"❌ Video not found: {video_path}. Using synthetic black screen.")
                    self.cap = None 
            else:
                self.cap = None

    def analyze_frames(self):
        frame = None
        
        # 1. Read Frame
        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                # Loop video
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
            
            if not ret and self.mode == 'CAMERA':
                # Camera disconnected
                self.switch_source('SIMULATION', 0)
                frame = None

        # 2. Fallback Frame
        if frame is None:
            frame = np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8)
            msg = f"SIMULATION {self.sim_video_index + 1}" if self.mode == 'SIMULATION' else "NO SOURCE"
            cv2.putText(frame, msg, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        # Resize
        frame = cv2.resize(frame, (config.FRAME_WIDTH, config.FRAME_HEIGHT))
        
        # CLEAN FRAME: We use this for display (No boxes drawn)
        display_frame = frame.copy()
        
        counts = {'north': 0, 'east': 0, 'south': 0, 'west': 0}

        # 3. AI Processing
        if self.model:
            results = self.model(frame, classes=[2, 3, 5, 7], verbose=False, conf=0.4)
            
            for zone_name, coords in config.ZONES.items():
                x1, y1, x2, y2 = coords
                # Note: We do NOT draw cv2.rectangle here to keep UI clean
                
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        bx1, by1, bx2, by2 = box.xyxy[0].cpu().numpy()
                        cx, cy = int((bx1+bx2)/2), int((by1+by2)/2)
                        
                        # Logic Counting
                        if x1 < cx < x2 and y1 < cy < y2:
                            counts[zone_name] += 1
        else:
            # Fallback random counts
            counts = {k: random.randint(0, 5) for k in counts}

        # 4. Encode
        _, buffer = cv2.imencode('.jpg', display_frame)
        frame_b64 = base64.b64encode(buffer).decode('utf-8')

        # In a real 4-camera setup, you'd capture 4 different frames.
        # Here we map the single source to all 4 feeds for the system.
        feeds = {
            'north': frame_b64, 'east': frame_b64, 'south': frame_b64, 'west': frame_b64
        }
        
        return {
            "feeds": feeds,
            "counts": counts,
            "analytics": self.fake_analytics, 
            "env": {"is_night": False, "weather_mode": "CLEAR"}
        }