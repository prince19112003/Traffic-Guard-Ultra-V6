import json
import time
import sys
import threading
from detector import VehicleDetector
from controller import TrafficController
import config

# --- COMMAND LISTENER THREAD ---
def listen_for_commands(controller):
    """ Node.js se commands padhne ke liye alag thread """
    while True:
        try:
            line = sys.stdin.readline()
            if not line: break
            
            # Command Parse karo
            data = json.loads(line.strip())
            if 'cmd' in data:
                controller.handle_command(data['cmd'])
        except:
            pass

def main():
    # Setup
    detector = VehicleDetector()
    controller = TrafficController()
    
    # 1. Listener Start karo (Background mein)
    cmd_thread = threading.Thread(target=listen_for_commands, args=(controller,), daemon=True)
    cmd_thread.start()

    # 2. Main Loop
    while True:
        try:
            start_time = time.time()
            
            # A. Detect
            data = detector.analyze_frames()
            
            # B. Logic
            traffic_state = controller.update(data['counts'])
            
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

            # D. FPS Control
            process_time = time.time() - start_time
            time.sleep(max(0, (1.0/config.FPS_LIMIT) - process_time))

        except KeyboardInterrupt:
            break
        except Exception:
            time.sleep(1)

if __name__ == "__main__":
    main()