import cv2
import base64
import numpy as np
import random  # Random numbers ke liye
from ultralytics import YOLO
import config

class VehicleDetector:
    def __init__(self):
        print(f"Loading YOLO model from: {config.MODEL_PATH}...")
        try:
            self.model = YOLO(config.MODEL_PATH)
        except Exception as e:
            print(f"Error loading model: {e}")
            # Agar model fail ho, tab bhi crash mat hone do
            self.model = None

        # Camera Try karo
        self.cap = cv2.VideoCapture(config.VIDEO_SOURCE)
        self.use_camera = self.cap.isOpened()
        
        if not self.use_camera:
            print("⚠️ WARNING: No Camera Found! Switching to Simulation Mode.")
        else:
            # Camera settings optimize karo
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
            
        self.fake_analytics = {
            'car': 0, 'bike': 0, 'bus': 0, 'truck': 0
        }

    def analyze_frames(self):
        frame = None
        
        # 1. Try Reading Camera
        if self.use_camera:
            ret, frame = self.cap.read()
            if not ret:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # Restart video loop
                ret, frame = self.cap.read()
                if not ret:
                    self.use_camera = False # Camera fail, switch to simulation
        
        # 2. Simulation Frame (Agar Camera na ho)
        if not self.use_camera or frame is None:
            # Ek kaali screen (Black Image) banao
            frame = np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8)
            # Uspar text likh do "SIMULATION MODE"
            cv2.putText(frame, "SIMULATION MODE", (50, 200), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(frame, "(No Camera Detected)", (50, 250), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)

        # 3. Process Frame
        frame = cv2.resize(frame, (config.FRAME_WIDTH, config.FRAME_HEIGHT))
        
        counts = {'north': 0, 'east': 0, 'south': 0, 'west': 0}

        # --- AI DETECTION ---
        if self.use_camera and self.model:
            # Agar Camera hai toh Model use karo
            results = self.model(frame, classes=[2, 3, 5, 7], verbose=False, conf=0.4)
            for zone_name, coords in config.ZONES.items():
                x1, y1, x2, y2 = coords
                # Draw Zone
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Count Vehicles
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        bx1, by1, bx2, by2 = box.xyxy[0].cpu().numpy()
                        cx, cy = int((bx1+bx2)/2), int((by1+by2)/2)
                        if x1 < cx < x2 and y1 < cy < y2:
                            counts[zone_name] += 1
                            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
        else:
            # --- SIMULATION LOGIC ---
            # Random traffic generate karo testing ke liye
            counts['north'] = random.randint(0, 5)
            counts['east'] = random.randint(0, 5)
            counts['south'] = random.randint(0, 5)
            counts['west'] = random.randint(0, 5)
            
            # Analytics ke liye bhi random fake data
            self.fake_analytics['car'] += random.randint(0, 1)
            self.fake_analytics['bike'] += random.randint(0, 1)

        # --- PREPARE OUTPUT ---
        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64 = base64.b64encode(buffer).decode('utf-8')

        feeds = {
            'north': frame_b64,
            'east': frame_b64,
            'south': frame_b64,
            'west': frame_b64
        }
        
        # Real analytics ya Fake analytics
        final_analytics = self.fake_analytics if not self.use_camera else {
            'car': sum(counts.values()), 'bike': 0, 'bus': 0, 'truck': 0
        }

        return {
            "feeds": feeds,
            "counts": counts,
            "analytics": final_analytics,
            "env": {"is_night": False, "weather_mode": "CLEAR"}
        }

    def __del__(self):
        if self.cap.isOpened():
            self.cap.release()