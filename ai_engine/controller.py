import time
import config

class TrafficController:
    def __init__(self):
        self.active_lane = 'north' 
        self.state = 'GREEN'
        self.mode = 'AUTO'
        self.eco_mode = False 
        self.timer = config.DEFAULT_GREEN_TIME
        self.last_update_time = time.time()
        
        self.signals = {
            'north': 'GREEN', 'east': 'RED', 'south': 'RED', 'west': 'RED'
        }
        self.next_lane_suggestion = None

    def update(self, counts):
        current_time = time.time()
        dt = current_time - self.last_update_time
        self.last_update_time = current_time
        
        if self.mode == 'AUTO':
            self.timer -= dt
            
            # 5-sec Lookahead logic
            if 0 < self.timer <= 5 and self.next_lane_suggestion is None:
                self.next_lane_suggestion = self.get_next_smart_lane(counts)

            if self.timer <= 0:
                self.switch_state(counts)
        
        return {
            "active_dir": self.active_lane,
            "state": self.state,
            "timer": max(0, int(self.timer)),
            "signal_map": self.signals,
            "mode": self.mode,
            "eco_mode": self.eco_mode
        }

    def get_next_smart_lane(self, counts):
        # Round-robin check starting from next lane
        directions = ['north', 'east', 'south', 'west']
        current_idx = directions.index(self.active_lane)
        
        for i in range(1, 5):
            check_lane = directions[(current_idx + i) % 4]
            count = counts.get(check_lane, 0)
            
            # Logic: Skip empty lanes
            if count > 0:
                return check_lane
        
        return 'north'

    def switch_state(self, counts):
        if self.state == 'GREEN':
            self.state = 'YELLOW'
            self.timer = config.YELLOW_TIME
            self.signals[self.active_lane] = 'YELLOW'

        elif self.state == 'YELLOW':
            self.state = 'RED'
            self.signals[self.active_lane] = 'RED'
            
            # Select Next Lane
            next_lane = self.next_lane_suggestion if self.next_lane_suggestion else self.get_next_smart_lane(counts)
            self.next_lane_suggestion = None
            
            self.active_lane = next_lane
            self.state = 'GREEN'
            
            # --- TIMER LOGIC ---
            vehicle_count = counts.get(next_lane, 0)
            
            if vehicle_count < 3:
                # Burst Mode
                calc_time = 5 
            else:
                # Normal Mode
                calc_time = max(config.MIN_GREEN_TIME, vehicle_count * 2)

            self.timer = min(calc_time, 90)
            self.signals[self.active_lane] = 'GREEN'

    def handle_command(self, cmd_data):
        cmd = cmd_data if isinstance(cmd_data, str) else cmd_data.get('cmd')
        
        if cmd == 'ECO_TOGGLE':
            self.eco_mode = not self.eco_mode
            
        elif cmd == 'AUTO':
            self.mode = 'AUTO'
            self.state = 'YELLOW' 
            self.timer = 0 
            
        elif cmd == 'MANUAL':
            self.mode = 'MANUAL'
            self.timer = 999
            
        elif cmd == 'EMERGENCY':
            self.mode = 'EMERGENCY'
            for lane in self.signals: self.signals[lane] = 'RED'
            self.state = 'EMERGENCY'
            self.timer = 0
            
        elif cmd in ['north', 'east', 'south', 'west']:
            self.mode = 'MANUAL'
            for lane in self.signals: self.signals[lane] = 'RED'
            self.active_lane = cmd
            self.signals[cmd] = 'GREEN'
            self.state = 'GREEN'
            self.timer = 999