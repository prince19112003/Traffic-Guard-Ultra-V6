import json
import time
import sys
import threading
from detector import VehicleDetector
from controller import TrafficController
import config

def listen_for_commands(controller, detector):
    while True:
        try:
            line = sys.stdin.readline()
            if not line: break
            
            data = json.loads(line.strip())
            cmd = data.get('cmd')
            
            if cmd:
                if cmd == 'TOGGLE_SIMULATION':
                    # Toggle logic: Check current state in detector or just cycle
                    if detector.mode == 'CAMERA':
                        detector.switch_source('SIMULATION', 0) # Default sim video
                    else:
                        detector.switch_source('CAMERA')
                
                # Logic Commands
                else:
                    controller.handle_command(cmd)
        except Exception:
            pass

def main():
    detector = VehicleDetector()
    controller = TrafficController()
    
    cmd_thread = threading.Thread(target=listen_for_commands, args=(controller, detector), daemon=True)
    cmd_thread.start()

    while True:
        try:
            start_time = time.time()
            
            # A. Detect
            data = detector.analyze_frames()
            
            # B. Logic
            traffic_state = controller.update(data['counts'])
            
            # --- ECO MODE: CPU SAVER ---
            # Total vehicles count karo
            total_vehicles = sum(data['counts'].values())
            is_idle = total_vehicles < 10
            
            # Agar Eco Mode ON hai aur Traffic kam hai
            sleep_time = 0
            if traffic_state['eco_mode'] and is_idle:
                 # Low Power Mode: Process at 2 FPS instead of 30 FPS
                 sleep_time = 0.5 
            else:
                 # Normal High Performance Mode
                 process_time = time.time() - start_time
                 sleep_time = max(0, (1.0/config.FPS_LIMIT) - process_time)
            
            # C. Send Data
            payload = {
                "feeds": data['feeds'],
                "counts": data['counts'],
                "logic": traffic_state,
                "analytics": data['analytics'],
                "env": data['env']
            }
            print(json.dumps(payload))
            sys.stdout.flush()

            time.sleep(sleep_time)

        except KeyboardInterrupt:
            break
        except Exception:
            time.sleep(1)

if __name__ == "__main__":
    main()