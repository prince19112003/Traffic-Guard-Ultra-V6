import time
import config

class TrafficController:
    def __init__(self):
        self.active_lane = 'north' 
        self.state = 'GREEN'
        self.mode = 'AUTO'  # Modes: AUTO, MANUAL, EMERGENCY
        self.timer = config.DEFAULT_GREEN_TIME
        self.last_update_time = time.time()
        
        self.signals = {
            'north': 'GREEN', 'east': 'RED', 'south': 'RED', 'west': 'RED'
        }

    def update(self, counts):
        current_time = time.time()
        dt = current_time - self.last_update_time
        self.last_update_time = current_time
        
        # Sirf AUTO mode mein timer chalega
        if self.mode == 'AUTO':
            self.timer -= dt
            if self.timer <= 0:
                self.switch_state(counts)
        
        return {
            "active_dir": self.active_lane,
            "state": self.state,
            "timer": max(0, int(self.timer)),
            "signal_map": self.signals,
            "mode": self.mode
        }

    def switch_state(self, counts):
        if self.state == 'GREEN':
            self.state = 'YELLOW'
            self.timer = config.YELLOW_TIME
            self.signals[self.active_lane] = 'YELLOW'

        elif self.state == 'YELLOW':
            self.state = 'RED'
            self.signals[self.active_lane] = 'RED'
            
            # Next Best Lane
            next_lane = self.get_busiest_lane(counts, exclude=self.active_lane)
            self.active_lane = next_lane
            self.state = 'GREEN'
            
            # Dynamic Time
            vehicle_count = counts[next_lane]
            calc_time = max(config.MIN_GREEN_TIME, vehicle_count * 2) 
            self.timer = min(calc_time, 60)
            self.signals[self.active_lane] = 'GREEN'

    def get_busiest_lane(self, counts, exclude):
        temp_counts = counts.copy()
        if exclude in temp_counts: del temp_counts[exclude]
        return max(temp_counts, key=temp_counts.get)

    # --- NEW: BUTTON COMMAND HANDLER ---
    def handle_command(self, cmd_data):
        cmd_type = cmd_data.get('type')
        
        if cmd_type == 'AUTO':
            self.mode = 'AUTO'
            self.state = 'GREEN' # Reset logic
            
        elif cmd_type == 'MANUAL':
            self.mode = 'MANUAL'
            target_lane = cmd_data.get('lane')
            
            # Sabko Red karo fir Target ko Green
            for lane in self.signals: self.signals[lane] = 'RED'
            self.active_lane = target_lane
            self.signals[target_lane] = 'GREEN'
            self.state = 'GREEN'
            self.timer = 999  # Infinite time
            
        elif cmd_type == 'EMERGENCY':
            self.mode = 'EMERGENCY'
            for lane in self.signals: self.signals[lane] = 'RED'
            self.state = 'EMERGENCY'
            self.timer = 0